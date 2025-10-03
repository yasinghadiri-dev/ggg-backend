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

describe('Pairing flow', () => {
  test('request pairing and confirm with auth', async () => {
    // create user
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({ email: 'p@example.com', password: 'pass1234', name: 'Parent' });
    const token = registerRes.body.data.token;

    const reqRes = await request(app)
      .post('/api/pairing/request')
      .send({ deviceInfo: { model: 'X' }, name: 'Kid' });

    expect(reqRes.statusCode).toBe(200);
    expect(reqRes.body.success).toBe(true);
    const pairingCode = reqRes.body.data.pairingCode;

    const confirmRes = await request(app)
      .post('/api/pairing/confirm')
      .set('Authorization', `Bearer ${token}`)
      .send({ pairingCode, deviceId: 'dev-1', consentData: { childName: 'Kid' } });

    expect(confirmRes.statusCode).toBe(200);
    expect(confirmRes.body.success).toBe(true);
  }, 20000);
});
