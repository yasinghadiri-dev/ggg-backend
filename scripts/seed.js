require('dotenv').config();
const { sequelize, models } = require('../src/config/database');
const jwt = require('jsonwebtoken');

const runSeed = async () => {
  try {
    await sequelize.authenticate();
    console.log('DB connected');

    const email = process.env.DEV_SEED_EMAIL || 'parent@example.com';
    const password = process.env.DEV_SEED_PASS || 'password123';
    const name = process.env.DEV_SEED_NAME || 'Dev Parent';

    let user = await models.User.findByEmail(email);
    if (!user) {
      user = await models.User.create({ email, password_hash: password, name });
      console.log('Created test user:', email);
    } else {
      console.log('Test user exists:', email);
    }

    const secret = process.env.JWT_SECRET || 'dev-secret-change-me';
    const token = jwt.sign({ id: user.id, email: user.email }, secret, { expiresIn: '7d' });
    console.log('\nUse this token for Authorization header (Bearer <token>):\n');
    console.log(token);

    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
};

runSeed();
