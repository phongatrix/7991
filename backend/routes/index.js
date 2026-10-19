/**
 * CV 7991 – All API Routes
 * Includes: Auth, Documents, Matrices, Questions, Exams, AI, QuestionBank
 */

'use strict';

const express   = require('express');
const multer    = require('multer');
const path      = require('path');
const { v4: uuidv4 } = require('uuid');
const { body, query, param, validationResult } = require('express-validator');
const Joi       = require('joi');

const { authenticate, authorize } = require('../middleware/auth');
const { uploadLimiter }           = require('../middleware/rateLimiter');
const { asyncHandler }            = require('../middleware/errorHandler');
const DocumentService             = require('../services/documentService');
const MatrixService               = require('../services/matrixService');
const QuestionService             = require('../services/questionService');
const ExamService                 = require('../services/examService');
const AIService                   = require('../services/aiService');
const db                          = require('../database/connection');

// ══════════════════════════════════════════════════════════════
// MULTER CONFIG – File upload
// ══════════════════════════════════════════════════════════════

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/documents');
    require('fs').mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/tiff'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Chỉ chấp nhận PDF, JPG, PNG, TIFF'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});


// ══════════════════════════════════════════════════════════════
// VALIDATION SCHEMAS (Joi)
// ══════════════════════════════════════════════════════════════

const Schemas = {
  login: Joi.object({
    email:    Joi.string().email().required(),
    password: Joi.string().min(8).required(),
  }),

  documentProcess: Joi.object({
    document_id:     Joi.string().uuid().required(),
    subject:         Joi.string().valid('math','literature','physics','chemistry','biology','history','geography','english','informatics').required(),
    grade:           Joi.number().integer().min(1).max(12).required(),
    chapter_from:    Joi.number().integer().min(1).optional(),
    chapter_to:      Joi.number().integer().min(1).optional(),
    force_reprocess: Joi.boolean().default(false),
  }),

  matrixCreate: Joi.object({
    document_id:     Joi.string().uuid().required(),
    exam_type:       Joi.string().valid('15min','45min','90min','150min').required(),
    total_questions: Joi.number().integer().min(5).max(100).optional(),
    tn_ratio:        Joi.number().min(0).max(1).default(0.7),
    distribution: Joi.object({
      NB:  Joi.number().min(0).max(1),
      TH:  Joi.number().min(0).max(1),
      VD:  Joi.number().min(0).max(1),
      VDC: Joi.number().min(0).max(1),
    }).optional(),
    group_by_chapter: Joi.boolean().default(false),
    max_topics:       Joi.number().integer().min(1).max(20).default(8),
    lesson_from:      Joi.number().integer().min(1).optional(),
    lesson_to:        Joi.number().integer().min(1).optional(),
    chapFrom:         Joi.number().integer().min(1).optional(),
    chapTo:           Joi.number().integer().min(1).optional(),
    chapter_from:     Joi.number().integer().min(1).optional(),
    chapter_to:       Joi.number().integer().min(1).optional(),
  }),

  questionGenerate: Joi.object({
    matrix_id:       Joi.string().uuid().required(),
    slot_ids:        Joi.array().items(Joi.string()).optional(),
    ai_provider:     Joi.string().valid('gemini','openai','claude','auto').default('auto'),
    language:        Joi.string().valid('vi','en').default('vi'),
    custom_context:  Joi.string().max(2000).optional(),
  }),

  examCreate: Joi.object({
    matrix_id:     Joi.string().uuid().required(),
    title:         Joi.string().min(5).max(200).required(),
    subject:       Joi.string().required(),
    grade:         Joi.number().integer().min(1).max(12).required(),
    duration:      Joi.number().integer().min(15).max(300).required(),
    school_name:   Joi.string().max(200).optional(),
    academic_year: Joi.string().pattern(/^\d{4}–\d{4}$/).optional(),
    exam_count:    Joi.number().integer().min(1).max(4).default(1),
    shuffle:       Joi.boolean().default(true),
  }),

  aiGenerate: Joi.object({
    prompt_id:   Joi.string().required(),
    variables:   Joi.object().required(),
    provider:    Joi.string().valid('gemini','openai','claude','auto').default('auto'),
    max_tokens:  Joi.number().integer().min(100).max(8000).optional(),
    temperature: Joi.number().min(0).max(2).optional(),
  }),

  questionBankSearch: Joi.object({
    q:       Joi.string().optional(),
    subject: Joi.string().optional(),
    grade:   Joi.number().integer().optional(),
    level:   Joi.string().valid('NB','TH','VD','VDC').optional(),
    type:    Joi.string().valid('TN','TL').optional(),
    page:    Joi.number().integer().min(1).default(1),
    limit:   Joi.number().integer().min(1).max(100).default(20),
  }),
};

