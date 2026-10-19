/**
 * CV 7991 – Validation Engine
 * Implements strict compliance checks according to Công văn 7991/BGDĐT-GDTr 2024.
 * Validates matrices, specification tables, question formats, and assembled exams.
 */

'use strict';

class ValidationService {
  /**
   * Default CV 7991 Cognitive Level Distribution Targets
   */
  static DEFAULT_DISTRIBUTION = {
    NB: 0.40,  // Nhận biết: ~40%
    TH: 0.30,  // Thông hiểu: ~30%
    VD: 0.20,  // Vận dụng: ~20%
    VDC: 0.10, // Vận dụng cao: ~10%
  };

  /**
   * Default tolerance (5% deviation allowed per level)
   */
  static TOLERANCE = 0.05;

  /**
   * 1. Validate Exam Matrix against CV 7991 standard
   * @param {Object} matrix - The matrix object with topics, slots, and summary
   * @param {Object} [options] - Optional custom weights and tolerances
   * @returns {Object} { isValid: boolean, errors: Array, warnings: Array, metrics: Object }
   */
  static validateMatrix(matrix, options = {}) {
    const errors = [];
    const warnings = [];

    if (!matrix || typeof matrix !== 'object') {
      return { isValid: false, errors: ['Ma trận không hợp lệ hoặc rỗng'], warnings: [] };
    }

    const topics = matrix.topics || [];
    if (!Array.isArray(topics) || topics.length === 0) {
      errors.push('Ma trận phải chứa ít nhất một chủ đề / bài học');
    }

    let totalSlots = 0;
    let counts = { NB: 0, TH: 0, VD: 0, VDC: 0 };
    let typeCounts = { TN: 0, TL: 0 };
    let calculatedTotalScore = 0;

    topics.forEach((topic, tIdx) => {
      const topicName = topic.topic_name || topic.name || `Chủ đề ${tIdx + 1}`;
      const slots = topic.slots || [];

      if (!Array.isArray(slots) || slots.length === 0) {
        warnings.push(`Chủ đề "${topicName}" không có câu hỏi nào được gán`);
      }

      slots.forEach((slot, sIdx) => {
        totalSlots++;
        const level = slot.cognitive_level || slot.level;
        const qType = slot.question_type || slot.type || 'TN';
        const score = typeof slot.score === 'number' ? slot.score : (slot.points || 0.25);

        calculatedTotalScore += score;

        if (counts[level] !== undefined) {
          counts[level]++;
        } else {
          errors.push(`Vị trí [${topicName} - slot ${sIdx + 1}]: Mức độ nhận thức không hợp lệ "${level}". Chỉ chấp nhận: NB, TH, VD, VDC`);
        }

        if (typeCounts[qType] !== undefined) {
          typeCounts[qType]++;
        } else {
          errors.push(`Vị trí [${topicName} - slot ${sIdx + 1}]: Dạng câu hỏi không hợp lệ "${qType}". Chỉ chấp nhận: TN, TL`);
        }

        // Validate SGK page linkage
        if (slot.sgk_page_start && slot.sgk_page_end && slot.sgk_page_start > slot.sgk_page_end) {
          errors.push(`Vị trí [${topicName} - slot ${sIdx + 1}]: Trang SGK bắt đầu (${slot.sgk_page_start}) lớn hơn trang kết thúc (${slot.sgk_page_end})`);
        }
      });
    });

    if (totalSlots === 0) {
      errors.push('Tổng số lượng câu hỏi trong ma trận bằng 0');
      return { isValid: false, errors, warnings, metrics: null };
    }

    // Cognitive Level Ratio Validation
    const ratios = {
      NB: counts.NB / totalSlots,
      TH: counts.TH / totalSlots,
      VD: counts.VD / totalSlots,
      VDC: counts.VDC / totalSlots,
    };

    const target = options.targetDistribution || ValidationService.DEFAULT_DISTRIBUTION;
    const tolerance = options.tolerance || ValidationService.TOLERANCE;

    Object.keys(target).forEach((lvl) => {
      const expected = target[lvl];
      const actual = ratios[lvl];
      const diff = Math.abs(actual - expected);

      if (diff > tolerance) {
        warnings.push(
          `Tỉ lệ mức độ ${lvl} (${(actual * 100).toFixed(1)}%) lệch khỏi chuẩn CV 7991 (${(expected * 100).toFixed(1)}% ± ${(tolerance * 100).toFixed(0)}%)`
        );
      }
    });

    // Score validation (standard Vietnamese exam is graded on 10.0 scale)
    const totalScoreExpected = options.totalScore || 10.0;
    const scoreDiff = Math.abs(calculatedTotalScore - totalScoreExpected);
    if (scoreDiff > 0.05) {
      warnings.push(`Tổng điểm các câu hỏi (${calculatedTotalScore.toFixed(2)}) chưa khớp với thang điểm chuẩn 10.0`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      metrics: {
        totalQuestions: totalSlots,
        totalScore: Math.round(calculatedTotalScore * 100) / 100,
        distribution: ratios,
        counts,
        typeCounts,
        complianceScore: Math.max(0, 100 - (errors.length * 20 + warnings.length * 5)),
      },
    };
  }

  /**
   * 2. Validate Question Content & Structure
   * @param {Object} question - The question object
   * @returns {Object} { isValid: boolean, errors: Array, warnings: Array }
   */
  static validateQuestion(question) {
    const errors = [];
    const warnings = [];

    if (!question) {
      return { isValid: false, errors: ['Dữ liệu câu hỏi rỗng'], warnings: [] };
    }

    const { question_text, question_type, cognitive_level, options, correct_answer } = question;

    if (!question_text || question_text.trim().length < 5) {
      errors.push('Nội dung câu hỏi quá ngắn hoặc rỗng (tối thiểu 5 ký tự)');
    }

    if (!['NB', 'TH', 'VD', 'VDC'].includes(cognitive_level)) {
      errors.push(`Mức độ nhận thức không hợp lệ: "${cognitive_level}" (chỉ chấp nhận NB, TH, VD, VDC)`);
    }

    // LaTeX Math Syntax check
    if (question_text) {
      const latexCheck = ValidationService.validateLatex(question_text);
      if (!latexCheck.isValid) {
        warnings.push(`Cảnh báo LaTeX trong đề bài: ${latexCheck.message}`);
      }
    }

    // Multiple Choice format check (Part I)
    if (question_type === 'TN' || question.part === 1) {
      if (!Array.isArray(options) || options.length < 2) {
        errors.push('Câu trắc nghiệm phải có ít nhất các phương án lựa chọn');
      } else {
        if (options.length === 4) {
          const keys = options.map((opt) => (opt.key || opt.label || '').toUpperCase());
          const hasStandardKeys = ['A', 'B', 'C', 'D'].every((k) => keys.includes(k));
          if (!hasStandardKeys) {
            warnings.push('Các đáp án trắc nghiệm nên được gán nhãn chuẩn: A, B, C, D');
          }
        }

        // Duplicate options check
        const texts = options.map((o) => (o.text || o.content || '').trim().toLowerCase()).filter(Boolean);
        const uniqueTexts = new Set(texts);
        if (uniqueTexts.size < texts.length) {
          warnings.push('Phát hiện các phương án lựa chọn có nội dung trùng lặp nhau');
        }
      }

      if (!correct_answer && correct_answer !== 0) {
        errors.push('Câu hỏi trắc nghiệm thiếu đáp án đúng');
      }
    }

    // True/False multi-item format check (Part II of CV 7991)
    if (question.part === 2 || question.format === 'true_false_group') {
      const subItems = question.sub_items || question.statements || [];
      if (!Array.isArray(subItems) || subItems.length !== 4) {
        warnings.push('Câu trắc nghiệm Đúng/Sai theo chuẩn CV 7991 nên có 4 ý a), b), c), d)');
      } else {
        subItems.forEach((item, idx) => {
          if (item.correct === undefined && item.is_true === undefined) {
            errors.push(`Ý ${String.fromCharCode(97 + idx)}) thiếu trạng thái Đúng/Sai`);
          }
        });
      }
    }

    // SGK Linkage & Textbook Alignment Checks (CV 7991 Schema Rules)
    if (!question.document_id) {
      errors.push('Câu hỏi thiếu document_id (bắt buộc phải gắn với tài liệu SGK gốc)');
    }

    const pageNum = question.page_number || question.sgk_page_reference;
    if (!pageNum || pageNum <= 0) {
      errors.push('Câu hỏi thiếu page_number / sgk_page_reference (bắt buộc phải dẫn chiếu trang SGK)');
    }

    if (question.textbook_excerpt) {
      if (question.textbook_excerpt.length > 500) {
        errors.push(`Trích đoạn SGK (textbook_excerpt) dài ${question.textbook_excerpt.length} ký tự, vượt quá giới hạn tối đa 500 ký tự theo quy định`);
      }
    }

    if (typeof question.content_similarity === 'number' && question.content_similarity > 0.85) {
      errors.push(`Độ trùng lặp nội dung (${(question.content_similarity * 100).toFixed(1)}%) vượt quá ngưỡng cho phép 85% đối với các câu hỏi cùng trang SGK`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate Question against Database State (Ownership, Page existence, Duplicates)
   * @param {Object} question - The question object
   * @param {string} userId - User requesting creation
   * @param {Object} db - Database client/pool
   */
  static async validateQuestionIntegrity(question, userId, db) {
    const result = ValidationService.validateQuestion(question);
    if (!result.isValid) return result;

    if (!db) return result;

    try {
      // 1. Verify document ownership
      const docRes = await db.query(
        'SELECT id, user_id FROM documents WHERE id = $1',
        [question.document_id]
      );
      if (docRes.rows.length === 0) {
        result.isValid = false;
        result.errors.push(`Tài liệu SGK với document_id "${question.document_id}" không tồn tại trong hệ thống`);
        return result;
      }
      if (userId && docRes.rows[0].user_id !== userId) {
        result.isValid = false;
        result.errors.push('Bạn không có quyền truy cập hoặc sử dụng tài liệu SGK này');
        return result;
      }

      // 2. Verify page existence in document_pages
      const pageRes = await db.query(
        'SELECT id FROM document_pages WHERE document_id = $1 AND page_number = $2',
        [question.document_id, question.page_number]
      );
      if (pageRes.rows.length === 0) {
        result.isValid = false;
        result.errors.push(`Trang ${question.page_number} chưa được nhận diện hoặc không tồn tại trong document_pages`);
        return result;
      }

      // 3. Similarity / Duplicate check against existing questions from the same page
      const qText = question.question_text || question.content || '';
      const dupRes = await db.query(
        `SELECT id, content, similarity(content, $1) as sim 
         FROM questions 
         WHERE document_id = $2 AND page_number = $3 
         ORDER BY sim DESC LIMIT 1`,
        [qText, question.document_id, question.page_number]
      );
      if (dupRes.rows.length > 0 && dupRes.rows[0].sim > 0.85) {
        result.isValid = false;
        result.errors.push(`Phát hiện câu hỏi tương tự (${Math.round(dupRes.rows[0].sim * 100)}% trùng khớp) đã tồn tại trên trang ${question.page_number}`);
      }
    } catch (err) {
      result.warnings.push(`Kiểm tra DB integrity phát sinh cảnh báo: ${err.message}`);
    }

    return result;
  }

  /**
   * 3. Validate LaTeX String Balanced Syntax
   * @param {string} text - Text containing LaTeX expressions
   * @returns {Object} { isValid: boolean, message?: string }
   */
  static validateLatex(text) {
    if (!text || typeof text !== 'string') return { isValid: true };

    // Check $ delimiter balance
    let singleDollarCount = 0;
    for (let i = 0; i < text.length; i++) {
      if (text[i] === '$' && (i === 0 || text[i - 1] !== '\\')) {
        singleDollarCount++;
      }
    }

    if (singleDollarCount % 2 !== 0) {
      return { isValid: false, message: 'Dấu mở/đóng ký hiệu toán học $ chưa cân bằng' };
    }

    // Check curly braces balance inside math blocks
    let braceCount = 0;
    for (let i = 0; i < text.length; i++) {
      if (text[i] === '{' && (i === 0 || text[i - 1] !== '\\')) braceCount++;
      if (text[i] === '}' && (i === 0 || text[i - 1] !== '\\')) braceCount--;
      if (braceCount < 0) {
        return { isValid: false, message: 'Thừa dấu đóng ngoặc nhọn } trong công thức toán' };
      }
    }

    if (braceCount !== 0) {
      return { isValid: false, message: 'Dấu ngoặc nhọn { } trong biểu thức LaTeX chưa đóng đủ' };
    }

    return { isValid: true };
  }

  /**
   * 4. Validate Specification Table (Bản đặc tả đề thi)
   * Matches curriculum learning outcomes with matrix slots.
   */
  static validateSpecificationTable(specTable, matrix) {
    const errors = [];
    const warnings = [];

    if (!specTable || !Array.isArray(specTable.rows) || specTable.rows.length === 0) {
      return { isValid: false, errors: ['Bản đặc tả rỗng hoặc không có dòng dữ liệu'], warnings: [] };
    }

    const matrixTotal = matrix?.metrics?.totalQuestions || matrix?.total_questions || 0;
    let specTotal = 0;

    specTable.rows.forEach((row, idx) => {
      if (!row.content_area && !row.topic_name) {
        errors.push(`Dòng ${idx + 1}: Thiếu tên nội dung kiến thức / đơn vị bài học`);
      }
      if (!row.learning_outcomes || row.learning_outcomes.length === 0) {
        warnings.push(`Dòng ${idx + 1} (${row.content_area || 'Chủ đề'}): Thiếu mô tả yêu cầu cần đạt (YCCĐ)`);
      }

      const rowQuestions = (row.NB || 0) + (row.TH || 0) + (row.VD || 0) + (row.VDC || 0);
      specTotal += rowQuestions;
    });

    if (matrixTotal > 0 && specTotal !== matrixTotal) {
      warnings.push(`Tổng số câu trong bản đặc tả (${specTotal}) khác với tổng số câu của ma trận (${matrixTotal})`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      specTotalQuestions: specTotal,
    };
  }

  /**
   * 5. Validate Complete Assembled Exam
   * Checks full exam paper integrity, question counts per part, and answer keys.
   */
  static validateExam(exam) {
    const errors = [];
    const warnings = [];

    if (!exam || typeof exam !== 'object') {
      return { isValid: false, errors: ['Dữ liệu đề thi không hợp lệ'], warnings: [] };
    }

    if (!exam.title || exam.title.trim().length === 0) {
      errors.push('Tiêu đề bài thi không được để trống');
    }

    if (!exam.time_minutes || exam.time_minutes <= 0) {
      errors.push('Thời gian làm bài thi phải lớn hơn 0 phút');
    }

    const questions = exam.questions || [];
    if (!Array.isArray(questions) || questions.length === 0) {
      errors.push('Đề thi chưa có câu hỏi nào');
      return { isValid: false, errors, warnings };
    }

    let hasPart1 = false;
    let hasPart2 = false;
    let hasPart3 = false;
    let totalScore = 0;

    questions.forEach((q, idx) => {
      const qNum = idx + 1;
      const qVal = ValidationService.validateQuestion(q);
      if (!qVal.isValid) {
        qVal.errors.forEach((e) => errors.push(`Câu ${qNum}: ${e}`));
      }
      qVal.warnings.forEach((w) => warnings.push(`Câu ${qNum}: ${w}`));

      if (q.part === 1) hasPart1 = true;
      if (q.part === 2) hasPart2 = true;
      if (q.part === 3) hasPart3 = true;

      totalScore += (q.score || 0.25);
    });

    if (!hasPart1 && !hasPart2 && !hasPart3) {
      warnings.push('Đề thi chưa phân bổ các phần I, II, III theo cấu trúc đổi mới của CV 7991');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      totalQuestions: questions.length,
      calculatedTotalScore: Math.round(totalScore * 100) / 100,
    };
  }
}

module.exports = ValidationService;
