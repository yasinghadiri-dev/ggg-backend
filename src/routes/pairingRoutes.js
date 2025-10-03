const express = require('express');
const router = express.Router();
const { requestPairing, confirmPairing, cancelPairing } = require('../controllers/pairingController');
const requireAuth = require('../middleware/requireAuth');
const validate = require('../middleware/validate');
const schemas = require('../middleware/schemas');

router.post('/request', validate(schemas.pairingRequest), requestPairing);
// confirm pairing requires authentication
router.post('/confirm', requireAuth, validate(schemas.pairingConfirm), confirmPairing);
router.delete('/:id', requireAuth, cancelPairing);

module.exports = router;

