const request = require('supertest');
const mime = require('mime-types');

const app = require('../../src/app');

describe('GET /v1/fragments', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () => request(app).get('/v1/fragments').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app).get('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

  // Using a valid username/password pair should give a success result with a .fragments array
  test('authenticated users get a fragments array', async () => {
    const res = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
  });

  // TODO: we'll need to add tests to check the contents of the fragments array later
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
      .get(`/v1/fragments/${res.body.fragment.id}.docx`)
      .auth('user1@email.com', 'password1')
      .expect(415);
  });

  test('failure to convert fragment into requested type returns 415 error', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('This is a fragment');

    await request(app)
      .get(`/v1/fragments/${res.body.fragment.id}.png`)
      .auth('user1@email.com', 'password1')
      .expect(415);
  });

  test(`authenticated users get the raw fragment's data`, async () => {
    const data = 'This is a fragment';

    const {
      body: {
        fragment: { id, type },
      },
    } = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send(data);

    const res = await request(app).get(`/v1/fragments/${id}`).auth('user1@email.com', 'password1');

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type'].startsWith(type)).toEqual(true);
    expect(res.text).toEqual(data);
  });

  test(`valid extension returns the corresponding Content-Type and raw fragment's data`, async () => {
    const data = 'This is a fragment';
    const ext = '.txt';

    const {
      body: {
        fragment: { id },
      },
    } = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send(data);

    const res = await request(app)
      .get(`/v1/fragments/${id}${ext}`)
      .auth('user1@email.com', 'password1');

    expect(res.headers['content-type'].startsWith(mime.lookup(ext))).toEqual(true);
    expect(res.statusCode).toBe(200);
    expect(res.text).toEqual(data);
  });
});
