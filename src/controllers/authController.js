const jwt = require('jsonwebtoken');
const { models } = require('../config/database');

const createToken = (user) => {
  const payload = { id: user.id, email: user.email };
  const secret = process.env.JWT_SECRET || 'dev-secret-change-me';
  const options = { expiresIn: process.env.JWT_EXPIRES_IN || '7d' };
  return jwt.sign(payload, secret, options);
};

const register = async (req, res, next) => {
  try {
    const { email, password, name, phone } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, error: 'email and password required' });

    const existing = await models.User.findByEmail(email);
    if (existing) return res.status(400).json({ success: false, error: 'Email already registered' });

    const user = await models.User.create({
      email: email.toLowerCase(),
      password_hash: password,
      name: name || 'Parent',
      phone: phone || null
    });

    const token = createToken(user);
    res.json({ success: true, data: { token, user: user.toSafeJSON() } });
  } catch (err) {
    console.error('AUTH REGISTER ERROR', err);
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, error: 'email and password required' });

    const user = await models.User.findByEmail(email);
    if (!user) return res.status(400).json({ success: false, error: 'Invalid credentials' });

    const valid = await user.validatePassword(password);
    if (!valid) return res.status(400).json({ success: false, error: 'Invalid credentials' });

    const token = createToken(user);
    await user.updateLastLogin();
    res.json({ success: true, data: { token, user: user.toSafeJSON() } });
  } catch (err) {
    console.error('AUTH LOGIN ERROR', err);
    next(err);
  }
};

const me = async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    const user = await models.User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, data: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, me };
