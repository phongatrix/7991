/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  CV 7991 – Matrix Generator                                  ║
 * ║  Chuyển đổi DocumentStructure → Ma trận đề thi CV 7991       ║
 * ║  Version: 1.0  |  BGDĐT 2024                                 ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * Pipeline:
 *   DocumentStructure (from Python processor)
 *     → Bloom Taxonomy Mapping
 *     → CV 7991 Matrix (4 cognitive levels × N topics)
 *     → Question Slots (with SGK page references)
 *     → Matrix JSON output
 */

'use strict';

// ══════════════════════════════════════════════════════════
// CONSTANTS & CONFIG
// ══════════════════════════════════════════════════════════

/** Bloom's Taxonomy levels theo CV 7991 */
const COGNITIVE_LEVELS = Object.freeze({
  NHAN_BIET:   { code: 'NB',  label: 'Nhận biết',    bloom: 1, weight: 0.30, color: '#1E88E5' },
  THONG_HIEU:  { code: 'TH',  label: 'Thông hiểu',   bloom: 2, weight: 0.20, color: '#4CAF50' },
  VAN_DUNG:    { code: 'VD',  label: 'Vận dụng',     bloom: 3, weight: 0.40, color: '#F97316' },
  VAN_DUNG_CAO:{ code: 'VDC', label: 'Vận dụng cao', bloom: 4, weight: 0.10, color: '#EF4444' },
});

/** Phân phối mặc định theo loại đề (minutes → config) */
const EXAM_PRESETS = Object.freeze({
  '15min': { totalQ: 12,  tnQ: 12, tlQ: 0,  totalScore: 10 },
  '45min': { totalQ: 28,  tnQ: 24, tlQ: 4,  totalScore: 10 },
  '90min': { totalQ: 36,  tnQ: 28, tlQ: 8,  totalScore: 10 },
  '150min':{ totalQ: 50,  tnQ: 40, tlQ: 10, totalScore: 10 },
});

/** Keyword maps cho mỗi cognitive level */
const LEVEL_KEYWORDS = {
  NHAN_BIET: [
    'nhận biết', 'liệt kê', 'xác định', 'gọi tên', 'định nghĩa',
    'nêu', 'kể', 'cho biết', 'phát biểu', 'trình bày khái niệm',
    'thuộc lòng', 'nhớ lại', 'nhắc lại',
  ],
  THONG_HIEU: [
    'giải thích', 'mô tả', 'so sánh', 'phân biệt', 'tóm tắt',
    'phát biểu lại', 'diễn đạt', 'trình bày', 'cho ví dụ',
    'hiểu được', 'phân tích sơ bộ',
  ],
  VAN_DUNG: [
    'áp dụng', 'giải', 'tính', 'chứng minh', 'vận dụng',
    'sử dụng', 'thực hiện', 'xây dựng', 'phân tích', 'đánh giá',
    'lập luận', 'nhận xét kết quả',
  ],
  VAN_DUNG_CAO: [
    'sáng tạo', 'thiết kế', 'đề xuất', 'tổng hợp', 'đánh giá phê phán',
    'mở rộng', 'khái quát', 'biến đổi sáng tạo', 'bài toán thực tế',
    'vận dụng cao', 'phức hợp',
  ],
};


// ══════════════════════════════════════════════════════════
// TOPIC MAPPER – SGK lesson → CV 7991 matrix topic
// ══════════════════════════════════════════════════════════

class TopicMapper {
  /**
   * Ánh xạ danh sách bài học từ SGK sang các chủ đề (topics)
   * trong ma trận CV 7991. Có thể gộp nhiều bài vào 1 chủ đề.
   *
   * @param {Array} lessons - Mảng LessonEntry từ DocumentStructure
   * @param {Object} options
   * @returns {Array<MatrixTopic>}
   */
  static mapLessonsToTopics(lessons, options = {}) {
    const { groupByChapter = false, maxTopics = 8 } = options;

    if (groupByChapter) {
      return this._groupByChapter(lessons, maxTopics);
    }
    return this._mapDirectly(lessons, maxTopics);
  }

