const request = require('supertest');

const app = require('../../src/app');

describe('404 middleware check', () => {
  test('should return HTTP 404 response', async () => {
    const res = await request(app).get('/not-found');
    expect(res.statusCode).toBe(404);
  });

  test('should return status: error in response', async () => {
    const res = await request(app).get('/not-found');
    expect(res.body.status).toEqual('error');
  });

  test('should return error object with 404 code and "not found" message in response', async () => {
    const res = await request(app).get('/not-found');
    expect(res.body.error).toEqual({
      message: 'not found',
      code: 404,
    });
  });
});
