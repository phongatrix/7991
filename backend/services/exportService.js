/**
 * CV 7991 – Exam Export Service
 * Formats exams and matrices into printable HTML, Word (.docx format compatible),
 * and JSON for archival.
 */

'use strict';

class ExportService {
  /**
   * Generates clean, printable HTML document for an exam variant according to CV 7991 layout
   */
  static exportToHtml(exam, variantCode = 101) {
    const variant = (exam.variants || []).find((v) => v.variant_code == variantCode) || {
      variant_code: variantCode,
      title: exam.title || 'ĐỀ THI THEO CHUẨN CV 7991',
      questions: exam.questions || [],
      answer_key: {},
    };

    const questions = variant.questions || [];

    const part1Questions = questions.filter((q) => !q.part || q.part === 1);
    const part2Questions = questions.filter((q) => q.part === 2);
    const part3Questions = questions.filter((q) => q.part === 3);
    const part4Questions = questions.filter((q) => q.part === 4 || q.question_type === 'TL');

    let html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>${variant.title || 'Đề kiểm tra chuẩn CV 7991'}</title>
  <style>
    body { font-family: "Times New Roman", Times, serif; font-size: 13pt; line-height: 1.4; color: #111; margin: 40px; }
    .header-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .header-table td { vertical-align: top; text-align: center; font-size: 12pt; }
    .header-table .school { font-weight: bold; }
    .header-table .exam-title { font-size: 14pt; font-weight: bold; text-transform: uppercase; margin-top: 5px; }
    .header-table .exam-code { border: 1px solid #000; padding: 4px 10px; font-weight: bold; display: inline-block; margin-top: 5px; }
    .student-info { width: 100%; border-collapse: collapse; margin-bottom: 25px; font-style: italic; }
    .part-title { font-weight: bold; font-size: 13pt; margin-top: 20px; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 3px; }
    .question-block { margin-bottom: 15px; page-break-inside: avoid; }
    .question-stem { font-weight: 500; margin-bottom: 6px; }
    .options-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-left: 20px; }
    .sub-item { margin-left: 20px; margin-bottom: 4px; }
    .answer-key-section { margin-top: 50px; page-break-before: always; }
    .answer-table { border-collapse: collapse; width: 100%; margin-top: 15px; }
    .answer-table th, .answer-table td { border: 1px solid #333; padding: 6px 10px; text-align: center; }
    .answer-table th { background: #f0f0f0; }
  </style>
  <script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
</head>
<body>

<table class="header-table">
  <tr>
    <td style="width: 50%;">
      <div class="school">${exam.school_name || 'SỞ GIÁO DỤC VÀ ĐÀO TẠO'}</div>
      <div><strong>TRƯỜNG THPT CHUYÊN CHUẨN</strong></div>
      <div><em>(Đề thi gồm có 04 trang)</em></div>
    </td>
    <td style="width: 50%;">
      <div class="exam-title">${exam.title || 'KIỂM TRA ĐỊNH KỲ NĂM HỌC 2024 - 2025'}</div>
      <div>Môn: <strong>${exam.subject === 'math' ? 'TOÁN' : (exam.subject || '').toUpperCase()} - Lớp ${exam.grade || 10}</strong></div>
      <div>Thời gian làm bài: <strong>${exam.time_minutes || 45} phút</strong> <em>(Không kể thời gian phát đề)</em></div>
      <div class="exam-code">MÃ ĐỀ THI: ${variant.variant_code || variantCode}</div>
    </td>
  </tr>
</table>

<table class="student-info">
  <tr>
    <td>Họ và tên thí sinh: ............................................................................</td>
    <td>Số báo danh: .................................... Phòng thi: .........</td>
  </tr>
</table>
`;

    // Part I
    if (part1Questions.length > 0) {
      html += `
  <div class="part-title">PHẦN I. Câu trắc nghiệm nhiều phương án lựa chọn. Thí sinh trả lời từ câu 1 đến câu ${part1Questions.length}. Mỗi câu hỏi thí sinh chỉ chọn một phương án.</div>`;
      part1Questions.forEach((q, idx) => {
        html += `
  <div class="question-block">
    <div class="question-stem"><strong>Câu ${idx + 1}.</strong> ${q.question_text || ''}</div>
    <div class="options-grid">`;
        (q.options || []).forEach((opt) => {
          html += `<div><strong>${opt.key}.</strong> ${opt.text}</div>`;
        });
        html += `
    </div>
  </div>`;
      });
    }

    // Part II
    if (part2Questions.length > 0) {
      html += `
  <div class="part-title">PHẦN II. Câu trắc nghiệm đúng sai. Thí sinh trả lời từ câu 1 đến câu ${part2Questions.length}. Trong mỗi ý a), b), c), d) ở mỗi câu, thí sinh chọn đúng hoặc sai.</div>`;
      part2Questions.forEach((q, idx) => {
        html += `
  <div class="question-block">
    <div class="question-stem"><strong>Câu ${idx + 1}.</strong> ${q.question_text || ''}</div>`;
        const statements = q.statements || [
          { text: 'Ý khẳng định mệnh đề thứ nhất', is_true: true },
          { text: 'Ý khẳng định mệnh đề thứ hai', is_true: false },
          { text: 'Ý khẳng định mệnh đề thứ ba', is_true: true },
          { text: 'Ý khẳng định mệnh đề thứ tư', is_true: false },
        ];
        statements.forEach((st, sIdx) => {
          html += `<div class="sub-item">${String.fromCharCode(97 + sIdx)}) ${st.text || st}</div>`;
        });
        html += `
  </div>`;
      });
    }

    // Part III
    if (part3Questions.length > 0) {
      html += `
  <div class="part-title">PHẦN III. Câu trắc nghiệm trả lời ngắn. Thí sinh trả lời các câu hỏi sau và điền đáp số vào phiếu trả lời.</div>`;
      part3Questions.forEach((q, idx) => {
        html += `
  <div class="question-block">
    <div class="question-stem"><strong>Câu ${idx + 1}.</strong> ${q.question_text || ''}</div>
  </div>`;
      });
    }

    // Part IV (Essay if any)
    if (part4Questions.length > 0) {
      html += `
  <div class="part-title">PHẦN IV. Tự luận (Dành cho phần đánh giá năng lực giải quyết vấn đề).</div>`;
      part4Questions.forEach((q, idx) => {
        html += `
  <div class="question-block">
    <div class="question-stem"><strong>Câu ${idx + 1}.</strong> ${q.question_text || ''}</div>
  </div>`;
      });
    }

    // Answer Key Table
    html += `
<div class="answer-key-section">
  <div class="part-title">ĐÁP ÁN VÀ HƯỚNG DẪN CHẤM - MÃ ĐỀ ${variant.variant_code || variantCode}</div>
  <table class="answer-table">
    <thead>
      <tr>
        <th>Câu</th>
        <th>Đáp án</th>
        <th>Mức độ</th>
        <th>Thang điểm</th>
      </tr>
    </thead>
    <tbody>`;

    questions.forEach((q, idx) => {
      html += `
      <tr>
        <td><strong>${idx + 1}</strong></td>
        <td><strong>${q.correct_answer || 'Xem đáp án'}</strong></td>
        <td>${q.cognitive_level || 'NB'}</td>
        <td>${q.score || 0.25}đ</td>
      </tr>`;
    });

    html += `
    </tbody>
  </table>
</div>

</body>
</html>`;

    return html;
  }
}

module.exports = ExportService;
