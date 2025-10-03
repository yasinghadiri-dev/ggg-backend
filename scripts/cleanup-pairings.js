require('dotenv').config();
const { sequelize, models } = require('../src/config/database');
const logger = require('../src/config/logger');

const cleanup = async () => {
  try {
    await sequelize.authenticate();
    const now = new Date();
    const expired = await models.Pairing.findAll({ where: { status: 'pending', expires_at: { [sequelize.Sequelize.Op.lt]: now } } });
    for (const p of expired) {
      p.status = 'expired';
      await p.save();
      logger.info(`Expired pairing ${p.id} marked`);
    }
    logger.info(`Cleanup complete. ${expired.length} pairings expired.`);
    process.exit(0);
  } catch (err) {
    logger.error('Cleanup failed', err);
    process.exit(1);
  }
};

cleanup();
