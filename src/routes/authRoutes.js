const express = require('express');
const router = express.Router();
const { register, login, me } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const schemas = require('../middleware/schemas');

router.post('/register', validate(schemas.authRegister), register);
router.post('/login', validate(schemas.authLogin), login);
router.get('/me', authMiddleware, me);

module.exports = router;

