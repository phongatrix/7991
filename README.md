# Hệ Thống Tạo Đề Thi Theo Chuẩn CV 7991/BGDĐT-GDTr (2024)

> **Dựa trên:** Công văn số 7991/BGDĐT-GDTr ngày 17/12/2024 của Bộ Giáo dục và Đào tạo về việc hướng dẫn xây dựng ma trận, bản đặc tả và đề kiểm tra định kỳ cấp THCS, THPT.  
> **Phiên bản:** 1.0.0  
> **Kiến trúc:** 4-Tier Pipeline (UI/UX → Document Processing → Backend API → Database & Validation).

---

## 📌 Tổng Quan Pipeline 4 Bước

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. UI/UX Interface                                                          │
│    • Kéo thả SGK (PDF/Ảnh)                                                  │
│    • Trực quan hóa Ma trận CV 7991 (NB 40%, TH 30%, VD 20%, VDC 10%)       │
│    • Trình chỉnh sửa câu hỏi đa tầng, xem trước bản in đề thi & đáp án     │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
┌──────────────────────────────────────▼──────────────────────────────────────┐
│ 2. Document Processing & Matrix Generation                                  │
│    • OCR nhận diện Tiêu đề bài ("Bài X. Tên bài") & Footer kết thúc        │
│    • Trích xuất TOC, cấu trúc bài học, từ khóa, mục tiêu cần đạt (YCCĐ)    │
│    • Ánh xạ Bloom Taxonomy → Ma trận câu hỏi gắn với số trang SGK cụ thể   │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
┌──────────────────────────────────────▼──────────────────────────────────────┐
│ 3. Backend API & AI Engine                                                  │
│    • RESTful API (Express + Joi Validation + OpenAPI Swagger UI)           │
│    • WebSocket thời gian thực theo dõi tiến độ sinh đề                     │
│    • Multi-Provider AI Chain: Gemini 1.5 Pro → GPT-4o → Claude 3.5 Sonnet   │
│    • Prompt Engineering đa tầng với phân hóa chuẩn GDPT 2018                │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
┌──────────────────────────────────────▼──────────────────────────────────────┐
│ 4. Database & Validation Engine                                             │
│    • PostgreSQL 15+ Schema (Quan hệ tài liệu, ma trận, ngân hàng câu hỏi)  │
│    • Kiểm định nghiêm ngặt chuẩn CV 7991 (Tỉ lệ mức độ, định dạng I, II,   │
│      III, tổng điểm 10.0, kiểm tra cú pháp LaTeX)                           │
│    • Tự động sinh Bản đặc tả đề thi & Đa dạng hóa mã đề (101, 102, 103, 104)│
│    • Xuất bản đề thi, phiếu trả lời trắc nghiệm & hướng dẫn chấm chi tiết   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Cấu Trúc Dự Án

```
/media/dell/Data1/Antigravity/7991/
├── index.html                       # Giao diện người dùng Web App
├── styles.css                       # Thiết kế CSS hiện đại, chuẩn BGDĐT
├── app.js                           # Logic điều khiển Frontend & WebSocket
│
├── processing/                      # PHẦN 2: XỬ LÝ SGK & SINH MA TRẬN
│   ├── document_processor.py       # Tách trang PDF, OCR Tesseract, trích xuất cấu trúc
│   ├── matrix_generator.js         # Sinh ma trận CV 7991 từ cấu trúc SGK
│   └── requirements.txt            # Thư viện Python (pymupdf, pytesseract, ...)
│
├── prompts/                         # HỆ THỐNG PROMPT ĐA TẦNG
│   └── sgk_to_matrix.json          # Template prompts OCR, Ma trận, Câu hỏi NB/TH/VD/VDC
│
└── backend/                         # PHẦN 3 & 4: BACKEND API & DATABASE
    ├── server.js                    # Entry point Express API + WebSocket
    ├── package.json                 # Node.js dependencies
    ├── .env.example                 # Mẫu cấu hình môi trường
    ├── database/
    │   ├── schema.sql               # PostgreSQL Schema hoàn chỉnh
    │   ├── connection.js            # Kết nối PostgreSQL Connection Pool
    │   ├── migrate.js               # Script khởi tạo cơ sở dữ liệu
    │   └── seed.js                  # Dữ liệu mẫu (admin, giáo viên, ma trận chuẩn)
    ├── services/
    │   ├── validationService.js     # Engine kiểm tra tính hợp lệ chuẩn CV 7991
    │   ├── documentService.js       # Quản lý tài liệu SGK
    │   ├── matrixService.js         # Quản lý ma trận & Bản đặc tả
    │   ├── questionService.js       # Sinh câu hỏi AI & Ngân hàng câu hỏi
    │   ├── examService.js           # Ráp đề thi & Trộn mã đề 101, 102, 103, 104
    │   ├── exportService.js         # Xuất đề thi Word/HTML/PDF
    │   └── aiService.js             # Kết nối Gemini / OpenAI / Claude tự động chuyển đổi
    ├── routes/
    │   └── index.js                 # Định nghĩa tất cả API endpoints
    ├── middleware/
    │   ├── auth.js                  # Xác thực JWT & phân quyền RBAC
    │   ├── errorHandler.js          # Bắt lỗi toàn cục & chuẩn hóa JSON
    │   └── rateLimiter.js           # Giới hạn tần suất gọi API & AI
    └── tests/
        └── validation.test.js       # Bộ test tự động kiểm định chuẩn CV 7991
```

