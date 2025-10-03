const { runMigrations } = require('../scripts/runTestMigrations');
process.env.DB_DIALECT = 'sqlite';
const dbFile = runMigrations();
process.env.DB_STORAGE = dbFile;
const request = require('supertest');
const { app } = require('../server');
const { sequelize } = require('../src/config/database');

beforeAll(async () => {
  await sequelize.authenticate();
});

afterAll(async () => {
  await sequelize.close();
});

describe('Auth', () => {
  test('register and login', async () => {
    const email = 'testuser@example.com';
    const password = 'password123';

    const resReg = await request(app)
      .post('/api/auth/register')
      .send({ email, password, name: 'Test User' })
      .set('Accept', 'application/json');

    expect(resReg.statusCode).toBe(200);
    expect(resReg.body.success).toBe(true);
    expect(resReg.body.data.token).toBeDefined();

    const resLogin = await request(app)
      .post('/api/auth/login')
      .send({ email, password })
      .set('Accept', 'application/json');

    expect(resLogin.statusCode).toBe(200);
    expect(resLogin.body.success).toBe(true);
    expect(resLogin.body.data.token).toBeDefined();
  }, 20000);
});