// Validation middleware factory
const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'Dữ liệu không hợp lệ',
      details: error.details.map(d => ({ field: d.path.join('.'), message: d.message })),
    });
  }
  req.validatedBody = value;
  next();
};

const validateQuery = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.query, { abortEarly: false, allowUnknown: false });
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      details: error.details.map(d => ({ field: d.path.join('.'), message: d.message })),
    });
  }
  req.validatedQuery = value;
  next();
};

// ══════════════════════════════════════════════════════════════
// RESPONSE HELPERS
// ══════════════════════════════════════════════════════════════

const ok = (res, data, meta = {}) => res.json({
  success: true,
  data,
  meta: { timestamp: new Date().toISOString(), ...meta },
});

const created = (res, data) => res.status(201).json({
  success: true,
  data,
  meta: { timestamp: new Date().toISOString() },
});


// ══════════════════════════════════════════════════════════════
// 1. AUTH ROUTES  /api/v1/auth
// ══════════════════════════════════════════════════════════════

const authRouter = express.Router();

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Đăng nhập & lấy JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:    { type: string, example: "giaovien@truong.edu.vn" }
 *               password: { type: string, example: "SecurePass123!" }
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 access_token:  { type: string }
 *                 refresh_token: { type: string }
 *                 expires_in:    { type: number }
 *                 user:          { type: object }
 */
authRouter.post('/login', validate(Schemas.login), asyncHandler(async (req, res) => {
  const { email, password } = req.validatedBody;
  const authService = require('../services/authService');
  const result = await authService.login(email, password);
  ok(res, result);
}));

authRouter.post('/refresh', asyncHandler(async (req, res) => {
  const { refresh_token } = req.body;
  if (!refresh_token) return res.status(400).json({ success: false, error: 'refresh_token required' });
  const authService = require('../services/authService');
  const result = await authService.refreshTokens(refresh_token);
  ok(res, result);
}));

authRouter.post('/logout', authenticate, asyncHandler(async (req, res) => {
  const authService = require('../services/authService');
  await authService.logout(req.user.id, req.body.refresh_token);
  ok(res, { message: 'Đăng xuất thành công' });
}));

authRouter.get('/me', authenticate, asyncHandler(async (req, res) => {
  ok(res, req.user);
}));


// ══════════════════════════════════════════════════════════════
// 2. DOCUMENT ROUTES  /api/v1/documents
// ══════════════════════════════════════════════════════════════

const documentRouter = express.Router();
documentRouter.use(authenticate);

/**
 * POST /documents/upload
 * Upload SGK file (PDF/image). Returns document_id.
 */
documentRouter.post(
  '/upload',
  uploadLimiter,
  upload.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) throw Object.assign(new Error('Không có file'), { status: 400 });

    const { subject = 'math', grade = '10' } = req.body;
    const docService = new DocumentService();

    const document = await docService.createDocument({
      userId:      req.user.id,
      filePath:    req.file.path,
      fileName:    req.file.originalname,
      fileSize:    req.file.size,
      mimeType:    req.file.mimetype,
      subject,
      grade:       parseInt(grade),
    });

    created(res, {
      document_id: document.id,
      file_name:   document.file_name,
      file_size:   document.file_size,
      status:      document.status,
      upload_url:  `/uploads/documents/${path.basename(req.file.path)}`,
    });
  })
);

