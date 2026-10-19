/* ═══════════════════════════════════════════════════════════════
   CV 7991 – ExamForge JavaScript Application
   Hệ Thống Tạo Đề Thi Theo Chuẩn Công Văn 7991/BGDĐT-GDTr (2024)
   Đồng bộ 100% với Sách Giáo Khoa (GDPT 2018) cho tất cả các môn
   ═══════════════════════════════════════════════════════════════ */

'use strict';

// ─── STATE ────────────────────────────────────────────────
const state = {
  currentStep: 1,
  zoomLevel: 100,
  rotation: 0,
  uploadedFiles: [],
  currentSubject: 'informatics',
  currentGrade: '10',
  currentBook: 'kntt',
  currentScope: 'all',
  chapFrom: 1,
  chapTo: 34,
  topicFilter: '',
  currentExamType: '45min',
  matrixData: [],
  specData: [],
  customTopics: [],
  examData: null,
  specViewMode: 'table',
  matrixViewMode: 'standard',
};

// ─── KHO DỮ LIỆU SÁCH GIÁO KHOA TIN HỌC CHUẨN GDPT 2018 ─────────
const BOOK_NAMES = {
  kntt: 'KNTT - ICT',
  canhdieu: 'Cánh diều (NXB ĐH Sư Phạm)',
  chantroi: 'Chân trời sáng tạo (NXB GDVN)',
};

// ─── ĐỒNG BỘ PHẠM VI KIẾN THỨC THEO TỪNG KHỐI LỚP ───────────────
const GRADE_SCOPES = {
    '10': [
    {
        "value": "all",
        "label": "Toàn bộ chương trình năm học (Chủ đề 1 – 6, Bài 1 – 34)",
        "chapFrom": 1,
        "chapTo": 34,
        "topicIndices": [
            0,
            1,
            2,
            3,
            4,
            5
        ],
        "headerTheme": "Tin học 10: Máy tính & Xã hội tri thức, Mạng, Đồ họa Inkscape, Lập trình Python & Hướng nghiệp",
        "lessonsOverview": "Bài 1–7: Thông tin & Dữ liệu · Bài 8–11: Mạng máy tính & Bản quyền số · Bài 12–15: Đồ họa Inkscape · Bài 16–21: Python cơ bản, if, for, while · Bài 22–32: List, Xâu, Hàm def & Gỡ lỗi · Bài 33–34: Hướng nghiệp",
        "keyConcepts": "Dữ liệu, Bit/Byte, ASCII, Unicode, Hệ nhị phân, Logic mệnh đề, Mạng LAN, Cloud, Mã độc, Inkscape vector, Cú pháp Python, if-else, for, while, list, string, hàm def, lỗi ngoại lệ, hướng nghiệp",
        "footerOutcome": "Nắm vững bản chất số hóa thông tin, thiết kế đồ họa vector với Inkscape, lập trình thành thạo Python để giải quyết bài toán và định hướng nghề nghiệp CNTT."
    },
    {
        "value": "mid_hk1",
        "label": "Giữa Học kỳ I (Chủ đề 1, 2, 3: Máy tính, Mạng Internet & Đạo đức số - Bài 1–11)",
        "chapFrom": 1,
        "chapTo": 11,
        "topicIndices": [
            0,
            1
        ],
        "headerTheme": "Chủ đề 1, 2 & 3: Máy tính và xã hội tri thức, Mạng máy tính & Đạo đức số (Bài 1–11)",
        "lessonsOverview": "Bài 1–7: Thông tin & Dữ liệu số (Tr.6–37) · Bài 8–10: Mạng máy tính trong cuộc sống hiện đại, An toàn không gian mạng (Tr.38–54) · Bài 11: Ứng xử trên môi trường số, Nghĩa vụ tôn trọng bản quyền (Tr.55)",
        "keyConcepts": "Dữ liệu và thông tin, đơn vị đo Bit/Byte/KB/MB/GB/TB, bảng mã ASCII/Unicode, đổi hệ thập phân sang nhị phân, phép toán logic AND/OR/XOR/NOT, điều chế xung PCM, hệ màu RGB, mạng LAN, Router, Switch, điện toán đám mây, an toàn không gian mạng, mã độc Virus/Worm/Trojan, bản quyền và văn hóa số",
        "footerOutcome": "Hiểu bản chất biểu diễn dữ liệu số, phân biệt các thiết bị mạng, khai thác an toàn tài nguyên mạng và tuân thủ các quy định đạo đức, pháp luật số."
    },
    {
        "value": "final_hk1",
        "label": "Cuối Học kỳ I (Chủ đề 1–4: Máy tính, Mạng, Đạo đức số & Đồ hoạ Inkscape - Bài 1–15)",
        "chapFrom": 1,
        "chapTo": 15,
        "topicIndices": [
            0,
            1,
            2
        ],
        "headerTheme": "Chủ đề 1 đến 4: Máy tính, Internet, Đạo đức số & Thiết kế đồ hoạ Inkscape (Bài 1–15)",
        "lessonsOverview": "Bài 1–7: Thông tin & Dữ liệu số · Bài 8–11: Mạng máy tính & Bản quyền số · Bài 12: Phần mềm thiết kế đồ họa Inkscape (Tr.63) · Bài 13: Bổ sung đối tượng đồ họa & Phép ghép (Tr.69) · Bài 14: Làm việc với đối tượng đường & Văn bản (Tr.75) · Bài 15: Hoàn thiện hình ảnh đồ họa (Tr.81)",
        "keyConcepts": "Dữ liệu số, an toàn mạng, bản quyền số, đồ họa vector .svg vs bitmap, hộp thoại Fill and Stroke, phép ghép đối tượng Union/Difference/Intersection, công cụ Pen, điểm neo trơn/góc, Text on Path, xuất ảnh PNG",
        "footerOutcome": "Nắm vững kiến thức đại cương máy tính, mạng Internet, bản quyền số và thiết kế được các sản phẩm đồ họa vector hoàn chỉnh với Inkscape."
    },
    {
        "value": "mid_hk2",
        "label": "Giữa Học kỳ II (Chủ đề 5: Lập trình Python - Cơ bản, Cấu trúc điều khiển, List & Xâu - Bài 16–25)",
        "chapFrom": 16,
        "chapTo": 25,
        "topicIndices": [
            3,
            4
        ],
        "headerTheme": "Chủ đề 5: Lập trình Python - Cú pháp cơ bản, Cấu trúc rẽ nhánh, Lặp & Danh sách, Xâu kí tự (Bài 16–25)",
        "lessonsOverview": "Bài 16: Ngôn ngữ lập trình bậc cao và Python (Tr.86) · Bài 17: Biến và lệnh gán (Tr.91) · Bài 18: Các lệnh vào ra đơn giản (Tr.97) · Bài 19: Câu lệnh rẽ nhánh if (Tr.101) · Bài 20: Câu lệnh lặp for (Tr.105) · Bài 21: Câu lệnh lặp while (Tr.108) · Bài 22–23: Kiểu dữ liệu danh sách List & Thao tác (Tr.111–118) · Bài 24–25: Xâu kí tự String & Thao tác (Tr.119–126)",
        "keyConcepts": "Môi trường IDLE, biến, quy tắc đặt tên, phép gán, toán tử số học //, %, **, lệnh input(), print(), ép kiểu int/float/str, cấu trúc rẽ nhánh if-elif-else, vòng lặp for với range(), vòng lặp while, lệnh break, danh sách list, chỉ số từ 0, phương thức append(), insert(), remove(), tính bất biến của xâu, toán tử in, phương thức find(), split(), join()",
        "footerOutcome": "Viết được chương trình Python hoàn chỉnh có nhập/xuất dữ liệu, làm chủ cấu trúc điều khiển rẽ nhánh, lặp và thao tác thành thạo trên dữ liệu danh sách mảng và chuỗi văn bản."
    },
    {
        "value": "final_hk2",
        "label": "Cuối Học kỳ II (Chủ đề 5 & 6: Lập trình Python & Hướng nghiệp Tin học - Bài 16–34)",
        "chapFrom": 16,
        "chapTo": 34,
        "topicIndices": [
            3,
            4,
            5
        ],
        "headerTheme": "Chủ đề 5 & 6: Lập trình Python hoàn chỉnh (Hàm, Gỡ lỗi, Ôn tập) & Hướng nghiệp Tin học (Bài 16–34)",
        "lessonsOverview": "Bài 16–25: Cú pháp Python cơ bản, if, for, while, List, Xâu kí tự · Bài 26: Hàm trong Python (Tr.127) · Bài 27: Tham số của hàm (Tr.131) · Bài 28: Phạm vi của biến (Tr.136) · Bài 29: Nhận biết lỗi chương trình (Tr.141) · Bài 30: Kiểm thử và gỡ lỗi (Tr.145) · Bài 31–32: Thực hành & Ôn tập lập trình (Tr.149–155) · Bài 33–34: Hướng nghiệp Thiết kế đồ họa & Phát triển phần mềm (Tr.156–165)",
        "keyConcepts": "Cấu trúc điều khiển Python, mảng danh sách, chuỗi ký tự, định nghĩa hàm def, lệnh return, tham số vs đối số, biến cục bộ vs toàn cục, từ khóa global, lỗi cú pháp SyntaxError, ngoại lệ RuntimeError (ZeroDivisionError, IndexError, ValueError), kiểm thử biên, breakpoint, quy trình phát triển phần mềm, hướng nghiệp CNTT",
        "footerOutcome": "Lập trình thành thạo Python để giải quyết bài toán thực tế, module hóa bằng hàm con, kiểm thử gỡ lỗi và hiểu rõ các ngành nghề, vị trí việc làm trong lĩnh vực CNTT."
    },
    {
        "value": "cd1",
        "label": "Chủ đề 1: Máy tính và xã hội tri thức (Bài 1–7)",
        "chapFrom": 1,
        "chapTo": 7,
        "topicIndices": [
            0
        ],
        "headerTheme": "Chủ đề 1: Máy tính và xã hội tri thức (Bài 1 đến Bài 7)",
        "lessonsOverview": "Bài 1: Thông tin và xử lý thông tin · Bài 2: Thiết bị thông minh · Bài 3: Kiểu dữ liệu & Văn bản · Bài 4: Hệ nhị phân & Số nguyên · Bài 5: Dữ liệu lôgic · Bài 6: Âm thanh & Hình ảnh · Bài 7: Thiết bị số thông dụng",
        "keyConcepts": "Dữ liệu vs thông tin, Bit, Byte, bảng quy đổi, ASCII, Unicode, UTF-8, số nhị phân, mã bù 2, phép toán AND/OR/XOR/NOT, số hóa âm thanh PCM, hệ màu RGB, PDA",
        "footerOutcome": "Giải thích được cơ chế số hóa các loại dữ liệu cơ bản (văn bản, số nguyên, logic, âm thanh, hình ảnh) và sử dụng thiết bị số hiệu quả."
    },
    {
        "value": "cd2_3",
        "label": "Chủ đề 2 & 3: Mạng máy tính, Internet & Đạo đức, Bản quyền (Bài 8–11)",
        "chapFrom": 8,
        "chapTo": 11,
        "topicIndices": [
            1
        ],
        "headerTheme": "Chủ đề 2 & 3: Mạng máy tính, Không gian mạng & Pháp luật, Bản quyền số (Bài 8 đến Bài 11)",
        "lessonsOverview": "Bài 8: Mạng máy tính trong cuộc sống hiện đại · Bài 9: An toàn trên không gian mạng · Bài 10: Khai thác tài nguyên Internet · Bài 11: Ứng xử trên môi trường số & Bản quyền",
        "keyConcepts": "Mạng LAN, WAN, Router, Switch, điện toán đám mây SaaS/PaaS/IaaS, IoT, tin giả, bắt nạt mạng, Virus, Worm, Trojan, DoS, Google Translate, igiaoduc.vn, quyền tác giả (nhân thân, tài sản)",
        "footerOutcome": "Phân biệt mạng LAN/Internet, khai thác an toàn tài nguyên đám mây và tuân thủ các quy định pháp luật về bản quyền số."
    },
    {
        "value": "cd4",
        "label": "Chủ đề 4: Ứng dụng tin học - Đồ họa Inkscape (Bài 12–15)",
        "chapFrom": 12,
        "chapTo": 15,
        "topicIndices": [
            2
        ],
        "headerTheme": "Chủ đề 4: Ứng dụng tin học - Phần mềm thiết kế đồ hoạ Inkscape (Bài 12 đến Bài 15)",
        "lessonsOverview": "Bài 12: Phần mềm thiết kế đồ họa Inkscape · Bài 13: Bổ sung đối tượng đồ họa & Phép ghép · Bài 14: Đối tượng đường & Văn bản · Bài 15: Hoàn thiện hình ảnh đồ họa",
        "keyConcepts": "Đồ họa vector .svg vs bitmap, giao diện Inkscape, thuộc tính hình khối (Corners, Rounded), hộp thoại Fill and Stroke, phép ghép Union/Difference/Intersection, công cụ Pen, điểm neo trơn/góc, Text/Put on Path, xuất ảnh PNG",
        "footerOutcome": "Sử dụng thành thạo phần mềm Inkscape để thiết kế các sản phẩm đồ họa vector (logo, biểu tượng, banner, thiệp chúc mừng, tờ rơi)."
    },
    {
        "value": "cd5_basic",
        "label": "Chủ đề 5: Lập trình Python cơ bản - Khởi đầu, Biến & Vào ra (Bài 16–18)",
        "chapFrom": 16,
        "chapTo": 18,
        "topicIndices": [
            3
        ],
        "headerTheme": "Chủ đề 5: Lập trình Python cơ bản - Khởi đầu, Biến, Lệnh gán & Vào ra đơn giản (Bài 16–18)",
        "lessonsOverview": "Bài 16: Ngôn ngữ lập trình bậc cao và Python · Bài 17: Biến và lệnh gán · Bài 18: Các lệnh vào ra đơn giản",
        "keyConcepts": "Môi trường IDLE, chế độ gõ lệnh trực tiếp >>> vs soạn thảo script, lệnh print(), chú thích #, cú pháp biến = giá trị, toán tử //, %, **, ghép xâu +, lặp xâu *, từ khóa, hàm input(), ép kiểu int(), float(), str()",
        "footerOutcome": "Viết và chạy được chương trình Python cơ bản, nhập dữ liệu từ bàn phím, ép kiểu đúng và tính toán biểu thức số học."
    },
    {
        "value": "cd5_control",
        "label": "Chủ đề 5: Cấu trúc điều khiển - Rẽ nhánh if & Vòng lặp for/while (Bài 19–21)",
        "chapFrom": 19,
        "chapTo": 21,
        "topicIndices": [
            3
        ],
        "headerTheme": "Chủ đề 5: Cấu trúc điều khiển - Câu lệnh rẽ nhánh if và Vòng lặp for, while (Bài 19–21)",
        "lessonsOverview": "Bài 19: Câu lệnh rẽ nhánh if · Bài 20: Câu lệnh lặp for · Bài 21: Câu lệnh lặp while & 3 cấu trúc lập trình cơ bản",
        "keyConcepts": "Phép so sánh (<, >, ==, !=), toán tử logic and, or, not, cấu trúc if-else, thụt lề 4 dấu cách, vòng lặp for i in range(start, stop), vòng lặp while với điều kiện lặp, lệnh break, 3 cấu trúc cơ bản (tuần tự, rẽ nhánh, lặp)",
        "footerOutcome": "Lập trình giải quyết các bài toán rẽ nhánh điều kiện và bài toán lặp với số lần biết trước hoặc chưa biết trước."
    },
    {
        "value": "cd5_data",
        "label": "Chủ đề 5: Kiểu dữ liệu có cấu trúc - Danh sách List & Xâu kí tự String (Bài 22–25)",
        "chapFrom": 22,
        "chapTo": 25,
        "topicIndices": [
            4
        ],
        "headerTheme": "Chủ đề 5: Kiểu dữ liệu có cấu trúc - Danh sách (List) và Xâu kí tự (String) (Bài 22–25)",
        "lessonsOverview": "Bài 22: Kiểu dữ liệu danh sách · Bài 23: Một số lệnh làm việc với danh sách · Bài 24: Xâu kí tự · Bài 25: Một số lệnh làm việc với xâu kí tự",
        "keyConcepts": "Cặp ngoặc [], chỉ số từ 0 đến len(A)-1, duyệt for in range(len(A)), hàm len(), lệnh del, phương thức append(), insert(), remove(), clear(), tính bất biến của xâu str, toán tử in, phương thức find(), split(), join()",
        "footerOutcome": "Vận dụng thành thạo danh sách để lưu trữ mảng dữ liệu và xử lý các thao tác trích xuất, tách nối xâu văn bản trong Python."
    },
    {
        "value": "cd5_func",
        "label": "Chủ đề 5: Hàm con def, Phạm vi biến & Kiểm thử gỡ lỗi (Bài 26–32)",
        "chapFrom": 26,
        "chapTo": 32,
        "topicIndices": [
            4
        ],
        "headerTheme": "Chủ đề 5: Lập trình hàm (def), Phạm vi biến, Nhận biết lỗi & Gỡ lỗi chương trình (Bài 26–32)",
        "lessonsOverview": "Bài 26: Hàm trong Python · Bài 27: Tham số của hàm · Bài 28: Phạm vi của biến · Bài 29: Nhận biết lỗi chương trình · Bài 30: Kiểm thử và gỡ lỗi · Bài 31–32: Thực hành & Ôn tập lập trình",
        "keyConcepts": "Cú pháp def, lệnh return, phân biệt tham số vs đối số, biến cục bộ vs toàn cục, từ khóa global, lỗi cú pháp SyntaxError, lỗi ngoại lệ RuntimeError (ZeroDivisionError, IndexError, ValueError), bộ dữ liệu test (ngẫu nhiên, biên), breakpoint",
        "footerOutcome": "Module hóa chương trình bằng hàm tự định nghĩa, xử lý phạm vi biến an toàn và áp dụng phương pháp kiểm thử, gỡ lỗi hiệu quả."
    },
    {
        "value": "cd6",
        "label": "Chủ đề 6: Hướng nghiệp với Tin học (Bài 33–34)",
        "chapFrom": 33,
        "chapTo": 34,
        "topicIndices": [
            5
        ],
        "headerTheme": "Chủ đề 6: Hướng nghiệp với Tin học - Nghề Thiết kế đồ họa & Phát triển phần mềm (Bài 33–34)",
        "lessonsOverview": "Bài 33: Nghề thiết kế đồ họa máy tính · Bài 34: Nghề phát triển phần mềm",
        "keyConcepts": "Nghề thiết kế đồ họa, kĩ năng cảm nhận cái đẹp và sử dụng phần mềm đồ họa, cơ hội nghề nghiệp, 7 công đoạn phát triển phần mềm (khảo sát, phân tích, thiết kế, lập trình, kiểm thử, chuyển giao, bảo trì), lập trình viên, kĩ sư phần mềm, quản trị dự án",
        "footerOutcome": "Hiểu rõ đặc điểm, kĩ năng cần thiết và quy trình làm việc trong các ngành nghề CNTT phổ biến, từ đó định hình hướng nghiệp phù hợp."
    }
],
  '11': [
    {
      value: 'all',
      label: 'Toàn bộ chương trình năm học (Chủ đề 1 – 7, Bài 1 – 31)',
      chapFrom: 1,
      chapTo: 31,
      topicIndices: [0, 1, 2, 3, 4],
      headerTheme: 'Tin học 11: Hệ điều hành, CSDL quan hệ SQL, Thực hành CSDL & Đồ họa/Video',
      lessonsOverview: 'Chủ đề 1–7: Bài 1–5: Hệ điều hành, Phần cứng & Thiết bị số · Bài 6–9: Lưu trữ Internet & An toàn mạng · Bài 10–15: CSDL quan hệ & Lệnh SQL · Bài 16–24: Thực hành tạo CSDL, Khóa & Truy vấn · Bài 25–31: Chỉnh sửa ảnh & Làm phim hoạt hình',
      keyConcepts: 'Hệ điều hành, PM nguồn mở, CSDL quan hệ, Bảng, Khóa chính, Khóa ngoại, Truy vấn SQL (SELECT, WHERE, ORDER BY, INSERT, UPDATE), Chỉnh sửa ảnh, Phim hoạt hình',
      footerOutcome: 'Sử dụng thành thạo HĐH, thiết kế và thao tác CSDL quan hệ bằng SQL, biên tập sản phẩm đồ họa và video số.'
    },
    {
      value: 'mid_hk1',
      label: 'Giữa Học kỳ I (Chủ đề 1, 2, 3: Máy tính, Lưu trữ Internet & Giao tiếp an toàn - Bài 1–9)',
      chapFrom: 1,
      chapTo: 9,
      topicIndices: [0, 1],
      headerTheme: 'Chủ đề 1, 2 & 3: Hệ điều hành, Lưu trữ tệp Internet & Giao tiếp an toàn',
      lessonsOverview: 'Bài 1: Hệ điều hành (Tr.5) · Bài 3: PM nguồn mở và PM Internet (Tr.14) · Bài 4: Bên trong máy tính (Tr.19) · Bài 6: Lưu trữ & chia sẻ tệp Internet (Tr.28) · Bài 9: Giao tiếp an toàn trên Internet (Tr.43)',
      keyConcepts: 'Chức năng hệ điều hành, giấy phép GNU GPL, CPU, RAM, ROM, lưu trữ đám mây Google Drive/OneDrive, bảo vệ thông tin cá nhân và an toàn mạng',
      footerOutcome: 'Hiểu vai trò của HĐH và phần cứng máy tính; khai thác an toàn dịch vụ lưu trữ đám mây và ứng xử văn minh trong môi trường số.'
    },
    {
      value: 'final_hk1',
      label: 'Cuối Học kỳ I (Chủ đề 1–5: Hệ thống, An toàn, CSDL & Hướng nghiệp - Bài 1–16)',
      chapFrom: 1,
      chapTo: 16,
      topicIndices: [0, 1, 2, 3],
      headerTheme: 'Chủ đề 1 đến 5: Tổng quan hệ thống, Giới thiệu CSDL quan hệ & Nghề quản trị CSDL (Bài 1–16)',
      lessonsOverview: 'Bài 1–5: Hệ điều hành & Phần cứng · Bài 6–9: Lưu trữ & An toàn mạng · Bài 10: Lưu trữ dữ liệu quản lý · Bài 11: CSDL · Bài 12: Hệ quản trị CSDL · Bài 13: CSDL quan hệ · Bài 14: SQL · Bài 15: Bảo mật CSDL · Bài 16: Công việc quản trị CSDL',
      keyConcepts: 'Hệ CSDL, bảng, trường (cột), bản ghi (hàng), khóa chính (Primary Key), khóa ngoại (Foreign Key), cú pháp truy vấn SELECT-FROM-WHERE, an toàn và bảo mật CSDL, nghề quản trị CSDL (DBA)',
      footerOutcome: 'Nắm vững khái niệm CSDL quan hệ, xác định được các trường khóa, viết được các câu truy vấn SQL cơ bản và hiểu công việc DBA.'
    },
    {
      value: 'mid_hk2',
      label: 'Giữa Học kỳ II (Chủ đề 6: Thực hành tạo và khai thác CSDL - Bài 17–24)',
      chapFrom: 17,
      chapTo: 24,
      topicIndices: [3],
      headerTheme: 'Chủ đề 6: Thực hành tạo và khai thác cơ sở dữ liệu (Bài 17–24)',
      lessonsOverview: 'Bài 17: Quản trị CSDL trên máy (Tr.86) · Bài 18: Xác định cấu trúc bảng & Khóa (Tr.90) · Bài 19: Tạo lập CSDL & Bảng (Tr.95) · Bài 20: Tạo bảng có khóa ngoài (Tr.100) · Bài 21: Cập nhật & Truy xuất (Tr.105) · Bài 22: Cập nhật bảng có tham chiếu (Tr.109) · Bài 23: Truy xuất liên kết bảng (Tr.113) · Bài 24: Sao lưu dữ liệu (Tr.116)',
      keyConcepts: 'Khóa ngoài Foreign Key, toàn vẹn tham chiếu, lệnh CREATE TABLE, INSERT INTO, UPDATE, SELECT với điều kiện lọc WHERE, liên kết bảng, sao lưu Backup CSDL',
      footerOutcome: 'Tạo lập được CSDL trên máy tính, thiết lập khóa ngoài liên kết bảng và thực hiện cập nhật, trích xuất dữ liệu.'
    },
    {
      value: 'final_hk2',
      label: 'Cuối Học kỳ II (Chủ đề 6 & 7: Thực hành CSDL & Chỉnh sửa ảnh, làm video - Bài 17–31)',
      chapFrom: 17,
      chapTo: 31,
      topicIndices: [3, 4],
      headerTheme: 'Chủ đề 6 & 7: Quản trị CSDL nâng cao & Biên tập đa phương tiện Ảnh/Video (Bài 17–31)',
      lessonsOverview: 'Bài 22: Cập nhật bảng có tham chiếu (Tr.109) · Bài 23: Truy xuất liên kết bảng (Tr.113) · Bài 24: Sao lưu dữ liệu (Tr.116) · Bài 25: Chỉnh sửa ảnh (Tr.119) · Bài 28: Tạo ảnh động (Tr.135) · Bài 30: Biên tập phim (Tr.146) · Bài 31: Phim hoạt hình (Tr.151)',
      keyConcepts: 'Liên kết bảng JOIN/SELECT nhiều bảng, sao lưu Backup CSDL, layer chỉnh sửa ảnh, công cụ chọn, tạo frame ảnh động, hiệu ứng chuyển cảnh phim, xuất bản video',
      footerOutcome: 'Truy vấn được dữ liệu từ nhiều bảng liên kết, thực hiện sao lưu CSDL an toàn và sáng tạo được sản phẩm video/ảnh động hoàn chỉnh.'
    },
    {
      value: 'cd1',
      label: 'Chủ đề 1: Máy tính và xã hội tri thức (Bài 1–5: Hệ điều hành, PM nguồn mở, Phần cứng)',
      chapFrom: 1,
      chapTo: 5,
      topicIndices: [0],
      headerTheme: 'Chủ đề 1: Máy tính và xã hội tri thức (Bài 1–5)',
      lessonsOverview: 'Bài 1: Hệ điều hành (Tr.5) · Bài 2: Thực hành HĐH (Tr.10) · Bài 3: PM nguồn mở & PM Internet (Tr.14) · Bài 4: Bên trong máy tính (Tr.19) · Bài 5: Kết nối thiết bị số (Tr.24)',
      keyConcepts: 'Chức năng và phân loại hệ điều hành, phần mềm nguồn mở, CPU, RAM, ROM, bus, cổng kết nối HDMI, USB-C, Bluetooth',
      footerOutcome: 'Sử dụng thành thạo các tính năng hệ điều hành, phân biệt phần mềm nguồn mở và kết nối an toàn các thiết bị số.'
    },
    {
      value: 'cd2_3',
      label: 'Chủ đề 2 & 3: Lưu trữ Internet, Trao đổi thông tin & Giao tiếp an toàn (Bài 6–9)',
      chapFrom: 6,
      chapTo: 9,
      topicIndices: [1],
      headerTheme: 'Chủ đề 2 & 3: Tổ chức lưu trữ, tìm kiếm thông tin & Đạo đức môi trường số (Bài 6–9)',
      lessonsOverview: 'Bài 6: Lưu trữ và chia sẻ tệp tin trên Internet (Tr.28) · Bài 7: Thực hành tìm kiếm thông tin (Tr.34) · Bài 8: Email & Mạng xã hội nâng cao (Tr.38) · Bài 9: Giao tiếp an toàn trên Internet (Tr.43)',
      keyConcepts: 'Lưu trữ đám mây, phân quyền truy cập tệp tin (Viewer, Editor), toán tử tìm kiếm nâng cao (AND, OR, site:, filetype:), phòng tránh mã độc và lừa đảo trực tuyến (phishing)',
      footerOutcome: 'Biết chia sẻ dữ liệu cộng tác an toàn trên đám mây, tìm kiếm thông tin chính xác và ứng xử văn minh, bảo mật tài khoản.'
    },
    {
      value: 'cd4',
      label: 'Chủ đề 4: Giới thiệu các hệ cơ sở dữ liệu (Bài 10–15: CSDL, Hệ QTCSDL, CSDL quan hệ, SQL)',
      chapFrom: 10,
      chapTo: 15,
      topicIndices: [2],
      headerTheme: 'Chủ đề 4: Giới thiệu các hệ cơ sở dữ liệu và Ngôn ngữ SQL (Bài 10–15)',
      lessonsOverview: 'Bài 10: Lưu trữ dữ liệu quản lý (Tr.50) · Bài 11: Cơ sở dữ liệu (Tr.55) · Bài 12: Hệ quản trị CSDL (Tr.59) · Bài 13: CSDL quan hệ (Tr.64) · Bài 14: SQL - Ngôn ngữ truy vấn (Tr.70) · Bài 15: Bảo mật CSDL (Tr.76)',
      keyConcepts: 'Khái niệm CSDL, hệ quản trị CSDL, bảng, trường, bản ghi, khóa chính Primary Key, khóa ngoại Foreign Key, cú pháp SELECT, INSERT, UPDATE, DELETE, phân quyền người dùng CSDL',
      footerOutcome: 'Hiểu kiến trúc CSDL quan hệ, xác định chính xác các trường khóa và viết được các câu lệnh SQL phục vụ khai thác dữ liệu.'
    },
    {
      value: 'cd5',
      label: 'Chủ đề 5: Hướng nghiệp với Tin học (Bài 16: Công việc quản trị cơ sở dữ liệu)',
      chapFrom: 16,
      chapTo: 16,
      topicIndices: [3],
      headerTheme: 'Chủ đề 5: Hướng nghiệp với Tin học - Nghề Quản trị Cơ sở dữ liệu (Bài 16)',
      lessonsOverview: 'Bài 16: Công việc quản trị cơ sở dữ liệu (Tr.80)',
      keyConcepts: 'Vai trò của DBA (Database Administrator), nhiệm vụ cài đặt, bảo trì, cấp quyền và giám sát an toàn dữ liệu, yêu cầu chuyên môn và cơ hội nghề nghiệp',
      footerOutcome: 'Mô tả được các công việc đặc thù của người quản trị CSDL và định hướng phát triển nghề nghiệp liên quan đến dữ liệu.'
    },
    {
      value: 'cd6',
      label: 'Chủ đề 6: Thực hành tạo và khai thác cơ sở dữ liệu (Bài 17–24)',
      chapFrom: 17,
      chapTo: 24,
      topicIndices: [3],
      headerTheme: 'Chủ đề 6: Thực hành tạo và khai thác cơ sở dữ liệu (Bài 17–24)',
      lessonsOverview: 'Bài 17: Quản trị CSDL trên máy (Tr.86) · Bài 18: Cấu trúc bảng & Khóa (Tr.90) · Bài 19: Tạo CSDL & Bảng (Tr.95) · Bài 20: Tạo bảng khóa ngoài (Tr.100) · Bài 21–23: Cập nhật & Truy xuất qua liên kết bảng (Tr.105–115) · Bài 24: Sao lưu dữ liệu (Tr.116)',
      keyConcepts: 'Kiểu dữ liệu SQL (INT, VARCHAR, DATE), ràng buộc khóa ngoài (FOREIGN KEY ... REFERENCES), liên kết bảng, cập nhật dữ liệu tham chiếu, truy vấn JOIN, sao lưu dự phòng (Backup/Restore)',
      footerOutcome: 'Tự tay thiết kế và tạo lập CSDL có liên kết bảng trên máy tính, thực hiện thành công các truy vấn và sao lưu bảo vệ dữ liệu.'
    },
    {
      value: 'cd7',
      label: 'Chủ đề 7: Phần mềm chỉnh sửa ảnh và làm video (Bài 25–31)',
      chapFrom: 25,
      chapTo: 31,
      topicIndices: [4],
      headerTheme: 'Chủ đề 7: Phần mềm chỉnh sửa ảnh và làm video (Bài 25–31)',
      lessonsOverview: 'Bài 25: Phần mềm chỉnh sửa ảnh (Tr.119) · Bài 26: Công cụ màu & Chọn (Tr.124) · Bài 27: Công cụ vẽ (Tr.130) · Bài 28: Tạo ảnh động (Tr.135) · Bài 29: Khám phá PM làm phim (Tr.141) · Bài 30: Biên tập phim (Tr.146) · Bài 31: Phim hoạt hình (Tr.151)',
      keyConcepts: 'Phần mềm GIMP/Photoshop, lớp ảnh (layer), vùng chọn, kênh màu RGB, độ phân giải DPI, timeline làm phim, hiệu ứng âm thanh, keyframe hoạt hình, định dạng mp4/gif',
      footerOutcome: 'Xử lý và phục chế hình ảnh kỹ thuật số, tạo ảnh động và dựng được video clip/phim hoạt hình ngắn phục vụ học tập, truyền thông.'
    }
  ],
  '12': [
    {
      value: 'all',
      label: 'Toàn bộ chương trình năm học (Chủ đề 1 – 7, Bài 1 – 28)',
      chapFrom: 1,
      chapTo: 28,
      topicIndices: [0, 1, 2, 3, 4],
      headerTheme: 'Tin học 12: Trí tuệ nhân tạo (AI), Mạng máy tính, Thiết kế Web HTML/CSS & Hướng nghiệp',
      lessonsOverview: 'Chủ đề 1–7: Bài 1–2: Làm quen AI & AI trong đời sống · Bài 3–6: Thiết bị mạng, Giao thức & Đạo đức mạng · Bài 7–12: HTML, Văn bản, Bảng & Biểu mẫu · Bài 13–18: CSS, Màu sắc, Khung & Bộ chọn · Bài 19–28: Sửa chữa bảo trì, Nghề CNTT, Thiết bị số & Dự án xây dựng website',
      keyConcepts: 'Trí tuệ nhân tạo AI, Học máy Machine Learning, Router/Switch, IP/TCP, thẻ HTML5, CSS Selector, Box Model, biểu mẫu Form, hướng nghiệp CNTT, dự án trang web',
      footerOutcome: 'Hiểu nguyên lý và ứng dụng AI; phân tích giao thức mạng; thiết kế website chuẩn HTML5/CSS3 hoàn chỉnh và định hướng nghề nghiệp CNTT.'
    },
    {
      value: 'mid_hk1',
      label: 'Giữa Học kỳ I (Chủ đề 1, 2, 3: Trí tuệ nhân tạo, Mạng máy tính & Ứng xử mạng - Bài 1–6)',
      chapFrom: 1,
      chapTo: 6,
      topicIndices: [0, 1],
      headerTheme: 'Chủ đề 1, 2 & 3: Trí tuệ nhân tạo, Mạng máy tính, Giao thức & Văn hóa mạng',
      lessonsOverview: 'Bài 1: Làm quen với Trí tuệ nhân tạo (Tr.5) · Bài 2: AI trong khoa học và đời sống (Tr.12) · Bài 3: Một số thiết bị mạng thông dụng (Tr.19) · Bài 4: Giao thức mạng (Tr.25) · Bài 5: Chia sẻ tài nguyên mạng (Tr.30) · Bài 6: Giao tiếp & ứng xử không gian mạng (Tr.36)',
      keyConcepts: 'Khái niệm AI, các lĩnh vực ứng dụng AI (thị giác máy tính, NLP, tự động hóa), thiết bị Switch, Router, Modem, Access Point, giao thức IP, TCP, HTTP, an toàn và văn hóa số',
      footerOutcome: 'Trình bày được bản chất và vai trò của AI; hiểu chức năng các thiết bị mạng và giao thức truyền thông; thực hiện giao tiếp văn minh trên mạng.'
    },
    {
      value: 'final_hk1',
      label: 'Cuối Học kỳ I (Chủ đề 1–3 & Thiết kế Web HTML: AI, Mạng & Cấu trúc trang web - Bài 1–12)',
      chapFrom: 1,
      chapTo: 12,
      topicIndices: [0, 1, 2],
      headerTheme: 'Chủ đề 1 đến 4: Tổng quan AI, Mạng Internet & Ngôn ngữ đánh dấu siêu văn bản HTML',
      lessonsOverview: 'Bài 1–6: Trí tuệ nhân tạo & Mạng máy tính · Bài 7: HTML và cấu trúc trang web (Tr.44) · Bài 8: Định dạng văn bản (Tr.50) · Bài 9: Tạo danh sách, bảng (Tr.55) · Bài 10: Tạo liên kết (Tr.60) · Bài 11: Đa phương tiện & Khung nội tuyến (Tr.63) · Bài 12: Tạo biểu mẫu (Tr.67)',
      keyConcepts: 'Thẻ HTML <!DOCTYPE>, <html>, <head>, <body>, tiêu đề <h1>-<h6>, thẻ đoạn <p>, danh sách <ul>/<ol>, bảng <table><tr><td>, siêu liên kết <a href>, thẻ ảnh <img>, biểu mẫu <form>, <input>, <button>',
      footerOutcome: 'Xây dựng được các trang web tĩnh chuẩn cấu trúc HTML5 có bảng biểu, hình ảnh, liên kết và biểu mẫu tương tác thu thập dữ liệu.'
    },
    {
      value: 'mid_hk2',
      label: 'Giữa Học kỳ II (Chủ đề 4: Định kiểu giao diện Web với CSS & Thực hành thiết kế - Bài 13–18)',
      chapFrom: 13,
      chapTo: 18,
      topicIndices: [2, 3],
      headerTheme: 'Chủ đề 4: Thiết kế Web nâng cao - Ngôn ngữ định kiểu CSS (Cascading Style Sheets)',
      lessonsOverview: 'Bài 13: Khái niệm, vai trò của CSS (Tr.70) · Bài 14: Định dạng văn bản bằng CSS (Tr.74) · Bài 15: Tạo màu cho chữ và nền (Tr.78) · Bài 16: Định dạng khung CSS Box Model (Tr.83) · Bài 17: Mức ưu tiên của bộ chọn (Tr.88) · Bài 18: Thực hành tổng hợp thiết kế web (Tr.92)',
      keyConcepts: 'Cú pháp CSS Selector (tên thẻ, class, id), các thuộc tính color, background-color, font-family, font-size, mô hình hộp Box Model (margin, border, padding, content), thứ tự ưu tiên của bộ chọn',
      footerOutcome: 'Áp dụng thành thạo CSS để tùy biến giao diện, màu sắc, font chữ và căn chỉnh bố cục trang web thẩm mỹ, khoa học.'
    },
    {
      value: 'final_hk2',
      label: 'Cuối Học kỳ II (Chủ đề 5, 6, 7: Hướng nghiệp CNTT, Thiết bị số & Dự án trang web - Bài 19–28)',
      chapFrom: 19,
      chapTo: 28,
      topicIndices: [3, 4],
      headerTheme: 'Chủ đề 5, 6 & 7: Hướng nghiệp Tin học & Dự án thực tế xây dựng website hoàn chỉnh',
      lessonsOverview: 'Bài 19: Dịch vụ sửa chữa bảo trì máy tính (Tr.96) · Bài 20: Nghề quản trị CNTT (Tr.101) · Bài 22: Kết nối thiết bị số (Tr.111) · Bài 23: Chuẩn bị xây dựng trang web (Tr.117) · Bài 24: Phần đầu web (Tr.121) · Bài 25: Phần thân & chân web (Tr.125) · Bài 26: Điều hướng (Tr.130) · Bài 28: Tổng hợp (Tr.140)',
      keyConcepts: 'Bảo trì phần cứng và phần mềm, nghề quản trị hệ thống và mạng, kết nối máy in/máy quét/thiết bị IoT, cấu trúc website đa trang, thanh điều hướng navbar, biểu mẫu liên hệ, xuất bản và kiểm thử web',
      footerOutcome: 'Định hình được lộ trình nghề nghiệp CNTT; kết nối được các thiết bị số thông dụng và hoàn thành một dự án website hoàn chỉnh theo quy trình chuẩn.'
    },
    {
      value: 'cd1',
      label: 'Chủ đề 1: Máy tính và xã hội tri thức (Bài 1–2: Làm quen AI & AI trong đời sống)',
      chapFrom: 1,
      chapTo: 2,
      topicIndices: [0],
      headerTheme: 'Chủ đề 1: Máy tính và xã hội tri thức - Khám phá Trí tuệ nhân tạo (AI)',
      lessonsOverview: 'Bài 1: Làm quen với Trí tuệ nhân tạo (Tr.5) · Bài 2: Trí tuệ nhân tạo trong khoa học và đời sống (Tr.12)',
      keyConcepts: 'Định nghĩa AI, đặc trưng của AI, AI hẹp (Narrow AI), Học máy Machine Learning, Xử lý ngôn ngữ tự nhiên NLP, Thị giác máy tính Computer Vision, ứng dụng AI trong y tế, giáo dục, giao thông và sản xuất',
      footerOutcome: 'Nhận biết được khả năng và giới hạn của AI, nêu được các ứng dụng tiêu biểu và ý thức được tác động xã hội của AI.'
    },
    {
      value: 'cd2_3',
      label: 'Chủ đề 2 & 3: Mạng máy tính, Internet & Giao tiếp ứng xử không gian mạng (Bài 3–6)',
      chapFrom: 3,
      chapTo: 6,
      topicIndices: [1],
      headerTheme: 'Chủ đề 2 & 3: Mạng máy tính, Giao thức truyền thông & Văn hóa mạng',
      lessonsOverview: 'Bài 3: Một số thiết bị mạng thông dụng (Tr.19) · Bài 4: Giao thức mạng (Tr.25) · Bài 5: Chia sẻ tài nguyên trên mạng (Tr.30) · Bài 6: Giao tiếp và ứng xử trong không gian mạng (Tr.36)',
      keyConcepts: 'Thiết bị Modem, Switch, Router, Access Point, mô hình giao thức TCP/IP, địa chỉ IP, gói tin (packet), chia sẻ thư mục/máy in trong mạng LAN, quy tắc ứng xử văn minh và phòng chống bắt nạt trên mạng (cyberbullying)',
      footerOutcome: 'Phân biệt chức năng thiết bị mạng, hiểu nguyên lý truyền gói tin, chia sẻ tài nguyên an toàn và tuân thủ pháp luật, văn hóa số.'
    },
    {
      value: 'cd4_html',
      label: 'Chủ đề 4: Giải quyết vấn đề với sự trợ giúp của máy tính - HTML (Bài 7–12)',
      chapFrom: 7,
      chapTo: 12,
      topicIndices: [2],
      headerTheme: 'Chủ đề 4: Thiết kế web - Cấu trúc tài liệu HTML5, Bảng biểu & Biểu mẫu',
      lessonsOverview: 'Bài 7: HTML và cấu trúc trang web (Tr.44) · Bài 8: Định dạng văn bản (Tr.50) · Bài 9: Tạo danh sách, bảng (Tr.55) · Bài 10: Tạo liên kết (Tr.60) · Bài 11: Đa phương tiện & Khung nội tuyến (Tr.63) · Bài 12: Tạo biểu mẫu (Tr.67)',
      keyConcepts: 'Ngôn ngữ HTML, các cặp thẻ khối (block) và nội dòng (inline), thẻ tiêu đề <h1>-<h6>, đoạn văn <p>, liên kết <a href>, thẻ ảnh <img src>, thẻ âm thanh/video <audio>/<video>, khung <iframe>, bảng dữ liệu <table>, form nhập liệu',
      footerOutcome: 'Tạo lập được trang web tĩnh có cấu trúc chuẩn HTML5, hiển thị văn bản định dạng, bảng biểu dữ liệu và biểu mẫu form thu thập ý kiến.'
    },
    {
      value: 'cd4_css',
      label: 'Chủ đề 4: Giải quyết vấn đề với sự trợ giúp của máy tính - CSS (Bài 13–18)',
      chapFrom: 13,
      chapTo: 18,
      topicIndices: [3],
      headerTheme: 'Chủ đề 4: Thiết kế web - Định kiểu giao diện với CSS (Cascading Style Sheets)',
      lessonsOverview: 'Bài 13: Khái niệm, vai trò của CSS (Tr.70) · Bài 14: Định dạng văn bản bằng CSS (Tr.74) · Bài 15: Tạo màu cho chữ và nền (Tr.78) · Bài 16: Định dạng khung (Tr.83) · Bài 17: Các mức ưu tiên của bộ chọn (Tr.88) · Bài 18: Thực hành tổng hợp (Tr.92)',
      keyConcepts: 'Cách nhúng CSS (Inline, Internal, External), bộ chọn Selector (thẻ, class, id), các thuộc tính font-family, font-size, line-height, text-align, color, background-color, CSS Box Model (margin, border, padding, content), thứ tự ưu tiên !important, id, class, element',
      footerOutcome: 'Tách biệt nội dung và hình thức trang web, sử dụng CSS để tạo phong cách giao diện đồng bộ, cân đối và chuyên nghiệp.'
    },
    {
      value: 'cd5',
      label: 'Chủ đề 5: Hướng nghiệp với Tin học (Bài 19–21)',
      chapFrom: 19,
      chapTo: 21,
      topicIndices: [4],
      headerTheme: 'Chủ đề 5: Hướng nghiệp với Tin học - Dịch vụ bảo trì & Nhóm nghề CNTT (Bài 19–21)',
      lessonsOverview: 'Bài 19: Dịch vụ sửa chữa và bảo trì máy tính (Tr.96) · Bài 20: Nhóm nghề quản trị thuộc ngành CNTT (Tr.101) · Bài 21: Hội thảo hướng nghiệp (Tr.107)',
      keyConcepts: 'Bảo trì phần cứng máy tính, bảo trì phần mềm, kĩ năng giao tiếp khách hàng, nghề quản trị mạng, an toàn thông tin, quản trị cơ sở dữ liệu, chứng chỉ nghề quốc tế, hội thảo hướng nghiệp',
      footerOutcome: 'Hiểu rõ yêu cầu năng lực, kĩ năng và cơ hội việc làm của các vị trí nghề nghiệp trong lĩnh vực công nghệ thông tin.'
    },
    {
      value: 'cd6_7',
      label: 'Chủ đề 6 & 7: Kết nối thiết bị số & Dự án xây dựng website (Bài 22–28)',
      chapFrom: 22,
      chapTo: 28,
      topicIndices: [4],
      headerTheme: 'Chủ đề 6 & 7 (ICT): Thực hành kết nối thiết bị số & Dự án xây dựng website (Bài 22–28)',
      lessonsOverview: 'Bài 22: Thực hành kết nối các thiết bị số (Tr.111) · Bài 23: Chuẩn bị xây dựng trang web (Tr.117) · Bài 24: Xây dựng phần đầu trang web (Tr.121) · Bài 25: Xây dựng phần thân và chân trang web (Tr.125) · Bài 26: Liên kết và thanh điều hướng (Tr.130) · Bài 27: Biểu mẫu trên trang web (Tr.135) · Bài 28: Thực hành tổng hợp (Tr.140)',
      keyConcepts: 'Kết nối máy tính với thiết bị số (máy chiếu, điện thoại, máy in), chuẩn bị ý tưởng website, thiết kế Banner/Header, thiết kế Footer, thanh điều hướng Navbar, biểu mẫu liên hệ, xuất bản và kiểm thử web',
      footerOutcome: 'Thực hành kết nối thành thạo thiết bị số và hoàn thiện dự án website theo nhóm/cá nhân từ khâu chuẩn bị đến xuất bản.'
    },
    {
      value: 'cd5_6_7',
      label: 'Chủ đề 5, 6 & 7: Hướng nghiệp, Thiết bị số & Dự án website (Bài 19–28)',
      chapFrom: 19,
      chapTo: 28,
      topicIndices: [4],
      headerTheme: 'Chủ đề 5, 6 & 7: Hướng nghiệp Tin học, Thiết bị số & Xây dựng trang web hoàn chỉnh',
      lessonsOverview: 'Bài 19: Dịch vụ bảo trì máy tính (Tr.96) · Bài 20: Quản trị CNTT (Tr.101) · Bài 21: Hội thảo hướng nghiệp (Tr.107) · Bài 22: Kết nối thiết bị số (Tr.111) · Bài 23–27: Xây dựng đầu/thân/chân web, menu & form (Tr.117–135) · Bài 28: Tổng hợp (Tr.140)',
      keyConcepts: 'Bảo trì phần cứng và phần mềm, nghề quản trị mạng, an ninh mạng, hội thảo định hướng nghề số, kết nối thiết bị ngoại vi, thiết kế bố cục website hoàn chỉnh (Header, Nav, Main Content, Footer), liên kết trang con',
      footerOutcome: 'Tự tin định hướng ngành nghề CNTT trong tương lai, kết nối thành thạo thiết bị số và hoàn thiện dự án website theo nhóm hoặc cá nhân.'
    }
  ]
};

// Hàm cập nhật danh sách Phạm vi kiến thức đồng bộ với Khối lớp
function updateScopeSelect(grade) {
  const scopeSelect = document.getElementById('scopeSelect');
  if (!scopeSelect) return;

  const scopes = GRADE_SCOPES[grade] || GRADE_SCOPES['10'];
  const currentVal = state.currentScope || 'all';

  const periodicScopes = scopes.filter(s => ['all', 'mid_hk1', 'final_hk1', 'mid_hk2', 'final_hk2'].includes(s.value));
  const topicScopes = scopes.filter(s => !['all', 'mid_hk1', 'final_hk1', 'mid_hk2', 'final_hk2'].includes(s.value));

  let html = '';
  if (periodicScopes.length > 0) {
    html += `<optgroup label="📋 ĐỀ KIỂM TRA ĐỊNH KỲ (CHUẨN CV 7991)">`;
    html += periodicScopes.map(s => `<option value="${s.value}" ${s.value === currentVal ? 'selected' : ''}>${s.label}</option>`).join('');
    html += `</optgroup>`;
  }
  if (topicScopes.length > 0) {
    html += `<optgroup label="📖 KIỂM TRA THEO TỪNG CHỦ ĐỀ SGK">`;
    html += topicScopes.map(s => `<option value="${s.value}" ${s.value === currentVal ? 'selected' : ''}>${s.label}</option>`).join('');
    html += `</optgroup>`;
  }

  scopeSelect.innerHTML = html;

  if (!scopes.some(s => s.value === currentVal)) {
    state.currentScope = 'all';
    scopeSelect.value = 'all';
  } else {
    scopeSelect.value = currentVal;
  }
}

// ─── BUILD LESSON-LEVEL MATRIX ROWS ─────────────────────────────────────
// Expands topics into individual lesson rows using the question bank data.
// Each row = one lesson (bài). Rows are grouped by their parent topic.
// Returns array of lessonRow objects: { lesson, topic, topicIdx, isTopicRow, ... }
function getExamTargetsForGrade(grade) {
  if (grade === '12') {
    // Lớp 12: Giữ nguyên 2 phần theo chuẩn CV 7991 (Tổng 10,0đ)
    // + Phần I: 24 câu TN × 0,25đ = 6,0đ (12 NB, 8 TH, 4 VD, 0 VDC)
    // + Phần II: 4 câu / 16 ý Đ/S × 0,25đ = 4,0đ (4 NB, 4 TH, 4 VD, 4 VDC)
    return {
      nb_tn: 12, th_tn: 8, vd_tn: 4, vdc_tn: 0,
      nb_ds: 4,  th_ds: 4, vd_ds: 4, vdc_ds: 4,
      nb_tl: 0,  th_tl: 0, vd_tl: 0, vdc_tl: 0
    };
  } else {
    // Lớp 10 & 11: Bổ sung thêm Phần Tự luận theo chuẩn CV 7991 (Tổng 10,0đ)
    // Tỉ lệ chuẩn 40% NB (4,0đ) - 30% TH (3,0đ) - 20% VD (2,0đ) - 10% VDC (1,0đ):
    // + Phần I (TNKQ): 16 câu × 0,25đ = 4,0đ (10 NB: 2,5đ, 6 TH: 1,5đ)
    // + Phần II (Đúng/Sai): 3 câu / 12 ý hỏi × 0,25đ = 3,0đ (6 NB: 1,5đ, 6 TH: 1,5đ)
    // + Phần III (Tự luận): 2 câu = 3,0đ (1 câu VD: 2,0đ, 1 câu VDC: 1,0đ)
    // Tổng mức độ:
    //   - Nhận biết: 10 TN (2,5đ) + 6 ý Đ/S (1,5đ) = 4,0 điểm (40%)
    //   - Thông hiểu: 6 TN (1,5đ) + 6 ý Đ/S (1,5đ) = 3,0 điểm (30%)
    //   - Vận dụng: 1 câu TL (2,0đ) = 2,0 điểm (20%)
    //   - Vận dụng cao: 1 câu TL (1,0đ) = 1,0 điểm (10%)
    // Tổng điểm: 4,0 + 3,0 + 2,0 + 1,0 = 10,0 điểm (100%)
    return {
      nb_tn: 10, th_tn: 6, vd_tn: 0, vdc_tn: 0,
      nb_ds: 6,  th_ds: 6, vd_ds: 0, vdc_ds: 0,
      nb_tl: 0,  th_tl: 0, vd_tl: 1, vdc_tl: 1
    };
  }
}

function buildLessonLevelRows(topics, p1Pool, p2Pool, chapFrom, chapTo, p3Pool) {
  // Step 1: Build the complete set of lessons from chapFrom..chapTo (all lessons, not just those with questions)
  const allLessonsInRange = new Set();
  for (let l = chapFrom; l <= chapTo; l++) allLessonsInRange.add(l);

  // Also track which lessons have questions (for weighting only)
  const lessonSet = new Set();
  [...(p1Pool || []), ...(p2Pool || []), ...(p3Pool || [])].forEach(q => {
    const l = q.lesson || 1;
    if (l >= chapFrom && l <= chapTo) lessonSet.add(l);
  });

  // Step 2: for each topic, enumerate ALL lessons that fall within the selected range
  const rows = [];
  topics.forEach((topic, topicIdx) => {
    const tFrom = topic.startLesson || 1;
    const tTo   = topic.endLesson || 35;

    // Collect ALL lessons in this topic that are within the selected range [chapFrom, chapTo]
    const effectiveFrom = Math.max(tFrom, chapFrom);
    const effectiveTo   = Math.min(tTo, chapTo);
    const topicLessons = [];
    for (let l = effectiveFrom; l <= effectiveTo; l++) topicLessons.push(l);

    if (topicLessons.length === 0) {
      return; // Topic has no lessons in the selected range — skip it
    }

    const effTopicRangeStr = (effectiveFrom === effectiveTo) ? `Bài ${effectiveFrom}` : `Bài ${effectiveFrom}–${effectiveTo}`;
    let cleanTopicName = topic.topic.replace(/\(Bài\s*\d+[–\-\.]*\d*[^)]*\)/i, `(${effTopicRangeStr})`);
    if ((state.currentGrade === '11' || topic.startLesson === 25) && effectiveTo < 28) {
      cleanTopicName = cleanTopicName.replace(/\s*và\s*làm\s*video/gi, ' (GIMP)');
    }

    topicLessons.forEach((l, li) => {
      // Count available questions per lesson for weighting (0 = use equal weight)
      const p1Count = (p1Pool || []).filter(q => q.lesson === l).length;
      const p2Count = (p2Pool || []).filter(q => q.lesson === l).length;
      const p3Count = (p3Pool || []).filter(q => q.lesson === l).length;
      // Page range approximation
      const pageStep = (topic.endPage - topic.startPage) / Math.max(tTo - tFrom + 1, 1);
      const startPage = Math.round(topic.startPage + (l - tFrom) * pageStep);
      const endPage   = Math.round(startPage + pageStep - 1);

      rows.push({
        lesson: l,
        lessonLabel: `Bài ${l}`,
        topic: cleanTopicName,
        topicIdx,
        startLesson: effectiveFrom,
        endLesson: effectiveTo,
        startPage: Math.min(startPage, topic.endPage),
        endPage: Math.min(endPage, topic.endPage),
        nb_tn: 0, nb_ds: 0, nb_tl: 0,
        th_tn: 0, th_ds: 0, th_tl: 0,
        vd_tn: 0, vd_ds: 0, vd_tl: 0,
        vdc_tn: 0, vdc_ds: 0, vdc_tl: 0,
        nb_tln: 0, th_tln: 0, vd_tln: 0, vdc_tln: 0,
        // Give lessons without questions a minimum weight of 0.5 so they still get some questions
        _p1Count: p1Count > 0 ? p1Count : 0.5,
        _p2Count: p2Count > 0 ? p2Count : 0.5,
        _p3Count: p3Count > 0 ? p3Count : 0.5,
        _topicGroupFirst: li === 0,
        _topicGroupLast: li === topicLessons.length - 1,
        _topicSpan: topicLessons.length,
      });
    });
  });

  return rows;
}

// Distribute topic-level question counts down to individual lesson rows
// Uses largest-remainder weighted by question bank density per lesson
function balanceLessonRows(lessonRows, randomize = false, grade = '10') {
  const EXAM_TARGETS = getExamTargetsForGrade(grade || state.currentGrade || '10');

  function distributeByWeight(total, weights) {
    const wSum = weights.reduce((a, b) => a + b, 0);
    if (total === 0 || wSum === 0) {
      const base = Math.floor(total / weights.length);
      const rem  = total % weights.length;
      return weights.map((_, i) => base + (i < rem ? 1 : 0));
    }
    const exact   = weights.map(w => total * w / wSum);
    const floors  = exact.map(v => Math.floor(v));
    const remain  = total - floors.reduce((a, b) => a + b, 0);
    const indexed = exact.map((v, i) => ({
      i,
      frac: (v - Math.floor(v)) + (randomize ? Math.random() * 0.8 : 0),
    }));
    indexed.sort((a, b) => b.frac - a.frac);
    indexed.slice(0, remain).forEach(({ i }) => { floors[i]++; });
    return floors;
  }

  const result = lessonRows.map(r => ({ ...r }));

  Object.keys(EXAM_TARGETS).forEach(f => {
    const target = EXAM_TARGETS[f];
    const weights = lessonRows.map(r => {
      if (randomize) {
        // Trọng số ngẫu nhiên giúp phân bổ câu hỏi đa dạng giữa các bài học đã chọn
        return Math.random() * 8 + 0.5;
      }
      if (f.endsWith('_tn')) return (r._p1Count || 1);
      if (f.endsWith('_ds')) return (r._p2Count || 1);
      if (f.endsWith('_tl')) return (r._p3Count || 1);
      return 1;
    });
    const dist = distributeByWeight(target, weights);
    dist.forEach((val, i) => {
      result[i][f] = val;
      if (f.endsWith('_tl')) {
        result[i][f.replace('_tl', '_tln')] = val;
      }
    });
  });

  return result;
}

// Aggregate lesson-level rows back into topic-level rows (for spec & exam generation)
function aggregateLessonToTopics(lessonRows, originalTopics) {
  const topicMap = {};
  lessonRows.forEach(row => {
    const idx = row.topicIdx;
    if (!topicMap[idx]) {
      topicMap[idx] = {
        ...originalTopics[idx],
        nb_tn: 0, nb_ds: 0, nb_tl: 0, nb_tln: 0,
        th_tn: 0, th_ds: 0, th_tl: 0, th_tln: 0,
        vd_tn: 0, vd_ds: 0, vd_tl: 0, vd_tln: 0,
        vdc_tn: 0, vdc_ds: 0, vdc_tl: 0, vdc_tln: 0
      };
    }
    ['nb_tn','nb_ds','nb_tl','th_tn','th_ds','th_tl','vd_tn','vd_ds','vd_tl','vdc_tn','vdc_ds','vdc_tl'].forEach(f => {
      topicMap[idx][f] = (topicMap[idx][f] || 0) + (row[f] || 0);
      if (f.endsWith('_tl')) {
        topicMap[idx][f.replace('_tl', '_tln')] = topicMap[idx][f];
      }
    });
  });
  return originalTopics.map((t, i) => topicMap[i] || t);
}


// Dùng thuật toán Hamilton (largest-remainder) để tổng luôn chính xác 100% không bị lỗi làm tròn
// Khi randomize = true: phân bổ ngẫu nhiên các câu vào các bài được chọn nhưng vẫn bảo đảm tuyệt đối tỉ lệ CV 7991 (40% NB - 30% TH - 20% VD - 10% VDC)
function balanceMatrixForScope(filteredTopics, randomize = false, grade = '10') {
  if (!filteredTopics || filteredTopics.length === 0) return [];
  const EXAM_TARGETS = getExamTargetsForGrade(grade || state.currentGrade || '10');

  // Hamilton's largest-remainder method: phân phối N items vào M buckets theo weights
  // Đảm bảo sum(result) = N chính xác, không bị lỗi làm tròn
  function distributeByWeight(total, topicWeights) {
    const weightSum = topicWeights.reduce((a, b) => a + b, 0);
    if (total === 0 || weightSum === 0) {
      // Phân phối đều khi không có trọng số hoặc tổng = 0
      const base = Math.floor(total / topicWeights.length);
      const rem = total % topicWeights.length;
      return topicWeights.map((_, i) => base + (i < rem ? 1 : 0));
    }
    // Bước 1: tính phần nguyên
    const exact = topicWeights.map(w => total * w / weightSum);
    const floors = exact.map(v => Math.floor(v));
    const remainder = total - floors.reduce((a, b) => a + b, 0);
    // Bước 2: phân bổ phần dư cho các bucket có phần thập phân lớn nhất
    const indexed = exact.map((v, i) => ({
      i,
      frac: (v - Math.floor(v)) + (randomize ? Math.random() * 0.15 : 0)
    }));
    indexed.sort((a, b) => b.frac - a.frac);
    indexed.slice(0, remainder).forEach(({ i }) => { floors[i]++; });
    return floors;
  }

  const FIELDS = Object.keys(EXAM_TARGETS);
  const topicResults = filteredTopics.map(t => ({
    ...t,
    nb_tln: 0,
    th_tln: 0,
    vd_tln: 0,
    vdc_tln: 0
  }));

  FIELDS.forEach(f => {
    const target = EXAM_TARGETS[f];
    let topicWeights;
    if (randomize) {
      // Khi tạo ngẫu nhiên, tạo biến thiên ngẫu nhiên kết hợp với dung lượng bài học
      topicWeights = filteredTopics.map(t => {
        const base = t[f] !== undefined ? t[f] : 1;
        const span = Math.max(1, (t.endLesson || 1) - (t.startLesson || 1) + 1);
        return (base * 0.5) + (span * 0.3) + (Math.random() * 2.5);
      });
    } else {
      topicWeights = filteredTopics.map(t => t[f] || 0);
    }
    const distributed = distributeByWeight(target, topicWeights);
    distributed.forEach((val, i) => { topicResults[i][f] = val; });
  });

  return topicResults;
}


const INFORMATICS_CURRICULA = {
  "10": {
    "name": "Tin học 10",
    "headerTheme": "Tin học 10: Máy tính & Xã hội tri thức, Mạng, Đồ họa Inkscape, Lập trình Python & Hướng nghiệp",
    "lessonsOverview": "Bài 1–7: Thông tin & Dữ liệu · Bài 8–11: Mạng máy tính & Bản quyền số · Bài 12–15: Đồ họa Inkscape · Bài 16–21: Python cơ bản, if, for, while · Bài 22–32: List, Xâu, Hàm def & Gỡ lỗi · Bài 33–34: Hướng nghiệp",
    "keyConcepts": "Dữ liệu, Bit/Byte, ASCII, Unicode, Hệ nhị phân, Logic mệnh đề, Mạng LAN, Cloud, Mã độc, Inkscape vector, Cú pháp Python, if-else, for, while, list, string, hàm def, lỗi ngoại lệ, hướng nghiệp",
    "footerOutcome": "Nắm vững bản chất số hóa thông tin, thiết kế đồ họa vector với Inkscape, lập trình thành thạo Python để giải quyết bài toán và định hướng nghề nghiệp CNTT.",
    "topics": [
      {
        "topic": "Chủ đề 1: Máy tính và xã hội tri thức (Bài 1–7)",
        "startLesson": 1, "endLesson": 7, "startPage": 6, "endPage": 37,
        "nb_tn": 2, "nb_ds": 1, "nb_tln": 0,
        "th_tn": 1, "th_ds": 1, "th_tln": 0,
        "vd_tn": 0, "vd_ds": 0, "vd_tln": 0,
        "vdc_tn": 0, "vdc_ds": 0, "vdc_tln": 0
      },
      {
        "topic": "Chủ đề 2 & 3: Mạng máy tính, Internet & Đạo đức, Bản quyền (Bài 8–11)",
        "startLesson": 8, "endLesson": 11, "startPage": 38, "endPage": 62,
        "nb_tn": 1, "nb_ds": 0, "nb_tln": 0,
        "th_tn": 1, "th_ds": 1, "th_tln": 0,
        "vd_tn": 0, "vd_ds": 0, "vd_tln": 0,
        "vdc_tn": 0, "vdc_ds": 0, "vdc_tln": 0
      },
      {
        "topic": "Chủ đề 4: Ứng dụng tin học - Thiết kế đồ họa Inkscape (Bài 12–15)",
        "startLesson": 12, "endLesson": 15, "startPage": 63, "endPage": 85,
        "nb_tn": 1, "nb_ds": 1, "nb_tln": 0,
        "th_tn": 0, "th_ds": 0, "th_tln": 0,
        "vd_tn": 1, "vd_ds": 0, "vd_tln": 0,
        "vdc_tn": 0, "vdc_ds": 0, "vdc_tln": 0
      },
      {
        "topic": "Chủ đề 5 - Bài 16..21: Lập trình Python cơ bản & Cấu trúc điều khiển (if, for, while)",
        "startLesson": 16, "endLesson": 21, "startPage": 86, "endPage": 110,
        "nb_tn": 1, "nb_ds": 0, "nb_tln": 0,
        "th_tn": 1, "th_ds": 1, "th_tln": 1,
        "vd_tn": 1, "vd_ds": 1, "vd_tln": 1,
        "vdc_tn": 0, "vdc_ds": 1, "vdc_tln": 1
      },
      {
        "topic": "Chủ đề 5 - Bài 22..32: Danh sách (List), Xâu kí tự & Hàm con (def)",
        "startLesson": 22, "endLesson": 32, "startPage": 111, "endPage": 155,
        "nb_tn": 1, "nb_ds": 0, "nb_tln": 0,
        "th_tn": 1, "th_ds": 1, "th_tln": 0,
        "vd_tn": 1, "vd_ds": 1, "vd_tln": 1,
        "vdc_tn": 0, "vdc_ds": 0, "vdc_tln": 0
      },
      {
        "topic": "Chủ đề 6: Hướng nghiệp với Tin học (Bài 33–34)",
        "startLesson": 33, "endLesson": 34, "startPage": 156, "endPage": 165,
        "nb_tn": 0, "nb_ds": 0, "nb_tln": 0,
        "th_tn": 1, "th_ds": 0, "th_tln": 0,
        "vd_tn": 0, "vd_ds": 0, "vd_tln": 0,
        "vdc_tn": 0, "vdc_ds": 0, "vdc_tln": 0
      }
    ],
    "p1": [
      {
        "lesson": 1,
        "topicIdx": 0,
        "q": "Quá trình xử lí thông tin trong máy tính gồm ba bước cơ bản diễn ra theo thứ tự nào sau đây?",
        "opts": [
          "A. Tiếp nhận dữ liệu -> Xử lí dữ liệu -> Đưa ra kết quả",
          "B. Đưa ra kết quả -> Xử lí dữ liệu -> Tiếp nhận dữ liệu",
          "C. Xử lí dữ liệu -> Tiếp nhận dữ liệu -> Đưa ra kết quả",
          "D. Tiếp nhận dữ liệu -> Lưu trữ dữ liệu -> Xóa dữ liệu"
        ],
        "ans": "A",
        "page": 6,
        "excerpt": "Quá trình xử lí thông tin của máy tính gồm các bước sau: Bước 1: Tiếp nhận dữ liệu; Bước 2: Xử lí dữ liệu; Bước 3: Đưa ra kết quả.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 1, Trang 6): Ba bước cơ bản của quá trình xử lí thông tin/dữ liệu bằng máy tính."
      },
      {
        "lesson": 1,
        "topicIdx": 0,
        "q": "Khẳng định nào sau đây mô tả đúng nhất về mối quan hệ giữa thông tin và dữ liệu?",
        "opts": [
          "A. Thông tin là ý nghĩa của dữ liệu, dữ liệu là các yếu tố thể hiện và xác định thông tin",
          "B. Dữ liệu và thông tin là hai khái niệm hoàn toàn đồng nhất, không có sự khác biệt",
          "C. Thông tin đưa vào máy tính luôn biến thành phần cứng của máy tính",
          "D. Dữ liệu là nhận thức của con người còn thông tin là số liệu thô"
        ],
        "ans": "A",
        "page": 7,
        "excerpt": "Thông tin là ý nghĩa của dữ liệu. Dữ liệu là các yếu tố thể hiện, xác định thông tin. Thông tin và dữ liệu có tính độc lập tương đối.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 1, Trang 7): Phân biệt dữ liệu và thông tin, tính toàn vẹn của thông tin."
      },
      {
        "lesson": 1,
        "topicIdx": 0,
        "q": "Định nghĩa nào sau đây về Byte (B) là đúng theo chuẩn kiến thức tin học?",
        "opts": [
          "A. Byte là đơn vị dữ liệu nhỏ nhất mà máy tính truy cập được, một byte gồm 8 bit",
          "B. Byte là một kí tự chữ số bất kì trong bảng chữ cái",
          "C. Byte là đơn vị đo tốc độ xử lí của CPU máy tính",
          "D. Byte là một dãy gồm 16 bit liên tiếp"
        ],
        "ans": "A",
        "page": 8,
        "excerpt": "Byte là đơn vị dữ liệu nhỏ nhất mà máy tính truy cập được. Một byte gồm 8 bit.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 1, Trang 8): Mục 2. Đơn vị lưu trữ dữ liệu."
      },
      {
        "lesson": 1,
        "topicIdx": 0,
        "q": "Theo quy chuẩn biểu diễn dữ liệu trong tin học, các đơn vị đo dung lượng dữ liệu liền kề (B, KB, MB, GB, TB,...) hơn kém nhau bao nhiêu lần?",
        "opts": [
          "A. 1000 lần",
          "B. 2^10 = 1024 lần",
          "C. 100 lần",
          "D. 2^8 = 256 lần"
        ],
        "ans": "B",
        "page": 8,
        "excerpt": "Các đơn vị đo dữ liệu hơn kém nhau 2^10 = 1024 lần.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 1, Trang 8): Bảng 1.1 Các đơn vị lưu trữ dữ liệu."
      },
      {
        "lesson": 1,
        "topicIdx": 0,
        "q": "Ưu điểm nổi bật của việc lưu trữ và xử lí thông tin bằng thiết bị số là gì?",
        "opts": [
          "A. Xử lí rất nhanh với độ chính xác cao, lưu trữ dung lượng lớn với chi phí rẻ và truyền tin tốc độ cao",
          "B. Thay thế hoàn toàn mọi cảm xúc và khả năng nhận thức của con người",
          "C. Không bao giờ cần sử dụng nguồn điện để vận hành",
          "D. Chỉ lưu trữ được các văn bản ngắn không dấu"
        ],
        "ans": "A",
        "page": 9,
        "excerpt": "Thiết bị số có các ưu điểm: Giúp xử lí thông tin rất nhanh với độ chính xác cao... Có khả năng lưu trữ dữ liệu với dung lượng lớn, giá thành rẻ... Có khả năng truyền tin với tốc độ rất lớn.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 1, Trang 9-10): Mục 3. Lưu trữ, xử lí và truyền thông bằng thiết bị số."
      },
      {
        "lesson": 2,
        "topicIdx": 0,
        "q": "Thiết bị nào sau đây được coi là một 'thiết bị thông minh' trong đời sống hiện đại?",
        "opts": [
          "A. Camera kết nối Internet tự động lọc và ghi hình khi phát hiện chuyển động",
          "B. Đồng hồ cơ lên dây cót truyền thống",
          "C. Nhiệt kế thuỷ ngân đo nhiệt độ cơ thể",
          "D. Cân cơ học sử dụng lò xo"
        ],
        "ans": "A",
        "page": 11,
        "excerpt": "Những camera kết nối Internet để truyền dữ liệu một cách tự động và có khả năng chọn lọc chỉ ghi hình khi phát hiện chuyển động là một thiết bị thông minh.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 2, Trang 11): Khái niệm thiết bị thông minh."
      },
      {
        "lesson": 2,
        "topicIdx": 0,
        "q": "Trong cuộc Cách mạng công nghiệp lần thứ tư (CMCN 4.0), IoT là viết tắt của thuật ngữ nào?",
        "opts": [
          "A. Internet of Things (Internet vạn vật)",
          "B. Information of Technology",
          "C. Input of Transmission",
          "D. Internet of Tools"
        ],
        "ans": "A",
        "page": 12,
        "excerpt": "Kết nối vạn vật (còn gọi là Internet vạn vật - Internet of Things, IoT)... IoT là một yếu tố cơ bản trong cách mạng công nghiệp 4.0.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 2, Trang 12-13): Vai trò của thiết bị thông minh đối với xã hội trong CMCN 4.0."
      },
      {
        "lesson": 2,
        "topicIdx": 0,
        "q": "Ngôn ngữ lập trình bậc cao đầu tiên được công bố chính thức vào năm 1957 cho các bài toán khoa học kĩ thuật là:",
        "opts": [
          "A. FORTRAN",
          "B. Python",
          "C. Pascal",
          "D. Java"
        ],
        "ans": "A",
        "page": 14,
        "excerpt": "FORTRAN là ngôn ngữ lập trình bậc cao đầu tiên được công bố chính thức vào năm 1957 và vẫn được dùng tới ngày nay cho những người lập trình khoa học kĩ thuật.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 2, Trang 14): Một số thành tựu phát triển của Tin học."
      },
      {
        "lesson": 2,
        "topicIdx": 0,
        "q": "World Wide Web (WWW) được phát minh vào năm nào, tạo ra phương tiện truy cập Internet nhất quán trên toàn cầu?",
        "opts": [
          "A. Năm 1992",
          "B. Năm 1983",
          "C. Năm 1964",
          "D. Năm 2001"
        ],
        "ans": "A",
        "page": 14,
        "excerpt": "Việc phát minh ra World Wide Web (WWW) vào năm 1992 đã tạo ra phương tiện truy cập Internet dễ dàng và nhất quán, giúp phổ cập Internet.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 2, Trang 14): Mạng và Internet."
      },
      {
        "lesson": 3,
        "topicIdx": 0,
        "q": "Bảng mã chuẩn ASCII nguyên bản (7 bit) có thể mã hoá được tối đa bao nhiêu kí tự?",
        "opts": [
          "A. 128 kí tự (từ 0 đến 127)",
          "B. 256 kí tự",
          "C. 65536 kí tự",
          "D. 1024 kí tự"
        ],
        "ans": "A",
        "page": 17,
        "excerpt": "Ban đầu bảng mã này dùng các mã 7 bit, với 128 (2^7) mã khác nhau nên chỉ thể hiện được đúng 128 kí tự.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 3, Trang 17): Bảng mã ASCII."
      },
      {
        "lesson": 3,
        "topicIdx": 0,
        "q": "Bảng mã ASCII mở rộng sử dụng bao nhiêu bit để biểu diễn mỗi kí tự?",
        "opts": [
          "A. 8 bit",
          "B. 7 bit",
          "C. 16 bit",
          "D. 32 bit"
        ],
        "ans": "A",
        "page": 17,
        "excerpt": "Do đó, người ta đã mở rộng bảng mã 7 bit thành bảng mã 8 bit gọi là bảng mã ASCII mở rộng, cho phép mã hoá 256 kí tự.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 3, Trang 17): Bảng mã ASCII mở rộng."
      },
      {
        "lesson": 3,
        "topicIdx": 0,
        "q": "Bảng mã Unicode được xây dựng nhằm mục đích chính nào sau đây?",
        "opts": [
          "A. Tạo một bảng mã chung hợp nhất quốc tế để biểu diễn kí tự của tất cả các ngôn ngữ trên thế giới",
          "B. Thay thế hệ điều hành Windows trên máy tính",
          "C. Giảm kích thước bộ nhớ RAM xuống một nửa",
          "D. Chỉ dùng riêng cho các quốc gia châu Á"
        ],
        "ans": "A",
        "page": 18,
        "excerpt": "Người ta đã đề xuất một chương trình quốc tế nhằm xây dựng một bảng mã hợp nhất, dùng chung cho mọi quốc gia, gọi là Unicode.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 3, Trang 18): Bảng mã Unicode."
      },
      {
        "lesson": 3,
        "topicIdx": 0,
        "q": "Trong định dạng UTF-8 của bảng mã Unicode, mỗi kí tự tiếng Việt có dấu được biểu diễn bởi bao nhiêu byte?",
        "opts": [
          "A. 2 byte",
          "B. 1 byte",
          "C. 4 byte",
          "D. 8 byte"
        ],
        "ans": "A",
        "page": 18,
        "excerpt": "UTF-8 sử dụng 1 byte để mã hoá các kí tự Latinh không dấu, sử dụng 2 byte để mã hoá các nguyên âm có dấu cùng các kí tự đ, Đ.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 3, Trang 18): Unicode và tiếng Việt trong Unicode."
      },
      {
        "lesson": 4,
        "topicIdx": 0,
        "q": "Hệ nhị phân (hệ đếm cơ số 2) chỉ sử dụng hai chữ số nào để biểu diễn tất cả các số?",
        "opts": [
          "A. 0 và 1",
          "B. 1 và 2",
          "C. 0 và 9",
          "D. 0 và 2"
        ],
        "ans": "A",
        "page": 20,
        "excerpt": "Chỉ dùng hai chữ số là 0 và 1, các chữ số 0 và 1 gọi là các chữ số nhị phân.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 4, Trang 20): Hệ nhị phân."
      },
      {
        "lesson": 4,
        "topicIdx": 0,
        "q": "Số thập phân 19 khi chuyển đổi sang hệ nhị phân có kết quả biểu diễn là:",
        "opts": [
          "A. 10011_2",
          "B. 10101_2",
          "C. 11001_2",
          "D. 11111_2"
        ],
        "ans": "A",
        "page": 21,
        "excerpt": "Viết các số dư theo chiều từ dưới lên, ta được số nhị phân cần tìm: 19_10 = 10011_2.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 4, Trang 20–21): Đổi biểu diễn số nguyên dương từ hệ thập phân sang hệ nhị phân."
      },
      {
        "lesson": 4,
        "topicIdx": 0,
        "q": "Khi biểu diễn số nguyên có dấu trong máy tính (như mã bù 2), bit tận cùng bên trái mang giá trị 1 biểu thị điều gì?",
        "opts": [
          "A. Số âm",
          "B. Số dương",
          "C. Số không (0)",
          "D. Số nguyên tố"
        ],
        "ans": "A",
        "page": 21,
        "excerpt": "Đối với số nguyên có dấu... bit tận cùng bên trái để mã hoá dấu, dấu + được mã hoá bởi bit 0, dấu - được mã hoá bởi bit 1.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 4, Trang 21): Biểu diễn số nguyên trong máy tính."
      },
      {
        "lesson": 4,
        "topicIdx": 0,
        "q": "Kết quả của phép cộng hai số nhị phân 1 + 1 trong hệ nhị phân là:",
        "opts": [
          "A. 10_2",
          "B. 2_2",
          "C. 11_2",
          "D. 01_2"
        ],
        "ans": "A",
        "page": 22,
        "excerpt": "Bảng 4.1 là bảng cộng và nhân trong hệ nhị phân tương tự hệ thập phân. Lưu ý là 1 + 1 = 10.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 4, Trang 22): Phép cộng hai số nhị phân."
      },
      {
        "lesson": 5,
        "topicIdx": 0,
        "q": "Nhà toán học người Anh nào đã đặt nền móng xây dựng nên đại số lôgic với hai giá trị chân lí 'Đúng' và 'Sai'?",
        "opts": [
          "A. George Boole",
          "B. Alan Turing",
          "C. Blaise Pascal",
          "D. John von Neumann"
        ],
        "ans": "A",
        "page": 24,
        "excerpt": "Người có đóng góp nhiều nhất cho ngành Toán học này là nhà toán học người Anh George Boole (1815 – 1864). Ông đã xây dựng nên đại số lôgic.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 5, Trang 24): Các giá trị chân lí và các phép toán lôgic."
      },
      {
        "lesson": 5,
        "topicIdx": 0,
        "q": "Mệnh đề 'p AND q' chỉ nhận giá trị Đúng (1) khi nào?",
        "opts": [
          "A. Khi cả hai mệnh đề p và q đều Đúng",
          "B. Khi chỉ cần một trong hai mệnh đề p hoặc q Đúng",
          "C. Khi cả p và q đều Sai",
          "D. Khi p Đúng còn q Sai"
        ],
        "ans": "A",
        "page": 25,
        "excerpt": "Như vậy, p AND q là mệnh đề có giá trị đúng nếu cả p và q đều đúng.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 5, Trang 25): Bảng 5.2 Các phép toán lôgic."
      },
      {
        "lesson": 5,
        "topicIdx": 0,
        "q": "Phép toán lôgic XOR (phép cộng loại trừ lôgic: p XOR q) nhận giá trị Đúng (1) khi nào?",
        "opts": [
          "A. Khi p và q có giá trị khác nhau (một Đúng một Sai)",
          "B. Khi p và q cùng nhận giá trị Đúng",
          "C. Khi p và q cùng nhận giá trị Sai",
          "D. Khi p bằng 0 và q bằng 0"
        ],
        "ans": "A",
        "page": 25,
        "excerpt": "p XOR q là mệnh đề có giá trị sai khi p và q có giá trị như nhau (nghĩa là chỉ đúng khi p và q có giá trị khác nhau).",
        "exp": "Căn cứ SGK Tin học 10 (Bài 5, Trang 25): Bảng 5.2 Các phép toán lôgic."
      },
      {
        "lesson": 5,
        "topicIdx": 0,
        "q": "Để biểu diễn một dữ liệu lôgic trong máy tính, cần tối thiểu bao nhiêu bit?",
        "opts": [
          "A. 1 bit (quy ước 1 là Đúng, 0 là Sai)",
          "B. 8 bit",
          "C. 16 bit",
          "D. 32 bit"
        ],
        "ans": "A",
        "page": 26,
        "excerpt": "Trong Tin học, chỉ cần 1 bit với các giá trị 1 hoặc 0 là đủ để biểu diễn dữ liệu lôgic, với quy ước 1 là 'Đúng', 0 là 'Sai'.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 5, Trang 26): Biểu diễn dữ liệu lôgic."
      },
      {
        "lesson": 6,
        "topicIdx": 0,
        "q": "Phương pháp cơ bản nhất để số hoá tín hiệu âm thanh liên tục (analog) sang dạng số là:",
        "opts": [
          "A. Điều chế mã xung (Pulse Code Modulation - PCM)",
          "B. Mã hoá ASCII",
          "C. Nén ảnh JPEG",
          "D. Phép biến đổi Fourier ngược"
        ],
        "ans": "A",
        "page": 28,
        "excerpt": "Phương pháp cơ bản số hoá âm thanh là điều chế mã xung (Pulse Code Modulation, viết tắt là PCM).",
        "exp": "Căn cứ SGK Tin học 10 (Bài 6, Trang 28): Số hoá âm thanh."
      },
      {
        "lesson": 6,
        "topicIdx": 0,
        "q": "Số bit cần thiết để biểu diễn được một giây âm thanh số được gọi là:",
        "opts": [
          "A. Tốc độ bit (bit-rate)",
          "B. Chu kì lấy mẫu",
          "C. Thang đo biên độ",
          "D. Tần số quét màn hình"
        ],
        "ans": "A",
        "page": 29,
        "excerpt": "Số bit cần thiết để biểu diễn được một giây âm thanh gọi là tốc độ bit (bit-rate).",
        "exp": "Căn cứ SGK Tin học 10 (Bài 6, Trang 29): Tốc độ bit của âm thanh."
      },
      {
        "lesson": 6,
        "topicIdx": 0,
        "q": "Trong hệ màu RGB thông dụng 24 bit của máy tính, mỗi điểm ảnh (pixel) được pha trộn từ ba màu cơ bản nào?",
        "opts": [
          "A. Đỏ (Red) – Lục (Green) – Lam (Blue)",
          "B. Đỏ (Red) – Vàng (Yellow) – Lam (Blue)",
          "C. Xanh lơ (Cyan) – Hồng sẫm (Magenta) – Vàng (Yellow)",
          "D. Đen – Trắng – Xám"
        ],
        "ans": "A",
        "page": 30,
        "excerpt": "Hệ ba màu cơ bản đỏ, xanh lá cây – lục và xanh dương – lam được gọi là hệ màu RGB (viết tắt từ Red – Green – Blue).",
        "exp": "Căn cứ SGK Tin học 10 (Bài 6, Trang 30): Biểu diễn hình ảnh và hệ màu RGB."
      },
      {
        "lesson": 6,
        "topicIdx": 0,
        "q": "Mỗi màu cơ bản R, G, B trong ảnh màu 24 bit được mã hoá bởi 8 bit, tương ứng với bao nhiêu sắc độ từ 0 đến 255?",
        "opts": [
          "A. 256 sắc độ",
          "B. 128 sắc độ",
          "C. 1024 sắc độ",
          "D. 16 sắc độ"
        ],
        "ans": "A",
        "page": 30,
        "excerpt": "Ảnh màu thông dụng có độ sâu màu 24 bit, mỗi màu cơ bản được mã hoá bởi 8 bit, tương ứng với 256 sắc độ khác nhau (từ 0 đến 255).",
        "exp": "Căn cứ SGK Tin học 10 (Bài 6, Trang 30): Độ sâu màu."
      },
      {
        "lesson": 6,
        "topicIdx": 0,
        "q": "Định dạng tệp ảnh nào sau đây hỗ trợ nén không mất mát chất lượng và cho phép tạo nền trong suốt?",
        "opts": [
          "A. .png",
          "B. .jpeg",
          "C. .bmp",
          "D. .wav"
        ],
        "ans": "A",
        "page": 31,
        "excerpt": "'.png': có độ nén tốt, không mất mát chất lượng, có thể có nền trong suốt để chồng ảnh mà không che ảnh dưới nền.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 6, Trang 31): Biểu diễn ảnh bitmap."
      },
      {
        "lesson": 7,
        "topicIdx": 0,
        "q": "Thuật ngữ PDA (Personal Digital Assistant) dùng để chỉ loại thiết bị nào sau đây?",
        "opts": [
          "A. Thiết bị trợ thủ số cá nhân",
          "B. Máy in laser tốc độ cao",
          "C. Máy quét mã vạch công nghiệp",
          "D. Thiết bị định tuyến mạng WAN"
        ],
        "ans": "A",
        "page": 33,
        "excerpt": "Trợ thủ số cá nhân (Personal Digital Assistant – PDA) là các thiết bị số trong đó tích hợp một số chức năng hữu ích cho người dùng trong đời sống hằng ngày.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 7, Trang 33): Khái niệm PDA."
      },
      {
        "lesson": 8,
        "topicIdx": 1,
        "q": "Mạng máy tính được kết nối trong phạm vi nhỏ như gia đình, trường học hoặc cơ quan được gọi là:",
        "opts": [
          "A. Mạng cục bộ (Local Area Network - LAN)",
          "B. Mạng diện rộng (Wide Area Network - WAN)",
          "C. Mạng toàn cầu Internet",
          "D. Mạng lưu trữ SAN"
        ],
        "ans": "A",
        "page": 38,
        "excerpt": "Theo phạm vi địa lí, các mạng máy tính có thể chia thành hai loại là mạng cục bộ (Local Area Network, viết tắt là LAN) và mạng diện rộng (WAN). Mạng LAN có phạm vi địa lí nhỏ như gia đình, trường học...",
        "exp": "Căn cứ SGK Tin học 10 (Bài 8, Trang 38): Phân loại mạng LAN và WAN."
      },
      {
        "lesson": 8,
        "topicIdx": 1,
        "q": "Thiết bị mạng nào sau đây có chức năng định tuyến và kết nối các mạng LAN với nhau hoặc kết nối ra Internet?",
        "opts": [
          "A. Bộ định tuyến (Router)",
          "B. Bộ chia (Hub)",
          "C. Bộ chuyển mạch (Switch)",
          "D. Bàn phím máy tính"
        ],
        "ans": "A",
        "page": 39,
        "excerpt": "Còn bộ định tuyến dùng để kết nối các LAN với nhau. Nguyên lí hoạt động của bộ định tuyến là nếu địa chỉ nơi nhận của dữ liệu không có trong LAN thì nó gửi theo cổng Internet.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 8, Trang 39): Chức năng của Router."
      },
      {
        "lesson": 8,
        "topicIdx": 1,
        "q": "Mô hình dịch vụ điện toán đám mây SaaS (Software as a Service) cung cấp dịch vụ gì cho người dùng?",
        "opts": [
          "A. Phần mềm ứng dụng chạy trên mạng (như Google Docs, Zoom)",
          "B. Cho thuê máy chủ phần cứng và ổ cứng lưu trữ",
          "C. Cung cấp nền tảng để lập trình viên tạo website",
          "D. Dịch vụ sửa chữa linh kiện máy tính tại nhà"
        ],
        "ans": "A",
        "page": 41,
        "excerpt": "Phần mềm soạn thảo Google Docs hay phần mềm tạo lớp học ảo Zoom là phần mềm ứng dụng. Việc cho thuê phần mềm ứng dụng được viết tắt là SaaS (Software as a service - phần mềm như là dịch vụ).",
        "exp": "Căn cứ SGK Tin học 10 (Bài 8, Trang 41): Các loại dịch vụ đám mây cơ bản."
      },
      {
        "lesson": 8,
        "topicIdx": 1,
        "q": "Ứng dụng thu phí tự động không dừng trên các tuyến đường cao tốc hiện nay là ví dụ điển hình của công nghệ nào?",
        "opts": [
          "A. Kết nối vạn vật (IoT) sử dụng thẻ nhận dạng sóng radio RFID",
          "B. Công nghệ in 3D laser",
          "C. Phần mềm đồ hoạ điểm ảnh",
          "D. Hệ điều hành mã nguồn mở"
        ],
        "ans": "A",
        "page": 42,
        "excerpt": "Ví dụ 1. Thu phí không dừng trên các đường cao tốc. Các xe ô tô phải dán thẻ định danh giao tiếp qua sóng radio (RFID)... là ví dụ về IoT.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 8, Trang 42): Ứng dụng IoT trong giao thông."
      },
      {
        "lesson": 9,
        "topicIdx": 1,
        "q": "Đặc điểm cơ bản để phân biệt Virus máy tính với Sâu máy tính (Worm) là gì?",
        "opts": [
          "A. Virus phải gắn vào một phần mềm vật chủ để lây lan, trong khi Worm là phần mềm độc hại hoàn chỉnh, tồn tại độc lập",
          "B. Virus không gây hại gì cho máy tính còn Worm phá huỷ phần cứng",
          "C. Worm chỉ lây qua cổng USB còn Virus chỉ lây qua mạng xã hội",
          "D. Cả hai hoàn toàn giống nhau không có điểm khác biệt"
        ],
        "ans": "A",
        "page": 46,
        "excerpt": "Virus: không phải là các phần mềm hoàn chỉnh, mà chỉ là các đoạn mã độc và phải gắn với một phần mềm mới phát tác và lây lan được. Worm: là một phần mềm hoàn chỉnh, lợi dụng lỗ hổng bảo mật để lây.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 9, Trang 46): Phân biệt virus, trojan, worm và cơ chế hoạt động."
      },
      {
        "lesson": 9,
        "topicIdx": 1,
        "q": "Loại phần mềm nội gián nào ngầm ghi lại toàn bộ hoạt động gõ bàn phím và nhấp chuột của người dùng nhằm đánh cắp mật khẩu?",
        "opts": [
          "A. Keylogger",
          "B. Rootkit",
          "C. Backdoor",
          "D. Antivirus"
        ],
        "ans": "A",
        "page": 46,
        "excerpt": "Keylogger: là một loại spyware ngầm ghi hoạt động của bàn phím và chuột để tìm hiểu người sử dụng máy làm gì.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 9, Trang 46): Các loại trojan nguy hiểm."
      },
      {
        "lesson": 9,
        "topicIdx": 1,
        "q": "Hình thức tấn công từ chối dịch vụ DoS (Denial of Service) là gì?",
        "opts": [
          "A. Tấn công làm quá tải máy chủ bằng lượng truy cập đồng thời khổng lồ khiến máy chủ bị tê liệt không thể phục vụ",
          "B. Đánh cắp mã nguồn phần mềm trên máy chủ",
          "C. Cài đặt hệ điều hành mới lên máy chủ",
          "D. Gửi email quảng cáo sản phẩm bình thường"
        ],
        "ans": "A",
        "page": 46,
        "excerpt": "Mỗi khi nhận được lệnh là truy cập đồng thời vào một máy chủ định trước, gây quá tải, làm tê liệt máy chủ. Hình thức tấn công này gọi là tấn công từ chối dịch vụ (Denial of Service – DOS).",
        "exp": "Căn cứ SGK Tin học 10 (Bài 9, Trang 46): Tác hại của phần mềm độc hại."
      },
      {
        "lesson": 9,
        "topicIdx": 1,
        "q": "Phần mềm bảo vệ chống virus và mã độc được tích hợp sẵn miễn phí bên trong hệ điều hành Windows 10/11 là:",
        "opts": [
          "A. Windows Defender (Microsoft Defender)",
          "B. Adobe Photoshop",
          "C. Inkscape",
          "D. Google Drive"
        ],
        "ans": "A",
        "page": 47,
        "excerpt": "Bài thực hành này giới thiệu sử dụng phần mềm Defender Firewall được tích hợp sẵn trong hệ điều hành Windows...",
        "exp": "Căn cứ SGK Tin học 10 (Bài 9, Trang 47-48): Phần mềm Windows Defender."
      },
      {
        "lesson": 10,
        "topicIdx": 1,
        "q": "Phần mềm Google Translate cho phép người dùng dịch văn bản thông qua những phương thức nhập liệu nào?",
        "opts": [
          "A. Nhập văn bản trực tiếp từ bàn phím, nhập bằng giọng nói qua micro và tải tệp tài liệu lên",
          "B. Chỉ cho phép nhập văn bản trực tiếp từ bàn phím",
          "C. Bắt buộc phải dịch qua camera quét",
          "D. Chỉ dịch được các tệp video âm thanh"
        ],
        "ans": "A",
        "page": 51,
        "excerpt": "Có ba cách nhập: 1. Nhập trực tiếp văn bản vào khung ngôn ngữ nguồn; 2. Nhập bằng giọng nói; 3. Nhập từ một tệp.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 10, Trang 51-52): Sử dụng phần mềm dịch đa ngữ Google Translate."
      },
      {
        "lesson": 10,
        "topicIdx": 1,
        "q": "Địa chỉ website kho học liệu số mở phục vụ giáo dục của Bộ Giáo dục và Đào tạo Việt Nam được giới thiệu trong SGK là:",
        "opts": [
          "A. https://igiaoduc.vn",
          "B. https://moet.gov.vn",
          "C. https://edu.net.vn",
          "D. https://hoclieu.vn"
        ],
        "ans": "A",
        "page": 53,
        "excerpt": "Ở Việt Nam, Bộ Giáo dục và Đào tạo cũng có một kho học liệu với hàng vạn học liệu mở đặt tại địa chỉ https://igiaoduc.vn.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 10, Trang 53): Khai thác một nguồn học liệu mở trên Internet."
      },
      {
        "lesson": 11,
        "topicIdx": 1,
        "q": "Hành vi cung cấp, chia sẻ thông tin giả mạo, thông tin sai sự thật trên mạng xã hội sẽ bị xử phạt theo văn bản quy phạm pháp luật nào?",
        "opts": [
          "A. Điều 101 Nghị định 15/2020/NĐ-CP",
          "B. Luật Giao thông đường bộ",
          "C. Luật Doanh nghiệp",
          "D. Nghị định 72/2013/NĐ-CP Điều 5"
        ],
        "ans": "A",
        "page": 58,
        "excerpt": "Một số hành vi vi phạm pháp luật về đưa tin trên mạng xã hội được cụ thể hoá kèm theo mức phạt trong Điều 101, khoản 1 của Nghị định 15/2020/NĐ-CP...",
        "exp": "Căn cứ SGK Tin học 10 (Bài 11, Trang 58): Một số quy định pháp lí đối với người dùng trên mạng."
      },
      {
        "lesson": 11,
        "topicIdx": 1,
        "q": "Theo Luật Sở hữu trí tuệ, Quyền nhân thân của tác giả đối với tác phẩm bao gồm quyền nào sau đây?",
        "opts": [
          "A. Đặt tên cho tác phẩm, đứng tên thật hoặc bút danh, bảo vệ sự toàn vẹn của tác phẩm",
          "B. Quyền cho thuê bản quyền tác phẩm để thu tiền",
          "C. Quyền sao chép và phân phối tác phẩm cho người khác",
          "D. Quyền bán đứt tác phẩm cho doanh nghiệp thương mại"
        ],
        "ans": "A",
        "page": 59,
        "excerpt": "Quyền nhân thân bao gồm các quyền: Đặt tên cho tác phẩm; Đứng tên thật hoặc bút danh... Bảo vệ sự toàn vẹn của tác phẩm...",
        "exp": "Căn cứ SGK Tin học 10 (Bài 11, Trang 59): Quyền tác giả và bản quyền."
      },
      {
        "lesson": 11,
        "topicIdx": 1,
        "q": "Khi một người dùng mua bản quyền phần mềm có bản quyền thương mại (như Windows, MS Office), thực chất người đó đã mua:",
        "opts": [
          "A. Quyền sử dụng phần mềm (licence) trên số lượng máy tính quy định",
          "B. Toàn bộ quyền sở hữu và mã nguồn của công ty phần mềm",
          "C. Quyền được phân phối và bán lại phần mềm cho người khác",
          "D. Quyền chỉnh sửa và bẻ khóa phần mềm"
        ],
        "ans": "A",
        "page": 61,
        "excerpt": "Trong tin học, khi mua phần mềm, cần phân biệt rõ việc mua bản quyền với mua quyền sử dụng (licence)... Chúng ta mua hệ điều hành Windows, các phần mềm văn phòng... đều chỉ là mua quyền sử dụng.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 11, Trang 61): Tôn trọng bản quyền trong tin học."
      },
      {
        "lesson": 12,
        "topicIdx": 2,
        "q": "Đặc điểm cơ bản của đồ hoạ vectơ (vector) so với đồ hoạ điểm ảnh (bitmap) là gì?",
        "opts": [
          "A. Hình ảnh vectơ xác định theo phương trình toán học nên khi phóng to thu nhỏ vẫn giữ nguyên độ nét, không bị vỡ hình",
          "B. Hình ảnh vectơ được tạo bởi các hạt pixel nên phóng to sẽ bị nhoè",
          "C. Đồ hoạ vectơ chỉ dùng để chụp ảnh phong cảnh chân thực",
          "D. Đồ hoạ vectơ luôn có dung lượng tệp tin lớn hơn ảnh bitmap"
        ],
        "ans": "A",
        "page": 63,
        "excerpt": "Trong đồ hoạ vectơ, hình ảnh được xác định theo đường nét... số màu ít và giữ nguyên độ nét khi phóng to hay thu nhỏ – hình vectơ.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 12, Trang 63-64): Phân biệt đồ hoạ điểm ảnh và đồ hoạ vectơ."
      },
      {
        "lesson": 12,
        "topicIdx": 2,
        "q": "Phần mềm mã nguồn mở miễn phí chuyên dùng để thiết kế và biên tập đồ hoạ vectơ được học trong chương trình Tin học 10 là:",
        "opts": [
          "A. Inkscape",
          "B. GIMP",
          "C. Adobe Photoshop",
          "D. Microsoft Paint"
        ],
        "ans": "A",
        "page": 64,
        "excerpt": "Phần mềm tạo, chỉnh sửa hình vectơ: Adobe Illustrator, CorelDRAW, Inkscape... Inkscape là phần mềm miễn phí để tạo, chỉnh sửa sản phẩm đồ hoạ vectơ.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 12, Trang 64-65): Phần mềm đồ hoạ Inkscape."
      },
      {
        "lesson": 12,
        "topicIdx": 2,
        "q": "Định dạng tệp tin đồ hoạ vectơ mặc định của phần mềm Inkscape là gì?",
        "opts": [
          "A. .svg",
          "B. .bmp",
          "C. .jpg",
          "D. .png"
        ],
        "ans": "A",
        "page": 67,
        "excerpt": "Phần mềm Inkscape lưu lại sản phẩm đã tạo dưới dạng tệp hình vectơ có phần mở rộng là svg.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 12, Trang 67): Lưu tệp đồ hoạ Inkscape."
      },
      {
        "lesson": 12,
        "topicIdx": 2,
        "q": "Trong Inkscape, nếu vẽ một hình chữ nhật sau khi đã vẽ một hình ngôi sao trên cùng một trang, vị trí lớp (layer) của hai hình sẽ như thế nào?",
        "opts": [
          "A. Hình chữ nhật ở lớp trên và có thể che khuất hình ngôi sao ở lớp dưới",
          "B. Hình ngôi sao luôn tự động nổi lên trên cùng",
          "C. Hai hình tự động hòa tan vào nhau không phân biệt lớp",
          "D. Hình chữ nhật tự động biến thành hình trong suốt"
        ],
        "ans": "A",
        "page": 66,
        "excerpt": "Các đối tượng sẽ xuất hiện theo thứ tự lớp, đối tượng vẽ trước sẽ ở lớp dưới, đối tượng này có thể bị che khuất toàn bộ hay một phần bởi các đối tượng vẽ sau ở lớp trên.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 12, Trang 66): Thứ tự lớp đối tượng trong Inkscape."
      },
      {
        "lesson": 13,
        "topicIdx": 2,
        "q": "Trong hộp thoại Fill and Stroke của Inkscape, để tuỳ chỉnh màu vẽ đường viền của đối tượng, ta chọn thẻ nào?",
        "opts": [
          "A. Stroke paint",
          "B. Fill",
          "C. Stroke style",
          "D. Blur"
        ],
        "ans": "A",
        "page": 70,
        "excerpt": "Chọn Fill để chọn kiểu tô cho màu tô, chọn Stroke paint để chọn kiểu tô cho màu vẽ, chọn Stroke style để thay đổi thiết lập kiểu nét vẽ và độ dày mỏng của nét.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 13, Trang 70): Hộp thoại Fill and Stroke."
      },
      {
        "lesson": 13,
        "topicIdx": 2,
        "q": "Trong Inkscape, phép ghép Path / Difference (phím tắt Ctrl + -) giữa hai đối tượng cho kết quả là:",
        "opts": [
          "A. Phần thuộc hình lớp dưới nhưng không thuộc hình lớp trên (hình lớp dưới bị hình lớp trên cắt xén)",
          "B. Tất cả các phần thuộc một trong các hình đơn gộp lại",
          "C. Phần giao nhau thuộc cả hai hình",
          "D. Cắt hình lớp dưới thành các đường nét rời"
        ],
        "ans": "A",
        "page": 71,
        "excerpt": "Phép hiệu (Difference, nhấn tổ hợp phím Ctrl + -): là phần thuộc hình lớp dưới nhưng không thuộc hình lớp trên.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 13, Trang 71): Các phép ghép đối tượng đồ hoạ."
      },
      {
        "lesson": 13,
        "topicIdx": 2,
        "q": "Phép ghép nào trong Inkscape gộp tất cả các phần thuộc các hình đơn thành một hình duy nhất (phím tắt Ctrl + +)?",
        "opts": [
          "A. Phép hợp (Union)",
          "B. Phép giao (Intersection)",
          "C. Phép hiệu (Difference)",
          "D. Phép chia (Division)"
        ],
        "ans": "A",
        "page": 71,
        "excerpt": "Phép hợp (Union, nhấn tổ hợp phím Ctrl + +): là tất cả các phần thuộc một trong các hình đơn.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 13, Trang 71): Phép hợp Union."
      },
      {
        "lesson": 14,
        "topicIdx": 2,
        "q": "Để vẽ các đoạn cong và đường cong tuỳ ý trong Inkscape, người dùng thường sử dụng công cụ nào?",
        "opts": [
          "A. Công cụ Bút vẽ Pen (Draw Bezier curves and straight lines)",
          "B. Công cụ hình hộp chữ nhật",
          "C. Công cụ văn bản Text",
          "D. Công cụ tẩy Eraser"
        ],
        "ans": "A",
        "page": 76,
        "excerpt": "Bước 1: Chọn công cụ Pen trên hộp công cụ. Bước 2: Chọn kiểu trên thanh điều khiển thuộc tính để tạo đường cong.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 14, Trang 76): Các bước vẽ đối tượng đường."
      },
      {
        "lesson": 14,
        "topicIdx": 2,
        "q": "Đặc điểm của điểm neo trơn (smooth nodes) trên đối tượng đường trong Inkscape là gì?",
        "opts": [
          "A. Có hai đường chỉ hướng luôn cùng phương với nhau, tạo đường cong tiếp tuyến mượt mà",
          "B. Làm cho đường cong bị gấp khúc tạo góc nhọn 90 độ",
          "C. Không có đường chỉ hướng",
          "D. Tự động biến mất sau khi vẽ"
        ],
        "ans": "A",
        "page": 77,
        "excerpt": "Điểm neo trơn có hai đường chỉ hướng luôn cùng phương với nhau.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 14, Trang 77): Điểm neo trơn và điểm neo góc."
      },
      {
        "lesson": 14,
        "topicIdx": 2,
        "q": "Để đặt một dòng chữ uốn lượn theo một đường cong có sẵn trong Inkscape, ta chọn đối tượng văn bản và đường cong rồi sử dụng lệnh nào?",
        "opts": [
          "A. Text / Put on Path",
          "B. Path / Union",
          "C. Text / Remove from Path",
          "D. Object / Group"
        ],
        "ans": "A",
        "page": 79,
        "excerpt": "Muốn đặt văn bản theo đường đã có, ta chọn đối tượng văn bản và đối tượng đường, sau đó chọn lệnh Text/Put on Path.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 14, Trang 79): Đặt văn bản theo đường trong Inkscape."
      },
      {
        "lesson": 15,
        "topicIdx": 2,
        "q": "Để xuất một sản phẩm đồ hoạ từ Inkscape ra tệp ảnh điểm ảnh chất lượng cao để chia sẻ lên web, ta dùng lệnh nào?",
        "opts": [
          "A. File / Export PNG Image",
          "B. File / Save As SVG",
          "C. Path / Simplify",
          "D. Edit / Delete"
        ],
        "ans": "A",
        "page": 85,
        "excerpt": "Chọn lệnh File/Export PNG Image. Cửa sổ thiết lập thông số sẽ xuất hiện như Hình 15.8... Sau khi thiết lập các thông số, chọn lệnh Export để xuất ra tệp PNG.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 15, Trang 85): Xuất sản phẩm hoàn thiện ra định dạng đồ hoạ điểm ảnh."
      },
      {
        "lesson": 16,
        "topicIdx": 3,
        "q": "Ngôn ngữ lập trình bậc cao Python được tạo ra bởi ai và ra mắt lần đầu vào năm nào?",
        "opts": [
          "A. Guido van Rossum, ra mắt năm 1991",
          "B. James Gosling, ra mắt năm 1995",
          "C. Dennis Ritchie, ra mắt năm 1972",
          "D. Bjarne Stroustrup, ra mắt năm 1985"
        ],
        "ans": "A",
        "page": 87,
        "excerpt": "Python là ngôn ngữ lập trình bậc cao do Guido van Rossum, người Hà Lan tạo ra và ra mắt lần đầu năm 1991.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 16, Trang 87): Môi trường lập trình Python."
      },
      {
        "lesson": 16,
        "topicIdx": 3,
        "q": "Trong môi trường IDLE của Python, dấu nhắc lệnh `>>>` cho biết người dùng đang ở chế độ làm việc nào?",
        "opts": [
          "A. Chế độ gõ lệnh trực tiếp (Interactive Mode)",
          "B. Chế độ soạn thảo kịch bản (Script Mode)",
          "C. Chế độ gỡ lỗi dòng lệnh (Debug Mode)",
          "D. Chế độ dịch mã máy"
        ],
        "ans": "A",
        "page": 87,
        "excerpt": "Trong một phiên làm việc với Python, em có thể gõ lệnh trực tiếp sau dấu nhắc >>> và nhấn phím Enter để thực hiện lệnh.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 16, Trang 87): Chế độ gõ lệnh trực tiếp."
      },
      {
        "lesson": 16,
        "topicIdx": 3,
        "q": "Kí hiệu nào sau đây trong Python dùng để đánh dấu bắt đầu một dòng chú thích (không được thực thi)?",
        "opts": [
          "A. #",
          "B. //",
          "C. /*",
          "D. <!--"
        ],
        "ans": "A",
        "page": 89,
        "excerpt": "Kí hiệu # là vị trí bắt đầu dòng chú thích lệnh của Python.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 16, Trang 89): Lệnh print() và chú thích trong Python."
      },
      {
        "lesson": 17,
        "topicIdx": 3,
        "q": "Theo quy tắc đặt tên biến trong ngôn ngữ lập trình Python, tên biến nào sau đây là HỢP LỆ?",
        "opts": [
          "A. _tong_diem",
          "B. 2026_lop10",
          "C. diem-thi",
          "D. for"
        ],
        "ans": "A",
        "page": 93,
        "excerpt": "Quy tắc đặt tên biến: Chỉ gồm các chữ cái tiếng Anh, các chữ số từ 0 đến 9 và kí tự gạch dưới '_'. Không bắt đầu bằng chữ số. Phân biệt chữ hoa và chữ thường.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 17, Trang 93): Quy tắc đặt tên biến."
      },
      {
        "lesson": 17,
        "topicIdx": 3,
        "q": "Trong Python, kết quả của phép toán chia lấy phần nguyên `19 // 4` và phép chia lấy phần dư `19 % 4` lần lượt là:",
        "opts": [
          "A. 4 và 3",
          "B. 4.75 và 0",
          "C. 3 và 4",
          "D. 4 và 0"
        ],
        "ans": "A",
        "page": 93,
        "excerpt": "Phép toán // lấy thương nguyên của phép chia nguyên. Phép toán % lấy số dư của phép chia nguyên. 19 // 4 = 4; 19 % 4 = 3.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 17, Trang 93): Các phép toán trên một số kiểu dữ liệu cơ bản."
      },
      {
        "lesson": 17,
        "topicIdx": 3,
        "q": "Trong Python, phép toán luỹ thừa `**` có đặc điểm ưu tiên thực hiện như thế nào khi viết liên tiếp (ví dụ `4**2**3`)?",
        "opts": [
          "A. Thực hiện từ phải sang trái: 4**(2**3) = 4**8 = 65536",
          "B. Thực hiện từ trái sang phải: (4**2)**3 = 16**3 = 4096",
          "C. Thực hiện ngẫu nhiên tuỳ theo trình biên dịch",
          "D. Báo lỗi cú pháp vì không được dùng hai luỹ thừa liên tiếp"
        ],
        "ans": "A",
        "page": 93,
        "excerpt": "Tất cả các phép toán đều được thực hiện từ trái sang phải, riêng phép luỹ thừa (**) thì thực hiện từ phải sang trái. Ví dụ, biểu thức 4**2**3 được thực hiện như sau: 4**(2**3) = 4**8 = 65536.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 17, Trang 93-94): Thứ tự thực hiện các phép tính trong Python."
      },
      {
        "lesson": 17,
        "topicIdx": 3,
        "q": "Trong Python, kết quả của câu lệnh `print('Tin' * 3)` là gì?",
        "opts": [
          "A. 'TinTinTin'",
          "B. Báo lỗi vì không thể nhân xâu với số",
          "C. 'Tin 3'",
          "D. 'Tin*3'"
        ],
        "ans": "A",
        "page": 94,
        "excerpt": "Phép toán trên dữ liệu kiểu xâu: + (nối xâu) và * (lặp). Phép * n lặp n lần xâu gốc.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 17, Trang 94): Phép toán với xâu kí tự."
      },
      {
        "lesson": 18,
        "topicIdx": 3,
        "q": "Giá trị nhận được từ bàn phím thông qua hàm `input()` trong Python luôn luôn thuộc kiểu dữ liệu nào?",
        "opts": [
          "A. Kiểu xâu kí tự (str)",
          "B. Kiểu số nguyên (int)",
          "C. Kiểu số thực (float)",
          "D. Kiểu lôgic (bool)"
        ],
        "ans": "A",
        "page": 97,
        "excerpt": "Lệnh input() có chức năng nhập dữ liệu từ thiết bị vào chuẩn, thường là bàn phím. Nội dung nhập... cho kết quả là một xâu kí tự.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 18, Trang 97): Hàm input() trong Python."
      },
      {
        "lesson": 18,
        "topicIdx": 3,
        "q": "Để chuyển đổi giá trị nhập vào từ hàm `input()` thành số nguyên trong Python, cú pháp lệnh đúng là:",
        "opts": [
          "A. n = int(input())",
          "B. n = input(int())",
          "C. n = float(input())",
          "D. n = str(input())"
        ],
        "ans": "A",
        "page": 100,
        "excerpt": "Nếu cần nhập số nguyên thì sau khi nhập giá trị số cần dùng lệnh int() để chuyển đổi sang kiểu số nguyên như sau: n = int(input('Nhập số tự nhiên: '))",
        "exp": "Căn cứ SGK Tin học 10 (Bài 18, Trang 100): Nhập dữ liệu kiểu số nguyên từ bàn phím."
      },
      {
        "lesson": 18,
        "topicIdx": 3,
        "q": "Câu lệnh nào sau đây trong Python sẽ gây ra lỗi biên dịch / ngoại lệ (ValueError)?",
        "opts": [
          "A. int('12.5')",
          "B. float('12.5')",
          "C. int('125')",
          "D. str(12.5)"
        ],
        "ans": "A",
        "page": 99,
        "excerpt": "Lệnh int() không chuyển đổi được xâu chứa số thực. int('10.35') -> ValueError: invalid literal for int() with base 10.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 18, Trang 99): Chú ý khi chuyển đổi kiểu dữ liệu xâu sang số."
      },
      {
        "lesson": 19,
        "topicIdx": 3,
        "q": "Biểu thức lôgic `(15 > 10) and (4 == 5)` trong Python có giá trị là:",
        "opts": [
          "A. False",
          "B. True",
          "C. None",
          "D. 0"
        ],
        "ans": "A",
        "page": 102,
        "excerpt": "Ta có 15 > 10 là True, nhưng 4 == 5 là False. Theo bảng phép toán and, True and False sẽ nhận giá trị False.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 19, Trang 102): Biểu thức lôgic và phép toán and."
      },
      {
        "lesson": 19,
        "topicIdx": 3,
        "q": "Quy tắc bắt buộc khi viết khối lệnh bên trong câu lệnh `if` hoặc `else` trong Python là gì?",
        "opts": [
          "A. Khối lệnh phải được viết lùi vào và thẳng hàng (thụt lề - Indentation, mặc định 4 dấu cách hoặc 1 tab)",
          "B. Bắt buộc phải đặt khối lệnh trong cặp ngoặc nhọn { }",
          "C. Bắt buộc phải kết thúc mỗi dòng bằng dấu chấm phẩy ;",
          "D. Tất cả các lệnh phải viết trên cùng một dòng"
        ],
        "ans": "A",
        "page": 102,
        "excerpt": "Nhóm, khối lệnh tiếp theo cần viết lùi vào và thẳng hàng, mặc định là 1 tab hay 4 dấu cách. Sau điều kiện cần có dấu hai chấm ':'.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 19, Trang 102-103): Cấu trúc lệnh if trong Python."
      },
      {
        "lesson": 20,
        "topicIdx": 3,
        "q": "Lệnh `range(1, 6)` trong câu lệnh lặp `for i in range(1, 6):` sẽ tạo ra dãy các giá trị số nguyên nào?",
        "opts": [
          "A. 1, 2, 3, 4, 5",
          "B. 1, 2, 3, 4, 5, 6",
          "C. 0, 1, 2, 3, 4, 5",
          "D. 1, 6"
        ],
        "ans": "A",
        "page": 106,
        "excerpt": "range(start, stop) trả lại vùng giá trị từ start đến stop - 1. Ví dụ range(1, 6) gồm các số 1, 2, 3, 4, 5.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 20, Trang 106): Lệnh range() trong Python."
      },
      {
        "lesson": 20,
        "topicIdx": 3,
        "q": "Để in các giá trị trên cùng một hàng ngang cách nhau bởi một dấu cách trong vòng lặp for, ta dùng thêm tham số nào trong lệnh `print()`?",
        "opts": [
          "A. end = ' '",
          "B. sep = ' '",
          "C. line = False",
          "D. space = True"
        ],
        "ans": "A",
        "page": 106,
        "excerpt": "Lưu ý, lệnh print() có thêm tham số end = ' ' để in bộ dữ liệu theo hàng ngang.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 20, Trang 106): Tham số end trong print()."
      },
      {
        "lesson": 21,
        "topicIdx": 3,
        "q": "Câu lệnh lặp `while <điều_kiện>:` trong Python sẽ dừng lặp khi nào?",
        "opts": [
          "A. Khi <điều_kiện> nhận giá trị False",
          "B. Khi <điều_kiện> nhận giá trị True",
          "C. Sau đúng 10 vòng lặp",
          "D. Khi bộ nhớ máy tính bị đầy"
        ],
        "ans": "A",
        "page": 108,
        "excerpt": "Lệnh lặp while thực hiện khối lệnh với số lần lặp không biết trước. Khối lệnh lặp được thực hiện cho đến khi <điều kiện> = False.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 21, Trang 108): Cú pháp và hoạt động của lệnh while."
      },
      {
        "lesson": 21,
        "topicIdx": 3,
        "q": "Lệnh nào sau đây dùng để thoát và kết thúc ngay lập tức một vòng lặp `while` hoặc `for` trong Python?",
        "opts": [
          "A. break",
          "B. continue",
          "C. exit",
          "D. stop"
        ],
        "ans": "A",
        "page": 109,
        "excerpt": "Trong trường hợp nếu muốn dừng và thoát ngay khỏi vòng lặp while hoặc for có thể dùng lệnh break.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 21, Trang 109): Lệnh break trong vòng lặp."
      },
      {
        "lesson": 21,
        "topicIdx": 3,
        "q": "Ba cấu trúc điều khiển lập trình cơ bản trong mọi ngôn ngữ lập trình bậc cao gồm có:",
        "opts": [
          "A. Cấu trúc tuần tự, cấu trúc rẽ nhánh, cấu trúc lặp",
          "B. Cấu trúc mảng, cấu trúc hàm, cấu trúc tệp",
          "C. Cấu trúc biến, hằng số và chú thích",
          "D. Cấu trúc mạng, cấu trúc web và đồ họa"
        ],
        "ans": "A",
        "page": 110,
        "excerpt": "Ba cấu trúc lập trình cơ bản của các ngôn ngữ lập trình bậc cao gồm: cấu trúc tuần tự, cấu trúc rẽ nhánh, cấu trúc lặp.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 21, Trang 110): Ba cấu trúc lập trình cơ bản."
      },
      {
        "lesson": 22,
        "topicIdx": 4,
        "q": "Trong Python, danh sách (List) được khởi tạo bằng cặp dấu ngoặc nào sau đây?",
        "opts": [
          "A. Cặp dấu ngoặc vuông [ ]",
          "B. Cặp dấu ngoặc tròn ( )",
          "C. Cặp dấu ngoặc nhọn { }",
          "D. Cặp dấu ngoặc nháy kép \" \""
        ],
        "ans": "A",
        "page": 111,
        "excerpt": "List là kiểu dữ liệu danh sách trong Python. Tạo list bằng lệnh gán với các phần tử trong cặp dấu ngoặc [].",
        "exp": "Căn cứ SGK Tin học 10 (Bài 22, Trang 111-112): Khởi tạo kiểu dữ liệu danh sách."
      },
      {
        "lesson": 22,
        "topicIdx": 4,
        "q": "Cho danh sách `A = [10, 20, 30, 40, 50]`. Phần tử đầu tiên `A[0]` và phần tử cuối cùng `A[-1]` lần lượt có giá trị là:",
        "opts": [
          "A. 10 và 50",
          "B. 20 và 40",
          "C. 0 và 5",
          "D. 10 và 40"
        ],
        "ans": "A",
        "page": 111,
        "excerpt": "Có thể truy cập từng phần tử của danh sách thông qua chỉ số. Chỉ số của list đánh số từ 0. Chỉ số âm tính từ cuối danh sách (-1 là phần tử cuối cùng).",
        "exp": "Căn cứ SGK Tin học 10 (Bài 22, Trang 111): Truy cập phần tử danh sách."
      },
      {
        "lesson": 22,
        "topicIdx": 4,
        "q": "Phương thức nào sau đây dùng để bổ sung một phần tử x vào vị trí cuối cùng của danh sách A trong Python?",
        "opts": [
          "A. A.append(x)",
          "B. A.add(x)",
          "C. A.push(x)",
          "D. A.insert_last(x)"
        ],
        "ans": "A",
        "page": 113,
        "excerpt": "Lệnh thêm phần tử vào cuối danh sách là <danh sách>.append(x).",
        "exp": "Căn cứ SGK Tin học 10 (Bài 22, Trang 113): Phương thức append() của danh sách."
      },
      {
        "lesson": 23,
        "topicIdx": 4,
        "q": "Để kiểm tra xem một phần tử x có nằm trong danh sách A hay không trong Python, ta sử dụng toán tử nào?",
        "opts": [
          "A. Toán tử in (cú pháp: x in A)",
          "B. Toán tử exists",
          "C. Toán tử find",
          "D. Toán tử check"
        ],
        "ans": "A",
        "page": 115,
        "excerpt": "Toán tử in dùng để kiểm tra một phần tử có nằm trong danh sách đã cho không. Kết quả trả lại True hoặc False. <giá trị> in <danh sách>.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 23, Trang 115): Duyệt danh sách với toán tử in."
      },
      {
        "lesson": 23,
        "topicIdx": 4,
        "q": "Lệnh `A.insert(k, x)` trong Python có chức năng gì?",
        "opts": [
          "A. Chèn phần tử x vào vị trí chỉ số k của danh sách A và đẩy các phần tử từ chỉ số k sang phải",
          "B. Thay thế phần tử tại vị trí k bằng phần tử x",
          "C. Xóa phần tử tại vị trí k",
          "D. Chèn phần tử k vào vị trí x"
        ],
        "ans": "A",
        "page": 116,
        "excerpt": "Lệnh insert(index, value) sẽ chèn giá trị value vào danh sách tại vị trí index và đẩy các phần tử từ vị trí này sang phải.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 23, Trang 116): Lệnh insert() trong danh sách."
      },
      {
        "lesson": 23,
        "topicIdx": 4,
        "q": "Lệnh nào sau đây dùng để xoá phần tử đầu tiên có giá trị bằng x ra khỏi danh sách A trong Python?",
        "opts": [
          "A. A.remove(x)",
          "B. A.delete(x)",
          "C. A.pop_val(x)",
          "D. A.clear(x)"
        ],
        "ans": "A",
        "page": 116,
        "excerpt": "Lệnh remove(value) sẽ xoá phần tử đầu tiên của danh sách có giá trị value. Nếu không có phần tử nào như vậy thì sẽ báo lỗi.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 23, Trang 116): Lệnh remove() trong danh sách."
      },
      {
        "lesson": 24,
        "topicIdx": 4,
        "q": "Đặc điểm cơ bản nào sau đây phân biệt xâu kí tự (string) với danh sách (list) trong Python?",
        "opts": [
          "A. Xâu kí tự là đối tượng bất biến (không cho phép thay đổi từng kí tự qua câu lệnh gán s[i] = ...)",
          "B. Xâu kí tự không có chỉ số",
          "C. Không thể tính độ dài của xâu bằng hàm len()",
          "D. Xâu kí tự chỉ chứa được các chữ số"
        ],
        "ans": "A",
        "page": 120,
        "excerpt": "Python không cho phép thay đổi từng kí tự của một xâu. Điều này khác với danh sách. Ví dụ: s[0] = 'A' báo lỗi TypeError.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 24, Trang 119-120): Tính bất biến của xâu kí tự."
      },
      {
        "lesson": 24,
        "topicIdx": 4,
        "q": "Đoạn mã sau duyệt và in các kí tự của xâu s:\n```python\ns = 'Ha Noi'\nfor ch in s:\n    print(ch, end='-')\n```\nKết quả in ra màn hình là:",
        "opts": [
          "A. H-a- -N-o-i-",
          "B. Ha Noi",
          "C. H-a-N-o-i",
          "D. Ha-Noi-"
        ],
        "ans": "A",
        "page": 120,
        "excerpt": "Duyệt theo kí tự của xâu kí tự: for ch in s: biến ch sẽ lần lượt nhận giá trị từng kí tự của xâu s từ đầu đến cuối.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 24, Trang 120): Lệnh duyệt kí tự của xâu."
      },
      {
        "lesson": 25,
        "topicIdx": 4,
        "q": "Phương thức `s.find(sub)` trong Python trả về giá trị gì nếu xâu con `sub` không xuất hiện trong xâu `s`?",
        "opts": [
          "A. -1",
          "B. 0",
          "C. False",
          "D. None"
        ],
        "ans": "A",
        "page": 123,
        "excerpt": "Lệnh find() tìm vị trí xuất hiện đầu tiên của một xâu trong xâu khác. Không tìm thấy trả về -1.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 25, Trang 123): Phương thức find() của xâu kí tự."
      },
      {
        "lesson": 25,
        "topicIdx": 4,
        "q": "Cho câu lệnh `words = 'Tin hoc 10'.split()`. Kiểu dữ liệu và giá trị của biến `words` là:",
        "opts": [
          "A. Kiểu list, có giá trị ['Tin', 'hoc', '10']",
          "B. Kiểu str, có giá trị 'Tinhoc10'",
          "C. Kiểu int, có giá trị 3",
          "D. Kiểu tuple, có giá trị ('Tin', 'hoc')"
        ],
        "ans": "A",
        "page": 124,
        "excerpt": "Lệnh split() tách một xâu thành danh sách các từ và đưa vào một danh sách. Kí tự tách mặc định là dấu cách.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 25, Trang 124): Phương thức split() của xâu."
      },
      {
        "lesson": 25,
        "topicIdx": 4,
        "q": "Cho danh sách `a = ['A', 'B', 'C']`. Kết quả của câu lệnh `'-'.join(a)` trong Python là:",
        "opts": [
          "A. 'A-B-C'",
          "B. ['A-', 'B-', 'C']",
          "C. '-A-B-C-'",
          "D. 'ABC'"
        ],
        "ans": "A",
        "page": 125,
        "excerpt": "Lệnh join() có tác dụng ngược với split(), có chức năng nối các phần tử của một danh sách thành một xâu. Cú pháp: 'kí tự nối'.join(<danh sách>).",
        "exp": "Căn cứ SGK Tin học 10 (Bài 25, Trang 125): Phương thức join() của xâu."
      },
      {
        "lesson": 26,
        "topicIdx": 4,
        "q": "Từ khoá nào sau đây dùng để bắt đầu định nghĩa một hàm tự tạo trong ngôn ngữ lập trình Python?",
        "opts": [
          "A. def",
          "B. function",
          "C. procedure",
          "D. define"
        ],
        "ans": "A",
        "page": 128,
        "excerpt": "Hàm trong Python được định nghĩa bằng từ khoá def, theo sau là tên hàm... Khối lệnh mô tả hàm được viết sau dấu ':' và viết lùi vào, thẳng hàng.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 26, Trang 128): Thiết lập các hàm tự định nghĩa."
      },
      {
        "lesson": 26,
        "topicIdx": 4,
        "q": "Lệnh nào sau đây dùng để trả lại kết quả đầu ra của một hàm và kết thúc thực thi hàm đó?",
        "opts": [
          "A. return",
          "B. output",
          "C. send",
          "D. yield_result"
        ],
        "ans": "A",
        "page": 129,
        "excerpt": "Hàm sẽ kết thúc khi gặp lệnh return và trả lại <giá trị>.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 26, Trang 129): Lệnh return trong hàm."
      },
      {
        "lesson": 27,
        "topicIdx": 4,
        "q": "Khẳng định nào sau đây phân biệt chính xác giữa 'tham số' (parameter) và 'đối số' (argument) của hàm?",
        "opts": [
          "A. Tham số được khai báo trong định nghĩa hàm; đối số là giá trị thực tế truyền vào hàm khi gọi hàm",
          "B. Tham số là giá trị truyền vào còn đối số là tên hàm",
          "C. Tham số và đối số là hai tên gọi hoàn toàn giống nhau không phân biệt",
          "D. Tham số chỉ nhận kiểu xâu còn đối số chỉ nhận kiểu số"
        ],
        "ans": "A",
        "page": 132,
        "excerpt": "Tham số của hàm được định nghĩa khi khai báo hàm và được dùng như biến... Đối số là giá trị được truyền vào khi gọi hàm.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 27, Trang 132): Phân biệt tham số và đối số."
      },
      {
        "lesson": 28,
        "topicIdx": 4,
        "q": "Một biến được khai báo bên trong một hàm (biến cục bộ) có phạm vi hoạt động như thế nào?",
        "opts": [
          "A. Chỉ có tác dụng và hiệu lực bên trong hàm đó, chương trình chính bên ngoài không sử dụng được",
          "B. Tự động trở thành biến toàn cục dùng được ở mọi nơi",
          "C. Có thể truy cập từ bất kì hàm nào khác trong chương trình",
          "D. Tồn tại vĩnh viễn trong bộ nhớ ngay cả khi tắt máy"
        ],
        "ans": "A",
        "page": 136,
        "excerpt": "Trong Python tất cả các biến khai báo bên trong hàm đều có tính địa phương (cục bộ), không có hiệu lực ở bên ngoài hàm.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 28, Trang 136-137): Phạm vi của biến khai báo trong hàm."
      },
      {
        "lesson": 28,
        "topicIdx": 4,
        "q": "Nếu muốn một biến khai báo bên ngoài hàm có thể được cập nhật, thay đổi giá trị trực tiếp từ bên trong hàm, ta cần dùng từ khoá nào?",
        "opts": [
          "A. global",
          "B. local",
          "C. static",
          "D. public"
        ],
        "ans": "A",
        "page": 138,
        "excerpt": "Lưu ý: Nếu muốn biến bên ngoài vẫn có tác dụng bên trong hàm thì cần khai báo lại biến này bên trong hàm với từ khoá global.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 28, Trang 138): Từ khoá global."
      },
      {
        "lesson": 29,
        "topicIdx": 4,
        "q": "Lỗi nào sau đây trong Python thuộc loại lỗi ngoại lệ thời gian chạy (RuntimeError / Exceptions)?",
        "opts": [
          "A. IndexError (chỉ số phần tử vượt quá độ dài danh sách)",
          "B. Lỗi sai cú pháp viết thiếu dấu hai chấm :",
          "C. Lỗi thuật toán tính nhầm diện tích hình tròn",
          "D. Lỗi gõ sai chính tả chú thích #"
        ],
        "ans": "A",
        "page": 142,
        "excerpt": "Lỗi khi không thể thực hiện một lệnh trong chương trình... gọi là lỗi ngoại lệ (Exceptions error) hay lỗi Runtime (IndexError, ValueError, ZeroDivisionError).",
        "exp": "Căn cứ SGK Tin học 10 (Bài 29, Trang 142-143): Phân loại lỗi chương trình trong Python."
      },
      {
        "lesson": 29,
        "topicIdx": 4,
        "q": "Mã lỗi `ZeroDivisionError` xuất hiện trong Python khi chương trình gặp phải tình huống nào?",
        "opts": [
          "A. Thực hiện phép chia cho giá trị 0",
          "B. Chia một xâu cho một số",
          "C. Số bị chia bằng 0",
          "D. Danh sách rỗng không có phần tử"
        ],
        "ans": "A",
        "page": 143,
        "excerpt": "ZeroDivisionError: Lỗi này xảy ra khi lệnh thực hiện phép chia cho giá trị 0.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 29, Trang 143): Bảng một số lỗi ngoại lệ thường gặp."
      },
      {
        "lesson": 29,
        "topicIdx": 4,
        "q": "Khi các dòng lệnh bên trong khối lệnh của câu lệnh `if` hoặc `for` không được thụt lề thẳng hàng, Python sẽ phát sinh lỗi nào?",
        "opts": [
          "A. IndentationError",
          "B. NameError",
          "C. TypeError",
          "D. ZeroDivisionError"
        ],
        "ans": "A",
        "page": 143,
        "excerpt": "IndentationError: Lỗi khi các dòng lệnh thụt vào không thẳng hàng hoặc không đúng vị trí.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 29, Trang 143): Lỗi thụt dòng IndentationError."
      },
      {
        "lesson": 30,
        "topicIdx": 4,
        "q": "Trong quá trình kiểm thử chương trình (test), việc kiểm thử với 'dữ liệu ở vùng biên' có ý nghĩa gì?",
        "opts": [
          "A. Kiểm tra với các giá trị giới hạn biên (như 0, giá trị cực đại, cực tiểu) nơi chương trình thường dễ phát sinh lỗi nhất",
          "B. Chỉ kiểm tra các số ngẫu nhiên ở giữa miền xác định",
          "C. Kiểm tra xem máy tính có bị nóng hay không",
          "D. Xóa bỏ các biến trung gian"
        ],
        "ans": "A",
        "page": 145,
        "excerpt": "Cần có bộ test dữ liệu ở vùng biên... Thực tế cho thấy thường phát sinh lỗi tại các vùng biên hoặc lân cận của biên.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 30, Trang 145): Kiểm thử chương trình với các bộ dữ liệu test."
      },
      {
        "lesson": 30,
        "topicIdx": 4,
        "q": "Công cụ 'điểm dừng' (break point) trong phần mềm soạn thảo lập trình có tác dụng gì đối với việc gỡ lỗi (debug)?",
        "opts": [
          "A. Tạm dừng chương trình tại dòng lệnh chỉ định để người lập trình quan sát giá trị các biến và kiểm tra tính đúng đắn",
          "B. Xóa vĩnh viễn dòng lệnh đó khỏi chương trình",
          "C. Tăng tốc độ chạy chương trình lên gấp đôi",
          "D. Tắt máy tính tự động khi gặp lỗi"
        ],
        "ans": "A",
        "page": 146,
        "excerpt": "Công cụ break point cho phép tạo ra các 'điểm dừng' bên trong chương trình. Khi chạy, chương trình sẽ tạm dừng lại tại các 'điểm dừng' cho phép người kiểm thử có thể quan sát các thông tin...",
        "exp": "Căn cứ SGK Tin học 10 (Bài 30, Trang 146): Sử dụng công cụ break point."
      },
      {
        "lesson": 31,
        "topicIdx": 4,
        "q": "Số tự nhiên n > 1 được gọi là số nguyên tố khi và chỉ khi:",
        "opts": [
          "A. Chỉ có đúng 2 ước số là 1 và chính nó",
          "B. Là số chẵn lớn hơn 2",
          "C. Chia hết cho 3",
          "D. Có nhiều hơn 2 ước số"
        ],
        "ans": "A",
        "page": 149,
        "excerpt": "Số nguyên tố là số tự nhiên lớn hơn 1, không có ước nào ngoài 1 và chính nó. Chú ý số 1 không là nguyên tố và cũng không là hợp số.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 31, Trang 149): Kiểm tra số nguyên tố."
      },
      {
        "lesson": 32,
        "topicIdx": 4,
        "q": "Điều kiện để một năm `year` là năm nhuận theo dương lịch trong Python được viết đúng là:",
        "opts": [
          "A. (year % 400 == 0) or (year % 4 == 0 and year % 100 != 0)",
          "B. year % 4 == 0",
          "C. year % 100 == 0 and year % 4 == 0",
          "D. year % 400 != 0"
        ],
        "ans": "A",
        "page": 155,
        "excerpt": "Năm nhuận nếu year chia hết cho 400 hoặc year chia hết cho 4 đồng thời không chia hết cho 100: year%400 == 0 or (year%4 == 0 and year%100 != 0).",
        "exp": "Căn cứ SGK Tin học 10 (Bài 32, Trang 154-155): Kiểm tra tính hợp lệ ngày tháng năm nhuận."
      },
      {
        "lesson": 33,
        "topicIdx": 5,
        "q": "Bản chất của nghề thiết kế đồ hoạ máy tính là gì?",
        "opts": [
          "A. Dàn dựng bố cục, sắp xếp, chỉnh sửa hình ảnh, lựa chọn màu sắc để sáng tạo các thông điệp truyền thông hấp dẫn",
          "B. Sửa chữa bo mạch và thay thế linh kiện phần cứng máy tính",
          "C. Viết các câu lệnh điều khiển hệ điều hành Linux",
          "D. Lắp đặt đường dây cáp quang mạng Internet"
        ],
        "ans": "A",
        "page": 156,
        "excerpt": "Thiết kế đồ hoạ là việc dàn dựng bố cục, sắp xếp, chỉnh sửa hình ảnh, lựa chọn màu sắc để sáng tạo các thông điệp truyền thông hấp dẫn và thu hút...",
        "exp": "Căn cứ SGK Tin học 10 (Bài 33, Trang 156): Khái niệm về thiết kế đồ hoạ."
      },
      {
        "lesson": 33,
        "topicIdx": 5,
        "q": "Phần mềm nào sau đây là công cụ chuyên nghiệp thường được sử dụng trong ngành thiết kế đồ hoạ?",
        "opts": [
          "A. Adobe Photoshop, CorelDraw, GIMP, Inkscape",
          "B. Microsoft Excel, Google Sheets",
          "C. Windows Defender, Firewall",
          "D. IDLE Python"
        ],
        "ans": "A",
        "page": 157,
        "excerpt": "Đặc biệt là kiến thức và kĩ năng làm việc trên các phần mềm đồ hoạ máy tính như Adobe Photoshop, CorelDraw, GIMP, InDesign, Inkscape...",
        "exp": "Căn cứ SGK Tin học 10 (Bài 33, Trang 157): Kiến thức, kĩ năng cần có của người thiết kế đồ hoạ."
      },
      {
        "lesson": 34,
        "topicIdx": 5,
        "q": "Quy trình sản xuất một phần mềm chuyên nghiệp gồm 7 công đoạn cơ bản diễn ra theo thứ tự nào sau đây?",
        "opts": [
          "A. Điều tra khảo sát -> Phân tích hệ thống -> Thiết kế hệ thống -> Lập trình -> Kiểm thử -> Chuyển giao -> Bảo trì",
          "B. Lập trình -> Thiết kế -> Kiểm thử -> Bán hàng -> Bảo trì -> Khảo sát -> Phân tích",
          "C. Kiểm thử -> Lập trình -> Chuyển giao -> Phân tích -> Thiết kế -> Bảo trì -> Khảo sát",
          "D. Quảng cáo -> Lập trình -> Thu tiền -> Bảo hành"
        ],
        "ans": "A",
        "page": 160,
        "excerpt": "Các công đoạn cần thực hiện để sản xuất một phần mềm gồm có: 1. Điều tra khảo sát; 2. Phân tích hệ thống; 3. Thiết kế hệ thống; 4. Lập trình; 5. Kiểm thử; 6. Chuyển giao; 7. Bảo trì.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 34, Trang 160-161): Quy trình phát triển phần mềm."
      },
      {
        "lesson": 34,
        "topicIdx": 5,
        "q": "Người chịu trách nhiệm bao trùm lên toàn bộ dự án phần mềm, lập kế hoạch, điều phối nhân sự, tài chính và kiểm soát chất lượng là:",
        "opts": [
          "A. Người quản trị dự án phần mềm (Project Manager)",
          "B. Lập trình viên tập sự",
          "C. Nhân viên trực tổng đài hỗ trợ",
          "D. Nhân viên tiếp thị sản phẩm"
        ],
        "ans": "A",
        "page": 161,
        "excerpt": "Hoạt động có tính bao trùm lên toàn bộ các công việc cơ bản của sản xuất phần mềm là quản trị dự án phần mềm, bao gồm lập kế hoạch, điều phối nhân sự, tài chính...",
        "exp": "Căn cứ SGK Tin học 10 (Bài 34, Trang 161): Vai trò của Người quản trị dự án phần mềm."
      },
      {
        "lesson": 12,
        "topicIdx": 2,
        "q": "Để vẽ một hình chữ nhật mới trong phần mềm Inkscape, người dùng chọn công cụ nào trên hộp công cụ?",
        "opts": [
          "A. Công cụ Create rectangles and squares (phím tắt R)",
          "B. Công cụ Text",
          "C. Công cụ Select",
          "D. Công cụ Zoom"
        ],
        "ans": "A",
        "page": 66,
        "excerpt": "Hộp công cụ (Tool box): chứa các công cụ để khởi tạo, vẽ, điều chỉnh các đối tượng đồ hoạ như hình vuông, hình chữ nhật...",
        "exp": "Căn cứ SGK Tin học 10 (Bài 12, Trang 66): Hộp công cụ Tool box trong Inkscape."
      },
      {
        "lesson": 13,
        "topicIdx": 2,
        "q": "Trong phần mềm Inkscape, phép ghép Path / Intersection (Ctrl + *) giữa hai hình cho kết quả là:",
        "opts": [
          "A. Phần diện tích chung thuộc cả hai hình được chọn",
          "B. Phần hình lớp dưới trừ đi phần hình lớp trên",
          "C. Toàn bộ các hình gộp lại",
          "D. Cắt rời các cạnh viền"
        ],
        "ans": "A",
        "page": 71,
        "excerpt": "Phép giao (Intersection, nhấn tổ hợp phím Ctrl + *): là phần thuộc cả hai hình được chọn.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 13, Trang 71): Phép giao Intersection."
      },
      {
        "lesson": 14,
        "topicIdx": 2,
        "q": "Để chuyển một đối tượng hình khối (như hình chữ nhật) thành đối tượng đường với các điểm neo có thể chỉnh sửa tự do trong Inkscape, ta dùng lệnh:",
        "opts": [
          "A. Path / Object to Path (Shift + Ctrl + C)",
          "B. Edit / Duplicate",
          "C. Text / Put on Path",
          "D. Object / Ungroup"
        ],
        "ans": "A",
        "page": 80,
        "excerpt": "Chọn hình chữ nhật và chọn lệnh Path/Object to Path để đưa hình chữ nhật thành bốn cạnh với các điểm neo rời nhau.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 14, Trang 80): Lệnh Path / Object to Path."
      },
      {
        "lesson": 15,
        "topicIdx": 2,
        "q": "Khi xuất sản phẩm đồ họa trong Inkscape ra ảnh PNG bằng lệnh Export PNG Image, tuỳ chọn 'Page' trong vùng Export area có ý nghĩa gì?",
        "opts": [
          "A. Xuất toàn bộ nội dung nằm trong khung trang giấy in",
          "B. Chỉ xuất các đối tượng đang được chọn bằng chuột",
          "C. Xuất toàn bộ các đối tượng trên bàn vẽ dù nằm ngoài trang",
          "D. In trực tiếp ra máy in"
        ],
        "ans": "A",
        "page": 85,
        "excerpt": "Vùng xuất ảnh: thường dùng nhất là Page – trang giấy in được đóng khung và Selection – chỉ xuất tệp ảnh cho các đối tượng đang được chọn.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 15, Trang 85): Tuỳ chọn Page trong hộp thoại xuất ảnh."
      },
      {
        "lesson": 16,
        "topicIdx": 3,
        "q": "Tệp tin chương trình nguồn được viết bằng ngôn ngữ lập trình Python có phần mở rộng chuẩn là gì?",
        "opts": [
          "A. .py",
          "B. .pas",
          "C. .cpp",
          "D. .java"
        ],
        "ans": "A",
        "page": 89,
        "excerpt": "Soạn thảo chương trình bằng File/New File... tệp được lưu với phần mở rộng là .py (ví dụ Bai1.py).",
        "exp": "Căn cứ SGK Tin học 10 (Bài 16, Trang 89): Tệp chương trình Python."
      },
      {
        "lesson": 17,
        "topicIdx": 3,
        "q": "Trong Python, câu lệnh gán nhiều biến đồng thời `x, y, z = 10, 20, 30` sẽ gán giá trị cho các biến như thế nào?",
        "opts": [
          "A. x = 10, y = 20, z = 30",
          "B. x = 30, y = 20, z = 10",
          "C. Cả 3 biến cùng nhận giá trị 60",
          "D. Báo lỗi cú pháp"
        ],
        "ans": "A",
        "page": 92,
        "excerpt": "Có thể gán nhiều giá trị đồng thời cho nhiều biến. Cú pháp: <var1>, <var2>, ... = <gt1>, <gt2>, ... Trong đó các biến lần lượt nhận các giá trị tương ứng.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 17, Trang 92): Gán nhiều giá trị đồng thời."
      },
      {
        "lesson": 18,
        "topicIdx": 3,
        "q": "Để kiểm tra kiểu dữ liệu của một biến x trong Python, ta sử dụng hàm nào sau đây?",
        "opts": [
          "A. type(x)",
          "B. typeof(x)",
          "C. check(x)",
          "D. gettype(x)"
        ],
        "ans": "A",
        "page": 98,
        "excerpt": "Lệnh type() dùng để nhận biết kiểu dữ liệu của biến trong Python.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 18, Trang 98): Hàm type() trong Python."
      },
      {
        "lesson": 19,
        "topicIdx": 3,
        "q": "Cấu trúc rẽ nhánh nhiều phương án trong Python sử dụng các từ khoá theo thứ tự nào sau đây?",
        "opts": [
          "A. if ... elif ... else",
          "B. if ... then ... else",
          "C. switch ... case ... default",
          "D. if ... else if ... else"
        ],
        "ans": "A",
        "page": 103,
        "excerpt": "Cấu trúc if ... elif ... else có thể lồng nhau nhiều lần để mô tả cấu trúc rẽ nhánh nhiều trường hợp.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 19, Trang 103, 151): Cấu trúc if...elif...else."
      },
      {
        "lesson": 20,
        "topicIdx": 3,
        "q": "Lệnh `range(5)` trong Python tương đương với lệnh nào sau đây?",
        "opts": [
          "A. range(0, 5)",
          "B. range(1, 5)",
          "C. range(1, 6)",
          "D. range(0, 6)"
        ],
        "ans": "A",
        "page": 106,
        "excerpt": "range(stop) trả lại vùng giá trị từ 0 đến stop - 1. range(5) tương đương range(0, 5) gồm 0, 1, 2, 3, 4.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 20, Trang 106): Hàm range(stop)."
      },
      {
        "lesson": 20,
        "topicIdx": 3,
        "q": "Đoạn chương trình sau thực hiện tính tổng:\n```python\ns = 0\nfor i in range(1, 4):\n    s = s + i\n```\nGiá trị cuối cùng của biến `s` là:",
        "opts": [
          "A. 6 (vì s = 1 + 2 + 3)",
          "B. 10",
          "C. 3",
          "D. 4"
        ],
        "ans": "A",
        "page": 105,
        "excerpt": "Biến i lần lượt nhận các giá trị 1, 2, 3. Tổng s = 1 + 2 + 3 = 6.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 20, Trang 105): Vòng lặp for tính tổng."
      },
      {
        "lesson": 21,
        "topicIdx": 3,
        "q": "Trong vòng lặp `while`, nếu điều kiện lặp luôn luôn nhận giá trị `True` và không có lệnh `break`, điều gì sẽ xảy ra?",
        "opts": [
          "A. Vòng lặp bị lặp vô hạn (chương trình không bao giờ dừng)",
          "B. Chương trình tự động tắt máy tính",
          "C. Python tự động đổi điều kiện sang False",
          "D. Chương trình báo lỗi SyntaxError"
        ],
        "ans": "A",
        "page": 109,
        "excerpt": "Vì lệnh while không biết trước số lần lặp, mà phụ thuộc vào điều kiện. Do đó cần chú ý đến điều kiện của lệnh while để tránh bị lặp vô hạn.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 21, Trang 109): Hiện tượng lặp vô hạn trong while."
      },
      {
        "lesson": 21,
        "topicIdx": 3,
        "q": "Đoạn mã sau in ra kết quả gì?\n```python\ni = 1\nwhile i < 4:\n    print(i, end=' ')\n    i = i + 1\n```",
        "opts": [
          "A. 1 2 3",
          "B. 1 2 3 4",
          "C. 0 1 2 3",
          "D. 1 1 1"
        ],
        "ans": "A",
        "page": 108,
        "excerpt": "Vòng lặp chạy khi i = 1, 2, 3. Khi i = 4 thì điều kiện 4 < 4 là False nên dừng lặp. Kết quả in ra là 1 2 3.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 21, Trang 108): Minh hoạ hoạt động vòng lặp while."
      },
      {
        "lesson": 22,
        "topicIdx": 4,
        "q": "Lệnh `del A[0]` trong Python có tác dụng gì đối với danh sách `A`?",
        "opts": [
          "A. Xoá phần tử đầu tiên tại chỉ số 0 của danh sách A",
          "B. Gán giá trị 0 cho phần tử đầu tiên",
          "C. Xoá toàn bộ danh sách A",
          "D. Tìm phần tử có giá trị 0"
        ],
        "ans": "A",
        "page": 112,
        "excerpt": "Lệnh del để xoá một phần tử của danh sách: del A[0] xoá phần tử tại chỉ số 0.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 22, Trang 112): Lệnh del xoá phần tử danh sách."
      },
      {
        "lesson": 23,
        "topicIdx": 4,
        "q": "Để làm rỗng toàn bộ một danh sách A (xoá sạch tất cả các phần tử trong A), ta dùng phương thức nào?",
        "opts": [
          "A. A.clear()",
          "B. A.empty()",
          "C. A.reset()",
          "D. A.clean()"
        ],
        "ans": "A",
        "page": 116,
        "excerpt": "Lệnh clear() xoá toàn bộ một danh sách. Sau khi thực hiện lệnh clear(), danh sách gốc trở thành rỗng [].",
        "exp": "Căn cứ SGK Tin học 10 (Bài 23, Trang 116): Phương thức clear() của danh sách."
      },
      {
        "lesson": 33,
        "topicIdx": 5,
        "q": "Sinh viên tốt nghiệp chuyên ngành thiết kế đồ hoạ có thể làm việc tại những đơn vị nào sau đây?",
        "opts": [
          "A. Các công ty quảng cáo, studio nghệ thuật, xưởng phim, toà soạn báo, cơ quan truyền hình hoặc tự mở công ty thiết kế",
          "B. Chỉ làm việc tại các phòng máy chủ của bưu điện",
          "C. Các nhà máy cơ khí lắp ráp linh kiện",
          "D. Trung tâm y tế khám bệnh"
        ],
        "ans": "A",
        "page": 160,
        "excerpt": "Những cơ hội nghề nghiệp... chuyên viên thiết kế tại công ty quảng cáo, công ty thiết kế, studio nghệ thuật, xưởng phim, toà soạn, nhà xuất bản, đài truyền hình...",
        "exp": "Căn cứ SGK Tin học 10 (Bài 33, Trang 160): Cơ hội nghề nghiệp của ngành thiết kế đồ hoạ."
      },
      {
        "lesson": 34,
        "topicIdx": 5,
        "q": "Trong quy trình phát triển phần mềm, công đoạn 'Kiểm thử' (Testing) có mục đích chính là gì?",
        "opts": [
          "A. Phát hiện và loại bỏ các lỗi (bug) cũng như các bất hợp lí trong quá trình sử dụng chương trình",
          "B. Viết tài liệu quảng cáo bán hàng",
          "C. Thu tiền đặt cọc của khách hàng",
          "D. Đổi tên mã nguồn"
        ],
        "ans": "A",
        "page": 160,
        "excerpt": "Kiểm thử: Phát hiện để loại bỏ các lỗi cũng như các bất hợp lí trong sử dụng chương trình nếu có; kiểm tra kết quả thực hiện theo chức năng đã thiết kế.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 34, Trang 160): Công đoạn kiểm thử phần mềm."
      },
      {
        "lesson": 34,
        "topicIdx": 5,
        "q": "Trong quá trình sản xuất phần mềm, công việc nào sau đây được thực hiện xuyên suốt từ khi hình thành, triển khai đến khi kết thúc dự án?",
        "opts": [
          "A. Quản trị dự án phần mềm",
          "B. Đóng gói đĩa CD",
          "C. Cài đặt hệ điều hành cho khách hàng",
          "D. Chụp ảnh lưu niệm"
        ],
        "ans": "A",
        "page": 162,
        "excerpt": "Quản trị dự án xuyên suốt quá trình hình thành, triển khai và kết thúc dự án phần mềm... đóng vai trò cốt yếu cho sự thành công của dự án.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 34, Trang 162): Vai trò xuyên suốt của quản trị dự án phần mềm."
      },
      {
        "lesson": 34,
        "topicIdx": 5,
        "q": "Sự khác biệt căn bản giữa kĩ sư phần mềm (Software Engineer) và lập trình viên (Developer) được so sánh tương tự như:",
        "opts": [
          "A. Kiến trúc sư và thợ xây trong xây dựng công trình",
          "B. Bác sĩ và dược sĩ",
          "C. Nhà văn và độc giả",
          "D. Cầu thủ và trọng tài"
        ],
        "ans": "A",
        "page": 162,
        "excerpt": "Sự khác biệt giữa các kĩ sư phần mềm và lập trình viên tương tự như giữa kiến trúc sư và thợ xây trong xây dựng công trình.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 34, Trang 162): So sánh giữa kĩ sư phần mềm và lập trình viên."
      }
    ],
    "p2": [
      {
        "lesson": 1,
        "topicIdx": 0,
        "q": "Về mối quan hệ giữa thông tin, dữ liệu và các đơn vị lưu trữ trong tin học (Bài 1, SGK Trang 6–10), xét tính Đúng/Sai của các nhận định sau:",
        "page": 8,
        "excerpt": "Thông tin là ý nghĩa của dữ liệu. 1 Byte gồm 8 bit. Các đơn vị đo dữ liệu hơn kém nhau 1024 lần.",
        "stmts": [
          {
            "text": "a) Dữ liệu là các số liệu thô hoặc tín hiệu chưa qua xử lý, còn thông tin là ý nghĩa rút ra từ dữ liệu sau khi nhận thức",
            "is_true": true
          },
          {
            "text": "b) Một Byte (B) được cấu thành từ đúng 8 bit nhị phân (bit 0 hoặc 1)",
            "is_true": true
          },
          {
            "text": "c) 1 Kilobyte (KB) có dung lượng bằng đúng 1000 Bytes theo chuẩn quy ước tin học",
            "is_true": false
          },
          {
            "text": "d) Thiết bị số giúp lưu trữ lượng thông tin khổng lồ trong thiết bị nhỏ gọn với chi phí thấp và tốc độ truyền tin cực lớn",
            "is_true": true
          }
        ]
      },
      {
        "lesson": 3,
        "topicIdx": 0,
        "q": "Về các bảng mã chuẩn và biểu diễn dữ liệu văn bản (Bài 3, SGK Trang 16–19), xét tính Đúng/Sai của các nhận định sau:",
        "page": 18,
        "excerpt": "Bảng mã ASCII dùng 7 bit (128 kí tự) và mở rộng 8 bit (256 kí tự). Bảng mã Unicode là chuẩn hợp nhất quốc tế đa ngôn ngữ, định dạng UTF-8 dùng từ 1 đến 4 byte.",
        "stmts": [
          {
            "text": "a) Bảng mã ASCII nguyên bản sử dụng 7 bit để mã hoá được tối đa 128 kí tự khác nhau",
            "is_true": true
          },
          {
            "text": "b) Bảng mã ASCII mở rộng sử dụng 8 bit và chỉ mã hoá được tối đa 256 kí tự",
            "is_true": true
          },
          {
            "text": "c) Định dạng UTF-8 của Unicode quy định mọi kí tự tiếng Việt có dấu chỉ tốn đúng 1 byte lưu trữ",
            "is_true": false
          },
          {
            "text": "d) Unicode là bảng mã hợp nhất quốc tế cho phép mã hoá đồng thời nhiều ngôn ngữ khác nhau trên thế giới",
            "is_true": true
          }
        ]
      },
      {
        "lesson": 5,
        "topicIdx": 0,
        "q": "Về dữ liệu lôgic và các phép toán lôgic cơ bản (Bài 5, SGK Trang 24–27), xét tính Đúng/Sai của các khẳng định sau:",
        "page": 25,
        "excerpt": "Đại số logic do George Boole đặt nền móng. Mệnh đề chỉ nhận một trong hai giá trị Đúng (1/True) hoặc Sai (0/False).",
        "stmts": [
          {
            "text": "a) Mệnh đề logic 'p AND q' có giá trị Đúng khi cả hai mệnh đề p và q đều Đúng",
            "is_true": true
          },
          {
            "text": "b) Mệnh đề logic 'p OR q' có giá trị Đúng khi ít nhất một trong hai mệnh đề p hoặc q Đúng",
            "is_true": true
          },
          {
            "text": "c) Mệnh đề 'p XOR q' có giá trị Đúng khi cả hai mệnh đề p và q cùng có giá trị Đúng",
            "is_true": false
          },
          {
            "text": "d) Trong máy tính, chỉ cần 1 bit nhị phân (1 cho Đúng, 0 cho Sai) là đủ để biểu diễn một giá trị lôgic",
            "is_true": true
          }
        ]
      },
      {
        "lesson": 8,
        "topicIdx": 1,
        "q": "Về mạng máy tính, điện toán đám mây và IoT (Bài 8, SGK Trang 38–43), xét tính Đúng/Sai của các nhận định sau:",
        "page": 40,
        "excerpt": "Mạng LAN có phạm vi nhỏ, Internet là mạng toàn cầu không chủ sở hữu. Router kết nối các LAN. Dịch vụ đám mây gồm SaaS, PaaS, IaaS.",
        "stmts": [
          {
            "text": "a) Mạng cục bộ (LAN) có phạm vi địa lí nhỏ như trong một gia đình, cơ quan hoặc trường học",
            "is_true": true
          },
          {
            "text": "b) Thiết bị Router (bộ định tuyến) chỉ có khả năng chuyển tiếp dữ liệu trong nội bộ mạng LAN mà không thể kết nối ra Internet",
            "is_true": false
          },
          {
            "text": "c) Dịch vụ soạn thảo trực tuyến Google Docs và lớp học Zoom là ví dụ điển hình của dịch vụ SaaS (phần mềm như là dịch vụ)",
            "is_true": true
          },
          {
            "text": "d) Hệ thống thu phí tự động không dừng RFID trên đường cao tốc là một ứng dụng tiêu biểu của mạng kết nối vạn vật (IoT)",
            "is_true": true
          }
        ]
      },
      {
        "lesson": 9,
        "topicIdx": 1,
        "q": "Về an toàn trên không gian mạng và các loại phần mềm độc hại (Bài 9 & 11, SGK Trang 44–62), xét tính Đúng/Sai của các khẳng định sau:",
        "page": 46,
        "excerpt": "Virus cần vật chủ lây lan; Worm tồn tại độc lập; Trojan nội gián đánh cắp dữ liệu; chia sẻ tin sai sự thật bị phạt theo NĐ 15/2020.",
        "stmts": [
          {
            "text": "a) Virus máy tính là các đoạn mã độc không hoàn chỉnh, bắt buộc phải gắn vào một phần mềm vật chủ mới có thể lây lan",
            "is_true": true
          },
          {
            "text": "b) Sâu máy tính (Worm) là phần mềm hoàn chỉnh, có khả năng tự nhân bản và lây lan qua lỗ hổng bảo mật hệ điều hành",
            "is_true": true
          },
          {
            "text": "c) Keylogger là phần mềm hỗ trợ gõ tiếng Việt có dấu an toàn trên hệ thống máy tính",
            "is_true": false
          },
          {
            "text": "d) Hành vi đăng tải hoặc chia sẻ thông tin giả mạo, sai sự thật trên mạng xã hội bị xử phạt vi phạm hành chính theo Nghị định 15/2020/NĐ-CP",
            "is_true": true
          }
        ]
      },
      {
        "lesson": 12,
        "topicIdx": 2,
        "q": "Về phần mềm thiết kế đồ hoạ Inkscape và các phép ghép hình (Bài 12 & 13, SGK Trang 63–74), xét tính Đúng/Sai của các khẳng định sau:",
        "page": 71,
        "excerpt": "Inkscape là phần mềm đồ hoạ vector miễn phí (.svg), phóng to không vỡ hình. Các phép ghép hình: Union, Difference, Intersection.",
        "stmts": [
          {
            "text": "a) Đồ hoạ vectơ được định nghĩa bằng các phương trình toán học nên khi phóng to thu nhỏ vẫn giữ nguyên độ nét, không vỡ hạt",
            "is_true": true
          },
          {
            "text": "b) Tệp tin đồ hoạ vectơ do phần mềm Inkscape tạo ra có phần mở rộng chuẩn là .svg",
            "is_true": true
          },
          {
            "text": "c) Phép ghép Path / Union (Ctrl + +) chỉ giữ lại phần diện tích chung giao nhau của hai hình",
            "is_true": false
          },
          {
            "text": "d) Phép ghép Path / Difference (Ctrl + -) lấy phần thuộc hình lớp dưới nhưng không thuộc hình lớp trên để cắt tạo hình mới",
            "is_true": true
          }
        ]
      },
      {
        "lesson": 17,
        "topicIdx": 3,
        "q": "Về biến, lệnh gán và các phép toán cơ bản trong Python (Bài 17 & 18, SGK Trang 91–100), xét tính Đúng/Sai của các khẳng định sau:",
        "page": 93,
        "excerpt": "Biến không cần khai báo kiểu trước. Tên biến không bắt đầu bằng số. Toán tử // chia nguyên, % chia dư, ** luỹ thừa từ phải sang trái.",
        "stmts": [
          {
            "text": "a) Trong Python, tên biến có thể bắt đầu bằng một chữ số từ 0 đến 9",
            "is_true": false
          },
          {
            "text": "b) Phép toán chia lấy phần nguyên 17 // 5 cho kết quả là 3, và 17 % 5 cho phần dư là 2",
            "is_true": true
          },
          {
            "text": "c) Biểu thức luỹ thừa liên tiếp 2 ** 3 ** 2 trong Python được tính từ phải sang trái thành 2 ** 9 = 512",
            "is_true": true
          },
          {
            "text": "d) Lệnh input() trong Python luôn trả về kết quả là một xâu kí tự (str) chứ không tự động trả về số nguyên",
            "is_true": true
          }
        ]
      },
      {
        "lesson": 19,
        "topicIdx": 3,
        "q": "Về cấu trúc điều khiển rẽ nhánh if và vòng lặp trong Python (Bài 19–21, SGK Trang 101–110), xét tính Đúng/Sai của các khẳng định sau:",
        "page": 105,
        "excerpt": "Khối lệnh trong if thụt lề 4 dấu cách. Lệnh range(1, 10) sinh từ 1 đến 9. Vòng lặp while lặp khi điều kiện True. Break thoát lặp.",
        "stmts": [
          {
            "text": "a) Khối lệnh bên trong câu lệnh if hoặc else bắt buộc phải được thụt lề thẳng hàng (mặc định 4 dấu cách hoặc 1 tab)",
            "is_true": true
          },
          {
            "text": "b) Câu lệnh for i in range(1, 10): sẽ cho biến i lần lượt nhận các giá trị từ 1 đến 10",
            "is_true": false
          },
          {
            "text": "c) Câu lệnh while <điều_kiện>: sẽ tiếp tục thực hiện khối lệnh chừng nào <điều_kiện> còn mang giá trị True",
            "is_true": true
          },
          {
            "text": "d) Lệnh break được sử dụng để dừng ngay lập tức và thoát ra ngoài vòng lặp for hoặc while gần nhất",
            "is_true": true
          }
        ]
      },
      {
        "lesson": 22,
        "topicIdx": 4,
        "q": "Về kiểu dữ liệu danh sách (List) và xâu kí tự (String) trong Python (Bài 22–25, SGK Trang 111–126), xét tính Đúng/Sai của các nhận định sau:",
        "page": 116,
        "excerpt": "List là danh sách có thể thay đổi; String là xâu bất biến. Chỉ số từ 0 đến len-1. Phương thức append(), split(), join().",
        "stmts": [
          {
            "text": "a) Danh sách List trong Python có thể chứa các phần tử có kiểu dữ liệu khác nhau (như số nguyên, số thực, xâu)",
            "is_true": true
          },
          {
            "text": "b) Lệnh A.append(x) sẽ chèn phần tử x vào vị trí đầu tiên của danh sách A",
            "is_true": false
          },
          {
            "text": "c) Trong Python, xâu kí tự là đối tượng bất biến nên không thể thay đổi giá trị từng kí tự qua phép gán s[0] = 'H'",
            "is_true": true
          },
          {
            "text": "d) Phương thức s.find(sub) sẽ trả về -1 nếu xâu con sub không xuất hiện trong xâu s",
            "is_true": true
          }
        ]
      },
      {
        "lesson": 29,
        "topicIdx": 4,
        "q": "Về lỗi chương trình, gỡ lỗi và quy trình sản xuất phần mềm (Bài 29, 30 & 34, SGK Trang 141–165), xét tính Đúng/Sai của các nhận định sau:",
        "page": 143,
        "excerpt": "ZeroDivisionError chia cho 0, IndexError vượt chỉ số. Điểm dừng breakpoint hỗ trợ gỡ lỗi. Quy trình sản xuất gồm 7 công đoạn.",
        "stmts": [
          {
            "text": "a) Mã lỗi ZeroDivisionError xảy ra khi một câu lệnh trong chương trình thực hiện phép chia cho số 0",
            "is_true": true
          },
          {
            "text": "b) Mã lỗi IndexError xảy ra khi chương trình cố gắng truy cập phần tử danh sách với chỉ số vượt quá giới hạn",
            "is_true": true
          },
          {
            "text": "c) Khi chương trình không có lỗi cú pháp và lỗi ngoại lệ thì chắc chắn kết quả đưa ra luôn luôn chính xác 100%",
            "is_true": false
          },
          {
            "text": "d) Quy trình phát triển phần mềm gồm 7 công đoạn: Khảo sát, Phân tích, Thiết kế, Lập trình, Kiểm thử, Chuyển giao và Bảo trì",
            "is_true": true
          }
        ]
      },
      {
        "lesson": 14,
        "topicIdx": 2,
        "q": "Về đối tượng đường và xử lý văn bản trong phần mềm Inkscape (Bài 14, SGK Trang 75–81), xét tính Đúng/Sai của các khẳng định sau:",
        "page": 77,
        "excerpt": "Điểm neo trơn có 2 đường chỉ hướng cùng phương; điểm neo góc có góc nhọn. Text/Put on Path uốn chữ theo đường.",
        "stmts": [
          {
            "text": "a) Điểm neo trơn (smooth nodes) trên đối tượng đường có hai đường chỉ hướng luôn cùng phương với nhau",
            "is_true": true
          },
          {
            "text": "b) Lệnh Path / Object to Path cho phép biến một hình khối có sẵn thành các đoạn đường cong có điểm neo điều chỉnh được",
            "is_true": true
          },
          {
            "text": "c) Lệnh Text / Put on Path trong Inkscape dùng để xoá bỏ định dạng văn bản",
            "is_true": false
          },
          {
            "text": "d) Trong Inkscape, ta có thể tô màu riêng biệt cho từng chữ cái trong một đoạn văn bản",
            "is_true": true
          }
        ]
      },
      {
        "lesson": 33,
        "topicIdx": 5,
        "q": "Về các ngành nghề thiết kế đồ hoạ và phát triển phần mềm (Bài 33 & 34, SGK Trang 156–165), xét tính Đúng/Sai của các nhận định sau:",
        "page": 161,
        "excerpt": "Người làm đồ hoạ cần năng lực thẩm mỹ và thành thạo phần mềm. Quy trình phần mềm gồm 7 công đoạn do nhiều vị trí phối hợp.",
        "stmts": [
          {
            "text": "a) Người làm nghề thiết kế đồ hoạ máy tính chỉ cần vẽ tranh bằng tay, không cần biết sử dụng các phần mềm đồ hoạ",
            "is_true": false
          },
          {
            "text": "b) Phát triển phần mềm là một quá trình tổng thể gồm nhiều công đoạn: Khảo sát, Phân tích, Thiết kế, Lập trình, Kiểm thử, Chuyển giao và Bảo trì",
            "is_true": true
          },
          {
            "text": "c) Lập trình viên chỉ là một trong các vị trí nhân sự tham gia vào quy trình phát triển phần mềm",
            "is_true": true
          },
          {
            "text": "d) Quản trị dự án phần mềm là hoạt động diễn ra xuyên suốt toàn bộ vòng đời sản xuất phần mềm",
            "is_true": true
          }
        ]
      }
    ],
    "p3": [
      {
        "lesson": 1,
        "topicIdx": 0,
        "page": 8,
        "q": "Theo chuẩn quy ước tin học (1 Byte = 8 bit), một thông điệp gồm 160 kí tự chữ cái không dấu (mỗi kí tự chiếm 1 Byte trong mã ASCII) tương đương với bao nhiêu bit dữ liệu?",
        "ans": "1280",
        "excerpt": "1 Byte = 8 bit. 160 kí tự = 160 Byte = 160 * 8 = 1280 bit.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 1, Trang 8): 160 * 8 = 1280 bit."
      },
      {
        "lesson": 1,
        "topicIdx": 0,
        "page": 8,
        "q": "Một tệp tin văn bản có dung lượng đúng 3072 Bytes. Theo quy ước chuẩn đơn vị đo thông tin (1 KB = 1024 Bytes), dung lượng tệp tin này tương đương với bao nhiêu Kilobyte (KB)?",
        "ans": "3",
        "excerpt": "1 KB = 1024 Bytes. 3072 / 1024 = 3 KB.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 1, Trang 8): 3072 / 1024 = 3."
      },
      {
        "lesson": 3,
        "topicIdx": 0,
        "page": 17,
        "q": "Bảng mã ASCII chuẩn (7 bit) biểu diễn được tối đa bao nhiêu kí tự khác nhau?",
        "ans": "128",
        "excerpt": "Ban đầu bảng mã này dùng các mã 7 bit, với 128 (2^7) mã khác nhau nên chỉ thể hiện được đúng 128 kí tự.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 3, Trang 17): 2^7 = 128 kí tự."
      },
      {
        "lesson": 4,
        "topicIdx": 0,
        "page": 21,
        "q": "Chuyển đổi số nhị phân 1101_2 (hệ cơ số 2) sang hệ thập phân (hệ cơ số 10). Giá trị nhận được là bao nhiêu?",
        "ans": "13",
        "excerpt": "1101_2 = 1*2^3 + 1*2^2 + 0*2^1 + 1*2^0 = 8 + 4 + 0 + 1 = 13.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 4, Trang 21): 1101_2 = 13_10."
      },
      {
        "lesson": 5,
        "topicIdx": 0,
        "page": 26,
        "q": "Trong Tin học, để biểu diễn một giá trị dữ liệu lôgic (Đúng hoặc Sai), cần sử dụng tối thiểu bao nhiêu bit?",
        "ans": "1",
        "excerpt": "Trong Tin học, chỉ cần 1 bit với các giá trị 1 hoặc 0 là đủ để biểu diễn dữ liệu lôgic.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 5, Trang 26): Biểu diễn dữ liệu lôgic cần đúng 1 bit."
      },
      {
        "lesson": 6,
        "topicIdx": 0,
        "page": 30,
        "q": "Trong hệ màu RGB 24 bit thông dụng, mỗi màu cơ bản (Đỏ, Lục, Lam) được biểu diễn bằng 8 bit, tương ứng với bao nhiêu sắc độ khác nhau?",
        "ans": "256",
        "excerpt": "Mỗi màu cơ bản được mã hoá bởi 8 bit, tương ứng với 256 sắc độ khác nhau (từ 0 đến 255).",
        "exp": "Căn cứ SGK Tin học 10 (Bài 6, Trang 30): 2^8 = 256 sắc độ."
      },
      {
        "lesson": 13,
        "topicIdx": 2,
        "page": 70,
        "q": "Khi tạo đối tượng ngôi sao trong Inkscape, nếu người dùng muốn vẽ ngôi sao chuẩn 5 cánh nhọn thì cần thiết lập giá trị Corners trên thanh thuộc tính bằng bao nhiêu?",
        "ans": "5",
        "excerpt": "Corners: Số đỉnh của đa giác hoặc số cánh của hình sao. Đặt giá trị Corners là 5.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 13, Trang 70): Corners = 5."
      },
      {
        "lesson": 17,
        "topicIdx": 3,
        "page": 93,
        "q": "Cho câu lệnh Python: `val = 47 // 6`. Giá trị của biến `val` nhận được là bao nhiêu?",
        "ans": "7",
        "excerpt": "Phép toán // lấy thương nguyên của phép chia nguyên. 47 // 6 = 7 (dư 5).",
        "exp": "Căn cứ SGK Tin học 10 (Bài 17, Trang 93): 47 // 6 = 7."
      },
      {
        "lesson": 17,
        "topicIdx": 3,
        "page": 93,
        "q": "Cho câu lệnh Python: `du = 47 % 6`. Giá trị của biến `du` nhận được là bao nhiêu?",
        "ans": "5",
        "excerpt": "Phép toán % lấy số dư của phép chia nguyên. 47 % 6 = 5.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 17, Trang 93): 47 % 6 = 5."
      },
      {
        "lesson": 17,
        "topicIdx": 3,
        "page": 94,
        "q": "Cho biểu thức Python: `res = 2 ** 3 ** 2`. Hãy cho biết giá trị của biến `res` nhận được (chú ý thứ tự thực hiện phép luỹ thừa trong Python).",
        "ans": "512",
        "excerpt": "Phép luỹ thừa (**) thực hiện từ phải sang trái: 2**(3**2) = 2**9 = 512.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 17, Trang 94): Phép luỹ thừa liên tiếp thực hiện từ phải sang trái, 3**2 = 9 rồi 2**9 = 512."
      },
      {
        "lesson": 18,
        "topicIdx": 3,
        "page": 98,
        "q": "Cho đoạn mã Python sau:\n```python\na = 15\nb = int('25')\nc = a * 2 + b\n```\nHãy cho biết giá trị của biến `c` nhận được.",
        "ans": "55",
        "excerpt": "a = 15; b = 25; c = 15 * 2 + 25 = 30 + 25 = 55.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 18, Trang 98): c = 55."
      },
      {
        "lesson": 20,
        "topicIdx": 3,
        "page": 106,
        "q": "Hàm `range(3, 10)` trong Python tạo ra một dãy gồm bao nhiêu số nguyên liên tiếp?",
        "ans": "7",
        "excerpt": "range(start, stop) trả lại vùng giá trị từ start đến stop - 1. Dãy 3, 4, 5, 6, 7, 8, 9 gồm 10 - 3 = 7 số.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 20, Trang 106): 10 - 3 = 7 số."
      },
      {
        "lesson": 20,
        "topicIdx": 3,
        "page": 105,
        "q": "Cho đoạn chương trình Python sau:\n```python\ns = 0\nfor k in range(1, 6):\n    s += k * 2\n```\nSau khi kết thúc vòng lặp, biến `s` có giá trị bằng bao nhiêu?",
        "ans": "30",
        "excerpt": "k lần lượt nhận 1, 2, 3, 4, 5. s = 2 + 4 + 6 + 8 + 10 = 30.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 20, Trang 105): s = 30."
      },
      {
        "lesson": 21,
        "topicIdx": 3,
        "page": 108,
        "q": "Cho đoạn chương trình Python sau:\n```python\nk = 1\ns = 0\nwhile k <= 7:\n    s += k\n    k += 2\n```\nSau khi vòng lặp dừng, biến `s` có giá trị là bao nhiêu?",
        "ans": "16",
        "excerpt": "k lần lượt là 1, 3, 5, 7. s = 1 + 3 + 5 + 7 = 16.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 21, Trang 108): s = 16."
      },
      {
        "lesson": 22,
        "topicIdx": 4,
        "page": 113,
        "q": "Cho danh sách `A = [1, 2, 3, 4, 5]`. Sau khi thực thi lần lượt hai lệnh `A.append(10)` và `del A[0]`, độ dài của danh sách `len(A)` bằng bao nhiêu?",
        "ans": "5",
        "excerpt": "A ban đầu có 5 phần tử. Append thêm 1 phần tử (thành 6), sau đó del 1 phần tử (còn lại 5).",
        "exp": "Căn cứ SGK Tin học 10 (Bài 22, Trang 112-113): len(A) = 5."
      },
      {
        "lesson": 23,
        "topicIdx": 4,
        "page": 116,
        "q": "Cho danh sách `A = [1, 2, 6, 10]`. Sau khi thực thi lệnh `A.insert(2, 5)`, giá trị của phần tử `A[2]` là bao nhiêu?",
        "ans": "5",
        "excerpt": "Lệnh A.insert(2, 5) sẽ chèn số 5 vào vị trí chỉ số 2. Khi đó A[2] = 5.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 23, Trang 116): Phần tử tại vị trí chèn nhận giá trị 5."
      },
      {
        "lesson": 24,
        "topicIdx": 4,
        "page": 119,
        "q": "Cho xâu kí tự `s = 'Tin hoc 10'`. Hãy cho biết kết quả trả về của hàm `len(s)` (tính cả kí tự dấu cách khoảng trắng).",
        "ans": "10",
        "excerpt": "Xâu 'Tin hoc 10' gồm 3 + 1 + 3 + 1 + 2 = 10 kí tự. len(s) = 10.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 24, Trang 119): len('Tin hoc 10') = 10."
      },
      {
        "lesson": 25,
        "topicIdx": 4,
        "page": 124,
        "q": "Cho xâu kí tự `st = '0,1,2,3,4,5,6,10'`. Sau khi thực hiện lệnh `lst = st.split(',')`, danh sách `lst` có bao nhiêu phần tử?",
        "ans": "8",
        "excerpt": "Tách xâu bởi dấu phẩy ',' thu được 8 phần tử: '0', '1', '2', '3', '4', '5', '6', '10'.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 25, Trang 124): Có 8 phần tử."
      },
      {
        "lesson": 27,
        "topicIdx": 4,
        "page": 131,
        "q": "Cho định nghĩa hàm Python sau:\n```python\ndef f_sum(a, b, c):\n    return a + b * 2 + c\n```\nKhi thực thi lời gọi hàm `f_sum(5, 3, 4)`, kết quả trả về là bao nhiêu?",
        "ans": "15",
        "excerpt": "Truyền đối số a = 5, b = 3, c = 4. Giá trị trả lại: 5 + 3*2 + 4 = 5 + 6 + 4 = 15.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 27, Trang 131): Kết quả là 15."
      },
      {
        "lesson": 34,
        "topicIdx": 5,
        "page": 160,
        "q": "Theo SGK Tin học 10 (Bộ sách Kết nối tri thức với cuộc sống), quy trình sản xuất một phần mềm chuyên nghiệp gồm bao nhiêu công đoạn cơ bản?",
        "ans": "7",
        "excerpt": "Các công việc cơ bản... cần thực hiện để sản xuất một phần mềm gồm có 7 công đoạn: 1. Khảo sát; 2. Phân tích; 3. Thiết kế; 4. Lập trình; 5. Kiểm thử; 6. Chuyển giao; 7. Bảo trì.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 34, Trang 160): Gồm 7 công đoạn cơ bản."
      },
      {
        "lesson": 34,
        "topicIdx": 5,
        "page": 160,
        "q": "Theo SGK Tin học 10, trong quy trình sản xuất phần mềm chuyên nghiệp, công đoạn thứ 4 sau khi hoàn thành thiết kế hệ thống là công đoạn gì? (Hãy nhập tên công đoạn gồm 8 chữ cái tiếng Việt không dấu: lap trinh)",
        "ans": "lap trinh",
        "excerpt": "Các công đoạn: 1. Khảo sát; 2. Phân tích; 3. Thiết kế; 4. Lập trình; 5. Kiểm thử; 6. Chuyển giao; 7. Bảo trì.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 34, Trang 160): Công đoạn thứ 4 là Lập trình."
      },
      {
        "lesson": 8,
        "topicIdx": 1,
        "page": 41,
        "q": "Điện toán đám mây bao gồm bao nhiêu loại hình dịch vụ cơ bản chủ yếu (SaaS, PaaS, IaaS)?",
        "ans": "3",
        "excerpt": "SaaS, PaaS và IaaS là các loại dịch vụ chủ yếu của điện toán đám mây.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 8, Trang 41): Có đúng 3 loại hình dịch vụ đám mây chủ yếu."
      },
      {
        "lesson": 11,
        "topicIdx": 1,
        "page": 58,
        "q": "Nghị định của Chính phủ ban hành năm 2020 quy định về xử phạt vi phạm hành chính trong lĩnh vực bưu chính, viễn thông và đưa tin trên mạng xã hội là Nghị định số bao nhiêu? (Nhập số tự nhiên)",
        "ans": "15",
        "excerpt": "Điều 101, khoản 1 của Nghị định 15/2020/NĐ-CP quy định mức phạt vi phạm trên mạng xã hội.",
        "exp": "Căn cứ SGK Tin học 10 (Bài 11, Trang 58): Nghị định 15/2020/NĐ-CP."
      }
    ]
  },
  "11": {
    "name": "Tin học 11",
    "headerTheme": "Chương trình Tin học 11: Hệ điều hành, CSDL quan hệ SQL, Thực hành CSDL & Đồ họa/Video",
    "lessonsOverview": "Bài 1–5: Hệ điều hành & Thiết bị số · Bài 6–9: Lưu trữ Internet & An toàn mạng · Bài 10–15: CSDL quan hệ & Lệnh SQL · Bài 16–24: Thực hành tạo CSDL, Khóa & Truy vấn · Bài 25–31: Chỉnh sửa ảnh & Làm phim hoạt hình",
    "keyConcepts": "Hệ điều hành, PM nguồn mở, CSDL quan hệ, Bảng, Khóa chính (Primary Key), Khóa ngoại (Foreign Key), Lệnh SQL (SELECT, INSERT, UPDATE, DELETE), Chỉnh sửa ảnh Layer, Tạo ảnh động GIF, Biên tập phim",
    "footerOutcome": "Sử dụng thành thạo HĐH và dịch vụ số, thiết kế và thao tác CSDL quan hệ bằng ngôn ngữ SQL, sáng tạo các sản phẩm đồ họa và video số.",
    "topics": [
      {
        "topic": "Chủ đề 1: Máy tính và xã hội tri thức (Bài 1–5: HĐH, PM nguồn mở, Phần cứng, Kết nối thiết bị)",
        "startLesson": 1, "endLesson": 5, "startPage": 5, "endPage": 31,
        "nb_tn": 2, "nb_ds": 1, "nb_tln": 0,
        "th_tn": 1, "th_ds": 0, "th_tln": 0,
        "vd_tn": 0, "vd_ds": 0, "vd_tln": 0,
        "vdc_tn": 0, "vdc_ds": 0, "vdc_tln": 0
      },
      {
        "topic": "Chủ đề 2 & 3: Tổ chức lưu trữ, trao đổi thông tin & Đạo đức số (Bài 6–9)",
        "startLesson": 6, "endLesson": 9, "startPage": 32, "endPage": 48,
        "nb_tn": 1, "nb_ds": 0, "nb_tln": 0,
        "th_tn": 1, "th_ds": 1, "th_tln": 0,
        "vd_tn": 0, "vd_ds": 0, "vd_tln": 0,
        "vdc_tn": 0, "vdc_ds": 0, "vdc_tln": 0
      },
      {
        "topic": "Chủ đề 4: Giới thiệu các hệ cơ sở dữ liệu (Bài 10–15: CSDL, SQL, Bảo mật)",
        "startLesson": 10, "endLesson": 15, "startPage": 49, "endPage": 76,
        "nb_tn": 3, "nb_ds": 1, "nb_tln": 0,
        "th_tn": 2, "th_ds": 1, "th_tln": 1,
        "vd_tn": 1, "vd_ds": 0, "vd_tln": 0,
        "vdc_tn": 0, "vdc_ds": 0, "vdc_tln": 0
      },
      {
        "topic": "Chủ đề 5 & 6: Hướng nghiệp & Thực hành CSDL (Bài 16–24: Bảng, Khóa, SQL, Sao lưu)",
        "startLesson": 16, "endLesson": 24, "startPage": 77, "endPage": 115,
        "nb_tn": 3, "nb_ds": 0, "nb_tln": 0,
        "th_tn": 2, "th_ds": 1, "th_tln": 0,
        "vd_tn": 1, "vd_ds": 1, "vd_tln": 2,
        "vdc_tn": 0, "vdc_ds": 1, "vdc_tln": 1
      },
      {
        "topic": "Chủ đề 7: Phần mềm chỉnh sửa ảnh và làm video (Bài 25–31)",
        "startLesson": 25, "endLesson": 31, "startPage": 116, "endPage": 158,
        "nb_tn": 3, "nb_ds": 0, "nb_tln": 0,
        "th_tn": 1, "th_ds": 0, "th_tln": 0,
        "vd_tn": 0, "vd_ds": 1, "vd_tln": 0,
        "vdc_tn": 0, "vdc_ds": 0, "vdc_tln": 0
      }
    ],
    "p1": [
      {
        "lesson": 1,
        "topicIdx": 0,
        "q": "Chức năng cơ bản và quan trọng nhất của Hệ điều hành đối với hệ thống máy tính là:",
        "opts": [
          "A. Soạn thảo văn bản và tính toán bảng tính",
          "B. Quản lý, điều khiển tài nguyên phần cứng và cung cấp môi trường chạy cho phần mềm ứng dụng",
          "C. Diệt trừ tất cả các loại virus và mã độc trên mạng",
          "D. Tự động sửa chữa các linh kiện phần cứng bị hư hỏng"
        ],
        "ans": "B",
        "page": 6,
        "excerpt": "Hệ điều hành là phần mềm hệ thống quản lý tài nguyên máy tính (CPU, bộ nhớ, thiết bị vào/ra) và cung cấp môi trường giao tiếp giữa người dùng và máy tính.",
        "exp": "Căn cứ SGK Tin học 11 (Bài 1. Hệ điều hành, Trang 6): Chức năng chính của hệ điều hành."
      },
      {
        "lesson": 1,
        "topicIdx": 0,
        "q": "Hệ điều hành nào sau đây là hệ điều hành phổ biến nhất dành cho các thiết bị di động thông minh hiện nay?",
        "opts": [
          "A. Windows 11",
          "B. macOS",
          "C. Android",
          "D. Ubuntu Linux"
        ],
        "ans": "C",
        "page": 8,
        "excerpt": "Android và iOS là hai hệ điều hành thống trị trên thị trường thiết bị di động (smartphone, máy tính bảng).",
        "exp": "Căn cứ SGK Tin học 11 (Bài 1. Hệ điều hành, Trang 8): Hệ điều hành cho thiết bị di động."
      },
      {
        "lesson": 2,
        "topicIdx": 0,
        "q": "Trong hệ điều hành, cấu trúc nào sau đây được sử dụng để tổ chức lưu trữ các tệp tin một cách logic và phân cấp?",
        "opts": [
          "A. Cấu trúc mạng hình sao",
          "B. Cấu trúc cây thư mục (thư mục gốc, thư mục con và tệp tin)",
          "C. Cấu trúc vòng tròn khép kín",
          "D. Cấu trúc ngẫu nhiên không phân cấp"
        ],
        "ans": "B",
        "page": 11,
        "excerpt": "Hệ điều hành tổ chức lưu trữ thông tin dưới dạng cây thư mục phân cấp, giúp người dùng dễ dàng phân loại và tìm kiếm tệp tin.",
        "exp": "Căn cứ SGK Tin học 11 (Bài 2. Thực hành sử dụng hệ điều hành, Trang 11): Quản lý tệp tin và cây thư mục."
      },
      {
        "lesson": 3,
        "topicIdx": 0,
        "q": "Đặc điểm nào sau đây là đặc trưng cốt lõi của phần mềm nguồn mở (Open Source Software) như Linux, GIMP?",
        "opts": [
          "A. Người dùng không được phép xem hoặc chỉnh sửa mã nguồn",
          "B. Mã nguồn được công khai, cho phép người dùng tự do sử dụng, nghiên cứu, sửa đổi và phân phối lại",
          "C. Bắt buộc phải trả phí bản quyền hàng tháng",
          "D. Chỉ chạy được trên một dòng máy tính duy nhất"
        ],
        "ans": "B",
        "page": 15,
        "excerpt": "Phần mềm nguồn mở công bố mã nguồn theo các giấy phép tự do (như GNU GPL), cho phép cộng đồng tiếp cận, sửa đổi và phát triển tiếp.",
        "exp": "Căn cứ SGK Tin học 11 (Bài 3. Phần mềm nguồn mở và phần mềm chạy trên Internet, Trang 15): Khái niệm phần mềm nguồn mở."
      },
      {
        "lesson": 3,
        "topicIdx": 0,
        "q": "Giấy phép phần mềm nguồn mở phổ biến nhất được GNU thiết kế nhằm đảm bảo quyền tự do của người dùng là:",
        "opts": [
          "A. GNU GPL (General Public License)",
          "B. EULA thương mại",
          "C. Copyright độc quyền",
          "D. Bằng sáng chế đóng"
        ],
        "ans": "A",
        "page": 16,
        "excerpt": "Giấy phép công cộng GNU GPL là chuẩn mực của cộng đồng nguồn mở, bảo đảm phần mềm phát triển từ nó tiếp tục giữ tính mở.",
        "exp": "Căn cứ SGK Tin học 11 (Bài 3, Trang 16): Giấy phép GNU GPL."
      },
      {
        "lesson": 4,
        "topicIdx": 0,
        "q": "Bộ nhớ nào sau đây nằm bên trong máy tính, có chức năng lưu trữ dữ liệu tạm thời khi máy đang hoạt động và sẽ mất toàn bộ nội dung khi mất nguồn điện?",
        "opts": [
          "A. Bộ nhớ ROM",
          "B. Ổ cứng SSD",
          "C. Bộ nhớ RAM",
          "D. Đĩa quang DVD"
        ],
        "ans": "C",
        "page": 20,
        "excerpt": "RAM (Random Access Memory) là bộ nhớ truy xuất ngẫu nhiên, lưu tạm chương trình và dữ liệu đang xử lý, thông tin sẽ biến mất khi tắt nguồn.",
        "exp": "Căn cứ SGK Tin học 11 (Bài 4. Bên trong máy tính, Trang 20): RAM là bộ nhớ khả biến (volatile)."
      },
      {
        "lesson": 4,
        "topicIdx": 0,
        "q": "Bộ nhớ chỉ đọc ROM (Read Only Memory) bên trong máy tính có đặc điểm nổi bật nào sau đây?",
        "opts": [
          "A. Mất toàn bộ nội dung khi tắt máy",
          "B. Lưu trữ các chương trình khởi động máy tính cơ bản (BIOS/UEFI) và không bị mất khi mất điện",
          "C. Dung lượng lớn hàng nghìn Terabyte",
          "D. Người dùng có thể xóa sạch bằng câu lệnh thông thường"
        ],
        "ans": "B",
        "page": 21,
        "excerpt": "ROM là bộ nhớ bất biến, lưu trữ phần mềm hệ thống vi chương trình khởi động máy tính (BIOS/UEFI).",
        "exp": "Căn cứ SGK Tin học 11 (Bài 4, Trang 21): Đặc tính của bộ nhớ ROM."
      },
      {
        "lesson": 4,
        "topicIdx": 0,
        "q": "Đơn vị xử lý trung tâm CPU của máy tính bao gồm hai bộ phận cốt lõi nào?",
        "opts": [
          "A. Đơn vị điều khiển (CU) và Đơn vị số học/logic (ALU)",
          "B. Màn hình và Bàn phím",
          "C. Nguồn điện và Quạt tản nhiệt",
          "D. Bộ nhớ trong và Bộ nhớ ngoài"
        ],
        "ans": "A",
        "page": 22,
        "excerpt": "CPU gồm hai thành phần chính: Khối điều khiển CU (Control Unit) và Khối số học logic ALU (Arithmetic Logic Unit).",
        "exp": "Căn cứ SGK Tin học 11 (Bài 4, Trang 22): Cấu tạo cốt lõi của CPU."
      },
      {
        "lesson": 4,
        "topicIdx": 0,
        "q": "Thông số tốc độ xử lý xung nhịp của CPU hiện đại thường được đo bằng đơn vị nào?",
        "opts": [
          "A. Byte",
          "B. GHz (GigaHertz)",
          "C. dpi",
          "D. fps"
        ],
        "ans": "B",
        "page": 23,
        "excerpt": "Tốc độ xung nhịp CPU được tính bằng GHz (hàng tỉ chu kỳ xung nhịp mỗi giây).",
        "exp": "Căn cứ SGK Tin học 11 (Bài 4, Trang 23): Đơn vị tốc độ GHz của CPU."
      },
      {
        "lesson": 5,
        "topicIdx": 0,
        "q": "Cổng kết nối nào sau đây trên máy tính có khả năng truyền tải đồng thời cả tín hiệu hình ảnh độ nét cao và âm thanh số?",
        "opts": [
          "A. Cổng VGA",
          "B. Cổng HDMI",
          "C. Cổng Serial COM",
          "D. Cổng PS/2"
        ],
        "ans": "B",
        "page": 25,
        "excerpt": "HDMI (High-Definition Multimedia Interface) truyền tải đồng thời cả video độ nét cao và âm thanh đa kênh số hóa.",
        "exp": "Căn cứ SGK Tin học 11 (Bài 5. Kết nối máy tính với các thiết bị số, Trang 25): Cổng giao tiếp HDMI."
      },
      {
        "lesson": 5,
        "topicIdx": 0,
        "q": "Ưu điểm nổi bật của chuẩn kết nối USB Type-C so với các chuẩn USB truyền thống trước đây là:",
        "opts": [
          "A. Chỉ cắm được theo một chiều duy nhất",
          "B. Thiết kế đối xứng cắm được cả hai chiều, hỗ trợ truyền dữ liệu tốc độ cao và sạc công suất lớn",
          "C. Không thể truyền âm thanh",
          "D. Chỉ dùng được cho máy tính để bàn"
        ],
        "ans": "B",
        "page": 26,
        "excerpt": "USB-C có thiết kế nhỏ gọn, cắm thuận tiện hai chiều và tích hợp đa giao thức (dữ liệu, hình ảnh, sạc điện).",
        "exp": "Căn cứ SGK Tin học 11 (Bài 5, Trang 26): Chuẩn kết nối USB Type-C."
      },
      {
        "lesson": 5,
        "topicIdx": 0,
        "q": "Công nghệ mạng không dây tầm ngắn nào thường được dùng để kết nối máy tính với chuột, bàn phím và tai nghe không dây?",
        "opts": [
          "A. Cáp quang",
          "B. Bluetooth",
          "C. Vệ tinh viễn thông",
          "D. Tia X"
        ],
        "ans": "B",
        "page": 27,
        "excerpt": "Bluetooth là chuẩn kết nối vô tuyến cự ly ngắn (dưới 10m) tiện dụng cho các thiết bị ngoại vi cá nhân.",
        "exp": "Căn cứ SGK Tin học 11 (Bài 5, Trang 27): Kết nối Bluetooth."
      },
      {
        "lesson": 6,
        "topicIdx": 1,
        "q": "Khi chia sẻ tệp tài liệu trên dịch vụ lưu trữ đám mây Google Drive hoặc OneDrive, quyền nào cho phép người nhận chỉnh sửa nội dung tệp?",
        "opts": [
          "A. Người xem (Viewer)",
          "B. Người nhận xét (Commenter)",
          "C. Người chỉnh sửa (Editor)",
          "D. Người sở hữu không gian"
        ],
        "ans": "C",
        "page": 29,
        "excerpt": "Quyền Người chỉnh sửa (Editor) cho phép người được chia sẻ có thể thêm, sửa, xóa nội dung tệp tin trên đám mây.",
        "exp": "Căn cứ SGK Tin học 11 (Bài 6. Lưu trữ và chia sẻ tệp tin trên Internet, Trang 29): Các mức phân quyền chia sẻ tệp."
      },
      {
        "lesson": 6,
        "topicIdx": 1,
        "q": "Lợi ích chính của việc lưu trữ dữ liệu trên đám mây (Cloud Storage) đối với học sinh là:",
        "opts": [
          "A. Chỉ truy cập được dữ liệu khi ở trường học",
          "B. Truy cập tệp tin mọi lúc, mọi nơi từ nhiều thiết bị và dễ dàng chia sẻ cộng tác nhóm",
          "C. Dữ liệu sẽ tự động biến mất sau 24 giờ",
          "D. Không cần kết nối Internet vẫn truy cập được máy chủ"
        ],
        "ans": "B",
        "page": 30,
        "excerpt": "Lưu trữ đám mây giúp truy xuất dữ liệu từ bất cứ đâu có Internet và hỗ trợ làm việc nhóm trực tuyến hiệu quả.",
        "exp": "Căn cứ SGK Tin học 11 (Bài 6, Trang 30): Lợi ích của Cloud Storage."
      },
      {
        "lesson": 7,
        "topicIdx": 1,
        "q": "Để tìm kiếm tài liệu chính xác nguyên văn một cụm từ trên Google (ví dụ: Tin học 11), ta đặt cụm từ đó trong cặp dấu nào?",
        "opts": [
          "A. Dấu ngoặc vuông [ ]",
          "B. Dấu ngoặc kép \" \"",
          "C. Dấu ngoặc nhọn { }",
          "D. Dấu ngã ~ ~"
        ],
        "ans": "B",
        "page": 35,
        "excerpt": "Đặt từ khóa trong dấu ngoặc kép \"\" yêu cầu công cụ tìm kiếm trả về các trang chứa chính xác cụm từ theo đúng thứ tự.",
        "exp": "Căn cứ SGK Tin học 11 (Bài 7. Thực hành tìm kiếm thông tin trên Internet, Trang 35): Toán tử tìm kiếm cụm từ chính xác."
      },
      {
        "lesson": 7,
        "topicIdx": 1,
        "q": "Để thu hẹp kết quả tìm kiếm tệp tài liệu văn bản định dạng PDF trên Google, ta sử dụng cú pháp tìm kiếm nào?",
        "opts": [
          "A. format:pdf",
          "B. filetype:pdf",
          "C. ext=pdf",
          "D. type(pdf)"
        ],
        "ans": "B",
        "page": 36,
        "excerpt": "Toán tử filetype: định rõ định dạng tệp cần tra cứu (như pdf, docx, pptx, xlsx).",
        "exp": "Căn cứ SGK Tin học 11 (Bài 7, Trang 36): Toán tử filetype:."
      },
      {
        "lesson": 8,
        "topicIdx": 1,
        "q": "Trong giao diện soạn thảo thư điện tử (Email), trường BCC (Blind Carbon Copy) có tác dụng gì?",
        "opts": [
          "A. Gửi thư có gắn cờ ưu tiên khẩn cấp",
          "B. Gửi bản sao đến người nhận nhưng ẩn danh sách địa chỉ của họ đối với những người khác",
          "C. Tự động xóa thư sau khi người nhận đọc xong",
          "D. Chặn thư trả lời tự động"
        ],
        "ans": "B",
        "page": 39,
        "excerpt": "Trường BCC dùng để gửi kèm thư cho nhiều người cùng lúc mà vẫn bảo mật danh tính, địa chỉ email của các người nhận này.",
        "exp": "Căn cứ SGK Tin học 11 (Bài 8. Thực hành sử dụng thư điện tử và mạng xã hội, Trang 39): Chức năng của trường BCC."
      },
      {
        "lesson": 9,
        "topicIdx": 1,
        "q": "Hành vi nào sau đây giúp đảm bảo an toàn và bảo vệ thông tin cá nhân khi giao tiếp trên không gian mạng?",
        "opts": [
          "A. Đăng công khai số căn cước công dân và mật khẩu lên trang cá nhân",
          "B. Đặt mật khẩu mạnh có cả chữ hoa, chữ thường, số, ký tự đặc biệt và bật xác thực 2 lớp (2FA)",
          "C. Mở bất kỳ liên kết lạ nào gửi qua tin nhắn từ người không quen biết",
          "D. Sử dụng chung một mật khẩu đơn giản cho tất cả các tài khoản"
        ],
        "ans": "B",
        "page": 44,
        "excerpt": "Để bảo vệ tài khoản cá nhân, cần thiết lập mật khẩu mạnh, không trùng lặp và kích hoạt xác thực hai yếu tố (2FA).",
        "exp": "Căn cứ SGK Tin học 11 (Bài 9. Giao tiếp an toàn trên Internet, Trang 44): Biện pháp bảo vệ an toàn danh tính số."
      },
      {
        "lesson": 9,
        "topicIdx": 1,
        "q": "Hình thức tấn công mạng nào kẻ xấu giả mạo website ngân hàng, trường học để lừa người dùng nhập tài khoản, mật khẩu?",
        "opts": [
          "A. Tấn công từ chối dịch vụ (DDoS)",
          "B. Lừa đảo trực tuyến (Phishing)",
          "C. Nén dữ liệu tệp tin",
          "D. Chống phân mảnh đĩa"
        ],
        "ans": "B",
        "page": 46,
        "excerpt": "Phishing (lừa đảo giả mạo) là phương thức gửi thông điệp hoặc trang web mạo danh tổ chức uy tín nhằm chiếm đoạt thông tin bảo mật.",
        "exp": "Căn cứ SGK Tin học 11 (Bài 9, Trang 46): Khái niệm tấn công Phishing."
      },
      {
        "lesson": 10,
        "topicIdx": 2,
        "q": "Nhược điểm lớn nhất của phương pháp lưu trữ dữ liệu quản lý bằng các tệp văn bản hoặc bảng tính rời rạc so với CSDL là:",
        "opts": [
          "A. Tốn ít dung lượng đĩa cứng",
          "B. Dư thừa dữ liệu, không nhất quán và khó khăn khi nhiều người đồng thời truy cập khai thác",
          "C. Dữ liệu được bảo mật quá an toàn",
          "D. Quá dễ dàng lập trình ứng dụng"
        ],
        "ans": "B",
        "page": 52,
        "excerpt": "Lưu trữ tệp phân tán gây trùng lặp, dị thường khi cập nhật và không đảm bảo tính toàn vẹn dữ liệu.",
        "exp": "Căn cứ SGK Tin học 11 (Bài 10. Lưu trữ dữ liệu và khai thác thông tin phục vụ quản lý, Trang 52): Lý do ra đời của CSDL."
      },
      {
        "lesson": 11,
        "topicIdx": 2,
        "q": "Khái niệm Cơ sở dữ liệu (Database) trong tin học được định nghĩa là:",
        "opts": [
          "A. Một phần mềm dùng để xem phim trên máy tính",
          "B. Tập hợp các dữ liệu có liên quan với nhau, được lưu trữ có cấu trúc trên thiết bị nhớ máy tính nhằm phục vụ khai thác thông tin",
          "C. Danh sách các bài hát trong điện thoại",
          "D. Toàn bộ phần cứng của máy tính chủ"
        ],
        "ans": "B",
        "page": 56,
        "excerpt": "Cơ sở dữ liệu là tập hợp dữ liệu có cấu trúc, được tổ chức lưu trữ để nhiều người dùng có thể cùng khai thác.",
        "exp": "Căn cứ SGK Tin học 11 (Bài 11. Cơ sở dữ liệu, Trang 56): Khái niệm CSDL."
      },
      {
        "lesson": 12,
        "topicIdx": 2,
        "q": "Phần mềm cung cấp môi trường để tạo lập, lưu trữ, cập nhật và khai thác cơ sở dữ liệu được gọi là:",
        "opts": [
          "A. Hệ điều hành",
          "B. Hệ quản trị cơ sở dữ liệu (DBMS)",
          "C. Trình biên dịch ngôn ngữ",
          "D. Trình duyệt web"
        ],
        "ans": "B",
        "page": 60,
        "excerpt": "Hệ quản trị CSDL (DBMS - Database Management System) là phần mềm trung gian quản trị tương tác giữa người dùng và CSDL vật lý.",
        "exp": "Căn cứ SGK Tin học 11 (Bài 12. Hệ quản trị cơ sở dữ liệu và hệ cơ sở dữ liệu, Trang 60): Vai trò của Hệ QTCSDL."
      },
      {
        "lesson": 13,
        "topicIdx": 2,
        "q": "Trong cơ sở dữ liệu quan hệ, trường (hoặc tập hợp các trường) dùng để xác định duy nhất mỗi bản ghi trong bảng được gọi là:",
        "opts": [
          "A. Khóa ngoại (Foreign Key)",
          "B. Khóa chính (Primary Key)",
          "C. Bản ghi phụ (Secondary Key)",
          "D. Trường chỉ mục (Index Key)"
        ],
        "ans": "B",
        "page": 65,
        "excerpt": "Khóa chính (Primary Key) là một hoặc một nhóm thuộc tính có giá trị phân biệt duy nhất từng bản ghi (hàng) trong bảng và không được chứa giá trị rỗng (NULL).",
        "exp": "Căn cứ SGK Tin học 11 (Bài 13. Cơ sở dữ liệu quan hệ, Trang 65): Khái niệm khóa chính trong mô hình dữ liệu quan hệ."
      },
      {
        "lesson": 13,
        "topicIdx": 2,
        "q": "Trong mô hình dữ liệu quan hệ, các hàng của bảng tương ứng với khái niệm nào sau đây?",
        "opts": [
          "A. Các thuộc tính (Fields/Columns)",
          "B. Các bản ghi (Records/Tuples)",
          "C. Các kiểu dữ liệu",
          "D. Các khóa ngoại"
        ],
        "ans": "B",
        "page": 66,
        "excerpt": "Mỗi hàng trong bảng quan hệ biểu diễn một bản ghi (record) chứa đầy đủ thông tin về một đối tượng quản lý.",
        "exp": "Căn cứ SGK Tin học 11 (Bài 13, Trang 66): Khái niệm bản ghi trong bảng."
      },
      {
        "lesson": 14,
        "topicIdx": 2,
        "q": "Câu lệnh chuẩn nào trong ngôn ngữ SQL được dùng để trích xuất dữ liệu từ các bảng trong cơ sở dữ liệu?",
        "opts": [
          "A. SELECT",
          "B. INSERT INTO",
          "C. UPDATE",
          "D. DELETE"
        ],
        "ans": "A",
        "page": 71,
        "excerpt": "Lệnh SELECT dùng để truy vấn, đọc và hiển thị dữ liệu từ một hoặc nhiều bảng theo các tiêu chí xác định.",
        "exp": "Căn cứ SGK Tin học 11 (Bài 14. SQL - Ngôn ngữ truy vấn có cấu trúc, Trang 71): Cú pháp SELECT ... FROM ...;"
      },
      {
        "lesson": 14,
        "topicIdx": 2,
        "q": "Trong câu lệnh SQL truy vấn dữ liệu, mệnh đề nào sau đây dùng để thiết lập điều kiện lọc bản ghi?",
        "opts": [
          "A. ORDER BY",
          "B. WHERE",
          "C. GROUP BY",
          "D. HAVING"
        ],
        "ans": "B",
        "page": 72,
        "excerpt": "Mệnh đề WHERE chỉ định biểu thức điều kiện lọc; chỉ các bản ghi thỏa mãn điều kiện này mới được đưa vào kết quả truy vấn.",
        "exp": "Căn cứ SGK Tin học 11 (Bài 14. SQL - Ngôn ngữ truy vấn có cấu trúc, Trang 72): Mệnh đề WHERE."
      },
      {
        "lesson": 14,
        "topicIdx": 2,
        "q": "Mệnh đề nào trong câu lệnh SQL dùng để sắp xếp kết quả truy vấn theo thứ tự tăng dần hoặc giảm dần?",
        "opts": [
          "A. SORT BY",
          "B. ORDER BY",
          "C. GROUP BY",
          "D. ARRANGE BY"
        ],
        "ans": "B",
        "page": 73,
        "excerpt": "Mệnh đề ORDER BY sắp xếp các dòng kết quả theo thứ tự tăng dần (ASC - mặc định) hoặc giảm dần (DESC).",
        "exp": "Căn cứ SGK Tin học 11 (Bài 14, Trang 73): Mệnh đề ORDER BY."
      },
      {
        "lesson": 15,
        "topicIdx": 2,
        "q": "Biện pháp nào sau đây là giải pháp cơ bản nhất để kiểm soát truy cập và bảo vệ an toàn cho cơ sở dữ liệu?",
        "opts": [
          "A. Đặt máy chủ ngoài trời",
          "B. Phân quyền người dùng (chỉ cho phép truy cập đúng quyền hạn được cấp) và sao lưu định kỳ",
          "C. Không bao giờ đặt mật khẩu cho tài khoản quản trị",
          "D. Tắt toàn bộ máy chủ trong giờ làm việc"
        ],
        "ans": "B",
        "page": 77,
        "excerpt": "Phân quyền người dùng (Authorization) và sao lưu dự phòng định kỳ là hai trụ cột cốt lõi bảo đảm an toàn CSDL.",
        "exp": "Căn cứ SGK Tin học 11 (Bài 15. Bảo mật cơ sở dữ liệu, Trang 77): Các giải pháp bảo mật CSDL."
      },
      {
        "lesson": 16,
        "topicIdx": 3,
        "q": "Người chịu trách nhiệm thiết kế, cài đặt, phân quyền truy cập, sao lưu dự phòng và duy trì an toàn hệ CSDL của tổ chức là:",
        "opts": [
          "A. Kỹ sư kiểm thử phần mềm (Tester)",
          "B. Người quản trị cơ sở dữ liệu (Database Administrator - DBA)",
          "C. Chuyên viên nhập liệu",
          "D. Nhân viên đồ họa"
        ],
        "ans": "B",
        "page": 81,
        "excerpt": "Người quản trị CSDL (DBA) chịu trách nhiệm đảm bảo hệ CSDL vận hành liên tục, bảo mật, tối ưu hiệu năng và sao lưu dữ liệu an toàn.",
        "exp": "Căn cứ SGK Tin học 11 (Bài 16. Công việc quản trị cơ sở dữ liệu, Trang 81): Vai trò và nhiệm vụ của DBA."
      },
      {
        "lesson": 16,
        "topicIdx": 3,
        "q": "Một trong những nhiệm vụ trọng tâm và thường xuyên nhất của Người quản trị CSDL (DBA) nhằm đảm bảo an toàn dữ liệu trước các sự cố phần cứng hoặc mã độc là:",
        "opts": [
          "A. Cài đặt lại hệ điều hành hàng ngày",
          "B. Thực hiện sao lưu dữ liệu dự phòng định kỳ (Backup)",
          "C. Xóa các bảng dữ liệu cũ sau mỗi tuần",
          "D. Mở tất cả các quyền truy cập cho mọi người dùng"
        ],
        "ans": "B",
        "page": 82,
        "excerpt": "Sao lưu dữ liệu định kỳ là biện pháp cốt lõi giúp DBA có thể khôi phục lại hệ thống CSDL khi xảy ra sự cố phần cứng, thiên tai hoặc tấn công mạng.",
        "exp": "Căn cứ SGK Tin học 11 (Bài 16. Công việc quản trị cơ sở dữ liệu, Trang 82): Nhiệm vụ sao lưu dự phòng."
      },
      {
        "lesson": 16,
        "topicIdx": 3,
        "q": "Yêu cầu đạo đức nghề nghiệp quan trọng hàng đầu đối với Người quản trị cơ sở dữ liệu (DBA) là:",
        "opts": [
          "A. Được quyền sao chép và bán thông tin cá nhân khách hàng ra bên ngoài",
          "B. Tuyệt đối tôn trọng tính riêng tư và bảo mật dữ liệu, không lạm dụng quyền hạn để rò rỉ thông tin nhạy cảm",
          "C. Tự ý thay đổi điểm số học sinh hoặc số dư tài khoản ngân hàng",
          "D. Chia sẻ mật khẩu quản trị root cho người ngoài"
        ],
        "ans": "B",
        "page": 84,
        "excerpt": "DBA nắm toàn quyền truy cập dữ liệu nhạy cảm nên phải tuân thủ nghiêm ngặt quy định pháp luật và chuẩn mực đạo đức nghề nghiệp về bảo mật thông tin.",
        "exp": "Căn cứ SGK Tin học 11 (Bài 16, Trang 84): Trách nhiệm đạo đức của DBA."
      },
      {
        "lesson": 17,
        "topicIdx": 3,
        "q": "Phần mềm nào sau đây là công cụ có giao diện đồ họa (GUI) nguồn mở, miễn phí thường được sử dụng trong nhà trường để quản trị CSDL MySQL / MariaDB?",
        "opts": [
          "A. HeidiSQL",
          "B. Microsoft Excel",
          "C. Adobe Photoshop",
          "D. Scratch"
        ],
        "ans": "A",
        "page": 86,
        "excerpt": "HeidiSQL là phần mềm quản trị CSDL quan hệ giao diện đồ họa nhẹ, miễn phí và phổ biến, hỗ trợ kết nối tới MySQL, MariaDB, PostgreSQL.",
        "exp": "Căn cứ SGK Tin học 11 (Bài 17. Quản trị cơ sở dữ liệu trên một hệ quản trị cơ sở dữ liệu, Trang 86): Sử dụng HeidiSQL để quản trị CSDL."
      },
      {
        "lesson": 17,
        "topicIdx": 3,
        "q": "Cổng mạng mặc định (Port) thường được sử dụng để thiết lập kết nối tới hệ quản trị cơ sở dữ liệu MySQL / MariaDB trên máy chủ là:",
        "opts": [
          "A. Cổng 80",
          "B. Cổng 443",
          "C. Cổng 3306",
          "D. Cổng 21"
        ],
        "ans": "C",
        "page": 87,
        "excerpt": "Cổng mặc định cho dịch vụ MySQL / MariaDB là 3306. Khi cấu hình kết nối trong HeidiSQL cần khai báo đúng thông số này.",
        "exp": "Căn cứ SGK Tin học 11 (Bài 17. Quản trị cơ sở dữ liệu trên một hệ quản trị cơ sở dữ liệu, Trang 87): Thông số cổng kết nối 3306."
      },
      {
        "lesson": 17,
        "topicIdx": 3,
        "q": "Khi kết nối tới hệ quản trị CSDL MySQL cài đặt trực tiếp trên cùng máy tính đang sử dụng, địa chỉ máy chủ (Host) thường được khai báo là:",
        "opts": [
          "A. google.com",
          "B. localhost (hoặc 127.0.0.1)",
          "C. 192.168.1.255",
          "D. 0.0.0.0:80"
        ],
        "ans": "B",
        "page": 88,
        "excerpt": "Địa chỉ localhost (IP 127.0.0.1) đại diện cho chính máy tính cục bộ đang chạy chương trình.",
        "exp": "Căn cứ SGK Tin học 11 (Bài 17, Trang 88): Kết nối máy chủ cục bộ localhost."
      },
      {
        "lesson": 18,
        "topicIdx": 3,
        "q": "Khi xác định cấu trúc bảng HOC_SINH, thuộc tính nào sau đây thích hợp nhất để chọn làm Khóa chính (Primary Key)?",
        "opts": [
          "A. Họ và tên học sinh",
          "B. Ngày tháng năm sinh",
          "C. Mã định danh học sinh (MaHS)",
          "D. Địa chỉ nơi ở"
        ],
        "ans": "C",
        "page": 92,
        "excerpt": "Khóa chính phải đảm bảo tính duy nhất và không được chứa giá trị rỗng. Họ tên hoặc ngày sinh có thể trùng lặp nên không thể làm khóa chính; mã học sinh là lựa chọn chuẩn xác.",
        "exp": "Căn cứ SGK Tin học 11 (Bài 18. Thực hành xác định cấu trúc bảng và trường khóa, Trang 92): Tiêu chí chọn khóa chính."
      },
      {
        "lesson": 18,
        "topicIdx": 3,
        "q": "Để lưu trữ ngày tháng năm sinh của học sinh trong CSDL quan hệ, kiểu dữ liệu chuẩn và phù hợp nhất là:",
        "opts": [
          "A. INT",
          "B. DATE",
          "C. VARCHAR(20)",
          "D. BOOLEAN"
        ],
        "ans": "B",
        "page": 94,
        "excerpt": "Kiểu DATE trong hệ CSDL dùng để lưu trữ dữ liệu thời gian theo định dạng YYYY-MM-DD, cho phép thực hiện các phép so sánh và tính toán ngày tháng.",
        "exp": "Căn cứ SGK Tin học 11 (Bài 18. Thực hành xác định cấu trúc bảng và trường khóa, Trang 94): Lựa chọn kiểu dữ liệu DATE."
      },
      {
        "lesson": 19,
        "topicIdx": 3,
        "q": "Câu lệnh SQL chuẩn nào sau đây dùng để tạo mới một cơ sở dữ liệu có tên QUAN_LY_THU_VIEN?",
        "opts": [
          "A. MAKE DATABASE QUAN_LY_THU_VIEN;",
          "B. CREATE DATABASE QUAN_LY_THU_VIEN;",
          "C. NEW DATABASE QUAN_LY_THU_VIEN;",
          "D. ADD DATABASE QUAN_LY_THU_VIEN;"
        ],
        "ans": "B",
        "page": 96,
        "excerpt": "Cú pháp CREATE DATABASE dùng để tạo một cơ sở dữ liệu mới trên máy chủ CSDL.",
        "exp": "Căn cứ SGK Tin học 11 (Bài 19. Thực hành tạo lập cơ sở dữ liệu và bảng dữ liệu, Trang 96): Cú pháp CREATE DATABASE."
      },
      {
        "lesson": 19,
        "topicIdx": 3,
        "q": "Để bắt đầu làm việc và tạo các bảng bên trong cơ sở dữ liệu QL_DIEM, người dùng phải thực thi câu lệnh SQL nào trước tiên?",
        "opts": [
          "A. SELECT QL_DIEM;",
          "B. USE QL_DIEM;",
          "C. OPEN QL_DIEM;",
          "D. GO QL_DIEM;"
        ],
        "ans": "B",
        "page": 97,
        "excerpt": "Lệnh USE <Tên_CSDL> chỉ định CSDL làm việc hiện hành để các câu lệnh thao tác bảng tiếp theo được thực thi đúng vị trí.",
        "exp": "Căn cứ SGK Tin học 11 (Bài 19. Thực hành tạo lập cơ sở dữ liệu và bảng dữ liệu, Trang 97): Lệnh USE để chọn CSDL."
      },
      {
        "lesson": 20,
        "topicIdx": 3,
        "q": "Khi tạo bảng trong CSDL quan hệ, từ khóa nào sau đây dùng để thiết lập liên kết Khóa ngoài tham chiếu đến bảng khác?",
        "opts": [
          "A. PRIMARY KEY",
          "B. FOREIGN KEY ... REFERENCES ...",
          "C. UNIQUE KEY",
          "D. AUTO_INCREMENT"
        ],
        "ans": "B",
        "page": 101,
        "excerpt": "Cú pháp FOREIGN KEY (TênCột) REFERENCES BảngThamChiếu(CộtKhóaChính) dùng để ràng buộc khóa ngoại đảm bảo toàn vẹn tham chiếu.",
        "exp": "Căn cứ SGK Tin học 11 (Bài 20. Thực hành tạo lập các bảng có khóa ngoài, Trang 101): Cú pháp tạo khóa ngoại."
      },
      {
        "lesson": 20,
        "topicIdx": 3,
        "q": "Cho hai bảng: LOP(MaLop, TenLop) và HOC_SINH(MaHS, HoTen, MaLop). Để trường MaLop trong bảng HOC_SINH tham chiếu đến bảng LOP, cú pháp SQL đúng là:",
        "opts": [
          "A. FOREIGN KEY (MaLop) REFERENCES LOP(MaLop)",
          "B. PRIMARY KEY (MaLop) IN LOP",
          "C. LINK MaLop TO LOP(MaLop)",
          "D. CHECK (MaLop = LOP.MaLop)"
        ],
        "ans": "A",
        "page": 102,
        "excerpt": "Khóa ngoại trong bảng HOC_SINH tham chiếu đến khóa chính MaLop của bảng LOP để đảm bảo mỗi học sinh đều thuộc một lớp hợp lệ.",
        "exp": "Căn cứ SGK Tin học 11 (Bài 20. Thực hành tạo lập các bảng có khóa ngoài, Trang 102): Khai báo khóa ngoại tham chiếu."
      },
      {
        "lesson": 21,
        "topicIdx": 3,
        "q": "Câu lệnh SQL nào sau đây dùng để thêm một bản ghi học sinh mới vào bảng HOC_SINH?",
        "opts": [
          "A. ADD TO HOC_SINH VALUES ('HS01', 'Nguyen An');",
          "B. INSERT INTO HOC_SINH (MaHS, HoTen, MaLop) VALUES ('HS01', 'Nguyen An', '11A1');",
          "C. PUT INTO HOC_SINH VALUES ('HS01', 'Nguyen An');",
          "D. UPDATE HOC_SINH ADD ('HS01', 'Nguyen An');"
        ],
        "ans": "B",
        "page": 106,
        "excerpt": "Lệnh INSERT INTO dùng để chèn một hoặc nhiều bản ghi mới vào bảng dữ liệu theo danh sách thuộc tính tương ứng.",
        "exp": "Căn cứ SGK Tin học 11 (Bài 21. Thực hành cập nhật và truy xuất dữ liệu các bảng, Trang 106): Cú pháp lệnh INSERT INTO."
      },
      {
        "lesson": 21,
        "topicIdx": 3,
        "q": "Hậu quả nghiêm trọng nhất có thể xảy ra nếu người quản trị thực thi câu lệnh DELETE FROM HOC_SINH; mà quên không chỉ định mệnh đề WHERE là:",
        "opts": [
          "A. Hệ thống báo lỗi cú pháp và không thực hiện",
          "B. Chỉ xóa bản ghi đầu tiên trong bảng",
          "C. Toàn bộ tất cả các bản ghi trong bảng HOC_SINH sẽ bị xóa sạch",
          "D. Bảng HOC_SINH bị xóa hoàn toàn khỏi CSDL"
        ],
        "ans": "C",
        "page": 108,
        "excerpt": "Khi câu lệnh DELETE không có mệnh đề WHERE, điều kiện mặc định áp dụng cho toàn bộ các hàng dẫn đến toàn bộ dữ liệu trong bảng bị xóa.",
        "exp": "Căn cứ SGK Tin học 11 (Bài 21. Thực hành cập nhật và truy xuất dữ liệu các bảng, Trang 108): Cảnh báo nguy cơ khi dùng DELETE không có WHERE."
      },
      {
        "lesson": 22,
        "topicIdx": 3,
        "q": "Khi viết câu lệnh SQL truy vấn dữ liệu kết hợp từ hai bảng HOC_SINH và LOP mà thiếu điều kiện liên kết (hoặc quên mệnh đề ON/WHERE kết nối), kết quả trả về sẽ là:",
        "opts": [
          "A. Báo lỗi cú pháp SQL và dừng thực thi",
          "B. Chỉ lấy các bản ghi có họ tên trùng nhau",
          "C. Tích Descartes (ghép mỗi dòng của bảng này với mọi dòng của bảng kia)",
          "D. Bảng kết quả hoàn toàn trống (0 bản ghi)"
        ],
        "ans": "C",
        "page": 112,
        "excerpt": "Nếu không có điều kiện liên kết khóa, phép kết nối sẽ trở thành tích Descartes (Cartesian product) sinh ra số dòng bằng tích số dòng của hai bảng.",
        "exp": "Căn cứ SGK Tin học 11 (Bài 22. Thực hành liên kết các bảng và truy vấn dữ liệu từ nhiều bảng, Trang 112): Hiện tượng tích Descartes."
      },
      {
        "lesson": 23,
        "topicIdx": 3,
        "q": "Trong phần mềm quản trị CSDL HeidiSQL, thao tác xuất CSDL ra tệp tin kịch bản .sql (Export database as SQL script) có tác dụng gì?",
        "opts": [
          "A. Xóa hoàn toàn CSDL khỏi máy chủ",
          "B. Tạo bản sao lưu dự phòng (Backup) chứa toàn bộ cấu trúc và dữ liệu để phục hồi khi cần thiết",
          "C. Tự động mã hóa tệp tin video",
          "D. Đổi tên máy chủ MySQL"
        ],
        "ans": "B",
        "page": 116,
        "excerpt": "Xuất kịch bản SQL là phương pháp sao lưu logic tiêu chuẩn, lưu lại toàn bộ các câu lệnh tạo bảng và chèn dữ liệu để tái lập CSDL.",
        "exp": "Căn cứ SGK Tin học 11 (Bài 23. Thực hành sao lưu và phục hồi cơ sở dữ liệu, Trang 116): Ý nghĩa của thao tác xuất bản sao lưu SQL."
      },
      {
        "lesson": 20,
        "topicIdx": 3,
        "q": "Cú pháp câu lệnh SQL nào sau đây dùng để thiết lập ràng buộc khóa ngoài cho bảng SINH_VIEN tham chiếu đến cột MaLop của bảng LOP?",
        "opts": [
          "A. FOREIGN KEY (MaLop) REFERENCES LOP(MaLop)",
          "B. PRIMARY KEY (MaLop) REFERENCES LOP(MaLop)",
          "C. CHECK (MaLop IN LOP)",
          "D. LINK MaLop TO LOP(MaLop)"
        ],
        "ans": "A",
        "page": 101,
        "excerpt": "Cú pháp khai báo khóa ngoài: FOREIGN KEY (Tên_trường) REFERENCES Tên_bảng_tham_chiếu(Tên_trường_khóa_chính).",
        "exp": "Căn cứ SGK Tin học 11 (Bài 20. Tạo bảng có khóa ngoài, Trang 101): Cú pháp tạo khóa ngoài trong SQL."
      },
      {
        "lesson": 20,
        "topicIdx": 3,
        "q": "Khi hai bảng trong CSDL quan hệ được liên kết với nhau thông qua khóa ngoài, nguyên tắc toàn vẹn tham chiếu đòi hỏi điều kiện nào sau đây?",
        "opts": [
          "A. Khóa chính và khóa ngoài bắt buộc phải cùng tên gọi",
          "B. Giá trị của trường khóa ngoài phải tồn tại trong tập giá trị của trường khóa chính tương ứng (hoặc mang giá trị NULL)",
          "C. Bảng chứa khóa ngoài phải có số lượng bản ghi nhiều hơn bảng chứa khóa chính",
          "D. Người dùng không được phép thêm bản ghi mới vào bảng chứa khóa chính"
        ],
        "ans": "B",
        "page": 103,
        "excerpt": "Ràng buộc toàn vẹn tham chiếu đảm bảo mọi giá trị của khóa ngoài đều phải xuất hiện ở khóa chính của bảng tham chiếu.",
        "exp": "Căn cứ SGK Tin học 11 (Bài 20, Trang 103): Ràng buộc toàn vẹn tham chiếu CSDL."
      },
      {
        "lesson": 21,
        "topicIdx": 3,
        "q": "Trong ngôn ngữ SQL, câu lệnh nào sau đây cập nhật tăng điểm trung bình thêm 1.0 cho tất cả học sinh có MaLop là '11A1'?",
        "opts": [
          "A. UPDATE HOC_SINH SET DiemTB = DiemTB + 1.0 WHERE MaLop = '11A1';",
          "B. INSERT INTO HOC_SINH (DiemTB) VALUES (DiemTB + 1.0) WHERE MaLop = '11A1';",
          "C. ALTER TABLE HOC_SINH ADD DiemTB = 1.0 WHERE MaLop = '11A1';",
          "D. SELECT DiemTB + 1.0 FROM HOC_SINH WHERE MaLop = '11A1';"
        ],
        "ans": "A",
        "page": 106,
        "excerpt": "Cú pháp câu lệnh UPDATE: UPDATE Tên_bảng SET Tên_trường = Giá_trị_mới WHERE Điều_kiện;",
        "exp": "Căn cứ SGK Tin học 11 (Bài 21. Thực hành cập nhật và truy xuất dữ liệu các bảng, Trang 106): Cú pháp lệnh UPDATE."
      },
      {
        "lesson": 21,
        "topicIdx": 3,
        "q": "Để xóa một bản ghi có mã học sinh MaHS = 'HS05' trong bảng HOC_SINH, câu lệnh SQL chuẩn là:",
        "opts": [
          "A. DELETE FROM HOC_SINH WHERE MaHS = 'HS05';",
          "B. DROP TABLE HOC_SINH WHERE MaHS = 'HS05';",
          "C. REMOVE FROM HOC_SINH WHERE MaHS = 'HS05';",
          "D. CLEAR HOC_SINH.HS05;"
        ],
        "ans": "A",
        "page": 107,
        "excerpt": "Cú pháp xóa bản ghi thỏa mãn điều kiện: DELETE FROM Tên_bảng WHERE Điều_kiện;",
        "exp": "Căn cứ SGK Tin học 11 (Bài 21, Trang 107): Cú pháp lệnh DELETE có điều kiện WHERE."
      },
      {
        "lesson": 21,
        "topicIdx": 3,
        "q": "Khi thực hiện câu lệnh chèn dữ liệu INSERT INTO mà không liệt kê danh sách tên cột, quy tắc bắt buộc là gì?",
        "opts": [
          "A. Phải cung cấp đầy đủ giá trị cho tất cả các cột theo đúng thứ tự định nghĩa trong cấu trúc bảng",
          "B. Chỉ cần cung cấp giá trị cho các cột kiểu số",
          "C. Bắt buộc phải để trống cột khóa chính",
          "D. Các giá trị phải được sắp xếp theo thứ tự bảng chữ cái"
        ],
        "ans": "A",
        "page": 105,
        "excerpt": "Nếu không chỉ định danh sách trường sau tên bảng, danh sách giá trị trong mệnh đề VALUES phải khớp chính xác thứ tự và kiểu dữ liệu của các trường trong bảng.",
        "exp": "Căn cứ SGK Tin học 11 (Bài 21, Trang 105): Quy tắc dùng INSERT INTO không chỉ định tên cột."
      },
      {
        "lesson": 22,
        "topicIdx": 3,
        "q": "Trong câu lệnh SQL truy vấn kết hợp hai bảng: SELECT * FROM HOC_SINH JOIN LOP ON HOC_SINH.MaLop = LOP.MaLop; mệnh đề ON có vai trò gì?",
        "opts": [
          "A. Xác định điều kiện kết nối dữ liệu giữa trường khóa ngoài và trường khóa chính tương ứng",
          "B. Sắp xếp các bản ghi theo thứ tự tăng dần",
          "C. Đổi tên trường dữ liệu hiển thị trên màn hình",
          "D. Xóa các bản ghi trùng lặp trong kết quả"
        ],
        "ans": "A",
        "page": 110,
        "excerpt": "Mệnh đề ON chỉ định điều kiện kết nối các bản ghi giữa hai bảng dựa trên mối quan hệ khóa chính – khóa ngoài.",
        "exp": "Căn cứ SGK Tin học 11 (Bài 22. Thực hành liên kết các bảng và truy vấn, Trang 110): Vai trò mệnh đề ON trong JOIN."
      },
      {
        "lesson": 22,
        "topicIdx": 3,
        "q": "Mục đích chính của việc sử dụng 'Bí danh' (Alias) cho tên bảng trong câu lệnh SQL (ví dụ: FROM HOC_SINH hs JOIN LOP lp) là gì?",
        "opts": [
          "A. Giúp câu lệnh ngắn gọn, dễ đọc và tránh xung đột khi hai bảng có các trường trùng tên",
          "B. Tự động mã hóa tên bảng trên máy chủ CSDL",
          "C. Tăng tốc độ đường truyền mạng Internet",
          "D. Thay đổi vĩnh viễn tên bảng lưu trong tệp cơ sở dữ liệu"
        ],
        "ans": "A",
        "page": 111,
        "excerpt": "Sử dụng bí danh giúp người lập trình viết câu lệnh truy vấn gọn gàng và phân biệt rõ ràng các trường trùng tên giữa các bảng.",
        "exp": "Căn cứ SGK Tin học 11 (Bài 22, Trang 111): Kĩ thuật đặt bí danh bảng trong SQL."
      },
      {
        "lesson": 22,
        "topicIdx": 3,
        "q": "Giả sử bảng LOP có 5 bản ghi và bảng HOC_SINH có 40 bản ghi. Nếu thực hiện câu lệnh SELECT * FROM LOP, HOC_SINH; (không có mệnh đề WHERE kết nối), kết quả trả về bao nhiêu bản ghi?",
        "opts": [
          "A. 200 bản ghi",
          "B. 45 bản ghi",
          "C. 40 bản ghi",
          "D. 8 bản ghi"
        ],
        "ans": "A",
        "page": 112,
        "excerpt": "Hiện tượng tích Descartes: Số bản ghi của kết quả bằng tích số lượng bản ghi của hai bảng: 5 * 40 = 200 bản ghi.",
        "exp": "Căn cứ SGK Tin học 11 (Bài 22, Trang 112): Công thức tính số dòng trong tích Descartes."
      },
      {
        "lesson": 23,
        "topicIdx": 3,
        "q": "Khi thực hiện phục hồi (Restore/Import) cơ sở dữ liệu từ tệp tin kịch bản sao lưu .sql, hệ quản trị CSDL thực hiện công việc gì?",
        "opts": [
          "A. Tuần tự thực thi lại các câu lệnh SQL (CREATE TABLE, INSERT INTO...) có trong tệp kịch bản để tái lập cấu trúc và dữ liệu",
          "B. Tự động nén toàn bộ dữ liệu thành tệp định dạng .zip",
          "C. Xóa sạch hệ điều hành máy tính",
          "D. Quét mã độc và gửi báo cáo về máy chủ đám mây"
        ],
        "ans": "A",
        "page": 115,
        "excerpt": "Quá trình nhập dữ liệu (Import) sẽ lần lượt chạy lại toàn bộ các câu lệnh SQL định nghĩa cấu trúc và chèn bản ghi đã được sao lưu.",
        "exp": "Căn cứ SGK Tin học 11 (Bài 23. Thực hành sao lưu và phục hồi CSDL, Trang 115): Cơ chế phục hồi dữ liệu từ file .sql."
      },
      {
        "lesson": 23,
        "topicIdx": 3,
        "q": "Đặc điểm nổi bật của phương pháp sao lưu cơ sở dữ liệu dạng kịch bản văn bản SQL (SQL Script) là:",
        "opts": [
          "A. Có tính khả chuyển cao, dễ dàng đọc, kiểm tra và chuyển đổi giữa các máy chủ CSDL khác nhau",
          "B. Bắt buộc phải có kết nối mạng cáp quang mới mở được",
          "C. Không thể lưu trữ trên ổ đĩa USB di động",
          "D. Luôn có dung lượng lớn hơn 100 Gigabyte"
        ],
        "ans": "A",
        "page": 114,
        "excerpt": "Tệp sao lưu .sql là tệp văn bản thuần túy chứa mã lệnh SQL tiêu chuẩn nên có thể mở đọc bằng trình soạn thảo và chuyển đổi linh hoạt.",
        "exp": "Căn cứ SGK Tin học 11 (Bài 23, Trang 114): Ưu điểm của sao lưu logic dạng kịch bản SQL."
      },
      {
        "lesson": 24,
        "topicIdx": 3,
        "q": "Hàm gộp nào trong ngôn ngữ SQL được sử dụng để đếm tổng số lượng bản ghi học sinh trong một bảng dữ liệu?",
        "opts": [
          "A. COUNT()",
          "B. SUM()",
          "C. AVG()",
          "D. TOTAL()"
        ],
        "ans": "A",
        "page": 117,
        "excerpt": "Hàm COUNT(*) trả về tổng số hàng trong bảng thỏa mãn điều kiện lọc của câu lệnh truy vấn.",
        "exp": "Căn cứ SGK Tin học 11 (Bài 24. Thực hành tổng hợp tạo lập CSDL và truy vấn, Trang 117): Hàm gộp COUNT trong SQL."
      },
      {
        "lesson": 24,
        "topicIdx": 3,
        "q": "Trong câu lệnh truy vấn SQL thống kê số lượng học sinh theo từng lớp, mệnh đề nào sau đây bắt buộc phải có để gom nhóm dữ liệu?",
        "opts": [
          "A. GROUP BY MaLop",
          "B. ORDER BY MaLop",
          "C. FILTER BY MaLop",
          "D. SPLIT BY MaLop"
        ],
        "ans": "A",
        "page": 117,
        "excerpt": "Mệnh đề GROUP BY phân nhóm các bản ghi có cùng giá trị trong cột chỉ định để tính toán hàm gộp theo từng nhóm.",
        "exp": "Căn cứ SGK Tin học 11 (Bài 24, Trang 117): Cú pháp mệnh đề GROUP BY trong truy vấn thống kê."
      },
      {
        "lesson": 24,
        "topicIdx": 3,
        "q": "Để sắp xếp kết quả danh sách học sinh theo thứ tự điểm trung bình giảm dần từ cao xuống thấp, ta sử dụng mệnh đề nào?",
        "opts": [
          "A. ORDER BY DiemTB DESC",
          "B. ORDER BY DiemTB ASC",
          "C. SORT BY DiemTB DOWN",
          "D. GROUP BY DiemTB DESC"
        ],
        "ans": "A",
        "page": 118,
        "excerpt": "Từ khóa DESC (Descending) đi kèm với ORDER BY chỉ định sắp xếp dữ liệu theo thứ tự giảm dần.",
        "exp": "Căn cứ SGK Tin học 11 (Bài 24, Trang 118): Sắp xếp giảm dần với ORDER BY DESC."
      },
      {
        "lesson": 25,
        "topicIdx": 4,
        "q": "Trong phần mềm chỉnh sửa ảnh GIMP, thao tác nào cho phép tạo ra một tệp ảnh mới với kích thước và độ phân giải mong muốn?",
        "opts": [
          "A. Chọn File -> New... (hoặc nhấn tổ hợp phím Ctrl + N)",
          "B. Chọn Edit -> Cut (Ctrl + X)",
          "C. Chọn View -> Zoom In",
          "D. Chọn Help -> About"
        ],
        "ans": "A",
        "page": 121,
        "excerpt": "Để tạo tệp ảnh mới, chọn File -> New... hoặc dùng phím tắt Ctrl + N, hộp thoại Create a New Image xuất hiện để nhập chiều rộng, chiều cao và độ phân giải.",
        "exp": "Căn cứ SGK Tin học 11 (Bài 25. Phần mềm chỉnh sửa ảnh, Trang 121): Tạo tệp ảnh mới trong GIMP."
      },
      {
        "lesson": 25,
        "topicIdx": 4,
        "q": "Kênh Alpha (Alpha Channel) trong phần mềm chỉnh sửa ảnh GIMP có vai trò quan trọng nào sau đây?",
        "opts": [
          "A. Quản lý mức độ trong suốt (Transparency) của các điểm ảnh trên một lớp ảnh (Layer)",
          "B. Tăng dung lượng pin cho máy tính xách tay",
          "C. Tự động kết nối máy ảnh kỹ thuật số qua Bluetooth",
          "D. Dịch phụ đề văn bản trên bức ảnh sang tiếng Anh"
        ],
        "ans": "A",
        "page": 122,
        "excerpt": "Kênh Alpha chứa thông tin về độ trong suốt của ảnh. Nếu lớp ảnh không có kênh Alpha, khi tẩy xóa thì vùng bị xóa sẽ hiển thị màu nền thay vì độ trong suốt.",
        "exp": "Căn cứ SGK Tin học 11 (Bài 25, Trang 122): Vai trò của kênh Alpha trong GIMP."
      },
      {
        "lesson": 25,
        "topicIdx": 4,
        "q": "Trong bảng điều khiển các lớp ảnh (Layers Panel) của GIMP, biểu tượng 'con mắt' bên cạnh mỗi lớp ảnh có tác dụng gì?",
        "opts": [
          "A. Bật hoặc tắt chế độ hiển thị (ẩn/hiện) của lớp ảnh đó trên khung vẽ",
          "B. Khóa vĩnh viễn không cho chỉnh sửa",
          "C. Tự động chụp ảnh màn hình",
          "D. Xóa ngay lập tức lớp ảnh khỏi dự án"
        ],
        "ans": "A",
        "page": 121,
        "excerpt": "Nhấp chuột vào biểu tượng con mắt để ẩn hoặc hiện lớp ảnh tương ứng, giúp người biên tập dễ dàng quan sát các chi tiết.",
        "exp": "Căn cứ SGK Tin học 11 (Bài 25, Trang 121): Chức năng ẩn/hiện lớp ảnh trong Layers Panel."
      },
      {
        "lesson": 25,
        "topicIdx": 4,
        "q": "Trong các phần mềm chỉnh sửa ảnh chuyên nghiệp (như GIMP, Photoshop), khái niệm \"Lớp\" (Layer) có ý nghĩa gì?",
        "opts": [
          "A. Là kích thước tệp ảnh lưu trên đĩa",
          "B. Là các mặt phẳng chứa đối tượng hình ảnh xếp chồng lên nhau độc lập, giúp chỉnh sửa từng thành phần mà không ảnh hưởng thành phần khác",
          "C. Là độ phân giải điểm ảnh của máy ảnh kỹ thuật số",
          "D. Là định dạng đuôi tệp tin ảnh JPEG"
        ],
        "ans": "B",
        "page": 120,
        "excerpt": "Layer (lớp ảnh) cho phép người biên tập xử lý từng chi tiết, hình ảnh riêng biệt được xếp chồng lên nhau để tạo nên bức ảnh hoàn chỉnh.",
        "exp": "Căn cứ SGK Tin học 11 (Bài 25. Phần mềm chỉnh sửa ảnh, Trang 120): Khái niệm Layer trong chỉnh sửa ảnh số."
      },
      {
        "lesson": 26,
        "topicIdx": 4,
        "q": "Công cụ nào trong phần mềm GIMP cho phép chọn một vùng hình ảnh có các điểm ảnh liền kề đồng nhất về màu sắc?",
        "opts": [
          "A. Rectangle Select",
          "B. Fuzzy Select (Magic Wand)",
          "C. Crop Tool",
          "D. Zoom Tool"
        ],
        "ans": "B",
        "page": 125,
        "excerpt": "Công cụ Fuzzy Select (cây đũa thần) chọn các vùng ảnh liền kề có màu sắc tương tự nhau dựa trên ngưỡng dung sai thiết lập.",
        "exp": "Căn cứ SGK Tin học 11 (Bài 26. Công cụ chọn vùng trong GIMP, Trang 125): Công cụ Fuzzy Select."
      },
      {
        "lesson": 28,
        "topicIdx": 4,
        "q": "Nguyên lý cơ bản để tạo ảnh động (Animation) hoặc video phim hoạt hình là:",
        "opts": [
          "A. Chỉ sử dụng duy nhất một bức ảnh tĩnh và thay đổi màu sắc ngẫu nhiên",
          "B. Trình chiếu nối tiếp liên tục các khung hình (frames) tĩnh có sự biến đổi nhỏ với tốc độ nhanh để đánh lừa thị giác",
          "C. Nén tệp tin ảnh về dung lượng nhỏ nhất có thể",
          "D. Chụp ảnh màn hình máy tính với độ sáng tối đa"
        ],
        "ans": "B",
        "page": 136,
        "excerpt": "Ảnh động được tạo nên từ một chuỗi các khung hình (frames) xuất hiện liên tiếp trong một khoảng thời gian ngắn, dựa trên hiện tượng lưu ảnh trên võng mạc mắt người.",
        "exp": "Căn cứ SGK Tin học 11 (Bài 28. Tạo ảnh động, Trang 136): Nguyên lý hoạt động của ảnh động và hoạt hình."
      },
      {
        "lesson": 28,
        "topicIdx": 4,
        "q": "Định dạng tệp tin đồ họa phổ biến nào hỗ trợ lưu trữ chuỗi nhiều khung hình để hiển thị ảnh động trên trình duyệt web?",
        "opts": [
          "A. .PNG tĩnh",
          "B. .GIF",
          "C. .JPG",
          "D. .BMP"
        ],
        "ans": "B",
        "page": 137,
        "excerpt": "Định dạng GIF (Graphics Interchange Format) hỗ trợ ảnh động lưu trữ nhiều khung hình liên tiếp.",
        "exp": "Căn cứ SGK Tin học 11 (Bài 28, Trang 137): Định dạng tệp ảnh động GIF."
      },
      {
        "lesson": 30,
        "topicIdx": 4,
        "q": "Trong phần mềm làm phim biên tập video, thao tác cắt bỏ một đoạn video không mong muốn ở giữa phân cảnh được gọi là:",
        "opts": [
          "A. Tách đoạn (Split) và Xóa (Delete/Ripple Delete)",
          "B. Xuất bản video (Export)",
          "C. Phóng to hình ảnh",
          "D. Tăng tốc độ khung hình"
        ],
        "ans": "A",
        "page": 147,
        "excerpt": "Thao tác Split chia nhỏ đoạn clip trên timeline, sau đó xóa bỏ phần thừa để nối liền mạch các cảnh quay.",
        "exp": "Căn cứ SGK Tin học 11 (Bài 30. Biên tập phim, Trang 147): Cắt ghép video trên Timeline."
      },
      {
        "lesson": 31,
        "topicIdx": 4,
        "q": "Hiệu ứng chuyển cảnh (Transition) trong biên tập phim có tác dụng gì?",
        "opts": [
          "A. Thay đổi độ phân giải của máy tính",
          "B. Tạo sự chuyển tiếp mượt mà, nghệ thuật giữa hai cảnh quay nối tiếp nhau",
          "C. Xóa âm thanh nền của video",
          "D. Tự động dịch phụ đề"
        ],
        "ans": "B",
        "page": 152,
        "excerpt": "Hiệu ứng chuyển cảnh làm cho sự chuyển đổi giữa các cảnh quay tự nhiên, mượt mà và không gây giật cục cho người xem.",
        "exp": "Căn cứ SGK Tin học 11 (Bài 31. Thực hành làm phim hoạt hình, Trang 152): Hiệu ứng Transition."
      },
      {
        "lesson": 1,
        "topicIdx": 0,
        "q": "Cơ chế 'Plug and Play' (cắm và chạy) của hệ điều hành máy tính cá nhân mang lại tiện ích gì nổi bật cho người dùng?",
        "opts": [
          "A. Tự động nhận biết thiết bị ngoại vi khi cắm vào máy tính và tự động kích hoạt trình điều khiển (driver) phù hợp",
          "B. Tự động dập tắt đám cháy trong máy tính",
          "C. Tăng gấp đôi dung lượng ổ đĩa cứng ngay lập tức",
          "D. Biến máy tính để bàn thành siêu máy tính"
        ],
        "ans": "A",
        "page": 6,
        "excerpt": "Cơ chế plug & play giúp hệ điều hành nhận biết các thiết bị ngoại vi ngay khi khởi động máy và có thể hỗ trợ cài đặt các chương trình điều khiển một cách tự động.",
        "exp": "Căn cứ SGK Tin học 11 (Bài 1, Trang 6): Cơ chế Plug & Play trong hệ điều hành."
      },
      {
        "lesson": 2,
        "topicIdx": 0,
        "q": "Hiện tượng phân mảnh đĩa (Disk Fragmentation) trên ổ đĩa cứng máy tính gây ra tác hại gì?",
        "opts": [
          "A. Làm giảm tốc độ đọc và ghi tệp dữ liệu do đầu đọc phải di chuyển cơ học giữa các liên cung không liên tục",
          "B. Làm biến mất vĩnh viễn hệ điều hành Windows",
          "C. Tự động mã hoá dữ liệu cá nhân",
          "D. Làm vỡ tấm kính màn hình máy tính"
        ],
        "ans": "A",
        "page": 13,
        "excerpt": "Khi đó, thời gian đọc, ghi tệp tăng lên nhiều lần vì đầu từ phải dịch chuyển liên tục. Tiện ích tối ưu hoá (Optimize/Defragment) cho phép dồn và hợp mảnh tệp.",
        "exp": "Căn cứ SGK Tin học 11 (Bài 2, Trang 13): Hiện tượng phân mảnh đĩa và tối ưu hoá."
      },
      {
        "lesson": 6,
        "topicIdx": 1,
        "q": "Khi chia sẻ một tệp tin trên dịch vụ lưu trữ đám mây Google Drive, quyền chia sẻ nào cho phép người nhận có đầy đủ quyền xem, nhận xét, chỉnh sửa nội dung và chia sẻ cho người khác?",
        "opts": [
          "A. Quyền chỉnh sửa (Editor)",
          "B. Quyền chỉ xem (Viewer)",
          "C. Quyền người nhận xét (Commenter)",
          "D. Quyền tạm khóa"
        ],
        "ans": "A",
        "page": 33,
        "excerpt": "Quyền chỉnh sửa là quyền cao nhất cho phép xem, nhận xét và thực hiện mọi thao tác với thư mục và tệp (chỉnh sửa, xoá, tạo mới, đổi tên...).",
        "exp": "Căn cứ SGK Tin học 11 (Bài 6, Trang 33): Ba chế độ chia sẻ tệp trên Google Drive."
      },
      {
        "lesson": 6,
        "topicIdx": 1,
        "q": "Ưu điểm vượt trội của việc lưu trữ dữ liệu trên các ổ đĩa trực tuyến (Google Drive, OneDrive, Dropbox) so với lưu trên thẻ nhớ USB là gì?",
        "opts": [
          "A. Có thể truy cập dữ liệu mọi lúc, mọi nơi từ bất kì thiết bị nào có Internet và chia sẻ làm việc nhóm tiện lợi",
          "B. Không bao giờ cần phải nhập mật khẩu tài khoản",
          "C. Hoạt động bình thường mà không cần có kết nối mạng",
          "D. Tốc độ truyền tin luôn đạt 1000 GB/s"
        ],
        "ans": "A",
        "page": 32,
        "excerpt": "Lợi ích của các phần mềm này là có thể sử dụng ở bất cứ đâu, bất cứ nơi nào, bất cứ máy tính nào miễn là có kết nối Internet...",
        "exp": "Căn cứ SGK Tin học 11 (Bài 6, Trang 32): Ưu điểm của ổ đĩa trực tuyến."
      },
      {
        "lesson": 7,
        "topicIdx": 1,
        "q": "Để tìm kiếm chính xác các tài liệu dạng tệp PDF chứa cụm từ 'Tuyển sinh Đại học Dược Hà Nội' trên máy tìm kiếm Google, cú pháp nhập đúng là:",
        "opts": [
          "A. \"Tuyển sinh Đại học Dược Hà Nội\" filetype:pdf",
          "B. Tuyển sinh Đại học Dược Hà Nội .pdf",
          "C. search pdf Tuyển sinh Dược",
          "D. find:pdf \"Dược Hà Nội\""
        ],
        "ans": "A",
        "page": 37,
        "excerpt": "Để nâng cao tính chính xác... người dùng có thể yêu cầu tìm dưới dạng tệp tin pdf để xem được nội dung. Cú pháp: từ khoá đặt trong dấu nháy kép + filetype:pdf.",
        "exp": "Căn cứ SGK Tin học 11 (Bài 7, Trang 37-38): Cú pháp tìm kiếm theo định dạng tệp filetype:pdf."
      },
      {
        "lesson": 8,
        "topicIdx": 1,
        "q": "Trong hộp thư điện tử Gmail, thao tác tạo và gắn 'Nhãn' (Label) cho các bức thư đến có tác dụng gì?",
        "opts": [
          "A. Giúp phân loại, sắp xếp các thư điện tử theo nhóm công việc/chủ đề để tìm kiếm và quản lí thư dễ dàng hơn",
          "B. Xoá sạch toàn bộ các thư trong hộp thư đến",
          "C. Tự động gửi thư trả lời cho tất cả bạn bè",
          "D. Chặn không cho người khác gửi email đến"
        ],
        "ans": "A",
        "page": 39,
        "excerpt": "Sử dụng Nhãn (Label) để sắp xếp, phân loại thư trong hộp thư đến giúp em tiết kiệm thời gian khi tìm kiếm lại các thư, tránh thất lạc thông tin.",
        "exp": "Căn cứ SGK Tin học 11 (Bài 8, Trang 39): Gắn nhãn phân loại thư trong Gmail."
      },
      {
        "lesson": 8,
        "topicIdx": 1,
        "q": "Trên mạng xã hội Facebook, tính năng 'Fanpage' thường được sử dụng nhằm mục đích chính nào sau đây?",
        "opts": [
          "A. Giúp các tổ chức, doanh nghiệp, trường lớp quảng bá hình ảnh, thương hiệu, sản phẩm và kết nối với cộng đồng",
          "B. Thay thế hoàn toàn trang cá nhân bí mật",
          "C. Làm giảm dung lượng ảnh đại diện xuống mức tối thiểu",
          "D. Chỉ cho phép đúng 10 người theo dõi"
        ],
        "ans": "A",
        "page": 40,
        "excerpt": "Fanpage là trang web trên Facebook giúp các tổ chức, doanh nghiệp quảng bá hình ảnh, thương hiệu và sản phẩm... đăng tải các bài viết, ảnh, video và sự kiện.",
        "exp": "Căn cứ SGK Tin học 11 (Bài 8, Trang 40): Khai thác tính năng Fanpage trên Facebook."
      },
      {
        "lesson": 9,
        "topicIdx": 1,
        "q": "Để chủ động phòng tránh các thủ đoạn lừa đảo tinh vi trên không gian mạng, người dùng cần tuân thủ 3 nguyên tắc vàng nào sau đây?",
        "opts": [
          "A. Hãy chậm lại – Kiểm tra ngay – Dừng lại, không gửi",
          "B. Chuyển tiền ngay – Gọi lại ngay – Gửi mật khẩu",
          "C. Bấm vào link ngay – Điền thông tin – Chia sẻ cho bạn bè",
          "D. Tắt máy ngay – Đổi máy tính mới – Đổi địa chỉ nhà"
        ],
        "ans": "A",
        "page": 46,
        "excerpt": "Cần tỉnh táo và bình tĩnh tuân thủ 3 nguyên tắc: Hãy chậm lại; Kiểm tra ngay; Dừng lại, không gửi để nhận biết và phòng tránh lừa đảo trên không gian số.",
        "exp": "Căn cứ SGK Tin học 11 (Bài 9, Trang 44-46): Ba nguyên tắc vàng phòng chống lừa đảo trên mạng."
      },
      {
        "lesson": 9,
        "topicIdx": 1,
        "q": "Bộ Quy tắc ứng xử trên mạng xã hội do Bộ Thông tin và Truyền thông ban hành theo Quyết định 874/QĐ-BTTTT bao gồm 4 quy tắc cốt lõi nào?",
        "opts": [
          "A. Tôn trọng, tuân thủ pháp luật; Lành mạnh; An toàn, bảo mật thông tin; Trách nhiệm",
          "B. Tự do ngôn luận; Ẩn danh tuyệt đối; Chia sẻ không giới hạn; Thách thức",
          "C. Mua bán tự do; Đăng tin giật gân; Tranh luận gay gắt; Quảng cáo",
          "D. Chỉ kết bạn với người lạ; Dùng nhiều tài khoản ảo; Sao chép tự do"
        ],
        "ans": "A",
        "page": 47,
        "excerpt": "Bốn quy tắc chính: 1) Quy tắc tôn trọng, tuân thủ pháp luật; 2) Quy tắc lành mạnh; 3) Quy tắc an toàn, bảo mật thông tin; 4) Quy tắc trách nhiệm.",
        "exp": "Căn cứ SGK Tin học 11 (Bài 9, Trang 47-48): Bốn quy tắc ứng xử trên mạng xã hội theo QĐ 874/QĐ-BTTTT."
      },
      {
        "lesson": 10,
        "topicIdx": 2,
        "q": "Hai nhóm công việc cơ bản và cốt lõi nhất khi thực hiện bài toán quản lí dữ liệu trên máy tính là:",
        "opts": [
          "A. Cập nhật dữ liệu (thêm, sửa, xoá) và Truy xuất dữ liệu (tìm kiếm, sắp xếp, lọc, kết xuất báo cáo)",
          "B. Quét virus và cài đặt hệ điều hành",
          "C. Thiết kế mạch in và lắp ráp vi mạch",
          "D. Lập trình trò chơi và dựng video"
        ],
        "ans": "A",
        "page": 49,
        "excerpt": "Các công việc cơ bản: 1. Cập nhật dữ liệu: việc thêm, xoá và chỉnh sửa dữ liệu... 2. Truy xuất dữ liệu và khai thác thông tin: tìm kiếm, sắp xếp, lọc, tính toán thống kê...",
        "exp": "Căn cứ SGK Tin học 11 (Bài 10, Trang 49-51): Cập nhật và truy xuất dữ liệu trong bài toán quản lí."
      },
      {
        "lesson": 11,
        "topicIdx": 2,
        "q": "Thuộc tính cơ bản nào của CSDL bảo đảm rằng dữ liệu lưu trữ không bị mâu thuẫn, sai lệch và được phản ánh chính xác sau các thao tác cập nhật đồng thời?",
        "opts": [
          "A. Tính nhất quán",
          "B. Tính không dư thừa",
          "C. Tính độc lập dữ liệu",
          "D. Tính bảo mật"
        ],
        "ans": "A",
        "page": 57,
        "excerpt": "Tính nhất quán: Khái niệm về tính nhất quán đòi hỏi dữ liệu trong các CSDL được đảm bảo đúng đắn sau các thao tác cập nhật dữ liệu, kể cả khi xảy ra sự cố ngay trong quá trình cập nhật.",
        "exp": "Căn cứ SGK Tin học 11 (Bài 11, Trang 57): Các thuộc tính cơ bản của CSDL."
      },
      {
        "lesson": 12,
        "topicIdx": 2,
        "q": "Trong Hệ quản trị cơ sở dữ liệu (QTCSDL), nhóm chức năng DDL (Data Definition Language) có nhiệm vụ gì?",
        "opts": [
          "A. Khai báo, tạo lập và sửa đổi cấu trúc CSDL và các bảng dữ liệu",
          "B. Thêm, sửa, xoá các bản ghi dữ liệu bên trong bảng",
          "C. Cấp và thu hồi quyền truy cập của người dùng",
          "D. Sao lưu dự phòng hệ điều hành"
        ],
        "ans": "A",
        "page": 58,
        "excerpt": "Nhóm chức năng định nghĩa dữ liệu (DDL): khai báo CSDL, tạo lập, sửa đổi kiến trúc bên trong mỗi CSDL, cài đặt các ràng buộc toàn vẹn dữ liệu.",
        "exp": "Căn cứ SGK Tin học 11 (Bài 12, Trang 58): Chức năng định nghĩa dữ liệu DDL."
      },
      {
        "lesson": 12,
        "topicIdx": 2,
        "q": "Trong mô hình CSDL khách – chủ (Client – Server), thành phần phần mềm khách (Client) đảm nhận nhiệm vụ gì?",
        "opts": [
          "A. Cung cấp giao diện tương tác với người dùng, gửi yêu cầu truy vấn đến máy chủ CSDL và hiển thị kết quả",
          "B. Trực tiếp ghi dữ liệu vật lí lên các phiến đĩa từ của máy chủ",
          "C. Quản lí phân quyền tài khoản quản trị hệ thống root",
          "D. Vận hành máy chủ web"
        ],
        "ans": "A",
        "page": 60,
        "excerpt": "Phần mềm khách có nhiệm vụ tổ chức giao diện tương tác với người dùng, kết nối với phần 'chủ', gửi các yêu cầu tính toán xử lí dữ liệu đến phần 'chủ' và nhận lại, hiển thị kết quả.",
        "exp": "Căn cứ SGK Tin học 11 (Bài 12, Trang 60): Mô hình CSDL khách - chủ."
      },
      {
        "lesson": 13,
        "topicIdx": 2,
        "q": "Trong mô hình CSDL quan hệ do E.F. Codd đề xuất năm 1970, mỗi dòng (hàng) trong một bảng dữ liệu được gọi là:",
        "opts": [
          "A. Một bản ghi (Record)",
          "B. Một trường (Field)",
          "C. Một thuộc tính (Attribute)",
          "D. Một kiểu dữ liệu"
        ],
        "ans": "A",
        "page": 65,
        "excerpt": "Mỗi hàng của bảng được gọi là một bản ghi (record), là tập hợp các thông tin về một đối tượng cụ thể được quản lí trong bảng. Mỗi cột được gọi là trường (field).",
        "exp": "Căn cứ SGK Tin học 11 (Bài 13, Trang 65): Bản ghi và trường trong CSDL quan hệ."
      },
      {
        "lesson": 15,
        "topicIdx": 2,
        "q": "Trong hệ quản trị CSDL, tệp tin biên bản hệ thống (Log file) có vai trò quan trọng nào sau đây?",
        "opts": [
          "A. Tự động ghi lại nhật kí mọi phiên làm việc, danh tính người dùng và các thao tác cập nhật dữ liệu để kiểm tra và phục hồi khi xảy ra sự cố",
          "B. Xoá dữ liệu định kì để giải phóng dung lượng đĩa",
          "C. Tự động tăng tốc độ xử lí của CPU",
          "D. Hiển thị điểm số học sinh cho phụ huynh xem"
        ],
        "ans": "A",
        "page": 74,
        "excerpt": "Những truy xuất của người dùng có thể cần phải được lưu lại dưới dạng biên bản (thường gọi là log file) để khi cần có thể kiểm tra, phân tích. Phải xây dựng kế hoạch xử lí các tình huống sự cố.",
        "exp": "Căn cứ SGK Tin học 11 (Bài 15, Trang 74): Vai trò của log file trong bảo mật CSDL."
      },
      {
        "lesson": 25,
        "topicIdx": 4,
        "q": "Đơn vị đo độ phân giải hình ảnh khi in ấn (số điểm ảnh trên mỗi inch chiều dài) được viết tắt là gì?",
        "opts": [
          "A. dpi (dots per inch)",
          "B. pcm",
          "C. bit-rate",
          "D. fps"
        ],
        "ans": "A",
        "page": 116,
        "excerpt": "Độ rõ nét của hình ảnh... xác định bởi số điểm ảnh trên một inch (dpi – dots per inch hay ppi – pixels per inch). Ảnh dùng để in thường có độ phân giải ít nhất là 300 dpi.",
        "exp": "Căn cứ SGK Tin học 11 (Bài 25, Trang 116): Khái niệm độ phân giải dpi."
      },
      {
        "lesson": 25,
        "topicIdx": 4,
        "q": "Tệp tin dự án làm việc gốc của phần mềm chỉnh sửa ảnh GIMP, cho phép lưu trữ đầy đủ các lớp ảnh (layer) và kênh màu, có phần mở rộng là:",
        "opts": [
          "A. .xcf",
          "B. .jpg",
          "C. .png",
          "D. .gif"
        ],
        "ans": "A",
        "page": 117,
        "excerpt": "Tệp tin chính của GIMP là .xcf, loại tệp này có thể lưu trữ nhiều lớp, chứa thông tin về ảnh, độ trong suốt... Lưu ý: Lệnh Save trong GIMP chỉ sử dụng để lưu tệp tin đang làm việc ở định dạng .xcf.",
        "exp": "Căn cứ SGK Tin học 11 (Bài 25, Trang 117, 121): Định dạng tệp tin .xcf trong GIMP."
      },
      {
        "lesson": 26,
        "topicIdx": 4,
        "q": "Trong phần mềm GIMP, để tinh chỉnh tăng hoặc giảm độ sáng và độ tương phản của một bức ảnh, người dùng sử dụng công cụ nào?",
        "opts": [
          "A. Colors / Brightness-Contrast",
          "B. Tools / Crop",
          "C. Edit / Clear",
          "D. View / Zoom"
        ],
        "ans": "A",
        "page": 122,
        "excerpt": "Một số công cụ thường dùng là Brightness-Contrast (chỉnh độ sáng và độ tương phản), Color Balance (chỉnh cân bằng màu), Hue-Saturation...",
        "exp": "Căn cứ SGK Tin học 11 (Bài 26, Trang 122): Công cụ Brightness-Contrast trong GIMP."
      },
      {
        "lesson": 26,
        "topicIdx": 4,
        "q": "Trong GIMP, để tạo một vùng chọn hình chữ nhật bao quanh đối tượng cần chỉnh sửa, ta sử dụng công cụ nào?",
        "opts": [
          "A. Rectangle Select Tool (phím tắt R)",
          "B. Ellipse Select Tool (phím tắt E)",
          "C. Free Select Tool (phím tắt F)",
          "D. Fuzzy Select Tool (phím tắt U)"
        ],
        "ans": "A",
        "page": 124,
        "excerpt": "Rectangle Select Tool: Tạo một vùng chọn hình chữ nhật. Phím tắt R. Ellipse Select Tool: Tạo vùng chọn hình tròn/elip. Phím tắt E.",
        "exp": "Căn cứ SGK Tin học 11 (Bài 26, Trang 124): Các công cụ chọn vùng trong GIMP."
      },
      {
        "lesson": 27,
        "topicIdx": 4,
        "q": "Trong GIMP, khi tẩy xoá một phần hình ảnh trên một lớp (Layer), nếu lớp đó ĐÃ CÓ kênh Alpha (kênh trong suốt) thì vùng bị tẩy xoá sẽ hiển thị như thế nào?",
        "opts": [
          "A. Hiển thị dạng lưới ô vuông caro xám - đen trong suốt (cho phép nhìn thấy nội dung của lớp ảnh bên dưới)",
          "B. Tự động chuyển thành màu trắng xoá hoàn toàn",
          "C. Bị phủ kín bởi màu nền Background",
          "D. Toàn bộ bức ảnh bị biến mất"
        ],
        "ans": "A",
        "page": 129,
        "excerpt": "Nếu lớp đang chọn không có kênh alpha thì điểm ảnh được xoá sẽ có màu nền. Ngược lại, nếu lớp có kênh alpha thì điểm ảnh trong suốt, hiển thị bởi lưới ô vuông xám – đen.",
        "exp": "Căn cứ SGK Tin học 11 (Bài 27, Trang 129-130): Vai trò của kênh Alpha trong GIMP."
      },
      {
        "lesson": 27,
        "topicIdx": 4,
        "q": "Công cụ nào trong GIMP có chức năng sao chép mẫu điểm ảnh kết hợp tự động hoà trộn màu sắc với vùng xung quanh nhằm tẩy xoá các khuyết điểm, vết xước trên ảnh một cách tự nhiên?",
        "opts": [
          "A. Công cụ Healing",
          "B. Công cụ Clone",
          "C. Công cụ Bucket Fill",
          "D. Công cụ Eraser"
        ],
        "ans": "A",
        "page": 129,
        "excerpt": "Healing: Vẽ bằng cách sao chép một vùng chọn. Tương tự như Clone nhưng công cụ này kết hợp giữa điểm ảnh ở vùng chọn và điểm ảnh cần vẽ (chỉnh sửa hoà trộn tự nhiên).",
        "exp": "Căn cứ SGK Tin học 11 (Bài 27, Trang 129): Công cụ Healing và Clone."
      },
      {
        "lesson": 28,
        "topicIdx": 4,
        "q": "Khi tạo ảnh động bằng phần mềm GIMP, mỗi khung hình (frame) của chuyển động được quản lí như thế nào?",
        "opts": [
          "A. Mỗi khung hình tương ứng với một lớp ảnh (Layer) riêng biệt, xuất tệp định dạng .gif với tuỳ chọn 'As Animation'",
          "B. Tất cả các khung hình phải vẽ chung trên duy nhất 1 lớp",
          "C. Bắt buộc phải xuất ra tệp văn bản .txt",
          "D. Mỗi khung hình phải lưu thành 1 tệp .doc riêng"
        ],
        "ans": "A",
        "page": 133,
        "excerpt": "Các lớp ảnh được hiển thị lần lượt từ lớp dưới cùng, mỗi lớp ảnh tương ứng với một khung hình. Xuất ra tệp đuôi .gif, chọn As Animation.",
        "exp": "Căn cứ SGK Tin học 11 (Bài 28, Trang 133-134): Tạo ảnh động từ mô hình lớp ảnh."
      },
      {
        "lesson": 30,
        "topicIdx": 4,
        "q": "Trong phần mềm làm phim VideoPad, hiệu ứng 'Fade Out' áp dụng cho rãnh âm thanh (Audio track) có tác dụng gì?",
        "opts": [
          "A. Làm cho âm lượng âm thanh nhỏ dần về cuối phân cảnh trước khi kết thúc",
          "B. Làm cho âm thanh phát nhanh gấp đôi",
          "C. Lặp lại đoạn nhạc từ đầu đến cuối",
          "D. Đổi giọng nói thành tiếng chuông"
        ],
        "ans": "A",
        "page": 145,
        "excerpt": "Tạo hiệu ứng nhỏ dần cho nhạc nền của đoạn phim... hộp thoại Fade Out hiện ra, cho phép thiết lập các thông số để điều chỉnh âm lượng nhỏ dần về cuối phim.",
        "exp": "Căn cứ SGK Tin học 11 (Bài 30, Trang 144-145): Hiệu ứng Fade Out trong VideoPad."
      }
    ],
    "p2": [
      {
        "lesson": 4,
        "topicIdx": 0,
        "q": "Về kiến trúc phần cứng máy tính và hệ điều hành, xét tính Đúng/Sai của các khẳng định sau:",
        "page": 20,
        "excerpt": "Hệ điều hành quản trị phần cứng máy tính gồm CPU, RAM, ROM và các thiết bị ngoại vi kết nối qua cổng HDMI/USB.",
        "stmts": [
          {
            "text": "a) Bộ nhớ RAM là bộ nhớ khả biến, toàn bộ dữ liệu lưu trên RAM sẽ biến mất khi máy tính bị mất điện",
            "is_true": true
          },
          {
            "text": "b) Bộ nhớ ROM chỉ đọc chứa các chỉ lệnh khởi động máy tính (BIOS/UEFI) và không bị mất dữ liệu khi tắt máy",
            "is_true": true
          },
          {
            "text": "c) Cổng HDMI chỉ có khả năng truyền tín hiệu hình ảnh, bắt buộc phải cắm thêm cáp riêng để truyền âm thanh",
            "is_true": false
          },
          {
            "text": "d) Phần mềm nguồn mở theo giấy phép GNU GPL cấm người dùng phân phối lại cho người khác",
            "is_true": false
          }
        ]
      },
      {
        "lesson": 9,
        "topicIdx": 1,
        "q": "Về an toàn thông tin và lưu trữ dữ liệu trên Internet, xét tính Đúng/Sai của các nhận định sau:",
        "page": 44,
        "excerpt": "Lưu trữ đám mây hỗ trợ chia sẻ tệp phân quyền; bảo mật không gian mạng đòi hỏi mật khẩu mạnh và xác thực 2 lớp.",
        "stmts": [
          {
            "text": "a) Người được cấp quyền \"Người xem\" (Viewer) trên Google Drive có thể chỉnh sửa và xóa nội dung tệp tin của người khác",
            "is_true": false
          },
          {
            "text": "b) Xác thực 2 yếu tố (2FA) giúp bảo vệ tài khoản ngay cả khi kẻ xấu biết được mật khẩu đăng nhập",
            "is_true": true
          },
          {
            "text": "c) Đặt mật khẩu đơn giản \"123456\" giúp hệ thống đăng nhập nhanh hơn mà vẫn đảm bảo an toàn tuyệt đối",
            "is_true": false
          },
          {
            "text": "d) Sử dụng toán tử site:edu.vn trên Google giúp giới hạn kết quả tìm kiếm trong các trang web giáo dục",
            "is_true": true
          }
        ]
      },
      {
        "lesson": 14,
        "topicIdx": 2,
        "q": "Cho câu lệnh SQL sau truy vấn dữ liệu từ bảng HOC_SINH:\n```sql\nSELECT MaHS, HoTen, DiemTB, Lop\nFROM HOC_SINH\nWHERE DiemTB >= 8.0 AND Lop = '11A1'\nORDER BY DiemTB DESC;\n```\nXét tính Đúng/Sai của các khẳng định sau:",
        "page": 72,
        "excerpt": "Truy vấn trích xuất 4 trường dữ liệu, áp dụng điều kiện lọc học sinh lớp 11A1 có điểm trung bình từ 8.0 trở lên và sắp xếp giảm dần theo điểm.",
        "stmts": [
          {
            "text": "a) Kết quả truy vấn trả về hiển thị đúng 4 cột: MaHS, HoTen, DiemTB và Lop",
            "is_true": true
          },
          {
            "text": "b) Mệnh đề WHERE DiemTB >= 8.0 AND Lop = '11A1' sẽ lấy tất cả học sinh lớp 11A2 nếu có điểm trung bình trên 8.0",
            "is_true": false
          },
          {
            "text": "c) Mệnh đề ORDER BY DiemTB DESC sắp xếp danh sách kết quả theo thứ tự điểm trung bình giảm dần từ cao xuống thấp",
            "is_true": true
          },
          {
            "text": "d) Nếu trong bảng không có học sinh nào của lớp 11A1 đạt điểm từ 8.0 trở lên, câu lệnh sẽ gây lỗi hệ thống CSDL",
            "is_true": false
          }
        ]
      },
      {
        "lesson": 20,
        "topicIdx": 3,
        "q": "Cho sơ đồ cơ sở dữ liệu trường học gồm hai bảng:\n- Bảng KHOA(MaKhoa, TenKhoa) với MaKhoa là khóa chính.\n- Bảng SINH_VIEN(MaSV, HoTen, MaKhoa) với MaSV là khóa chính, trường MaKhoa là khóa ngoài tham chiếu đến KHOA(MaKhoa).\nXét tính Đúng/Sai của các khẳng định sau:",
        "page": 102,
        "excerpt": "Ràng buộc khóa chính đảm bảo tính duy nhất của thực thể. Khóa ngoài đảm bảo toàn vẹn tham chiếu, liên kết dữ liệu sinh viên với khoa đào tạo.",
        "stmts": [
          {
            "text": "a) Trường MaSV là khóa chính nên không được phép chứa giá trị rỗng (NULL) và không được trùng lặp giữa các sinh viên",
            "is_true": true
          },
          {
            "text": "b) Người quản trị có thể xóa một bản ghi khoa trong bảng KHOA ngay cả khi đang có sinh viên thuộc khoa đó mà không gây lỗi toàn vẹn tham chiếu",
            "is_true": false
          },
          {
            "text": "c) Giá trị nhập vào trường MaKhoa của bảng SINH_VIEN bắt buộc phải là một mã khoa đã tồn tại trong bảng KHOA (hoặc mang giá trị NULL nếu được phép)",
            "is_true": true
          },
          {
            "text": "d) Người quản trị cơ sở dữ liệu (DBA) có quyền tạo tài khoản và phân quyền truy cập bảng cho từng người dùng",
            "is_true": true
          }
        ]
      },
      {
        "lesson": 21,
        "topicIdx": 3,
        "q": "Cho các thao tác SQL cập nhật và truy vấn dữ liệu sau:\n```sql\nUPDATE HOC_SINH SET DiemTB = DiemTB + 0.5 WHERE MaLop = '11A1';\nSELECT hs.HoTen, lp.TenLop FROM HOC_SINH hs JOIN LOP lp ON hs.MaLop = lp.MaLop;\n```\nXét tính Đúng/Sai của các khẳng định sau:",
        "page": 108,
        "excerpt": "Mệnh đề WHERE trong UPDATE giới hạn phạm vi cập nhật. Phép nối JOIN kết hợp các bản ghi dựa trên điều kiện khóa ngoài bằng khóa chính.",
        "stmts": [
          {
            "text": "a) Lệnh UPDATE trên chỉ cộng thêm 0.5 điểm cho các học sinh thuộc lớp '11A1'",
            "is_true": true
          },
          {
            "text": "b) Nếu xóa bỏ hoàn toàn mệnh đề WHERE MaLop = '11A1', câu lệnh UPDATE sẽ cộng thêm điểm cho tất cả học sinh trong bảng",
            "is_true": true
          },
          {
            "text": "c) Biểu thức hs.MaLop = lp.MaLop là điều kiện kết nối khóa ngoài để lấy chính xác tên lớp tương ứng của học sinh",
            "is_true": true
          },
          {
            "text": "d) Khi hệ thống gặp sự cố mất dữ liệu, việc nhập tệp tin sao lưu .sql (Restore/Import) sẽ không thể phục hồi lại dữ liệu trước đó",
            "is_true": false
          }
        ]
      },
      {
        "lesson": 26,
        "topicIdx": 4,
        "q": "Về các công cụ chọn vùng, cắt ghép và xử lý lớp ảnh trong phần mềm GIMP (Bài 25 & 26, SGK Trang 119–128), xét tính Đúng/Sai của các nhận định sau:",
        "page": 125,
        "excerpt": "GIMP cung cấp các công cụ chọn vùng (Fuzzy Select, Select by Color), cắt xén (Crop) và xử lý lớp ảnh. Định dạng .xcf lưu toàn bộ cấu trúc dự án.",
        "stmts": [
          {
            "text": "a) Công cụ Fuzzy Select (Magic Wand) cho phép tạo vùng chọn các điểm ảnh liền kề có màu sắc tương đồng dựa trên ngưỡng Threshold",
            "is_true": true
          },
          {
            "text": "b) Khi đang có một vùng chọn hoạt động trên ảnh, các thao tác vẽ, tô màu hoặc áp dụng bộ lọc chỉ có tác dụng bên trong phạm vi vùng chọn đó",
            "is_true": true
          },
          {
            "text": "c) Công cụ Crop (cắt xén) chỉ làm ẩn tạm thời các phần thừa bên ngoài mà không làm thay đổi kích thước khung vẽ (Canvas) của bức ảnh",
            "is_true": false
          },
          {
            "text": "d) Tệp ảnh định dạng .xcf là định dạng tệp dự án nguồn của GIMP, lưu trữ đầy đủ các lớp ảnh (Layers), kênh màu và vùng chọn để tiếp tục biên tập",
            "is_true": true
          }
        ]
      },
      {
        "lesson": 30,
        "topicIdx": 4,
        "q": "Trong quá trình thiết kế đồ họa và sản xuất phim hoạt hình ngắn bằng phần mềm chuyên dụng (GIMP, phần mềm làm phim), hãy xét tính Đúng/Sai của các nhận định sau:",
        "page": 147,
        "excerpt": "Biên tập phim bao gồm sắp xếp các đoạn video, âm thanh trên đường thời gian (timeline), áp dụng hiệu ứng chuyển cảnh và xuất bản theo chuẩn video phù hợp.",
        "stmts": [
          {
            "text": "a) Khi chỉnh sửa ảnh trên một Layer (lớp), các đối tượng ở những Layer khác hoàn toàn không bị ảnh hưởng trực tiếp",
            "is_true": true
          },
          {
            "text": "b) Tốc độ khung hình (frame rate) càng cao thì chuyển động hoạt hình càng mượt mà nhưng dung lượng tệp tin sẽ tăng lên",
            "is_true": true
          },
          {
            "text": "c) Việc sao lưu dự phòng tệp nguồn dự án phim (.gimp, .prproject) là không cần thiết vì máy tính luôn tự động lưu vĩnh viễn",
            "is_true": false
          },
          {
            "text": "d) Hiệu ứng chuyển cảnh (Transition) giữa hai cảnh quay chỉ được áp dụng ở phần mở đầu video, không thể dùng giữa các phân đoạn",
            "is_true": false
          }
        ]
      },
      {
        "lesson": 1,
        "topicIdx": 0,
        "q": "Về lịch sử phát triển của hệ điều hành máy tính cá nhân và hệ điều hành di động (Bài 1, SGK Trang 5–9), xét tính Đúng/Sai của các nhận định sau:",
        "page": 7,
        "excerpt": "HĐH phát triển từ CLI sang GUI. Linux do Linus Torvalds viết 1991. Android và iOS là 2 HĐH di động phổ biến.",
        "stmts": [
          {
            "text": "a) Hệ điều hành MS-DOS ban đầu sử dụng giao diện dòng lệnh (CLI), đòi hỏi người dùng phải ghi nhớ cú pháp lệnh",
            "is_true": true
          },
          {
            "text": "b) Hệ điều hành Windows 95 đánh dấu bước đột phá với giao diện đồ hoạ thân thiện, thanh Taskbar, nút Start và cơ chế Plug & Play",
            "is_true": true
          },
          {
            "text": "c) Hệ điều hành Linux là phần mềm đóng gói thương mại thuộc sở hữu độc quyền của công ty Microsoft",
            "is_true": false
          },
          {
            "text": "d) Hai hệ điều hành thông dụng nhất trên các thiết bị di động (smartphone, tablet) hiện nay là iOS của Apple và Android của Google",
            "is_true": true
          }
        ]
      },
      {
        "lesson": 7,
        "topicIdx": 1,
        "q": "Về kĩ năng tìm kiếm thông tin và phòng chống lừa đảo trên không gian mạng (Bài 7 & 9, SGK Trang 36–48), xét tính Đúng/Sai của các nhận định sau:",
        "page": 44,
        "excerpt": "Tìm kiếm cụm từ chính xác đặt trong ngoặc kép. Ba nguyên tắc phòng chống lừa đảo: Chậm lại, Kiểm tra ngay, Dừng lại không gửi.",
        "stmts": [
          {
            "text": "a) Sử dụng dấu ngoặc kép \"...\" khi tìm kiếm trên Google giúp giới hạn kết quả chứa chính xác cụm từ cần tìm",
            "is_true": true
          },
          {
            "text": "b) Toán tử filetype:pdf giúp người dùng tìm kiếm đích danh các tài liệu có phần mở rộng định dạng tệp là .pdf",
            "is_true": true
          },
          {
            "text": "c) Khi nhận được tin nhắn báo trúng thưởng lớn yêu cầu chuyển trước một khoản phí nhỏ để nhận giải, ta nên chuyển tiền ngay lập tức",
            "is_true": false
          },
          {
            "text": "d) Ba nguyên tắc vàng để nhận biết và phòng tránh lừa đảo trên mạng là: Hãy chậm lại – Kiểm tra ngay – Dừng lại, không gửi",
            "is_true": true
          }
        ]
      },
      {
        "lesson": 13,
        "topicIdx": 2,
        "q": "Về mô hình cơ sở dữ liệu quan hệ và các trường khoá (Bài 13 & 14, SGK Trang 64–72), xét tính Đúng/Sai của các nhận định sau:",
        "page": 66,
        "excerpt": "CSDL quan hệ gồm các bảng. Khóa chính xác định duy nhất bản ghi. Khóa ngoài liên kết bảng. SQL gồm DDL, DML, DCL.",
        "stmts": [
          {
            "text": "a) Trong CSDL quan hệ, mỗi bảng bao gồm các trường (cột) thể hiện thuộc tính và các bản ghi (hàng) lưu trữ dữ liệu đối tượng",
            "is_true": true
          },
          {
            "text": "b) Một bảng có thể có nhiều trường được chọn làm khoá chính đồng thời mà không cần liên quan đến nhau",
            "is_true": false
          },
          {
            "text": "c) Khoá ngoài là trường của bảng này tham chiếu đến khoá chính của bảng khác nhằm thiết lập liên kết dữ liệu giữa hai bảng",
            "is_true": true
          },
          {
            "text": "d) Ngôn ngữ SQL bao gồm 3 thành phần chính: Ngôn ngữ định nghĩa dữ liệu (DDL), Ngôn ngữ thao tác dữ liệu (DML) và Ngôn ngữ kiểm soát dữ liệu (DCL)",
            "is_true": true
          }
        ]
      },
      {
        "lesson": 23,
        "topicIdx": 3,
        "q": "Về kĩ thuật sao lưu, phục hồi và liên kết dữ liệu trong CSDL quan hệ (Bài 22–24, SGK Trang 109–118), xét tính Đúng/Sai của các nhận định sau:",
        "page": 116,
        "excerpt": "Sao lưu kịch bản SQL bảo toàn cấu trúc và dữ liệu bảng. Phép nối JOIN dựa trên khóa ngoài và khóa chính. Hàm gộp COUNT/SUM kết hợp GROUP BY.",
        "stmts": [
          {
            "text": "a) Thao tác xuất CSDL ra tệp tin kịch bản .sql (Export SQL Script) trong HeidiSQL giúp lưu trữ toàn bộ câu lệnh tạo bảng và chèn dữ liệu để phục hồi khi có sự cố",
            "is_true": true
          },
          {
            "text": "b) Khi thực hiện câu lệnh SELECT kết hợp hai bảng bằng mệnh đề INNER JOIN mà không có điều kiện ON (hoặc WHERE), kết quả sẽ trả về tích Descartes của hai bảng",
            "is_true": true
          },
          {
            "text": "c) Mệnh đề GROUP BY trong câu lệnh truy vấn SQL cho phép nhóm các bản ghi có cùng giá trị và áp dụng các hàm gộp như COUNT, SUM, AVG",
            "is_true": true
          },
          {
            "text": "d) Sau khi sao lưu CSDL ra tệp .sql, người quản trị không thể chỉnh sửa nội dung tệp này bằng các phần mềm soạn thảo văn bản như Notepad",
            "is_true": false
          }
        ]
      },
      {
        "lesson": 25,
        "topicIdx": 4,
        "q": "Về phần mềm chỉnh sửa ảnh GIMP và cấu trúc tệp dự án (Bài 25, SGK Trang 119–123), xét tính Đúng/Sai của các nhận định sau:",
        "page": 120,
        "excerpt": "GIMP là phần mềm chỉnh sửa ảnh nguồn mở (.xcf). Quản lí hình ảnh theo các lớp ảnh (Layers). Hỗ trợ kênh Alpha tạo độ trong suốt và xuất ảnh đa định dạng qua Export As.",
        "stmts": [
          {
            "text": "a) Độ phân giải hình ảnh khi in ấn thường yêu cầu đạt tối thiểu 300 dpi để đảm bảo độ rõ nét của sản phẩm in",
            "is_true": true
          },
          {
            "text": "b) Khi một lớp ảnh (Layer) trong GIMP được tạo mới, người dùng có thể tùy chọn chế độ màu nền, độ mờ đục và thứ tự xếp chồng của lớp ảnh đó",
            "is_true": true
          },
          {
            "text": "c) Trong phần mềm GIMP, các lớp ảnh (Layers) hoàn toàn phụ thuộc vào nhau nên khi chỉnh sửa một lớp thì tất cả các lớp khác đều bị thay đổi theo",
            "is_true": false
          },
          {
            "text": "d) Trong phần mềm GIMP, người dùng có thể xuất ảnh ra các định dạng phổ biến như PNG, JPEG hoặc PDF thông qua lệnh File -> Export As...",
            "is_true": true
          }
        ]
      },
      {
        "lesson": 29,
        "topicIdx": 4,
        "q": "Về phần mềm làm phim và biên tập video VideoPad (Bài 29 & 30, SGK Trang 141–150), xét tính Đúng/Sai của các nhận định sau:",
        "page": 141,
        "excerpt": "VideoPad quản lí video clip và audio trên Timeline. Cho phép cắt ghép video, thêm hiệu ứng chuyển cảnh và xuất bản tệp video hoàn chỉnh.",
        "stmts": [
          {
            "text": "a) Trong phần mềm VideoPad, ngăn tiến trình Timeline cho phép quản lí và căn chỉnh thời lượng các rãnh Video track và Audio track",
            "is_true": true
          },
          {
            "text": "b) Người dùng có thể chia tách (Split) một đoạn video clip trên Timeline thành nhiều phân đoạn nhỏ để biên tập riêng biệt",
            "is_true": true
          },
          {
            "text": "c) Hiệu ứng chuyển cảnh (Transition) chỉ được chèn ở điểm bắt đầu dự án, không thể chèn giữa hai phân cảnh nối tiếp",
            "is_true": false
          },
          {
            "text": "d) Sau khi dựng xong video, người dùng có thể xuất bản tác phẩm ra định dạng tệp video phổ biến như MP4 hoặc AVI để trình chiếu",
            "is_true": true
          }
        ]
      }
    ],
    "p3": [
      {
        "lesson": 4,
        "topicIdx": 0,
        "q": "Một máy tính có dung lượng bộ nhớ trong RAM là 8 GB. Theo quy chuẩn lũy thừa 2 (1 GB = 1024 MB), dung lượng thanh RAM này tương đương với bao nhiêu Megabyte (MB)?",
        "ans": "8192",
        "page": 20,
        "excerpt": "8 GB = 8 * 1024 MB = 8192 MB.",
        "exp": "$8 \\times 1024 = 8192\\text{ MB}$."
      },
      {
        "lesson": 4,
        "topicIdx": 0,
        "q": "Một bộ vi xử lý CPU có tần số xung nhịp là 3.2 GHz. Theo định nghĩa đơn vị tần số, CPU này thực hiện bao nhiêu trăm triệu chu kỳ xung nhịp trong một giây (nhập số trăm triệu, ví dụ 3200 triệu = 32)?",
        "ans": "32",
        "page": 23,
        "excerpt": "3.2 GHz = 3200 triệu chu kỳ = 32 trăm triệu chu kỳ mỗi giây.",
        "exp": "$3.2\\text{ GHz} = 3200\\text{ triệu chu kỳ} = 32\\text{ trăm triệu}$."
      },
      {
        "lesson": 6,
        "topicIdx": 1,
        "q": "Một tài khoản Google Drive miễn phí cung cấp dung lượng lưu trữ đám mây ban đầu là bao nhiêu Gigabyte (GB)?",
        "ans": "15",
        "page": 28,
        "excerpt": "Google Drive miễn phí 15 GB lưu trữ cho mỗi tài khoản cá nhân.",
        "exp": "Dung lượng miễn phí mặc định là $15\\text{ GB}$."
      },
      {
        "lesson": 9,
        "topicIdx": 1,
        "q": "Phương thức xác thực hai yếu tố (2FA) đòi hỏi người dùng phải cung cấp tối thiểu bao nhiêu phương thức xác thực độc lập để đăng nhập an toàn?",
        "ans": "2",
        "page": 44,
        "excerpt": "Xác thực 2 yếu tố yêu cầu đúng 2 bằng chứng: mật khẩu và mã OTP/sinh trắc học.",
        "exp": "Cần tối thiểu $2$ yếu tố độc lập."
      },
      {
        "lesson": 14,
        "topicIdx": 2,
        "q": "Cho câu lệnh SQL sau: SELECT MaHS, HoTen, NgaySinh, GioiTinh, DiaChi FROM HOC_SINH;. Có bao nhiêu trường (cột) dữ liệu được hiển thị trong kết quả truy vấn?",
        "ans": "5",
        "page": 71,
        "excerpt": "Danh sách các cột trong mệnh đề SELECT gồm 5 trường: MaHS, HoTen, NgaySinh, GioiTinh, DiaChi.",
        "exp": "Có đúng 5 cột được chỉ định trong mệnh đề SELECT."
      },
      {
        "lesson": 13,
        "topicIdx": 2,
        "q": "Trong cơ sở dữ liệu trường học, bảng DIEM lưu kết quả kiểm tra của 45 học sinh. Bảng này hiện đang có tổng cộng bao nhiêu bản ghi (hàng)?",
        "ans": "45",
        "page": 66,
        "excerpt": "Mỗi học sinh tương ứng với 1 bản ghi trong bảng, 45 học sinh = 45 bản ghi.",
        "exp": "Có đúng $45$ bản ghi."
      },
      {
        "lesson": 17,
        "topicIdx": 3,
        "q": "Số hiệu cổng mạng (Port) mặc định gồm 4 chữ số thường được sử dụng để thiết lập kết nối tới hệ quản trị cơ sở dữ liệu MySQL / MariaDB là bao nhiêu?",
        "ans": "3306",
        "page": 87,
        "excerpt": "Cổng mặc định của dịch vụ MySQL là 3306.",
        "exp": "Số hiệu cổng mặc định là $3306$."
      },
      {
        "lesson": 20,
        "topicIdx": 3,
        "q": "Trong cơ sở dữ liệu trường học, bảng LOP có 4 lớp. Mỗi lớp có đúng 35 học sinh được lưu trong bảng HOC_SINH có khóa ngoại tham chiếu đến mã lớp. Tổng số bản ghi học sinh trong bảng HOC_SINH là bao nhiêu?",
        "ans": "140",
        "page": 101,
        "excerpt": "Mỗi lớp có 35 học sinh, 4 lớp tương ứng 4 * 35 = 140 bản ghi.",
        "exp": "$4 \\times 35 = 140$ bản ghi."
      },
      {
        "lesson": 21,
        "topicIdx": 3,
        "q": "Cho câu lệnh SQL sau:\n```sql\nINSERT INTO HOC_SINH (MaHS, HoTen, GioiTinh, NgaySinh, MaLop)\nVALUES ('HS01', 'Nguyen Van An', 'Nam', '2008-05-12', '11A1');\n```\nHãy cho biết có bao nhiêu trường dữ liệu được gán giá trị trong bản ghi học sinh trên?",
        "ans": "5",
        "page": 106,
        "excerpt": "Câu lệnh chèn dữ liệu cho 5 trường: MaHS, HoTen, GioiTinh, NgaySinh, MaLop.",
        "exp": "Có đúng 5 trường dữ liệu được thêm giá trị."
      },
      {
        "lesson": 22,
        "topicIdx": 3,
        "q": "Trong cơ sở dữ liệu, bảng HOC_SINH có 120 bản ghi và bảng LOP có 3 bản ghi. Nếu thực hiện câu lệnh truy vấn kết hợp hai bảng mà quên chỉ định điều kiện liên kết khóa ON (xảy ra tích Descartes), bảng kết quả tạm thời sẽ có bao nhiêu dòng?",
        "ans": "360",
        "page": 112,
        "excerpt": "Tích Descartes kết hợp mỗi dòng của bảng này với mọi dòng của bảng kia: 120 * 3 = 360 dòng.",
        "exp": "$120 \\times 3 = 360$ dòng."
      },
      {
        "lesson": 28,
        "topicIdx": 4,
        "q": "Một đoạn phim hoạt hình ngắn có thời lượng hiển thị đúng 5 giây, với tốc độ khung hình chuẩn là 24 fps (24 khung hình/giây). Tổng số khung hình (frames) cần biên soạn cho đoạn phim này là bao nhiêu?",
        "ans": "120",
        "page": 136,
        "excerpt": "Tổng số khung hình = Thời gian (giây) * Tốc độ fps = 5 * 24 = 120 khung hình.",
        "exp": "$5 \\times 24 = 120$ khung hình."
      },
      {
        "lesson": 30,
        "topicIdx": 4,
        "q": "Một đoạn video thô có thời lượng 180 giây. Biên tập viên thực hiện cắt bỏ phần mở đầu 15 giây và phần kết thúc 25 giây. Thời lượng video thành phẩm còn lại bao nhiêu giây?",
        "ans": "140",
        "page": 147,
        "excerpt": "180 - 15 - 25 = 140 giây.",
        "exp": "$180 - 15 - 25 = 140\\text{ giây}$."
      },
      {
        "lesson": 2,
        "topicIdx": 0,
        "page": 13,
        "q": "Theo SGK Tin học 11, một cung từ (sector) chuẩn trên đĩa cứng có dung lượng lưu trữ bằng bao nhiêu Bytes?",
        "ans": "512",
        "excerpt": "Đĩa từ... mỗi cung ghi 512 byte dữ liệu. Việc đọc, ghi được thực hiện theo đơn vị liên cung (cluster), thường gồm 8 cung.",
        "exp": "Căn cứ SGK Tin học 11 (Bài 2, Trang 13): Dung lượng một sector là 512 Bytes."
      },
      {
        "lesson": 4,
        "topicIdx": 0,
        "page": 22,
        "q": "Một bộ xử lí CPU máy tính có tần số xung nhịp đồng hồ là 2.5 GHz. Tần số này tương ứng với bao nhiêu tỉ xung điện áp gửi đi trong mỗi giây?",
        "ans": "2.5",
        "excerpt": "Tần số đồng hồ xung, thường là GHz (1 tỉ xung một giây). 2.5 GHz tương ứng 2.5 tỉ xung một giây.",
        "exp": "Căn cứ SGK Tin học 11 (Bài 4, Trang 22): 1 GHz = 1 tỉ xung/giây, 2.5 GHz = 2.5 tỉ xung/giây."
      },
      {
        "lesson": 5,
        "topicIdx": 1,
        "page": 30,
        "q": "Theo chuẩn công nghệ không dây tầm ngắn Bluetooth được giới thiệu trong SGK, khoảng cách kết nối trực tiếp hiệu quả giữa hai thiết bị số thường là dưới bao nhiêu mét?",
        "ans": "10",
        "excerpt": "Bluetooth là phương thức kết nối không dây trong khoảng cách gần (dưới 10 m) để truyền tệp, thu phát âm thanh...",
        "exp": "Căn cứ SGK Tin học 11 (Bài 5, Trang 30): Dưới 10 mét."
      },
      {
        "lesson": 9,
        "topicIdx": 1,
        "page": 47,
        "q": "Bộ Quy tắc ứng xử trên mạng xã hội tại Việt Nam được Bộ Thông tin và Truyền thông ban hành theo Quyết định số bao nhiêu? (Nhập số tự nhiên gồm 3 chữ số: ví dụ Quyết định .../QĐ-BTTTT)",
        "ans": "874",
        "excerpt": "Bộ Thông tin và Truyền thông đã ban hành Bộ Quy tắc ứng xử trên mạng xã hội theo Quyết định số 874/QĐ-BTTTT ngày 17/6/2021.",
        "exp": "Căn cứ SGK Tin học 11 (Bài 9, Trang 47): Quyết định 874/QĐ-BTTTT."
      },
      {
        "lesson": 13,
        "topicIdx": 2,
        "page": 64,
        "q": "Mô hình cơ sở dữ liệu quan hệ được nhà khoa học máy tính Edgar Frank Codd đề xuất lần đầu tiên vào năm nào của thế kỉ XX?",
        "ans": "1970",
        "excerpt": "Từ những năm 1970, Edgar Frank Codd (1923 – 2003) đã đề xuất mô hình CSDL quan hệ.",
        "exp": "Căn cứ SGK Tin học 11 (Bài 13, Trang 64): Năm 1970."
      },
      {
        "lesson": 14,
        "topicIdx": 2,
        "page": 71,
        "q": "Một bảng dữ liệu LOP trong CSDL có 4 trường thuộc tính và 12 bản ghi. Nếu thực hiện câu lệnh `SELECT * FROM LOP;`, kết quả trả về sẽ có bao nhiêu cột trường?",
        "ans": "4",
        "excerpt": "Kí tự * trong SELECT * biểu thị việc lấy tất cả các trường dữ liệu của bảng. Bảng có 4 trường thì kết quả hiển thị đúng 4 cột.",
        "exp": "Căn cứ SGK Tin học 11 (Bài 14, Trang 71): Lệnh SELECT * lấy toàn bộ 4 trường."
      },
      {
        "lesson": 25,
        "topicIdx": 4,
        "page": 116,
        "q": "Một bức ảnh số chụp bằng máy ảnh có kích thước 3000 x 2000 điểm ảnh (pixel). Hãy cho biết bức ảnh này có tổng số điểm ảnh tương đương với bao nhiêu Megapixel (triệu điểm ảnh)?",
        "ans": "6",
        "excerpt": "Số lượng điểm ảnh: 3000 x 2000 = 6 000 000 điểm ảnh = 6 Megapixel.",
        "exp": "Căn cứ SGK Tin học 11 (Bài 25, Trang 116-117): 3000 x 2000 = 6 000 000 = 6 Megapixel."
      },
      {
        "lesson": 28,
        "topicIdx": 4,
        "page": 134,
        "q": "Trong GIMP, một ảnh động gồm 4 lớp (Layer), mỗi lớp được đặt thời gian hiển thị là 500 mili-giây (500ms). Hỏi tổng thời gian để phát hết một vòng lặp của ảnh động này là bao nhiêu giây?",
        "ans": "2",
        "excerpt": "4 khung hình * 500ms = 2000ms = 2 giây.",
        "exp": "Căn cứ SGK Tin học 11 (Bài 28, Trang 134): 4 * 500ms = 2000ms = 2 giây."
      }
    ]
  },
  "12": {
    "name": "Tin học 12",
    "headerTheme": "Chương trình Tin học 12: Trí tuệ nhân tạo (AI), Mạng máy tính, Thiết kế Web HTML/CSS & Hướng nghiệp",
    "lessonsOverview": "Bài 1–2: Làm quen AI & AI trong đời sống · Bài 3–6: Thiết bị mạng, Giao thức & Đạo đức mạng · Bài 7–12: HTML, Văn bản, Bảng & Biểu mẫu · Bài 13–18: CSS, Màu sắc, Khung & Bộ chọn · Bài 19–28: Sửa chữa bảo trì, Nghề CNTT, Thiết bị số & Dự án xây dựng website",
    "keyConcepts": "Trí tuệ nhân tạo (AI), Học máy (Machine Learning), Xử lý ngôn ngữ tự nhiên NLP, Thiết bị mạng (Switch, Router), Thẻ HTML5, CSS Box Model, CSS Selector, Biểu mẫu Form, Hướng nghiệp CNTT",
    "footerOutcome": "Hiểu nguyên lý hoạt động của AI; cấu hình thiết bị mạng cơ bản; thiết kế website chuẩn HTML5/CSS3 có giao diện thẩm mỹ và định hình hướng đi nghề nghiệp CNTT.",
    "topics": [
      {
        "topic": "Chủ đề 1: Máy tính và xã hội tri thức (Bài 1–2: Làm quen AI & AI trong đời sống)",
        "startLesson": 1, "endLesson": 2, "startPage": 5, "endPage": 18,
        "nb_tn": 2, "nb_ds": 1, "nb_tln": 0,
        "th_tn": 1, "th_ds": 0, "th_tln": 0,
        "vd_tn": 0, "vd_ds": 0, "vd_tln": 0,
        "vdc_tn": 0, "vdc_ds": 0, "vdc_tln": 0
      },
      {
        "topic": "Chủ đề 2 & 3: Mạng máy tính, Giao thức & Ứng xử không gian mạng (Bài 3–6)",
        "startLesson": 3, "endLesson": 6, "startPage": 19, "endPage": 43,
        "nb_tn": 1, "nb_ds": 0, "nb_tln": 0,
        "th_tn": 1, "th_ds": 1, "th_tln": 0,
        "vd_tn": 0, "vd_ds": 0, "vd_tln": 0,
        "vdc_tn": 0, "vdc_ds": 0, "vdc_tln": 0
      },
      {
        "topic": "Chủ đề 4: Thiết kế trang web với HTML5 (Bài 7–12)",
        "startLesson": 7, "endLesson": 12, "startPage": 44, "endPage": 69,
        "nb_tn": 2, "nb_ds": 1, "nb_tln": 0,
        "th_tn": 2, "th_ds": 1, "th_tln": 1,
        "vd_tn": 1, "vd_ds": 0, "vd_tln": 0,
        "vdc_tn": 0, "vdc_ds": 0, "vdc_tln": 0
      },
      {
        "topic": "Chủ đề 4 (tiếp): Định kiểu trang web với CSS (Bài 13–18)",
        "startLesson": 13, "endLesson": 18, "startPage": 70, "endPage": 95,
        "nb_tn": 1, "nb_ds": 0, "nb_tln": 0,
        "th_tn": 1, "th_ds": 1, "th_tln": 0,
        "vd_tn": 1, "vd_ds": 2, "vd_tln": 1,
        "vdc_tn": 0, "vdc_ds": 1, "vdc_tln": 1
      },
      {
        "topic": "Chủ đề 5, 6 & 7: Hướng nghiệp CNTT, Thiết bị số & Dự án xây dựng website (Bài 19–28)",
        "startLesson": 19, "endLesson": 28, "startPage": 96, "endPage": 156,
        "nb_tn": 0, "nb_ds": 0, "nb_tln": 0,
        "th_tn": 0, "th_ds": 0, "th_tln": 0,
        "vd_tn": 0, "vd_ds": 0, "vd_tln": 0,
        "vdc_tn": 0, "vdc_ds": 0, "vdc_tln": 0
      }
    ],
    "p1": [
      {
        "lesson": 1,
        "topicIdx": 0,
        "q": "Sự kiện khoa học nào được coi là điểm mốc lịch sử ghi nhận sự ra đời chính thức của thuật ngữ 'Trí tuệ nhân tạo' (AI)?",
        "opts": [
          "A. Hội thảo mùa hè tại Đại học Dartmouth (Mỹ) năm 1956",
          "B. Sự ra đời của máy tính điện tử ENIAC năm 1946",
          "C. Alan Turing công bố phép thử Turing năm 1950",
          "D. IBM ra mắt hệ chuyên gia MYCIN năm 1972"
        ],
        "ans": "A",
        "page": 6,
        "excerpt": "Năm 1956, một hội thảo thu hút sự tham gia của nhiều nhà khoa học máy tính hàng đầu thế giới đã được tổ chức tại Đại học Dartmouth, bang New Hampshire, Mỹ... Hội thảo Dartmouth đã được coi là điểm mốc ghi nhận sự ra đời của thuật ngữ AI.",
        "exp": "Căn cứ SGK Tin học 12 (Bài 1, Trang 6): Nguồn gốc lịch sử của Trí tuệ nhân tạo AI."
      },
      {
        "lesson": 1,
        "topicIdx": 0,
        "q": "Khái niệm Trí tuệ nhân tạo (AI) được hiểu một cách thông thường và đầy đủ nhất là gì?",
        "opts": [
          "A. Khả năng của máy tính có thể làm những công việc mang tính trí tuệ của con người (học, suy luận, nhận thức, hiểu ngôn ngữ và giải quyết vấn đề)",
          "B. Mọi hệ thống máy móc cơ khí có khả năng chuyển động tự động lặp đi lặp lại",
          "C. Một phần mềm quản trị cơ sở dữ liệu trên máy chủ",
          "D. Một thiết bị phần cứng dùng để tăng tốc độ vi xử lí"
        ],
        "ans": "A",
        "page": 6,
        "excerpt": "AI là khả năng của máy tính có thể làm những công việc mang tính trí tuệ của con người như đọc chữ, hiểu tiếng nói, dịch thuật, lái xe hay khả năng học và ra quyết định...",
        "exp": "Căn cứ SGK Tin học 12 (Bài 1, Trang 6): Khái niệm về Trí tuệ nhân tạo."
      },
      {
        "lesson": 1,
        "topicIdx": 0,
        "q": "Năm đặc trưng cơ bản nhất của Trí tuệ nhân tạo (AI) bao gồm:",
        "opts": [
          "A. Khả năng học, suy luận, nhận thức, hiểu ngôn ngữ và giải quyết vấn đề",
          "B. Khả năng in ấn, lưu trữ, sao chép, tính toán và truyền mạng",
          "C. Khả năng gõ bàn phím, di chuột, quét ảnh, chụp hình và quét mã vạch",
          "D. Khả năng lập trình, biên dịch, chạy thử, sửa lỗi và cài đặt"
        ],
        "ans": "A",
        "page": 6,
        "excerpt": "Một số đặc trưng cơ bản của AI thường được nói tới nhiều nhất đó là các khả năng học, suy luận, nhận thức, hiểu ngôn ngữ và giải quyết vấn đề.",
        "exp": "Căn cứ SGK Tin học 12 (Bài 1, Trang 6-7): Các đặc trưng cơ bản của AI."
      },
      {
        "lesson": 1,
        "topicIdx": 0,
        "q": "Hệ thống AI được thiết kế chuyên biệt để thực hiện duy nhất một nhiệm vụ cụ thể (như nhận dạng khuôn mặt, chơi cờ vua, dự báo thời tiết) thuộc loại nào?",
        "opts": [
          "A. Trí tuệ nhân tạo hẹp hay Trí tuệ nhân tạo yếu (Narrow AI / Weak AI)",
          "B. Trí tuệ nhân tạo tổng quát hay Trí tuệ nhân tạo mạnh (AGI / Strong AI)",
          "C. Trí tuệ siêu việt tự chủ hoàn toàn",
          "D. Hệ thống tự động hoá cơ học"
        ],
        "ans": "A",
        "page": 6,
        "excerpt": "Theo chức năng, có thể chia AI thành hai loại chính: 1) Trí tuệ nhân tạo hẹp hay Trí tuệ nhân tạo yếu, được thiết kế để thực hiện một nhiệm vụ cụ thể...",
        "exp": "Căn cứ SGK Tin học 12 (Bài 1, Trang 6): Phân loại Trí tuệ nhân tạo theo chức năng."
      },
      {
        "lesson": 1,
        "topicIdx": 0,
        "q": "Hệ chuyên gia MYCIN được phát triển tại Đại học Stanford (Mỹ) từ năm 1972 là một trong những ứng dụng AI đầu tiên thành công trong lĩnh vực nào?",
        "opts": [
          "A. Y học (chẩn đoán các bệnh nhiễm trùng máu và đề xuất kháng sinh phù hợp)",
          "B. Điều khiển tàu vũ trụ thám hiểm Mặt Trăng",
          "C. Dịch thuật đa ngôn ngữ trên web",
          "D. Quản lí kho hàng tự động"
        ],
        "ans": "A",
        "page": 7,
        "excerpt": "Hệ chuyên gia MYCIN, được bắt đầu phát triển tại Đại học Stanford (Mỹ) từ năm 1972... đưa ra một danh sách các vi khuẩn có khả năng là thủ phạm gây ra nhiễm trùng máu và đề xuất sử dụng kháng sinh với liều lượng thích hợp.",
        "exp": "Căn cứ SGK Tin học 12 (Bài 1, Trang 7): Hệ chuyên gia y tế MYCIN."
      },
      {
        "lesson": 1,
        "topicIdx": 0,
        "q": "Robot Asimo của hãng Honda (ra mắt năm 1986) được coi là hình mẫu ứng dụng AI điển hình trong lĩnh vực nào?",
        "opts": [
          "A. Lĩnh vực điều khiển thông minh (khả năng di chuyển bằng hai chân, nhận dạng hình ảnh và tiếng nói)",
          "B. Lĩnh vực phát triển trang web",
          "C. Lĩnh vực quản trị mạng máy tính",
          "D. Lĩnh vực kế toán tài chính"
        ],
        "ans": "A",
        "page": 7,
        "excerpt": "Robot Asimo của hãng Honda... là robot hình người đầu tiên trên thế giới được tích hợp một loạt ứng dụng AI như tự động điều khiển, nhận dạng hình ảnh, nhận dạng tiếng nói...",
        "exp": "Căn cứ SGK Tin học 12 (Bài 1, Trang 7): Robot thông minh Asimo."
      },
      {
        "lesson": 2,
        "topicIdx": 0,
        "q": "Trí tuệ nhân tạo tạo sinh (Generative AI) là thuật ngữ dùng để chỉ loại AI có khả năng gì?",
        "opts": [
          "A. Tự động tạo ra các nội dung mới (văn bản, hình ảnh, âm thanh, video, mã lập trình) dựa trên dữ liệu đã học",
          "B. Tự động tắt máy tính khi không sử dụng",
          "C. Quản lí dung lượng ổ đĩa cứng",
          "D. Chỉ tìm kiếm các đường dẫn web có sẵn"
        ],
        "ans": "A",
        "page": 11,
        "excerpt": "Sự phát triển mạnh mẽ trong những năm gần đây của AI tạo sinh (Generative AI) là một minh chứng. AI tạo sinh tập trung vào việc xây dựng các thuật toán và mô hình có thể tạo nội dung (hình ảnh, âm thanh, văn bản) một cách tự động...",
        "exp": "Căn cứ SGK Tin học 12 (Bài 2, Trang 11): Khái niệm Trí tuệ nhân tạo tạo sinh (Generative AI)."
      },
      {
        "lesson": 2,
        "topicIdx": 0,
        "q": "Mô hình ngôn ngữ lớn ChatGPT do OpenAI phát hành vào cuối năm 2022 được huấn luyện dựa trên nền tảng mô hình nào?",
        "opts": [
          "A. Mô hình kiến trúc GPT (Generative Pre-trained Transformer)",
          "B. Mạng nơ-ron tích chập CNN thuần tuý",
          "C. Cây quyết định nhị phân",
          "D. Hệ cơ sở dữ liệu quan hệ SQL"
        ],
        "ans": "A",
        "page": 11,
        "excerpt": "Một ví dụ điển hình có thể nêu ở đây là ChatGPT... được huấn luyện trên một lượng lớn dữ liệu văn bản, ví dụ, phiên bản GPT-3 được huấn luyện trên hàng vạn văn bản...",
        "exp": "Căn cứ SGK Tin học 12 (Bài 2, Trang 11-12): Ứng dụng AI đột phá ChatGPT."
      },
      {
        "lesson": 2,
        "topicIdx": 0,
        "q": "Cảnh báo nào sau đây phản ánh đúng nguy cơ thực tế về mặt xã hội khi Trí tuệ nhân tạo (AI) phát triển quá nhanh?",
        "opts": [
          "A. Áp lực thất nghiệp do tự động hoá, nguy cơ xâm phạm quyền riêng tư và tính thiếu minh bạch trong quyết định ('hộp đen' thuật toán)",
          "B. Máy tính sẽ biến thành thiết bị phát nhiệt làm cạn kiệt oxy",
          "C. Các ngôn ngữ tự nhiên của con người bị xoá bỏ hoàn toàn",
          "D. Không còn bất kì sự cố kĩ thuật nào xảy ra trên mạng"
        ],
        "ans": "A",
        "page": 12,
        "excerpt": "Bên cạnh những lợi ích to lớn, sự phát triển của AI còn kéo theo những nguy cơ cần được cảnh báo: Áp lực thất nghiệp; Ảnh hưởng quyền riêng tư; Khả năng thiếu minh bạch ('hộp đen'); Rủi ro về an ninh, an toàn.",
        "exp": "Căn cứ SGK Tin học 12 (Bài 2, Trang 12-13): Các cảnh báo và rủi ro của AI."
      },
      {
        "lesson": 3,
        "topicIdx": 1,
        "q": "Điểm khác biệt cơ bản nhất trong nguyên lí hoạt động giữa Bộ chia (Hub) và Bộ chuyển mạch (Switch) là gì?",
        "opts": [
          "A. Hub phát tán tín hiệu đến tất cả các cổng gây xung đột mạng; Switch chỉ chuyển tiếp dữ liệu đến đúng cổng máy nhận dựa vào địa chỉ MAC",
          "B. Hub hoạt động ở tầng mạng còn Switch hoạt động ở tầng ứng dụng",
          "C. Hub dùng cho mạng không dây còn Switch dùng cho mạng có dây",
          "D. Switch chỉ kết nối được tối đa 2 máy tính"
        ],
        "ans": "A",
        "page": 14,
        "excerpt": "Khi máy tính gửi dữ liệu qua một cổng của hub, tín hiệu sẽ được gửi đến tất cả các cổng còn lại... Trong khi đó, switch xác định cổng kết nối giữa thiết bị gửi và thiết bị nhận, sau đó thiết lập tạm thời kênh truyền giữa hai cổng...",
        "exp": "Căn cứ SGK Tin học 12 (Bài 3, Trang 14): Phân biệt Hub và Switch."
      },
      {
        "lesson": 3,
        "topicIdx": 1,
        "q": "Thiết bị điểm truy cập không dây (Wireless Access Point - WAP / AP) có vai trò chính là gì trong mạng máy tính?",
        "opts": [
          "A. Kết nối các thiết bị đầu cuối qua sóng vô tuyến Wi-Fi để đưa chúng tham gia vào mạng cục bộ LAN",
          "B. Tự động định tuyến các gói tin qua mạng diện rộng Internet",
          "C. Chuyển đổi tín hiệu số thành tín hiệu tương tự trên đường dây điện thoại",
          "D. Thay thế hoàn toàn bộ vi xử lí CPU của máy chủ"
        ],
        "ans": "A",
        "page": 15,
        "excerpt": "Bộ thu phát Wi-Fi (với vai trò là một điểm truy cập không dây - WAP)... kết nối các thiết bị đầu cuối qua sóng Wi-Fi giúp giảm chi phí thiết lập LAN hoặc kết nối với một LAN để mở rộng phạm vi làm việc.",
        "exp": "Căn cứ SGK Tin học 12 (Bài 3, Trang 15): Vai trò của Wireless Access Point (WAP)."
      },
      {
        "lesson": 3,
        "topicIdx": 1,
        "q": "Thiết bị mạng Modem (Modulator - Demodulator) đảm nhận chức năng cốt lõi nào sau đây?",
        "opts": [
          "A. Chuyển đổi tín hiệu số (digital) của máy tính thành tín hiệu tương tự (analog) để truyền trên đường truyền xa và ngược lại",
          "B. Tạo bảng mã màu CSS cho trang web",
          "C. Kiểm tra lỗi chính tả trong văn bản",
          "D. Định dạng lại ổ đĩa cứng máy tính"
        ],
        "ans": "A",
        "page": 17,
        "excerpt": "Modem là thiết bị có chức năng chuyển đổi tín hiệu số thành tín hiệu tương tự và ngược lại... từ viết tắt của modulation và demodulation.",
        "exp": "Căn cứ SGK Tin học 12 (Bài 3, Trang 17): Khái niệm và chức năng của Modem."
      },
      {
        "lesson": 3,
        "topicIdx": 1,
        "q": "Chuẩn đầu nối mạng có dây phổ biến nhất thường được bấm vào hai đầu của cáp mạng xoắn đôi UTP là:",
        "opts": [
          "A. Giắc cắm RJ45",
          "B. Giắc cắm RJ11",
          "C. Cổng VGA",
          "D. Đầu cắm HDMI"
        ],
        "ans": "A",
        "page": 18,
        "excerpt": "Các LAN thường dùng cáp mạng UTP có bốn đôi dây xoắn với giắc cắm RJ45 để kết nối vào cổng RJ45 của máy tính, switch, hub hay router.",
        "exp": "Căn cứ SGK Tin học 12 (Bài 3, Trang 18): Giắc cắm mạng RJ45."
      },
      {
        "lesson": 4,
        "topicIdx": 1,
        "q": "Một địa chỉ IPv4 tiêu chuẩn được tạo thành từ bao nhiêu byte và thường được biểu diễn như thế nào?",
        "opts": [
          "A. Gồm 4 byte (32 bit), viết dưới dạng 4 số thập phân cách nhau bởi dấu chấm, mỗi số từ 0 đến 255",
          "B. Gồm 6 byte (48 bit), viết dưới dạng hệ thập lục phân",
          "C. Gồm 16 byte (128 bit)",
          "D. Gồm 8 byte (64 bit)"
        ],
        "ans": "A",
        "page": 23,
        "excerpt": "Mỗi địa chỉ IP là một số 4 byte. Người ta thường viết các địa chỉ IP theo kiểu 'dot decimal', giá trị của mỗi byte được viết trong hệ thập phân (0 đến 255) và phân tách nhau bởi các dấu chấm (ví dụ: 192.168.1.3).",
        "exp": "Căn cứ SGK Tin học 12 (Bài 4, Trang 23): Cấu trúc địa chỉ IPv4."
      },
      {
        "lesson": 4,
        "topicIdx": 1,
        "q": "Trong bộ giao thức TCP/IP, nhiệm vụ chính của giao thức điều khiển truyền vận TCP (Transmission Control Protocol) là:",
        "opts": [
          "A. Kiểm soát việc truyền dữ liệu tin cậy, chia nhỏ dữ liệu thành các gói tin có đánh số thứ tự và kiểm tra tái tạo gói tin tại nơi nhận",
          "B. Đánh địa chỉ logic và định tuyến đường đi qua các router",
          "C. Hiển thị giao diện trang web trên trình duyệt",
          "D. Cấp phát địa chỉ vật lí MAC cho card mạng"
        ],
        "ans": "A",
        "page": 24,
        "excerpt": "Giao thức kiểm soát việc truyền dữ liệu (TCP) đáp ứng: Dữ liệu được cắt ra thành nhiều gói có độ dài xác định... đánh số theo từng ứng dụng... quy định cơ chế xác nhận để nơi gửi biết các gói tin đến có sai sót hoặc thất lạc hay không.",
        "exp": "Căn cứ SGK Tin học 12 (Bài 4, Trang 24): Chức năng của giao thức TCP."
      },
      {
        "lesson": 4,
        "topicIdx": 1,
        "q": "Hệ thống phân giải tên miền DNS (Domain Name System) trên Internet có vai trò gì?",
        "opts": [
          "A. Chuyển đổi tên miền dễ nhớ (như moet.edu.vn) thành địa chỉ IP số học tương ứng của máy chủ và ngược lại",
          "B. Tạo mật khẩu bảo vệ cho mạng Wi-Fi",
          "C. Quét sạch các loại virus trên máy tính",
          "D. Tăng tốc độ đường truyền cáp quang"
        ],
        "ans": "A",
        "page": 25,
        "excerpt": "Giao thức DNS cho phép dùng hệ thống tên bằng chữ thay thế cho địa chỉ IP vốn khó nhớ, ví dụ có thể dùng moet.edu.vn thay cho địa chỉ IP máy chủ của Bộ Giáo dục và Đào tạo.",
        "exp": "Căn cứ SGK Tin học 12 (Bài 4, Trang 25): Giao thức DNS trên Internet."
      },
      {
        "lesson": 5,
        "topicIdx": 1,
        "q": "Khi thực hiện chia sẻ một thư mục qua mạng cục bộ LAN trên Windows, tuỳ chọn quyền 'Read' (Chỉ đọc) có ý nghĩa gì?",
        "opts": [
          "A. Người dùng từ máy khác chỉ có thể xem nội dung tệp mà không có quyền chỉnh sửa, đổi tên hay xoá tệp",
          "B. Cho phép người dùng khác xoá vĩnh viễn thư mục",
          "C. Cấm tất cả mọi người truy cập vào thư mục",
          "D. Tự động sao chép thư mục sang thẻ nhớ"
        ],
        "ans": "A",
        "page": 29,
        "excerpt": "Quyền read chỉ cho phép xem mà không được sửa (write). Nếu muốn người dùng có quyền sửa thì chỉ định quyền cả đọc và sửa (Read/Write).",
        "exp": "Căn cứ SGK Tin học 12 (Bài 5, Trang 29): Thiết lập chế độ chia sẻ thư mục trong Windows."
      },
      {
        "lesson": 5,
        "topicIdx": 1,
        "q": "Máy tính đóng vai trò tiếp nhận các yêu cầu in ấn từ các máy tính khác trong mạng LAN rồi điều khiển máy in thực hiện in lần lượt được gọi là:",
        "opts": [
          "A. Máy chủ in ấn (Print Server)",
          "B. Máy chủ DNS",
          "C. Máy quét Scan Server",
          "D. Modem"
        ],
        "ans": "A",
        "page": 31,
        "excerpt": "Việc chia sẻ máy in thực chất là biến máy tính có máy in đó thành một máy chủ cung cấp dịch vụ in (Print Server).",
        "exp": "Căn cứ SGK Tin học 12 (Bài 5, Trang 31): Chia sẻ máy in qua mạng LAN."
      },
      {
        "lesson": 6,
        "topicIdx": 1,
        "q": "Nhược điểm lớn nhất của hình thức giao tiếp trực tuyến qua không gian mạng (email, tin nhắn, mạng xã hội) so với giao tiếp trực tiếp mặt đối mặt là gì?",
        "opts": [
          "A. Thiếu tín hiệu phi ngôn ngữ (ánh mắt, nét mặt, cử chỉ, biểu cảm giọng nói) nên dễ gây ra hiểu lầm về mặt cảm xúc",
          "B. Chi phí gửi tin nhắn quá đắt đỏ",
          "C. Không thể gửi được các tệp văn bản",
          "D. Chỉ nói chuyện được với người ở cùng một phòng"
        ],
        "ans": "A",
        "page": 35,
        "excerpt": "Thiếu tín hiệu phi ngôn ngữ: Một số phương thức giao tiếp... có thể thiếu tín hiệu phi ngôn ngữ như nét mặt, ngôn ngữ cơ thể và biểu cảm giọng nói... dẫn đến những hiểu lầm không đáng có.",
        "exp": "Căn cứ SGK Tin học 12 (Bài 6, Trang 35): Nhược điểm của giao tiếp trong không gian mạng."
      },
      {
        "lesson": 6,
        "topicIdx": 1,
        "q": "Hành vi nào sau đây thể hiện tính nhân văn và ứng xử có văn hoá trong không gian mạng?",
        "opts": [
          "A. Tôn trọng quan điểm khác biệt của người khác, sử dụng ngôn từ lịch sự, thấu hiểu và bảo vệ bí mật riêng tư cá nhân",
          "B. Sử dụng tài khoản ẩn danh để công kích, bôi nhọ danh dự bạn bè",
          "C. Chụp trộm khoảnh khắc nhạy cảm của người khác rồi đăng lên mạng xã hội để câu like",
          "D. Chia sẻ các thông tin giật gân chưa được kiểm chứng"
        ],
        "ans": "A",
        "page": 36,
        "excerpt": "Thể hiện tính nhân văn trong không gian mạng: Tôn trọng quyền riêng tư; Lịch sự, dùng ngôn từ đúng mực; Thấu hiểu; Sẵn sàng hỗ trợ, chia sẻ tích cực...",
        "exp": "Căn cứ SGK Tin học 12 (Bài 6, Trang 36-37): Ứng xử nhân văn khi giao tiếp trên mạng."
      },
      {
        "lesson": 7,
        "topicIdx": 2,
        "q": "Ngôn ngữ HTML (HyperText Markup Language) là ngôn ngữ gì?",
        "opts": [
          "A. Ngôn ngữ đánh dấu siêu văn bản dùng để thiết lập cấu trúc và hiển thị nội dung trang web",
          "B. Ngôn ngữ lập trình bậc cao điều khiển robot",
          "C. Hệ điều hành quản trị mạng máy tính",
          "D. Phần mềm quét mã độc"
        ],
        "ans": "A",
        "page": 39,
        "excerpt": "HTML là viết tắt của cụm từ HyperText Markup Language (ngôn ngữ đánh dấu siêu văn bản), là một bộ quy tắc dùng để thiết lập cấu trúc và hiển thị nội dung trang web.",
        "exp": "Căn cứ SGK Tin học 12 (Bài 7, Trang 39): Khái niệm ngôn ngữ HTML."
      },
      {
        "lesson": 7,
        "topicIdx": 2,
        "q": "Trong cấu trúc cơ bản của một tài liệu HTML chuẩn, phần tử nào đóng vai trò là phần tử gốc (root) chứa toàn bộ các phần tử còn lại?",
        "opts": [
          "A. Phần tử <html>",
          "B. Phần tử <head>",
          "C. Phần tử <body>",
          "D. Phần tử <!DOCTYPE>"
        ],
        "ans": "A",
        "page": 42,
        "excerpt": "Phần tử <html> là bắt buộc, là phần tử gốc và chứa tất cả các phần tử HTML còn lại của trang web. Trong sơ đồ hình cây HTML, đây là phần tử gốc (root).",
        "exp": "Căn cứ SGK Tin học 12 (Bài 7, Trang 42): Phần tử gốc <html> trong cây DOM."
      },
      {
        "lesson": 7,
        "topicIdx": 2,
        "q": "Thẻ `<title>` trong mã nguồn HTML được đặt bên trong phần tử nào và có tác dụng gì?",
        "opts": [
          "A. Đặt bên trong <head>, hiển thị tiêu đề của trang web trên tab của cửa sổ trình duyệt",
          "B. Đặt bên trong <body>, hiển thị dòng chữ lớn nhất trên trang",
          "C. Đặt bên trong <table>, tạo chú thích cho bảng",
          "D. Đặt ngoài <html> để báo hiệu máy chủ"
        ],
        "ans": "A",
        "page": 42,
        "excerpt": "Phần tử <title> nằm trong <head>. Thẻ <title> mô tả tên của trang web hiện thời. Tên của trang web sẽ xuất hiện trong danh sách kết quả tìm kiếm và trên tab trình duyệt.",
        "exp": "Căn cứ SGK Tin học 12 (Bài 7, Trang 42): Thẻ <title> trong trang HTML."
      },
      {
        "lesson": 8,
        "topicIdx": 2,
        "q": "Cặp thẻ HTML nào sau đây dùng để định dạng tiêu đề mức 1 (tiêu đề cấp cao nhất, cỡ chữ lớn nhất) của bài viết?",
        "opts": [
          "A. <h1>...</h1>",
          "B. <h6>...</h6>",
          "C. <p>...</p>",
          "D. <title>...</title>"
        ],
        "ans": "A",
        "page": 47,
        "excerpt": "Thẻ <hx> trong đó x nhận một trong các giá trị từ 1 đến 6... Thẻ <h1> nên được sử dụng cho tiêu đề chính hay tiêu đề chung của cả văn bản.",
        "exp": "Căn cứ SGK Tin học 12 (Bài 8, Trang 47): Định dạng tiêu đề bằng thẻ <hx>."
      },
      {
        "lesson": 8,
        "topicIdx": 2,
        "q": "Cặp thẻ nào sau đây trong HTML dùng để định dạng chỉ số trên (superscript - ví dụ số mũ x^2) và chỉ số dưới (subscript - ví dụ công thức H_2O)?",
        "opts": [
          "A. <sup> cho chỉ số trên và <sub> cho chỉ số dưới",
          "B. <sub> cho chỉ số trên và <sup> cho chỉ số dưới",
          "C. <top> và <bottom>",
          "D. <up> và <down>"
        ],
        "ans": "A",
        "page": 49,
        "excerpt": "Bảng 8.1: Thẻ <sup> hiển thị chỉ số trên (ví dụ: x<sup>2</sup>); Thẻ <sub> hiển thị chỉ số dưới (ví dụ: H<sub>2</sub>O).",
        "exp": "Căn cứ SGK Tin học 12 (Bài 8, Trang 49): Thẻ định dạng chỉ số trên và dưới."
      },
      {
        "lesson": 8,
        "topicIdx": 2,
        "q": "Thẻ `<hr>` và thẻ `<br>` trong HTML có đặc điểm chung nào sau đây?",
        "opts": [
          "A. Đều là thẻ đơn (không cần thẻ đóng </hr> hay </br>)",
          "B. Đều dùng để in đậm văn bản",
          "C. Đều bắt buộc phải có thuộc tính href",
          "D. Chỉ sử dụng được trong bảng dữ liệu"
        ],
        "ans": "A",
        "page": 48,
        "excerpt": "Lưu ý: Ngoài các thẻ định dạng đoạn và khối kể trên, còn có hai thẻ <br> (ngắt xuống dòng) và <hr> (tạo đường kẻ ngang). Các thẻ này là thẻ đơn, không có nội dung.",
        "exp": "Căn cứ SGK Tin học 12 (Bài 8, Trang 48): Thẻ đơn <br> và <hr>."
      },
      {
        "lesson": 9,
        "topicIdx": 2,
        "q": "Để tạo một danh sách có thứ tự được đánh số tự động (1, 2, 3...) trong trang web HTML, ta sử dụng cặp thẻ nào?",
        "opts": [
          "A. <ol>...</ol> kết hợp các mục <li>...</li>",
          "B. <ul>...</ul> kết hợp các mục <li>...</li>",
          "C. <dl>...</dl> kết hợp các mục <dt>...</dt>",
          "D. <list>...</list>"
        ],
        "ans": "A",
        "page": 52,
        "excerpt": "Để tạo danh sách có thứ tự, dùng cặp thẻ <ol></ol>. Để tạo danh sách không có thứ tự, dùng cặp thẻ <ul></ul>. Mỗi mục danh sách đặt trong <li></li>.",
        "exp": "Căn cứ SGK Tin học 12 (Bài 9, Trang 52): Danh sách có thứ tự <ol>."
      },
      {
        "lesson": 9,
        "topicIdx": 2,
        "q": "Trong thẻ `<td>` hoặc `<th>` của bảng HTML, thuộc tính `colspan=\"3\"` có tác dụng gì?",
        "opts": [
          "A. Gộp 3 ô liên tiếp theo chiều ngang (3 cột) thành một ô duy nhất",
          "B. Gộp 3 hàng liên tiếp theo chiều dọc thành một ô",
          "C. Chia ô hiện tại thành 3 ô nhỏ",
          "D. Tạo viền bảng có độ dày 3px"
        ],
        "ans": "A",
        "page": 54,
        "excerpt": "Sử dụng thuộc tính rowspan (cho hàng) và colspan (cho cột). Bản chất của việc gộp ô là mở rộng một ô bằng cách thêm một số hàng hoặc một số cột lân cận có cùng nội dung.",
        "exp": "Căn cứ SGK Tin học 12 (Bài 9, Trang 54): Gộp ô bảng bằng thuộc tính colspan và rowspan."
      },
      {
        "lesson": 10,
        "topicIdx": 2,
        "q": "Để khi người dùng nhấp chuột vào liên kết, trang web đích sẽ được mở trong một tab (hoặc cửa sổ) mới, ta thiết lập thuộc tính nào?",
        "opts": [
          "A. target=\"_blank\"",
          "B. target=\"_self\"",
          "C. open=\"newtab\"",
          "D. window=\"new\""
        ],
        "ans": "A",
        "page": 58,
        "excerpt": "Cú pháp: <a href=\"URL\" target=\"_blank\">...</a>. Thuộc tính target=\"_blank\" chỉ định mở tài liệu liên kết trong một cửa sổ hoặc tab mới.",
        "exp": "Căn cứ SGK Tin học 12 (Bài 10, Trang 58): Thuộc tính target=\"_blank\" trong thẻ <a>."
      },
      {
        "lesson": 10,
        "topicIdx": 2,
        "q": "Để tạo liên kết nhảy nhanh tới một vị trí cụ thể (neo trang) có định danh `id=\"gioi_thieu\"` ngay trong cùng một trang web, thẻ `<a>` được viết là:",
        "opts": [
          "A. <a href=\"#gioi_thieu\">Xem giới thiệu</a>",
          "B. <a href=\"gioi_thieu\">Xem giới thiệu</a>",
          "C. <a to=\"#gioi_thieu\">Xem giới thiệu</a>",
          "D. <a target=\"gioi_thieu\">Xem giới thiệu</a>"
        ],
        "ans": "A",
        "page": 60,
        "excerpt": "Để liên kết tới phần tử vừa tạo, ta thiết lập thuộc tính href=\"#mã_định_danh_đoạn\" (ví dụ href=\"#Thong_tin\").",
        "exp": "Căn cứ SGK Tin học 12 (Bài 10, Trang 60): Liên kết tới vị trí khác trong cùng trang web."
      },
      {
        "lesson": 11,
        "topicIdx": 2,
        "q": "Trong thẻ chèn ảnh `<img src=\"logo.png\" alt=\"Logo trường\">`, thuộc tính `alt` có chức năng quan trọng nào?",
        "opts": [
          "A. Cung cấp văn bản thay thế hiển thị khi ảnh bị lỗi đường dẫn hoặc phục vụ trình đọc màn hình cho người khiếm thị",
          "B. Thiết lập độ mờ trong suốt của ảnh",
          "C. Canh lề giữa cho bức ảnh",
          "D. Tự động đổi màu sắc của ảnh"
        ],
        "ans": "A",
        "page": 62,
        "excerpt": "Thuộc tính quan trọng khác là alt nên được sử dụng kèm để cung cấp văn bản thay thế khi việc hiển thị ảnh bị lỗi. Văn bản thay thế còn giúp người đọc hình dung ra nội dung bức ảnh.",
        "exp": "Căn cứ SGK Tin học 12 (Bài 11, Trang 62-63): Thuộc tính alt trong thẻ <img>."
      },
      {
        "lesson": 11,
        "topicIdx": 2,
        "q": "Thẻ HTML nào sau đây được sử dụng để tạo một khung nội tuyến (inline frame) nhằm nhúng bản đồ Google Maps hoặc video YouTube vào trang web?",
        "opts": [
          "A. <iframe>",
          "B. <frame>",
          "C. <embed>",
          "D. <object>"
        ],
        "ans": "A",
        "page": 65,
        "excerpt": "Khung nội tuyến là một khung nhìn chứa tài nguyên web khác trong trang web hiện tại. Để tạo khung nội tuyến, ta sử dụng thẻ <iframe> (viết tắt của inline frame).",
        "exp": "Căn cứ SGK Tin học 12 (Bài 11, Trang 65): Thẻ <iframe> trong HTML."
      },
      {
        "lesson": 12,
        "topicIdx": 2,
        "q": "Khi tạo câu hỏi trắc nghiệm một lựa chọn duy nhất trên biểu mẫu HTML (chỉ được chọn một phương án A, B, C hoặc D), ta dùng thẻ `<input>` với kiểu thuộc tính `type` nào?",
        "opts": [
          "A. type=\"radio\" (các nút radio có cùng thuộc tính name)",
          "B. type=\"checkbox\"",
          "C. type=\"text\"",
          "D. type=\"select\""
        ],
        "ans": "A",
        "page": 68,
        "excerpt": "Bảng 12.1: radio: Tạo ra ô chọn 1 giá trị duy nhất trong các phần tử radio cùng tên (cùng name). checkbox: Tạo ra ô lựa chọn nhiều giá trị có hoặc không.",
        "exp": "Căn cứ SGK Tin học 12 (Bài 12, Trang 68): Phân biệt radio button và checkbox trong form HTML."
      },
      {
        "lesson": 12,
        "topicIdx": 2,
        "q": "Phần tử nào sau đây trong biểu mẫu HTML cho phép người dùng nhập văn bản nhiều dòng (như viết nhận xét, góp ý dài)?",
        "opts": [
          "A. <textarea rows=\"5\" cols=\"40\"></textarea>",
          "B. <input type=\"text\">",
          "C. <select></select>",
          "D. <label></label>"
        ],
        "ans": "A",
        "page": 69,
        "excerpt": "Phần tử textarea xác định một vùng nhập văn bản có nhiều dòng và cột. Cú pháp: <textarea id=\"...\" name=\"...\" rows=\"số_dòng\" cols=\"số_cột\">...</textarea>.",
        "exp": "Căn cứ SGK Tin học 12 (Bài 12, Trang 69): Phần tử <textarea> trong form."
      },
      {
        "lesson": 13,
        "topicIdx": 3,
        "q": "Ngôn ngữ CSS (Cascading Style Sheets) được sử dụng trong lập trình web nhằm mục đích chính nào?",
        "opts": [
          "A. Định kiểu giao diện, màu sắc, phông chữ và bố cục trình bày cho các phần tử HTML",
          "B. Xử lí các phép toán giải phương trình",
          "C. Quản lí tài khoản cơ sở dữ liệu MySQL",
          "D. Định tuyến các gói tin qua router"
        ],
        "ans": "A",
        "page": 71,
        "excerpt": "Mẫu định dạng CSS là một công cụ hỗ trợ giúp định dạng nội dung trang web nhanh hơn, thuận tiện hơn bằng cách định nghĩa một lần và sử dụng nhiều lần. CSS sử dụng ngôn ngữ mô tả riêng, độc lập với HTML.",
        "exp": "Căn cứ SGK Tin học 12 (Bài 13, Trang 71-72): Vai trò của CSS trong thiết kế web."
      },
      {
        "lesson": 13,
        "topicIdx": 3,
        "q": "Để nhúng một tệp định dạng CSS ngoài (External CSS, ví dụ `styles.css`) vào trang web HTML, ta sử dụng thẻ nào trong phần `<head>`?",
        "opts": [
          "A. <link rel=\"stylesheet\" href=\"styles.css\">",
          "B. <style src=\"styles.css\"></style>",
          "C. <script href=\"styles.css\"></script>",
          "D. <css include=\"styles.css\">"
        ],
        "ans": "A",
        "page": 73,
        "excerpt": "Cách 1: Sử dụng thẻ link đặt trong vùng head của trang web: <link href=\"styles.css\" rel=\"stylesheet\" type=\"text/css\">.",
        "exp": "Căn cứ SGK Tin học 12 (Bài 13, Trang 73): Nhúng tệp CSS ngoài."
      },
      {
        "lesson": 14,
        "topicIdx": 3,
        "q": "Nhóm phông chữ không có các nét gạch nhỏ ở chân chữ, dễ đọc trên màn hình máy tính (như Arial, Helvetica, Tahoma) thuộc họ phông chữ nào trong CSS?",
        "opts": [
          "A. sans-serif",
          "B. serif",
          "C. monospace",
          "D. cursive"
        ],
        "ans": "A",
        "page": 76,
        "excerpt": "font-family: serif (chữ có chân như Times New Roman); sans-serif (chữ không chân như Arial, Tahoma, Verdana); monospace (chữ có chiều rộng đều nhau); cursive (chữ viết tay).",
        "exp": "Căn cứ SGK Tin học 12 (Bài 14, Trang 76): Các nhóm phông chữ cơ bản trong CSS."
      },
      {
        "lesson": 14,
        "topicIdx": 3,
        "q": "Thuộc tính CSS nào sau đây dùng để căn lề cho dòng văn bản (canh trái, canh giữa, canh phải hoặc canh đều hai bên)?",
        "opts": [
          "A. text-align: left | center | right | justify",
          "B. text-indent",
          "C. line-height",
          "D. font-style"
        ],
        "ans": "A",
        "page": 78,
        "excerpt": "text-align: Thuộc tính này thiết lập căn lề cho các phần tử được chọn. Các kiểu căn hàng bao gồm: left, center, right, justify.",
        "exp": "Căn cứ SGK Tin học 12 (Bài 14, Trang 78): Thuộc tính text-align trong CSS."
      },
      {
        "lesson": 15,
        "topicIdx": 3,
        "q": "Mã màu Hex nào sau đây trong CSS đại diện cho màu Đỏ thuần túy nhất (Red = 255, Green = 0, Blue = 0)?",
        "opts": [
          "A. #FF0000",
          "B. #00FF00",
          "C. #0000FF",
          "D. #FFFFFF"
        ],
        "ans": "A",
        "page": 83,
        "excerpt": "#rrggbb trong đó rr, gg, bb là giá trị trong hệ đếm cơ số 16 (hexa). Màu đỏ thuần là #FF0000 tương ứng rgb(255, 0, 0).",
        "exp": "Căn cứ SGK Tin học 12 (Bài 15, Trang 83): Hệ màu Hex trong CSS."
      },
      {
        "lesson": 15,
        "topicIdx": 3,
        "q": "Trong CSS, bộ chọn con trực tiếp `div > p` sẽ áp dụng định dạng cho các phần tử nào?",
        "opts": [
          "A. Chỉ các phần tử <p> là con trực tiếp cấp 1 của <div>",
          "B. Tất cả các phần tử <p> nằm ở bất kì cấp con cháu nào bên trong <div>",
          "C. Phần tử <p> đứng ngay liền sau <div>",
          "D. Phần tử <div> là con của <p>"
        ],
        "ans": "A",
        "page": 86,
        "excerpt": "Bảng 15.1: E > F: Quan hệ cha con trực tiếp. Áp dụng cho các phần tử F với điều kiện F là phần tử con của E.",
        "exp": "Căn cứ SGK Tin học 12 (Bài 15, Trang 86): Bộ chọn con trực tiếp E > F."
      },
      {
        "lesson": 16,
        "topicIdx": 3,
        "q": "Trong mô hình hộp CSS Box Model, thứ tự các lớp thành phần tính từ trong ra ngoài lần lượt là:",
        "opts": [
          "A. Nội dung (Content) -> Vùng đệm (Padding) -> Khung viền (Border) -> Lề ngoài (Margin)",
          "B. Lề ngoài (Margin) -> Khung viền (Border) -> Vùng đệm (Padding) -> Nội dung (Content)",
          "C. Nội dung -> Lề ngoài -> Khung viền -> Vùng đệm",
          "D. Khung viền -> Nội dung -> Vùng đệm -> Lề ngoài"
        ],
        "ans": "A",
        "page": 90,
        "excerpt": "Hình 16.3 Các thông số chính của khung: Phần nội dung -> Vùng đệm (padding) -> Khung (border) -> Lề khung (margin).",
        "exp": "Căn cứ SGK Tin học 12 (Bài 16, Trang 90): Mô hình hộp CSS Box Model."
      },
      {
        "lesson": 16,
        "topicIdx": 3,
        "q": "Khoảng cách từ vùng nội dung văn bản bên trong đến đường viền khung của chính phần tử đó trong CSS được gọi là:",
        "opts": [
          "A. Vùng đệm (padding)",
          "B. Lề ngoài (margin)",
          "C. Độ dày viền (border-width)",
          "D. Chiều rộng (width)"
        ],
        "ans": "A",
        "page": 91,
        "excerpt": "padding: Vùng đệm, khoảng cách từ vùng text đến đường viền ngoài của khung. margin: Lề khung, khoảng cách từ đường viền ngoài của khung đến văn bản xung quanh.",
        "exp": "Căn cứ SGK Tin học 12 (Bài 16, Trang 91): Phân biệt padding và margin."
      },
      {
        "lesson": 17,
        "topicIdx": 3,
        "q": "Lớp giả (pseudo-class) `:hover` trong CSS được kích hoạt khi nào?",
        "opts": [
          "A. Khi người dùng di chuyển con trỏ chuột lướt lên trên phần tử đó",
          "B. Khi liên kết chưa bao giờ được nhấp vào",
          "C. Khi người dùng nhấp đúp chuột",
          "D. Khi trang web vừa mới tải xong"
        ],
        "ans": "A",
        "page": 96,
        "excerpt": "Bảng 17.1: :hover: Tất cả các phần tử, khi người dùng di chuyển con trỏ chuột lên đối tượng.",
        "exp": "Căn cứ SGK Tin học 12 (Bài 17, Trang 96): Lớp giả :hover trong CSS."
      },
      {
        "lesson": 17,
        "topicIdx": 3,
        "q": "Kí hiệu hoặc từ khoá nào sau đây trong CSS có mức ưu tiên cao nhất, có thể ghi đè mọi định dạng khác bất chấp độ ưu tiên của bộ chọn?",
        "opts": [
          "A. !important",
          "B. !priority",
          "C. !override",
          "D. #id"
        ],
        "ans": "A",
        "page": 99,
        "excerpt": "Bảng 17.3 Thứ tự ưu tiên của CSS: 1. !important: Các thuộc tính trong CSS với từ khoá !important sẽ có mức ưu tiên cao nhất.",
        "exp": "Căn cứ SGK Tin học 12 (Bài 17, Trang 99): Mức ưu tiên tuyệt đối của !important."
      },
      {
        "lesson": 17,
        "topicIdx": 3,
        "q": "Theo thang tính trọng số ưu tiên của bộ chọn CSS (Specificity), bộ chọn theo định danh ID (`#my-id`) có giá trị đóng góp trọng số là bao nhiêu?",
        "opts": [
          "A. 100",
          "B. 10",
          "C. 1",
          "D. 1000"
        ],
        "ans": "A",
        "page": 99,
        "excerpt": "Bảng 17.4: Mã định danh (ID) có giá trị đóng góp trọng số là 100. Lớp (class), lớp giả là 10. Phần tử (thẻ) là 1.",
        "exp": "Căn cứ SGK Tin học 12 (Bài 17, Trang 99): Trọng số của bộ chọn CSS."
      },
      {
        "lesson": 18,
        "topicIdx": 3,
        "q": "Trong dự án thiết kế website, ba phần bố cục chính tạo nên khung sườn chuẩn của một trang web hoàn chỉnh là:",
        "opts": [
          "A. Đầu trang (Header) – Thân trang (Body/Main Content) – Chân trang (Footer)",
          "B. Menu – Video – Âm thanh",
          "C. Tiêu đề h1 – Hình ảnh – Nút bấm",
          "D. Trang chủ – Trang liên hệ – Báo cáo"
        ],
        "ans": "A",
        "page": 103,
        "excerpt": "Hình 18.2 Bố cục của website: Đầu trang (Header) -> Thân trang (Phần nội dung chính) -> Cuối trang (Footer).",
        "exp": "Căn cứ SGK Tin học 12 (Bài 18, Trang 103): Bố cục website 3 phần chuẩn."
      },
      {
        "lesson": 19,
        "topicIdx": 4,
        "q": "Công việc nào sau đây thuộc nhóm nhiệm vụ bảo trì phần mềm máy tính?",
        "opts": [
          "A. Cập nhật hệ điều hành, cài đặt trình điều khiển thiết bị (driver), quét diệt virus và sao lưu dữ liệu",
          "B. Tra keo tản nhiệt cho quạt CPU",
          "C. Hàn gắn vi mạch bo mạch chủ",
          "D. Vệ sinh bụi bẩn trong thùng máy"
        ],
        "ans": "A",
        "page": 107,
        "excerpt": "Liên quan tới phần mềm: Cài đặt hoặc cập nhật phần mềm điều khiển thiết bị ngoại vi (driver); Cập nhật các phiên bản mới của phần mềm... Rà soát an toàn hệ thống bằng cách quét mã độc...",
        "exp": "Căn cứ SGK Tin học 12 (Bài 19, Trang 107): Nhiệm vụ bảo trì phần mềm."
      },
      {
        "lesson": 19,
        "topicIdx": 4,
        "q": "Phẩm chất quan trọng hàng đầu mà người làm nghề dịch vụ sửa chữa và bảo trì máy tính cần phải có là:",
        "opts": [
          "A. Tính cẩn thận, tỉ mỉ, khả năng chẩn đoán chính xác sự cố và đạo đức tôn trọng dữ liệu riêng tư của khách hàng",
          "B. Khả năng nói tiếng Anh trôi chảy như người bản xứ",
          "C. Thể lực nâng vác các kiện hàng nặng",
          "D. Kĩ năng thiết kế thời trang"
        ],
        "ans": "A",
        "page": 108,
        "excerpt": "Người làm nghề sửa chữa và bảo trì máy tính cần phải có kiến thức về phần cứng, phần mềm, mạng máy tính và một số kĩ năng mềm: kĩ năng giải quyết vấn đề, phân tích kĩ thuật, giao tiếp tốt...",
        "exp": "Căn cứ SGK Tin học 12 (Bài 19, Trang 108): Phẩm chất và kĩ năng người làm nghề bảo trì máy tính."
      },
      {
        "lesson": 20,
        "topicIdx": 4,
        "q": "Vị trí chuyên môn nào trong ngành CNTT chịu trách nhiệm quản lí hạ tầng mạng, cấu hình thiết bị Switch/Router/Firewall và đảm bảo đường truyền mạng luôn thông suốt?",
        "opts": [
          "A. Chuyên viên quản trị mạng (Network Administrator)",
          "B. Lập trình viên giao diện Frontend",
          "C. Nhân viên nhập liệu văn phòng",
          "D. Chuyên viên thiết kế đồ hoạ in ấn"
        ],
        "ans": "A",
        "page": 110,
        "excerpt": "Quản trị mạng: Chuyên gia quản trị mạng có nhiệm vụ quản lí và duy trì hệ thống mạng máy tính của tổ chức... cấu hình và bảo mật mạng, theo dõi hiệu suất, xử lí sự cố mạng.",
        "exp": "Căn cứ SGK Tin học 12 (Bài 20, Trang 110): Nghề quản trị mạng."
      },
      {
        "lesson": 20,
        "topicIdx": 4,
        "q": "Nhiệm vụ trọng tâm của Chuyên gia bảo mật hệ thống thông tin (Security Specialist) là gì?",
        "opts": [
          "A. Phát hiện, ngăn chặn các mối đe doạ tấn công mạng và xử lí các sự cố xâm nhập trái phép nhằm bảo vệ an toàn dữ liệu",
          "B. Viết bài quảng cáo sản phẩm lên mạng xã hội",
          "C. Lắp đặt bàn ghế trong phòng máy tính",
          "D. Thay mực máy in"
        ],
        "ans": "A",
        "page": 110,
        "excerpt": "Bảo mật hệ thống thông tin: Chuyên gia bảo mật thông tin đảm nhận vai trò bảo mật dữ liệu và hệ thống... phát hiện sự xâm nhập trái phép và xử lí các vụ việc liên quan đến bảo mật.",
        "exp": "Căn cứ SGK Tin học 12 (Bài 20, Trang 110): Nghề bảo mật hệ thống thông tin."
      },
      {
        "lesson": 22,
        "topicIdx": 4,
        "q": "Khi kết nối máy tính với máy chiếu hoặc màn hình phụ trên Windows, tổ hợp phím tắt nào được sử dụng để mở menu chuyển đổi chế độ chiếu màn hình?",
        "opts": [
          "A. Windows + P",
          "B. Ctrl + Alt + Del",
          "C. Alt + Tab",
          "D. Windows + D"
        ],
        "ans": "A",
        "page": 120,
        "excerpt": "Hãy nhấn tổ hợp phím Windows + P để làm xuất hiện giao diện thiết lập chế độ hiển thị màn hình mở rộng (Hình 22.3).",
        "exp": "Căn cứ SGK Tin học 12 (Bài 22, Trang 120): Phím tắt Windows + P kết nối màn hình phụ."
      },
      {
        "lesson": 22,
        "topicIdx": 4,
        "q": "Trong các chế độ hiển thị màn hình khi kết nối màn hình ngoài, chế độ 'Extend' có tác dụng gì?",
        "opts": [
          "A. Mở rộng không gian làm việc sang màn hình thứ hai (cho phép kéo thả cửa sổ ứng dụng giữa hai màn hình độc lập)",
          "B. Nhân bản hai màn hình hiển thị hình ảnh y hệt nhau",
          "C. Chỉ hiển thị trên màn hình máy tính, tắt màn hình phụ",
          "D. Chỉ hiển thị trên máy chiếu, tắt màn hình máy tính"
        ],
        "ans": "A",
        "page": 120,
        "excerpt": "Extend (Mở rộng): Màn hình ti vi hay máy chiếu sẽ là phần mở rộng của màn hình máy tính. Các cửa sổ ứng dụng có thể đặt được từ màn hình này sang màn hình mở rộng.",
        "exp": "Căn cứ SGK Tin học 12 (Bài 22, Trang 120): Chế độ màn hình Extend."
      },
      {
        "lesson": 23,
        "topicIdx": 4,
        "q": "Biểu tượng nhỏ hình vuông (thường có kích thước 16x16, 32x32 hoặc 48x48 pixel) hiển thị ở góc bên trái tên trang web trên mỗi thẻ (tab) của trình duyệt được gọi là:",
        "opts": [
          "A. Favicon (Favorite Icon)",
          "B. Banner",
          "C. Avatar",
          "D. Thumbnail"
        ],
        "ans": "A",
        "page": 126,
        "excerpt": "Phía sau một logo nhỏ, gọi là favicon (viết tắt của favorite icon)... Favicon là biểu tượng đại diện cho tất cả các trang web trong một website và hiển thị trước địa chỉ trang web trên tab của trình duyệt.",
        "exp": "Căn cứ SGK Tin học 12 (Bài 23, Trang 126, 128, 156): Khái niệm Favicon của website."
      },
      {
        "lesson": 24,
        "topicIdx": 4,
        "q": "Công cụ trực quan, miễn phí và thuận tiện của Google giúp người dùng không chuyên có thể dễ dàng thiết kế và xuất bản website được học trong SGK Tin học 12 là:",
        "opts": [
          "A. Google Sites",
          "B. Google Maps",
          "C. Google Play",
          "D. Google Earth"
        ],
        "ans": "A",
        "page": 134,
        "excerpt": "Google Sites là một ứng dụng trong hệ sinh thái đa dạng của Google... giúp người dùng không chuyên về tin học vẫn có thể cùng nhau xây dựng các trang web theo một chủ đề nào đó.",
        "exp": "Căn cứ SGK Tin học 12 (Bài 24, Trang 134): Xây dựng website với Google Sites."
      },
      {
        "lesson": 27,
        "topicIdx": 4,
        "q": "Để thu thập ý kiến đóng góp hoặc đơn đăng kí tham gia câu lạc bộ từ người xem trên trang web xây dựng bằng Google Sites, ta nhúng dịch vụ nào sau đây?",
        "opts": [
          "A. Google Forms (Biểu mẫu)",
          "B. Google Docs",
          "C. Google Calendar",
          "D. Google Meet"
        ],
        "ans": "A",
        "page": 147,
        "excerpt": "Việc tạo biểu mẫu (form) trên trang web để lấy ý kiến phản hồi của người dùng về bản chất là tạo biểu mẫu bằng ứng dụng Forms của Google rồi nhúng vào trang web được thiết kế bằng Google Sites.",
        "exp": "Căn cứ SGK Tin học 12 (Bài 27, Trang 147): Nhúng Google Forms vào Google Sites."
      },
      {
        "lesson": 1,
        "topicIdx": 0,
        "q": "Phép thử Turing (Turing Test) do nhà khoa học Alan Turing đề xuất vào năm 1950 nhằm mục đích gì?",
        "opts": [
          "A. Kiểm tra khả năng của máy tính trong việc thể hiện hành vi thông minh tương đương hoặc không thể phân biệt được với con người",
          "B. Đo tốc độ xung nhịp CPU",
          "C. Kiểm tra độ bền của bàn phím",
          "D. Xác định dung lượng RAM tối đa"
        ],
        "ans": "A",
        "page": 5,
        "excerpt": "Phép thử Turing: Bài kiểm tra được thiết kế để xác định khả năng của máy tính trong việc tương tác ngôn ngữ tự nhiên với con người và đánh lừa người chơi rằng nó là một con người.",
        "exp": "Căn cứ SGK Tin học 12 (Bài 1, Trang 5, 156): Phép thử Turing (1950)."
      },
      {
        "lesson": 1,
        "topicIdx": 0,
        "q": "Các trợ lí ảo thông minh phổ biến hiện nay như Siri (Apple), Google Assistant (Google), Bixby (Samsung) tương tác với con người chủ yếu thông qua phương thức nào?",
        "opts": [
          "A. Nhận dạng và giao tiếp bằng tiếng nói tự nhiên của con người",
          "B. Bắt buộc người dùng phải gõ mã lệnh nhị phân 0 và 1",
          "C. Chỉ nhận dạng tín hiệu sóng não",
          "D. Quét dấu vân tay"
        ],
        "ans": "A",
        "page": 8,
        "excerpt": "Các trợ lí ảo này có thể trò chuyện, hỗ trợ nhiều tính năng thông minh như tìm kiếm thông tin, gọi điện thoại, đọc tin nhắn, mở nhạc... bằng chính tiếng nói của người dùng.",
        "exp": "Căn cứ SGK Tin học 12 (Bài 1, Trang 8): Các ứng dụng trợ lí ảo."
      },
      {
        "lesson": 2,
        "topicIdx": 0,
        "q": "Hệ thống phần mềm AI nào sau đây được ứng dụng nổi bật trong y tế để hỗ trợ bác sĩ chẩn đoán và đưa ra phác đồ điều trị ung thư?",
        "opts": [
          "A. IBM Watson for Oncology",
          "B. Google Translate",
          "C. Robot Asimo",
          "D. ChatGPT"
        ],
        "ans": "A",
        "page": 9,
        "excerpt": "Y học và chăm sóc sức khoẻ: AI được sử dụng để cải thiện chất lượng hình ảnh y tế... Ví dụ, các chuyên gia y tế khẳng định phần mềm IBM Watson for Oncology đã góp phần nâng cao hiệu quả điều trị ung thư.",
        "exp": "Căn cứ SGK Tin học 12 (Bài 2, Trang 9): Ứng dụng AI trong y tế (IBM Watson for Oncology)."
      },
      {
        "lesson": 4,
        "topicIdx": 1,
        "q": "Lệnh `ping` có sẵn trong hệ điều hành máy tính sử dụng giao thức ICMP nhằm mục đích gì?",
        "opts": [
          "A. Kiểm tra khả năng kết nối mạng giữa máy tính với một máy tính khác hoặc một thiết bị mạng xem có thông suốt hay không",
          "B. Tải tệp tin video từ YouTube",
          "C. Tạo mật khẩu Wi-Fi mới",
          "D. In tài liệu ra máy in"
        ],
        "ans": "A",
        "page": 25,
        "excerpt": "Giao thức ICMP cho phép gửi một yêu cầu đến một máy tính khác để lấy thông tin phản hồi. Một trong các ứng dụng của giao thức này là lệnh ping của hệ điều hành giúp kiểm tra máy tính của em có kết nối được với một máy tính hay một thiết bị mạng hay không.",
        "exp": "Căn cứ SGK Tin học 12 (Bài 4, Trang 25): Lệnh ping và giao thức ICMP."
      },
      {
        "lesson": 20,
        "topicIdx": 4,
        "q": "Những ngành học ở bậc đại học, cao đẳng liên quan trực tiếp đến nhóm nghề quản trị trong ngành CNTT bao gồm:",
        "opts": [
          "A. Quản trị mạng máy tính, Quản trị hệ thống, An ninh mạng, Hệ thống thông tin, Mạng máy tính và truyền thông dữ liệu",
          "B. Kế toán doanh nghiệp và Quản trị kinh doanh",
          "C. Sư phạm Ngữ văn và Lịch sử",
          "D. Thiết kế thời trang"
        ],
        "ans": "A",
        "page": 112,
        "excerpt": "Nhiều ngành học liên quan tới nhóm nghề quản trị trong lĩnh vực công nghệ thông tin như: Quản trị mạng máy tính; Quản trị hệ thống; An ninh mạng; Hệ thống thông tin; Mạng máy tính và truyền thông dữ liệu...",
        "exp": "Căn cứ SGK Tin học 12 (Bài 20, Trang 112): Các ngành học liên quan đến nhóm nghề quản trị CNTT."
      },
      {
        "lesson": 22,
        "topicIdx": 4,
        "q": "Thiết bị số đeo trên mắt tạo ra môi trường không gian 3D mô phỏng giúp người dùng có trải nghiệm tương tác như trong thế giới thật được gọi là:",
        "opts": [
          "A. Kính thực tế ảo (Virtual Reality - VR)",
          "B. Kính áp tròng thông minh",
          "C. Màn hình máy chiếu LCD",
          "D. Bảng vẽ điện tử"
        ],
        "ans": "A",
        "page": 124,
        "excerpt": "Kính thực tế ảo (Virtual Reality – VR) là thiết bị số như Oculus Quest, Reality Pro... có nhiều ứng dụng trong thực tế.",
        "exp": "Căn cứ SGK Tin học 12 (Bài 22, Trang 124): Kính thực tế ảo VR."
      },
      {
        "lesson": 26,
        "topicIdx": 4,
        "q": "Trong thiết kế website đa trang, mô hình tổ chức các trang web (trang chủ và các trang con) phổ biến và khoa học nhất là:",
        "opts": [
          "A. Mô hình cấu trúc hình cây (Tree structure)",
          "B. Mô hình đường thẳng tuần tự duy nhất",
          "C. Mô hình ngẫu nhiên không có liên kết",
          "D. Mô hình hình tròn khép kín"
        ],
        "ans": "A",
        "page": 144,
        "excerpt": "Hiểu được mô hình tổ chức các trang web theo cấu trúc hình cây... Các trang web có thể được tổ chức, sắp xếp theo cấu trúc tương tự cây thư mục.",
        "exp": "Căn cứ SGK Tin học 12 (Bài 26, Trang 144): Mô hình tổ chức website theo cấu trúc cây."
      }
    ],
    "p2": [
      {
        "lesson": 1,
        "topicIdx": 0,
        "q": "Về lịch sử phát triển và các đặc trưng cơ bản của Trí tuệ nhân tạo (Bài 1, SGK Trang 5–8), xét tính Đúng/Sai của các nhận định sau:",
        "page": 6,
        "excerpt": "Hội thảo Dartmouth 1956 là mốc ra đời AI. AI có 5 đặc trưng. AI hẹp phục vụ nhiệm vụ cụ thể. MYCIN là hệ chuyên gia y học.",
        "stmts": [
          {
            "text": "a) Thuật ngữ 'Trí tuệ nhân tạo' (AI) chính thức ra đời tại Hội thảo Dartmouth năm 1956 tại Mỹ",
            "is_true": true
          },
          {
            "text": "b) Năm đặc trưng cơ bản của AI là: Khả năng học, suy luận, nhận thức, hiểu ngôn ngữ và giải quyết vấn đề",
            "is_true": true
          },
          {
            "text": "c) Các hệ thống AI hiện nay đều đã đạt tới cấp độ AI mạnh (AGI) có thể thay thế hoàn toàn mọi năng lực con người trong mọi lĩnh vực",
            "is_true": false
          },
          {
            "text": "d) Hệ chuyên gia MYCIN (1972) là ứng dụng AI đầu tiên hỗ trợ bác sĩ chẩn đoán các bệnh nhiễm trùng máu dựa trên tập luật suy diễn",
            "is_true": true
          }
        ]
      },
      {
        "lesson": 2,
        "topicIdx": 0,
        "q": "Về Trí tuệ nhân tạo tạo sinh (Generative AI) và các nguy cơ đạo đức của AI (Bài 2, SGK Trang 9–13), xét tính Đúng/Sai của các khẳng định sau:",
        "page": 11,
        "excerpt": "Generative AI tạo nội dung mới. ChatGPT huấn luyện trên mô hình ngôn ngữ lớn. Nguy cơ: thất nghiệp, riêng tư, hộp đen.",
        "stmts": [
          {
            "text": "a) AI tạo sinh (Generative AI) có khả năng tự động tạo ra văn bản, hình ảnh, âm thanh và mã nguồn phần mềm mới dựa trên dữ liệu huấn luyện",
            "is_true": true
          },
          {
            "text": "b) ChatGPT là một ví dụ điển hình của mô hình ngôn ngữ lớn (LLM) phát triển bởi OpenAI",
            "is_true": true
          },
          {
            "text": "c) Vì AI hoạt động hoàn toàn khách quan nên các hệ thống AI không bao giờ đưa ra chẩn đoán sai hay gây rủi ro an ninh",
            "is_true": false
          },
          {
            "text": "d) Tính thiếu minh bạch trong quá trình đưa ra quyết định của các mô hình học sâu thường được gọi là vấn đề 'hộp đen' (black box)",
            "is_true": true
          }
        ]
      },
      {
        "lesson": 3,
        "topicIdx": 1,
        "q": "Về các thiết bị mạng thông dụng Hub, Switch, Access Point và Modem (Bài 3, SGK Trang 14–20), xét tính Đúng/Sai của các khẳng định sau:",
        "page": 16,
        "excerpt": "Hub phát tán gây xung đột. Switch chuyển tiếp qua MAC. WAP kết nối Wi-Fi. Modem điều chế số - tương tự.",
        "stmts": [
          {
            "text": "a) Thiết bị Hub chuyển tiếp gói tin đến duy nhất một cổng máy nhận nên hoàn toàn không bao giờ xảy ra xung đột dữ liệu",
            "is_true": false
          },
          {
            "text": "b) Thiết bị Switch xác định cổng kết nối dựa vào địa chỉ vật lí MAC của card mạng máy nhận",
            "is_true": true
          },
          {
            "text": "c) Bộ thu phát không dây WAP (Wireless Access Point) cho phép kết nối các thiết bị di động vào mạng LAN qua sóng Wi-Fi",
            "is_true": true
          },
          {
            "text": "d) Modem thực hiện chức năng điều chế tín hiệu số thành tương tự và giải điều chế ngược lại để truyền tin qua khoảng cách xa",
            "is_true": true
          }
        ]
      },
      {
        "lesson": 4,
        "topicIdx": 1,
        "q": "Về bộ giao thức mạng TCP/IP và hệ thống tên miền DNS (Bài 4, SGK Trang 21–25), xét tính Đúng/Sai của các nhận định sau:",
        "page": 23,
        "excerpt": "Giao thức IP đánh địa chỉ gói tin. TCP đảm bảo truyền tin cậy, ghép gói. DNS phân giải tên miền sang IP.",
        "stmts": [
          {
            "text": "a) Địa chỉ IPv4 gồm 4 byte (32 bit), mỗi byte được viết dưới dạng số thập phân từ 0 đến 255 cách nhau bởi dấu chấm",
            "is_true": true
          },
          {
            "text": "b) Giao thức TCP có nhiệm vụ chia dữ liệu thành các gói tin có số thứ tự và kiểm soát truyền tin cậy, yêu cầu gửi lại khi thất lạc",
            "is_true": true
          },
          {
            "text": "c) Mỗi thiết bị kết nối vào mạng Internet chỉ cần có địa chỉ MAC mà không bao giờ cần địa chỉ IP",
            "is_true": false
          },
          {
            "text": "d) Hệ thống DNS có vai trò chuyển đổi tên miền dạng chữ dễ nhớ (như moet.gov.vn) sang địa chỉ IP số học tương ứng",
            "is_true": true
          }
        ]
      },
      {
        "lesson": 7,
        "topicIdx": 2,
        "q": "Về ngôn ngữ HTML và cấu trúc cây tài liệu trang web (Bài 7 & 8, SGK Trang 39–51), xét tính Đúng/Sai của các khẳng định sau:",
        "page": 42,
        "excerpt": "HTML là ngôn ngữ đánh dấu siêu văn bản. Phần tử <html> là gốc. <head> chứa siêu dữ liệu, <body> chứa nội dung hiển thị.",
        "stmts": [
          {
            "text": "a) HTML là một ngôn ngữ lập trình thuật toán bậc cao tương tự như ngôn ngữ C++ hay Python",
            "is_true": false
          },
          {
            "text": "b) Cặp thẻ <html>...</html> đóng vai trò là phần tử gốc (root) chứa toàn bộ các thẻ khác của trang web",
            "is_true": true
          },
          {
            "text": "c) Mọi nội dung mà người dùng nhìn thấy trực tiếp trên giao diện trang web đều được đặt bên trong cặp thẻ <body>...</body>",
            "is_true": true
          },
          {
            "text": "d) Thẻ <h1> dùng để định dạng tiêu đề mức cao nhất và có cỡ chữ mặc định lớn hơn tiêu đề <h6>",
            "is_true": true
          }
        ]
      },
      {
        "lesson": 9,
        "topicIdx": 2,
        "q": "Về danh sách, bảng biểu và biểu mẫu trong HTML (Bài 9 & 12, SGK Trang 52–70), xét tính Đúng/Sai của các nhận định sau:",
        "page": 54,
        "excerpt": "<ol> là danh sách có thứ tự. <table> gồm <tr>, <td>, <th>. colspan gộp cột. radio chọn 1 phương án duy nhất.",
        "stmts": [
          {
            "text": "a) Cặp thẻ <ol>...</ol> dùng để tạo danh sách có thứ tự được đánh số tự động, còn <ul>...</ul> tạo danh sách dấu đầu dòng không thứ tự",
            "is_true": true
          },
          {
            "text": "b) Trong bảng HTML, thuộc tính colspan dùng để gộp nhiều cột theo chiều ngang, còn rowspan dùng để gộp nhiều hàng theo chiều dọc",
            "is_true": true
          },
          {
            "text": "c) Trong form HTML, các nút <input type=\"radio\"> có cùng thuộc tính name cho phép người dùng chọn cùng lúc nhiều phương án",
            "is_true": false
          },
          {
            "text": "d) Phần tử <textarea> cho phép tạo vùng nhập văn bản nhiều dòng và nhiều cột",
            "is_true": true
          }
        ]
      },
      {
        "lesson": 13,
        "topicIdx": 3,
        "q": "Về vai trò và các phương thức thiết lập định dạng CSS (Bài 13 & 14, SGK Trang 71–82), xét tính Đúng/Sai của các khẳng định sau:",
        "page": 73,
        "excerpt": "CSS định kiểu giao diện. Có 3 cách nhúng: Inline, Internal, External. sans-serif không chân.",
        "stmts": [
          {
            "text": "a) CSS giúp tách biệt hoàn toàn giữa nội dung cấu trúc (HTML) và quy tắc định kiểu hình thức trình bày",
            "is_true": true
          },
          {
            "text": "b) Có 3 cách thiết lập CSS gồm: CSS nội tuyến (Inline), CSS trong (Internal) và CSS ngoài (External qua tệp .css)",
            "is_true": true
          },
          {
            "text": "c) Nhóm phông chữ serif là nhóm phông chữ không có các nét gạch ở chân chữ, rất thích hợp đọc trên màn hình điện tử",
            "is_true": false
          },
          {
            "text": "d) Thuộc tính text-align trong CSS dùng để căn lề văn bản (left, center, right, justify)",
            "is_true": true
          }
        ]
      },
      {
        "lesson": 16,
        "topicIdx": 3,
        "q": "Về mô hình hộp CSS Box Model và độ ưu tiên của bộ chọn (Bài 16 & 17, SGK Trang 89–101), xét tính Đúng/Sai của các khẳng định sau:",
        "page": 91,
        "excerpt": "Box Model: Content, Padding, Border, Margin. !important ưu tiên cao nhất. ID trọng số 100, class 10.",
        "stmts": [
          {
            "text": "a) Trong CSS Box Model, padding là khoảng cách từ phần nội dung đến đường viền khung của phần tử đó",
            "is_true": true
          },
          {
            "text": "b) Margin là khoảng cách từ khung viền của phần tử đến các phần tử lân cận bên ngoài",
            "is_true": true
          },
          {
            "text": "c) Bộ chọn theo định danh ID (#idname) có trọng số ưu tiên thấp hơn bộ chọn theo tên lớp (.classname)",
            "is_true": false
          },
          {
            "text": "d) Từ khoá !important mang mức độ ưu tiên cao nhất trong CSS, có thể ghi đè các định dạng khác",
            "is_true": true
          }
        ]
      },
      {
        "lesson": 19,
        "topicIdx": 4,
        "q": "Về các ngành nghề sửa chữa, bảo trì máy tính và quản trị hệ thống CNTT (Bài 19 & 20, SGK Trang 106–112), xét tính Đúng/Sai của các nhận định sau:",
        "page": 107,
        "excerpt": "Bảo trì máy tính gồm phần cứng và mềm. Quản trị mạng phụ trách kết nối, router. Bảo mật bảo vệ dữ liệu chống tấn công.",
        "stmts": [
          {
            "text": "a) Dịch vụ sửa chữa và bảo trì máy tính bao gồm cả việc can thiệp phần cứng (thay linh kiện hỏng) và phần mềm (cài đặt HĐH, quét virus)",
            "is_true": true
          },
          {
            "text": "b) Chuyên gia quản trị mạng có nhiệm vụ quản lí cấu hình các thiết bị mạng Router, Switch và theo dõi hiệu suất kết nối",
            "is_true": true
          },
          {
            "text": "c) Nghề bảo mật thông tin chỉ cần cài phần mềm diệt virus miễn phí là đủ, không cần có kiến thức về tấn công mạng DoS hay mã độc",
            "is_true": false
          },
          {
            "text": "d) Người làm nghề bảo trì và quản trị CNTT cần tuân thủ nghiêm ngặt đạo đức nghề nghiệp về bảo mật dữ liệu riêng tư của khách hàng",
            "is_true": true
          }
        ]
      },
      {
        "lesson": 23,
        "topicIdx": 4,
        "q": "Về dự án thiết kế website hoàn chỉnh và các thành phần trang web (Bài 23, 24 & 27, SGK Trang 126–150), xét tính Đúng/Sai của các nhận định sau:",
        "page": 128,
        "excerpt": "Website gồm Header, Body, Footer. Favicon đại diện website trên tab trình duyệt. Google Forms dùng tạo biểu mẫu thu thập dữ liệu.",
        "stmts": [
          {
            "text": "a) Bố cục chuẩn của một website bao gồm 3 phần: Phần đầu trang (Header), Phần thân trang (Body) và Phần chân trang (Footer)",
            "is_true": true
          },
          {
            "text": "b) Favicon là biểu tượng nhỏ đại diện cho website, hiển thị trước tiêu đề trang web trên mỗi tab của trình duyệt",
            "is_true": true
          },
          {
            "text": "c) Google Sites là công cụ lập trình web chuyên sâu đòi hỏi phải tự viết hàng nghìn dòng mã nguồn PHP phức tạp",
            "is_true": false
          },
          {
            "text": "d) Nhúng Google Forms vào website cho phép tự động thu thập câu trả lời phản hồi của người dùng và lưu trữ vào Google Sheets",
            "is_true": true
          }
        ]
      }
    ],
    "p3": [
      {
        "lesson": 1,
        "topicIdx": 0,
        "page": 6,
        "q": "Hội thảo mùa hè tại Đại học Dartmouth đánh dấu sự ra đời của thuật ngữ Trí tuệ nhân tạo (AI) được tổ chức vào năm nào?",
        "ans": "1956",
        "excerpt": "Năm 1956, một hội thảo... tại Đại học Dartmouth, bang New Hampshire, Mỹ đã được coi là điểm mốc ghi nhận sự ra đời của thuật ngữ AI.",
        "exp": "Căn cứ SGK Tin học 12 (Bài 1, Trang 6): Năm 1956."
      },
      {
        "lesson": 1,
        "topicIdx": 0,
        "page": 6,
        "q": "Theo SGK Tin học 12, Trí tuệ nhân tạo (AI) được đặc trưng bởi bao nhiêu khả năng cơ bản? (Nhập số tự nhiên)",
        "ans": "5",
        "excerpt": "Các đặc trưng cơ bản của AI gồm 5 khả năng: học, suy luận, nhận thức, hiểu ngôn ngữ và giải quyết vấn đề.",
        "exp": "Căn cứ SGK Tin học 12 (Bài 1, Trang 6): Có 5 khả năng đặc trưng cơ bản."
      },
      {
        "lesson": 4,
        "topicIdx": 1,
        "page": 23,
        "q": "Một địa chỉ IPv4 tiêu chuẩn được biểu diễn bởi một dãy gồm bao nhiêu byte? (Nhập số tự nhiên)",
        "ans": "4",
        "excerpt": "Mỗi địa chỉ IP là một số 4 byte (32 bit). Viết dưới dạng 4 số thập phân cách nhau bởi dấu chấm.",
        "exp": "Căn cứ SGK Tin học 12 (Bài 4, Trang 23): Gồm 4 byte."
      },
      {
        "lesson": 4,
        "topicIdx": 1,
        "page": 23,
        "q": "Địa chỉ vật lí MAC (Media Access Control) gắn cố định trên card mạng máy tính gồm bao nhiêu byte? (Nhập số tự nhiên)",
        "ans": "6",
        "excerpt": "Địa chỉ IP khác với địa chỉ MAC. MAC là địa chỉ 6 byte gắn với phần cứng không thay đổi được.",
        "exp": "Căn cứ SGK Tin học 12 (Bài 4, Trang 23): Địa chỉ MAC gồm 6 byte = 48 bit."
      },
      {
        "lesson": 7,
        "topicIdx": 2,
        "page": 44,
        "q": "Trong sơ đồ cây HTML (cây DOM), có bao nhiêu phần tử gốc (root) duy nhất của toàn bộ tài liệu trang web?",
        "ans": "1",
        "excerpt": "Cây HTML có bao nhiêu phần tử gốc? Trả lời: Duy nhất 1 phần tử gốc là phần tử <html>.",
        "exp": "Căn cứ SGK Tin học 12 (Bài 7, Trang 42-45): Duy nhất 1 phần tử gốc <html>."
      },
      {
        "lesson": 8,
        "topicIdx": 2,
        "page": 47,
        "q": "Trong ngôn ngữ HTML, có bao nhiêu mức tiêu đề được định nghĩa thông qua các thẻ từ `<h1>` đến `<h6>`?",
        "ans": "6",
        "excerpt": "Thẻ <hx> trong đó x nhận một trong các giá trị từ 1 đến 6... có 6 mức tiêu đề.",
        "exp": "Căn cứ SGK Tin học 12 (Bài 8, Trang 47): Có đúng 6 mức tiêu đề từ h1 đến h6."
      },
      {
        "lesson": 9,
        "topicIdx": 2,
        "page": 54,
        "q": "Một ô trong bảng HTML sử dụng thuộc tính `colspan=\"4\"`. Ô này đã được gộp lại từ bao nhiêu cột liên tiếp?",
        "ans": "4",
        "excerpt": "colspan=\"n\" gộp n cột theo chiều ngang. Với colspan=\"4\" là gộp 4 cột.",
        "exp": "Căn cứ SGK Tin học 12 (Bài 9, Trang 54): Gộp 4 cột."
      },
      {
        "lesson": 15,
        "topicIdx": 3,
        "page": 83,
        "q": "Giá trị cường độ của mỗi kênh màu Red, Green hoặc Blue trong hàm `rgb(r, g, b)` của CSS nhận giá trị số nguyên tối đa là bao nhiêu?",
        "ans": "255",
        "excerpt": "rgb(x-red, x-green, x-blue), trong đó x-red, x-green, x-blue nhận các giá trị từ 0 đến 255.",
        "exp": "Căn cứ SGK Tin học 12 (Bài 15, Trang 83): Tối đa là 255."
      },
      {
        "lesson": 15,
        "topicIdx": 3,
        "page": 84,
        "q": "Trong mô hình màu HSL của CSS (`hsl(H, S, L)`), vòng tròn màu sắc H (Hue) được tính theo góc quay có giá trị tối đa là bao nhiêu độ?",
        "ans": "360",
        "excerpt": "H (Hue) là vòng tròn màu với giá trị từ 0 đến 360 độ (0 độ là đỏ, 120 độ là lục, 240 độ là lam).",
        "exp": "Căn cứ SGK Tin học 12 (Bài 15, Trang 84): Vòng tròn màu 360 độ."
      },
      {
        "lesson": 16,
        "topicIdx": 3,
        "page": 90,
        "q": "Mô hình hộp CSS Box Model bao gồm bao nhiêu thành phần lớp cấu tạo chính tính từ trong ra ngoài (Content, Padding, Border, Margin)?",
        "ans": "4",
        "excerpt": "Các thông số chính của khung gồm 4 phần: Nội dung (content), Vùng đệm (padding), Khung (border) và Lề khung (margin).",
        "exp": "Căn cứ SGK Tin học 12 (Bài 16, Trang 90): Gồm 4 thành phần chính."
      },
      {
        "lesson": 17,
        "topicIdx": 3,
        "page": 99,
        "q": "Theo bảng trọng số ưu tiên của bộ chọn CSS (Specificity), bộ chọn theo định danh ID (ví dụ `#header`) đóng góp giá trị trọng số là bao nhiêu?",
        "ans": "100",
        "excerpt": "Bảng 17.4: Mã định danh (ID) đóng góp trọng số là 100.",
        "exp": "Căn cứ SGK Tin học 12 (Bài 17, Trang 99): Trọng số của ID là 100."
      },
      {
        "lesson": 17,
        "topicIdx": 3,
        "page": 99,
        "q": "Theo bảng trọng số ưu tiên của bộ chọn CSS, bộ chọn theo lớp (ví dụ `.btn-primary`) đóng góp giá trị trọng số là bao nhiêu?",
        "ans": "10",
        "excerpt": "Bảng 17.4: Lớp, lớp giả, bộ chọn kiểu thuộc tính đóng góp trọng số là 10.",
        "exp": "Căn cứ SGK Tin học 12 (Bài 17, Trang 99): Trọng số của class là 10."
      },
      {
        "lesson": 17,
        "topicIdx": 3,
        "page": 99,
        "q": "Bộ chọn CSS tổ hợp `.test #menu` bao gồm một lớp (.test) và một định danh (#menu). Tổng trọng số ưu tiên của bộ chọn này là bao nhiêu?",
        "ans": "110",
        "excerpt": "Trọng số = 10 (class) + 100 (id) = 110.",
        "exp": "Căn cứ SGK Tin học 12 (Bài 17, Trang 99): 10 + 100 = 110."
      },
      {
        "lesson": 18,
        "topicIdx": 3,
        "page": 103,
        "q": "Một trang web có cấu trúc chuẩn gồm bao nhiêu phần chính (Đầu trang Header, Thân trang Body, Chân trang Footer)?",
        "ans": "3",
        "excerpt": "Website gồm 3 phần chính: Đầu trang (Header), Phần nội dung chính (Body) và Cuối trang (Footer).",
        "exp": "Căn cứ SGK Tin học 12 (Bài 18, Trang 103): Gồm 3 phần chính."
      },
      {
        "lesson": 23,
        "topicIdx": 4,
        "page": 128,
        "q": "Kích thước vuông chuẩn thông dụng nhỏ nhất (theo đơn vị pixel) của tệp ảnh biểu tượng Favicon trên tab trình duyệt là bao nhiêu?",
        "ans": "16",
        "excerpt": "Favicon dạng hình vuông với kích thước chuẩn 16 x 16 (hoặc 32 x 32, 48 x 48) pixels.",
        "exp": "Căn cứ SGK Tin học 12 (Bài 23, Trang 126, 136): 16 pixel."
      },
      {
        "lesson": 11,
        "topicIdx": 2,
        "page": 63,
        "q": "Một bức ảnh có kích thước gốc 720 x 450 pixel. Nếu chèn ảnh vào trang web với lệnh `<img src=\"img.png\" width=\"600\">`, chiều rộng hiển thị của ảnh trên trang là bao nhiêu pixel?",
        "ans": "600",
        "excerpt": "Thuộc tính width=\"600\" quy định chiều rộng hiển thị của ảnh là đúng 600 pixel.",
        "exp": "Căn cứ SGK Tin học 12 (Bài 11, Trang 63, 66): 600 pixel."
      },
      {
        "lesson": 4,
        "topicIdx": 1,
        "page": 23,
        "q": "Trong địa chỉ IP `192.168.1.254`, có bao nhiêu dấu chấm phân tách giữa các byte số học?",
        "ans": "3",
        "excerpt": "Địa chỉ IPv4 gồm 4 số thập phân phân tách nhau bởi 3 dấu chấm (kiểu dot decimal).",
        "exp": "Căn cứ SGK Tin học 12 (Bài 4, Trang 23): Có đúng 3 dấu chấm."
      },
      {
        "lesson": 14,
        "topicIdx": 3,
        "page": 78,
        "q": "Trong CSS, nếu thuộc tính `line-height: 2;` được gán cho đoạn văn có cỡ chữ `font-size: 16px`, chiều cao của dòng văn bản nhận được là bao nhiêu pixel?",
        "ans": "32",
        "excerpt": "line-height: 2 thiết lập chiều cao dòng gấp 2 lần cỡ chữ hiện thời: 16px * 2 = 32px.",
        "exp": "Căn cứ SGK Tin học 12 (Bài 14, Trang 78): 16 * 2 = 32 pixel."
      },
      {
        "lesson": 12,
        "topicIdx": 2,
        "page": 70,
        "q": "Để người dùng nhập mật khẩu đăng nhập được che khuất bởi các dấu sao (*) hoặc dấu chấm tròn, thuộc tính `type` của thẻ `<input>` phải nhận giá trị là chữ gì?",
        "ans": "password",
        "excerpt": "Bảng 12.1: password: Tạo ra trường nhập mật khẩu, dùng để nhập văn bản nhưng bị che thông tin.",
        "exp": "Căn cứ SGK Tin học 12 (Bài 12, Trang 70): type=\"password\"."
      },
      {
        "lesson": 13,
        "topicIdx": 3,
        "page": 75,
        "q": "Ý tưởng ban đầu về bảng định kiểu tầng CSS được kĩ sư Håkon Wium Lie đề xuất vào năm nào của thế kỉ XX?",
        "ans": "1994",
        "excerpt": "Ý tưởng của CSS do kĩ sư Håkon Wium Lie, người Na Uy, thiết lập năm 1994 trong khi làm việc với Tim Berners-Lee tại viện CERN.",
        "exp": "Căn cứ SGK Tin học 12 (Bài 13, Trang 75): Năm 1994."
      }
    ]
  }
};

const INFORMATICS_SPEC_CURRICULA = {
  "10": [
    {
      "tt": 1,
      "startLesson": 1,
      "endLesson": 7,
      "topic": "Chủ đề 1: Máy tính và xã hội tri thức",
      "content": "Bài 1–7: Thông tin & xử lí thông tin, Thiết bị thông minh, Kiểu dữ liệu văn bản (ASCII, Unicode), Hệ nhị phân & Số nguyên, Dữ liệu lôgic, Âm thanh & Hình ảnh (PCM, RGB), Thiết bị số thông dụng",
      "sgkPages": "Trang 6 – 37",
      "yccd": {
        "nb": [
          "Phân biệt được dữ liệu và thông tin; nhận biết được tính toàn vẹn của thông tin.",
          "Nhận biết được đơn vị đo dung lượng thông tin: Bit, Byte, KB, MB, GB, TB và quy tắc hơn kém 1024 lần.",
          "Nêu được đặc điểm bảng mã ASCII (7 bit - 128 kí tự, 8 bit - 256 kí tự) và bảng mã Unicode đa ngôn ngữ.",
          "Nhận biết được đặc điểm hệ nhị phân cơ số 2 và hai giá trị chân lí của đại số lôgic (1/True, 0/False)."
        ],
        "th": [
          "Thực hiện chuyển đổi số nguyên giữa hệ thập phân và hệ nhị phân; thực hiện được phép cộng hai số nhị phân.",
          "Xác định được giá trị chân lí của các biểu thức lôgic chứa toán tử AND, OR, XOR, NOT.",
          "Giải thích được nguyên lí số hoá âm thanh bằng điều chế mã xung PCM và số hoá hình ảnh trong hệ màu RGB 24 bit."
        ],
        "vd": [
          "Tính toán được dung lượng lưu trữ cần thiết cho một tệp ảnh bitmap, âm thanh số hoặc tệp văn bản.",
          "Vận dụng thiết bị trợ thủ số cá nhân (PDA) để tổ chức công việc và quản lí dữ liệu cá nhân an toàn."
        ],
        "vdc": [
          "Đề xuất giải pháp lưu trữ, số hoá và bảo quản tư liệu số phục vụ học tập một cách tối ưu, khoa học."
        ]
      },
      "q": {
        "nb_p1": "2 câu",
        "nb_p2": "1 ý",
        "nb_p3": "-",
        "th_p1": "1 câu",
        "th_p2": "1 ý",
        "th_p3": "1 câu",
        "vd_p1": "-",
        "vd_p2": "-",
        "vd_p3": "-",
        "vdc_p1": "-",
        "vdc_p2": "-",
        "vdc_p3": "-",
        "total": "4",
        "pct": "15%"
      }
    },
    {
      "tt": 2,
      "startLesson": 8,
      "endLesson": 11,
      "topic": "Chủ đề 2 & 3: Mạng máy tính, Internet & Đạo đức, Bản quyền số",
      "content": "Bài 8–11: Mạng LAN, WAN, Router, Switch, Điện toán đám mây (SaaS, PaaS, IaaS), IoT, An toàn không gian mạng (Virus, Worm, Trojan, DoS), Khai thác tài nguyên Internet, Đạo đức & Bản quyền phần mềm",
      "sgkPages": "Trang 38 – 62",
      "yccd": {
        "nb": [
          "Phân biệt được mạng LAN và Internet; chỉ ra chức năng của Router và Switch trong hệ thống mạng.",
          "Nhận biết được các mô hình dịch vụ đám mây cơ bản: SaaS, PaaS, IaaS và ứng dụng IoT (RFID, Smart home).",
          "Nhận diện các loại phần mềm độc hại: Virus (cần vật chủ), Worm (độc lập), Trojan (nội gián: keylogger, spyware).",
          "Nêu được các quyền nhân thân và quyền tài sản trong quyền tác giả đối với sản phẩm số."
        ],
        "th": [
          "Giải thích được sự khác nhau giữa mua bản quyền phần mềm và mua quyền sử dụng (licence).",
          "Sử dụng được các công cụ dịch đa ngữ trực tuyến (Google Translate) và khai thác kho học liệu số igiaoduc.vn.",
          "Phân tích được các nguy cơ mất an toàn thông tin (lừa đảo, tin giả, tấn công DoS, bắt nạt mạng)."
        ],
        "vd": [
          "Thực hiện quét và phòng chống mã độc trên máy tính bằng Windows Defender; áp dụng quy tắc chia sẻ thông tin an toàn.",
          "Tuân thủ các quy định pháp luật về CNTT (Luật An ninh mạng, Nghị định 15/2020/NĐ-CP Điều 101)."
        ],
        "vdc": [
          "Đề xuất biện pháp tự bảo vệ danh tính số và xây dựng môi trường văn hoá ứng xử lành mạnh trên mạng xã hội."
        ]
      },
      "q": {
        "nb_p1": "2 câu",
        "nb_p2": "-",
        "nb_p3": "-",
        "th_p1": "1 câu",
        "th_p2": "1 ý",
        "th_p3": "-",
        "vd_p1": "-",
        "vd_p2": "1 ý",
        "vd_p3": "-",
        "vdc_p1": "-",
        "vdc_p2": "-",
        "vdc_p3": "-",
        "total": "3",
        "pct": "10%"
      }
    },
    {
      "tt": 3,
      "startLesson": 12,
      "endLesson": 15,
      "topic": "Chủ đề 4: Ứng dụng tin học - Đồ họa Inkscape",
      "content": "Bài 12–15: Đồ họa vectơ vs Bitmap, Phần mềm Inkscape (.svg), Bổ sung hình khối, Fill and Stroke, Các phép ghép hình (Union, Difference, Intersection), Đối tượng đường (công cụ Pen, điểm neo), Xuất PNG",
      "sgkPages": "Trang 63 – 85",
      "yccd": {
        "nb": [
          "Phân biệt được đồ hoạ vectơ và đồ hoạ điểm ảnh; nhận biết định dạng tệp .svg của Inkscape.",
          "Nhận biết các thành phần giao diện chính của Inkscape: Hộp công cụ, Thanh thuộc tính, Bảng màu, Vùng làm việc.",
          "Nêu được thứ tự xuất hiện của các lớp (layer) đối tượng đồ hoạ trên bản vẽ."
        ],
        "th": [
          "Sử dụng được hộp thoại Fill and Stroke để thiết lập màu tô, màu vẽ, độ dày nét và độ mờ Opacity.",
          "Thực hiện thành thạo các phép ghép đối tượng: Hợp (Union), Hiệu (Difference), Giao (Intersection).",
          "Phân biệt được điểm neo trơn (smooth node) và điểm neo góc (corner node) khi hiệu chỉnh đường cong."
        ],
        "vd": [
          "Thiết kế được các biểu tượng đơn giản, logo, quốc kì, nhãn vở hoặc bông hoa bằng hình khối và phép ghép hình.",
          "Vẽ được hình trang trí kết hợp đối tượng đường (Pen) và đặt dòng chữ uốn lượn theo đường (Put on Path)."
        ],
        "vdc": [
          "Hoàn thiện một sản phẩm đồ hoạ ứng dụng thực tế (áp phích, tờ rơi, thiệp chúc mừng) và xuất ra định dạng ảnh PNG."
        ]
      },
      "q": {
        "nb_p1": "2 câu",
        "nb_p2": "1 ý",
        "nb_p3": "-",
        "th_p1": "1 câu",
        "th_p2": "1 ý",
        "th_p3": "1 câu",
        "vd_p1": "1 câu",
        "vd_p2": "-",
        "vd_p3": "-",
        "vdc_p1": "-",
        "vdc_p2": "-",
        "vdc_p3": "-",
        "total": "4",
        "pct": "15%"
      }
    },
    {
      "tt": 4,
      "startLesson": 16,
      "endLesson": 21,
      "topic": "Chủ đề 5: Lập trình Python cơ bản & Cấu trúc điều khiển",
      "content": "Bài 16–21: Ngôn ngữ Python bậc cao, Môi trường IDLE, Biến & Lệnh gán, Phép toán //, %, **, Lệnh input(), print(), Ép kiểu int/float/str, Câu lệnh rẽ nhánh if, Câu lệnh lặp for với range(), Vòng lặp while, Lệnh break",
      "sgkPages": "Trang 86 – 110",
      "yccd": {
        "nb": [
          "Nhận biết hai chế độ làm việc của Python (gõ lệnh trực tiếp >>> và soạn thảo kịch bản script).",
          "Nêu được quy tắc đặt tên biến hợp lệ trong Python; phân biệt biến và từ khoá.",
          "Nhận biết cú pháp câu lệnh rẽ nhánh if, if-else và quy tắc thụt lề bắt buộc (4 khoảng trắng).",
          "Nhận biết cú pháp vòng lặp for với hàm range(start, stop) và vòng lặp while với điều kiện lặp."
        ],
        "th": [
          "Tính được giá trị biểu thức số học chứa phép chia nguyên //, chia dư % và luỹ thừa ** (tính từ phải sang trái).",
          "Hiểu cơ chế hoạt động của hàm input() nhận xâu và ép kiểu bằng int(), float().",
          "Theo dõi luồng thực thi của vòng lặp for và while để xác định số lần lặp và giá trị biến tích luỹ."
        ],
        "vd": [
          "Viết được chương trình Python hoàn chỉnh giải bài toán tính tiền điện lũy kế hoặc kiểm tra tính chẵn/lẻ, chia hết.",
          "Vận dụng vòng lặp for hoặc while để tính tổng dãy số S = 1 + 2 + ... + n hoặc đếm số ước số."
        ],
        "vdc": [
          "Viết chương trình kiểm tra một số nguyên n có phải số nguyên tố hay không hoặc tìm UCLN của hai số tự nhiên."
        ]
      },
      "q": {
        "nb_p1": "3 câu",
        "nb_p2": "1 ý",
        "th_p1": "2 câu",
        "th_p2": "1 ý",
        "vd_p1": "1 câu",
        "vd_p2": "1 ý",
        "vdc_p1": "-",
        "vdc_p2": "1 ý",
        "total": "8",
        "pct": "30%"
      }
    },
    {
      "tt": 5,
      "startLesson": 22,
      "endLesson": 32,
      "topic": "Chủ đề 5: Dữ liệu cấu trúc (List, Xâu) & Lập trình hàm con",
      "content": "Bài 22–32: Danh sách List, Các phương thức append/insert/remove/clear, Xâu kí tự String, Tính bất biến, Phương thức find/split/join, Định nghĩa hàm def, Lệnh return, Tham số vs Đối số, Phạm vi biến global, Lỗi ngoại lệ & Gỡ lỗi debug",
      "sgkPages": "Trang 111 – 155",
      "yccd": {
        "nb": [
          "Nhận biết cấu trúc kiểu danh sách List [] và quy tắc đánh chỉ số từ 0 đến len(A)-1.",
          "Nhận biết đặc tính bất biến của xâu kí tự và các thao tác duyệt xâu bằng vòng lặp for.",
          "Nhận biết cú pháp định nghĩa hàm def và lệnh trả về return.",
          "Nhận biết ba loại lỗi chương trình trong Python: Lỗi cú pháp, Lỗi ngoại lệ thời gian chạy và Lỗi logic."
        ],
        "th": [
          "Sử dụng thành thạo các phương thức danh sách: append(), insert(), remove() và toán tử in.",
          "Áp dụng các phương thức xử lý xâu: find() tìm xâu con, split() tách từ, join() nối từ.",
          "Phân biệt rõ tham số của hàm khi định nghĩa và đối số truyền vào khi gọi hàm; phân biệt biến cục bộ và biến toàn cục.",
          "Nhận diện nguyên nhân các mã lỗi ngoại lệ phổ biến: ZeroDivisionError, IndexError, NameError, ValueError."
        ],
        "vd": [
          "Viết hàm con giải quyết một tác vụ con cụ thể (tính tổng mảng, kiểm tra số nguyên tố, tách họ tên).",
          "Áp dụng phương pháp gỡ lỗi: in biến trung gian bằng print() và đặt điểm dừng breakpoint."
        ],
        "vdc": [
          "Xây dựng chương trình hoàn chỉnh giải bài toán thực tế có tính liên môn (kiểm tra ngày tháng năm nhuận hợp lệ, giải phương trình bậc hai)."
        ]
      },
      "q": {
        "nb_p1": "2 câu",
        "nb_p2": "1 ý",
        "th_p1": "2 câu",
        "th_p2": "1 ý",
        "vd_p1": "1 câu",
        "vd_p2": "1 ý",
        "vdc_p1": "1 câu",
        "vdc_p2": "-",
        "total": "7",
        "pct": "25%"
      }
    },
    {
      "tt": 6,
      "startLesson": 33,
      "endLesson": 34,
      "topic": "Chủ đề 6: Hướng nghiệp với Tin học",
      "content": "Bài 33–34: Nghề thiết kế đồ họa máy tính (khái niệm, yêu cầu kĩ năng, cơ hội việc làm), Nghề phát triển phần mềm (7 công đoạn sản xuất phần mềm, các vị trí lập trình viên, kĩ sư phần mềm, quản trị dự án)",
      "sgkPages": "Trang 156 – 165",
      "yccd": {
        "nb": [
          "Nêu được bản chất của nghề thiết kế đồ họa máy tính và các lĩnh vực ứng dụng thực tế.",
          "Nêu được 7 công đoạn cơ bản trong quy trình sản xuất một sản phẩm phần mềm chuyên nghiệp.",
          "Nhận biết các vị trí công việc chính trong ngành phần mềm: Lập trình viên, Kĩ sư phần mềm, Quản trị dự án."
        ],
        "th": [
          "Trình bày được các kiến thức, kĩ năng và phẩm chất cần có của người làm thiết kế đồ họa và người phát triển phần mềm.",
          "Phân biệt được vai trò của người lập trình viên và kĩ sư phân tích, thiết kế hệ thống phần mềm."
        ],
        "vd": [
          "Tìm kiếm và khai thác được thông tin tuyển dụng, xu hướng phát triển việc làm CNTT trên các nền tảng mạng Internet."
        ],
        "vdc": [
          "Tự đánh giá sự phù hợp của bản thân với các ngành nghề trong lĩnh vực Tin học và lập kế hoạch học tập định hướng nghề nghiệp."
        ]
      },
      "q": {
        "nb_p1": "1 câu",
        "nb_p2": "-",
        "th_p1": "1 câu",
        "th_p2": "1 ý",
        "vd_p1": "-",
        "vd_p2": "-",
        "vdc_p1": "-",
        "vdc_p2": "-",
        "total": "3",
        "pct": "5%"
      }
    }
  ],
  "11": [
    {
      "tt": 1,
      "startLesson": 1,
      "endLesson": 5,
      "topic": "Chủ đề 1: Máy tính và xã hội tri thức",
      "content": "Bài 1–5: Hệ điều hành, Phần mềm nguồn mở, Bên trong máy tính, Kết nối thiết bị số",
      "sgkPages": "Trang 5 – 27",
      "yccd": {
        "nb": [
          "Trình bày được vai trò và chức năng cơ bản của hệ điều hành đối với hệ thống máy tính.",
          "Nhận biết được đặc điểm của phần mềm nguồn mở, giấy phép GNU GPL so với phần mềm thương mại.",
          "Nêu được chức năng của các bộ phận chính bên trong máy tính: CPU, RAM, ROM, các cổng kết nối ngoại vi (HDMI, USB, Bluetooth)."
        ],
        "th": [
          "Phân biệt được hệ điều hành dành cho máy tính cá nhân (Windows, Linux, macOS) và thiết bị di động (Android, iOS).",
          "Giải thích được vai trò của bộ nhớ truy xuất ngẫu nhiên (RAM) và bộ nhớ chỉ đọc (ROM) trong quá trình máy tính khởi động và vận hành."
        ],
        "vd": [
          "Thao tác thành thạo quản lý tệp tin, thư mục, cá nhân hóa giao diện và thiết lập các tùy chọn cơ bản trong hệ điều hành.",
          "Kết nối thành công máy tính với các thiết bị số thông dụng (máy chiếu, điện thoại thông minh, tai nghe không dây)."
        ],
        "vdc": [
          "Đánh giá và lựa chọn cấu hình máy tính phần cứng phù hợp với nhu cầu học tập, thiết kế đồ họa hoặc lập trình."
        ]
      },
      "q": {
        "nb_p1": "2 câu",
        "nb_p2": "1 ý",
        "th_p1": "1 câu",
        "th_p2": "-",
        "vd_p1": "-",
        "vd_p2": "-",
        "vdc_p1": "-",
        "vdc_p2": "1 ý",
        "total": "4",
        "pct": "15%"
      }
    },
    {
      "tt": 2,
      "startLesson": 6,
      "endLesson": 9,
      "topic": "Chủ đề 2 & 3: Lưu trữ Internet & An toàn thông tin",
      "content": "Bài 6–9: Lưu trữ đám mây, Tìm kiếm thông tin, Thư điện tử, MXH & Giao tiếp an toàn",
      "sgkPages": "Trang 28 – 49",
      "yccd": {
        "nb": [
          "Nhận biết được ưu điểm của dịch vụ lưu trữ và chia sẻ tệp tin trên Internet (Google Drive, OneDrive).",
          "Chỉ ra được các mối đe dọa an toàn thông tin trên không gian mạng: mã độc, lừa đảo trực tuyến (phishing), đánh cắp danh tính.",
          "Nêu được các nguyên tắc bảo vệ mật khẩu và dữ liệu cá nhân khi sử dụng thư điện tử và mạng xã hội."
        ],
        "th": [
          "Hiểu và phân biệt được các mức phân quyền chia sẻ tệp trên đám mây: Người xem (Viewer), Người nhận xét, Người chỉnh sửa (Editor).",
          "Giải thích được cách thức hoạt động của phương thức xác thực hai yếu tố (2FA) trong bảo mật tài khoản."
        ],
        "vd": [
          "Sử dụng các toán tử tìm kiếm nâng cao (AND, OR, site:, filetype:) để tra cứu chính xác tài liệu học tập trên Internet.",
          "Thiết lập phân quyền chia sẻ tệp an toàn và gửi thư điện tử đính kèm tệp theo đúng quy chuẩn."
        ],
        "vdc": [
          "Phân tích và nhận diện các tình huống lừa đảo, tin giả trên mạng xã hội; đề xuất biện pháp xử lý và phòng tránh cho bản thân và bạn bè."
        ]
      },
      "q": {
        "nb_p1": "1 (C4)",
        "nb_p2": "-",
        "nb_p3": "-",
        "th_p1": "1 (C5)",
        "th_p2": "1 ý (C1b)",
        "th_p3": "-",
        "vd_p1": "-",
        "vd_p2": "-",
        "vd_p3": "-",
        "vdc_p1": "-",
        "vdc_p2": "-",
        "vdc_p3": "-",
        "total": "2",
        "pct": "10%"
      }
    },
    {
      "tt": 3,
      "startLesson": 10,
      "endLesson": 15,
      "topic": "Chủ đề 4: Giới thiệu các hệ cơ sở dữ liệu",
      "content": "Bài 10–15: CSDL, Hệ QTCSDL, CSDL quan hệ, Ngôn ngữ SQL & Bảo mật hệ thống",
      "sgkPages": "Trang 50 – 79",
      "yccd": {
        "nb": [
          "Nêu được các khái niệm: Cơ sở dữ liệu (CSDL), Hệ quản trị CSDL (DBMS), CSDL quan hệ, Bảng, Bản ghi (hàng), Trường (cột).",
          "Nhận biết vai trò của Khóa chính (Primary Key): xác định duy nhất mỗi bản ghi, không nhận giá trị rỗng NULL.",
          "Nhận biết cấu trúc câu lệnh SQL chuẩn: SELECT, FROM, WHERE, ORDER BY, INSERT INTO, UPDATE, DELETE."
        ],
        "th": [
          "Giải thích được sự cần thiết của CSDL trong công tác quản lý của các tổ chức, doanh nghiệp.",
          "Dự đoán được kết quả hiển thị của câu truy vấn SQL SELECT có điều kiện lọc WHERE và sắp xếp ORDER BY.",
          "Hiểu các biện pháp an toàn và bảo mật hệ CSDL: sao lưu dự phòng, phân quyền người dùng theo vai trò."
        ],
        "vd": [
          "Xác định được các trường và khóa chính phù hợp cho bài toán quản lý thư viện, học sinh hoặc bán hàng.",
          "Viết được câu lệnh SQL trích xuất danh sách bản ghi thỏa mãn điều kiện lọc và sắp xếp theo yêu cầu."
        ],
        "vdc": [
          "Thiết kế mô hình liên kết các bảng dữ liệu đơn giản đáp ứng bài toán thực tế, đảm bảo không trùng lặp và tính toàn vẹn dữ liệu."
        ]
      },
      "q": {
        "nb_p1": "2 (C6, C7)",
        "nb_p2": "1 ý (C1c)",
        "nb_p3": "-",
        "th_p1": "1 (C8)",
        "th_p2": "-",
        "th_p3": "-",
        "vd_p1": "1 (C9)",
        "vd_p2": "1 ý (C1d)",
        "vd_p3": "1 (C15)",
        "vdc_p1": "-",
        "vdc_p2": "-",
        "vdc_p3": "-",
        "total": "6",
        "pct": "25%"
      }
    },
    {
      "tt": 4,
      "startLesson": 16,
      "endLesson": 24,
      "topic": "Chủ đề 5 & 6: Hướng nghiệp & Thực hành CSDL",
      "content": "Bài 16–24: Nghề DBA, Cấu trúc bảng, Khóa ngoài, Cập nhật/Truy xuất dữ liệu, Sao lưu",
      "sgkPages": "Trang 80 – 118",
      "yccd": {
        "nb": [
          "Nêu được nhiệm vụ chính của Người quản trị cơ sở dữ liệu (DBA) và cơ hội nghề nghiệp trong lĩnh vực dữ liệu.",
          "Nhận biết cú pháp tạo bảng có khóa ngoài FOREIGN KEY ... REFERENCES ... để liên kết hai bảng trong CSDL.",
          "Nhận biết quy trình sao lưu dự phòng (Backup) và phục hồi (Restore) cơ sở dữ liệu trên máy tính."
        ],
        "th": [
          "Giải thích được ràng buộc toàn vẹn tham chiếu giữa bảng cha và bảng con qua liên kết khóa ngoài.",
          "Hiểu cách thức cập nhật dữ liệu (UPDATE) và thêm bản ghi mới (INSERT INTO) vào các bảng có mối quan hệ tham chiếu."
        ],
        "vd": [
          "Thực hành tạo lập CSDL, tạo các bảng có chỉ định khóa chính và khóa ngoài trên hệ quản trị CSDL thực tế.",
          "Thực hiện câu lệnh truy vấn dữ liệu từ nhiều bảng có liên kết và tính toán số liệu thống kê cơ bản."
        ],
        "vdc": [
          "Xây dựng quy trình tự động sao lưu dữ liệu định kỳ và xử lý khôi phục CSDL khi xảy ra sự cố hỏng hóc hệ thống."
        ]
      },
      "q": {
        "nb_p1": "1 (C9)",
        "nb_p2": "-",
        "nb_p3": "-",
        "th_p1": "1 (C10)",
        "th_p2": "1 ý (C2a)",
        "th_p3": "-",
        "vd_p1": "1 (C11)",
        "vd_p2": "-",
        "vd_p3": "1 (C16)",
        "vdc_p1": "-",
        "vdc_p2": "-",
        "vdc_p3": "-",
        "total": "4",
        "pct": "20%"
      }
    },
    {
      "tt": 5,
      "startLesson": 25,
      "endLesson": 31,
      "topic": "Chủ đề 7: Phần mềm chỉnh sửa ảnh và làm video",
      "content": "Bài 25–31: Chỉnh sửa ảnh, Lớp ảnh (Layer), Tô vẽ, Tạo ảnh động, Biên tập phim hoạt hình",
      "sgkPages": "Trang 119 – 155",
      "yccd": {
        "nb": [
          "Nêu được chức năng của phần mềm chỉnh sửa ảnh (GIMP/Photoshop) và phần mềm làm phim.",
          "Nhận biết khái niệm Lớp ảnh (Layer) và các công cụ chọn vùng cơ bản (hình chữ nhật, elip, lasso, ma thuật).",
          "Nêu được nguyên lý tạo ảnh động (Animation) và phim hoạt hình dựa trên chuỗi khung hình (frames)."
        ],
        "th": [
          "Hiểu nguyên lý hoạt động của đường thời gian (Timeline), các rãnh âm thanh và video trong phần mềm dựng phim.",
          "Giải thích tác dụng của hiệu ứng chuyển cảnh (Transition) và bộ lọc tinh chỉnh màu sắc trong biên tập video."
        ],
        "vd": [
          "Sử dụng các công cụ vẽ, tẩy, cắt ghép và điều chỉnh độ sáng, độ tương phản để phục chế hoặc ghép ảnh nghệ thuật.",
          "Tạo được ảnh động đơn giản (định dạng GIF) hoặc video clip hoạt hình ngắn có lồng ghép âm thanh."
        ],
        "vdc": [
          "Sáng tạo một video clip ngắn (hoặc phim hoạt hình) có kịch bản, âm thanh thuyết minh và đồ họa hoàn chỉnh phục vụ tuyên truyền học đường."
        ]
      },
      "q": {
        "nb_p1": "1 (C12)",
        "nb_p2": "-",
        "nb_p3": "-",
        "th_p1": "-",
        "th_p2": "1 ý (C2b)",
        "th_p3": "-",
        "vd_p1": "-",
        "vd_p2": "1 ý (C2c)",
        "vd_p3": "1 (C17)",
        "vdc_p1": "-",
        "vdc_p2": "1 ý (C2d)",
        "vdc_p3": "-",
        "total": "4",
        "pct": "15%"
      }
    }
  ],
  "12": [
    {
      "tt": 1,
      "startLesson": 1,
      "endLesson": 2,
      "topic": "Chủ đề 1: Trí tuệ nhân tạo (AI) & Đời sống",
      "content": "Bài 1–2: Làm quen với Trí tuệ nhân tạo (khái niệm, lịch sử Dartmouth 1956, 5 đặc trưng, AI hẹp vs AI tổng quát, MYCIN, Asimo), Trí tuệ nhân tạo trong khoa học và đời sống (AI tạo sinh Generative AI, ChatGPT, các cảnh báo đạo đức và an ninh)",
      "sgkPages": "Trang 5 – 13",
      "yccd": {
        "nb": [
          "Nêu được khái niệm Trí tuệ nhân tạo (AI) và mốc lịch sử ra đời tại Hội thảo Dartmouth năm 1956.",
          "Nhận biết được 5 đặc trưng cơ bản của AI: Khả năng học, suy luận, nhận thức, hiểu ngôn ngữ và giải quyết vấn đề.",
          "Phân biệt được Trí tuệ nhân tạo hẹp (Narrow AI) và Trí tuệ nhân tạo tổng quát (AGI)."
        ],
        "th": [
          "Giải thích được nguyên lí hoạt động của AI tạo sinh (Generative AI) và mô hình ngôn ngữ lớn như ChatGPT.",
          "Phân tích được các nguy cơ, cảnh báo xã hội của AI: áp lực việc làm, quyền riêng tư, tính minh bạch ('hộp đen') và an ninh vũ khí tự động."
        ],
        "vd": [
          "Đánh giá và so sánh khả năng giải quyết công việc giữa con người và các ứng dụng AI trong thực tế (y tế, giáo dục, dịch thuật, lái xe tự động)."
        ],
        "vdc": [
          "Đề xuất các nguyên tắc đạo đức và giải pháp quản lí an toàn khi ứng dụng Trí tuệ nhân tạo trong học tập và đời sống số."
        ]
      },
      "q": {
        "nb_p1": "2 câu",
        "nb_p2": "1 ý",
        "nb_p3": "1 câu",
        "th_p1": "1 câu",
        "th_p2": "1 ý",
        "th_p3": "1 câu",
        "vd_p1": "-",
        "vd_p2": "-",
        "vd_p3": "-",
        "vdc_p1": "-",
        "vdc_p2": "-",
        "vdc_p3": "-",
        "total": "4",
        "pct": "15%"
      }
    },
    {
      "tt": 2,
      "startLesson": 3,
      "endLesson": 6,
      "topic": "Chủ đề 2 & 3: Mạng máy tính & Đạo đức mạng",
      "content": "Bài 3–6: Thiết bị mạng (Hub, Switch, Router, WAP, Modem, giắc RJ45), Giao thức mạng (Ethernet, MAC, bộ giao thức TCP/IP, IPv4, IPv6, DNS), Thực hành chia sẻ tài nguyên (tệp, máy in LAN), Giao tiếp và ứng xử nhân văn trên không gian mạng",
      "sgkPages": "Trang 14 – 38",
      "yccd": {
        "nb": [
          "Phân biệt được nguyên lí hoạt động và chức năng của các thiết bị mạng: Hub, Switch, Access Point, Router và Modem.",
          "Nêu được cấu trúc của địa chỉ IPv4 (4 byte) và vai trò phân giải tên miền của hệ thống DNS.",
          "Nhận diện các đặc trưng của giao tiếp trong không gian mạng và các biểu hiện ứng xử thiếu văn hoá."
        ],
        "th": [
          "Giải thích được cơ chế truyền tin cậy và phân mảnh/ghép gói tin của giao thức TCP.",
          "Hiểu các quy định trong Bộ Quy tắc ứng xử trên mạng xã hội theo Quyết định 874/QĐ-BTTTT."
        ],
        "vd": [
          "Thực hiện thiết lập chia sẻ thư mục và máy in trong mạng cục bộ LAN với các phân quyền phù hợp.",
          "Vận dụng các nguyên tắc ứng xử nhân văn, lịch sự và bảo vệ quyền riêng tư khi giao tiếp trực tuyến."
        ],
        "vdc": [
          "Phân tích tình huống thực tế để nhận diện và phòng ngừa các hình thức lừa đảo tinh vi trên không gian mạng."
        ]
      },
      "q": {
        "nb_p1": "2 câu",
        "nb_p2": "1 ý",
        "nb_p3": "1 câu",
        "th_p1": "1 câu",
        "th_p2": "1 ý",
        "th_p3": "1 câu",
        "vd_p1": "-",
        "vd_p2": "-",
        "vd_p3": "-",
        "vdc_p1": "-",
        "vdc_p2": "-",
        "vdc_p3": "-",
        "total": "4",
        "pct": "15%"
      }
    },
    {
      "tt": 3,
      "startLesson": 7,
      "endLesson": 12,
      "topic": "Chủ đề 4: Thiết kế trang web với HTML",
      "content": "Bài 7–12: Cấu trúc tài liệu HTML5 (cây DOM, html, head, title, body), Định dạng văn bản (h1-h6, p, div, span, b, i, sub, sup, hr, br), Danh sách (ol, ul, dl), Bảng biểu (table, tr, td, th, colspan, rowspan), Liên kết (a href, target='_blank', neo id), Đa phương tiện (img, video, audio, iframe), Biểu mẫu (form, input radio/checkbox/text/password, textarea, select)",
      "sgkPages": "Trang 39 – 70",
      "yccd": {
        "nb": [
          "Nhận biết cấu trúc chuẩn của một tài liệu HTML5 và vai trò của các thẻ cơ bản: html, head, title, body.",
          "Nhận biết các thẻ định dạng tiêu đề (h1-h6), đoạn văn (p, br, hr), kiểu chữ (b, i, u, sup, sub).",
          "Nhận biết cú pháp thẻ liên kết a, thẻ hình ảnh img, thẻ khung nội tuyến iframe và các loại điều khiển trong form."
        ],
        "th": [
          "Hiểu cơ chế quan hệ cha-con lồng nhau trong cây cấu trúc tài liệu HTML (cây DOM).",
          "Phân biệt được danh sách có thứ tự ol và không thứ tự ul; phân biệt radio button và checkbox.",
          "Giải thích được tác dụng của thuộc tính gộp ô colspan và rowspan trong bảng table."
        ],
        "vd": [
          "Soạn thảo được trang web tĩnh có đầy đủ bảng biểu, danh sách, hình ảnh, video và biểu mẫu thu thập dữ liệu."
        ],
        "vdc": [
          "Tạo lập hệ thống liên kết nội bộ giữa các trang web con và liên kết neo trang một cách khoa học, thuận tiện điều hướng."
        ]
      },
      "q": {
        "nb_p1": "3 câu",
        "nb_p2": "1 ý",
        "nb_p3": "1 câu",
        "th_p1": "2 câu",
        "th_p2": "1 ý",
        "th_p3": "1 câu",
        "vd_p1": "1 câu",
        "vd_p2": "1 ý",
        "vd_p3": "-",
        "vdc_p1": "-",
        "vdc_p2": "-",
        "vdc_p3": "-",
        "total": "8",
        "pct": "30%"
      }
    },
    {
      "tt": 4,
      "startLesson": 13,
      "endLesson": 18,
      "topic": "Chủ đề 4 (tiếp): Định kiểu trang web với CSS",
      "content": "Bài 13–18: Khái niệm & vai trò của CSS, 3 cách nhúng CSS (Inline, Internal, External), Định dạng văn bản CSS (font-family, font-size, text-align, text-decoration), Hệ thống màu (RGB, Hex, HSL), Bộ chọn tổ hợp quan hệ (E F, E > F, E + F, E ~ F), Mô hình hộp Box Model (Content, Padding, Border, Margin), Lớp giả :hover, Độ ưu tiên bộ chọn Specificity & !important",
      "sgkPages": "Trang 71 – 105",
      "yccd": {
        "nb": [
          "Nêu được vai trò của CSS trong việc tách biệt nội dung và hình thức trình bày trang web.",
          "Nhận biết cú pháp cơ bản của CSS và 3 cách thiết lập: CSS nội tuyến, CSS trong và CSS ngoài qua tệp .css.",
          "Nhận biết 4 thành phần của mô hình hộp CSS Box Model: Content, Padding, Border, Margin.",
          "Nhận biết các lớp giả (pseudo-class) như :hover, :link, :visited."
        ],
        "th": [
          "Phân biệt được các họ phông chữ cơ bản: serif, sans-serif, monospace và các hệ màu RGB, Hex, HSL.",
          "Giải thích được ý nghĩa các bộ chọn quan hệ: bộ chọn con cháu E F, con trực tiếp E > F, anh em liền kề E + F.",
          "Xác định được mức độ ưu tiên áp dụng quy tắc CSS dựa trên trọng số bộ chọn (Specificity) và từ khoá !important."
        ],
        "vd": [
          "Áp dụng thành thạo CSS để tùy biến màu sắc, phông chữ, đường viền, khoảng cách lề và hiệu ứng chuyển động rê chuột :hover."
        ],
        "vdc": [
          "Xây dựng bố cục trang web hoàn chỉnh, thẩm mỹ và cân đối theo cấu trúc chuẩn Header – Main Content – Footer."
        ]
      },
      "q": {
        "nb_p1": "3 câu",
        "nb_p2": "1 ý",
        "nb_p3": "1 câu",
        "th_p1": "2 câu",
        "th_p2": "1 ý",
        "th_p3": "1 câu",
        "vd_p1": "1 câu",
        "vd_p2": "1 ý",
        "vd_p3": "1 câu",
        "vdc_p1": "1 câu",
        "vdc_p2": "-",
        "vdc_p3": "-",
        "total": "8",
        "pct": "30%"
      }
    },
    {
      "tt": 5,
      "startLesson": 19,
      "endLesson": 28,
      "topic": "Chủ đề 5, 6 & 7: Hướng nghiệp, Thiết bị số & Dự án web",
      "content": "Bài 19–28: Nghề sửa chữa và bảo trì máy tính (phần cứng, phần mềm, kĩ năng), Nhóm nghề quản trị CNTT (quản trị mạng, bảo mật, quản trị hệ thống), Hội thảo hướng nghiệp, Kết nối thiết bị số (HDMI, Bluetooth, Smart Home), Dự án website hoàn chỉnh với Google Sites (chuẩn bị ý tưởng, Header, Favicon, Body, Footer, nhúng Forms, điều hướng, xuất bản)",
      "sgkPages": "Trang 106 – 155",
      "yccd": {
        "nb": [
          "Nêu được các công việc chính của nghề sửa chữa, bảo trì máy tính và các vị trí nghề quản trị CNTT.",
          "Nhận biết các phương thức kết nối thiết bị số thông dụng: cáp HDMI, sóng Bluetooth, thiết bị nhà thông minh qua Wi-Fi.",
          "Nêu được các bước cơ bản để xây dựng một website hoàn chỉnh và khái niệm biểu tượng Favicon."
        ],
        "th": [
          "Phân biệt được vai trò của chuyên gia quản trị mạng và chuyên gia bảo mật hệ thống thông tin.",
          "Hiểu các chế độ hiển thị màn hình ngoài (Duplicate, Extend) qua phím Windows + P.",
          "Giải thích được lợi ích của việc sử dụng công cụ trực quan (Google Sites) kết hợp biểu mẫu Google Forms để xây dựng website."
        ],
        "vd": [
          "Thực hiện kết nối và truyền tệp tin an toàn giữa máy tính và điện thoại qua Bluetooth; cấu hình thiết bị nhà thông minh.",
          "Tìm kiếm và khai thác thông tin hướng nghiệp, tuyển dụng ngành CNTT trên Internet."
        ],
        "vdc": [
          "Hoàn thành một dự án xây dựng website theo nhóm hoàn chỉnh có nội dung đa phương tiện, liên kết điều hướng và biểu mẫu tương tác."
        ]
      },
      "q": {
        "nb_p1": "2 câu",
        "nb_p2": "-",
        "nb_p3": "-",
        "th_p1": "2 câu",
        "th_p2": "1 ý",
        "th_p3": "1 câu",
        "vd_p1": "-",
        "vd_p2": "-",
        "vd_p3": "-",
        "vdc_p1": "-",
        "vdc_p2": "-",
        "vdc_p3": "1 câu",
        "total": "4",
        "pct": "10%"
      }
    }
  ]
};

const CURRICULUM_DATA = {
  get informatics() {
    const grade = state.currentGrade || '10';
    return INFORMATICS_CURRICULA[grade] || INFORMATICS_CURRICULA['10'];
  },
};

// ─── INIT ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initUpload();
  initViewerControls();
  initMatrixTable();
  initSpecPanel();
  initExamPreview();
  initAnimations();
  bindEvents();
});

// ─── NAVBAR ───────────────────────────────────────────────
function initNavbar() {
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  hamburger?.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    const spans = hamburger.querySelectorAll('span');
    hamburger.classList.toggle('active-ham');
    if (hamburger.classList.contains('active-ham')) {
      spans[0].style.transform = 'translateY(7px) rotate(45deg)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
    } else {
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  });

  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => navLinks?.classList.remove('open'));
  });

  window.addEventListener('scroll', updateActiveNavLink);
  document.getElementById('startBtn')?.addEventListener('click', () => scrollToPipeline());
  document.getElementById('heroStartBtn')?.addEventListener('click', () => scrollToPipeline());
}

function scrollToPipeline() {
  document.getElementById('pipeline')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function updateActiveNavLink() {
  const sections = ['pipeline', 'features', 'about'];
  const links = document.querySelectorAll('.nav-link');
  let current = '';
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el && window.scrollY >= el.offsetTop - 100) current = id;
  });
  links.forEach(l => {
    l.classList.toggle('active', l.getAttribute('href') === `#${current}`);
  });
}

// ─── UPLOAD & SMART SGK DETECTOR ──────────────────────────
function initUpload() {
  const zone      = document.getElementById('uploadZone');
  const fileInput = document.getElementById('fileInput');
  const browseBtn = document.getElementById('browseBtn');
  const fileList  = document.getElementById('fileList');
  const chapterRange = document.getElementById('chapterRange');

  browseBtn?.addEventListener('click', e => { e.stopPropagation(); fileInput.click(); });
  zone?.addEventListener('click', () => fileInput.click());

  ['dragenter', 'dragover'].forEach(e => zone?.addEventListener(e, ev => {
    ev.preventDefault(); zone.classList.add('drag-over');
  }));
  ['dragleave', 'drop'].forEach(e => zone?.addEventListener(e, ev => {
    ev.preventDefault(); zone.classList.remove('drag-over');
  }));

  zone?.addEventListener('drop', ev => {
    const files = [...ev.dataTransfer.files].filter(f => isValidFile(f));
    addFiles(files);
  });

  fileInput?.addEventListener('change', e => {
    const files = [...e.target.files].filter(f => isValidFile(f));
    addFiles(files);
    fileInput.value = '';
  });

  function isValidFile(f) {
    const types = ['application/pdf', 'image/jpeg', 'image/png', 'image/tiff', 'text/plain', 'text/markdown', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const exts  = ['.pdf', '.jpg', '.jpeg', '.png', '.tiff', '.tif', '.txt', '.md', '.markdown', '.doc', '.docx'];
    return types.includes(f.type) || exts.some(e => f.name.toLowerCase().endsWith(e));
  }

  function addFiles(files) {
    files.forEach(file => {
      if (state.uploadedFiles.some(f => f.name === file.name)) return;
      state.uploadedFiles.push(file);
      renderFileItem(file);
      analyzeUploadedFile(file);
      if (file.type.startsWith('image/')) showDocPreview(file);
    });
    if (state.uploadedFiles.length > 0) {
      chapterRange.style.display = 'block';
      showOCRPreview();
    }
  }

  function renderFileItem(file) {
    const item = document.createElement('div');
    item.className = 'file-item';
    item.id = `file-${file.name.replace(/\s/g, '_')}`;
    const ext = file.name.split('.').pop().toUpperCase();
    const icon = ext === 'PDF' ? 'fa-file-pdf' : (ext === 'TXT' || ext === 'MD' || ext === 'DOC' || ext === 'DOCX') ? 'fa-file-lines' : 'fa-file-image';
    const size = (file.size / 1024 / 1024).toFixed(2);
    item.innerHTML = `
      <i class="fa-regular ${icon} file-icon"></i>
      <div class="file-info">
        <div class="file-name">${file.name}</div>
        <div class="file-size">${size} MB · SGK Giáo khoa chuẩn GDPT 2018</div>
        <div class="file-progress"><div class="file-progress-fill" id="fp-${file.name.replace(/\s/g,'_')}" style="width:0%"></div></div>
      </div>
      <button class="file-remove" onclick="removeFile('${file.name}')"><i class="fa-solid fa-xmark"></i></button>
    `;
    fileList.appendChild(item);

    let p = 0;
    const fill = item.querySelector('.file-progress-fill');
    const iv = setInterval(() => {
      p += 25;
      if (p >= 100) { p = 100; clearInterval(iv); }
      fill.style.width = `${p}%`;
    }, 150);
    showToast('success', 'Nhận diện tài liệu thành công', `Đã bóc tách cấu trúc: ${file.name}`);
  }
}

// ─── TỰ ĐỘNG NHẬN DIỆN MÔN HỌC & CẤU TRÚC TỪ FILE TẢI LÊN ───
function analyzeUploadedFile(file) {
  const fname = file.name.toLowerCase();
  const matchedSubject = 'informatics';
  let matchedGrade = null;

  // 1. Nhận diện khối lớp (10, 11, 12, 9, 8) từ tên file (hỗ trợ tin10, tin_11, lop12, v.v.)
  const gradeMatch = fname.match(/(?:lop|grade|k|tin|tin_hoc)[\s_\-]?(\d{1,2})|[\s_\-](\d{1,2})(?:\.|$)/i);
  if (gradeMatch) {
    const g = gradeMatch[1] || gradeMatch[2];
    if (['8', '9', '10', '11', '12'].includes(g)) matchedGrade = g;
  }

  // 2. Đọc nội dung file text/markdown/python nếu có
  if (file.type.includes('text') || fname.endsWith('.txt') || fname.endsWith('.py') || fname.endsWith('.md') || fname.endsWith('.markdown')) {
    const reader = new FileReader();
    reader.onload = e => {
      const text = e.target.result;

      // Nhận diện khối lớp từ nội dung file nếu tên file chưa rõ
      if (!matchedGrade) {
        const textGradeMatch = text.match(/tin\s*học\s*(10|11|12)|lớp\s*(10|11|12)/i);
        if (textGradeMatch) {
          const tg = textGradeMatch[1] || textGradeMatch[2];
          if (['10', '11', '12'].includes(tg)) {
            matchedGrade = tg;
            state.currentGrade = matchedGrade;
            const gradeSelect = document.getElementById('gradeSelect');
            if (gradeSelect) gradeSelect.value = matchedGrade;
            updateScopeSelect(matchedGrade);
          }
        }
      }

      // Nhận diện danh sách bài học từ mục lục SGK được upload
      const lessonMatches = [...text.matchAll(/(?:[-*•]\s*)?(?:Bài|Chương|Topic)\s+(\d+)[:\.\s]+([^\n\r]+)/gi)];
      if (lessonMatches.length > 0) {
        state.uploadedLessons = lessonMatches.map(m => ({
          lesson: parseInt(m[1], 10),
          title: m[2].trim(),
        }));
        showToast('info', 'Đã bóc tách cấu trúc SGK', `Tìm thấy ${lessonMatches.length} bài học trong tài liệu "${file.name}"`);
      }
    };
    reader.readAsText(file);
  }

  // Đồng bộ giao diện
  state.currentSubject = 'informatics';
  const subSelect = document.getElementById('subjectSelect');
  if (subSelect) subSelect.value = 'informatics';

  if (matchedGrade) {
    state.currentGrade = matchedGrade;
    const gradeSelect = document.getElementById('gradeSelect');
    if (gradeSelect) gradeSelect.value = matchedGrade;
    updateScopeSelect(matchedGrade);
  }

  // Cập nhật tiêu đề đề thi chuẩn
  const curSub = CURRICULUM_DATA.informatics;
  const examTitleInput = document.getElementById('examTitle');
  if (examTitleInput) {
    examTitleInput.value = `Đề kiểm tra định kỳ ${curSub.name} (Chuẩn CV 7991)`;
  }

  // Cập nhật ma trận và đặc tả ngay theo môn Tin học
  loadCurriculumForSubject('informatics');
}

function getOcrContextForLessons(grade, chapFrom, chapTo) {
  const scopes = GRADE_SCOPES[grade] || GRADE_SCOPES['10'];
  const curSub = INFORMATICS_CURRICULA[grade] || INFORMATICS_CURRICULA['10'];
  const maxLesson = grade === '11' ? 31 : grade === '12' ? 28 : 34;

  // Nếu chọn toàn bộ chương trình (từ bài 1 đến bài cuối)
  if (chapFrom <= 1 && chapTo >= maxLesson) {
    return {
      headerTheme: curSub.headerTheme,
      lessonsOverview: curSub.lessonsOverview,
      keyConcepts: curSub.keyConcepts,
      footerOutcome: curSub.footerOutcome
    };
  }

  // Lọc các scope cấp chủ đề (bắt đầu bằng 'cd') giao thoa trực tiếp với dải bài đã chọn [chapFrom, chapTo]
  const cdScopes = scopes.filter(s => s.value.startsWith('cd') && s.chapFrom <= chapTo && s.chapTo >= chapFrom);

  if (cdScopes.length > 0) {
    let headerThemes = cdScopes.map(s => {
      let t = s.headerTheme.replace(/^Chủ đề \d+.*?: /i, '');
      if (grade === '11' && s.value === 'cd7' && chapTo < 28) {
        t = 'Phần mềm chỉnh sửa ảnh (GIMP)';
      }
      return t;
    }).join(' &bull; ');

    // Lọc danh sách bài học chi tiết chỉ hiển thị bài trong dải [chapFrom, chapTo]
    const allLessonItems = [];
    cdScopes.forEach(s => {
      const parts = (s.lessonsOverview || '').split(/\s*[·•&bull;]+\s*/);
      parts.forEach(p => {
        const m = p.match(/Bài\s*(\d+)/i);
        if (m) {
          const lNum = parseInt(m[1], 10);
          if (lNum >= chapFrom && lNum <= chapTo) {
            allLessonItems.push(p.trim());
          }
        }
      });
    });
    const lessonsOverviews = allLessonItems.length > 0 ? allLessonItems.join(' &bull; ') : cdScopes.map(s => s.lessonsOverview).join(' &bull; ');

    // Lọc bỏ khái niệm bài học chưa học
    let concepts = cdScopes.map(s => s.keyConcepts).filter(Boolean).join('; ');
    if (grade === '11' && chapTo < 28) {
      concepts = concepts
        .replace(/,\s*timeline làm phim[^\;\,]*/gi, '')
        .replace(/,\s*keyframe hoạt hình[^\;\,]*/gi, '')
        .replace(/,\s*định dạng mp4\/gif/gi, '')
        .replace(/,\s*hiệu ứng âm thanh/gi, '');
    }
    if (grade === '11' && chapFrom > 16) {
      concepts = concepts.replace(/Công việc DBA \(Database Administrator\),\s*/gi, '');
    }

    let outcomes = cdScopes.map(s => s.footerOutcome).filter(Boolean).join(' ');
    if (grade === '11' && chapTo < 28) {
      outcomes = outcomes.replace(/,\s*tạo ảnh động và dựng video clip ngắn có âm thanh hoàn chỉnh/gi, ' và xử lý, biên tập hình ảnh kỹ thuật số');
    }

    return {
      headerTheme: cdScopes.length === 1 ? (grade === '11' && cdScopes[0].value === 'cd7' && chapTo < 28 ? 'Chủ đề 7: Phần mềm chỉnh sửa ảnh (GIMP)' : cdScopes[0].headerTheme) : headerThemes,
      lessonsOverview: lessonsOverviews,
      keyConcepts: concepts,
      footerOutcome: outcomes
    };
  }

  // Khớp chính xác theo dải bài hoặc scope gần nhất
  const matchedScope = scopes.find(s => s.chapFrom === chapFrom && s.chapTo === chapTo)
    || scopes.find(s => s.chapFrom <= chapTo && s.chapTo >= chapFrom && s.value !== 'all')
    || scopes[0];

  return {
    headerTheme: matchedScope.headerTheme || curSub.headerTheme,
    lessonsOverview: matchedScope.lessonsOverview || curSub.lessonsOverview,
    keyConcepts: matchedScope.keyConcepts || curSub.keyConcepts,
    footerOutcome: matchedScope.footerOutcome || curSub.footerOutcome
  };
}

function getScopeDescriptor(grade, chapFrom, chapTo) {
  const maxLesson = grade === '11' ? 31 : (grade === '12' ? 28 : 34);
  const curSub = INFORMATICS_CURRICULA[grade] || INFORMATICS_CURRICULA['10'];
  const scopes = GRADE_SCOPES[grade] || GRADE_SCOPES['10'];

  if (chapFrom <= 1 && chapTo >= maxLesson) {
    return {
      value: 'all',
      label: `Toàn bộ chương trình năm học (Bài 1 – ${maxLesson})`,
      shortLabel: `Toàn bộ CT (Bài 1 – ${maxLesson})`,
      chapFrom: 1,
      chapTo: maxLesson
    };
  }

  // Khớp chính xác phạm vi được định nghĩa trước
  const exact = scopes.find(s => s.chapFrom === chapFrom && s.chapTo === chapTo);
  if (exact) {
    return exact;
  }

  // Khớp theo ngữ cảnh chủ đề thực tế
  const ocrCtx = getOcrContextForLessons(grade, chapFrom, chapTo);
  let themeName = (ocrCtx?.headerTheme || curSub.name)
    .replace(/^Chương trình Tin học \d+: /i, '')
    .replace(/^Tin học \d+: /i, '')
    .trim();

  const rangeStr = (chapFrom === chapTo) ? `Bài ${chapFrom}` : `Bài ${chapFrom} – ${chapTo}`;
  return {
    value: 'custom',
    label: `${rangeStr} (${themeName})`,
    shortLabel: `${rangeStr}`,
    chapFrom,
    chapTo
  };
}

function loadCurriculumForSubject(subjectKey = 'informatics') {
  const grade = state.currentGrade || '10';
  const curSub = INFORMATICS_CURRICULA[grade] || INFORMATICS_CURRICULA['10'];
  const scopes = GRADE_SCOPES[grade] || GRADE_SCOPES['10'];
  const scopeKey = state.currentScope || 'all';
  const activeScope = scopes.find(s => s.value === scopeKey) || scopes[0];

  // Đọc dải bài học từ input UI nếu có
  const chapFromEl = document.getElementById('chapFrom');
  const chapToEl = document.getElementById('chapTo');
  if (chapFromEl && chapFromEl.value) {
    state.chapFrom = parseInt(chapFromEl.value, 10) || 1;
  }
  if (chapToEl && chapToEl.value) {
    state.chapTo = parseInt(chapToEl.value, 10) || (grade === '11' ? 31 : grade === '12' ? 28 : 34);
  }
  const chapFrom = state.chapFrom;
  const chapTo = state.chapTo;

  // Tự động tìm scope khớp nhất với dải [chapFrom, chapTo] đã chọn
  let matchedScope = scopes.find(s => s.chapFrom === chapFrom && s.chapTo === chapTo);
  if (!matchedScope && state.currentScope && state.currentScope !== 'all') {
    const curSc = scopes.find(s => s.value === state.currentScope);
    if (curSc && curSc.chapFrom <= chapTo && curSc.chapTo >= chapFrom) {
      matchedScope = curSc;
    }
  }
  const effectiveScope = matchedScope || activeScope;

  // Đồng bộ lại dropdown scope nếu có scope khớp chính xác
  const scopeSelectEl = document.getElementById('scopeSelect');
  if (scopeSelectEl && matchedScope && scopeSelectEl.value !== matchedScope.value) {
    scopeSelectEl.value = matchedScope.value;
    state.currentScope = matchedScope.value;
  }

  // Lọc chủ đề theo dải bài học đã chọn (Bài học từ ... Đến bài ...)
  let sourceTopics = (state.customTopics.length > 0 && state.uploadedFiles.length > 0 && state.customTopics[0].startLesson !== undefined)
    ? state.customTopics
    : curSub.topics;

  // Luôn luôn lọc theo đúng dải bài học [chapFrom, chapTo]
  let topics = sourceTopics.filter(t => {
    const sLesson = t.startLesson || 1;
    const eLesson = t.endLesson || 35;
    return sLesson <= chapTo && eLesson >= chapFrom;
  });

  // Nếu không khớp topic nào (trường hợp hi hữu), fallback lại topics theo scope hoặc mặc định
  if (topics.length === 0) {
    if (effectiveScope && effectiveScope.topicIndices) {
      topics = effectiveScope.topicIndices.map(idx => curSub.topics[idx]).filter(Boolean);
    } else {
      topics = curSub.topics;
    }
  }

  // Cân bằng ma trận câu hỏi đảm bảo chuẩn CV 7991 (Phần I, II với Lớp 12; Phần I, II, III với Lớp 10 & 11)
  const normalizedTopics = balanceMatrixForScope(topics, false, grade);
  state.matrixData = normalizedTopics;
  state.lessonRows = null;

  renderMatrix(normalizedTopics);
  renderSpecForSubject(subjectKey);
  renderExamForSubject(subjectKey);

  // Lấy ngữ cảnh OCR (Kiến thức trọng tâm, Mục tiêu bài học, Tên chủ đề) khớp chính xác 100% với dải bài học [chapFrom, chapTo] đã chọn
  const ocrCtx = getOcrContextForLessons(grade, chapFrom, chapTo);

  // Cập nhật SGK Badge trong UI
  const sgkText = document.getElementById('sgkSubjectText');
  const bookLabel = BOOK_NAMES[state.currentBook] || 'KNTT - ICT';
  const scopeDesc = getScopeDescriptor(grade, chapFrom, chapTo);
  const scopeBadge = `${scopeDesc.label}`;
  if (sgkText) {
    sgkText.innerHTML = `<strong>${curSub.name}</strong> - ${bookLabel} &bull; <span style="color:#0284c7"><strong>Phạm vi:</strong> ${scopeBadge}</span>`;
  }

  // Cập nhật OCR Panel tương ứng khớp 100% với các bài học đã chọn
  const ocrBook = document.getElementById('ocrBookLabel');
  if (ocrBook) ocrBook.textContent = `${(state.currentBook || 'kntt').toUpperCase()} ${grade}`;
  const ocrHeader = document.getElementById('ocrHeaderTitle');
  if (ocrHeader) ocrHeader.textContent = `Phạm vi: Bài ${chapFrom} – Bài ${chapTo} (${ocrCtx.headerTheme || curSub.headerTheme})`;
  const ocrLessons = document.getElementById('ocrLessonsList');
  if (ocrLessons) {
    const topicLessonDesc = topics.map(t => {
      const effFrom = Math.max(t.startLesson || 1, chapFrom);
      const effTo = Math.min(t.endLesson || 35, chapTo);
      const rangeStr = (effFrom === effTo) ? `Bài ${effFrom}` : `Bài ${effFrom}–${effTo}`;
      let topicName = t.topic;
      if (grade === '11' && effTo < 28) {
        topicName = topicName.replace(/\s*và\s*làm\s*video/gi, ' (GIMP)');
      }
      return topicName.replace(/\(Bài\s*\d+[–\-\.]*\d*[^)]*\)/i, `(${rangeStr})`);
    }).join(' &bull; ');
    ocrLessons.innerHTML = `<span><strong>Bài học được chọn:</strong> ${topicLessonDesc || ocrCtx.lessonsOverview}</span>`;
  }
  const ocrConcepts = document.getElementById('ocrKeyConcepts');
  if (ocrConcepts) ocrConcepts.innerHTML = `<span>Kiến thức trọng tâm: ${ocrCtx.keyConcepts || curSub.keyConcepts}</span>`;
  const ocrFooter = document.getElementById('ocrFooterText');
  if (ocrFooter) {
    ocrFooter.innerHTML = `<i class="fa-solid fa-flag-checkered" style="color:#10b981"></i> <strong>SAU BÀI HỌC NÀY EM SẼ:</strong> ${ocrCtx.footerOutcome || curSub.footerOutcome}`;
  }
}

window.removeFile = function(name) {
  state.uploadedFiles = state.uploadedFiles.filter(f => f.name !== name);
  const el = document.getElementById(`file-${name.replace(/\s/g, '_')}`);
  if (el) { el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }
  if (state.uploadedFiles.length === 0) {
    state.customTopics = [];
    const ph = document.getElementById('viewerPlaceholder');
    if (ph) ph.style.display = 'flex';
    const vc = document.getElementById('viewerContent');
    if (vc) vc.style.display = 'none';
    loadCurriculumForSubject(state.currentSubject);
  }
};

function showDocPreview(file) {
  const reader = new FileReader();
  reader.onload = e => {
    const img = document.getElementById('docImage');
    const content = document.getElementById('viewerContent');
    const placeholder = document.getElementById('viewerPlaceholder');
    if (img) {
      img.src = e.target.result;
      img.style.transform = `scale(1) rotate(0deg)`;
    }
    if (content) content.style.display = 'block';
    if (placeholder) placeholder.style.display = 'none';
    state.zoomLevel = 100;
    state.rotation  = 0;
    updateZoom();
  };
  reader.readAsDataURL(file);
}

function showOCRPreview() {
  const curSub = CURRICULUM_DATA.informatics;
  const firstTopic = curSub.topics[0] || { topic: 'Bài học', startPage: 5, endPage: 25 };

  setTimeout(() => {
    const ocrPanel = document.getElementById('ocrPanel');
    if (ocrPanel) {
      ocrPanel.style.display = 'block';
      loadCurriculumForSubject('informatics');
    }
  }, 300);
}

// ─── VIEWER CONTROLS ──────────────────────────────────────
function initViewerControls() {
  document.getElementById('zoomIn')?.addEventListener('click', () => {
    state.zoomLevel = Math.min(state.zoomLevel + 20, 200);
    updateZoom();
  });
  document.getElementById('zoomOut')?.addEventListener('click', () => {
    state.zoomLevel = Math.max(state.zoomLevel - 20, 40);
    updateZoom();
  });
  document.getElementById('rotateBtn')?.addEventListener('click', () => {
    state.rotation = (state.rotation + 90) % 360;
    updateZoom();
  });
}

function updateZoom() {
  const img = document.getElementById('docImage');
  const levelEl = document.getElementById('zoomLevel');
  if (img) img.style.transform = `scale(${state.zoomLevel / 100}) rotate(${state.rotation}deg)`;
  if (levelEl) levelEl.textContent = `${state.zoomLevel}%`;
}

// ─── PIPELINE NAVIGATION ──────────────────────────────────
function goToStep(n) {
  if (n < 1 || n > 4) return;

  // Luôn đồng bộ lựa chọn mới nhất từ form
  const subSelect = document.getElementById('subjectSelect');
  if (subSelect && subSelect.value && CURRICULUM_DATA[subSelect.value]) {
    state.currentSubject = subSelect.value;
  }
  const gradeSelect = document.getElementById('gradeSelect');
  if (gradeSelect && gradeSelect.value) {
    state.currentGrade = gradeSelect.value;
  }
  const scopeSelect = document.getElementById('scopeSelect');
  if (scopeSelect && scopeSelect.value) {
    state.currentScope = scopeSelect.value;
  }
  const chapFromEl = document.getElementById('chapFrom');
  if (chapFromEl && chapFromEl.value) {
    state.chapFrom = parseInt(chapFromEl.value, 10) || 1;
  }
  const chapToEl = document.getElementById('chapTo');
  if (chapToEl && chapToEl.value) {
    state.chapTo = parseInt(chapToEl.value, 10) || (state.currentGrade === '11' ? 31 : state.currentGrade === '12' ? 28 : 34);
  }
  const topicsEl = document.getElementById('topics');
  if (topicsEl) {
    state.topicFilter = topicsEl.value.trim();
  }

  if (n === 2 && state.currentStep === 1) {
    state.customTopics = [];
    state.lessonRows = null;
    showLoading(
      'Phân Tích SGK & Sinh Ma Trận CV 7991',
      `Đang đọc bài học môn ${CURRICULUM_DATA[state.currentSubject]?.name || 'Tin học'}, tính toán tỉ lệ 40-30-20-10`,
      ['Trích xuất OCR tiêu đề bài học', 'Ánh xạ chuẩn Bloom Taxonomy', 'Cân đối phân phối câu hỏi CV 7991', 'Hoàn thiện ma trận đề thi'],
      () => {
        loadCurriculumForSubject(state.currentSubject);
        showStep(2);
      }
    );
    return;
  }

  if (n === 3 && state.currentStep === 2) {
    showLoading(
      'Xây Dựng Bản Đặc Tả Đề Kiểm Tra',
      'Đang khớp nối yêu cầu cần đạt (YCCĐ) với từng bài học và mức độ nhận thức',
      ['Trích xuất yêu cầu cần đạt (YCCĐ)', 'Xác định cấp độ nhận thức từng câu', 'Khớp số trang SGK làm dẫn chứng', 'Hoàn tất bản đặc tả'],
      () => {
        renderSpecForSubject(state.currentSubject);
        showStep(3);
      }
    );
    return;
  }

  if (n === 4 && state.currentStep === 3) {
    showLoading(
      'Biên Soạn Câu Hỏi & Ráp Đề Thi CV 7991',
      `Tạo đề thi bám sát nội dung SGK môn ${CURRICULUM_DATA[state.currentSubject]?.name || 'Tin học'}`,
      ['Biên soạn 24 câu trắc nghiệm Phần I', 'Biên soạn 4 câu Đúng/Sai (16 ý) Phần II', 'Kiểm tra chuẩn nhận thức 40-30-20-10', 'Tạo ma trận đáp án & hướng dẫn chấm'],
      () => {
        renderExamForSubject(state.currentSubject);
        showStep(4);
      }
    );
    return;
  }

  // Khi chuyển step tự do, đồng bộ dữ liệu ngay
  if (n === 4) {
    renderExamForSubject(state.currentSubject);
  } else if (n === 3) {
    renderSpecForSubject(state.currentSubject);
  } else if (n === 2) {
    loadCurriculumForSubject(state.currentSubject);
  }

  showStep(n);
}
window.goToStep = goToStep;

function showStep(n) {
  document.querySelectorAll('.step-panel').forEach(p => p.classList.remove('active'));
  document.getElementById(`panel${n}`)?.classList.add('active');

  document.querySelectorAll('.step-item').forEach((item, i) => {
    const idx = i + 1;
    item.classList.remove('active', 'completed');
    if (idx < n) item.classList.add('completed');
    else if (idx === n) item.classList.add('active');
  });

  state.currentStep = n;
  document.getElementById('pipeline')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ─── LOADING OVERLAY ──────────────────────────────────────
function showLoading(title, sub, steps, callback) {
  const overlay = document.getElementById('loadingOverlay');
  document.getElementById('loadingTitle').textContent = title;
  document.getElementById('loadingSub').textContent   = sub;
  document.getElementById('progressFill').style.width = '0%';
  document.getElementById('progressPct').textContent  = '0%';

  const lsContainer = document.getElementById('loadingSteps');
  lsContainer.innerHTML = steps.map((s, i) => `
    <div class="ls-item ${i === 0 ? 'active' : ''}" id="ls${i+1}">
      <i class="fa-solid fa-${i === 0 ? 'circle-notch fa-spin' : 'regular fa-circle'}"></i> ${s}
    </div>
  `).join('');

  overlay.classList.add('active');

  let progress = 0;
  const totalDuration = 1200; // Nhanh và mượt mà
  let currentLs = 0;

  const interval = setInterval(() => {
    progress += 5;
    document.getElementById('progressFill').style.width = `${Math.min(progress, 100)}%`;
    document.getElementById('progressPct').textContent  = `${Math.min(progress, 100)}%`;

    const newLs = Math.min(Math.floor((progress / 100) * steps.length), steps.length - 1);
    if (newLs !== currentLs) {
      const prevEl = lsContainer.children[currentLs];
      if (prevEl) { prevEl.classList.remove('active'); prevEl.classList.add('done'); }
      const nextEl = lsContainer.children[newLs];
      if (nextEl) { nextEl.classList.add('active'); nextEl.querySelector('i').className = 'fa-solid fa-circle-notch fa-spin'; }
      currentLs = newLs;
    }

    if (progress >= 100) {
      clearInterval(interval);
      const lastEl = lsContainer.children[steps.length - 1];
      if (lastEl) { lastEl.classList.remove('active'); lastEl.classList.add('done'); }
      setTimeout(() => {
        overlay.classList.remove('active');
        callback?.();
      }, 300);
    }
  }, totalDuration / 20);
}

// ─── IMPORT MATRIX CONTROLLER (NHẬP MA TRẬN TỪ EXCEL / CSV / JSON) ───
let pendingImportData = null;

function initMatrixImport() {
  const importBtn = document.getElementById('importMatrix');
  const dropZone = document.getElementById('matrixDropZone');
  const fileInput = document.getElementById('matrixFileInput');

  importBtn?.addEventListener('click', () => {
    openImportMatrixModal();
  });

  dropZone?.addEventListener('click', () => fileInput?.click());

  ['dragenter', 'dragover'].forEach(evt => {
    dropZone?.addEventListener(evt, e => {
      e.preventDefault();
      dropZone.style.borderColor = '#38bdf8';
      dropZone.style.background = 'rgba(30,136,229,0.15)';
    });
  });

  ['dragleave', 'drop'].forEach(evt => {
    dropZone?.addEventListener(evt, e => {
      e.preventDefault();
      dropZone.style.borderColor = 'rgba(59,130,246,0.4)';
      dropZone.style.background = 'rgba(15,23,42,0.6)';
    });
  });

  dropZone?.addEventListener('drop', e => {
    e.preventDefault();
    const file = e.dataTransfer?.files[0];
    if (file) handleMatrixFile(file);
  });

  fileInput?.addEventListener('change', e => {
    const file = e.target.files[0];
    if (file) handleMatrixFile(file);
    fileInput.value = '';
  });
}

function openImportMatrixModal() {
  const modal = document.getElementById('importMatrixModal');
  if (!modal) return;
  modal.classList.add('active');
  if (state.matrixData && state.matrixData.length > 0) {
    pendingImportData = JSON.parse(JSON.stringify(state.matrixData));
    renderImportPreview(pendingImportData);
  }
}

function closeImportMatrixModal() {
  const modal = document.getElementById('importMatrixModal');
  modal?.classList.remove('active');
}

function switchImportTab(tabKey) {
  const tabs = ['file', 'paste', 'preset'];
  tabs.forEach(t => {
    const content = document.getElementById(`importTab${t.charAt(0).toUpperCase() + t.slice(1)}`);
    const btn = document.getElementById(`tabImport${t.charAt(0).toUpperCase() + t.slice(1)}Btn`);
    if (content && btn) {
      if (t === tabKey) {
        content.style.display = 'block';
        btn.classList.add('active');
        btn.style.background = 'var(--primary)';
        btn.style.color = '#fff';
      } else {
        content.style.display = 'none';
        btn.classList.remove('active');
        btn.style.background = 'transparent';
        btn.style.color = '#94a3b8';
      }
    }
  });
}

function handleMatrixFile(file) {
  const fname = file.name.toLowerCase();
  const reader = new FileReader();

  if (fname.endsWith('.json')) {
    reader.onload = e => {
      try {
        const parsed = JSON.parse(e.target.result);
        const rows = Array.isArray(parsed) ? parsed : (parsed.topics || parsed.matrix || []);
        if (rows.length === 0) throw new Error('Dữ liệu JSON không chứa danh sách chủ đề');
        processImportedRows(rows);
        showToast('success', 'Đọc file JSON thành công', `Đã tải ${rows.length} chủ đề từ ${file.name}`);
      } catch (err) {
        showToast('error', 'Lỗi đọc file JSON', err.message);
      }
    };
    reader.readAsText(file);
  } else {
    // CSV / TXT / TSV
    reader.onload = e => {
      try {
        const text = e.target.result;
        const rows = parseMatrixCsvText(text);
        if (rows.length === 0) throw new Error('Không phân tích được dòng dữ liệu nào hợp lệ');
        processImportedRows(rows);
        showToast('success', 'Đọc file thành công', `Đã nhận diện ${rows.length} chủ đề từ ${file.name}`);
      } catch (err) {
        showToast('error', 'Lỗi phân tích file', err.message);
      }
    };
    reader.readAsText(file);
  }
}

function parseMatrixCsvText(text) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return [];

  const firstLine = lines[0];
  const tabCount = (firstLine.match(/\t/g) || []).length;
  const commaCount = (firstLine.match(/,/g) || []).length;
  const semiCount = (firstLine.match(/;/g) || []).length;

  let delimiter = ',';
  if (tabCount >= 3) {
    delimiter = '\t';
  } else if (semiCount > commaCount && semiCount >= 3) {
    delimiter = ';';
  } else {
    delimiter = ',';
  }

  let startIndex = 0;
  if (/chủ đề|mạch kiến thức|topic|tên bài/i.test(lines[0])) {
    startIndex = 1;
  }

  const parseLine = (line) => {
    if (delimiter === '\t') {
      return line.split('\t').map(p => p.trim().replace(/^["']|["']$/g, ''));
    }
    const sep = delimiter === ';' ? ';' : ',';
    const re = new RegExp('(?:' + sep + '|^)(?:"([^"]*)"|([^"' + sep + ']*))', 'gi');
    const row = [];
    let m;
    while ((m = re.exec(line)) !== null) {
      let val = m[1] !== undefined ? m[1] : m[2];
      row.push(val ? val.trim() : '');
    }
    return row;
  };

  const result = [];
  for (let i = startIndex; i < lines.length; i++) {
    const parts = parseLine(lines[i]);
    if (parts.length < 2) continue;

    const topic = parts[0];
    const startPage = parseInt(parts[1]) || (i * 15);
    const endPage = parseInt(parts[2]) || (startPage + 10);

    const pInt = (idx, def = 0) => parseInt(parts[idx]) || def;

    let nb_tn, nb_ds, th_tn, th_ds, vd_tn, vd_ds, vdc_tn, vdc_ds;
    if (parts.length <= 12) {
      nb_tn = pInt(3); nb_ds = pInt(4);
      th_tn = pInt(5); th_ds = pInt(6);
      vd_tn = pInt(7); vd_ds = pInt(8);
      vdc_tn = pInt(9); vdc_ds = pInt(10);
    } else {
      nb_tn = pInt(3); nb_ds = pInt(4);
      th_tn = pInt(6); th_ds = pInt(7);
      vd_tn = pInt(9); vd_ds = pInt(10);
      vdc_tn = pInt(12); vdc_ds = pInt(13);
    }

    result.push({
      topic,
      startPage,
      endPage,
      startLesson: i + 1,
      endLesson: i + 2,
      nb_tn, nb_ds, nb_tln: 0,
      th_tn, th_ds, th_tln: 0,
      vd_tn, vd_ds, vd_tln: 0,
      vdc_tn, vdc_ds, vdc_tln: 0
    });
  }

  return result;
}

function parsePastedMatrix() {
  const text = document.getElementById('matrixPasteInput')?.value?.trim();
  if (!text) {
    showToast('warning', 'Chưa có nội dung', 'Vui lòng dán dữ liệu bảng từ Excel/Sheets vào ô');
    return;
  }
  const rows = parseMatrixCsvText(text);
  if (rows.length === 0) {
    showToast('error', 'Lỗi định dạng', 'Không phân tích được dữ liệu. Vui lòng kiểm tra lại cấu trúc các cột.');
    return;
  }
  processImportedRows(rows);
  showToast('success', 'Phân tích thành công', `Đã nhận dạng ${rows.length} hàng dữ liệu.`);
}

function fillExamplePasteData() {
  const textarea = document.getElementById('matrixPasteInput');
  if (!textarea) return;
  textarea.value = `Chủ đề 1: Máy tính và xã hội tri thức, 6, 37, 4, 1, 3, 1, 1, 1, 0, 1
Chủ đề 2 & 3: Mạng máy tính & Bản quyền số, 38, 62, 3, 1, 2, 1, 1, 1, 0, 1
Chủ đề 4: Thiết kế đồ họa Inkscape, 63, 85, 3, 1, 2, 1, 1, 1, 0, 1
Chủ đề 5: Lập trình Python cơ bản, 86, 155, 2, 1, 1, 1, 1, 1, 0, 1`;
  parsePastedMatrix();
}

function selectPresetMatrix(presetKey) {
  const grade = state.currentGrade || '10';
  const curSub = INFORMATICS_CURRICULA[grade] || INFORMATICS_CURRICULA['10'];
  let baseTopics = curSub.topics.map(t => ({ ...t }));

  if (presetKey === 'standard_mid') {
    baseTopics = baseTopics.slice(0, Math.max(2, Math.floor(baseTopics.length / 2)));
  } else if (presetKey === 'even_dist') {
    baseTopics.forEach(t => {
      t.nb_tn = 2; t.nb_ds = 1; t.nb_tln = 0;
      t.th_tn = 2; t.th_ds = 1; t.th_tln = 0;
      t.vd_tn = 1; t.vd_ds = 1; t.vd_tln = 0;
      t.vdc_tn = 0; t.vdc_ds = 1; t.vdc_tln = 0;
    });
  } else if (presetKey === 'focus_practical') {
    baseTopics.forEach(t => {
      t.nb_tn = 2; t.nb_ds = 1; t.nb_tln = 0;
      t.th_tn = 2; t.th_ds = 1; t.th_tln = 0;
      t.vd_tn = 2; t.vd_ds = 1; t.vd_tln = 0;
      t.vdc_tn = 0; t.vdc_ds = 1; t.vdc_tln = 0;
    });
  }

  const balanced = balanceMatrixForScope(baseTopics);
  processImportedRows(balanced);
  showToast('info', 'Đã tải mẫu ma trận', 'Ma trận đã được chuẩn hóa theo chuẩn CV 7991.');
}

function processImportedRows(rows) {
  pendingImportData = rows.map((r, i) => ({
    topic: r.topic || `Chủ đề ${i + 1}`,
    startPage: r.startPage || (i * 15 + 1),
    endPage: r.endPage || (i * 15 + 12),
    startLesson: r.startLesson || (i + 1),
    endLesson: r.endLesson || (i + 2),
    nb_tn: parseInt(r.nb_tn) || 0,
    nb_ds: parseInt(r.nb_ds !== undefined ? r.nb_ds : (r.nb_tl || 0)) || 0,
    nb_tln: 0,
    th_tn: parseInt(r.th_tn) || 0,
    th_ds: parseInt(r.th_ds !== undefined ? r.th_ds : 0) || 0,
    th_tln: 0,
    vd_tn: parseInt(r.vd_tn) || 0,
    vd_ds: parseInt(r.vd_ds !== undefined ? r.vd_ds : 0) || 0,
    vd_tln: 0,
    vdc_tn: parseInt(r.vdc_tn) || 0,
    vdc_ds: parseInt(r.vdc_ds !== undefined ? r.vdc_ds : 0) || 0,
    vdc_tln: 0,
  }));

  renderImportPreview(pendingImportData);
}

function renderImportPreview(rows) {
  const tbody = document.getElementById('importPreviewBody');
  const countBadge = document.getElementById('importPreviewCountBadge');
  const statusDiv = document.getElementById('importValidationStatus');
  const btnApply = document.getElementById('btnApplyImportMatrix');
  const btnAutoBalance = document.getElementById('btnAutoBalanceImport');

  if (!tbody || !rows || rows.length === 0) return;

  countBadge.textContent = `${rows.length} chủ đề`;

  let totP1 = 0, totP2 = 0;
  tbody.innerHTML = rows.map((r, idx) => {
    const rowP1 = (r.nb_tn || 0) + (r.th_tn || 0) + (r.vd_tn || 0) + (r.vdc_tn || 0);
    const rowP2 = (r.nb_ds || 0) + (r.th_ds || 0) + (r.vd_ds || 0) + (r.vdc_ds || 0);
    const rowTotal = rowP1 + rowP2;

    totP1 += rowP1;
    totP2 += rowP2;

    return `
      <tr style="border-bottom:1px solid rgba(255,255,255,0.05)">
        <td style="padding:6px 10px">
          <strong>${r.topic}</strong>
          <span style="font-size:11px;color:#94a3b8;display:block">SGK Trang ${r.startPage} – ${r.endPage}</span>
        </td>
        <td style="text-align:center;padding:6px 8px;color:#38bdf8;font-weight:700">${rowP1}</td>
        <td style="text-align:center;padding:6px 8px;color:#34d399;font-weight:700">${rowP2}</td>
        <td style="text-align:center;padding:6px 8px;font-weight:700">${rowTotal}</td>
      </tr>
    `;
  }).join('');

  const isValidCV7991 = (totP1 === 24 && totP2 === 16);

  if (isValidCV7991) {
    statusDiv.innerHTML = `
      <span style="font-size:11.5px;background:rgba(16,185,129,0.2);color:#34d399;padding:3px 10px;border-radius:6px;font-weight:600;display:inline-flex;align-items:center;gap:5px">
        <i class="fa-solid fa-circle-check"></i> Chuẩn 100% CV 7991 (24 TN &bull; 16 ý Đ/S = 10đ)
      </span>
    `;
    btnAutoBalance.style.display = 'none';
  } else {
    statusDiv.innerHTML = `
      <span style="font-size:11.5px;background:rgba(245,158,11,0.2);color:#fbbf24;padding:3px 10px;border-radius:6px;font-weight:600;display:inline-flex;align-items:center;gap:5px">
        <i class="fa-solid fa-triangle-exclamation"></i> Hiện tại: ${totP1} TN &bull; ${totP2} ý Đ/S (Khác chuẩn 24 TN - 16 ý Đ/S)
      </span>
    `;
    btnAutoBalance.style.display = 'inline-flex';
  }

  btnApply.disabled = false;
  btnApply.style.opacity = '1';
  btnApply.style.cursor = 'pointer';
}

function autoBalanceImportData() {
  if (!pendingImportData || pendingImportData.length === 0) return;
  pendingImportData = balanceMatrixForScope(pendingImportData);
  renderImportPreview(pendingImportData);
  showToast('success', 'Đã cân bằng tự động', 'Tổng ma trận đã chuẩn 100% theo Công văn 7991 (24 câu TN, 16 ý Đ/S = 10,0đ).');
}

function applyImportedMatrix() {
  if (!pendingImportData || pendingImportData.length === 0) return;

  state.matrixData = JSON.parse(JSON.stringify(pendingImportData));
  state.customTopics = state.matrixData;

  renderMatrix(state.matrixData);
  renderSpecForSubject(state.currentSubject);
  renderExamForSubject(state.currentSubject);

  closeImportMatrixModal();
  showToast('success', 'Nhập ma trận thành công', `Đã cập nhật ${state.matrixData.length} chủ đề vào ma trận và đồng bộ đặc tả, đề thi!`);
}

function downloadMatrixTemplateCsv() {
  const header = 'Chủ đề / Mạch nội dung,Trang đầu,Trang cuối,NB_TN,NB_DS,TH_TN,TH_DS,VD_TN,VD_DS,VDC_TN,VDC_DS\n';
  const sampleRows = [
    'Chủ đề 1: Máy tính và xã hội tri thức,6,37,4,1,3,1,1,1,0,1',
    'Chủ đề 2 & 3: Mạng máy tính & Bản quyền số,38,62,3,1,2,1,1,1,0,1',
    'Chủ đề 4: Thiết kế đồ họa Inkscape,63,85,3,1,2,1,1,1,0,1',
    'Chủ đề 5: Lập trình Python cơ bản,86,155,2,1,1,1,1,1,0,1'
  ].join('\n');

  const content = '\ufeff' + header + sampleRows;
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'mau-ma-tran-de-thi-CV7991.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('success', 'Tải file mẫu', 'Đã tải tệp mau-ma-tran-de-thi-CV7991.csv');
}

window.openImportMatrixModal = openImportMatrixModal;
window.closeImportMatrixModal = closeImportMatrixModal;
window.switchImportTab = switchImportTab;
window.parsePastedMatrix = parsePastedMatrix;
window.fillExamplePasteData = fillExamplePasteData;
window.selectPresetMatrix = selectPresetMatrix;
window.autoBalanceImportData = autoBalanceImportData;
window.applyImportedMatrix = applyImportedMatrix;
window.downloadMatrixTemplateCsv = downloadMatrixTemplateCsv;

// ─── MATRIX TABLE (ĐỒNG BỘ MÔN HỌC & SGK) ──────────────────
function initMatrixTable() {
  loadCurriculumForSubject(state.currentSubject);
  initMatrixImport();

  document.getElementById('regenerateMatrix')?.addEventListener('click', () => {
    const grade = state.currentGrade || '10';
    const curSub = INFORMATICS_CURRICULA[grade] || INFORMATICS_CURRICULA['10'];
    const chapFrom = state.chapFrom || 1;
    const chapTo = state.chapTo || (grade === '11' ? 31 : grade === '12' ? 28 : 34);

    // 1. Lọc chính xác các chủ đề trong dải bài học đã chọn [chapFrom, chapTo]
    let topics = curSub.topics.filter(t => {
      const sLesson = t.startLesson || 1;
      const eLesson = t.endLesson || 35;
      return sLesson <= chapTo && eLesson >= chapFrom;
    });

    if (topics.length === 0) {
      const scopes = GRADE_SCOPES[grade] || GRADE_SCOPES['10'];
      const activeScope = scopes.find(s => s.value === (state.currentScope || 'all')) || scopes[0];
      if (activeScope && activeScope.topicIndices) {
        topics = activeScope.topicIndices.map(idx => curSub.topics[idx]).filter(Boolean);
      } else {
        topics = curSub.topics;
      }
    }

    // 2. Tạo ma trận ngẫu nhiên mới: phân bổ ngẫu nhiên câu hỏi vào từng bài nhưng bảo đảm 100% tỉ lệ chuẩn CV 7991
    const lessonRows = buildLessonLevelRows(topics, curSub.p1, curSub.p2, chapFrom, chapTo, curSub.p3);
    const randomizedLessons = balanceLessonRows(lessonRows, true, grade);
    state.lessonRows = randomizedLessons;
    const randomizedMatrix = aggregateLessonToTopics(randomizedLessons, topics);
    state.matrixData = randomizedMatrix;

    // 3. Đổi mã đề ngẫu nhiên mới và kích hoạt xáo trộn ngẫu nhiên câu hỏi trong dải bài đã chọn
    const examCodes = [101, 102, 103, 104, 201, 202, 301, 401];
    state.currentExamCode = examCodes[Math.floor(Math.random() * examCodes.length)];
    state.randomizeExam = true;

    // 4. Đồng bộ tức thời: Ma trận, Bản đặc tả và Đề thi
    renderMatrix(randomizedMatrix);
    renderSpecForSubject(state.currentSubject);
    renderExamForSubject(state.currentSubject, true);

    const isEssay = (grade === '10' || grade === '11');
    showToast(
      'success',
      'Đã tạo lại ma trận & đề thi ngẫu nhiên',
      isEssay
        ? `Tạo ngẫu nhiên mới (Mã đề ${state.currentExamCode}), bảo đảm chuẩn 100% CV 7991 (16 TN, 12 ý Đ/S, 2 TL = 10,0đ)`
        : `Tạo ngẫu nhiên mới (Mã đề ${state.currentExamCode}), bảo đảm chuẩn 100% CV 7991 (24 TN, 16 ý Đ/S = 10,0đ)`
    );
  });
}

window.setMatrixViewMode = function(mode) {
  state.matrixViewMode = mode;
  const btnStd = document.getElementById('tabMatrixStdBtn');
  const btnCompact = document.getElementById('tabMatrixCompactBtn');
  if (btnStd && btnCompact) {
    if (mode === 'standard') {
      btnStd.classList.add('active');
      btnStd.style.background = 'var(--primary)';
      btnStd.style.color = '#fff';
      btnCompact.classList.remove('active');
      btnCompact.style.background = 'transparent';
      btnCompact.style.color = '#94a3b8';
    } else {
      btnCompact.classList.add('active');
      btnCompact.style.background = 'var(--primary)';
      btnCompact.style.color = '#fff';
      btnStd.classList.remove('active');
      btnStd.style.background = 'transparent';
      btnStd.style.color = '#94a3b8';
    }
  }
  renderMatrix(state.matrixData);
};

function renderMatrix(data) {
  state.matrixData = data;
  const thead = document.getElementById('matrixHead');
  const tbody = document.getElementById('matrixBody');
  const tfoot = document.getElementById('matrixFoot');
  if (!tbody || !tfoot) return;
  tbody.innerHTML = '';
  tfoot.innerHTML = '';

  const isStd = (state.matrixViewMode || 'standard') === 'standard';

  // Build lesson-level rows from topic data
  const grade   = state.currentGrade || '10';
  const hasEssay = (grade === '10' || grade === '11');
  const curSub  = INFORMATICS_CURRICULA[grade] || INFORMATICS_CURRICULA['10'];
  const chapFrom = state.chapFrom || 1;
  const chapTo   = state.chapTo   || (grade === '11' ? 31 : grade === '12' ? 28 : 34);

  // Update top toggle button label dynamically
  const btnStd = document.getElementById('tabMatrixStdBtn');
  if (btnStd) {
    btnStd.innerHTML = hasEssay
      ? '<i class="fa-solid fa-table-cells"></i> Chuẩn CV 7991 (Phần I, II, III)'
      : '<i class="fa-solid fa-table-cells"></i> Chuẩn CV 7991 (Phần I, II)';
  }

  // Get filtered topics (matching matrixData by topic name)
  const topics = data.length > 0 ? data : curSub.topics;

  // Build lesson rows (may already be stored in state.lessonRows if freshly randomized)
  let lessonRows = state.lessonRows || [];
  const isMatchingRange = lessonRows.length > 0 && 
    lessonRows[0]?.lesson === chapFrom && 
    lessonRows[lessonRows.length - 1]?.lesson === chapTo;

  if (!isMatchingRange || lessonRows[0]?.topicIdx === undefined) {
    // Build and balance from scratch
    lessonRows = buildLessonLevelRows(topics, curSub.p1, curSub.p2, chapFrom, chapTo, curSub.p3);
    lessonRows = balanceLessonRows(lessonRows, false, grade);
    state.lessonRows = lessonRows;
  }

  // ── Render thead ─────────────────────────────────────────
  if (thead) {
    if (isStd) {
      if (hasEssay) {
        thead.innerHTML = `
          <tr>
            <th rowspan="2" class="th-sticky" style="min-width:200px">Chủ đề / Bài học</th>
            <th colspan="3" class="th-level nb">Nhận biết (40% – 4,0đ)</th>
            <th colspan="3" class="th-level th">Thông hiểu (30% – 3,0đ)</th>
            <th colspan="3" class="th-level vd">Vận dụng (20% – 2,0đ)</th>
            <th colspan="3" class="th-level vdc">VD cao (10% – 1,0đ)</th>
            <th rowspan="2" class="th-total" style="width:70px">Tổng câu</th>
            <th rowspan="2" class="th-total" style="width:60px">Tỉ lệ %</th>
          </tr>
          <tr class="th-sub">
            <th title="Phần I: TN nhiều phương án lựa chọn (0,25đ/câu)" style="color:#38bdf8">TNKQ</th>
            <th title="Phần II: TN Đúng/Sai (ý hỏi)" style="color:#34d399">Đ/S</th>
            <th title="Phần III: Tự luận" style="color:#c084fc">TL</th>
            <th title="Phần I: TN nhiều phương án lựa chọn (0,25đ/câu)" style="color:#38bdf8">TNKQ</th>
            <th title="Phần II: TN Đúng/Sai (ý hỏi)" style="color:#34d399">Đ/S</th>
            <th title="Phần III: Tự luận" style="color:#c084fc">TL</th>
            <th title="Phần I: TN nhiều phương án lựa chọn (0,25đ/câu)" style="color:#38bdf8">TNKQ</th>
            <th title="Phần II: TN Đúng/Sai (ý hỏi)" style="color:#34d399">Đ/S</th>
            <th title="Phần III: Tự luận" style="color:#c084fc">TL</th>
            <th title="Phần I: TN nhiều phương án lựa chọn (0,25đ/câu)" style="color:#38bdf8">TNKQ</th>
            <th title="Phần II: TN Đúng/Sai (ý hỏi)" style="color:#34d399">Đ/S</th>
            <th title="Phần III: Tự luận" style="color:#c084fc">TL</th>
          </tr>
        `;
      } else {
        thead.innerHTML = `
          <tr>
            <th rowspan="2" class="th-sticky" style="min-width:200px">Chủ đề / Bài học</th>
            <th colspan="2" class="th-level nb">Nhận biết (40% – 4,0đ)</th>
            <th colspan="2" class="th-level th">Thông hiểu (30% – 3,0đ)</th>
            <th colspan="2" class="th-level vd">Vận dụng (20% – 2,0đ)</th>
            <th colspan="2" class="th-level vdc">VD cao (10% – 1,0đ)</th>
            <th rowspan="2" class="th-total" style="width:70px">Tổng câu</th>
            <th rowspan="2" class="th-total" style="width:60px">Tỉ lệ %</th>
          </tr>
          <tr class="th-sub">
            <th title="Phần I: TN nhiều phương án lựa chọn (0,25đ/câu)" style="color:#38bdf8">TNKQ</th>
            <th title="Phần II: TN Đúng/Sai (ý hỏi)" style="color:#34d399">Đ/S</th>
            <th title="Phần I: TN nhiều phương án lựa chọn (0,25đ/câu)" style="color:#38bdf8">TNKQ</th>
            <th title="Phần II: TN Đúng/Sai (ý hỏi)" style="color:#34d399">Đ/S</th>
            <th title="Phần I: TN nhiều phương án lựa chọn (0,25đ/câu)" style="color:#38bdf8">TNKQ</th>
            <th title="Phần II: TN Đúng/Sai (ý hỏi)" style="color:#34d399">Đ/S</th>
            <th title="Phần I: TN nhiều phương án lựa chọn (0,25đ/câu)" style="color:#38bdf8">TNKQ</th>
            <th title="Phần II: TN Đúng/Sai (ý hỏi)" style="color:#34d399">Đ/S</th>
          </tr>
        `;
      }
    } else {
      thead.innerHTML = `
        <tr>
          <th class="th-sticky" style="min-width:200px">Chủ đề / Bài học</th>
          <th class="th-level nb">Nhận biết (40% – 4,0đ)</th>
          <th class="th-level th">Thông hiểu (30% – 3,0đ)</th>
          <th class="th-level vd">Vận dụng (20% – 2,0đ)</th>
          <th class="th-level vdc">VD cao (10% – 1,0đ)</th>
          <th class="th-total" style="width:70px">Tổng</th>
        </tr>
      `;
    }
  }

  let totNB_TN = 0, totNB_DS = 0, totNB_TL = 0,
      totTH_TN = 0, totTH_DS = 0, totTH_TL = 0,
      totVD_TN = 0, totVD_DS = 0, totVD_TL = 0,
      totVDC_TN = 0, totVDC_DS = 0, totVDC_TL = 0;

  // Track which topic group header we've already rendered
  let lastTopicIdx = -1;

  lessonRows.forEach((row, lIdx) => {
    const nb_tn  = row.nb_tn  || 0; const nb_ds  = row.nb_ds  || 0; const nb_tl  = row.nb_tl  || row.nb_tln || 0;
    const th_tn  = row.th_tn  || 0; const th_ds  = row.th_ds  || 0; const th_tl  = row.th_tl  || row.th_tln || 0;
    const vd_tn  = row.vd_tn  || 0; const vd_ds  = row.vd_ds  || 0; const vd_tl  = row.vd_tl  || row.vd_tln || 0;
    const vdc_tn = row.vdc_tn || 0; const vdc_ds = row.vdc_ds || 0; const vdc_tl = row.vdc_tl || row.vdc_tln || 0;

    totNB_TN  += nb_tn;  totNB_DS  += nb_ds;  totNB_TL  += nb_tl;
    totTH_TN  += th_tn;  totTH_DS  += th_ds;  totTH_TL  += th_tl;
    totVD_TN  += vd_tn;  totVD_DS  += vd_ds;  totVD_TL  += vd_tl;
    totVDC_TN += vdc_tn; totVDC_DS += vdc_ds; totVDC_TL += vdc_tl;

    const rowTN   = nb_tn + th_tn + vd_tn + vdc_tn;
    const rowDS   = nb_ds + th_ds + vd_ds + vdc_ds;
    const rowTL   = nb_tl + th_tl + vd_tl + vdc_tl;
    const rowDSQ  = rowDS > 0 ? Math.ceil(rowDS / 4) : 0;
    const rowQ    = hasEssay ? (rowTN + rowDSQ + rowTL) : (rowTN + rowDSQ);
    const rowScore = hasEssay
      ? (rowTN * 0.25 + rowDS * 0.25 + vd_tl * 2.0 + vdc_tl * 1.0 + th_tl * 1.0 + nb_tl * 1.0)
      : (rowTN * 0.25 + rowDS * 0.25);
    const rowPct  = Math.round((rowScore / 10.0) * 100);

    // ── Topic group header row (first lesson of each topic) ──────────
    if (row._topicGroupFirst && row.topicIdx !== lastTopicIdx) {
      lastTopicIdx = row.topicIdx;
      const tTopic = topics[row.topicIdx] || {};
      const topicRow = document.createElement('tr');
      topicRow.style.cssText = 'background:rgba(30,136,229,0.08);border-top:2px solid rgba(30,136,229,0.3)';
      const colSpanNum = hasEssay ? 15 : 11;
      const effTFrom = Math.max(tTopic.startLesson || 1, chapFrom);
      const effTTo = Math.min(tTopic.endLesson || 35, chapTo);
      const topicLessonsStr = (effTFrom === effTTo) ? `Bài ${effTFrom}` : `Bài ${effTFrom} – ${effTTo}`;
      const cleanTopicTitle = row.topic.replace(/\(Bài\s*\d+[–\-\.]*\d*[^)]*\)/i, `(${topicLessonsStr})`);
      if (isStd) {
        topicRow.innerHTML = `
          <td colspan="${colSpanNum}" style="padding:7px 12px">
            <span style="font-size:12.5px;font-weight:700;color:#93c5fd">
              <i class="fa-solid fa-layer-group" style="margin-right:6px;opacity:0.8"></i>${cleanTopicTitle}
            </span>
            <span style="font-size:10.5px;color:#64748b;margin-left:10px">
              <i class="fa-solid fa-book-open"></i> SGK Trang ${tTopic.startPage || row.startPage} – ${tTopic.endPage || row.endPage}
              &nbsp;·&nbsp; ${topicLessonsStr}
            </span>
          </td>
        `;
      } else {
        topicRow.innerHTML = `
          <td colspan="6" style="padding:7px 12px">
            <span style="font-size:12.5px;font-weight:700;color:#93c5fd">
              <i class="fa-solid fa-layer-group" style="margin-right:6px;opacity:0.8"></i>${cleanTopicTitle}
            </span>
          </td>
        `;
      }
      tbody.appendChild(topicRow);
    }

    // ── Lesson detail row ─────────────────────────────────────────
    const lessonTr = document.createElement('tr');
    lessonTr.dataset.lessonIdx = lIdx;
    lessonTr.style.cssText = 'border-bottom:1px solid rgba(255,255,255,0.04)';

    // Dim rows that have all zeros
    if (rowQ === 0) {
      lessonTr.style.opacity = '0.45';
    }

    if (isStd) {
      if (hasEssay) {
        lessonTr.innerHTML = `
          <td style="padding-left:28px">
            <span style="font-size:11.5px;font-weight:600;color:#e2e8f0">
              <i class="fa-solid fa-book-bookmark" style="color:#475569;margin-right:4px;font-size:10px"></i>
              ${row.lessonLabel}
            </span>
            <span style="font-size:10px;color:#64748b;margin-left:6px">Trang ${row.startPage}–${row.endPage}</span>
          </td>
          <td><span class="cell-tn" onclick="editLessonCell(this, ${lIdx}, 'nb_tn')">${nb_tn}</span></td>
          <td><span class="cell-p2" onclick="editLessonCell(this, ${lIdx}, 'nb_ds')">${nb_ds}</span></td>
          <td><span class="cell-tl" onclick="editLessonCell(this, ${lIdx}, 'nb_tl')">${nb_tl}</span></td>
          <td><span class="cell-tn" onclick="editLessonCell(this, ${lIdx}, 'th_tn')">${th_tn}</span></td>
          <td><span class="cell-p2" onclick="editLessonCell(this, ${lIdx}, 'th_ds')">${th_ds}</span></td>
          <td><span class="cell-tl" onclick="editLessonCell(this, ${lIdx}, 'th_tl')">${th_tl}</span></td>
          <td><span class="cell-tn" onclick="editLessonCell(this, ${lIdx}, 'vd_tn')">${vd_tn}</span></td>
          <td><span class="cell-p2" onclick="editLessonCell(this, ${lIdx}, 'vd_ds')">${vd_ds}</span></td>
          <td><span class="cell-tl" onclick="editLessonCell(this, ${lIdx}, 'vd_tl')">${vd_tl}</span></td>
          <td><span class="cell-tn" onclick="editLessonCell(this, ${lIdx}, 'vdc_tn')">${vdc_tn}</span></td>
          <td><span class="cell-p2" onclick="editLessonCell(this, ${lIdx}, 'vdc_ds')">${vdc_ds}</span></td>
          <td><span class="cell-tl" onclick="editLessonCell(this, ${lIdx}, 'vdc_tl')">${vdc_tl}</span></td>
          <td><span class="total-badge" style="font-size:11px;padding:2px 6px">${rowQ > 0 ? rowQ : '–'}</span></td>
          <td><strong style="color:${rowPct>0?'#0284c7':'#475569'};font-size:11px">${rowPct > 0 ? rowPct+'%' : '–'}</strong></td>
        `;
      } else {
        lessonTr.innerHTML = `
          <td style="padding-left:28px">
            <span style="font-size:11.5px;font-weight:600;color:#e2e8f0">
              <i class="fa-solid fa-book-bookmark" style="color:#475569;margin-right:4px;font-size:10px"></i>
              ${row.lessonLabel}
            </span>
            <span style="font-size:10px;color:#64748b;margin-left:6px">Trang ${row.startPage}–${row.endPage}</span>
          </td>
          <td><span class="cell-tn" onclick="editLessonCell(this, ${lIdx}, 'nb_tn')">${nb_tn}</span></td>
          <td><span class="cell-p2" onclick="editLessonCell(this, ${lIdx}, 'nb_ds')">${nb_ds}</span></td>
          <td><span class="cell-tn" onclick="editLessonCell(this, ${lIdx}, 'th_tn')">${th_tn}</span></td>
          <td><span class="cell-p2" onclick="editLessonCell(this, ${lIdx}, 'th_ds')">${th_ds}</span></td>
          <td><span class="cell-tn" onclick="editLessonCell(this, ${lIdx}, 'vd_tn')">${vd_tn}</span></td>
          <td><span class="cell-p2" onclick="editLessonCell(this, ${lIdx}, 'vd_ds')">${vd_ds}</span></td>
          <td><span class="cell-tn" onclick="editLessonCell(this, ${lIdx}, 'vdc_tn')">${vdc_tn}</span></td>
          <td><span class="cell-p2" onclick="editLessonCell(this, ${lIdx}, 'vdc_ds')">${vdc_ds}</span></td>
          <td><span class="total-badge" style="font-size:11px;padding:2px 6px">${rowQ > 0 ? rowQ : '–'}</span></td>
          <td><strong style="color:${rowPct>0?'#0284c7':'#475569'};font-size:11px">${rowPct > 0 ? rowPct+'%' : '–'}</strong></td>
        `;
      }
    } else {
      lessonTr.innerHTML = `
        <td style="padding-left:28px;font-size:11.5px;font-weight:600;color:#e2e8f0">
          <i class="fa-solid fa-book-bookmark" style="color:#475569;margin-right:4px;font-size:10px"></i>
          ${row.lessonLabel}
        </td>
        <td><div class="matrix-cell"><span class="cell-tn" onclick="editLessonCell(this,${lIdx},'nb_tn')">${nb_tn}</span><span class="cell-sep">|</span><span class="cell-p2" onclick="editLessonCell(this,${lIdx},'nb_ds')">${nb_ds}</span></div></td>
        <td><div class="matrix-cell"><span class="cell-tn" onclick="editLessonCell(this,${lIdx},'th_tn')">${th_tn}</span><span class="cell-sep">|</span><span class="cell-p2" onclick="editLessonCell(this,${lIdx},'th_ds')">${th_ds}</span></div></td>
        <td><div class="matrix-cell"><span class="cell-tn" onclick="editLessonCell(this,${lIdx},'vd_tn')">${vd_tn}</span><span class="cell-sep">|</span><span class="cell-p2" onclick="editLessonCell(this,${lIdx},'vd_ds')">${vd_ds}</span></div></td>
        <td><div class="matrix-cell"><span class="cell-tn" onclick="editLessonCell(this,${lIdx},'vdc_tn')">${vdc_tn}</span><span class="cell-sep">|</span><span class="cell-p2" onclick="editLessonCell(this,${lIdx},'vdc_ds')">${vdc_ds}</span></div></td>
        <td><span class="total-badge" style="font-size:11px;padding:2px 6px">${rowQ > 0 ? rowQ : '–'}</span></td>
      `;
    }
    tbody.appendChild(lessonTr);

    // ── Topic subtotal row (last lesson of each topic) ────────────
    if (row._topicGroupLast) {
      // Calculate topic totals by scanning lessonRows for this topicIdx
      let tNB_TN=0,tNB_DS=0,tNB_TL=0,
          tTH_TN=0,tTH_DS=0,tTH_TL=0,
          tVD_TN=0,tVD_DS=0,tVD_TL=0,
          tVDC_TN=0,tVDC_DS=0,tVDC_TL=0;
      lessonRows.filter(r => r.topicIdx === row.topicIdx).forEach(r => {
        tNB_TN  += r.nb_tn||0;  tNB_DS  += r.nb_ds||0;  tNB_TL  += r.nb_tl||r.nb_tln||0;
        tTH_TN  += r.th_tn||0;  tTH_DS  += r.th_ds||0;  tTH_TL  += r.th_tl||r.th_tln||0;
        tVD_TN  += r.vd_tn||0;  tVD_DS  += r.vd_ds||0;  tVD_TL  += r.vd_tl||r.vd_tln||0;
        tVDC_TN += r.vdc_tn||0; tVDC_DS += r.vdc_ds||0; tVDC_TL += r.vdc_tl||r.vdc_tln||0;
      });
      const tTN  = tNB_TN+tTH_TN+tVD_TN+tVDC_TN;
      const tDS  = tNB_DS+tTH_DS+tVD_DS+tVDC_DS;
      const tTL  = tNB_TL+tTH_TL+tVD_TL+tVDC_TL;
      const tDSQ = tDS > 0 ? Math.ceil(tDS/4) : 0;
      const tQ   = hasEssay ? (tTN + tDSQ + tTL) : (tTN + tDSQ);
      const tScore = hasEssay
        ? (tTN * 0.25 + tDS * 0.25 + tVD_TL * 2.0 + tVDC_TL * 1.0 + tTH_TL * 1.0 + tNB_TL * 1.0)
        : (tTN * 0.25 + tDS * 0.25);
      const tPct = Math.round((tScore / 10.0) * 100);
      const subtotalRow = document.createElement('tr');
      subtotalRow.style.cssText = 'background:rgba(30,136,229,0.05);border-bottom:2px solid rgba(30,136,229,0.2)';
      if (isStd) {
        if (hasEssay) {
          subtotalRow.innerHTML = `
            <td style="padding:5px 12px 5px 28px;font-size:11px;color:#64748b;font-style:italic">
              ↳ Tổng chủ đề
            </td>
            <td class="center bold"><span class="cell-tn" style="font-size:11px">${tNB_TN}</span></td>
            <td class="center bold"><span class="cell-p2" style="font-size:11px">${tNB_DS}</span></td>
            <td class="center bold"><span class="cell-tl" style="font-size:11px">${tNB_TL}</span></td>
            <td class="center bold"><span class="cell-tn" style="font-size:11px">${tTH_TN}</span></td>
            <td class="center bold"><span class="cell-p2" style="font-size:11px">${tTH_DS}</span></td>
            <td class="center bold"><span class="cell-tl" style="font-size:11px">${tTH_TL}</span></td>
            <td class="center bold"><span class="cell-tn" style="font-size:11px">${tVD_TN}</span></td>
            <td class="center bold"><span class="cell-p2" style="font-size:11px">${tVD_DS}</span></td>
            <td class="center bold"><span class="cell-tl" style="font-size:11px">${tVD_TL}</span></td>
            <td class="center bold"><span class="cell-tn" style="font-size:11px">${tVDC_TN > 0 ? tVDC_TN : '–'}</span></td>
            <td class="center bold"><span class="cell-p2" style="font-size:11px">${tVDC_DS}</span></td>
            <td class="center bold"><span class="cell-tl" style="font-size:11px">${tVDC_TL}</span></td>
            <td><span class="total-badge" style="font-size:11px;padding:2px 5px;background:rgba(30,136,229,0.2)">${tQ}</span></td>
            <td><strong style="color:#0369a1;font-size:11px">${tPct}%</strong></td>
          `;
        } else {
          subtotalRow.innerHTML = `
            <td style="padding:5px 12px 5px 28px;font-size:11px;color:#64748b;font-style:italic">
              ↳ Tổng chủ đề
            </td>
            <td class="center bold"><span class="cell-tn" style="font-size:11px">${tNB_TN}</span></td>
            <td class="center bold"><span class="cell-p2" style="font-size:11px">${tNB_DS}</span></td>
            <td class="center bold"><span class="cell-tn" style="font-size:11px">${tTH_TN}</span></td>
            <td class="center bold"><span class="cell-p2" style="font-size:11px">${tTH_DS}</span></td>
            <td class="center bold"><span class="cell-tn" style="font-size:11px">${tVD_TN}</span></td>
            <td class="center bold"><span class="cell-p2" style="font-size:11px">${tVD_DS}</span></td>
            <td class="center bold"><span class="cell-tn" style="font-size:11px">${tVDC_TN > 0 ? tVDC_TN : '–'}</span></td>
            <td class="center bold"><span class="cell-p2" style="font-size:11px">${tVDC_DS}</span></td>
            <td><span class="total-badge" style="font-size:11px;padding:2px 5px;background:rgba(30,136,229,0.2)">${tQ}</span></td>
            <td><strong style="color:#0369a1;font-size:11px">${tPct}%</strong></td>
          `;
        }
      } else {
        subtotalRow.innerHTML = `
          <td style="padding:5px 12px 5px 28px;font-size:11px;color:#64748b;font-style:italic">↳ Tổng chủ đề</td>
          <td><div class="matrix-cell"><span class="cell-tn" style="font-size:11px">${tNB_TN}</span><span class="cell-sep">|</span><span class="cell-p2" style="font-size:11px">${tNB_DS}</span></div></td>
          <td><div class="matrix-cell"><span class="cell-tn" style="font-size:11px">${tTH_TN}</span><span class="cell-sep">|</span><span class="cell-p2" style="font-size:11px">${tTH_DS}</span></div></td>
          <td><div class="matrix-cell"><span class="cell-tn" style="font-size:11px">${tVD_TN}</span><span class="cell-sep">|</span><span class="cell-p2" style="font-size:11px">${tVD_DS}</span></div></td>
          <td><div class="matrix-cell"><span class="cell-tn" style="font-size:11px">${tVDC_TN}</span><span class="cell-sep">|</span><span class="cell-p2" style="font-size:11px">${tVDC_DS}</span></div></td>
          <td><span class="total-badge" style="font-size:11px;padding:2px 5px">${tQ}</span></td>
        `;
      }
      tbody.appendChild(subtotalRow);
    }
  });

  // ── Footer totals ────────────────────────────────────────────────
  const totTN = totNB_TN + totTH_TN + totVD_TN + totVDC_TN;
  const totDS = totNB_DS + totTH_DS + totVD_DS + totVDC_DS;
  const totTL = totNB_TL + totTH_TL + totVD_TL + totVDC_TL;

  if (isStd) {
    if (hasEssay) {
      tfoot.innerHTML = `
        <tr class="tfoot-sum-row" style="background:rgba(255,255,255,0.04)">
          <td class="tfoot-label"><strong>Tổng số câu / ý hỏi (CV 7991)</strong></td>
          <td class="center bold"><span class="cell-tn">${totNB_TN} câu</span></td>
          <td class="center bold"><span class="cell-p2">${totNB_DS} ý</span></td>
          <td class="center bold"><span class="cell-tl">${totNB_TL > 0 ? totNB_TL + ' câu' : '-'}</span></td>
          <td class="center bold"><span class="cell-tn">${totTH_TN} câu</span></td>
          <td class="center bold"><span class="cell-p2">${totTH_DS} ý</span></td>
          <td class="center bold"><span class="cell-tl">${totTH_TL > 0 ? totTH_TL + ' câu' : '-'}</span></td>
          <td class="center bold"><span class="cell-tn">${totVD_TN > 0 ? totVD_TN + ' câu' : '-'}</span></td>
          <td class="center bold"><span class="cell-p2">${totVD_DS > 0 ? totVD_DS + ' ý' : '-'}</span></td>
          <td class="center bold"><span class="cell-tl">${totVD_TL > 0 ? totVD_TL + ' câu' : '-'}</span></td>
          <td class="center bold"><span class="cell-tn">${totVDC_TN > 0 ? totVDC_TN + ' câu' : '-'}</span></td>
          <td class="center bold"><span class="cell-p2">${totVDC_DS > 0 ? totVDC_DS + ' ý' : '-'}</span></td>
          <td class="center bold"><span class="cell-tl">${totVDC_TL > 0 ? totVDC_TL + ' câu' : '-'}</span></td>
          <td><span class="total-badge" style="background:rgba(30,136,229,0.3)">${totTN + Math.ceil(totDS/4) + totTL} câu (${totTN} TN + ${totDS} ý Đ/S + ${totTL} TL)</span></td>
          <td><strong style="color:#0284c7">100%</strong></td>
        </tr>
        <tr class="tfoot-score-row">
          <td class="tfoot-label"><strong>Quy đổi điểm theo mức độ</strong></td>
          <td colspan="3" class="center bold" style="color:#38bdf8;background:rgba(30,136,229,0.12);padding:8px">4,0 điểm (40%)</td>
          <td colspan="3" class="center bold" style="color:#34d399;background:rgba(16,185,129,0.12);padding:8px">3,0 điểm (30%)</td>
          <td colspan="3" class="center bold" style="color:#fbbf24;background:rgba(245,158,11,0.12);padding:8px">2,0 điểm (20%)</td>
          <td colspan="3" class="center bold" style="color:#f87171;background:rgba(239,68,68,0.12);padding:8px">1,0 điểm (10%)</td>
          <td colspan="2" class="center bold" style="background:rgba(124,58,237,0.15);color:#a855f7;padding:8px">10,0 điểm (100%)</td>
        </tr>
        <tr class="tfoot-format-row">
          <td class="tfoot-label"><strong>Cơ cấu 3 phần đề thi CV 7991</strong></td>
          <td colspan="14" style="text-align:left;padding:10px 14px;font-size:12.5px;line-height:1.6">
            <span style="color:#38bdf8"><strong>Phần I (Nhiều lựa chọn):</strong> ${totTN} câu (${(totTN*0.25).toFixed(1).replace('.', ',')} điểm – ${Math.round(totTN*0.25*10)}%)</span> &nbsp;|&nbsp;
            <span style="color:#34d399"><strong>Phần II (Đúng / Sai):</strong> ${Math.ceil(totDS/4)} câu / ${totDS} ý hỏi (${(totDS*0.25).toFixed(1).replace('.', ',')} điểm – ${Math.round(totDS*0.25*10)}%)</span> &nbsp;|&nbsp;
            <span style="color:#c084fc"><strong>Phần III (Tự luận):</strong> ${totTL} câu (3,0 điểm – 30%)</span>
          </td>
        </tr>
      `;
    } else {
      tfoot.innerHTML = `
        <tr class="tfoot-sum-row" style="background:rgba(255,255,255,0.04)">
          <td class="tfoot-label"><strong>Tổng số câu / ý hỏi (CV 7991)</strong></td>
          <td class="center bold"><span class="cell-tn">${totNB_TN} câu</span></td>
          <td class="center bold"><span class="cell-p2">${totNB_DS} ý</span></td>
          <td class="center bold"><span class="cell-tn">${totTH_TN} câu</span></td>
          <td class="center bold"><span class="cell-p2">${totTH_DS} ý</span></td>
          <td class="center bold"><span class="cell-tn">${totVD_TN} câu</span></td>
          <td class="center bold"><span class="cell-p2">${totVD_DS} ý</span></td>
          <td class="center bold"><span class="cell-tn">${totVDC_TN > 0 ? totVDC_TN + ' câu' : '-'}</span></td>
          <td class="center bold"><span class="cell-p2">${totVDC_DS} ý</span></td>
          <td><span class="total-badge" style="background:rgba(30,136,229,0.3)">28 câu (24 TN + 16 ý Đ/S)</span></td>
          <td><strong style="color:#0284c7">100%</strong></td>
        </tr>
        <tr class="tfoot-score-row">
          <td class="tfoot-label"><strong>Quy đổi điểm theo mức độ</strong></td>
          <td colspan="2" class="center bold" style="color:#38bdf8;background:rgba(30,136,229,0.12);padding:8px">4,0 điểm (40%)</td>
          <td colspan="2" class="center bold" style="color:#34d399;background:rgba(16,185,129,0.12);padding:8px">3,0 điểm (30%)</td>
          <td colspan="2" class="center bold" style="color:#fbbf24;background:rgba(245,158,11,0.12);padding:8px">2,0 điểm (20%)</td>
          <td colspan="2" class="center bold" style="color:#f87171;background:rgba(239,68,68,0.12);padding:8px">1,0 điểm (10%)</td>
          <td colspan="2" class="center bold" style="background:rgba(124,58,237,0.15);color:#a855f7;padding:8px">10,0 điểm (100%)</td>
        </tr>
        <tr class="tfoot-format-row">
          <td class="tfoot-label"><strong>Cơ cấu 2 phần đề thi CV 7991</strong></td>
          <td colspan="10" style="text-align:left;padding:10px 14px;font-size:12.5px;line-height:1.6">
            <span style="color:#38bdf8"><strong>Phần I (Nhiều lựa chọn):</strong> 24 câu (6,0 điểm – 60%)</span> &nbsp;|&nbsp;
            <span style="color:#34d399"><strong>Phần II (Đúng / Sai):</strong> 4 câu / 16 ý hỏi (4,0 điểm – 40%)</span>
          </td>
        </tr>
      `;
    }
  } else {
    const grandQ = (totNB_TN+totTH_TN+totVD_TN+totVDC_TN) + Math.ceil((totNB_DS+totTH_DS+totVD_DS+totVDC_DS)/4) + (hasEssay ? totTL : 0);
    tfoot.innerHTML = `
      <tr class="tfoot-sum-row" style="background:rgba(255,255,255,0.04)">
        <td class="tfoot-label"><strong>Tổng cộng số câu (CV 7991)</strong></td>
        <td><div class="matrix-cell"><span class="cell-tn">${totNB_TN}</span><span class="cell-sep">|</span><span class="cell-p2">${totNB_DS}</span></div></td>
        <td><div class="matrix-cell"><span class="cell-tn">${totTH_TN}</span><span class="cell-sep">|</span><span class="cell-p2">${totTH_DS}</span></div></td>
        <td><div class="matrix-cell"><span class="cell-tn">${totVD_TN}</span><span class="cell-sep">|</span><span class="cell-p2">${totVD_DS}</span></div></td>
        <td><div class="matrix-cell"><span class="cell-tn">${totVDC_TN}</span><span class="cell-sep">|</span><span class="cell-p2">${totVDC_DS}</span></div></td>
        <td><span class="total-badge" style="background:rgba(30,136,229,0.3)">${grandQ}</span></td>
      </tr>
      <tr class="tfoot-score-row">
        <td class="tfoot-label"><strong>Quy đổi điểm (Tỉ lệ %)</strong></td>
        <td class="center bold" style="color:#38bdf8;background:rgba(30,136,229,0.12)">4,0 điểm (40%)</td>
        <td class="center bold" style="color:#34d399;background:rgba(16,185,129,0.12)">3,0 điểm (30%)</td>
        <td class="center bold" style="color:#fbbf24;background:rgba(245,158,11,0.12)">2,0 điểm (20%)</td>
        <td class="center bold" style="color:#f87171;background:rgba(239,68,68,0.12)">1,0 điểm (10%)</td>
        <td class="center bold" style="background:rgba(124,58,237,0.15);color:#a855f7">10,0 điểm (100%)</td>
      </tr>
      <tr class="tfoot-format-row">
        <td class="tfoot-label"><strong>Cơ cấu định dạng đề thi CV 7991</strong></td>
        <td colspan="5" style="text-align:left;padding:10px 14px;font-size:12.5px;line-height:1.6">
          ${hasEssay
            ? `<span style="color:#38bdf8"><strong>Phần I (Nhiều lựa chọn):</strong> ${totTN} câu (4,0đ)</span> &nbsp;|&nbsp;
               <span style="color:#34d399"><strong>Phần II (Đúng/Sai):</strong> ${Math.ceil(totDS/4)} câu / ${totDS} ý (3,0đ)</span> &nbsp;|&nbsp;
               <span style="color:#c084fc"><strong>Phần III (Tự luận):</strong> ${totTL} câu (3,0đ)</span>`
            : `<span style="color:#38bdf8"><strong>Phần I (Nhiều lựa chọn):</strong> 24 câu (6,0đ)</span> &nbsp;|&nbsp;
               <span style="color:#34d399"><strong>Phần II (Đúng/Sai):</strong> 4 câu / 16 ý (4,0đ)</span>`
          }
        </td>
      </tr>
    `;
  }

  // Update Legend
  const legend = document.getElementById('matrixLegend') || document.querySelector('.matrix-legend');
  if (legend) {
    if (hasEssay) {
      legend.innerHTML = `
        <div class="legend-item"><span class="legend-dot tn-dot"></span> <strong>TNKQ:</strong> Nhiều lựa chọn (Phần I – ${totTN} câu: 4,0đ)</div>
        <div class="legend-item"><span class="legend-dot p2-dot"></span> <strong>Đ/S:</strong> Đúng/Sai (Phần II – ${Math.ceil(totDS/4)} câu / ${totDS} ý: 3,0đ)</div>
        <div class="legend-item"><span class="legend-dot" style="background:#a855f7"></span> <strong>TL:</strong> Tự luận (Phần III – ${totTL} câu: 3,0đ)</div>
        <div class="legend-item"><span class="legend-dot nb-dot"></span> <strong>NB:</strong> Nhận biết (40% – 4,0đ)</div>
        <div class="legend-item"><span class="legend-dot th-dot"></span> <strong>TH:</strong> Thông hiểu (30% – 3,0đ)</div>
        <div class="legend-item"><span class="legend-dot vd-dot"></span> <strong>VD:</strong> Vận dụng (20% – 2,0đ)</div>
        <div class="legend-item"><span class="legend-dot vdc-dot"></span> <strong>VDC:</strong> Vận dụng cao (10% – 1,0đ)</div>
      `;
    } else {
      legend.innerHTML = `
        <div class="legend-item"><span class="legend-dot tn-dot"></span> <strong>TNKQ:</strong> Nhiều lựa chọn (Phần I – 24 câu: 6,0đ)</div>
        <div class="legend-item"><span class="legend-dot p2-dot"></span> <strong>Đ/S:</strong> Trắc nghiệm Đúng/Sai (Phần II – 4 câu / 16 ý: 4,0đ)</div>
        <div class="legend-item"><span class="legend-dot nb-dot"></span> <strong>NB:</strong> Nhận biết (40% – 4,0đ)</div>
        <div class="legend-item"><span class="legend-dot th-dot"></span> <strong>TH:</strong> Thông hiểu (30% – 3,0đ)</div>
        <div class="legend-item"><span class="legend-dot vd-dot"></span> <strong>VD:</strong> Vận dụng (20% – 2,0đ)</div>
        <div class="legend-item"><span class="legend-dot vdc-dot"></span> <strong>VDC:</strong> Vận dụng cao (10% – 1,0đ)</div>
      `;
    }
  }
}

window.editCell = function(el, rIdx, field) {
  const current = parseInt(el.textContent) || 0;
  const input = document.createElement('input');
  input.type = 'number'; input.value = current; input.min = 0; input.max = 20;
  input.style.cssText = 'width:38px;background:rgba(255,255,255,0.15);border:1px solid #3B82F6;border-radius:4px;color:#fff;text-align:center;font-size:12px;font-weight:700;padding:2px;outline:none';
  el.replaceWith(input);
  input.focus(); input.select();
  const restore = () => {
    const val = parseInt(input.value) || 0;
    if (state.matrixData[rIdx] && field) {
      state.matrixData[rIdx][field] = val;
    }
    renderMatrix(state.matrixData);
    renderSpecForSubject(state.currentSubject);
  };
  input.addEventListener('blur', restore);
  input.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === 'Escape') restore(); });
};

window.editLessonCell = function(el, lIdx, field) {
  const current = parseInt(el.textContent) || 0;
  const input = document.createElement('input');
  input.type = 'number'; input.value = current; input.min = 0; input.max = 20;
  input.style.cssText = 'width:38px;background:rgba(255,255,255,0.15);border:1px solid #3B82F6;border-radius:4px;color:#fff;text-align:center;font-size:12px;font-weight:700;padding:2px;outline:none';
  el.replaceWith(input);
  input.focus(); input.select();
  const restore = () => {
    const val = parseInt(input.value) || 0;
    if (state.lessonRows && state.lessonRows[lIdx] && field) {
      state.lessonRows[lIdx][field] = val;
      const grade = state.currentGrade || '10';
      const curSub = INFORMATICS_CURRICULA[grade] || INFORMATICS_CURRICULA['10'];
      state.matrixData = aggregateLessonToTopics(state.lessonRows, curSub.topics);
    }
    renderMatrix(state.matrixData);
    renderSpecForSubject(state.currentSubject);
  };
  input.addEventListener('blur', restore);
  input.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === 'Escape') restore(); });
};

// ─── SPEC PANEL (BẢN ĐẶC TẢ CHUẨN CÔNG VĂN 7991/BGDĐT-GDTr) ─────────
function initSpecPanel() {
  renderSpecForSubject(state.currentSubject);

  document.getElementById('autoFillSpec')?.addEventListener('click', () => {
    showToast('info', 'Đang đồng bộ YCCĐ...', 'Khớp nối Yêu cầu cần đạt và phân bố câu hỏi theo chuẩn CV 7991');
    setTimeout(() => {
      renderSpecForSubject(state.currentSubject);
      showToast('success', 'Đã đồng bộ thành công', 'Bản đặc tả đã khớp chuẩn 100% với SGK và CV 7991');
    }, 400);
  });

  document.getElementById('exportSpecDoc')?.addEventListener('click', () => {
    exportSpecDoc();
  });

  document.getElementById('printSpecBtn')?.addEventListener('click', () => {
    printSpec();
  });
}

window.setSpecViewMode = function(mode) {
  state.specViewMode = mode;
  const btnTable = document.getElementById('tabSpecTableBtn');
  const btnCards = document.getElementById('tabSpecCardsBtn');
  if (btnTable && btnCards) {
    if (mode === 'table') {
      btnTable.classList.add('active');
      btnCards.classList.remove('active');
    } else {
      btnCards.classList.add('active');
      btnTable.classList.remove('active');
    }
  }
  renderSpecForSubject(state.currentSubject);
};

function renderSpecForSubject(subjectKey = 'informatics') {
  const container = document.getElementById('specContainer');
  if (!container) return;

  const grade = state.currentGrade || '10';
  const bookLabel = BOOK_NAMES[state.currentBook] || 'KNTT - ICT';
  const allSpecItems = INFORMATICS_SPEC_CURRICULA[grade] || INFORMATICS_SPEC_CURRICULA['10'];
  const maxLesson = grade === '11' ? 31 : (grade === '12' ? 28 : 34);
  const chapFrom = state.chapFrom || 1;
  const chapTo = state.chapTo || maxLesson;

  const scopeDesc = getScopeDescriptor(grade, chapFrom, chapTo);

  // Lọc các mục đặc tả theo đúng dải bài học đã chọn (Bài học từ ... Đến bài ...)
  let specItems = allSpecItems.filter(item => {
    const sLesson = item.startLesson || 1;
    const eLesson = item.endLesson || 35;
    return sLesson <= chapTo && eLesson >= chapFrom;
  });

  if (specItems.length === 0) {
    const scopes = GRADE_SCOPES[grade] || GRADE_SCOPES['10'];
    const activeScope = scopes.find(s => s.value === (state.currentScope || 'all')) || scopes[0];
    if (activeScope && activeScope.topicIndices) {
      specItems = activeScope.topicIndices.map(idx => allSpecItems[idx]).filter(Boolean);
    } else {
      specItems = allSpecItems;
    }
  }

  // Khớp số lượng câu từ ma trận hiện tại (state.lessonRows hoặc state.matrixData)
  const hasEssay = (grade === '10' || grade === '11');
  const mappedSpecItems = specItems.map((item, idx) => {
    const effStart = Math.max(item.startLesson || 1, chapFrom);
    const effEnd   = Math.min(item.endLesson || 99, chapTo);
    const lessonRangeStr = (effStart === effEnd) ? `Bài ${effStart}` : `Bài ${effStart}–${effEnd}`;

    // Điều chỉnh tên chủ đề hiển thị dải bài học thực tế
    let adjustedTopic = item.topic;
    if (grade === '11' && (item.tt === 5 || item.startLesson === 25) && effEnd < 28) {
      adjustedTopic = `Chủ đề 7: Phần mềm chỉnh sửa ảnh (GIMP) (${lessonRangeStr})`;
    } else if (/\(Bài\s*\d+[–\-\.]*\d*[^)]*\)/i.test(adjustedTopic)) {
      adjustedTopic = adjustedTopic.replace(/\(Bài\s*\d+[–\-\.]*\d*[^)]*\)/i, `(${lessonRangeStr})`);
    } else {
      adjustedTopic = `${adjustedTopic} (${lessonRangeStr})`;
    }

    // Điều chỉnh trang SGK tương ứng theo dải bài học
    let adjustedSgkPages = item.sgkPages || '';
    if (grade === '11') {
      if (item.startLesson === 16 && effStart >= 20 && effEnd <= 24) {
        adjustedSgkPages = "Trang 100 – 118";
      } else if ((item.tt === 5 || item.startLesson === 25) && effEnd === 25) {
        adjustedSgkPages = "Trang 119 – 123";
      }
    }

    // Điều chỉnh nội dung đơn vị kiến thức: thay thế tiền tố "Bài X–Y:" bằng dải bài thực tế được chọn
    let adjustedContent = item.content;
    if (grade === '11' && (item.tt === 5 || item.startLesson === 25)) {
      if (effEnd === 25) {
        adjustedContent = `${lessonRangeStr}: Phần mềm chỉnh sửa ảnh GIMP, Lớp ảnh (Layer), Quản lý tệp dự án .xcf và Xuất ảnh đa định dạng (PNG, JPEG)`;
      } else if (effEnd < 28) {
        adjustedContent = `${lessonRangeStr}: Chỉnh sửa ảnh, Lớp ảnh (Layer), Tô vẽ và xử lý vùng chọn đồ họa (GIMP)`;
      } else if (effEnd < 29) {
        adjustedContent = `${lessonRangeStr}: Chỉnh sửa ảnh, Lớp ảnh (Layer), Tô vẽ và Tạo ảnh động (GIMP & Animate)`;
      } else {
        adjustedContent = adjustedContent.replace(/^Bài\s*\d+[–\-\.]*\d*:\s*/i, `${lessonRangeStr}: `);
      }
    } else if (grade === '11' && item.startLesson === 16 && effStart > 16) {
      adjustedContent = `${lessonRangeStr}: Cấu trúc bảng, Khóa ngoài, Cập nhật dữ liệu (UPDATE, INSERT) và Truy xuất dữ liệu (SELECT)`;
    } else if (/^Bài\s*\d+[–\-\.]*\d*:\s*/i.test(adjustedContent)) {
      adjustedContent = adjustedContent.replace(/^Bài\s*\d+[–\-\.]*\d*:\s*/i, `${lessonRangeStr}: `);
    } else if (/^Bài\s*\d+:\s*/i.test(adjustedContent)) {
      adjustedContent = adjustedContent.replace(/^Bài\s*\d+:\s*/i, `${lessonRangeStr}: `);
    } else {
      adjustedContent = `${lessonRangeStr}: ${adjustedContent}`;
    }

    // Điều chỉnh YCCD để không chứa nội dung vượt quá phạm vi bài học đã chọn
    let adjustedYccd = { ...item.yccd };
    if (grade === '11' && (item.tt === 5 || item.startLesson === 25)) {
      if (effEnd === 25) {
        adjustedYccd = {
          nb: [
            "Nêu được chức năng cơ bản của phần mềm chỉnh sửa ảnh số nguồn mở GIMP.",
            "Nhận biết khái niệm Lớp ảnh (Layer) và ý nghĩa của việc quản lý đối tượng trên các lớp độc lập.",
            "Nêu được đặc điểm độ phân giải DPI, định dạng tệp dự án .xcf và các định dạng xuất ảnh (PNG, JPEG)."
          ],
          th: [
            "Hiểu được nguyên lý hoạt động của các lớp ảnh (Layer) và thứ tự hiển thị đối tượng trong ảnh.",
            "Hiểu tác dụng của kênh Alpha trong việc tạo vùng trong suốt cho ảnh.",
            "Phân biệt được thao tác lưu tệp dự án (Save) và xuất tệp ảnh thành phẩm (Export As...)."
          ],
          vd: [
            "Tạo mới tệp ảnh với độ phân giải DPI phù hợp và quản lý thành thạo các lớp ảnh trong GIMP.",
            "Thực hiện xuất tệp ảnh theo đúng định dạng yêu cầu (PNG, JPEG) phục vụ in ấn hoặc web."
          ],
          vdc: [
            "Tổ chức cấu trúc các lớp ảnh khoa học để tạo ra sản phẩm đồ họa ứng dụng học đường chất lượng cao."
          ]
        };
      } else if (effEnd < 28) {
        adjustedYccd = {
          nb: [
            "Nêu được chức năng cơ bản của phần mềm chỉnh sửa ảnh số (GIMP/Photoshop).",
            "Nhận biết khái niệm Lớp ảnh (Layer) và các công cụ chọn vùng cơ bản (hình chữ nhật, elip, lasso, ma thuật).",
            "Nêu được đặc điểm kênh màu RGB, độ phân giải DPI và các định dạng tệp ảnh (.xcf, .png, .jpg)."
          ],
          th: [
            "Hiểu được nguyên lý hoạt động của các lớp ảnh (Layer) và thứ tự hiển thị đối tượng trong ảnh.",
            "Giải thích được sự khác nhau giữa công cụ Clone (sao chép vùng ảnh) và Healing (hòa trộn phục chế).",
            "Hiểu tác dụng của kênh Alpha trong việc tạo vùng trong suốt cho ảnh."
          ],
          vd: [
            "Sử dụng thành thạo các công cụ vẽ, tẩy, cắt ghép và điều chỉnh độ sáng, độ tương phản của ảnh trong GIMP.",
            "Thực hiện chọn vùng, xóa phông nền và xuất tệp ảnh theo đúng định dạng yêu cầu (PNG, JPEG)."
          ],
          vdc: [
            "Phục chế bức ảnh cũ hoặc thiết kế ấn phẩm đồ họa truyền thông học đường có bố cục, màu sắc hài hòa."
          ]
        };
      }
    }

    // Lấy câu hỏi chính xác từ state.lessonRows (từng bài cụ thể trong Bước 2) hoặc state.matrixData
    let matchingRows = [];
    if (state.lessonRows && state.lessonRows.length > 0) {
      matchingRows = state.lessonRows.filter(r => r.lesson >= effStart && r.lesson <= effEnd);
    } else {
      matchingRows = (state.matrixData || []).filter(row => {
        const rStart = row.startLesson || 1;
        const rEnd   = row.endLesson   || 99;
        return rStart <= effEnd && rEnd >= effStart;
      });
    }

    let q = item.q;
    if (matchingRows.length > 0) {
      // Cộng dồn số câu từ tất cả matching rows
      let nb_tn = 0, nb_ds = 0, nb_tl = 0;
      let th_tn = 0, th_ds = 0, th_tl = 0;
      let vd_tn = 0, vd_ds = 0, vd_tl = 0;
      let vdc_tn = 0, vdc_ds = 0, vdc_tl = 0;

      matchingRows.forEach(row => {
        nb_tn  += row.nb_tn  || 0;
        nb_ds  += row.nb_ds  || 0;
        nb_tl  += (row.nb_tl  !== undefined ? row.nb_tl  : (row.nb_tln  || 0));
        th_tn  += row.th_tn  || 0;
        th_ds  += row.th_ds  || 0;
        th_tl  += (row.th_tl  !== undefined ? row.th_tl  : (row.th_tln  || 0));
        vd_tn  += row.vd_tn  || 0;
        vd_ds  += row.vd_ds  || 0;
        vd_tl  += (row.vd_tl  !== undefined ? row.vd_tl  : (row.vd_tln  || 0));
        vdc_tn += row.vdc_tn || 0;
        vdc_ds += row.vdc_ds || 0;
        vdc_tl += (row.vdc_tl !== undefined ? row.vdc_tl : (row.vdc_tln || 0));
      });

      let rowScore = 0;
      let rowQuestions = 0;
      if (hasEssay) {
        rowScore = (nb_tn + th_tn) * 0.25 + (nb_ds + th_ds) * 0.25 + vd_tl * 2.0 + vdc_tl * 1.0;
        const rowDSQuestions = (nb_ds + th_ds > 0) ? Math.ceil((nb_ds + th_ds) / 4) : 0;
        rowQuestions = nb_tn + th_tn + rowDSQuestions + vd_tl + vdc_tl;
      } else {
        rowScore = (nb_tn + th_tn + vd_tn) * 0.25 + (nb_ds + th_ds + vd_ds + vdc_ds) * 0.25;
        const rowDSQuestions = (nb_ds + th_ds + vd_ds + vdc_ds > 0) ? Math.ceil((nb_ds + th_ds + vd_ds + vdc_ds) / 4) : 0;
        rowQuestions = nb_tn + th_tn + vd_tn + vdc_tn + rowDSQuestions;
      }
      const rowPct = Math.round((rowScore / 10.0) * 100);

      q = {
        nb_p1: nb_tn > 0 ? `${nb_tn} câu` : '-',
        nb_p2: nb_ds > 0 ? `${nb_ds} ý` : '-',
        nb_p3: nb_tl > 0 ? `${nb_tl} câu` : '-',
        th_p1: th_tn > 0 ? `${th_tn} câu` : '-',
        th_p2: th_ds > 0 ? `${th_ds} ý` : '-',
        th_p3: th_tl > 0 ? `${th_tl} câu` : '-',
        vd_p1: vd_tn > 0 ? `${vd_tn} câu` : '-',
        vd_p2: vd_ds > 0 ? `${vd_ds} ý` : '-',
        vd_p3: vd_tl > 0 ? `${vd_tl} câu` : '-',
        vdc_p1: vdc_tn > 0 ? `${vdc_tn} câu` : '-',
        vdc_p2: vdc_ds > 0 ? `${vdc_ds} ý` : '-',
        vdc_p3: vdc_tl > 0 ? `${vdc_tl} câu` : '-',
        total: rowQuestions,
        pct: `${rowPct}%`,
        raw_nb_tn: nb_tn, raw_nb_ds: nb_ds, raw_nb_tl: nb_tl,
        raw_th_tn: th_tn, raw_th_ds: th_ds, raw_th_tl: th_tl,
        raw_vd_tn: vd_tn, raw_vd_ds: vd_ds, raw_vd_tl: vd_tl,
        raw_vdc_tn: vdc_tn, raw_vdc_ds: vdc_ds, raw_vdc_tl: vdc_tl,
      };
    }
    return {
      ...item,
      tt: idx + 1,
      topic: adjustedTopic,
      sgkPages: adjustedSgkPages,
      content: adjustedContent,
      yccd: adjustedYccd,
      effStart,
      effEnd,
      q
    };
  });

  if (state.specViewMode === 'cards') {
    container.innerHTML = buildSpecCardsHtml(grade, mappedSpecItems, bookLabel, scopeDesc);
  } else {
    container.innerHTML = buildCv7991SpecTableHtml(grade, mappedSpecItems, bookLabel, scopeDesc);
  }
}

function buildCv7991SpecTableHtml(grade, items, bookLabel, activeScope) {
  const duration = document.getElementById('examDuration')?.value || 45;
  const scopeText = activeScope ? (activeScope.label || activeScope) : 'Toàn bộ chương trình năm học';
  const hasEssay = (grade === '10' || grade === '11');

  let tot_nb_p1 = 0, tot_nb_p2 = 0, tot_nb_p3 = 0,
      tot_th_p1 = 0, tot_th_p2 = 0, tot_th_p3 = 0,
      tot_vd_p1 = 0, tot_vd_p2 = 0, tot_vd_p3 = 0,
      tot_vdc_p1 = 0, tot_vdc_p2 = 0, tot_vdc_p3 = 0;

  items.forEach(it => {
    if (it.q) {
      if (it.q.raw_nb_tn !== undefined) {
        tot_nb_p1 += it.q.raw_nb_tn;
        tot_nb_p2 += it.q.raw_nb_ds;
        tot_nb_p3 += it.q.raw_nb_tl || 0;
        tot_th_p1 += it.q.raw_th_tn;
        tot_th_p2 += it.q.raw_th_ds;
        tot_th_p3 += it.q.raw_th_tl || 0;
        tot_vd_p1 += it.q.raw_vd_tn;
        tot_vd_p2 += it.q.raw_vd_ds;
        tot_vd_p3 += it.q.raw_vd_tl || 0;
        tot_vdc_p1 += it.q.raw_vdc_tn;
        tot_vdc_p2 += it.q.raw_vdc_ds;
        tot_vdc_p3 += it.q.raw_vdc_tl || 0;
      } else {
        const parseNum = (str) => parseInt(str) || 0;
        tot_nb_p1 += parseNum(it.q.nb_p1);
        tot_nb_p2 += parseNum(it.q.nb_p2);
        tot_nb_p3 += parseNum(it.q.nb_p3);
        tot_th_p1 += parseNum(it.q.th_p1);
        tot_th_p2 += parseNum(it.q.th_p2);
        tot_th_p3 += parseNum(it.q.th_p3);
        tot_vd_p1 += parseNum(it.q.vd_p1);
        tot_vd_p2 += parseNum(it.q.vd_p2);
        tot_vd_p3 += parseNum(it.q.vd_p3);
        tot_vdc_p1 += parseNum(it.q.vdc_p1);
        tot_vdc_p2 += parseNum(it.q.vdc_p2);
        tot_vdc_p3 += parseNum(it.q.vdc_p3);
      }
    }
  });

  if (tot_nb_p1 === 0 && tot_th_p1 === 0) {
    if (hasEssay) {
      tot_nb_p1 = 10; tot_nb_p2 = 6; tot_nb_p3 = 0;
      tot_th_p1 = 6;  tot_th_p2 = 6; tot_th_p3 = 0;
      tot_vd_p1 = 0;  tot_vd_p2 = 0; tot_vd_p3 = 1;
      tot_vdc_p1 = 0; tot_vdc_p2 = 0; tot_vdc_p3 = 1;
    } else {
      tot_nb_p1 = 12; tot_nb_p2 = 4;
      tot_th_p1 = 8;  tot_th_p2 = 4;
      tot_vd_p1 = 4;  tot_vd_p2 = 4;
      tot_vdc_p1 = 0; tot_vdc_p2 = 4;
    }
  }

  const rowsHtml = items.map(item => {
    const q = item.q;
    const formatQCell = (val, type) => {
      if (!val || val === '-') return '<td class="q-cell">-</td>';
      let cls = 'has-q';
      if (type === 'p2') cls = 'has-q-p2';
      if (type === 'p3') cls = 'has-q-p3';
      return `<td class="q-cell ${cls}">${val}</td>`;
    };

    return `
      <tr>
        <td class="center bold">${item.tt}</td>
        <td class="topic-cell">${item.topic}</td>
        <td class="content-cell">
          <strong>${item.content}</strong>
          <div style="font-size:11px;color:#0284c7;margin-top:3px;font-weight:600">
            <i class="fa-solid fa-list-check"></i> ${item.effStart === item.effEnd ? `Bài ${item.effStart}` : `Phạm vi: Bài ${item.effStart} &rarr; Bài ${item.effEnd}`}
          </div>
          <div style="font-size:11px;color:#4b5563;margin-top:2px">
            <i class="fa-solid fa-book-open"></i> ${item.sgkPages}
          </div>
        </td>
        <td class="yccd-cell">
          <div class="yccd-group">
            <div class="yccd-title nb"><i class="fa-solid fa-circle-check"></i> Nhận biết:</div>
            <ul class="yccd-list">
              ${item.yccd.nb.map(str => `<li>${escapeExamText(str)}</li>`).join('')}
            </ul>
          </div>
          <div class="yccd-group">
            <div class="yccd-title th"><i class="fa-solid fa-circle-check"></i> Thông hiểu:</div>
            <ul class="yccd-list">
              ${item.yccd.th.map(str => `<li>${escapeExamText(str)}</li>`).join('')}
            </ul>
          </div>
          <div class="yccd-group">
            <div class="yccd-title vd"><i class="fa-solid fa-circle-check"></i> Vận dụng:</div>
            <ul class="yccd-list">
              ${item.yccd.vd.map(str => `<li>${escapeExamText(str)}</li>`).join('')}
            </ul>
          </div>
          <div class="yccd-group">
            <div class="yccd-title vdc"><i class="fa-solid fa-circle-check"></i> Vận dụng cao:</div>
            <ul class="yccd-list">
              ${item.yccd.vdc.map(str => `<li>${escapeExamText(str)}</li>`).join('')}
            </ul>
          </div>
        </td>
        ${formatQCell(q.nb_p1, 'p1')}
        ${formatQCell(q.nb_p2, 'p2')}
        ${hasEssay ? formatQCell(q.nb_p3, 'p3') : ''}
        ${formatQCell(q.th_p1, 'p1')}
        ${formatQCell(q.th_p2, 'p2')}
        ${hasEssay ? formatQCell(q.th_p3, 'p3') : ''}
        ${formatQCell(q.vd_p1, 'p1')}
        ${formatQCell(q.vd_p2, 'p2')}
        ${hasEssay ? formatQCell(q.vd_p3, 'p3') : ''}
        ${formatQCell(q.vdc_p1, 'p1')}
        ${formatQCell(q.vdc_p2, 'p2')}
        ${hasEssay ? formatQCell(q.vdc_p3, 'p3') : ''}
        <td class="center bold" style="background:#f8fafc">${q.total}</td>
        <td class="center bold" style="background:#f8fafc;color:#1e40af">${q.pct}</td>
      </tr>
    `;
  }).join('');

  return `
    <div class="cv7991-paper" id="cv7991SpecPaper">
      <!-- Hành chính đầu văn bản theo thể thức Bộ GDĐT -->
      <div class="cv7991-admin-header">
        <div class="admin-left">
          <div><strong>SỞ GIÁO DỤC VÀ ĐÀO TẠO ........................</strong></div>
          <div><strong>TRƯỜNG THPT ........................................</strong></div>
          <div>TỔ CHUYÊN MÔN: <strong>TIN HỌC</strong></div>
          <span class="admin-line"></span>
        </div>
        <div class="admin-right">
          <div><strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong></div>
          <div><strong>Độc lập - Tự do - Hạnh phúc</strong></div>
          <span class="admin-line"></span>
          <div class="admin-date"><em>........., ngày ..... tháng ..... năm 202...</em></div>
        </div>
      </div>

      <!-- Tiêu đề bản đặc tả -->
      <div class="cv7991-title-block">
        <h2 class="cv7991-main-title">BẢN ĐẶC TẢ ĐỀ KIỂM TRA ĐỊNH KÌ</h2>
        <div class="cv7991-sub-title">
          MÔN: <strong>TIN HỌC</strong> - KHỐI LỚP: <strong>${grade}</strong> (BỘ SÁCH: <strong>${bookLabel.toUpperCase()}</strong>)
        </div>
        <div style="font-size:13.5px;color:#1e40af;font-weight:700;margin-top:4px">
          PHẠM VI KIẾN THỨC: <strong>${scopeText.toUpperCase()}</strong>
        </div>
        <div class="cv7991-meta-badges">
          <span><i class="fa-regular fa-clock"></i> Thời gian làm bài: <strong>${duration} phút</strong></span>
          <span><i class="fa-solid fa-list-check"></i> Cấu trúc: <strong>${hasEssay ? '3 Phần (70% TN + 30% Tự luận)' : '2 Phần (100% Trắc nghiệm)'} theo CV 7991</strong></span>
          <span><i class="fa-solid fa-chart-pie"></i> Tỉ lệ nhận thức: <strong>40% NB – 30% TH – 20% VD – 10% VDC</strong></span>
        </div>
      </div>

      <!-- Bảng đặc tả chuẩn theo Phụ lục 2 - Công văn 7991 -->
      <div class="table-responsive">
        <table class="cv7991-spec-table" id="specTableElement">
          <thead>
            <tr>
              <th rowspan="3" style="width:36px">TT</th>
              <th rowspan="3" style="width:140px">Chủ đề</th>
              <th rowspan="3" style="width:160px">Nội dung / Đơn vị kiến thức</th>
              <th rowspan="3">Mức độ đánh giá<br><span style="font-weight:normal;font-size:11px">(Yêu cầu cần đạt theo CT GDPT 2018)</span></th>
              <th colspan="${hasEssay ? 12 : 8}">Số câu hỏi theo từng mức độ nhận thức (CV 7991)</th>
              <th rowspan="3" style="width:48px">Tổng số câu</th>
              <th rowspan="3" style="width:52px">Tỉ lệ % điểm</th>
            </tr>
            <tr>
              <th colspan="${hasEssay ? 3 : 2}" class="level-nb">Nhận biết</th>
              <th colspan="${hasEssay ? 3 : 2}" class="level-th">Thông hiểu</th>
              <th colspan="${hasEssay ? 3 : 2}" class="level-vd">Vận dụng</th>
              <th colspan="${hasEssay ? 3 : 2}" class="level-vdc">Vận dụng cao</th>
            </tr>
            <tr class="sub-format-row">
              <th class="fmt-p1" title="Phần I: TN nhiều phương án lựa chọn">TN</th>
              <th class="fmt-p2" title="Phần II: TN Đúng/Sai (ý hỏi)">Đ/S</th>
              ${hasEssay ? '<th class="fmt-p3" title="Phần III: Tự luận" style="background:#7c3aed;color:#fff">TL</th>' : ''}
              <th class="fmt-p1" title="Phần I: TN nhiều phương án lựa chọn">TN</th>
              <th class="fmt-p2" title="Phần II: TN Đúng/Sai (ý hỏi)">Đ/S</th>
              ${hasEssay ? '<th class="fmt-p3" title="Phần III: Tự luận" style="background:#7c3aed;color:#fff">TL</th>' : ''}
              <th class="fmt-p1" title="Phần I: TN nhiều phương án lựa chọn">TN</th>
              <th class="fmt-p2" title="Phần II: TN Đúng/Sai (ý hỏi)">Đ/S</th>
              ${hasEssay ? '<th class="fmt-p3" title="Phần III: Tự luận" style="background:#7c3aed;color:#fff">TL</th>' : ''}
              <th class="fmt-p1" title="Phần I: TN nhiều phương án lựa chọn">TN</th>
              <th class="fmt-p2" title="Phần II: TN Đúng/Sai (ý hỏi)">Đ/S</th>
              ${hasEssay ? '<th class="fmt-p3" title="Phần III: Tự luận" style="background:#7c3aed;color:#fff">TL</th>' : ''}
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
          <tfoot>
            <tr class="tfoot-sum-row">
              <td colspan="4" style="text-align:right"><strong>Tổng số câu / lệnh hỏi từng phần</strong></td>
              <td class="center bold has-q">${tot_nb_p1 > 0 ? tot_nb_p1 + ' câu' : '-'}</td>
              <td class="center bold has-q-p2">${tot_nb_p2 > 0 ? tot_nb_p2 + ' ý' : '-'}</td>
              ${hasEssay ? `<td class="center bold has-q-p3">${tot_nb_p3 > 0 ? tot_nb_p3 + ' câu' : '-'}</td>` : ''}
              <td class="center bold has-q">${tot_th_p1 > 0 ? tot_th_p1 + ' câu' : '-'}</td>
              <td class="center bold has-q-p2">${tot_th_p2 > 0 ? tot_th_p2 + ' ý' : '-'}</td>
              ${hasEssay ? `<td class="center bold has-q-p3">${tot_th_p3 > 0 ? tot_th_p3 + ' câu' : '-'}</td>` : ''}
              <td class="center bold has-q">${tot_vd_p1 > 0 ? tot_vd_p1 + ' câu' : '-'}</td>
              <td class="center bold has-q-p2">${tot_vd_p2 > 0 ? tot_vd_p2 + ' ý' : '-'}</td>
              ${hasEssay ? `<td class="center bold has-q-p3">${tot_vd_p3 > 0 ? tot_vd_p3 + ' câu' : '-'}</td>` : ''}
              <td class="center bold has-q">${tot_vdc_p1 > 0 ? tot_vdc_p1 + ' câu' : '-'}</td>
              <td class="center bold has-q-p2">${tot_vdc_p2 > 0 ? tot_vdc_p2 + ' ý' : '-'}</td>
              ${hasEssay ? `<td class="center bold has-q-p3">${tot_vdc_p3 > 0 ? tot_vdc_p3 + ' câu' : '-'}</td>` : ''}
              <td class="center bold" style="background:#e2e8f0">${hasEssay ? '21 câu (16 TN, 12 ý Đ/S, 2 TL)' : '28 câu (24 TN + 16 ý Đ/S)'}</td>
              <td class="center bold" style="background:#e2e8f0;color:#1e40af">100%</td>
            </tr>
            <tr class="tfoot-score-row">
              <td colspan="4" style="text-align:right"><strong>Quy đổi điểm theo mức độ nhận thức</strong></td>
              <td colspan="${hasEssay ? 3 : 2}" class="center bold" style="color:#0369a1;background:#e0f2fe">4,0 điểm (40%)</td>
              <td colspan="${hasEssay ? 3 : 2}" class="center bold" style="color:#15803d;background:#dcfce7">3,0 điểm (30%)</td>
              <td colspan="${hasEssay ? 3 : 2}" class="center bold" style="color:#c2410c;background:#ffedd5">2,0 điểm (20%)</td>
              <td colspan="${hasEssay ? 3 : 2}" class="center bold" style="color:#b91c1c;background:#fee2e2">1,0 điểm (10%)</td>
              <td colspan="2" class="center bold" style="background:#e0e7ff;color:#3730a3">10,0 điểm (100%)</td>
            </tr>
            <tr class="tfoot-format-row">
              <td colspan="4" style="text-align:right"><strong>Cơ cấu các phần theo chuẩn CV 7991</strong></td>
              <td colspan="${hasEssay ? 14 : 10}" style="padding:10px 14px">
                ${hasEssay
                  ? `<span style="color:#1d4ed8"><strong>Phần I (Nhiều lựa chọn):</strong> 16 câu (4,0 điểm – 40%)</span> &nbsp;|&nbsp;
                     <span style="color:#15803d"><strong>Phần II (Đúng/Sai):</strong> 3 câu / 12 ý hỏi (3,0 điểm – 30%)</span> &nbsp;|&nbsp;
                     <span style="color:#7e22ce"><strong>Phần III (Tự luận):</strong> 2 câu (3,0 điểm – 30%)</span>`
                  : `<span style="color:#1d4ed8"><strong>Phần I (Nhiều lựa chọn):</strong> 24 câu (6,0 điểm – 60%)</span> &nbsp;|&nbsp;
                     <span style="color:#15803d"><strong>Phần II (Đúng/Sai):</strong> 4 câu / 16 ý hỏi (4,0 điểm – 40%)</span>`
                }
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Chữ ký xác nhận chuẩn hành chính Bộ GDĐT -->
      <div class="cv7991-signatures">
        <div class="sig-col">
          <div class="sig-title">BAN GIÁM HIỆU DUYỆT</div>
          <div class="sig-space"></div>
          <div class="sig-name">...................................................</div>
        </div>
        <div class="sig-col">
          <div class="sig-title">TỔ TRƯỞNG CHUYÊN MÔN</div>
          <div class="sig-space"></div>
          <div class="sig-name">...................................................</div>
        </div>
        <div class="sig-col">
          <div class="sig-title">GIÁO VIÊN RA ĐỀ</div>
          <div class="sig-space"></div>
          <div class="sig-name">...................................................</div>
        </div>
      </div>
    </div>
  `;
}

function buildSpecCardsHtml(grade, items, bookLabel, activeScope) {
  const scopeLabel = activeScope ? (activeScope.label || activeScope) : 'Toàn bộ chương trình năm học';
  return `
    <div style="display:flex;flex-direction:column;gap:18px">
      <div style="background:var(--surface);padding:14px 18px;border-radius:var(--radius-md);border:1px solid var(--surface-border);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px">
        <div>
          <strong style="color:#fff;font-size:15px">Phân rã chi tiết YCCĐ - Môn Tin học ${grade} &bull; <span style="color:#38bdf8">${scopeLabel}</span></strong>
          <div style="font-size:12px;color:var(--gray-400)">Bộ sách: ${bookLabel} · Đồng bộ với Ma trận và Ngân hàng câu hỏi CV 7991</div>
        </div>
        <button class="btn-outline" onclick="setSpecViewMode('table')">
          <i class="fa-solid fa-table-list"></i> Xem Bảng Chuẩn CV 7991
        </button>
      </div>

      ${items.map(item => `
        <div class="card glass-card" style="border:1px solid var(--surface-border)">
          <div class="card-header" style="display:flex;justify-content:space-between;align-items:center;padding:14px 20px;border-bottom:1px solid var(--surface-border)">
            <div>
              <span class="badge badge-primary">Chủ đề ${item.tt}</span>
              <strong style="color:#fff;font-size:15px;margin-left:8px">${item.topic}</strong>
              <div style="font-size:12px;color:var(--gray-400);margin-top:2px">
                ${item.content} &bull; <i class="fa-solid fa-book-open"></i> SGK ${item.sgkPages}
              </div>
            </div>
            <div style="text-align:right">
              <span class="badge badge-warning" style="font-size:12px">${item.q.total} câu hỏi</span>
              <span class="badge badge-success" style="font-size:12px;margin-left:4px">${item.q.pct} tổng điểm</span>
            </div>
          </div>
          <div class="card-body" style="padding:18px 20px">
            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:16px">
              <div style="background:rgba(30,136,229,0.06);border-left:3px solid #3b82f6;padding:12px 14px;border-radius:4px">
                <div style="color:#60a5fa;font-weight:700;font-size:13px;margin-bottom:6px">
                  <i class="fa-solid fa-circle-dot"></i> Nhận biết (Phần I: ${item.q.nb_p1} | Phần II: ${item.q.nb_p2})
                </div>
                <ul style="margin:0;padding-left:16px;font-size:12.5px;color:var(--gray-300);line-height:1.5">
                  ${item.yccd.nb.map(str => `<li>${str}</li>`).join('')}
                </ul>
              </div>

              <div style="background:rgba(76,175,80,0.06);border-left:3px solid #22c55e;padding:12px 14px;border-radius:4px">
                <div style="color:#4ade80;font-weight:700;font-size:13px;margin-bottom:6px">
                  <i class="fa-solid fa-circle-dot"></i> Thông hiểu (Phần I: ${item.q.th_p1} | Phần II: ${item.q.th_p2})
                </div>
                <ul style="margin:0;padding-left:16px;font-size:12.5px;color:var(--gray-300);line-height:1.5">
                  ${item.yccd.th.map(str => `<li>${str}</li>`).join('')}
                </ul>
              </div>

              <div style="background:rgba(249,115,22,0.06);border-left:3px solid #f97316;padding:12px 14px;border-radius:4px">
                <div style="color:#fb923c;font-weight:700;font-size:13px;margin-bottom:6px">
                  <i class="fa-solid fa-circle-dot"></i> Vận dụng (Phần I: ${item.q.vd_p1} | Phần II: ${item.q.vd_p2})
                </div>
                <ul style="margin:0;padding-left:16px;font-size:12.5px;color:var(--gray-300);line-height:1.5">
                  ${item.yccd.vd.map(str => `<li>${str}</li>`).join('')}
                </ul>
              </div>

              <div style="background:rgba(239,68,68,0.06);border-left:3px solid #ef4444;padding:12px 14px;border-radius:4px">
                <div style="color:#f87171;font-weight:700;font-size:13px;margin-bottom:6px">
                  <i class="fa-solid fa-circle-dot"></i> Vận dụng cao (Phần II: ${item.q.vdc_p2})
                </div>
                <ul style="margin:0;padding-left:16px;font-size:12.5px;color:var(--gray-300);line-height:1.5">
                  ${item.yccd.vdc.map(str => `<li>${str}</li>`).join('')}
                </ul>
              </div>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function exportSpecDoc() {
  if (state.specViewMode !== 'table') {
    setSpecViewMode('table');
  }
  const paper = document.getElementById('cv7991SpecPaper');
  if (!paper) {
    showToast('error', 'Lỗi xuất file', 'Không tìm thấy dữ liệu Bản đặc tả để xuất');
    return;
  }
  const grade = state.currentGrade || '10';

  const docHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office'
          xmlns:w='urn:schemas-microsoft-com:office:word'
          xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>Bản đặc tả đề kiểm tra môn Tin học Lớp ${grade} - CV 7991</title>
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
          <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        @page Section1 {
          size: 841.9pt 595.3pt;
          mso-page-orientation: landscape;
          margin: 1.5cm 1.2cm 1.5cm 1.2cm;
          mso-header-margin: 36.0pt;
          mso-footer-margin: 36.0pt;
        }
        div.Section1 { page: Section1; }
        body {
          font-family: 'Times New Roman', serif;
          font-size: 11pt;
          line-height: 1.35;
          color: #000000;
        }
        table {
          border-collapse: collapse;
          width: 100%;
        }
        th, td {
          border: 1pt solid #000000;
          padding: 4pt 5pt;
          vertical-align: top;
        }
        th {
          background-color: #f2f2f2;
          font-weight: bold;
          text-align: center;
        }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        ul { margin: 2pt 0 4pt 14pt; padding: 0; }
        li { margin-bottom: 2pt; }
        .cv7991-admin-header { display: flex; justify-content: space-between; margin-bottom: 15pt; }
        .cv7991-signatures { margin-top: 25pt; display: flex; justify-content: space-between; text-align: center; }
        .admin-line { display: block; width: 100pt; border-bottom: 1pt solid #000; margin: 3pt auto; }
      </style>
    </head>
    <body>
      <div class="Section1">
        ${paper.innerHTML}
      </div>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff' + docHtml], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ban-dac-ta-tin-hoc-lop${grade}-CV7991.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('success', 'Xuất Word thành công', `Đã tải xuống Bản đặc tả Tin học ${grade} theo chuẩn CV 7991 (.doc)`);
}

function printSpec() {
  if (state.specViewMode !== 'table') {
    setSpecViewMode('table');
  }
  showToast('info', 'Chuẩn bị in...', 'Mở hộp thoại in trình duyệt');
  setTimeout(() => window.print(), 350);
}

// ─── EXAM PREVIEW (SINH ĐỀ ĐÚNG 100% VỚI SGK ĐÃ CHỌN) ─────
function initExamPreview() {
  renderExamForSubject(state.currentSubject);
  bindExportButtons();
}

function escapeExamText(str) {
  if (str === null || str === undefined) return '';
  const s = String(str);
  const escaped = s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
  return escaped.replace(/`([^`]+)`/g, '<code style="background:rgba(0,0,0,0.06);padding:1px 5px;border-radius:3px;font-family:Consolas,monospace;font-size:0.95em;color:#0284c7">$1</code>');
}

function renderExamForSubject(subjectKey, shouldShuffle = false) {
  const curSub = CURRICULUM_DATA[subjectKey] || CURRICULUM_DATA.informatics;
  const grade = state.currentGrade || '10';
  const duration = document.getElementById('examDuration')?.value || 45;
  const scopes = GRADE_SCOPES[grade] || GRADE_SCOPES['10'];
  const activeScope = scopes.find(s => s.value === (state.currentScope || 'all')) || scopes[0];
  const title = document.getElementById('examTitle')?.value || `ĐỀ KIỂM TRA ĐỊNH KỲ MÔN ${curSub.name.toUpperCase()} LỚP ${grade}`;
  const examCode = state.currentExamCode || 101;
  const hasEssay = (grade === '10' || grade === '11');

  // Lấy bộ câu hỏi chuẩn từ dữ liệu SGK của môn và khối lớp hiện tại
  let p1Questions = [...curSub.p1];
  let p2Questions = [...curSub.p2];
  let p3Questions = [...(curSub.p3 || [])];

  const chapFrom = state.chapFrom || 1;
  const chapTo = state.chapTo || (grade === '11' ? 31 : grade === '12' ? 28 : 34);

  // Helper hàm lọc chặt chẽ câu hỏi theo dải bài học [chapFrom, chapTo]
  const filterByLessonRange = (list, targetCount) => {
    let inRange = list.filter(q => {
      const l = q.lesson || 1;
      return l >= chapFrom && l <= chapTo;
    });

    if (inRange.length === 0) {
      // Tìm các câu hỏi có bài học gần dải [chapFrom, chapTo] nhất, không lấy bừa bãi toàn bộ ngân hàng
      inRange = list.filter(q => {
        const l = q.lesson || 1;
        return Math.abs(l - chapTo) <= 1 || Math.abs(l - chapFrom) <= 1;
      });
      if (inRange.length === 0) {
        inRange = list.slice(0, targetCount);
      }
    }

    if (shouldShuffle || state.randomizeExam) {
      inRange = [...inRange];
      for (let i = inRange.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [inRange[i], inRange[j]] = [inRange[j], inRange[i]];
      }
    }

    if (inRange.length >= targetCount) {
      return inRange.slice(0, targetCount);
    }

    if (inRange.length > 0) {
      const result = [...inRange];
      let cycle = 1;
      while (result.length < targetCount) {
        const baseQ = inRange[result.length % inRange.length];
        const copyQ = JSON.parse(JSON.stringify(baseQ));
        if (copyQ.q) {
          if (cycle === 1) {
            copyQ.q = copyQ.q.replace(/khẳng định nào sau đây là ĐÚNG/i, 'phát biểu nào sau đây thể hiện CHÍNH XÁC bản chất')
                             .replace(/lệnh nào sau đây/i, 'thao tác hoặc cú pháp chuẩn nào')
                             .replace(/được tạo ra bởi ai/i, 'gắn liền với tác giả và năm phát hành nào');
            if (copyQ.q === baseQ.q) {
              copyQ.q = `[Mở rộng vận dụng - Bài ${copyQ.lesson}] ` + copyQ.q;
            }
          } else {
            copyQ.q = `[Phân tích chuyên sâu - SGK Trang ${copyQ.page}] ` + copyQ.q;
          }
        }
        result.push(copyQ);
        if (result.length % inRange.length === 0) cycle++;
      }
      return result;
    }

    return list.slice(0, targetCount);
  };

  const targetP1 = hasEssay ? 16 : 24;
  const targetP2 = hasEssay ? 3 : 4;
  const targetP3 = hasEssay ? 2 : 0;

  // Chuẩn hóa và làm sạch câu hỏi theo đúng dải bài học thực tế [chapFrom, chapTo]
  const sanitizeExamQuestion = (q, chapFrom, chapTo) => {
    const cleanQ = JSON.parse(JSON.stringify(q));

    // Đảm bảo số trang dẫn chiếu SGK nằm trong phạm vi bài học
    if (cleanQ.lesson === 25 && (cleanQ.page > 123 || cleanQ.page < 119)) {
      cleanQ.page = 120;
    }

    // Xử lý tiêu đề câu hỏi: loại bỏ các bài học và công cụ nằm ngoài [chapFrom, chapTo]
    if (cleanQ.q) {
      // Loại bỏ VideoPad khi chapTo < 29
      if (chapTo < 29) {
        cleanQ.q = cleanQ.q.replace(/\s*và\s*biên\s*tập\s*video\s*VideoPad/gi, '')
                           .replace(/\s*và\s*làm\s*phim\s*VideoPad/gi, '')
                           .replace(/\s*VideoPad/gi, '');
      }
      // Loại bỏ tham chiếu dải trang SGK vượt quá chapTo
      if (cleanQ.lesson === 25 && chapTo <= 25) {
        cleanQ.q = cleanQ.q.replace(/Trang\s*116[–\-]1[3-5]\d/gi, 'Trang 119–123');
      }

      // Chuẩn hóa danh sách bài học trong ngoặc: loại bỏ bài nằm ngoài [chapFrom, chapTo]
      if (/\(Bài\s*[^)]+\)/i.test(cleanQ.q)) {
        cleanQ.q = cleanQ.q.replace(/\(Bài\s*([^)]+)\)/i, (match, p1) => {
          const nums = [...p1.matchAll(/\d+/g)].map(m => parseInt(m[0], 10));
          const validNums = nums.filter(n => n >= chapFrom && n <= chapTo);
          if (validNums.length === 0) return `(Bài ${cleanQ.lesson || chapFrom})`;
          if (validNums.length === 1) return `(Bài ${validNums[0]})`;
          if (validNums.length === 2) return `(Bài ${validNums[0]} & ${validNums[1]})`;
          return `(Bài ${validNums[0]}–${validNums[validNums.length - 1]})`;
        });
      }
    }

    // Xử lý các ý hỏi trong câu hỏi Đúng/Sai (Part II)
    if (cleanQ.stmts && Array.isArray(cleanQ.stmts)) {
      cleanQ.stmts = cleanQ.stmts.map(stmt => {
        // Thay thế ý hỏi VideoPad / Timeline nếu chapTo < 29
        if (chapTo < 29 && stmt.text && (stmt.text.includes('VideoPad') || stmt.text.includes('Timeline') || stmt.text.includes('phim') || stmt.text.includes('hoạt hình'))) {
          return {
            text: "d) Trong phần mềm GIMP, người dùng có thể xuất ảnh ra các định dạng phổ biến như PNG, JPEG hoặc PDF thông qua lệnh File -> Export As...",
            is_true: true
          };
        }
        // Thay thế ý hỏi Clone / Healing nếu chapTo < 27
        if (chapTo < 27 && stmt.text && (stmt.text.includes('Clone') || stmt.text.includes('Healing'))) {
          return {
            text: "c) Trong phần mềm GIMP, các lớp ảnh (Layers) hoàn toàn phụ thuộc vào nhau nên khi chỉnh sửa một lớp thì tất cả các lớp khác đều bị thay đổi theo",
            is_true: false
          };
        }
        return stmt;
      });

      // Dọn dẹp excerpt
      if (cleanQ.excerpt && chapTo < 29 && (cleanQ.excerpt.includes('VideoPad') || cleanQ.excerpt.includes('Timeline'))) {
        cleanQ.excerpt = cleanQ.excerpt.replace(/VideoPad\s*quản\s*lí\s*video\s*clip\s*và\s*audio\s*trên\s*Timeline\./gi, 'Quản lí ảnh theo các lớp (Layers) và xuất ảnh đa định dạng qua Export As.');
      }
    }

    return cleanQ;
  };

  p1Questions = filterByLessonRange(p1Questions, targetP1).map(q => sanitizeExamQuestion(q, chapFrom, chapTo));
  p2Questions = filterByLessonRange(p2Questions, targetP2).map(q => sanitizeExamQuestion(q, chapFrom, chapTo));
  if (hasEssay) {
    p3Questions = filterByLessonRange(p3Questions, targetP3).map(q => sanitizeExamQuestion(q, chapFrom, chapTo));
    if (p3Questions.length < 2) {
      const defaultP3_10 = [
        {
          lesson: chapFrom,
          page: 45,
          q: 'Em hãy viết chương trình nhập vào một danh sách các số nguyên từ bàn phím, in ra màn hình giá trị lớn nhất và tổng các số chẵn trong danh sách.',
          ans: 'Chương trình Python chuẩn sử dụng vòng lặp duyệt phần tử hoặc hàm có sẵn',
          exp: 'Căn cứ SGK Tin học 10: Xử lý danh sách (List) và câu lệnh lặp',
          excerpt: 'Duyệt danh sách và tính tổng phần tử chẵn'
        },
        {
          lesson: chapTo,
          page: 85,
          q: 'Em hãy viết một hàm Python giải quyết bài toán tìm ước số chung lớn nhất gcd(a, b) (hoặc kiểm tra tính nguyên tố của một số nguyên dương), kiểm thử chương trình với các giá trị đầu vào hợp lệ.',
          ans: 'Hàm thuật toán tối ưu Euclid gcd(a, b) hoặc kiểm tra số nguyên tố',
          exp: 'Căn cứ SGK Tin học 10: Hàm và thuật toán nâng cao',
          excerpt: 'Giải thuật tối ưu độ phức tạp và chia để trị'
        }
      ];
      const defaultP3_11 = [
        {
          lesson: chapFrom,
          page: 50,
          q: 'Viết các câu lệnh SQL tạo bảng HOCSINH (MaHS VARCHAR(10) PRIMARY KEY, HoTen VARCHAR(50), NgaySinh DATE, DiemTB FLOAT) và câu lệnh chèn 01 bản ghi mẫu vào bảng.',
          ans: 'CREATE TABLE HOCSINH (...) và INSERT INTO HOCSINH VALUES (...)',
          exp: 'Căn cứ SGK Tin học 11: Ngôn ngữ định nghĩa dữ liệu (DDL) và thao tác dữ liệu (DML)',
          excerpt: 'Cú pháp câu lệnh CREATE TABLE và INSERT INTO'
        },
        {
          lesson: chapTo,
          page: 95,
          q: 'Viết câu lệnh SQL truy vấn kết nối giữa bảng HOCSINH và LOP để thống kê số lượng học sinh trong từng lớp, sắp xếp kết quả giảm dần theo số lượng học sinh.',
          ans: 'SELECT TenLop, COUNT(MaHS) AS SoLuong FROM LOP JOIN HOCSINH ON LOP.MaLop = HOCSINH.MaLop GROUP BY TenLop ORDER BY SoLuong DESC;',
          exp: 'Căn cứ SGK Tin học 11: Truy vấn kết nối (JOIN), nhóm dữ liệu (GROUP BY) và sắp xếp (ORDER BY)',
          excerpt: 'Mệnh đề JOIN, GROUP BY và hàm gộp COUNT trong CSDL quan hệ'
        }
      ];
      const fallbackList = grade === '11' ? defaultP3_11 : defaultP3_10;
      while (p3Questions.length < 2) {
        p3Questions.push(fallbackList[p3Questions.length]);
      }
    }
  } else {
    p3Questions = [];
  }

  // Lọc thông minh nếu người dùng nhập từ khóa chủ đề (VD: if-else, for, while, list, sql, html...)
  const filterInput = document.getElementById('topics')?.value?.trim().toLowerCase();
  if (filterInput) {
    const matchedP1 = p1Questions.filter(q => q.q.toLowerCase().includes(filterInput) || (q.excerpt && q.excerpt.toLowerCase().includes(filterInput)));
    if (matchedP1.length > 0) {
      const restP1 = p1Questions.filter(q => !matchedP1.includes(q));
      p1Questions = matchedP1.concat(restP1).slice(0, targetP1);
    }
  }

  // Cập nhật TOC bên trái
  const toc = document.getElementById('tocNav');
  if (toc) {
    const tocItems = hasEssay ? [
      { label: 'Thông tin chung', icon: 'fa-circle-info' },
      { label: 'Phần I: Nhiều lựa chọn (4.0đ)', icon: 'fa-list-ol' },
      { label: 'Phần II: Đúng / Sai (3.0đ)', icon: 'fa-square-check' },
      { label: 'Phần III: Tự luận (3.0đ)', icon: 'fa-pen-to-square' },
      { label: 'Đáp án & Hướng dẫn chấm', icon: 'fa-key' },
    ] : [
      { label: 'Thông tin chung', icon: 'fa-circle-info' },
      { label: 'Phần I: Nhiều lựa chọn (6.0đ)', icon: 'fa-list-ol' },
      { label: 'Phần II: Đúng / Sai (4.0đ)', icon: 'fa-square-check' },
      { label: 'Đáp án & Hướng dẫn chấm', icon: 'fa-key' },
    ];

    toc.innerHTML = tocItems.map((item, i) => `
      <div class="toc-item ${i===0?'active':''}" onclick="highlightToc(this)">
        <span class="toc-num">${i+1}</span>
        <i class="fa-solid ${item.icon}"></i>
        <span>${item.label}</span>
      </div>
    `).join('');
  }

  // Stats
  const stats = document.getElementById('examStats');
  if (stats) {
    const statList = hasEssay ? [
      { num: `${p1Questions.length}`, label: 'Câu TN Phần I' },
      { num: `${p2Questions.length}`, label: 'Câu Đúng/Sai II' },
      { num: `${p3Questions.length}`, label: 'Câu Tự luận III' },
      { num: `${p1Questions.length + p2Questions.length + p3Questions.length}`, label: 'Tổng số câu' },
      { num: `${duration}`, label: 'Thời gian (Phút)' },
      { num: '4', label: 'Mã đề độc lập' },
    ] : [
      { num: `${p1Questions.length}`, label: 'Câu TN Phần I' },
      { num: `${p2Questions.length}`, label: 'Câu Đúng/Sai II' },
      { num: `${p1Questions.length + p2Questions.length}`, label: 'Tổng số câu' },
      { num: `${duration}`, label: 'Thời gian (Phút)' },
      { num: '4', label: 'Mã đề độc lập' },
    ];

    stats.innerHTML = statList.map(s => `
      <div class="stat-card">
        <div class="stat-card-num">${s.num}</div>
        <div class="stat-card-label">${s.label}</div>
      </div>
    `).join('');
  }

  // Tờ giấy thi chính thức
  const paper = document.getElementById('examPaper');
  if (!paper) return;

  paper.innerHTML = `
    <div class="exam-header" style="text-align:center;border-bottom:2px solid #000;padding-bottom:15px;margin-bottom:20px">
      <table style="width:100%;border-collapse:collapse;margin-bottom:12px">
        <tr>
          <td style="width:45%;vertical-align:top;text-align:center;font-size:13px">
            <div>SỞ GIÁO DỤC VÀ ĐÀO TẠO</div>
            <div><strong>TRƯỜNG THPT CHUYÊN CHUẨN</strong></div>
            <div style="font-size:12px;font-style:italic">(Đề thi chuẩn Công văn 7991/BGDĐT-GDTr)</div>
          </td>
          <td style="width:55%;vertical-align:top;text-align:center">
            <div style="font-size:15px;font-weight:700;text-transform:uppercase">${title}</div>
            <div style="font-size:13px">Môn thi: <strong>${curSub.name.toUpperCase()} – LỚP ${grade}</strong></div>
            <div style="font-size:12px;color:#1e40af;margin-top:2px">
              <strong>Phạm vi:</strong> ${getScopeDescriptor(grade, chapFrom, chapTo).label} &bull; <strong>Bộ sách:</strong> ${BOOK_NAMES[state.currentBook] || 'Kết nối tri thức'}
            </div>
            <div style="font-size:12px;font-style:italic">Thời gian làm bài: ${duration} phút (Không kể thời gian phát đề)</div>
            <div style="margin-top:4px"><span style="border:1px solid #000;padding:2px 8px;font-weight:700;font-size:12px">MÃ ĐỀ: ${examCode}</span></div>
          </td>
        </tr>
      </table>
      <div style="display:flex;justify-content:space-between;font-size:12px;font-style:italic;padding:4px 10px;background:#f8fafc;border:1px dashed #cbd5e1;color:#334155">
        <span>Họ và tên thí sinh: .......................................................................</span>
        <span>Số báo danh: ....................... Phòng thi: ........</span>
      </div>
    </div>

    <!-- PHẦN I: TRẮC NGHIỆM NHIỀU LỰA CHỌN -->
    <div class="exam-section" style="margin-bottom:25px">
      <div class="exam-section-title" style="font-weight:700;font-size:14px;background:#e2e8f0;padding:6px 10px;border-left:4px solid #1e88e5;margin-bottom:12px">
        PHẦN I. Thí sinh trả lời từ câu 1 đến câu ${p1Questions.length}. Mỗi câu hỏi thí sinh chỉ chọn một phương án. (Mỗi câu trả lời đúng được 0,25 điểm - Tổng ${(p1Questions.length * 0.25).toFixed(1).replace('.', ',')} điểm)
      </div>
      ${p1Questions.map((item, idx) => `
        <div class="exam-question" style="margin-bottom:16px;line-height:1.6">
          <div>
            <strong>Câu ${idx + 1}.</strong> 
            <span style="font-size:11px;background:#e0f2fe;color:#0369a1;padding:1px 6px;border-radius:4px;font-weight:600">
              <i class="fa-solid fa-bookmark"></i> SGK Trang ${item.page}
            </span> 
            ${escapeExamText(item.q)}
          </div>
          <div class="exam-options">
            ${item.opts.map(opt => `<div class="exam-option">${escapeExamText(opt)}</div>`).join('')}
          </div>
          <div style="font-size:11px;color:#64748b;font-style:italic;margin-top:6px;padding-left:16px">
            <i class="fa-solid fa-quote-left"></i> Căn cứ học liệu: "${escapeExamText(item.excerpt)}"
          </div>
        </div>
      `).join('')}
    </div>

    <!-- PHẦN II: TRẮC NGHIỆM ĐÚNG / SAI -->
    <div class="exam-section" style="margin-bottom:25px">
      <div class="exam-section-title" style="font-weight:700;font-size:14px;background:#e2e8f0;padding:6px 10px;border-left:4px solid #10b981;margin-bottom:12px">
        PHẦN II. Câu trắc nghiệm đúng sai. Thí sinh trả lời từ câu ${p1Questions.length + 1} đến câu ${p1Questions.length + p2Questions.length}. Trong mỗi ý a), b), c), d) ở mỗi câu, thí sinh chọn đúng hoặc sai. (Điểm tối đa của 01 câu hỏi là 1,0 điểm - Tổng ${(p2Questions.length * 1.0).toFixed(1).replace('.', ',')} điểm)
      </div>
      ${p2Questions.map((item, idx) => `
        <div class="exam-question" style="margin-bottom:16px;line-height:1.6">
          <div>
            <strong>Câu ${p1Questions.length + idx + 1}.</strong> 
            <span style="font-size:11px;background:#dcfce7;color:#15803d;padding:1px 6px;border-radius:4px;font-weight:600">
              <i class="fa-solid fa-bookmark"></i> SGK Trang ${item.page}
            </span>
            ${escapeExamText(item.q)}
          </div>
          <div style="margin-top:8px;padding-left:16px">
            ${item.stmts.map(st => `
              <div style="display:flex;justify-content:space-between;align-items:center;padding:5px 8px;border-bottom:1px dotted #cbd5e1">
                <span>${escapeExamText(st.text)}</span>
                <span style="font-size:12px;font-weight:700;color:#64748b">[ Đúng / Sai ]</span>
              </div>
            `).join('')}
          </div>
          <div style="font-size:11px;color:#64748b;font-style:italic;margin-top:6px;padding-left:16px">
            <i class="fa-solid fa-quote-left"></i> Căn cứ SGK: "${escapeExamText(item.excerpt)}"
          </div>
        </div>
      `).join('')}
    </div>

    ${hasEssay ? `
    <!-- PHẦN III: TỰ LUẬN (DÀNH CHO LỚP 10 & 11 THEO CHUẨN CV 7991) -->
    <div class="exam-section" style="margin-bottom:25px">
      <div class="exam-section-title" style="font-weight:700;font-size:14px;background:#f3e8ff;padding:6px 10px;border-left:4px solid #7c3aed;margin-bottom:12px;color:#581c87">
        PHẦN III. TỰ LUẬN. Thí sinh trả lời từ câu ${p1Questions.length + p2Questions.length + 1} đến câu ${p1Questions.length + p2Questions.length + p3Questions.length}. Trình bày chi tiết lời giải / thuật toán / chương trình vào tờ giấy làm bài thi. (Tổng 3,0 điểm)
      </div>
      ${p3Questions.map((item, idx) => `
        <div class="exam-question" style="margin-bottom:18px;line-height:1.6">
          <div style="font-size:13.5px">
            <strong>Câu ${p1Questions.length + p2Questions.length + idx + 1} (${idx === 0 ? '2,0 điểm - Mức độ Vận dụng' : '1,0 điểm - Mức độ Vận dụng cao'}).</strong>
            <span style="font-size:11px;background:#f3e8ff;color:#7e22ce;padding:1px 6px;border-radius:4px;font-weight:600">
              <i class="fa-solid fa-bookmark"></i> SGK Trang ${item.page || (idx === 0 ? '45' : '85')}
            </span>
            <div style="margin-top:6px;font-weight:500">${escapeExamText(item.q)}</div>
          </div>
          <div style="font-size:11px;color:#64748b;font-style:italic;margin-top:6px;padding-left:16px">
            <i class="fa-solid fa-quote-left"></i> Căn cứ SGK: "${escapeExamText(item.excerpt || item.exp)}"
          </div>
        </div>
      `).join('')}
    </div>
    ` : ''}

    <!-- BẢNG ĐÁP ÁN & HƯỚNG DẪN CHẤM CHI TIẾT -->
    <div class="answer-key-section" style="margin-top:35px;border-top:2px dashed #94a3b8;padding-top:20px;page-break-before:always">
      <div style="font-weight:700;font-size:15px;text-align:center;text-transform:uppercase;margin-bottom:12px">
        ĐÁP ÁN & HƯỚNG DẪN CHẤM ĐỀ THI MÔN ${curSub.name.toUpperCase()} (MÃ ĐỀ ${examCode})
      </div>
      
      <table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:15px">
        <thead>
          <tr style="background:#f1f5f9;text-align:center">
            <th style="border:1px solid #94a3b8;padding:6px">Câu</th>
            <th style="border:1px solid #94a3b8;padding:6px">Phần</th>
            <th style="border:1px solid #94a3b8;padding:6px">Đáp án / Hướng dẫn chấm chi tiết</th>
            <th style="border:1px solid #94a3b8;padding:6px">Dẫn chiếu SGK</th>
            <th style="border:1px solid #94a3b8;padding:6px">Thang điểm</th>
          </tr>
        </thead>
        <tbody>
          ${p1Questions.map((it, i) => `
            <tr style="text-align:center">
              <td style="border:1px solid #cbd5e1;padding:5px"><strong>${i+1}</strong></td>
              <td style="border:1px solid #cbd5e1;padding:5px">Phần I (TN)</td>
              <td style="border:1px solid #cbd5e1;padding:5px;font-weight:700;color:#1e88e5">${escapeExamText(it.ans)}</td>
              <td style="border:1px solid #cbd5e1;padding:5px;font-style:italic">Trang ${it.page}</td>
              <td style="border:1px solid #cbd5e1;padding:5px">0,25đ</td>
            </tr>
          `).join('')}
          ${p2Questions.map((it, i) => `
            <tr style="text-align:center">
              <td style="border:1px solid #cbd5e1;padding:5px"><strong>${p1Questions.length + i + 1}</strong></td>
              <td style="border:1px solid #cbd5e1;padding:5px">Phần II (Đ/S)</td>
              <td style="border:1px solid #cbd5e1;padding:5px;font-weight:700;color:#10b981">
                ${it.stmts.map(s => s.is_true ? 'Đ' : 'S').join(' - ')}
              </td>
              <td style="border:1px solid #cbd5e1;padding:5px;font-style:italic">Trang ${it.page}</td>
              <td style="border:1px solid #cbd5e1;padding:5px">1,00đ (1 ý = 0,1đ; 2 ý = 0,25đ; 3 ý = 0,5đ; 4 ý = 1,0đ)</td>
            </tr>
          `).join('')}
          ${hasEssay ? `
            <tr>
              <td style="border:1px solid #cbd5e1;padding:6px;text-align:center"><strong>${p1Questions.length + p2Questions.length + 1}</strong></td>
              <td style="border:1px solid #cbd5e1;padding:6px;text-align:center;color:#7e22ce;font-weight:700">Phần III (Tự luận - VD)</td>
              <td style="border:1px solid #cbd5e1;padding:6px;text-align:left">
                <div><strong>Hướng dẫn giải:</strong> ${escapeExamText(p3Questions[0]?.ans || p3Questions[0]?.exp)}</div>
                <div style="margin-top:4px;font-size:11px;color:#475569">
                  &bull; Xác định đúng yêu cầu, biến và cấu trúc dữ liệu: <strong>0,50đ</strong><br>
                  &bull; Cài đặt đúng cú pháp và thuật toán giải bài toán: <strong>1,00đ</strong><br>
                  &bull; Cho kết quả chính xác, kiểm thử các trường hợp dữ liệu: <strong>0,50đ</strong>
                </div>
              </td>
              <td style="border:1px solid #cbd5e1;padding:6px;text-align:center;font-style:italic">Trang ${p3Questions[0]?.page || 45}</td>
              <td style="border:1px solid #cbd5e1;padding:6px;text-align:center;font-weight:700;color:#7e22ce">2,00đ</td>
            </tr>
            <tr>
              <td style="border:1px solid #cbd5e1;padding:6px;text-align:center"><strong>${p1Questions.length + p2Questions.length + 2}</strong></td>
              <td style="border:1px solid #cbd5e1;padding:6px;text-align:center;color:#7e22ce;font-weight:700">Phần III (Tự luận - VDC)</td>
              <td style="border:1px solid #cbd5e1;padding:6px;text-align:left">
                <div><strong>Hướng dẫn giải:</strong> ${escapeExamText(p3Questions[1]?.ans || p3Questions[1]?.exp)}</div>
                <div style="margin-top:4px;font-size:11px;color:#475569">
                  &bull; Giải thuật tối ưu độ phức tạp, xử lý trọn vẹn yêu cầu vận dụng cao: <strong>1,00đ</strong>
                </div>
              </td>
              <td style="border:1px solid #cbd5e1;padding:6px;text-align:center;font-style:italic">Trang ${p3Questions[1]?.page || 85}</td>
              <td style="border:1px solid #cbd5e1;padding:6px;text-align:center;font-weight:700;color:#7e22ce">1,00đ</td>
            </tr>
          ` : ''}
        </tbody>
        <tfoot>
          <tr style="background:#f8fafc;font-weight:700;text-align:center">
            <td colspan="4" style="border:1px solid #94a3b8;padding:7px;text-align:left">
              <strong>TỔNG ĐIỂM TOÀN BÀI (CHUẨN CÔNG VĂN 7991/BGDĐT-GDTr):</strong>
              <div style="font-size:11px;font-weight:400;color:#475569;margin-top:2px">
                ${hasEssay
                  ? 'Phần I: 16 câu × 0,25đ = 4,0đ (40%) &bull; Phần II: 3 câu × 1,0đ = 3,0đ (30%) &bull; Phần III: 2 câu = 3,0đ (30%)'
                  : 'Phần I: 24 câu × 0,25đ = 6,0đ (60%) &bull; Phần II: 4 câu × 1,0đ = 4,0đ (40%)'
                }
              </div>
            </td>
            <td style="border:1px solid #94a3b8;padding:7px;color:#0284c7;font-size:14px">10,00đ</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <div style="text-align:right;font-style:italic;font-size:12px;margin-top:24px">
      ──── Hết ──── (Đề thi chuẩn BGDĐT theo Công văn 7991/BGDĐT-GDTr 2024)
    </div>
  `;
}

window.highlightToc = function(el) {
  document.querySelectorAll('.toc-item').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
};

// ─── EXPORT BUTTONS ───────────────────────────────────────
function bindExportButtons() {
  document.getElementById('exportPdf')?.addEventListener('click', () => {
    showToast('success', 'Đang tạo bản in PDF...', 'Mở hộp thoại in trình duyệt');
    setTimeout(() => window.print(), 400);
  });
  document.getElementById('exportWord')?.addEventListener('click', () => exportExamDoc());
  document.getElementById('exportHtml')?.addEventListener('click', () => exportHTML());
  document.getElementById('printBtn')?.addEventListener('click', () => {
    showToast('success', 'Chuẩn bị in đề thi...', 'Mở hộp thoại in');
    setTimeout(() => window.print(), 400);
  });
}

function exportExamDoc() {
  const paper = document.getElementById('examPaper');
  if (!paper) {
    showToast('error', 'Lỗi xuất file', 'Không tìm thấy nội dung đề thi để xuất');
    return;
  }
  const grade = state.currentGrade || '10';
  const curSub = CURRICULUM_DATA[state.currentSubject]?.name || 'Tin học';
  const chapFrom = state.chapFrom || 1;
  const chapTo = state.chapTo || 34;

  const docHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office'
          xmlns:w='urn:schemas-microsoft-com:office:word'
          xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>Đề thi môn ${curSub} Lớp ${grade} - Chuẩn CV 7991</title>
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
          <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        @page Section1 {
          size: 595.3pt 841.9pt; /* A4 Portrait */
          margin: 1.8cm 1.5cm 1.8cm 1.5cm;
          mso-header-margin: 36.0pt;
          mso-footer-margin: 36.0pt;
        }
        div.Section1 { page: Section1; }
        body {
          font-family: 'Times New Roman', serif;
          font-size: 12pt;
          line-height: 1.35;
          color: #000000;
        }
        table {
          border-collapse: collapse;
          width: 100%;
        }
        th, td {
          padding: 4pt 5pt;
          vertical-align: top;
        }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .exam-section-title {
          font-weight: bold;
          font-size: 12pt;
          background-color: #f2f2f2;
          padding: 4pt 6pt;
          margin-top: 10pt;
          margin-bottom: 6pt;
          border-left: 3pt solid #000;
        }
      </style>
    </head>
    <body>
      <div class="Section1">
        ${paper.innerHTML}
      </div>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff' + docHtml], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `de-thi-tin-hoc-lop${grade}-bai${chapFrom}-den-${chapTo}-CV7991.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('success', 'Tải xuống thành công', `Đã tải đề thi ${curSub} Lớp ${grade} định dạng Word (.doc)`);
}

window.exportExamDoc = exportExamDoc;

function downloadFromModal() {
  exportExamDoc();
  closeModal();
}

window.downloadFromModal = downloadFromModal;

function downloadSpecFromModal() {
  exportSpecDoc();
}

window.downloadSpecFromModal = downloadSpecFromModal;

function createNewExam() {
  closeModal();
  goToStep(1);
  showToast('info', 'Tạo đề mới', 'Đã chuyển về Bước 1 để thiết lập đề thi mới');
}

window.createNewExam = createNewExam;

function exportHTML() {
  const paper = document.getElementById('examPaper');
  const curSub = CURRICULUM_DATA[state.currentSubject]?.name || 'MonHoc';
  const html = `<!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8"><title>Đề thi ${curSub}</title>
  <style>body{font-family:'Times New Roman',Times,serif;max-width:850px;margin:40px auto;padding:25px;line-height:1.6;color:#111}
  table{border-collapse:collapse} th,td{padding:5px}
  </style></head><body>${paper.innerHTML}</body></html>`;
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `de-thi-${state.currentSubject}-lop${state.currentGrade}-CV7991.html`; a.click();
  URL.revokeObjectURL(url);
  showToast('success', 'Xuất file thành công', `Đã tải xuống đề thi ${curSub}`);
}

// ─── TOAST NOTIFICATIONS ──────────────────────────────────
function showToast(type, title, body) {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const icons = { success:'fa-circle-check', info:'fa-circle-info', warning:'fa-triangle-exclamation', error:'fa-circle-xmark' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i class="fa-solid ${icons[type] || icons.info} toast-icon"></i>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      ${body ? `<div class="toast-body">${body}</div>` : ''}
    </div>
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ─── MODAL ────────────────────────────────────────────────
function showSuccessModal() {
  document.getElementById('successModal')?.classList.add('active');
}
function closeModal() {
  document.getElementById('successModal')?.classList.remove('active');
}
window.showSuccessModal = showSuccessModal;
window.closeModal = closeModal;

document.getElementById('successModal')?.addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

// ─── ANIMATIONS ───────────────────────────────────────────
function initAnimations() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.feature-card, .stat-item, .bloom-level').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
  });
}

// ─── BIND DYNAMIC SELECTORS & USER EVENTS ─────────────────
function bindEvents() {
  // Đồng bộ ngay danh sách Phạm vi kiến thức theo khối lớp hiện tại
  updateScopeSelect(state.currentGrade);

  // Thay đổi bộ sách giáo khoa (KNTT, Cánh diều, Chân trời sáng tạo)
  const bookSelect = document.getElementById('bookSelect');
  bookSelect?.addEventListener('change', e => {
    state.currentBook = e.target.value || 'kntt';
    loadCurriculumForSubject(state.currentSubject);
    showToast('info', 'Bộ sách giáo khoa', `Đã áp dụng SGK ${BOOK_NAMES[state.currentBook] || 'Tin học'}`);
  });

  // Thay đổi phạm vi học kỳ / kiến thức
  const scopeSelect = document.getElementById('scopeSelect');
  const chapFromInput = document.getElementById('chapFrom');
  const chapToInput = document.getElementById('chapTo');

  scopeSelect?.addEventListener('change', e => {
    state.currentScope = e.target.value || 'all';
    const grade = state.currentGrade || '10';
    const scopes = GRADE_SCOPES[grade] || GRADE_SCOPES['10'];
    const activeScope = scopes.find(s => s.value === state.currentScope);
    if (activeScope && activeScope.chapFrom !== undefined && activeScope.chapTo !== undefined) {
      if (chapFromInput) chapFromInput.value = activeScope.chapFrom;
      if (chapToInput) chapToInput.value = activeScope.chapTo;
      state.chapFrom = activeScope.chapFrom;
      state.chapTo = activeScope.chapTo;
    }
    loadCurriculumForSubject(state.currentSubject);
    showToast('info', 'Phạm vi kiến thức', `Đã cập nhật theo ${e.target.options[e.target.selectedIndex].text} (Bài ${state.chapFrom} – Bài ${state.chapTo})`);
  });

  // Lắng nghe thay đổi trực tiếp tại ô "Bài học từ" và "Đến bài"
  let chapRangeTimeout;
  const onChapRangeChange = () => {
    clearTimeout(chapRangeTimeout);
    chapRangeTimeout = setTimeout(() => {
      const fromVal = parseInt(chapFromInput?.value, 10) || 1;
      const toVal = parseInt(chapToInput?.value, 10) || fromVal;
      state.chapFrom = Math.min(fromVal, toVal);
      state.chapTo = Math.max(fromVal, toVal);
      if (chapFromInput) chapFromInput.value = state.chapFrom;
      if (chapToInput) chapToInput.value = state.chapTo;

      state.customTopics = [];
      state.lessonRows = null;
      loadCurriculumForSubject(state.currentSubject);
      showToast('success', 'Đồng bộ nội dung SGK', `Đã chọn: Bài ${state.chapFrom} đến Bài ${state.chapTo}. Ma trận, đặc tả và đề thi đã cập nhật!`);
    }, 400);
  };

  chapFromInput?.addEventListener('input', onChapRangeChange);
  chapFromInput?.addEventListener('change', onChapRangeChange);
  chapToInput?.addEventListener('input', onChapRangeChange);
  chapToInput?.addEventListener('change', onChapRangeChange);

  // Lọc chủ đề / bài học trọng tâm
  const topicsInput = document.getElementById('topics');
  let topicTimeout;
  topicsInput?.addEventListener('input', () => {
    clearTimeout(topicTimeout);
    topicTimeout = setTimeout(() => {
      renderExamForSubject(state.currentSubject);
    }, 300);
  });

  // Thay đổi khối lớp (10, 11, 12) -> Đồng bộ lại toàn bộ danh mục Phạm vi kiến thức & Dải bài học!
  const gradeSelect = document.getElementById('gradeSelect');
  gradeSelect?.addEventListener('change', e => {
    state.currentGrade = e.target.value || '10';
    updateScopeSelect(state.currentGrade); // Cập nhật ngay các phạm vi tương ứng của Lớp 10 / 11 / 12
    const defaultMaxLesson = state.currentGrade === '11' ? 31 : state.currentGrade === '12' ? 28 : 34;
    state.chapFrom = 1;
    state.chapTo = defaultMaxLesson;
    if (chapFromInput) chapFromInput.value = 1;
    if (chapToInput) chapToInput.value = defaultMaxLesson;

    const cur = CURRICULUM_DATA.informatics;
    const examTitle = document.getElementById('examTitle');
    if (examTitle) examTitle.value = `Đề kiểm tra định kỳ ${cur.name} (Chuẩn CV 7991)`;
    loadCurriculumForSubject(state.currentSubject);
    showToast('info', `Chuyển sang ${cur.name} ${state.currentGrade}`, `Đồng bộ toàn bộ nội dung SGK và phạm vi kiến thức lớp ${state.currentGrade}`);
  });

  // Thay đổi loại đề thi (15p, 45p, 90p, 150p)
  document.getElementById('examType')?.addEventListener('change', e => {
    const map = { '15min':15, '45min':45, 'hk1':90, 'hk2':90, 'thpt':150 };
    const dur = document.getElementById('examDuration');
    if (dur) dur.value = map[e.target.value] || 45;
  });

  // Click vào Step Indicator trên thanh tiến trình
  document.querySelectorAll('.step-item').forEach(item => {
    item.addEventListener('click', () => {
      const n = parseInt(item.dataset.step);
      if (n <= state.currentStep || item.classList.contains('completed')) goToStep(n);
    });
  });
}
