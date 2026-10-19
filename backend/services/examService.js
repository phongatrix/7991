/**
 * CV 7991 – Exam Service
 * Manages exam assembly, variant generation (mã đề 101, 102, 103, 104),
 * answer key matrix generation, and export preparation.
 */

'use strict';

const db = require('../database/connection');
const logger = require('../utils/logger');
const ValidationService = require('./validationService');

class ExamService {
  /**
   * Create an assembled exam paper from matrix and questions
   */
  async createExam(data, userId) {
    const {
      matrix_id,
      title = 'ĐỀ KIỂM TRA ĐỊNH KỲ THEO CÔNG VĂN 7991/BGDĐT-GDTr',
      subject = 'math',
      grade = 10,
      time_minutes = 45,
      school_name = 'SỞ GIÁO DỤC VÀ ĐÀO TẠO',
      variants_count = 4,
    } = data;

    const examId = require('uuid').v4();

    // Fetch questions associated with matrix
    let questions = [];
    try {
      const qRes = await db.query(
        `SELECT * FROM questions WHERE matrix_id = $1 ORDER BY created_at ASC`,
        [matrix_id]
      );
      questions = qRes.rows;
    } catch (_) {}

    if (questions.length === 0) {
      // Fallback sample questions if database is empty
      questions = this._generateSampleExamQuestions(subject, grade);
    }

    // Build the master exam
    const masterExam = {
      exam_id: examId,
      title,
      subject,
      grade,
      time_minutes,
      school_name,
      matrix_id,
      questions,
      total_questions: questions.length,
      total_score: 10.0,
      created_at: new Date().toISOString(),
    };

    // Validate master exam
    const validation = ValidationService.validateExam(masterExam);
    masterExam.validation = validation;

    // Generate Exam Variants (Mã đề: 101, 102, 103, 104)
    const variants = this.generateVariants(masterExam, variants_count);
    masterExam.variants = variants;

    // Persist master exam to DB
    const sql = `
      INSERT INTO exams (
        id, user_id, matrix_id, title, subject, grade,
        duration_minutes, total_questions, total_score, exam_data,
        created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW()
      )
      RETURNING *;
    `;

    try {
      const res = await db.query(sql, [
        examId,
        userId,
        matrix_id,
        title,
        subject,
        grade,
        time_minutes,
        questions.length,
        10.0,
        JSON.stringify(masterExam),
      ]);
      return res.rows[0];
    } catch (err) {
      logger.warn(`Failed to insert exam into DB: ${err.message}. Returning in-memory exam.`);
      return {
        id: examId,
        user_id: userId,
        title,
        exam_data: masterExam,
      };
    }
  }

  /**
   * Generates multiple exam variants (Mã đề) with shuffled questions and options
   * Keeps structure within parts (Part I: Multiple choice, Part II: True/False, Part III: Short answer)
   */
  generateVariants(masterExam, count = 4) {
    const variantCodes = [101, 102, 103, 104, 105, 106, 107, 108].slice(0, count);
    const variants = [];

    const part1 = (masterExam.questions || []).filter((q) => !q.part || q.part === 1);
    const part2 = (masterExam.questions || []).filter((q) => q.part === 2);
    const part3 = (masterExam.questions || []).filter((q) => q.part === 3);
    const part4 = (masterExam.questions || []).filter((q) => q.part === 4 || q.question_type === 'TL');

    variantCodes.forEach((code, index) => {
      // Seeded shuffle for reproducible variants
      const shuffledP1 = this._shuffleArray([...part1], code + 17);
      const shuffledP2 = this._shuffleArray([...part2], code + 31);
      const shuffledP3 = this._shuffleArray([...part3], code + 43);

      // Shuffle options for multiple choice questions
      const finalP1 = shuffledP1.map((q, qIdx) => {
        const shuffledOpts = this._shuffleOptions(q.options, q.correct_answer, code + qIdx);
        return {
          ...q,
          question_number: qIdx + 1,
          options: shuffledOpts.options,
          correct_answer: shuffledOpts.correctAnswer,
        };
      });

      const finalP2 = shuffledP2.map((q, qIdx) => ({
        ...q,
        question_number: finalP1.length + qIdx + 1,
      }));

      const finalP3 = shuffledP3.map((q, qIdx) => ({
        ...q,
        question_number: finalP1.length + finalP2.length + qIdx + 1,
      }));

      const finalQuestions = [...finalP1, ...finalP2, ...finalP3, ...part4];

      // Build Answer Key Matrix
      const answerKey = {};
      finalQuestions.forEach((q) => {
        answerKey[q.question_number] = q.correct_answer || 'Xem đáp án tự luận';
      });

      variants.push({
        variant_code: code,
        title: `${masterExam.title} - Mã đề ${code}`,
        questions: finalQuestions,
        answer_key: answerKey,
      });
    });

    return variants;
  }

