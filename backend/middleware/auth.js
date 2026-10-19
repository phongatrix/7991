/**
 * CV 7991 – Authentication & Authorization Middleware
 */

'use strict';

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'cv7991-dev-secret-change-in-production';
const JWT_REFRESH = process.env.JWT_REFRESH || 'cv7991-refresh-secret';

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'UNAUTHORIZED',
      message: 'Token xác thực không được cung cấp hoặc sai định dạng',
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      name: payload.name,
    };
    next();
  } catch (err) {
    const msg = err.name === 'TokenExpiredError' ? 'Token đã hết hạn' : 'Token không hợp lệ';
    return res.status(401).json({
      success: false,
      error: err.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN',
      message: msg,
    });
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
    }
    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: `Bạn không có quyền thực hiện hành động này. Yêu cầu quyền: ${roles.join(' hoặc ')}`,
      });
    }
    next();
  };
}

function generateAccessToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role, name: user.full_name },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES || '2h' }
  );
}

function generateRefreshToken(userId) {
  return jwt.sign({ sub: userId }, JWT_REFRESH, { expiresIn: '30d' });
}

function verifyRefreshToken(token) {
  return jwt.verify(token, JWT_REFRESH);
}

module.exports = {
  authenticate,
  authorize,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
};
