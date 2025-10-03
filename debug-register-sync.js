process.env.NODE_ENV = 'test';
process.env.DB_DIALECT = 'sqlite';
process.env.DB_STORAGE = ':memory:';

const { sequelize } = require('./src/config/database');
(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
    console.log('DB synced');

    const request = require('supertest');
    const { app, server } = require('./server');

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'syncdbg@example.com', password: 'pass1234', name: 'SyncDbg' })
      .set('Accept', 'application/json');

    console.log('STATUS', res.status);
    console.log('BODY', JSON.stringify(res.body, null, 2));

    server.close();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