  _shuffleArray(arr, seed) {
    const copy = [...arr];
    let m = copy.length;
    let t, i;
    while (m) {
      seed = (seed * 9301 + 49297) % 233280;
      const rnd = seed / 233280;
      i = Math.floor(rnd * m--);
      t = copy[m];
      copy[m] = copy[i];
      copy[i] = t;
    }
    return copy;
  }

  _shuffleOptions(options, originalCorrect, seed) {
    if (!Array.isArray(options) || options.length === 0) {
      return { options: [], correctAnswer: originalCorrect };
    }

    const correctContent = options.find(
      (o) => (o.key || '').toUpperCase() === (originalCorrect || '').toUpperCase()
    )?.text;

    const shuffled = this._shuffleArray(options, seed);
    const standardKeys = ['A', 'B', 'C', 'D'];

    let newCorrect = 'A';
    const remapped = shuffled.map((opt, idx) => {
      const key = standardKeys[idx] || String.fromCharCode(65 + idx);
      if (opt.text === correctContent) {
        newCorrect = key;
      }
      return { key, text: opt.text };
    });

    return { options: remapped, correctAnswer: newCorrect };
  }

  _generateSampleExamQuestions(subject = 'informatics', grade = 10) {
    return [
      {
        question_number: 1,
        part: 1,
        document_id: '33333333-3333-3333-3333-333333333333',
        page_number: 18,
        sgk_page_reference: 18,
        question_text: 'Câu 1. [SGK Tin học 10 - Trang 18] Thiết bị nào sau đây đóng vai trò định tuyến và chuyển tiếp các gói tin giữa các mạng máy tính khác nhau?',
        question_type: 'TN',
        cognitive_level: 'NB',
        textbook_excerpt: 'Trang 18: Router (thiết bị định tuyến) kết nối các mạng và chuyển tiếp dữ liệu dựa trên địa chỉ IP đích.',
        options: [
          { key: 'A', text: 'Router (Thiết bị định tuyến)' },
          { key: 'B', text: 'Switch (Bộ chuyển mạch)' },
          { key: 'C', text: 'Hub (Bộ chia tín hiệu)' },
          { key: 'D', text: 'Cáp xoắn đôi' },
        ],
        correct_answer: 'A',
        score: 0.25,
      },
      {
        question_number: 2,
        part: 1,
        document_id: '33333333-3333-3333-3333-333333333333',
        page_number: 25,
        sgk_page_reference: 25,
        question_text: 'Câu 2. [SGK Tin học 10 - Trang 25] Trong ngôn ngữ lập trình Python, kết quả của phép toán `19 // 4` và `19 % 4` lần lượt là:',
        question_type: 'TN',
        cognitive_level: 'TH',
        textbook_excerpt: 'Trang 25: Toán tử // chia lấy phần nguyên (19 // 4 = 4), toán tử % chia lấy phần dư (19 % 4 = 3).',
        options: [
          { key: 'A', text: '4 và 3' },
          { key: 'B', text: '4.75 và 3' },
          { key: 'C', text: '3 và 4' },
          { key: 'D', text: '4 và 0.75' },
        ],
        correct_answer: 'A',
        score: 0.25,
      },
      {
        question_number: 3,
        part: 1,
        document_id: '33333333-3333-3333-3333-333333333333',
        page_number: 32,
        sgk_page_reference: 32,
        question_text: 'Câu 3. [SGK Tin học 10 - Trang 32] Tên biến nào sau đây là HỢP LỆ trong ngôn ngữ Python?',
        question_type: 'TN',
        cognitive_level: 'NB',
        textbook_excerpt: 'Trang 32: Tên biến hợp lệ chỉ gồm chữ cái, chữ số và dấu gạch dưới _, không bắt đầu bằng chữ số, không trùng từ khóa.',
        options: [
          { key: 'A', text: '_diem_trung_binh' },
          { key: 'B', text: '2nd_score' },
          { key: 'C', text: 'class' },
          { key: 'D', text: 'diem trung binh' },
        ],
        correct_answer: 'A',
        score: 0.25,
      },
      {
        question_number: 4,
        part: 1,
        document_id: '33333333-3333-3333-3333-333333333333',
        page_number: 48,
        sgk_page_reference: 48,
        question_text: 'Câu 4. [SGK Tin học 10 - Trang 48] Cho đoạn mã sau trong Python:\n```python\na = 15\nb = 4\nif a % b == 3:\n    res = a * 2\nelse:\n    res = a + b\nprint(res)\n```\nGiá trị in ra màn hình là:',
        question_type: 'TN',
        cognitive_level: 'TH',
        textbook_excerpt: 'Trang 48: 15 % 4 = 3, điều kiện nhánh if đúng nên thực hiện res = 15 * 2 = 30.',
        options: [
          { key: 'A', text: '30' },
          { key: 'B', text: '19' },
          { key: 'C', text: '60' },
          { key: 'D', text: '3' },
        ],
        correct_answer: 'A',
        score: 0.25,
      },
      {
        question_number: 5,
        part: 2,
        document_id: '33333333-3333-3333-3333-333333333333',
        page_number: 65,
        sgk_page_reference: 65,
        question_text: 'Câu 5. [SGK Tin học 10 - Trang 65] Cho bài toán tính tổng các số chẵn trong đoạn $[1; 10]$. Xét tính Đúng/Sai của các mệnh đề sau:',
        question_type: 'TN',
        cognitive_level: 'VD',
        textbook_excerpt: 'Trang 65: Vòng lặp range(2, 11, 2) sinh dãy 2, 4, 6, 8, 10. Tổng các số chẵn là 2 + 4 + 6 + 8 + 10 = 30.',
        statements: [
          { text: 'a) Vòng lặp `for i in range(2, 11, 2):` duyệt qua chính xác 5 số chẵn', is_true: true },
          { text: 'b) Biểu thức `range(1, 10)` bao gồm cả giá trị 10', is_true: false },
          { text: 'c) Giá trị tổng các số chẵn từ 1 đến 10 tính được là 30', is_true: true },
          { text: 'd) Câu lệnh `range(2, 10, 2)` duyệt đủ cả số 10', is_true: false },
        ],
        score: 1.0,
      },
      {
        question_number: 6,
        part: 2,
        document_id: '33333333-3333-3333-3333-333333333333',
        page_number: 84,
        sgk_page_reference: 84,
        question_text: 'Câu 6. [SGK Tin học 10 - Trang 84] Cho danh sách `ds = [10, 25, 30, 45, 50]`. Xét tính Đúng/Sai của các phát biểu về xử lý dữ liệu trong Python:',
        question_type: 'TN',
        cognitive_level: 'VD',
        textbook_excerpt: 'Trang 84: Phần tử đầu ds[0] = 10, phần tử cuối ds[-1] = 50. Độ dài danh sách len(ds) = 5.',
        statements: [
          { text: 'a) Phần tử `ds[0]` có giá trị là 10', is_true: true },
          { text: 'b) Phần tử cuối cùng của danh sách có chỉ số là `ds[-1]`', is_true: true },
          { text: 'c) Câu lệnh `ds.append(60)` sẽ loại bỏ phần tử đầu tiên', is_true: false },
          { text: 'd) Biểu thức `len(ds)` trả về giá trị là 6 khi chưa thêm phần tử mới', is_true: false },
        ],
        score: 1.0,
      },
      {
        question_number: 7,
        part: 3,
        document_id: '33333333-3333-3333-3333-333333333333',
        page_number: 72,
        sgk_page_reference: 72,
        question_text: 'Câu 7. [SGK Tin học 10 - Trang 72] Cho đoạn chương trình sau:\n```python\ns = 0\nfor k in range(1, 6):\n    s += k * 2\nprint(s)\n```\nHãy nhập giá trị hiển thị trên màn hình.',
        question_type: 'TL',
        cognitive_level: 'VD',
        textbook_excerpt: 'Trang 72: Với k = 1..5: s = 2 + 4 + 6 + 8 + 10 = 30.',
        correct_answer: '30',
        score: 0.75,
      },
      {
        question_number: 8,
        part: 3,
        document_id: '33333333-3333-3333-3333-333333333333',
        page_number: 95,
        sgk_page_reference: 95,
        question_text: 'Câu 8. [SGK Tin học 10 - Trang 95] Cho xâu `st = "Python 2026"`. Hãy cho biết giá trị trả về của `len(st)` (kể cả dấu cách).',
        question_type: 'TL',
        cognitive_level: 'TH',
        textbook_excerpt: 'Trang 95: Hàm len() trả về tổng số ký tự trong xâu kể cả dấu cách. Xâu "Python 2026" gồm 11 ký tự.',
        correct_answer: '11',
        score: 0.75,
      },
    ];
    const s = (subject || 'informatics').toLowerCase();

    if (s === 'physics') {
      return [
        {
          question_number: 1,
          part: 1,
          document_id: '33333333-3333-3333-3333-333333333333',
          page_number: 28,
          sgk_page_reference: 28,
          question_text: 'Câu 1. [SGK Vật lí - Trang 28] Công thức tính vận tốc trong chuyển động thẳng biến đổi đều là:',
          question_type: 'TN',
          cognitive_level: 'NB',
          textbook_excerpt: 'Vận tốc tức thời trong chuyển động thẳng biến đổi đều: v = v0 + at',
          options: [{ key: 'A', text: '$v = v_0 + at$' }, { key: 'B', text: '$v = v_0 + \\frac{1}{2}at^2$' }, { key: 'C', text: '$v = at^2$' }, { key: 'D', text: '$v = v_0 - at$' }],
          correct_answer: 'A',
          score: 0.25,
        },
        {
          question_number: 2,
          part: 1,
          document_id: '33333333-3333-3333-3333-333333333333',
          page_number: 45,
          sgk_page_reference: 45,
          question_text: 'Câu 2. [SGK Vật lí - Trang 45] Một vật có khối lượng $m = 2\\text{ kg}$ chịu tác dụng của lực $F = 10\\text{ N}$. Gia tốc của vật là:',
          question_type: 'TN',
          cognitive_level: 'TH',
          textbook_excerpt: 'Định luật II Newton: Gia tốc của một vật cùng hướng với lực tác dụng: a = F/m',
          options: [{ key: 'A', text: '$5\\text{ m/s}^2$' }, { key: 'B', text: '$20\\text{ m/s}^2$' }, { key: 'C', text: '$2\\text{ m/s}^2$' }, { key: 'D', text: '$8\\text{ m/s}^2$' }],
          correct_answer: 'A',
          score: 0.25,
        },
        {
          question_number: 3,
          part: 2,
          document_id: '33333333-3333-3333-3333-333333333333',
          page_number: 62,
          sgk_page_reference: 62,
          question_text: 'Câu 3. [SGK Vật lí - Trang 62] Một vật trượt trên mặt phẳng nghiêng góc $\\alpha = 30^\\circ$ có ma sát. Xét tính đúng/sai của các mệnh đề sau:',
          question_type: 'TN',
          cognitive_level: 'VD',
          textbook_excerpt: 'Phân tích trọng lực trên mặt phẳng nghiêng thành thành phần tiếp tuyến P_t = mg sin(alpha) và pháp tuyến P_n = mg cos(alpha).',
          statements: [
            { text: 'a) Thành phần trọng lực kéo vật trượt xuống là $P_t = mg \\sin \\alpha$', is_true: true },
            { text: 'b) Áp lực của vật lên mặt phẳng nghiêng là $N = mg \\cos \\alpha$', is_true: true },
            { text: 'c) Lực ma sát trượt có độ lớn không phụ thuộc vào hệ số ma sát', is_true: false },
            { text: 'd) Gia tốc của vật luôn lớn hơn gia tốc rơi tự do $g$', is_true: false },
          ],
          score: 1.0,
        },
      ];
    }

    if (s === 'chemistry') {
      return [
        {
          question_number: 1,
          part: 1,
          document_id: '33333333-3333-3333-3333-333333333333',
          page_number: 18,
          sgk_page_reference: 18,
          question_text: 'Câu 1. [SGK Hóa học - Trang 18] Hạt mang điện tích dương trong hạt nhân nguyên tử là:',
          question_type: 'TN',
          cognitive_level: 'NB',
          textbook_excerpt: 'Hạt nhân nguyên tử gồm proton mang điện tích dương và neutron không mang điện.',
          options: [{ key: 'A', text: 'Proton' }, { key: 'B', text: 'Electron' }, { key: 'C', text: 'Neutron' }, { key: 'D', text: 'Positron' }],
          correct_answer: 'A',
          score: 0.25,
        },
        {
          question_number: 2,
          part: 1,
          document_id: '33333333-3333-3333-3333-333333333333',
          page_number: 36,
          sgk_page_reference: 36,
          question_text: 'Câu 2. [SGK Hóa học - Trang 36] Nguyên tố Clot ($Z = 17$) thuộc chu kì nào trong bảng tuần hoàn?',
          question_type: 'TN',
          cognitive_level: 'TH',
          textbook_excerpt: 'Số thứ tự chu kì bằng số lớp electron trong nguyên tử. Cl có 3 lớp electron nên thuộc chu kì 3.',
          options: [{ key: 'A', text: 'Chu kì 3' }, { key: 'B', text: 'Chu kì 2' }, { key: 'C', text: 'Chu kì 4' }, { key: 'D', text: 'Chu kì 7' }],
          correct_answer: 'A',
          score: 0.25,
        },
        {
          question_number: 3,
          part: 2,
          document_id: '33333333-3333-3333-3333-333333333333',
          page_number: 78,
          sgk_page_reference: 78,
          question_text: 'Câu 3. [SGK Hóa học - Trang 78] Cho phản ứng oxi hóa - khử: $\\text{Zn} + 2\\text{HCl} \\to \\text{ZnCl}_2 + \\text{H}_2$. Xét tính đúng/sai của các phát biểu:',
          question_type: 'TN',
          cognitive_level: 'VD',
          textbook_excerpt: 'Chất khử là chất nhường electron (số oxi hóa tăng). Chất oxi hóa là chất nhận electron (số oxi hóa giảm).',
          statements: [
            { text: 'a) $\\text{Zn}$ đóng vai trò là chất khử vì số oxi hóa tăng từ 0 lên +2', is_true: true },
            { text: 'b) $\\text{HCl}$ là chất oxi hóa', is_true: true },
            { text: 'c) Quá trình $\\text{Zn} \\to \\text{Zn}^{2+} + 2e$ là quá trình khử', is_true: false },
            { text: 'd) Khí $\\text{H}_2$ sinh ra là sản phẩm của quá trình oxi hóa', is_true: false },
          ],
          score: 1.0,
        },
      ];
    }

    if (s === 'history') {
      return [
        {
          question_number: 1,
          part: 1,
          document_id: '33333333-3333-3333-3333-333333333333',
          page_number: 84,
          sgk_page_reference: 84,
          question_text: 'Câu 1. [SGK Lịch sử - Trang 84] Bản Tuyên ngôn Độc lập được Chủ tịch Hồ Chí Minh đọc tại Quảng trường Ba Đình vào ngày:',
          question_type: 'TN',
          cognitive_level: 'NB',
          textbook_excerpt: 'Ngày 2-9-1945, tại Quảng trường Ba Đình (Hà Nội), Chủ tịch Hồ Chí Minh thay mặt Chính phủ lâm thời đọc bản Tuyên ngôn Độc lập.',
          options: [{ key: 'A', text: '02/09/1945' }, { key: 'B', text: '19/08/1945' }, { key: 'C', text: '23/08/1945' }, { key: 'D', text: '30/08/1945' }],
          correct_answer: 'A',
          score: 0.25,
        },
        {
          question_number: 2,
          part: 1,
          document_id: '33333333-3333-3333-3333-333333333333',
          page_number: 56,
          sgk_page_reference: 56,
          question_text: 'Câu 2. [SGK Lịch sử - Trang 56] Ý nghĩa lịch sử to lớn của chiến thắng Điện Biên Phủ năm 1954 là:',
          question_type: 'TN',
          cognitive_level: 'TH',
          textbook_excerpt: 'Chiến thắng Điện Biên Phủ đã đập tan kế hoạch Nava, giáng đòn quyết định vào ý chí xâm lược của thực dân Pháp, buộc Pháp ký Hiệp định Giơ-ne-vơ.',
          options: [{ key: 'A', text: 'Đập tan hoàn toàn kế hoạch Nava và buộc Pháp ký Hiệp định Genève' }, { key: 'B', text: 'Hoàn thành cuộc kháng chiến chống Mỹ cứu nước' }, { key: 'C', text: 'Giải phóng hoàn toàn miền Nam thống nhất đất nước' }, { key: 'D', text: 'Lật đổ chế độ phong kiến tồn tại hàng nghìn năm' }],
          correct_answer: 'A',
          score: 0.25,
        },
        {
          question_number: 3,
          part: 2,
          document_id: '33333333-3333-3333-3333-333333333333',
          page_number: 102,
          sgk_page_reference: 102,
          question_text: 'Câu 3. [SGK Lịch sử - Trang 102] Về nguyên nhân thắng lợi của cuộc kháng chiến chống thực dân Pháp (1945 - 1954), xét tính đúng/sai của các mệnh đề:',
          question_type: 'TN',
          cognitive_level: 'VD',
          textbook_excerpt: 'Thắng lợi nhờ có sự lãnh đạo sáng suốt của Đảng, đứng đầu là Chủ tịch Hồ Chí Minh với đường lối kháng chiến toàn dân, toàn diện, trường kỳ.',
          statements: [
            { text: 'a) Sự lãnh đạo sáng suốt của Đảng và Chủ tịch Hồ Chí Minh là nhân tố quyết định hàng đầu', is_true: true },
            { text: 'b) Tinh thần đoàn kết chiến đấu của toàn dân tộc trong mặt trận dân tộc thống nhất', is_true: true },
            { text: 'c) Chỉ nhờ có sự can thiệp quân sự trực tiếp từ bên ngoài', is_true: false },
            { text: 'd) Lực lượng vũ trang ba thứ quân không đóng vai trò nòng cốt', is_true: false },
          ],
          score: 1.0,
        },
      ];
    }

    if (s === 'literature') {
      return [
        {
          question_number: 1,
          part: 1,
          document_id: '33333333-3333-3333-3333-333333333333',
          page_number: 12,
          sgk_page_reference: 12,
          question_text: 'Câu 1. [SGK Ngữ văn - Trang 12] Thể loại văn học dân gian nào sau đây kể về các vị thần sáng tạo ra thế giới và con người?',
          question_type: 'TN',
          cognitive_level: 'NB',
          textbook_excerpt: 'Thần thoại là thể loại truyện dân gian kể về các vị thần, giải thích nguồn gốc vũ trụ, con người và muôn loài.',
          options: [{ key: 'A', text: 'Thần thoại' }, { key: 'B', text: 'Truyền thuyết' }, { key: 'C', text: 'Cổ tích' }, { key: 'D', text: 'Truyện ngụ ngôn' }],
          correct_answer: 'A',
          score: 0.25,
        },
        {
          question_number: 2,
          part: 1,
          document_id: '33333333-3333-3333-3333-333333333333',
          page_number: 34,
          sgk_page_reference: 34,
          question_text: 'Câu 2. [SGK Ngữ văn - Trang 34] Biện pháp tu từ nào được sử dụng trong câu thơ: "Bàn tay ta làm nên tất cả / Có sức người sỏi đá cũng thành cơm"?',
          question_type: 'TN',
          cognitive_level: 'TH',
          textbook_excerpt: 'Biện pháp hoán dụ: lấy bộ phận "bàn tay" để chỉ toàn thể "người lao động", ẩn dụ "sỏi đá thành cơm".',
          options: [{ key: 'A', text: 'Hoán dụ và ẩn dụ' }, { key: 'B', text: 'So sánh và nhân hóa' }, { key: 'C', text: 'Điệp từ và chơi chữ' }, { key: 'D', text: 'Nói giảm nói tránh' }],
          correct_answer: 'A',
          score: 0.25,
        },
        {
          question_number: 3,
          part: 2,
          document_id: '33333333-3333-3333-3333-333333333333',
          page_number: 65,
          sgk_page_reference: 65,
          question_text: 'Câu 3. [SGK Ngữ văn - Trang 65] Đọc đoạn trích sau và xét tính đúng/sai của các nhận định:\n"Lòng tự trọng là thước đo phẩm giá của mỗi con người trong đời sống xã hội..."',
          question_type: 'TN',
          cognitive_level: 'VD',
          textbook_excerpt: 'Văn bản nghị luận về tư tưởng, đạo lí cần xác định rõ luận điểm, luận cứ và lập luận chặt chẽ.',
          statements: [
            { text: 'a) Vấn đề nghị luận của đoạn trích là ý nghĩa của lòng tự trọng', is_true: true },
            { text: 'b) Phương thức biểu đạt chính là nghị luận', is_true: true },
            { text: 'c) Đoạn trích sử dụng phong cách ngôn ngữ sinh hoạt đời thường', is_true: false },
            { text: 'd) Không thể rút ra bài học nhận thức và hành động từ đoạn trích', is_true: false },
          ],
          score: 1.0,
        },
      ];
    }

    if (s === 'english') {
      return [
        {
          question_number: 1,
          part: 1,
          document_id: '33333333-3333-3333-3333-333333333333',
          page_number: 14,
          sgk_page_reference: 14,
          question_text: 'Question 1. [English Textbook - Page 14] Choose the word whose stress pattern is different from the others:',
          question_type: 'TN',
          cognitive_level: 'NB',
          textbook_excerpt: 'Unit 1: Stress pattern of two-syllable nouns and verbs.',
          options: [{ key: 'A', text: 'benefit' }, { key: 'B', text: 'volunteer' }, { key: 'C', text: 'donate' }, { key: 'D', text: 'community' }],
          correct_answer: 'A',
          score: 0.25,
        },
        {
          question_number: 2,
          part: 1,
          document_id: '33333333-3333-3333-3333-333333333333',
          page_number: 22,
          sgk_page_reference: 22,
          question_text: 'Question 2. [English Textbook - Page 22] If it ______ tomorrow, we will postpone the outdoor sports festival.',
          question_type: 'TN',
          cognitive_level: 'TH',
          textbook_excerpt: 'Unit 2 Grammar: Conditional sentences type 1 (If + present simple, will + V).',
          options: [{ key: 'A', text: 'rains' }, { key: 'B', text: 'rained' }, { key: 'C', text: 'will rain' }, { key: 'D', text: 'is raining' }],
          correct_answer: 'A',
          score: 0.25,
        },
        {
          question_number: 3,
          part: 2,
          document_id: '33333333-3333-3333-3333-333333333333',
          page_number: 40,
          sgk_page_reference: 40,
          question_text: 'Question 3. [English Textbook - Page 40] Read the passage about eco-friendly living and decide whether the statements are True or False:',
          question_type: 'TN',
          cognitive_level: 'VD',
          textbook_excerpt: 'Reading: Sustainable lifestyles can reduce individual carbon footprints by up to 30 percent.',
          statements: [
            { text: 'a) Sustainable living helps protect natural resources for future generations', is_true: true },
            { text: 'b) Individual choices have measurable impact on carbon footprints', is_true: true },
            { text: 'c) Using single-use plastic bottles is recommended as an eco-friendly habit', is_true: false },
            { text: 'd) Renewable energy produces more greenhouse gases than fossil fuels', is_true: false },
          ],
          score: 1.0,
        },
      ];
    }

    // Default Math (Toán học)
    return [
      {
        question_number: 1,
        part: 1,
        document_id: '33333333-3333-3333-3333-333333333333',
        page_number: 8,
        sgk_page_reference: 8,
        question_text: 'Câu 1. [SGK Toán học - Trang 8] Cho tập hợp $A = \\{x \\in \\mathbb{R} \\mid x^2 - 4 = 0\\}$. Số phần tử của tập hợp $A$ là:',
        question_type: 'TN',
        cognitive_level: 'NB',
        textbook_excerpt: 'Trang 8: Tập hợp các nghiệm của phương trình x^2 - 4 = 0 là {-2, 2}, gồm 2 phần tử.',
        options: [
          { key: 'A', text: '2' },
          { key: 'B', text: '1' },
          { key: 'C', text: '0' },
          { key: 'D', text: '4' },
        ],
        correct_answer: 'A',
        score: 0.25,
      },
      {
        question_number: 2,
        part: 1,
        document_id: '33333333-3333-3333-3333-333333333333',
        page_number: 42,
        sgk_page_reference: 42,
        question_text: 'Câu 2. [SGK Toán học - Trang 42] Cho góc $\\alpha$ với $0^\\circ < \\alpha < 90^\\circ$. Khẳng định nào sau đây là ĐÚNG?',
        question_type: 'TN',
        cognitive_level: 'TH',
        textbook_excerpt: 'Trang 42: Với góc nhọn alpha trong góc phần tư thứ nhất, cả sin(alpha) và cos(alpha) đều mang giá trị dương.',
        options: [
          { key: 'A', text: '$\\sin \\alpha > 0, \\cos \\alpha > 0$' },
          { key: 'B', text: '$\\sin \\alpha < 0, \\cos \\alpha > 0$' },
          { key: 'C', text: '$\\sin \\alpha > 0, \\cos \\alpha < 0$' },
          { key: 'D', text: '$\\sin \\alpha < 0, \\cos \\alpha < 0$' },
        ],
        correct_answer: 'A',
        score: 0.25,
      },
      {
        question_number: 3,
        part: 2,
        document_id: '33333333-3333-3333-3333-333333333333',
        page_number: 55,
        sgk_page_reference: 55,
        question_text: 'Câu 3. [SGK Toán học - Trang 55] Cho tam giác $ABC$ có cạnh $a = 8$, $b = 10$ và góc $C = 60^\\circ$. Xét tính đúng/sai của các mệnh đề sau:',
        question_type: 'TN',
        cognitive_level: 'VD',
        textbook_excerpt: 'Trang 55: Định lí côsin trong tam giác: c^2 = a^2 + b^2 - 2ab cos(C). Diện tích tam giác S = 1/2 ab sin(C).',
        statements: [
          { text: 'a) $c^2 = a^2 + b^2 - 2ab \\cos C$', is_true: true },
          { text: 'b) Độ dài cạnh $c = 2\\sqrt{21}$', is_true: true },
          { text: 'c) Diện tích tam giác $S_{ABC} = 40\\sqrt{3}$', is_true: false },
          { text: 'd) Bán kính đường tròn ngoại tiếp $R = \\frac{\\sqrt{21}}{2}$', is_true: false },
        ],
        score: 1.0,
      },
    ];
  }

  async createFromMatrix(data) {
    return this.createExam(data, data.userId);
  }

  async batchCreate({ matrix_id, count = 4, userId, ...rest }) {
    const master = await this.createExam({ matrix_id, ...rest }, userId);
    return master;
  }

  async getExam(examId, userId) {
    return this.getExamById(examId);
  }

  async getExamById(examId) {
    try {
      const res = await db.query(`SELECT * FROM exams WHERE id = $1`, [examId]);
      return res.rows[0] || null;
    } catch (_) {
      return null;
    }
  }

  async listExams(userId, { limit = 20, offset = 0 } = {}) {
    try {
      const res = await db.query(
        `SELECT id, matrix_id, title, subject, grade, duration_minutes, total_questions, total_score, created_at 
         FROM exams WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      );
      const countRes = await db.query(`SELECT COUNT(*) FROM exams WHERE user_id = $1`, [userId]);
      return {
        exams: res.rows,
        total: parseInt(countRes.rows[0]?.count || '0', 10),
      };
    } catch (_) {
      return { exams: [], total: 0 };
    }
  }
}

module.exports = ExamService;
