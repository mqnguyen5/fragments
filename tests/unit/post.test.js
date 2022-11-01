const request = require('supertest');

const app = require('../../src/app');
const hash = require('../../src/hash');

describe('POST /v1/fragments', () => {
  test('unauthenticated requests are denied', () => request(app).post('/v1/fragments').expect(401));

  test('incorrect credentials are denied', () =>
    request(app).post('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

  test('authenticated users can create a plain text fragment', () =>
    request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('This is a fragment')
      .expect(201)
      .expect((res) => {
        res.body.status === 'ok';
      }));

  test('authenticated users can create a Markdown fragment', () =>
    request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/markdown')
      .send('# This is a fragment')
      .expect(201)
      .expect((res) => {
        res.body.status === 'ok';
      }));

  test('authenticated users can create an HTML fragment', () =>
    request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/html')
      .send('<h1>This is a fragment</h1>')
      .expect(201)
      .expect((res) => {
        res.body.status === 'ok';
      }));

  test('authenticated users can create a JSON fragment', () =>
    request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'application/json')
      .send({ title: 'Hi', items: [1, 2, 3], message: 'This is a fragments' })
      .expect(201)
      .expect((res) => {
        res.body.status === 'ok';
      }));

  test(`response fragment's metadata includes id, ownerId, created, updated, type, and size`, async () => {
    const contentType = 'text/plain';
    const data = 'This is a fragment';

    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', contentType)
      .send(data);

    expect(res.body.fragment).toEqual(
      expect.objectContaining({
        id: expect.stringMatching(
          /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
        ),
        ownerId: hash('user1@email.com'),
        created: expect.stringMatching(/^(\d{4}|\d{6})-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$$/),
        updated: expect.stringMatching(/^(\d{4}|\d{6})-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
        type: contentType,
        size: Buffer.byteLength(data),
      })
    );
  });

  test('responses include a Location header with a URL to GET', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('This is a fragment');

    expect(res.headers['location']).toEqual(
      `http://localhost:8080/v1/fragments/${res.body.fragment.id}`
    );
  });

  test('creating a fragment with an unsupported type is denied', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'application/msword')
      .send('This is a fragment');

    expect(res.status).toEqual(415);
    expect(res.body).toEqual(
      expect.objectContaining({
        status: 'error',
        error: expect.objectContaining({ code: 415 }),
      })
    );
  });
});
