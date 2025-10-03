// Optional firebase-admin initializer. Use FIREBASE_SERVICE_ACCOUNT (JSON string) or
// FIREBASE_SERVICE_ACCOUNT_PATH (file path) in env to initialize.
let admin = null;
try {
  const firebaseAdmin = require('firebase-admin');
  const logger = require('./logger');
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  let credential = null;
  if (serviceAccountJson) {
    const obj = JSON.parse(serviceAccountJson);
    credential = firebaseAdmin.credential.cert(obj);
  } else if (serviceAccountPath) {
    credential = firebaseAdmin.credential.cert(require(serviceAccountPath));
  }

  if (credential) {
    admin = firebaseAdmin.initializeApp({ credential });
    logger.info('Firebase admin initialized');
  } else {
    logger.info('Firebase admin not configured');
  }
} catch (err) {
  // firebase-admin may not be installed or JSON invalid
  // We'll fallback silently; notification service will log instead
  // eslint-disable-next-line no-console
  console.warn('Firebase init skipped:', err.message);
}

module.exports = { admin };