/**
 * POST /documents/process
 * Trigger OCR + content extraction. Returns job_id for WebSocket tracking.
 */
documentRouter.post(
  '/process',
  validate(Schemas.documentProcess),
  asyncHandler(async (req, res) => {
    const docService = new DocumentService();
    const job = await docService.startProcessing({
      ...req.validatedBody,
      userId: req.user.id,
      broadcastProgress: global.broadcastProgress,
    });

    ok(res, {
      job_id:      job.id,
      document_id: req.validatedBody.document_id,
      status:      'processing',
      websocket_url: `/ws?jobId=${job.id}`,
      estimated_seconds: job.estimated_seconds,
      message: 'Xử lý đang chạy. Theo dõi tiến trình qua WebSocket.',
    });
  })
);

/**
 * GET /documents/:id
 * Lấy thông tin tài liệu và trạng thái xử lý.
 */
documentRouter.get('/:id', asyncHandler(async (req, res) => {
  const docService = new DocumentService();
  const doc = await docService.getDocument(req.params.id, req.user.id);
  if (!doc) throw Object.assign(new Error('Document not found'), { status: 404 });
  ok(res, doc);
}));

/**
 * GET /documents/:id/pages
 * Lấy danh sách trang đã xử lý với metadata.
 */
documentRouter.get('/:id/pages', asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, chapter, lesson } = req.query;
  const docService = new DocumentService();
  const result = await docService.getPages(req.params.id, {
    page: parseInt(page), limit: parseInt(limit), chapter, lesson,
  });
  ok(res, result.data, { pagination: result.pagination });
}));

/**
 * GET /documents/:id/questions
 * Lấy câu hỏi theo tham chiếu trang SGK.
 */
documentRouter.get('/:id/questions', asyncHandler(async (req, res) => {
  const { chapter, page: pageNum, level, type } = req.query;
  const qService = new QuestionService();
  const questions = await qService.getByDocumentRef(req.params.id, { chapter, pageNum, level, type });
  ok(res, questions, { count: questions.length });
}));

/**
 * GET /documents  (list user's documents)
 */
documentRouter.get('/', asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const docService = new DocumentService();
  const result = await docService.listDocuments(req.user.id, { page, limit, status });
  ok(res, result.data, { pagination: result.pagination });
}));

/**
 * DELETE /documents/:id
 */
documentRouter.delete('/:id', asyncHandler(async (req, res) => {
  const docService = new DocumentService();
  await docService.deleteDocument(req.params.id, req.user.id);
  ok(res, { message: 'Đã xóa tài liệu' });
}));


// ══════════════════════════════════════════════════════════════
// 3. MATRIX ROUTES  /api/v1/matrices
// ══════════════════════════════════════════════════════════════

const matrixRouter = express.Router();
matrixRouter.use(authenticate);

/**
 * POST /matrices/create-from-sgk
 * Tạo ma trận tự động từ SGK đã xử lý.
 */
matrixRouter.post(
  '/create-from-sgk',
  validate(Schemas.matrixCreate),
  asyncHandler(async (req, res) => {
    const matService = new MatrixService();
    const matrix = await matService.generateFromSGK({
      ...req.validatedBody,
      userId: req.user.id,
    });
    created(res, matrix);
  })
);

/**
 * GET /matrices/:id
 */
matrixRouter.get('/:id', asyncHandler(async (req, res) => {
  const matService = new MatrixService();
  const matrix = await matService.getMatrix(req.params.id, req.user.id);
  if (!matrix) throw Object.assign(new Error('Matrix not found'), { status: 404 });
  ok(res, matrix);
}));

/**
 * PUT /matrices/:id
 * Cập nhật ma trận (chỉnh sửa thủ công).
 */
matrixRouter.put('/:id', asyncHandler(async (req, res) => {
  const matService = new MatrixService();
  const updated = await matService.updateMatrix(req.params.id, req.user.id, req.body);
  ok(res, updated);
}));

/**
 * POST /matrices/:id/validate
 * Kiểm tra ma trận có đạt chuẩn CV 7991 không.
 */
