/**
 * CV 7991 – Validation Service Unit & Integration Tests
 * Run: npm test or npx jest backend/tests/validation.test.js
 */

'use strict';

const ValidationService = require('../services/validationService');
const ExamService = require('../services/examService');

describe('CV 7991 Validation Engine Tests', () => {
  describe('1. Matrix Validation (CV 7991 Rules)', () => {
    test('Validates a standard compliant 45-minute exam matrix', () => {
      const mockMatrix = {
        topics: [
          {
            topic_name: 'Bài 1: Mệnh đề',
            slots: [
              { cognitive_level: 'NB', question_type: 'TN', score: 0.25 },
              { cognitive_level: 'NB', question_type: 'TN', score: 0.25 },
              { cognitive_level: 'TH', question_type: 'TN', score: 0.25 },
              { cognitive_level: 'VD', question_type: 'TN', score: 0.25 },
            ],
          },
          {
            topic_name: 'Bài 2: Tập hợp',
            slots: [
              { cognitive_level: 'NB', question_type: 'TN', score: 0.25 },
              { cognitive_level: 'NB', question_type: 'TN', score: 0.25 },
              { cognitive_level: 'TH', question_type: 'TN', score: 0.25 },
              { cognitive_level: 'TH', question_type: 'TN', score: 0.25 },
              { cognitive_level: 'VD', question_type: 'TN', score: 0.25 },
              { cognitive_level: 'VDC', question_type: 'TN', score: 0.25 },
            ],
          },
        ],
      };

      const result = ValidationService.validateMatrix(mockMatrix, { totalScore: 2.5 });
      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
      expect(result.metrics.totalQuestions).toBe(10);
      expect(result.metrics.counts.NB).toBe(4); // 40%
      expect(result.metrics.counts.TH).toBe(3); // 30%
      expect(result.metrics.counts.VD).toBe(2); // 20%
      expect(result.metrics.counts.VDC).toBe(1); // 10%
    });

    test('Rejects matrix with invalid cognitive level', () => {
      const invalidMatrix = {
        topics: [
          {
            topic_name: 'Chủ đề sai',
            slots: [{ cognitive_level: 'UNKNOWN_LEVEL', question_type: 'TN', score: 0.25 }],
          },
        ],
      };

      const result = ValidationService.validateMatrix(invalidMatrix);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('Mức độ nhận thức không hợp lệ');
    });

    test('Flags warning when cognitive level ratio deviates significantly', () => {
      const skewedMatrix = {
        topics: [
          {
            topic_name: 'Toàn bộ là Nhận biết',
            slots: Array(10).fill({ cognitive_level: 'NB', question_type: 'TN', score: 0.25 }),
          },
        ],
      };

      const result = ValidationService.validateMatrix(skewedMatrix, { totalScore: 2.5 });
      expect(result.isValid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some((w) => w.includes('Tỉ lệ mức độ'))).toBe(true);
    });
  });

  describe('2. Question & LaTeX Syntax Validation', () => {
    test('Validates multiple-choice question format with textbook page linkage', () => {
      const validQ = {
        document_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        page_number: 15,
        sgk_page_reference: 15,
        question_text: 'Tập hợp $\\{x \\in \\mathbb{R} \\mid x^2 + 1 = 0\\}$ có bao nhiêu phần tử?',
        question_type: 'TN',
        part: 1,
        cognitive_level: 'NB',
        textbook_excerpt: 'Định nghĩa: Tập hợp rỗng là tập hợp không chứa phần tử nào.',
        content_similarity: 0.12,
        options: [
          { key: 'A', text: '0' },
          { key: 'B', text: '1' },
          { key: 'C', text: '2' },
          { key: 'D', text: 'Vô số' },
        ],
        correct_answer: 'A',
      };

      const result = ValidationService.validateQuestion(validQ);
      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    test('Rejects question missing document_id or page_number', () => {
      const invalidQ = {
        question_text: 'Câu hỏi không dẫn nguồn SGK',
        question_type: 'TN',
        cognitive_level: 'NB',
        correct_answer: 'A',
      };

      const result = ValidationService.validateQuestion(invalidQ);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('document_id'))).toBe(true);
      expect(result.errors.some(e => e.includes('page_number'))).toBe(true);
    });

    test('Rejects textbook excerpt exceeding 500 characters', () => {
      const longExcerptQ = {
        document_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        page_number: 20,
        question_text: 'Câu hỏi có trích dẫn quá dài',
        question_type: 'TN',
        cognitive_level: 'NB',
        correct_answer: 'A',
        options: [{ key: 'A', text: 'Đúng' }, { key: 'B', text: 'Sai' }],
        textbook_excerpt: 'A'.repeat(501),
      };

      const result = ValidationService.validateQuestion(longExcerptQ);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('vượt quá giới hạn tối đa 500 ký tự'))).toBe(true);
    });

    test('Rejects duplicate question when similarity exceeds 0.85', () => {
      const dupQ = {
        document_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        page_number: 20,
        question_text: 'Câu hỏi tương tự câu đã có',
        question_type: 'TN',
        cognitive_level: 'NB',
        correct_answer: 'A',
        options: [{ key: 'A', text: 'Đúng' }, { key: 'B', text: 'Sai' }],
        content_similarity: 0.92,
      };

      const result = ValidationService.validateQuestion(dupQ);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('vượt quá ngưỡng cho phép 85%'))).toBe(true);
    });

    test('Catches unbalanced math LaTeX dollar signs', () => {
      const brokenLatex = 'Cho phương trình $x^2 + 2x + 1 = 0 có nghiệm kép.';
      const check = ValidationService.validateLatex(brokenLatex);
      expect(check.isValid).toBe(false);
      expect(check.message).toContain('chưa cân bằng');
    });

    test('Catches unbalanced LaTeX curly braces', () => {
      const brokenBraces = 'Cho hàm số $f(x) = \\frac{1}{x + 1$ với $x > 0$.';
      const check = ValidationService.validateLatex(brokenBraces);
      expect(check.isValid).toBe(false);
      expect(check.message).toContain('ngoặc nhọn');
    });
  });

  describe('3. Exam Assembly & Variant Shuffling', () => {
    test('Generates reproducible and distinct exam codes (101, 102, 103, 104)', () => {
      const examService = new ExamService();
      const masterExam = {
        title: 'Đề kiểm tra Toán 10',
        questions: examService._generateSampleExamQuestions('math', 10),
      };

      const variants = examService.generateVariants(masterExam, 4);
      expect(variants.length).toBe(4);
      expect(variants[0].variant_code).toBe(101);
      expect(variants[1].variant_code).toBe(102);

      // Check answer keys exist
      expect(variants[0].answer_key).toBeDefined();
      expect(Object.keys(variants[0].answer_key).length).toBe(masterExam.questions.length);
    });
  });
});