---

## 📋 Chi Tiết Cấu Trúc Đề Thi Theo CV 7991

Hệ thống tuân thủ nghiêm ngặt 3 phần kiểm tra mới của Bộ Giáo dục & Đào tạo:

1. **Phần I - Trắc nghiệm nhiều phương án lựa chọn**:
   - 4 phương án $A, B, C, D$, chỉ có 1 đáp án đúng.
   - Thang điểm: Mỗi câu đúng được $0.25$ điểm.
2. **Phần II - Trắc nghiệm đúng/sai**:
   - Mỗi câu gồm 4 ý $a), b), c), d)$.
   - Quy tắc tính điểm bậc thang:
     - Đúng 1 ý: $0.1$ điểm.
     - Đúng 2 ý: $0.25$ điểm.
     - Đúng 3 ý: $0.5$ điểm.
     - Đúng cả 4 ý: $1.0$ điểm.
3. **Phần III - Trắc nghiệm trả lời ngắn**:
   - Thí sinh điền kết quả dạng số hoặc cụm từ ngắn gọn.
   - Mỗi câu đúng: $0.25$ hoặc $0.5$ điểm.
4. **Phần IV - Tự luận (nếu có)**:
   - Các bài toán vận dụng giải quyết tình huống thực tế có bảng tiêu chí chấm chi tiết.

---

## 🛠 Hướng Dẫn Cài Đặt & Chạy Hệ Thống

### 1. Khởi chạy Backend API
```bash
cd /media/dell/Data1/Antigravity/7991/backend

# Cài đặt dependencies
npm install

# Cấu hình biến môi trường
cp .env.example .env

# Chạy migration tạo bảng Database
npm run migrate

# Nạp dữ liệu mẫu
npm run seed

# Khởi chạy server API (cổng 4000)
npm run dev
```

Tài liệu Swagger API có thể truy cập tại: `http://localhost:4000/api/docs`

### 2. Cài đặt Python OCR Processor
```bash
cd /media/dell/Data1/Antigravity/7991/processing
pip install -r requirements.txt
```

### 3. Mở Giao Diện Web App
Chạy trực tiếp file `index.html` trên trình duyệt hoặc sử dụng bất kỳ HTTP live server nào:
```bash
npx -y serve /media/dell/Data1/Antigravity/7991 -p 8991
```
Truy cập tại: `http://localhost:8991`

---

## 🧪 Chạy Kiểm Thử Tự Động (Validation Tests)

```bash
cd /media/dell/Data1/Antigravity/7991/backend
npx jest tests/validation.test.js
```
Bộ test kiểm tra:
- Độ cân bằng mức độ nhận thức (NB 40%, TH 30%, VD 20%, VDC 10%).
- Cú pháp toán học LaTeX không bị mất dấu đóng ngoặc `{}` hoặc `$`.
- Tính toàn vẹn khi sinh các mã đề thi độc lập (101, 102, 103, 104).
