const request = require('supertest');
const { app, server } = require('./server');

(async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ email: 'dbg@example.com', password: 'pass1234', name: 'DBG' })
    .set('Accept', 'application/json');

  console.log('STATUS', res.status);
  console.log('BODY', JSON.stringify(res.body, null, 2));
  server.close();
})();