  static _mapDirectly(lessons, maxTopics) {
    const topics = lessons.slice(0, maxTopics).map((les, idx) => ({
      topic_id:      `topic_${idx + 1}`,
      topic_name:    `${les.lesson_name}`,
      chapter_ref:   `Chương ${les.chapter_number}`,
      lesson_numbers:[les.lesson_number],
      page_range:    [les.start_page, les.end_page],
      key_concepts:  les.key_concepts || [],
      learning_objectives: les.learning_objectives || [],
      content_weight: 1 / Math.min(lessons.length, maxTopics),
    }));
    return topics;
  }

  static _groupByChapter(lessons, maxTopics) {
    const chapterMap = new Map();
    for (const les of lessons) {
      const key = les.chapter_number;
      if (!chapterMap.has(key)) {
        chapterMap.set(key, {
          topic_id:    `topic_ch${key}`,
          topic_name:  les.chapter_name,
          chapter_ref: `Chương ${key}`,
          lesson_numbers: [],
          page_range:  [les.start_page, les.end_page],
          key_concepts: [],
          learning_objectives: [],
        });
      }
      const topic = chapterMap.get(key);
      topic.lesson_numbers.push(les.lesson_number);
      topic.page_range[1] = Math.max(topic.page_range[1], les.end_page);
      topic.key_concepts.push(...(les.key_concepts || []));
      topic.learning_objectives.push(...(les.learning_objectives || []));
    }

    const topics = [...chapterMap.values()].slice(0, maxTopics);
    topics.forEach(t => {
      t.content_weight = 1 / topics.length;
      t.key_concepts = [...new Set(t.key_concepts)].slice(0, 10);
      t.learning_objectives = [...new Set(t.learning_objectives)].slice(0, 8);
    });
    return topics;
  }
}


// ══════════════════════════════════════════════════════════
// QUESTION SLOT – một ô trong ma trận
// ══════════════════════════════════════════════════════════

class QuestionSlot {
  /**
   * @param {string} topic_id
   * @param {string} level_code  - NB | TH | VD | VDC
   * @param {string} type        - TN | TL
   * @param {number} count       - số câu hỏi
   * @param {Object} pageRef     - { start_page, end_page, lesson_number }
   */
  constructor(topic_id, level_code, type, count, pageRef = {}) {
    this.slot_id      = `${topic_id}_${level_code}_${type}`;
    this.topic_id     = topic_id;
    this.level        = COGNITIVE_LEVELS[this._lookupLevel(level_code)];
    this.type         = type;  // TN | TL
    this.count        = count;
    this.score_each   = type === 'TN' ? 0.25 : null; // TL determined by matrix
    this.score_total  = type === 'TN' ? count * 0.25 : null;
    this.page_ref     = pageRef;
    this.sgk_reference = pageRef.lesson_name
      ? `Bài ${pageRef.lesson_number}. ${pageRef.lesson_name} (tr.${pageRef.start_page}–${pageRef.end_page})`
      : null;
    this.prompt_hint  = this._buildPromptHint();
  }

  _lookupLevel(code) {
    const map = { NB: 'NHAN_BIET', TH: 'THONG_HIEU', VD: 'VAN_DUNG', VDC: 'VAN_DUNG_CAO' };
    return map[code] || 'NHAN_BIET';
  }

  _buildPromptHint() {
    const keywords = LEVEL_KEYWORDS[this._lookupLevel(this.level?.code)] || [];
    return `Tạo câu hỏi ${this.type} mức ${this.level?.label} – dùng động từ: ${keywords.slice(0, 4).join(', ')}`;
  }

  toJSON() {
    return {
      slot_id:       this.slot_id,
      topic_id:      this.topic_id,
      cognitive_level: {
        code:   this.level?.code,
        label:  this.level?.label,
        bloom:  this.level?.bloom,
      },
      question_type:  this.type,
      question_count: this.count,
      score_each:     this.score_each,
      score_total:    this.score_total,
      sgk_reference:  this.sgk_reference,
      page_ref:       this.page_ref,
      prompt_hint:    this.prompt_hint,
    };
  }
}


