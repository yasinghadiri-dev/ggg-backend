const { models } = require('../config/database');

const sendHeartbeat = async (req, res, next) => {
  try {
    const deviceInfo = req.body;
    const deviceId = deviceInfo.deviceId || deviceInfo.device_id;

    // Find child by device id
    const child = await models.Child.findByDeviceId(deviceId);
    if (!child) return res.status(404).json({ success: false, error: 'Child not found' });

    // Upsert device info
    let di = await models.DeviceInfo.findOne({ where: { child_id: child.id } });
    if (!di) {
      di = await models.DeviceInfo.create({ child_id: child.id, device_id: deviceId, metadata: deviceInfo });
    } else {
      di.metadata = { ...di.metadata, ...deviceInfo };
      di.last_seen = new Date();
      await di.save();
    }

    // Update child last seen
    await child.updateLastSeen();

    res.json({ success: true, data: 'Heartbeat accepted' });
  } catch (err) {
    next(err);
  }
};

const getSettings = async (req, res, next) => {
  try {
    // Accept parentId from query or req.user (for development convenience)
    const parentId = req.query.parentId || req.body.parentId || req.user?.id;
    if (!parentId) return res.status(200).json({ success: true, data: [] });

    const children = await models.Child.findByParent(parentId);
    res.json({ success: true, data: children.map(c => c.monitoring_settings) });
  } catch (err) {
    next(err);
  }
};

module.exports = { sendHeartbeat, getSettings };
