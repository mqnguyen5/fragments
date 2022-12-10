const request = require('supertest');

const app = require('../../src/app');
const hash = require('../../src/hash');

describe('PUT /v1/fragments', () => {
  test('unauthenticated requests are denied', () =>
    request(app).put('/v1/fragments/valid_id').expect(401));

  test('incorrect credentials are denied', () =>
    request(app)
      .post('/v1/fragments/valid_id')
      .auth('invalid@email.com', 'incorrect_password')
      .expect(401));

  test('authenticated users can update a plain text fragment', async () => {
    const {
      body: {
        fragment: { id },
      },
    } = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('This is a fragment');

    await request(app)
      .put(`/v1/fragments/${id}`)
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('Hello world!')
      .expect(200)
      .expect((res) => {
        res.body.status === 'ok';
      });
  });

  test('authenticated users can update a Markdown fragment', async () => {
    const {
      body: {
        fragment: { id },
      },
    } = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/markdown')
      .send('# This is a fragment');

    await request(app)
      .put(`/v1/fragments/${id}`)
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/markdown')
      .send('# Hello world!')
      .expect(200)
      .expect((res) => {
        res.body.status === 'ok';
      });
  });

  test('authenticated users can update an HTML fragment', async () => {
    const {
      body: {
        fragment: { id },
      },
    } = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/html')
      .send('<h1>This is a fragment</h1>');

    await request(app)
      .put(`/v1/fragments/${id}`)
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/html')
      .send('<h1>Hello world!</h1>')
      .expect(200)
      .expect((res) => {
        res.body.status === 'ok';
      });
  });

  test('authenticated users can update a JSON fragment', async () => {
    const {
      body: {
        fragment: { id },
      },
    } = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'application/json')
      .send({ message: 'Hello world!' });

    await request(app)
      .put(`/v1/fragments/${id}`)
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'application/json')
      .send({ title: 'Hi', items: [1, 2, 3], message: 'This is a fragments' })
      .expect(200)
      .expect((res) => {
        res.body.status === 'ok';
      });
  });

  test(`response fragment's metadata includes id, ownerId, created, updated, type, and size`, async () => {
    const {
      body: {
        fragment: { id },
      },
    } = await request(app)
      .post('/v1/fragments')
      .auth('user2@email.com', 'password2')
      .set('Content-Type', 'text/plain')
      .send('This is a fragment');

    const res = await request(app)
      .put(`/v1/fragments/${id}`)
      .auth('user2@email.com', 'password2')
      .set('Content-Type', 'text/plain')
      .send('Hello world!');

    console.log(res.body);

    expect(res.body.fragment).toEqual(
      expect.objectContaining({
        id: expect.stringMatching(
          /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
        ),
        ownerId: hash('user2@email.com'),
        created: expect.stringMatching(/^(\d{4}|\d{6})-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$$/),
        updated: expect.stringMatching(/^(\d{4}|\d{6})-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
        type: 'text/plain',
        size: expect.any(Number),
        formats: expect.arrayContaining(['text/plain']),
      })
    );
  });

  test('updated a fragment using a different type is denied', async () => {
    const {
      body: {
        fragment: { id },
      },
    } = await request(app)
      .post('/v1/fragments')
      .auth('user2@email.com', 'password2')
      .set('Content-Type', 'text/plain')
      .send('Hello S3');

    const res = await request(app)
      .put(`/v1/fragments/${id}`)
      .auth('user2@email.com', 'password2')
      .set('Content-Type', 'text/html')
      .send('DynamoDB is cool!');

    expect(res.status).toEqual(400);
    expect(res.body).toEqual(
      expect.objectContaining({
        status: 'error',
        error: expect.objectContaining({ code: 400 }),
      })
    );
  });
});