// ══════════════════════════════════════════════════════════
// MATRIX GENERATOR (main class)
// ══════════════════════════════════════════════════════════

class MatrixGenerator {
  /**
   * Sinh ma trận đề thi CV 7991 từ DocumentStructure
   *
   * @param {Object} options
   *   - examType: '45min' | '90min' | '150min' | '15min'
   *   - distribution: { NB, TH, VD, VDC } – override default weights
   *   - tnRatio: 0.7  – tỷ lệ trắc nghiệm
   *   - groupByChapter: false
   *   - maxTopics: 8
   */
  constructor(options = {}) {
    this.examType       = options.examType      || '45min';
    this.tnRatio        = options.tnRatio       || 0.7;
    this.groupByChapter = options.groupByChapter || false;
    this.maxTopics      = options.maxTopics      || 8;
    this.customDist     = options.distribution  || null;
    this.preset         = EXAM_PRESETS[this.examType] || EXAM_PRESETS['45min'];
  }

  // ── Main entry point ──────────────────────────────────────

  /**
   * @param {Object} documentStructure - từ document_processor.py (JSON)
   * @returns {CV7991Matrix}
   */
  generateFromDocument(documentStructure) {
    const allLessons = this._extractAllLessons(documentStructure);
    const topics     = TopicMapper.mapLessonsToTopics(allLessons, {
      groupByChapter: this.groupByChapter,
      maxTopics: this.maxTopics,
    });

    return this.generateFromTopics(topics, documentStructure.metadata);
  }

  /**
   * @param {Array} topics - [{topic_name, page_range, lesson_numbers, ...}]
   * @param {Object} docMeta - document metadata
   * @returns {CV7991Matrix}
   */
  generateFromTopics(topics, docMeta = {}) {
    const distribution = this._resolveDistribution();
    const rows         = this._buildRows(topics, distribution);
    const summary      = this._buildSummary(rows);
    const tlScoreMap   = this._distributeTLScores(rows);

    // Apply TL scores
    rows.forEach(row => {
      row.slots.forEach(slot => {
        if (slot.type === 'TL') {
          const key = `${slot.topic_id}_${slot.level?.code}`;
          slot.score_each  = tlScoreMap[key] || 1.0;
          slot.score_total = slot.count * slot.score_each;
        }
      });
    });

    return {
      matrix_id:    `matrix_${Date.now()}`,
      version:      '1.0',
      standard:     'CV 7991/BGDĐT-GDTr 2024',
      created_at:   new Date().toISOString(),
      exam_config: {
        exam_type:    this.examType,
        total_questions: this.preset.totalQ,
        tn_questions:    this.preset.tnQ,
        tl_questions:    this.preset.tlQ,
        total_score:     this.preset.totalScore,
        tn_ratio:        this.tnRatio,
      },
      document_metadata: docMeta,
      cognitive_distribution: distribution,
      topics,
      rows,
      summary,
      validation: this._validate(summary),
      prompt_context: this._buildPromptContext(rows, topics),
    };
  }

  // ── Distribution ──────────────────────────────────────────

  _resolveDistribution() {
    if (this.customDist) return this.customDist;
    return {
      NB:  { weight: 0.30, tn_share: 1.0,  tl_share: 0.0 },
      TH:  { weight: 0.20, tn_share: 0.85, tl_share: 0.15 },
      VD:  { weight: 0.40, tn_share: 0.65, tl_share: 0.35 },
      VDC: { weight: 0.10, tn_share: 0.30, tl_share: 0.70 },
    };
  }

  // ── Row builder ───────────────────────────────────────────

