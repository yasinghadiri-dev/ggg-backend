const express = require('express');
const router = express.Router();
const { sendHeartbeat, getSettings } = require('../controllers/childController');
const requireAuth = require('../middleware/requireAuth');
const validate = require('../middleware/validate');
const schemas = require('../middleware/schemas');

router.post('/heartbeat', validate(schemas.heartbeat), sendHeartbeat);
router.get('/settings', requireAuth, getSettings);

module.exports = router;

