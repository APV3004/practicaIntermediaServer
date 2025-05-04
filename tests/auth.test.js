const request = require('supertest');
const app = require('../index'); 

describe('Auth Endpoints', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/user/register')
      .send({
        email: `test${Date.now()}@mail.com`,
        password: 'password123'
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('email');
  });
});