const request = require('supertest');

const app = require('../../src/app');

describe('DELETE /v1/fragments', () => {
  test('unauthenticated requests are denied', () =>
    request(app).delete('/v1/fragments/valid_id').expect(401));

  test('incorrect credentials are denied', () =>
    request(app)
      .delete('/v1/fragments/valid_id')
      .auth('invalid@email.com', 'incorrect_password')
      .expect(401));

  test('incorrect id returns 404 error', async () => {
    await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain; charset=utf-8')
      .send('This is a fragment');

    const res = await request(app)
      .delete(`/v1/fragments/incorrect_id`)
      .auth('user1@email.com', 'password1');

    expect(res.statusCode).toBe(404);
    expect(res.body.status).toEqual('error');
  });

  test('authenticated users can delete an existing fragment', async () => {
    const {
      body: {
        fragment: { id },
      },
    } = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain; charset=utf-8')
      .send('This is a fragment');

    const res = await request(app)
      .delete(`/v1/fragments/${id}`)
      .auth('user1@email.com', 'password1');

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toEqual('ok');
    await request(app).get(`/v1/fragments/${id}`).auth('user1@email.com', 'password1').expect(404);
  });
});
