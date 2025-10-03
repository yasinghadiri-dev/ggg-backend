const logger = require('../config/logger');
const { admin } = require('../config/firebase');

const sendToToken = async (token, payload) => {
  if (!token) {
    logger.warn('No FCM token provided, skipping notification');
    return;
  }

  if (admin) {
    try {
      await admin.messaging().sendToDevice(token, { data: payload });
      logger.info('Notification sent via FCM');
    } catch (err) {
      logger.error('FCM send failed', err);
    }
  } else {
    logger.info('Notification (logged):', payload);
  }
};

module.exports = { sendToToken };