  _buildRows(topics, distribution) {
    const totalTN = this.preset.tnQ;
    const totalTL = this.preset.tlQ;
    const nTopics  = topics.length;

    return topics.map((topic, idx) => {
      // Weight topic by content (equal by default, can be overridden)
      const topicWeight = topic.content_weight || (1 / nTopics);
      const slots = [];

      let topicTN = 0, topicTL = 0;

      for (const [levelCode, levelDist] of Object.entries(distribution)) {
        const levelWeight = levelDist.weight;
        const baseTN = Math.round(totalTN * levelWeight * topicWeight);
        const baseTL = Math.round(totalTL * levelWeight * topicWeight);

        const tnCount = Math.max(0, baseTN);
        const tlCount = Math.max(0, baseTL);

        if (tnCount > 0) {
          slots.push(new QuestionSlot(
            topic.topic_id, levelCode, 'TN', tnCount,
            { start_page: topic.page_range[0], end_page: topic.page_range[1],
              lesson_numbers: topic.lesson_numbers }
          ));
          topicTN += tnCount;
        }
        if (tlCount > 0) {
          slots.push(new QuestionSlot(
            topic.topic_id, levelCode, 'TL', tlCount,
            { start_page: topic.page_range[0], end_page: topic.page_range[1],
              lesson_numbers: topic.lesson_numbers }
          ));
          topicTL += tlCount;
        }
      }

      return {
        row_id:    topic.topic_id,
        topic_name: topic.topic_name,
        chapter_ref: topic.chapter_ref,
        page_range: topic.page_range,
        lesson_numbers: topic.lesson_numbers,
        key_concepts: (topic.key_concepts || []).slice(0, 5),
        slots: slots.map(s => s.toJSON()),
        row_total_tn: topicTN,
        row_total_tl: topicTL,
        row_total: topicTN + topicTL,
      };
    });
  }

  // ── Summary ───────────────────────────────────────────────

  _buildSummary(rows) {
    const totals = { NB_TN:0, NB_TL:0, TH_TN:0, TH_TL:0, VD_TN:0, VD_TL:0, VDC_TN:0, VDC_TL:0 };
    let grandTotal = 0;

    rows.forEach(row => {
      row.slots.forEach(slot => {
        const key = `${slot.cognitive_level.code}_${slot.question_type}`;
        if (totals[key] !== undefined) totals[key] += slot.question_count;
        grandTotal += slot.question_count;
      });
    });

    return {
      ...totals,
      total_TN: totals.NB_TN + totals.TH_TN + totals.VD_TN + totals.VDC_TN,
      total_TL: totals.NB_TL + totals.TH_TL + totals.VD_TL + totals.VDC_TL,
      grand_total: grandTotal,
      score_TN: (totals.NB_TN + totals.TH_TN + totals.VD_TN + totals.VDC_TN) * 0.25,
      score_TL: this.preset.totalScore - (totals.NB_TN + totals.TH_TN + totals.VD_TN + totals.VDC_TN) * 0.25,
    };
  }

  _distributeTLScores(rows) {
    const tlSlots = rows.flatMap(r => r.slots.filter(s => s.question_type === 'TL'));
    const totalTLScore = this.preset.totalScore - this.preset.tnQ * 0.25;
    const scorePerSlot = tlSlots.length ? (totalTLScore / tlSlots.length) : 1.0;
    const result = {};
    tlSlots.forEach(slot => {
      result[`${slot.topic_id}_${slot.cognitive_level.code}`] = Math.round(scorePerSlot * 100) / 100;
    });
    return result;
  }

  // ── Validation ────────────────────────────────────────────

  _validate(summary) {
    const errors = [];
    const warnings = [];

    if (summary.grand_total !== this.preset.totalQ) {
      warnings.push(`Tổng câu hỏi ${summary.grand_total} ≠ mục tiêu ${this.preset.totalQ} (làm tròn)`);
    }
    if (summary.total_TN !== this.preset.tnQ) {
      warnings.push(`TN: ${summary.total_TN} ≠ mục tiêu ${this.preset.tnQ}`);
    }
    if (summary.score_TN + summary.score_TL > 10.5) {
      errors.push(`Tổng điểm ${(summary.score_TN + summary.score_TL).toFixed(2)} > 10!`);
    }

    const nbPct = (summary.NB_TN + summary.NB_TL) / summary.grand_total;
    if (nbPct < 0.20 || nbPct > 0.45) {
      warnings.push(`Tỷ lệ NB ${(nbPct*100).toFixed(0)}% ngoài khuyến nghị (20–45%)`);
    }

    return {
      is_valid: errors.length === 0,
      errors,
      warnings,
      compliance: `CV 7991/BGDĐT-GDTr 2024 – ${errors.length === 0 ? '✓ Đạt chuẩn' : '✗ Cần điều chỉnh'}`,
    };
  }

