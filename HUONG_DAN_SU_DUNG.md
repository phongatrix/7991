# HƯỚNG DẪN SỬ DỤNG HỆ THỐNG FENG's EXAM
## PHẦN MỀM TẠO MA TRẬN, BẢN ĐẶC TẢ VÀ ĐỀ THI CHUẨN CÔNG VĂN 7991/BGDĐT-GDTr

---

## 📖 MỤC LỤC
1. [Giới thiệu tổng quan](#1-giới-thiệu-tổng-quan)
2. [Yêu cầu hệ thống](#2-yêu-cầu-hệ-thống)
3. [Cách cài đặt và khởi chạy (1-Click)](#3-cách-cài-đặt-và-khởi-chạy-1-click)
4. [Hướng dẫn sử dụng chi tiết (Quy trình 4 Bước)](#4-hướng-dẫn-sử-dụng-chi-tiết-quy-trình-4-bước)
   - [Bước 1: Chọn phạm vi & Tải lên học liệu SGK](#bước-1-chọn-phạm-vi--tải-lên-học-liệu-sgk)
   - [Bước 2: Xây dựng & Tùy biến Ma trận Đề kiểm tra](#bước-2-xây-dựng--tùy-biến-ma-trận-đề-kiểm-tra)
   - [Bước 3: Bản đặc tả đề thi chuẩn Bộ GDĐT](#bước-3-bản-đặc-tả-đề-thi-chuẩn-bộ-gddt)
   - [Bước 4: Sinh Đề thi, Đáp án & Hướng dẫn chấm](#bước-4-sinh-đề-thi-đáp-án--hướng-dẫn-chấm)
5. [Cấu trúc tệp tin trong hệ thống](#5-cấu-trúc-tệp-tin-trong-hệ-thống)
6. [Cấu hình AI & Cơ sở dữ liệu nâng cao](#6-cấu-hình-ai--cơ-sở-dữ-liệu-nâng-cao)
7. [Xử lý sự cố thường gặp (FAQ)](#7-xử-lý-sự-cố-thường-gặp-faq)

---

## 1. Giới thiệu tổng quan

**FENG's EXAM** là phần mềm chuyên nghiệp hỗ trợ giáo viên và các nhà quản lý giáo dục tự động hóa quy trình xây dựng **Ma trận đề**, **Bản đặc tả yêu cầu cần đạt** và **Đề kiểm tra định kỳ** bám sát 100% quy định tại:
- **Công văn số 7991/BGDĐT-GDTr** ban hành ngày 17/12/2024 của Bộ Giáo dục và Đào tạo.
- Chương trình Giáo dục Phổ thông 2018 (GDPT 2018).
- Bộ sách giáo khoa hiện hành: **Kết nối tri thức với cuộc sống**, Cánh Diều, Chân trời sáng tạo.

### 🌟 Tính năng nổi bật:
- **Chuẩn hóa tỷ lệ nhận thức CV 7991**: Nhận biết (40%), Thông hiểu (30%), Vận dụng (20%), Vận dụng cao (10%) = Tổng điểm 10.0.
- **Cấu trúc đề thi 3 phần chuẩn Bộ GDĐT**:
  - *Phần I*: Trắc nghiệm nhiều lựa chọn (0,25 điểm/câu).
  - *Phần II*: Trắc nghiệm Đúng / Sai (tối đa 1,0 điểm/câu với thang điểm 0,1 - 0,25 - 0,5 - 1,0 điểm).
  - *Phần III*: Tự luận giải quyết vấn đề (dành cho Lớp 10 & 11 - Tổng 3,0 điểm).
- **Bám sát 100% ngữ nghĩa SGK**: Mọi câu hỏi trắc nghiệm đều có trích dẫn câu chữ gốc từ SGK (`textbook_excerpt`) và số trang cụ thể làm dẫn chứng khoa học.
- **Không trùng lặp**: Mỗi lần nhấn *"Tạo lại ma trận ngẫu nhiên"* hoặc *"Sinh đề thi mới"*, hệ thống tự động đổi mã đề và tạo ra các câu hỏi với nội dung khác nhau, không bị trùng lặp.
- **Xuất file Word (.doc) 1-click**: Xuất trọn bộ Ma trận, Bản đặc tả và Đề thi kèm Hướng dẫn chấm theo đúng thể thức văn bản hành chính của Bộ GDĐT để in ấn và lưu trữ.

---

## 2. Yêu cầu hệ thống

- **Hệ điều hành**: Windows 10/11, macOS, hoặc Linux (Ubuntu, Debian, Fedora, Mint...).
- **Môi trường**: Đã cài đặt **Node.js phiên bản >= 18.0.0** (Tải miễn phí tại: [https://nodejs.org/](https://nodejs.org/)).
- **Trình duyệt khuyến nghị**: Google Chrome, Microsoft Edge, Cốc Cốc, Firefox hoặc Safari.

---

## 3. Cách cài đặt và khởi chạy (1-Click)

### Cách 1: Khởi chạy trên Windows (Nhanh nhất)
1. Giải nén tệp `fengs_exam_cv7991_offline.zip` hoặc `fengs_exam_cv7991_release.zip`.
2. Mở thư mục vừa giải nén, nhấp đúp chuột vào tệp:
   ```text
   start.bat
   ```
3. Hệ thống sẽ tự động khởi động máy chủ và mở trình duyệt tại địa chỉ: **`http://localhost:4000/`**.

---

### Cách 2: Khởi chạy trên Linux / macOS
1. Giải nén tệp bằng lệnh terminal hoặc phần mềm giải nén:
   ```bash
   unzip fengs_exam_cv7991_release.zip -d fengs_exam
   cd fengs_exam
   ```
2. Cấp quyền thực thi và chạy script:
   ```bash
   chmod +x start.sh
   ./start.sh
   ```
3. Mở trình duyệt web truy cập: **`http://localhost:4000/`**.

---

### Cách 3: Sử dụng lệnh Node.js tiêu chuẩn
Từ thư mục gốc của dự án:
```bash
npm start
```

---

## 4. Hướng dẫn sử dụng chi tiết (Quy trình 4 Bước)

Giao diện phần mềm được thiết kế theo quy trình 4 bước tuần tự, trực quan và khoa học:

```
[Bước 1: Nguồn Học Liệu SGK] ➔ [Bước 2: Ma Trận CV 7991] ➔ [Bước 3: Bản Đặc Tả YCCĐ] ➔ [Bước 4: Đề Thi & Đáp Án]
```

### Bước 1: Chọn phạm vi & Tải lên học liệu SGK
1. **Chọn Khối lớp**: Chọn **Lớp 10**, **Lớp 11** (ICT / CS) hoặc **Lớp 12** (ICT / CS).
2. **Chọn Phạm vi kiểm tra**:
   - *Kiểm tra định kỳ chuẩn*: Giữa Học kì 1, Cuối Học kì 1, Giữa Học kì 2, Cuối Học kì 2, hoặc Toàn bộ năm học.
   - *Theo từng bài/chủ đề*: Chọn riêng Chủ đề 1, Chủ đề 2... hoặc nhập khoảng bài tùy ý (ví dụ: Bài 16 đến Bài 25).
3. **Tải lên tài liệu tham chiếu (Tùy chọn)**:
   - Hỗ trợ kéo thả các định dạng: `.md`, `.txt`, `.docx`, `.pdf`, `.png`, `.jpg`.
   - Khi tải lên tệp mục lục SGK (như `muc_luc_sgk_tin10_kntt.md`), hệ thống tự động bóc tách danh sách các bài học, tự động khớp khối lớp và hiển thị nội dung tóm tắt học liệu lên màn hình OCR.
4. Nhấn nút **"Tiếp tục: Tạo Ma Trận ➔"** để chuyển sang Bước 2.

---

### Bước 2: Xây dựng & Tùy biến Ma trận Đề kiểm tra
1. **Kiểm tra bảng ma trận**:
   - Hệ thống hiển thị bảng ma trận gồm danh sách Chủ đề, Bài học, dải trang SGK và số lượng câu hỏi phân bố ở 4 mức nhận thức: **Nhận biết (NB)**, **Thông hiểu (TH)**, **Vận dụng (VD)**, **Vận dụng cao (VDC)**.
   - Các chỉ số tổng điểm (10,0 điểm) và tỷ lệ (40% - 30% - 20% - 10%) được hệ thống tự động cân đối và xác nhận hợp lệ bằng huy hiệu xanh: `Đạt chuẩn CV 7991`.
2. **Tùy biến câu hỏi linh hoạt**:
   - Bạn có thể chỉnh sửa trực tiếp số câu hỏi trong từng ô ma trận.
   - **Nút "Tạo lại ma trận ngẫu nhiên"**: Hệ thống sẽ tự động hoán vị, phân bổ câu hỏi ngẫu nhiên vào các bài học trong dải đã chọn mà vẫn giữ vững tuyệt đối tỷ lệ 40-30-20-10 và chuẩn điểm 10.0. Mỗi lần bấm sẽ thay đổi Mã đề thi (101, 102, 103, 104...).
3. **Nhập / Xuất Ma trận**:
   - Có thể dán bảng ma trận từ Excel, Google Sheets hoặc nhập từ file JSON/CSV.
4. Nhấn nút **"Tiếp tục: Bản Đặc Tả ➔"** để sang Bước 3.

---

### Bước 3: Bản đặc tả đề thi chuẩn Bộ GDĐT
1. **Chế độ xem**:
   - **Dạng thẻ (Card View)**: Trực quan, dễ đọc, tóm tắt các YCCĐ nổi bật theo màu sắc của từng cấp độ nhận thức.
   - **Dạng Bảng Chuẩn CV 7991 (Table View)**: Trình bày chi tiết từng bài học, nội dung kiến thức, đơn vị kiến thức, yêu cầu cần đạt chi tiết, số câu hỏi của từng phần (Phần I, II, III) và số trang SGK làm bằng chứng.
2. **Xuất Bản đặc tả ra Word**:
   - Nhấn nút **"Xuất Bản Đặc Tả (.doc)"** ở góc trên bên phải. File Word tạo ra có đầy đủ tiêu ngữ, quốc hiệu, thông tin sở/trường, bảng biểu kẻ khung chuẩn, sẵn sàng để ký duyệt và in ấn.
3. Nhấn nút **"Tiếp tục: Xem Đề Thi Hoàn Chỉnh ➔"** để sang Bước 4.

---

### Bước 4: Sinh Đề thi, Đáp án & Hướng dẫn chấm
1. **Xem tờ đề thi chính thức**:
   - **Tiêu đề đề thi**: Ghi rõ Sở GD&ĐT, Tên trường, Môn học, Khối lớp, Thời gian làm bài, Mã đề thi.
   - **Phần I (Trắc nghiệm nhiều lựa chọn)**: Gồm 16 câu (với đề có tự luận) hoặc 24 câu (với đề 100% trắc nghiệm). Mỗi câu đều có số trang SGK và dòng trích dẫn:
     *`Căn cứ học liệu: "..."`*
   - **Phần II (Trắc nghiệm Đúng / Sai)**: Gồm 3 hoặc 4 câu lớn, mỗi câu gồm 4 ý a), b), c), d).
   - **Phần III (Tự luận)**: Gồm 2 câu vận dụng và vận dụng cao (2,0 điểm và 1,0 điểm).
2. **Bảng Đáp án & Biểu điểm chi tiết**:
   - Đáp án trắc nghiệm Phần I.
   - Bảng đúng/sai từng ý Phần II (Quy tắc chấm: đúng 1 ý = 0,1đ; đúng 2 ý = 0,25đ; đúng 3 ý = 0,5đ; đúng 4 ý = 1,0đ).
   - Hướng dẫn chấm chi tiết từng bước cho Phần III kèm thang điểm thành phần.
3. **Tạo đề thi mới (Khác biệt nội dung)**:
   - Nhấn nút **"Sinh Đề Thi Mới"** để tạo ra một đề kiểm tra hoàn toàn mới với các câu hỏi khác nhau nhưng vẫn bám sát phạm vi bài học đã chọn.
4. **In và Xuất bản**:
   - Nhấn **"In Đề Thi"** để in trực tiếp qua hộp thoại in của trình duyệt (hỗ trợ lưu ra PDF).
   - Nhấn **"Xuất Đề Thi (Word)"** để tải về tệp Microsoft Word hoàn chỉnh.

---

## 5. Cấu trúc tệp tin trong hệ thống

```text
fengs_exam_cv7991/
├── index.html                 # Giao diện người dùng Web App (HTML5)
├── styles.css                 # File định dạng giao diện CSS
├── app.js                     # Core Engine: Ngân hàng câu hỏi SGK, ma trận, bản đặc tả
├── start.sh                   # Script khởi động cho Linux/macOS
├── start.bat                  # Script khởi động cho Windows
├── package.json               # Cấu hình dự án & scripts npm
├── HUONG_DAN_SU_DUNG.md       # Tài liệu hướng dẫn sử dụng này
├── README.md                  # Tài liệu kỹ thuật dự án
├── schema.sql                 # CSDL PostgreSQL chuẩn CV 7991
├── backend/                   # Toàn bộ mã nguồn máy chủ API
│   ├── server.js              # Server Express tích hợp WebSocket
│   ├── routes/                # Các đường dẫn API
│   ├── services/              # Dịch vụ sinh đề, thẩm định, xử lý AI
│   └── tests/                 # Bộ kiểm thử tự động Jest
└── prompts/                   # Kịch bản prompt bám sát câu chữ SGK
    └── sgk_to_matrix.json
```

---

## 6. Cấu hình AI & Cơ sở dữ liệu nâng cao

Hệ thống đã tích hợp sẵn **Curriculum Engine cục bộ**, cho phép hoạt động hoàn chỉnh độc lập ngay cả khi không có kết nối mạng hay khóa API.

Nếu nhà trường hoặc giáo viên muốn kích hoạt tính năng **Multi-Provider AI** (sử dụng Gemini 1.5 Pro, GPT-4o, Claude 3.5 Sonnet) để sinh câu hỏi trực tiếp từ tài liệu scan OCR:
1. Mở tệp `backend/.env` bằng trình soạn thảo văn bản (Notepad, VS Code...).
2. Điền khóa API tương ứng:
   ```env
   PORT=4000
   NODE_ENV=development
   
   # Khóa AI (tùy chọn)
   GEMINI_API_KEY=your_gemini_api_key_here
   OPENAI_API_KEY=your_openai_api_key_here
   ANTHROPIC_API_KEY=your_claude_api_key_here
   
   # Cơ sở dữ liệu PostgreSQL (tùy chọn - mặc định lưu bộ nhớ)
   DATABASE_URL=postgres://user:password@localhost:5432/cv7991_exam
   ```
3. Lưu tệp và khởi động lại server.

---

## 7. Xử lý sự cố thường gặp (FAQ)

### Câu hỏi 1: Nhấp vào `start.bat` nhưng cửa sổ đen biến mất ngay lập tức?
- **Nguyên nhân**: Máy tính của bạn chưa được cài đặt **Node.js** hoặc phiên bản Node.js cũ hơn 18.
- **Khắc phục**: Truy cập [https://nodejs.org/](https://nodejs.org/), tải phiên bản **LTS** về cài đặt, sau đó mở lại `start.bat`.

### Câu hỏi 2: Báo lỗi cổng 4000 đã bị chiếm dụng (Port 4000 is already in use)?
- **Khắc phục**:
  - Mở tệp `backend/.env`, đổi `PORT=4000` thành `PORT=4001` (hoặc cổng khác tùy ý).
  - Hoặc tắt tiến trình Node.js đang chạy ngầm bằng Task Manager (trên Windows) hoặc lệnh:
    ```bash
    kill -9 $(lsof -t -i:4000)
    ```

### Câu hỏi 3: Đề thi xuất ra Word có bị lỗi font hay bảng biểu không?
- **Trả lời**: Hoàn toàn không. Tệp Word được xuất theo chuẩn MIME HTML của Microsoft Office, sử dụng font chữ **Times New Roman** tiêu chuẩn, bảng biểu được cố định kích thước và căn lề đúng thể thức văn bản hành chính Việt Nam.

---

**FENG's EXAM – ĐỒNG HÀNH CÙNG GIÁO VIÊN VIỆT NAM TRONG ĐỔI MỚI KIỂM TRA ĐÁNH GIÁ GDPT 2018**
