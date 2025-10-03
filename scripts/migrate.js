require('dotenv').config();
const { sequelize } = require('../src/config/database');
const logger = require('../src/config/logger');

const runMigrations = async () => {
  try {
    await sequelize.authenticate();
    logger.info('DB connected for migration');
    await sequelize.sync({ alter: true });
    logger.info('Database synchronized (migrate complete)');
    process.exit(0);
  } catch (err) {
    logger.error('Migration failed', err);
    process.exit(1);
  }
};

runMigrations();