  // ── Prompt Context ────────────────────────────────────────

  _buildPromptContext(rows, topics) {
    return {
      instruction: 'Sử dụng context này để generate câu hỏi theo từng slot',
      slots: rows.flatMap(row =>
        row.slots.map(slot => ({
          slot_id:      slot.slot_id,
          topic:        row.topic_name,
          level:        slot.cognitive_level.label,
          type:         slot.question_type,
          count:        slot.question_count,
          page_ref:     slot.page_ref,
          sgk_ref:      slot.sgk_reference,
          prompt_hint:  slot.prompt_hint,
          keywords:     LEVEL_KEYWORDS[
            { NB:'NHAN_BIET', TH:'THONG_HIEU', VD:'VAN_DUNG', VDC:'VAN_DUNG_CAO' }[slot.cognitive_level.code]
          ]?.slice(0, 4) || [],
        }))
      ),
    };
  }

  // ── Helpers ───────────────────────────────────────────────

  _extractAllLessons(doc) {
    const lessons = [];
    for (const chapter of doc.chapters || []) {
      for (const lesson of chapter.lessons || []) {
        lessons.push({
          ...lesson,
          chapter_number: chapter.chapter_number,
          chapter_name:   chapter.chapter_name,
        });
      }
    }
    return lessons;
  }
}


// ══════════════════════════════════════════════════════════
// MATRIX VALIDATOR (standalone)
// ══════════════════════════════════════════════════════════

class MatrixValidator {
  /**
   * Kiểm tra ma trận CV 7991 theo các quy tắc chuẩn
   */
  static validate(matrix) {
    const results = {
      passed: [],
      failed: [],
      warnings: [],
      score: 0,
    };

    const checks = [
      this._checkTotalQuestions,
      this._checkCognitiveLevelBalance,
      this._checkTNTLRatio,
      this._checkTopicCoverage,
      this._checkSGKAlignment,
      this._checkScoreDistribution,
    ];

    for (const check of checks) {
      const result = check.call(this, matrix);
      if (result.pass) results.passed.push(result);
      else if (result.warn) results.warnings.push(result);
      else results.failed.push(result);
    }

    results.score = Math.round(results.passed.length / checks.length * 100);
    results.is_valid = results.failed.length === 0;
    return results;
  }

  static _checkTotalQuestions(matrix) {
    const actual = matrix.summary?.grand_total || 0;
    const target = matrix.exam_config?.total_questions || 0;
    const diff = Math.abs(actual - target);
    return {
      rule: 'TOTAL_QUESTIONS',
      label: 'Tổng số câu hỏi',
      pass: diff <= 2,
      warn: diff > 2 && diff <= 5,
      detail: `Thực tế: ${actual}, Mục tiêu: ${target}`,
    };
  }

  static _checkCognitiveLevelBalance(matrix) {
    const s = matrix.summary || {};
    const total = s.grand_total || 1;
    const nbPct  = ((s.NB_TN  + s.NB_TL)  / total) * 100;
    const thPct  = ((s.TH_TN  + s.TH_TL)  / total) * 100;
    const vdPct  = ((s.VD_TN  + s.VD_TL)  / total) * 100;
    const vdcPct = ((s.VDC_TN + s.VDC_TL) / total) * 100;
    const ok = nbPct >= 25 && thPct >= 15 && vdPct >= 15 && vdcPct >= 5;
    return {
      rule:   'COGNITIVE_BALANCE',
      label:  'Phân bố mức nhận thức',
      pass:   ok,
      detail: `NB:${nbPct.toFixed(0)}% TH:${thPct.toFixed(0)}% VD:${vdPct.toFixed(0)}% VDC:${vdcPct.toFixed(0)}%`,
    };
  }

