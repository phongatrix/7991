/**
 * CV 7991 – Swagger OpenAPI 3.0 Specification
 */

'use strict';

const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CV 7991 – Exam Generation API',
      version: '1.0.0',
      description: 'API tạo đề thi theo Công văn 7991/BGDĐT-GDTr 2024.\nHỗ trợ: OCR tài liệu SGK, sinh ma trận đề, sinh câu hỏi đa tầng AI, xuất đề thi chuẩn BGDĐT.',
      contact: { name: 'BGDĐT GDTr', url: 'https://moet.gov.vn' },
    },
    servers: [
      { url: 'http://localhost:4000/api/v1', description: 'Development Server' },
      { url: 'https://api.cv7991.edu.vn/v1', description: 'Production Server' },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Nhập JWT Token nhận từ endpoint POST /auth/login',
        },
      },
      schemas: {
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' },
            meta: { type: 'object' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'VALIDATION_ERROR' },
            message: { type: 'string' },
            details: { type: 'array', items: { type: 'object' } },
          },
        },
      },
    },
    security: [{ BearerAuth: [] }],
  },
  apis: [path.join(__dirname, '../routes/*.js')],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = { swaggerSpec };
