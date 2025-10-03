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

describe('Events', () => {
  test('upload events', async () => {
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({ email: 'e@example.com', password: 'pass1234', name: 'EventsParent' });
    const token = registerRes.body.data.token;

    // create a child record for this parent so events can reference a child_id
    const { models } = require('../src/config/database');
    const parentUser = registerRes.body.data.user;
    const child = await models.Child.create({ parent_id: parentUser.id, device_id: 'evt-dev-1', name: 'EventChild' });

    const events = [
      { childId: child.id, eventType: 'notification', payload: { title: 'Hi' } },
      { childId: child.id, eventType: 'location', payload: { lat: 35.0, lng: 51.0 } }
    ];

    const res = await request(app)
      .post('/api/events/upload')
      .set('Authorization', `Bearer ${token}`)
      .send(events)
      .set('Accept', 'application/json');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  }, 20000);
});