matrixRouter.post('/:id/validate', asyncHandler(async (req, res) => {
  const matService = new MatrixService();
  const result = await matService.validateMatrix(req.params.id);
  ok(res, result);
}));

/**
 * GET /matrices  (user's matrices)
 */
matrixRouter.get('/', asyncHandler(async (req, res) => {
  const matService = new MatrixService();
  const matrices = await matService.listMatrices(req.user.id);
  ok(res, matrices);
}));


// ══════════════════════════════════════════════════════════════
// 4. QUESTION ROUTES  /api/v1/questions
// ══════════════════════════════════════════════════════════════

const questionRouter = express.Router();
questionRouter.use(authenticate);

/**
 * POST /questions/generate-from-sgk
 * Gọi AI để sinh câu hỏi từ ma trận và nội dung SGK.
 */
questionRouter.post(
  '/generate-from-sgk',
  validate(Schemas.questionGenerate),
  asyncHandler(async (req, res) => {
    const qService = new QuestionService();
    const job = await qService.startGeneration({
      ...req.validatedBody,
      userId: req.user.id,
      broadcastProgress: global.broadcastProgress,
    });

    ok(res, {
      job_id:        job.id,
      matrix_id:     req.validatedBody.matrix_id,
      status:        'generating',
      websocket_url: `/ws?jobId=${job.id}`,
      estimated_seconds: job.estimated_seconds,
    });
  })
);

/**
 * GET /questions/:id
 */
questionRouter.get('/:id', asyncHandler(async (req, res) => {
  const qService = new QuestionService();
  const q = await qService.getQuestion(req.params.id, req.user.id);
  if (!q) throw Object.assign(new Error('Question not found'), { status: 404 });
  ok(res, q);
}));

/**
 * PUT /questions/:id
 * Chỉnh sửa câu hỏi.
 */
questionRouter.put('/:id', asyncHandler(async (req, res) => {
  const qService = new QuestionService();
  const updated = await qService.updateQuestion(req.params.id, req.user.id, req.body);
  ok(res, updated);
}));

/**
 * POST /questions/:id/validate
 * Validate câu hỏi với AI.
 */
questionRouter.post('/:id/validate', asyncHandler(async (req, res) => {
  const qService = new QuestionService();
  const result = await qService.validateWithAI(req.params.id);
  ok(res, result);
}));

/**
 * DELETE /questions/:id
 */
questionRouter.delete('/:id', asyncHandler(async (req, res) => {
  const qService = new QuestionService();
  await qService.deleteQuestion(req.params.id, req.user.id);
  ok(res, { message: 'Đã xóa câu hỏi' });
}));


// ══════════════════════════════════════════════════════════════
// 5. EXAM ROUTES  /api/v1/exams
// ══════════════════════════════════════════════════════════════

const examRouter = express.Router();
examRouter.use(authenticate);

/**
 * POST /exams/create-from-matrix
 * Tổng hợp đề thi hoàn chỉnh từ ma trận và câu hỏi.
 */
examRouter.post(
  '/create-from-matrix',
  validate(Schemas.examCreate),
  asyncHandler(async (req, res) => {
    const examService = new ExamService();
    const exam = await examService.createFromMatrix({
      ...req.validatedBody,
      userId: req.user.id,
    });
    created(res, exam);
  })
);

/**
 * POST /exams/batch-create
 * Tạo nhiều mã đề từ cùng một bộ câu hỏi.
 */
examRouter.post(
  '/batch-create',
  asyncHandler(async (req, res) => {
    const { matrix_id, count = 4, ...rest } = req.body;
    const examService = new ExamService();
    const exams = await examService.batchCreate({ matrix_id, count, ...rest, userId: req.user.id });
    created(res, exams);
  })
);

/**
 * GET /exams/:id
 */
examRouter.get('/:id', asyncHandler(async (req, res) => {
  const examService = new ExamService();
  const exam = await examService.getExam(req.params.id, req.user.id);
  if (!exam) throw Object.assign(new Error('Exam not found'), { status: 404 });
  ok(res, exam);
}));

/**
 * GET /exams/:id/export?format=pdf|word|html
 */
