const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader) return next(); // allow unauthenticated access for now; routes may check req.user

  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
  const secret = process.env.JWT_SECRET || 'dev-secret-change-me';

  try {
    const payload = jwt.verify(token, secret);
    req.user = { id: payload.id, email: payload.email };
  } catch (err) {
    // invalid token -> ignore and leave req.user undefined
  }
  next();
};
