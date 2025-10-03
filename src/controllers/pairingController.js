const { models } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const { sendToToken } = require('../services/notificationService');


const requestPairing = async (req, res, next) => {
  try {
  const { deviceInfo, deviceId } = req.body;

    // Simple pairing code generation
    const pairingCode = Math.floor(100000 + Math.random() * 900000).toString();

    const pairing = await models.Pairing.create({
      child_id: null,
      parent_id: null,
      pairing_code: pairingCode,
      qr_code_data: JSON.stringify({ session: uuidv4(), deviceId }),
      device_info: deviceInfo || null,
      expires_at: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
    });

    res.json({
      success: true,
      data: {
        pairingCode: pairing.pairing_code,
        qrCodeData: pairing.qr_code_data,
        sessionId: pairing.session_id
      }
    });
  } catch (err) {
    next(err);
  }
};

const confirmPairing = async (req, res, next) => {
  try {
    const { pairingCode, deviceId, consentData, parentId } = req.body;

    const pairing = await models.Pairing.findOne({ where: { pairing_code: pairingCode, status: 'pending' } });
    if (!pairing) return res.status(404).json({ success: false, error: 'Pairing not found or expired' });

    if (pairing.isExpired()) {
      await pairing.markExpired();
      return res.status(410).json({ success: false, error: 'Pairing code expired' });
    }

    // Allow parentId to be provided in body (no auth required in development)
    const parent_id = parentId || req.user?.id || null;

    const childName = (consentData && (consentData.childName || consentData.name)) || req.body.name || 'Child Device';

    // Create child record placeholder
    const child = await models.Child.create({
      parent_id: parent_id,
      device_id: deviceId || `device-${Date.now()}`,
      name: childName
    });

    pairing.child_id = child.id;
    pairing.status = 'confirmed';
    await pairing.save();

    // Notify parent via FCM if available
    try {
      const parent = parent_id ? await models.User.findByPk(parent_id) : null;
      if (parent && parent.fcm_token) {
        await sendToToken(parent.fcm_token, { type: 'pairing_confirmed', childId: child.id });
      }
    } catch (err) {
      // log and continue
      console.error('Notification error', err);
    }

    // Emit socket event to parent room if io available
    try {
      if (req.io && parent_id) {
        req.io.to(`parent-${parent_id}`).emit('pairing_confirmed', { childId: child.id });
      }
    } catch (err) {
      console.error('Socket emit error', err);
    }

    res.json({ success: true, data: 'Pairing confirmed', childId: child.id });
  } catch (err) {
    next(err);
  }
};

const cancelPairing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pairing = await models.Pairing.findByPk(id);
    if (!pairing) return res.status(404).json({ success: false, error: 'Pairing not found' });
    pairing.status = 'cancelled';
    await pairing.save();
    res.json({ success: true, data: 'Pairing cancelled' });
  } catch (err) {
    next(err);
  }
};

module.exports = { requestPairing, confirmPairing, cancelPairing };
