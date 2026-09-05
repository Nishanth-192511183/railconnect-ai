const jwt = require('jsonwebtoken');

// Strict guard: rejects the request if no valid token is present.
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication token required' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'railconnect_secret');
    req.user = { id: payload.id, name: payload.name, email: payload.email };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

// Soft guard: attaches req.user if a valid token is present, otherwise
// falls through as a guest. Used on demo-flow endpoints so the hackathon
// frontend (which has no login screen) still works end-to-end.
function optionalAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'railconnect_secret');
    req.user = { id: payload.id, name: payload.name, email: payload.email };
  } catch (err) {
    req.user = null;
  }
  next();
}

module.exports = { requireAuth, optionalAuth };