examRouter.get('/:id/export', asyncHandler(async (req, res) => {
  const { format = 'pdf' } = req.query;
  const examService = new ExamService();
  const { buffer, filename, contentType } = await examService.exportExam(req.params.id, format);
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Type', contentType);
  res.send(buffer);
}));

/**
 * GET /exams/:id/answer-key
 */
examRouter.get('/:id/answer-key', asyncHandler(async (req, res) => {
  const examService = new ExamService();
  const answerKey = await examService.getAnswerKey(req.params.id, req.user.id);
  ok(res, answerKey);
}));

/**
 * GET /exams  (user's exams)
 */
examRouter.get('/', asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const examService = new ExamService();
  const result = await examService.listExams(req.user.id, { page, limit });
  ok(res, result.data, { pagination: result.pagination });
}));

/**
 * DELETE /exams/:id
 */
examRouter.delete('/:id', asyncHandler(async (req, res) => {
  const examService = new ExamService();
  await examService.deleteExam(req.params.id, req.user.id);
  ok(res, { message: 'Đã xóa đề thi' });
}));


// ══════════════════════════════════════════════════════════════
// 6. AI ROUTES  /api/v1/ai
// ══════════════════════════════════════════════════════════════

const aiRouter = express.Router();
aiRouter.use(authenticate);

/**
 * POST /ai/generate-question
 * Multi-provider AI endpoint với automatic failover.
 */
aiRouter.post(
  '/generate-question',
  validate(Schemas.aiGenerate),
  asyncHandler(async (req, res) => {
    const aiService = new AIService();
    const result = await aiService.generateWithFallback(req.validatedBody);
    ok(res, result, {
      provider_used: result.provider_used,
      tokens_used:   result.tokens_used,
    });
  })
);

/**
 * GET /ai/providers
 * Lấy trạng thái của các AI providers.
 */
aiRouter.get('/providers', asyncHandler(async (req, res) => {
  const aiService = new AIService();
  const status = await aiService.getProviderStatus();
  ok(res, status);
}));

/**
 * POST /ai/ocr-correct
 * Sửa lỗi OCR bằng AI.
 */
aiRouter.post('/ocr-correct', asyncHandler(async (req, res) => {
  const { text, subject, grade } = req.body;
  if (!text) return res.status(400).json({ success: false, error: 'text required' });
  const aiService = new AIService();
  const corrected = await aiService.correctOCR({ text, subject, grade });
  ok(res, corrected);
}));


// ══════════════════════════════════════════════════════════════
// 7. QUESTION BANK  /api/v1/question-banks
// ══════════════════════════════════════════════════════════════

const questionBankRouter = express.Router();
questionBankRouter.use(authenticate);

/**
 * GET /question-banks/search
 * Tìm kiếm câu hỏi trong ngân hàng.
 */
questionBankRouter.get(
  '/search',
  validateQuery(Schemas.questionBankSearch),
  asyncHandler(async (req, res) => {
    const qService = new QuestionService();
    const result = await qService.searchBank(req.validatedQuery);
    ok(res, result.data, { pagination: result.pagination, total: result.total });
  })
);

/**
 * POST /question-banks/import
 * Import câu hỏi từ JSON/Excel.
 */
questionBankRouter.post(
  '/import',
  upload.single('file'),
  asyncHandler(async (req, res) => {
    const qService = new QuestionService();
    const result = await qService.importFromFile(req.file, req.user.id);
    ok(res, result);
  })
);

/**
 * GET /question-banks/stats
 * Thống kê ngân hàng câu hỏi của user.
 */
questionBankRouter.get('/stats', asyncHandler(async (req, res) => {
  const qService = new QuestionService();
  const stats = await qService.getBankStats(req.user.id);
  ok(res, stats);
}));


// ══════════════════════════════════════════════════════════════
// EXPORT ROUTERS
// ══════════════════════════════════════════════════════════════

module.exports = {
  authRouter,
  documentRouter,
  matrixRouter,
  questionRouter,
  examRouter,
  aiRouter,
  questionBankRouter,
};