  static _checkTNTLRatio(matrix) {
    const s = matrix.summary || {};
    const total = s.grand_total || 1;
    const tnPct = (s.total_TN / total) * 100;
    return {
      rule:   'TN_TL_RATIO',
      label:  'Tỷ lệ TN/TL',
      pass:   tnPct >= 60 && tnPct <= 85,
      warn:   tnPct >= 85 && tnPct <= 95,
      detail: `TN: ${tnPct.toFixed(0)}%  TL: ${(100-tnPct).toFixed(0)}%`,
    };
  }

  static _checkTopicCoverage(matrix) {
    const minTopics = 3;
    const actual = matrix.topics?.length || 0;
    return {
      rule:   'TOPIC_COVERAGE',
      label:  'Phủ đủ chủ đề SGK',
      pass:   actual >= minTopics,
      detail: `${actual} chủ đề được bao phủ`,
    };
  }

  static _checkSGKAlignment(matrix) {
    const rows = matrix.rows || [];
    const aligned = rows.filter(r => r.page_range?.[0] > 0).length;
    const ratio = rows.length ? aligned / rows.length : 0;
    return {
      rule:   'SGK_ALIGNMENT',
      label:  'Liên kết trang SGK',
      pass:   ratio >= 0.8,
      warn:   ratio >= 0.5,
      detail: `${aligned}/${rows.length} chủ đề có liên kết trang SGK`,
    };
  }

  static _checkScoreDistribution(matrix) {
    const s = matrix.summary || {};
    const total = (s.score_TN || 0) + (s.score_TL || 0);
    return {
      rule:   'SCORE_DISTRIBUTION',
      label:  'Tổng điểm = 10',
      pass:   Math.abs(total - 10) <= 0.5,
      detail: `Tổng: ${total.toFixed(2)} điểm`,
    };
  }
}


// ══════════════════════════════════════════════════════════
// MATRIX FORMATTER – chuyển đổi sang các định dạng khác
// ══════════════════════════════════════════════════════════

class MatrixFormatter {
  /**
   * Chuyển ma trận sang dạng table HTML để hiển thị
   */
  static toHTML(matrix) {
    const rows  = matrix.rows || [];
    const levels = ['NB', 'TH', 'VD', 'VDC'];
    const labels = { NB:'Nhận biết', TH:'Thông hiểu', VD:'Vận dụng', VDC:'VD cao' };

    const bodyRows = rows.map(row => {
      const cells = levels.map(lv => {
        const tnSlot = row.slots.find(s => s.cognitive_level.code === lv && s.question_type === 'TN');
        const tlSlot = row.slots.find(s => s.cognitive_level.code === lv && s.question_type === 'TL');
        return `<td>${tnSlot?.question_count ?? 0} | ${tlSlot?.question_count ?? 0}</td>`;
      });
      return `<tr>
        <td>${row.topic_name}</td>
        ${cells.join('')}
        <td><strong>${row.row_total}</strong></td>
      </tr>`;
    }).join('');

    return `<table border="1">
      <thead>
        <tr><th>Chủ đề</th>${levels.map(l => `<th>${labels[l]}<br/><small>TN | TL</small></th>`).join('')}<th>Tổng</th></tr>
      </thead>
      <tbody>${bodyRows}</tbody>
    </table>`;
  }

  /**
   * Chuyển sang flat array cho export Excel
   */
  static toFlatArray(matrix) {
    const flat = [];
    for (const row of (matrix.rows || [])) {
      for (const slot of (row.slots || [])) {
        flat.push({
          topic:         row.topic_name,
          chapter:       row.chapter_ref,
          page_start:    row.page_range?.[0],
          page_end:      row.page_range?.[1],
          level_code:    slot.cognitive_level.code,
          level_label:   slot.cognitive_level.label,
          question_type: slot.question_type,
          question_count: slot.question_count,
          score_each:    slot.score_each,
          score_total:   slot.score_total,
          sgk_reference: slot.sgk_reference,
          prompt_hint:   slot.prompt_hint,
        });
      }
    }
    return flat;
  }

