process.env.NODE_ENV = 'test';
process.env.DB_DIALECT = 'sqlite';
process.env.DB_STORAGE = ':memory:';
const request = require('supertest');
const { app, server } = require('./server');

(async () => {
  try {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'dbg2@example.com', password: 'pass1234', name: 'DBG2' })
      .set('Accept', 'application/json');

    console.log('STATUS', res.status);
    console.log('BODY', JSON.stringify(res.body, null, 2));
  } catch (err) {
    console.error('EX', err);
  } finally {
    server.close();
  }
})();
