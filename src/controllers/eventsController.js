const { models } = require('../config/database');

const uploadEvents = async (req, res, next) => {
  try {
    const events = req.body;
    if (!Array.isArray(events)) return res.status(400).json({ success: false, error: 'Events must be an array' });

    const created = [];
    for (const ev of events) {
      const e = await models.Event.create({
        child_id: ev.childId || ev.child_id,
        event_type: ev.eventType || ev.event_type || 'notification',
        payload: ev.payload || ev.data || {},
        device_timestamp: ev.deviceTimestamp || ev.device_timestamp || null,
        is_encrypted: !!ev.encrypted,
        encrypted_payload: ev.encrypted || null
      });
      created.push(e);
    }

    res.json({ success: true, data: 'Events uploaded', count: created.length });
  } catch (err) {
    next(err);
  }
};

module.exports = { uploadEvents };
