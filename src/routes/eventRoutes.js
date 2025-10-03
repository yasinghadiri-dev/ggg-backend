const express = require('express');
const router = express.Router();
const { uploadEvents } = require('../controllers/eventsController');
const validate = require('../middleware/validate');
const schemas = require('../middleware/schemas');

router.post('/upload', validate(schemas.eventsUpload), uploadEvents);

module.exports = router;

