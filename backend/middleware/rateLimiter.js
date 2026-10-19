/**
 * CV 7991 – Express Rate Limiting Middleware
 */

'use strict';

const rateLimit = require('express-rate-limit');

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'RATE_LIMIT_EXCEEDED',
    message: 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau 15 phút.',
  },
  skip: (req) => req.path === '/health',
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30,
  message: {
    success: false,
    error: 'UPLOAD_LIMIT_EXCEEDED',
    message: 'Giới hạn tải lên tài liệu tối đa 30 file mỗi giờ.',
  },
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: {
    success: false,
    error: 'AI_RATE_LIMIT_EXCEEDED',
    message: 'Giới hạn sinh câu hỏi qua AI tối đa 30 lượt mỗi phút.',
  },
});

module.exports = {
  rateLimiter,
  uploadLimiter,
  aiLimiter,
};
