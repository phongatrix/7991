/**
 * CV 7991 – Global Error Handlers & Async Wrapper
 */

'use strict';

const logger = require('../utils/logger');

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: 'NOT_FOUND',
    message: `Đường dẫn không tồn tại: ${req.method} ${req.originalUrl || req.path}`,
  });
}

function errorHandler(err, req, res, next) {
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.originalUrl || req.path,
    method: req.method,
    userId: req.user?.id,
  });

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      error: 'FILE_TOO_LARGE',
      message: 'Kích thước file vượt quá giới hạn (tối đa 50MB)',
    });
  }

  // Joi validation errors
  if (err.isJoi) {
    return res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: err.details?.[0]?.message || 'Dữ liệu đầu vào không hợp lệ',
      details: err.details,
    });
  }

  // PostgreSQL duplicate entry
  if (err.code === '23505') {
    return res.status(409).json({
      success: false,
      error: 'DUPLICATE_ENTRY',
      message: 'Bản ghi dữ liệu đã tồn tại trong hệ thống',
    });
  }

  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.code || 'SERVER_ERROR',
    message: statusCode < 500 ? err.message : 'Đã có lỗi hệ thống xảy ra. Vui lòng thử lại sau.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

module.exports = {
  asyncHandler,
  notFoundHandler,
  errorHandler,
};