  /**
   * Summary object cho frontend stats card
   */
  static toStatsSummary(matrix) {
    const s = matrix.summary || {};
    return {
      total_questions:  s.grand_total,
      tn_questions:     s.total_TN,
      tl_questions:     s.total_TL,
      score_tn:         s.score_TN?.toFixed(2),
      score_tl:         s.score_TL?.toFixed(2),
      total_score:      ((s.score_TN || 0) + (s.score_TL || 0)).toFixed(2),
      topic_count:      matrix.topics?.length,
      is_valid:         matrix.validation?.is_valid,
      compliance:       matrix.validation?.compliance,
      warnings:         matrix.validation?.warnings || [],
    };
  }
}


// ══════════════════════════════════════════════════════════
// EXPORTS (CommonJS + ESM compatible)
// ══════════════════════════════════════════════════════════

const cv7991Matrix = {
  MatrixGenerator,
  MatrixValidator,
  MatrixFormatter,
  TopicMapper,
  QuestionSlot,
  COGNITIVE_LEVELS,
  EXAM_PRESETS,
  LEVEL_KEYWORDS,
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = cv7991Matrix;
}
if (typeof window !== 'undefined') {
  window.CV7991Matrix = cv7991Matrix;
}


// ══════════════════════════════════════════════════════════
// DEMO / QUICK TEST
// ══════════════════════════════════════════════════════════

if (typeof require !== 'undefined' && require.main === module) {
  // Mock DocumentStructure (normally from document_processor.py)
  const mockDocument = {
    document_id: 'doc_demo001',
    subject: 'math',
    grade: 10,
    total_pages: 120,
    chapters: [
      {
        chapter_number: 1,
        chapter_name: 'Mệnh đề và tập hợp',
        start_page: 5,
        end_page: 35,
        lessons: [
          { lesson_number:1, lesson_name:'Mệnh đề', chapter_number:1, chapter_name:'Mệnh đề và tập hợp', start_page:6, end_page:12, key_concepts:['Mệnh đề','Phủ định','Mệnh đề kéo theo'], learning_objectives:['Nhận biết mệnh đề','Phủ định mệnh đề'] },
          { lesson_number:2, lesson_name:'Tập hợp', chapter_number:1, chapter_name:'Mệnh đề và tập hợp', start_page:13, end_page:22, key_concepts:['Tập hợp con','Hợp','Giao','Hiệu'], learning_objectives:['Xác định tập hợp con','Thực hiện các phép toán tập hợp'] },
          { lesson_number:3, lesson_name:'Các phép toán tập hợp', chapter_number:1, chapter_name:'Mệnh đề và tập hợp', start_page:23, end_page:35, key_concepts:['Bù','Đối xứng'], learning_objectives:['Áp dụng phép toán tập hợp'] },
        ],
      },
      {
        chapter_number: 2,
        chapter_name: 'Bất phương trình và hệ bất phương trình',
        start_page: 36,
        end_page: 70,
        lessons: [
          { lesson_number:4, lesson_name:'Bất phương trình bậc nhất một ẩn', chapter_number:2, chapter_name:'Bất phương trình', start_page:37, end_page:48, key_concepts:['BPT bậc nhất','Tập nghiệm'], learning_objectives:['Giải BPT bậc nhất'] },
          { lesson_number:5, lesson_name:'Hệ bất phương trình bậc nhất', chapter_number:2, chapter_name:'Bất phương trình', start_page:49, end_page:60, key_concepts:['Hệ BPT'], learning_objectives:['Giải hệ BPT'] },
        ],
      },
    ],
    metadata: { total_lessons: 5, total_chapters: 2 },
  };

  const generator = new MatrixGenerator({ examType: '45min', tnRatio: 0.7 });
  const matrix    = generator.generateFromDocument(mockDocument);
  const validation = MatrixValidator.validate(matrix);
  const stats     = MatrixFormatter.toStatsSummary(matrix);

  console.log('\n══ CV 7991 Matrix Generated ══');
  console.log(JSON.stringify(stats, null, 2));
  console.log('\n── Validation ──');
  console.log(JSON.stringify(validation, null, 2));
  console.log(`\n✓ Matrix ID: ${matrix.matrix_id}`);
  console.log(`✓ Topics: ${matrix.topics.length}`);
  console.log(`✓ Total Q: ${matrix.summary.grand_total}`);
  console.log(`✓ Compliance: ${matrix.validation.compliance}`);
}
