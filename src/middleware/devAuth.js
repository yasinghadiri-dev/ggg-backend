// Simple development auth middleware
// If NODE_ENV=development it will set req.user from DEV_USER_ID or a mock value.
module.exports = (req, res, next) => {
  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    const devUserId = process.env.DEV_USER_ID || null;
    req.user = devUserId ? { id: devUserId } : { id: null };
  }
  next();
};
