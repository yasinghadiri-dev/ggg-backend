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

describe('Cancel Pairing', () => {
  test('authenticated parent can cancel a pairing', async () => {
    // create parent user
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({ email: 'cancel@example.com', password: 'pass1234', name: 'CancelParent' });
    const token = registerRes.body.data.token;

    // create a pairing (pending)
    const reqRes = await request(app)
      .post('/api/pairing/request')
      .send({ deviceInfo: { model: 'CancelModel' }, name: 'ToCancel' });

    expect(reqRes.statusCode).toBe(200);
    const pairingCode = reqRes.body.data.pairingCode;

    // find the pairing id from DB via models
    const { models } = require('../src/config/database');
    const pairing = await models.Pairing.findOne({ where: { pairing_code: pairingCode } });
    expect(pairing).toBeDefined();

    // cancel as authenticated user
    const cancelRes = await request(app)
      .delete(`/api/pairing/${pairing.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(cancelRes.statusCode).toBe(200);
    expect(cancelRes.body.success).toBe(true);

    await pairing.reload();
    expect(pairing.status).toBe('cancelled');
  }, 20000);
});
