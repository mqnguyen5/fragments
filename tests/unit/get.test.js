const request = require('supertest');
const mime = require('mime-types');
const contentType = require('content-type');
const md = require('markdown-it')();

const app = require('../../src/app');
const hash = require('../../src/hash');

describe('GET /v1/fragments', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () => request(app).get('/v1/fragments').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app).get('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

  test('missing `expand` query value returns 400 error', () =>
    request(app).get('/v1/fragments/?expand=').auth('user1@email.com', 'password1').expect(400));

  test('incorrect `expand` query value returns 400 error', () =>
    request(app).get('/v1/fragments/?expand=6').auth('user1@email.com', 'password1').expect(400));

  // Using a valid username/password pair should give a success result with a .fragments array
  test('authenticated users get an empty fragments array', async () => {
    const res = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
    expect(res.body.fragments.length).toEqual(0);
  });

  test('authenticated users get a fragments array containing only ids', async () => {
    await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('This is a fragment');
    await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('This is another fragment');

    const res = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
    expect(res.body.fragments).toEqual(
      expect.arrayContaining([
        expect.stringMatching(
          /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
        ),
      ])
    );
  });

  test('authenticated users get a fragments array containing metadata', async () => {
    await request(app)
      .post('/v1/fragments')
      .auth('user2@email.com', 'password2')
      .set('Content-Type', 'text/plain')
      .send('Hi');
    await request(app)
      .post('/v1/fragments')
      .auth('user2@email.com', 'password2')
      .set('Content-Type', 'text/plain')
      .send('Hello World');

    const res = await request(app)
      .get('/v1/fragments/?expand=1')
      .auth('user2@email.com', 'password2');

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
    expect(res.body.fragments).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.stringMatching(
            /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
          ),
          ownerId: hash('user2@email.com'),
          created: expect.stringMatching(/^(\d{4}|\d{6})-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$$/),
          updated: expect.stringMatching(/^(\d{4}|\d{6})-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
          type: expect.any(String),
          size: expect.any(Number),
        }),
      ])
    );
  });
});

describe('GET /v1/fragments/:id', () => {
  test('unauthenticated requests are denied', () =>
    request(app).get('/v1/fragments/valid_id').expect(401));

  test('incorrect credentials are denied', () =>
    request(app)
      .get('/v1/fragments/valid_id')
      .auth('invalid@email.com', 'incorrect_password')
      .expect(401));

  test('incorrect id returns 404 error', () =>
    request(app)
      .get('/v1/fragments/incorrect_id')
      .auth('user1@email.com', 'password1')
      .expect(404));

  test('extension represents unknown/unsupported type is denied', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('This is a fragment');

    await request(app)
      .get(`/v1/fragments/${res.body.fragment.id}.`)
      .auth('user1@email.com', 'password1')
      .expect(415);

    await request(app)
      .get(`/v1/fragments/${res.body.fragment.id}.gz`)
      .auth('user1@email.com', 'password1')
      .expect(415);
  });

  test('failure to convert fragment into requested type returns 415 error', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/html')
      .send('<h1>This is a fragment</h1>');

    await request(app)
      .get(`/v1/fragments/${res.body.fragment.id}.md`)
      .auth('user1@email.com', 'password1')
      .expect(415);

    await request(app)
      .get(`/v1/fragments/${res.body.fragment.id}.png`)
      .auth('user1@email.com', 'password1')
      .expect(415);
  });

  describe(`authenticated users get the raw fragment's data`, () => {
    test('works with plain text fragments', async () => {
      const data = 'This is a fragment';

      const {
        body: {
          fragment: { id, type },
        },
      } = await request(app)
        .post('/v1/fragments')
        .auth('user1@email.com', 'password1')
        .set('Content-Type', 'text/plain; charset=utf-8')
        .send(data);

      const res = await request(app)
        .get(`/v1/fragments/${id}`)
        .auth('user1@email.com', 'password1');

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toEqual(type);
      expect(res.text).toEqual(data);
    });

    test('works with HTML fragments', async () => {
      const data = '<h1>This is a fragment</h1>';

      const {
        body: {
          fragment: { id, type },
        },
      } = await request(app)
        .post('/v1/fragments')
        .auth('user1@email.com', 'password1')
        .set('Content-Type', 'text/html; charset=utf-8')
        .send(data);

      const res = await request(app)
        .get(`/v1/fragments/${id}`)
        .auth('user1@email.com', 'password1');

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toEqual(type);
      expect(res.text).toEqual(data);
    });

    test('works with Markdown fragments', async () => {
      const data = '# This is a fragment';

      const {
        body: {
          fragment: { id, type },
        },
      } = await request(app)
        .post('/v1/fragments')
        .auth('user1@email.com', 'password1')
        .set('Content-Type', 'text/markdown; charset=utf-8')
        .send(data);

      const res = await request(app)
        .get(`/v1/fragments/${id}`)
        .auth('user1@email.com', 'password1');

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toEqual(type);
      expect(res.text).toEqual(data);
    });

    test('works with JSON fragments', async () => {
      const data = { title: 'Hi', message: 'This is a fragment' };

      const {
        body: {
          fragment: { id, type },
        },
      } = await request(app)
        .post('/v1/fragments')
        .auth('user1@email.com', 'password1')
        .set('Content-Type', 'application/json; charset=utf-8')
        .send(data);

      const res = await request(app)
        .get(`/v1/fragments/${id}`)
        .auth('user1@email.com', 'password1');

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toEqual(type);
      expect(res.text).toEqual(JSON.stringify(data));
    });
  });

  describe(`valid extension returns the corresponding Content-Type and raw fragment's data`, () => {
    test('works when converting from JSON to text', async () => {
      const data = { title: 'Hi', message: 'This is a fragment' };
      const ext = '.txt';

      const {
        body: {
          fragment: { id },
        },
      } = await request(app)
        .post('/v1/fragments')
        .auth('user1@email.com', 'password1')
        .set('Content-Type', 'application/json')
        .send(data);

      const res = await request(app)
        .get(`/v1/fragments/${id}${ext}`)
        .auth('user1@email.com', 'password1');

      expect(contentType.parse(res.headers['content-type']).type).toEqual(mime.lookup(ext));
      expect(res.statusCode).toBe(200);
      expect(res.text).toEqual(JSON.stringify(data));
    });

    test('works when converting from Markdown to HTML', async () => {
      const data = '# This is a fragment';
      const ext = '.html';

      const {
        body: {
          fragment: { id },
        },
      } = await request(app)
        .post('/v1/fragments')
        .auth('user1@email.com', 'password1')
        .set('Content-Type', 'text/markdown')
        .send(data);

      const res = await request(app)
        .get(`/v1/fragments/${id}${ext}`)
        .auth('user1@email.com', 'password1');

      expect(contentType.parse(res.headers['content-type']).type).toEqual(mime.lookup(ext));
      expect(res.statusCode).toBe(200);
      expect(res.text).toEqual(md.render(data));
    });
  });
});

describe('GET /v1/fragments/:id/info', () => {
  test('unauthenticated requests are denied', () =>
    request(app).get('/v1/fragments/valid_id/info').expect(401));

  test('incorrect credentials are denied', () =>
    request(app)
      .get('/v1/fragments/valid_id/info')
      .auth('invalid@email.com', 'incorrect_password')
      .expect(401));

  test('incorrect id returns 404 error', () =>
    request(app)
      .get('/v1/fragments/incorrect_id/info')
      .auth('user1@email.com', 'password1')
      .expect(404));

  describe(`authenticated users get the fragment's metadata`, () => {
    test('works with any text fragment', async () => {
      const type = 'text/plain';
      const data = 'This is a fragment';

      const {
        body: {
          fragment: { id },
        },
      } = await request(app)
        .post('/v1/fragments')
        .auth('user1@email.com', 'password1')
        .set('Content-Type', type)
        .send(data);

      const res = await request(app)
        .get(`/v1/fragments/${id}/info`)
        .auth('user1@email.com', 'password1');

      expect(res.statusCode).toBe(200);
      expect(res.body.fragment).toEqual(
        expect.objectContaining({
          id: expect.stringMatching(
            /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
          ),
          ownerId: hash('user1@email.com'),
          created: expect.stringMatching(/^(\d{4}|\d{6})-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$$/),
          updated: expect.stringMatching(/^(\d{4}|\d{6})-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
          type: expect.stringContaining(type),
          size: Buffer.byteLength(data),
        })
      );
    });

    test('works with JSON fragments', async () => {
      const type = 'application/json';
      const data = { title: 'Hi', message: 'This is a fragment' };

      const {
        body: {
          fragment: { id },
        },
      } = await request(app)
        .post('/v1/fragments')
        .auth('user1@email.com', 'password1')
        .set('Content-Type', type)
        .send(data);

      const res = await request(app)
        .get(`/v1/fragments/${id}/info`)
        .auth('user1@email.com', 'password1');

      expect(res.statusCode).toBe(200);
      expect(res.body.fragment).toEqual(
        expect.objectContaining({
          id: expect.stringMatching(
            /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
          ),
          ownerId: hash('user1@email.com'),
          created: expect.stringMatching(/^(\d{4}|\d{6})-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$$/),
          updated: expect.stringMatching(/^(\d{4}|\d{6})-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
          type: expect.stringContaining(type),
          size: Buffer.byteLength(JSON.stringify(data)),
        })
      );
    });
  });
});
