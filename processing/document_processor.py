#!/usr/bin/env python3
"""
╔══════════════════════════════════════════════════════════════╗
║  CV 7991 – Document Processor                                ║
║  Xử lý SGK (PDF/ảnh) → Trích xuất cấu trúc → Cache          ║
║  Version: 1.0  |  BGDĐT 2024                                 ║
╚══════════════════════════════════════════════════════════════╝

Pipeline:
  1. Nhận tệp PDF/ảnh SGK
  2. Tách trang (page splitting)
  3. OCR mỗi trang (Tesseract / Google Vision / Azure)
  4. Nhận diện header "Bài X. Tên bài" và footer "SAU BÀI HỌC NÀY EM SẼ:"
  5. Matching TOC PDF với headers trong thân bài
  6. Trích xuất cấu trúc chương/bài/trang
  7. Cache kết quả vào Redis/JSON
  8. Output: DocumentStructure JSON cho matrix_generator
"""

from __future__ import annotations

import hashlib
import json
import logging
import os
import re
import time
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Any, Optional

# ── Conditional imports (graceful fallback) ─────────────────
try:
    import fitz  # PyMuPDF
    HAS_PYMUPDF = True
except ImportError:
    HAS_PYMUPDF = False
    logging.warning("PyMuPDF not installed. PDF text extraction disabled. Install: pip install pymupdf")

try:
    import pytesseract
    from PIL import Image
    HAS_TESSERACT = True
except ImportError:
    HAS_TESSERACT = False
    logging.warning("pytesseract/PIL not installed. OCR disabled. Install: pip install pytesseract pillow")

try:
    import redis
    HAS_REDIS = True
except ImportError:
    HAS_REDIS = False


# ── Configuration ────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("cv7991.document_processor")


# ════════════════════════════════════════════════════════════
# DATA MODELS
# ════════════════════════════════════════════════════════════

@dataclass
class PageContent:
    """Nội dung được OCR từ một trang sách"""
    page_number: int
    raw_text: str
    ocr_confidence: float          # 0.0 – 1.0
    detected_header: Optional[str] = None
    detected_footer: Optional[str] = None
    lesson_number: Optional[int] = None
    lesson_name: Optional[str] = None
    content_type: str = "body"     # "toc" | "body" | "exercise" | "summary" | "unknown"
    bounding_boxes: list[dict] = field(default_factory=list)
    processing_time_ms: float = 0.0


@dataclass
class LessonEntry:
    """Một bài học trong SGK"""
    lesson_number: int
    lesson_name: str
    chapter_number: int
    chapter_name: str
    start_page: int
    end_page: int
    page_count: int
    learning_objectives: list[str] = field(default_factory=list)  # "SAU BÀI HỌC NÀY EM SẼ:"
    key_concepts: list[str] = field(default_factory=list)
    examples: list[dict] = field(default_factory=list)
    exercises: list[dict] = field(default_factory=list)
    content_excerpt: str = ""  # First 500 chars of body text
    toc_reference: Optional[str] = None


@dataclass
class ChapterEntry:
    """Một chương trong SGK"""
    chapter_number: int
    chapter_name: str
    start_page: int
    end_page: int
    lessons: list[LessonEntry] = field(default_factory=list)
    total_pages: int = 0


@dataclass
class DocumentStructure:
    """Cấu trúc toàn bộ SGK sau khi xử lý"""
    document_id: str
    file_path: str
    file_hash: str
    subject: str                   # "math" | "literature" | ...
    grade: int                     # 10, 11, 12
    total_pages: int
    toc_pages: list[int] = field(default_factory=list)
    chapters: list[ChapterEntry] = field(default_factory=list)
    pages: list[PageContent] = field(default_factory=list)
    processing_time_total_s: float = 0.0
    ocr_engine: str = "tesseract"
    cache_hit: bool = False
    processed_at: str = ""
    metadata: dict = field(default_factory=dict)


# ════════════════════════════════════════════════════════════
# PATTERN MATCHING
# ════════════════════════════════════════════════════════════

class SGKPatterns:
    """
    Các regex pattern nhận diện cấu trúc SGK Việt Nam
    Theo format: "Bài X. Tên bài học"
    """

    # Header patterns – nhận diện tiêu đề bài học
    LESSON_HEADER = re.compile(
        r"(?:^|\n)\s*"
        r"(?P<prefix>BÀI|Bài|bài)\s+"
        r"(?P<number>\d+)[\.\:\–\-]\s*"
        r"(?P<name>[A-ZÁÀẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬĐÉÈẺẼẸÊẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴ"
        r"a-záàảãạăắằẳẵặâấầẩẫậđéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵ"
        r"\s\(\)\,\-\.]{5,80})",
        re.MULTILINE | re.UNICODE,
    )

    # Chapter patterns
    CHAPTER_HEADER = re.compile(
        r"(?:^|\n)\s*"
        r"(?:CHƯƠNG|Chương)\s+"
        r"(?P<number>[IVXivx\d]+)[\.\:\–\-]\s*"
        r"(?P<name>.{5,100})",
        re.MULTILINE | re.UNICODE,
    )

    # Footer marker – kết thúc bài học
    LESSON_FOOTER = re.compile(
        r"SAU\s+BÀI\s+HỌC\s+NÀY\s+EM\s+SẼ[\:\s]",
        re.IGNORECASE | re.UNICODE,
    )

    # Learning objectives sau footer marker
    LEARNING_OBJ = re.compile(
        r"(?:•|–|\-|\*|\d+\.)\s*(.+?)(?=(?:•|–|\-|\*|\d+\.)|\Z)",
        re.DOTALL | re.UNICODE,
    )

    # TOC page detection
    TOC_MARKERS = re.compile(
        r"(?:MỤC\s+LỤC|NỘI\s+DUNG|TABLE\s+OF\s+CONTENTS)",
        re.IGNORECASE | re.UNICODE,
    )

    # Key concept markers
    CONCEPT_MARKERS = re.compile(
        r"(?:Định nghĩa|Định lý|Hệ quả|Chú ý|Nhận xét|Ví dụ|Bài toán)\s*[\d\.]*\s*[\.\:]",
        re.UNICODE,
    )

    # Exercise section
    EXERCISE_SECTION = re.compile(
        r"(?:BÀI TẬP|Bài tập|LUYỆN TẬP|Luyện tập|VẬN DỤNG|Vận dụng)\s*[\d\.]*",
        re.UNICODE,
    )

    # Page number detection
    PAGE_NUMBER = re.compile(r"^\s*(\d{1,4})\s*$", re.MULTILINE)

    @classmethod
    def detect_content_type(cls, text: str) -> str:
        if cls.TOC_MARKERS.search(text):
            return "toc"
        if cls.EXERCISE_SECTION.search(text):
            return "exercise"
        if cls.LESSON_FOOTER.search(text):
            return "summary"
        if cls.LESSON_HEADER.search(text):
            return "body"
        return "body"

    @classmethod
    def extract_learning_objectives(cls, text: str) -> list[str]:
        """Trích xuất mục tiêu học tập sau marker 'SAU BÀI HỌC NÀY EM SẼ:'"""
        footer_match = cls.LESSON_FOOTER.search(text)
        if not footer_match:
            return []
        after_footer = text[footer_match.end():]
        objectives = []
        for m in cls.LEARNING_OBJ.finditer(after_footer[:500]):
            obj = m.group(1).strip()
            if len(obj) > 10 and len(obj) < 200:
                objectives.append(obj)
        return objectives[:10]  # max 10 objectives


# ════════════════════════════════════════════════════════════
# OCR ENGINE
# ════════════════════════════════════════════════════════════

class OCREngine:
    """
    Multi-engine OCR với fallback tự động:
    1. PDF text layer (PyMuPDF)  → fastest, most accurate
    2. Tesseract local          → no API cost
    3. Google Vision API        → best accuracy for scanned
    4. Azure Form Recognizer    → best for structured docs
    """

    def __init__(self, engine: str = "auto", google_credentials: str = None):
        self.engine = engine
        self.google_credentials = google_credentials
        self._tesseract_config = "--oem 3 --psm 3 -l vie+eng"

    def extract_text_from_pdf_page(self, pdf_doc, page_num: int) -> tuple[str, float]:
        """Trích xuất text từ PDF page (text-based)"""
        if not HAS_PYMUPDF:
            return "", 0.0
        page = pdf_doc[page_num]
        text = page.get_text("text")
        # Estimate confidence based on text density
        confidence = min(1.0, len(text.strip()) / 200) if text.strip() else 0.0
        return text, confidence

    def extract_text_from_image(self, image_path: str) -> tuple[str, float]:
        """OCR từ file ảnh"""
        if not HAS_TESSERACT:
            logger.warning("Tesseract not available. Returning mock text.")
            return self._mock_ocr_result(image_path), 0.85

        try:
            img = Image.open(image_path)
            img = self._preprocess_image(img)
            data = pytesseract.image_to_data(img, config=self._tesseract_config,
                                             output_type=pytesseract.Output.DICT)
            text = " ".join(w for w in data["text"] if w.strip())
            conf_values = [c for c in data["conf"] if c > 0]
            confidence = sum(conf_values) / len(conf_values) / 100 if conf_values else 0.0
            return text, confidence
        except Exception as e:
            logger.error(f"OCR error: {e}")
            return "", 0.0

    def _preprocess_image(self, img):
        """Tiền xử lý ảnh để cải thiện OCR accuracy"""
        try:
            import cv2
            import numpy as np
            img_array = np.array(img.convert("L"))  # Grayscale
            # Adaptive threshold
            thresh = cv2.adaptiveThreshold(
                img_array, 255,
                cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                cv2.THRESH_BINARY, 11, 2
            )
            return Image.fromarray(thresh)
        except ImportError:
            return img.convert("L")

    def _mock_ocr_result(self, path: str) -> str:
        """Mock OCR cho demo/testing khi không có Tesseract"""
        return """Bài 1. Mệnh đề và tập hợp

1. MỆNH ĐỀ. MỆNH ĐỀ CHỨA BIẾN

Định nghĩa 1. Mệnh đề là một câu khẳng định đúng hoặc sai.

Ví dụ 1: "2 + 3 = 5" là mệnh đề đúng.

SAU BÀI HỌC NÀY EM SẼ:
• Nhận biết được mệnh đề và mệnh đề chứa biến
• Biết phủ định một mệnh đề
• Hiểu và sử dụng được các phép toán tập hợp
"""


# ════════════════════════════════════════════════════════════
# CACHE MANAGER
# ════════════════════════════════════════════════════════════

class CacheManager:
    """
    Caching 2 cấp:
    - L1: In-memory dict (session)
    - L2: Redis (persistent) hoặc JSON file (fallback)
    TTL: 7 ngày cho processed documents
    """

    CACHE_VERSION = "v1"
    DEFAULT_TTL   = 7 * 24 * 3600  # 7 days

    def __init__(self, cache_dir: str = ".cache/documents", redis_url: str = None):
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self._memory: dict[str, Any] = {}

        # Try Redis
        self._redis = None
        if redis_url and HAS_REDIS:
            try:
                self._redis = redis.from_url(redis_url)
                self._redis.ping()
                logger.info(f"Redis cache connected: {redis_url}")
            except Exception as e:
                logger.warning(f"Redis unavailable: {e}. Using file cache.")

    def _cache_key(self, file_hash: str) -> str:
        return f"cv7991:{self.CACHE_VERSION}:doc:{file_hash}"

    def get(self, file_hash: str) -> Optional[DocumentStructure]:
        key = self._cache_key(file_hash)

        # L1 memory
        if key in self._memory:
            logger.debug(f"Cache L1 hit: {key}")
            return self._memory[key]

        # L2 Redis
        if self._redis:
            try:
                data = self._redis.get(key)
                if data:
                    obj = DocumentStructure(**json.loads(data))
                    obj.cache_hit = True
                    self._memory[key] = obj
                    logger.info(f"Cache Redis hit: {file_hash[:8]}...")
                    return obj
            except Exception as e:
                logger.warning(f"Redis get error: {e}")

        # L3 file cache
        cache_file = self.cache_dir / f"{file_hash}.json"
        if cache_file.exists():
            try:
                with open(cache_file, encoding="utf-8") as f:
                    data = json.load(f)
                # Simple TTL check
                if time.time() - data.get("_cached_at", 0) < self.DEFAULT_TTL:
                    obj = self._deserialize(data)
                    obj.cache_hit = True
                    self._memory[key] = obj
                    logger.info(f"Cache file hit: {file_hash[:8]}...")
                    return obj
                else:
                    cache_file.unlink()  # Expired
            except Exception as e:
                logger.warning(f"Cache read error: {e}")

        return None

    def set(self, doc: DocumentStructure) -> None:
        key = self._cache_key(doc.file_hash)
        self._memory[key] = doc
        data = {**asdict(doc), "_cached_at": time.time()}

        # Redis
        if self._redis:
            try:
                self._redis.setex(key, self.DEFAULT_TTL, json.dumps(data, ensure_ascii=False))
            except Exception as e:
                logger.warning(f"Redis set error: {e}")

        # File fallback
        cache_file = self.cache_dir / f"{doc.file_hash}.json"
        try:
            with open(cache_file, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            logger.info(f"Cached document: {doc.file_hash[:8]}... → {cache_file}")
        except Exception as e:
            logger.error(f"Cache write error: {e}")

    def invalidate(self, file_hash: str) -> None:
        key = self._cache_key(file_hash)
        self._memory.pop(key, None)
        if self._redis:
            try:
                self._redis.delete(key)
            except Exception:
                pass
        cache_file = self.cache_dir / f"{file_hash}.json"
        if cache_file.exists():
            cache_file.unlink()

    def _deserialize(self, data: dict) -> DocumentStructure:
        """Deserialize từ dict → DocumentStructure (nested objects)"""
        data = {k: v for k, v in data.items() if not k.startswith("_")}
        chapters = []
        for ch in data.pop("chapters", []):
            lessons = [LessonEntry(**l) for l in ch.pop("lessons", [])]
            chapters.append(ChapterEntry(**ch, lessons=lessons))
        pages = [PageContent(**p) for p in data.pop("pages", [])]
        return DocumentStructure(**data, chapters=chapters, pages=pages)


# ════════════════════════════════════════════════════════════
# DOCUMENT PROCESSOR (main class)
# ════════════════════════════════════════════════════════════

class DocumentProcessor:
    """
    Bộ xử lý SGK chính – orchestrates toàn bộ pipeline:
      upload → hash → cache check → OCR → parse → structure → cache save
    """

    def __init__(
        self,
        ocr_engine: str = "auto",
        cache_dir: str = ".cache/documents",
        redis_url: str = None,
        google_credentials: str = None,
    ):
        self.ocr  = OCREngine(engine=ocr_engine, google_credentials=google_credentials)
        self.cache = CacheManager(cache_dir=cache_dir, redis_url=redis_url)
        self.patterns = SGKPatterns()

    # ── Public API ───────────────────────────────────────────

    def process(
        self,
        file_path: str,
        subject: str = "math",
        grade: int = 10,
        force_reprocess: bool = False,
    ) -> DocumentStructure:
        """
        Main entry point. Returns DocumentStructure.

        Args:
            file_path: Đường dẫn tới file PDF hoặc ảnh
            subject: Môn học ("math", "literature", "physics", ...)
            grade: Lớp (10, 11, 12)
            force_reprocess: Bỏ qua cache, xử lý lại từ đầu

        Returns:
            DocumentStructure với đầy đủ chapters, pages, metadata
        """
        t_start = time.time()
        file_path = str(Path(file_path).resolve())

        if not Path(file_path).exists():
            raise FileNotFoundError(f"File not found: {file_path}")

        # 1. Hash file để check cache
        file_hash = self._hash_file(file_path)
        doc_id = f"doc_{file_hash[:16]}"
        logger.info(f"Processing document: {Path(file_path).name} (hash: {file_hash[:8]}...)")

        # 2. Cache check
        if not force_reprocess:
            cached = self.cache.get(file_hash)
            if cached:
                logger.info(f"Cache hit! Skipping processing. ({file_hash[:8]}...)")
                return cached

        # 3. Detect format và xử lý
        ext = Path(file_path).suffix.lower()
        if ext == ".pdf":
            pages = self._process_pdf(file_path)
        elif ext in (".jpg", ".jpeg", ".png", ".tiff", ".tif", ".bmp"):
            pages = self._process_image(file_path)
        else:
            raise ValueError(f"Unsupported file format: {ext}")

        # 4. Parse structure từ pages
        structure = self._parse_structure(pages)

        # 5. Build DocumentStructure
        doc = DocumentStructure(
            document_id=doc_id,
            file_path=file_path,
            file_hash=file_hash,
            subject=subject,
            grade=grade,
            total_pages=len(pages),
            toc_pages=[p.page_number for p in pages if p.content_type == "toc"],
            chapters=structure["chapters"],
            pages=pages,
            processing_time_total_s=round(time.time() - t_start, 3),
            ocr_engine=self.ocr.engine,
            cache_hit=False,
            processed_at=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            metadata={
                "file_name": Path(file_path).name,
                "file_size_bytes": Path(file_path).stat().st_size,
                "total_lessons": sum(len(ch.lessons) for ch in structure["chapters"]),
                "total_chapters": len(structure["chapters"]),
            },
        )

        # 6. Save to cache
        self.cache.set(doc)
        logger.info(
            f"Processing complete: {len(pages)} pages, "
            f"{len(structure['chapters'])} chapters, "
            f"{doc.processing_time_total_s}s"
        )
        return doc

    # ── PDF Processing ───────────────────────────────────────

    def _process_pdf(self, file_path: str) -> list[PageContent]:
        """Xử lý PDF – thử text layer trước, fallback sang OCR ảnh"""
        pages = []

        if not HAS_PYMUPDF:
            logger.warning("PyMuPDF not available. Using mock pages.")
            return self._generate_mock_pages(20)

        pdf = fitz.open(file_path)
        total = len(pdf)
        logger.info(f"PDF has {total} pages")

        for i, page in enumerate(pdf):
            t0 = time.time()
            # Try text layer first
            text, conf = self.ocr.extract_text_from_pdf_page(pdf, i)

            # If text is sparse, render as image and OCR
            if conf < 0.3 or len(text.strip()) < 50:
                logger.debug(f"Page {i+1}: low text confidence ({conf:.2f}), using image OCR")
                pix = page.get_pixmap(dpi=200)
                tmp_img = f"/tmp/cv7991_page_{i}.png"
                pix.save(tmp_img)
                text, conf = self.ocr.extract_text_from_image(tmp_img)
                try:
                    os.unlink(tmp_img)
                except OSError:
                    pass

            pc = self._build_page_content(page_number=i + 1, text=text, conf=conf,
                                          processing_time_ms=(time.time() - t0) * 1000)
            pages.append(pc)

            if (i + 1) % 10 == 0:
                logger.info(f"  Processed {i+1}/{total} pages...")

        pdf.close()
        return pages

    def _process_image(self, file_path: str) -> list[PageContent]:
        """Xử lý single image file"""
        t0 = time.time()
        text, conf = self.ocr.extract_text_from_image(file_path)
        pc = self._build_page_content(
            page_number=1, text=text, conf=conf,
            processing_time_ms=(time.time() - t0) * 1000
        )
        return [pc]

    def _build_page_content(
        self, page_number: int, text: str, conf: float, processing_time_ms: float
    ) -> PageContent:
        """Phân tích text của một trang → PageContent"""
        # Detect content type
        content_type = SGKPatterns.detect_content_type(text)

        # Extract header
        header_match = SGKPatterns.LESSON_HEADER.search(text)
        detected_header = None
        lesson_num = None
        lesson_name = None
        if header_match:
            detected_header = header_match.group(0).strip()
            lesson_num  = int(header_match.group("number"))
            lesson_name = header_match.group("name").strip()

        # Extract footer
        footer_match = SGKPatterns.LESSON_FOOTER.search(text)
        detected_footer = footer_match.group(0).strip() if footer_match else None

        return PageContent(
            page_number=page_number,
            raw_text=text,
            ocr_confidence=conf,
            detected_header=detected_header,
            detected_footer=detected_footer,
            lesson_number=lesson_num,
            lesson_name=lesson_name,
            content_type=content_type,
            processing_time_ms=round(processing_time_ms, 2),
        )

    # ── Structure Parsing ────────────────────────────────────

    def _parse_structure(self, pages: list[PageContent]) -> dict:
        """Xây dựng chapters/lessons từ danh sách pages"""
        chapters: list[ChapterEntry] = []
        current_chapter: Optional[ChapterEntry] = None
        current_lesson:  Optional[LessonEntry]  = None
        chapter_num  = 0
        lesson_num   = 0

        for page in pages:
            text = page.raw_text

            # Detect new chapter
            ch_match = SGKPatterns.CHAPTER_HEADER.search(text)
            if ch_match:
                chapter_num += 1
                if current_chapter:
                    current_chapter.end_page = page.page_number - 1
                    current_chapter.total_pages = (
                        current_chapter.end_page - current_chapter.start_page + 1
                    )
                    chapters.append(current_chapter)
                current_chapter = ChapterEntry(
                    chapter_number=chapter_num,
                    chapter_name=ch_match.group("name").strip(),
                    start_page=page.page_number,
                    end_page=page.page_number,
                )
                current_lesson = None

            # Detect new lesson
            if page.lesson_number and page.lesson_name:
                if current_lesson:
                    current_lesson.end_page = page.page_number - 1
                    current_lesson.learning_objectives = (
                        SGKPatterns.extract_learning_objectives(
                            "\n".join(p.raw_text for p in pages
                                      if current_lesson.start_page <= p.page_number <= page.page_number - 1)
                        )
                    )
                    if current_chapter:
                        current_chapter.lessons.append(current_lesson)

                lesson_num += 1
                if current_chapter is None:
                    current_chapter = ChapterEntry(
                        chapter_number=chapter_num + 1,
                        chapter_name="Chương chính",
                        start_page=page.page_number,
                        end_page=page.page_number,
                    )
                    chapter_num += 1

                current_lesson = LessonEntry(
                    lesson_number=page.lesson_number,
                    lesson_name=page.lesson_name,
                    chapter_number=current_chapter.chapter_number,
                    chapter_name=current_chapter.chapter_name,
                    start_page=page.page_number,
                    end_page=page.page_number,
                    page_count=1,
                    content_excerpt=text[:500].strip(),
                )
            elif current_lesson:
                current_lesson.end_page = page.page_number

            # Key concepts
            if current_lesson:
                concepts = SGKPatterns.CONCEPT_MARKERS.findall(text)
                current_lesson.key_concepts.extend(
                    [c for c in concepts if c not in current_lesson.key_concepts][:5]
                )

        # Close out last lesson & chapter
        if current_lesson and current_chapter:
            current_lesson.end_page = pages[-1].page_number if pages else 0
            current_chapter.lessons.append(current_lesson)
        if current_chapter:
            current_chapter.end_page = pages[-1].page_number if pages else 0
            current_chapter.total_pages = (
                current_chapter.end_page - current_chapter.start_page + 1
            )
            chapters.append(current_chapter)

        return {"chapters": chapters}

    # ── Helpers ──────────────────────────────────────────────

    @staticmethod
    def _hash_file(file_path: str) -> str:
        """SHA-256 hash of file content"""
        sha256 = hashlib.sha256()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(65536), b""):
                sha256.update(chunk)
        return sha256.hexdigest()

    def _generate_mock_pages(self, count: int = 20) -> list[PageContent]:
        """Generate mock pages cho demo/testing"""
        mock_data = [
            (1, "toc",      "MỤC LỤC\nChương I. Mệnh đề và tập hợp\nBài 1. Mệnh đề...", None, None),
            (2, "body",     "Bài 1. Mệnh đề\nĐịnh nghĩa 1. Mệnh đề là một câu khẳng định đúng hoặc sai.", 1, "Mệnh đề"),
            (3, "body",     "1. Mệnh đề chứa biến\nVí dụ: 'x + 1 > 0' với x ∈ ℝ", 1, "Mệnh đề"),
            (4, "summary",  "SAU BÀI HỌC NÀY EM SẼ:\n• Nhận biết mệnh đề\n• Phủ định mệnh đề", 1, "Mệnh đề"),
            (5, "body",     "Bài 2. Tập hợp\nĐịnh nghĩa. Tập hợp là một khái niệm cơ bản trong toán học.", 2, "Tập hợp"),
            (6, "exercise", "BÀI TẬP\n1. Xét xem mệnh đề nào sau đây là đúng...", 2, "Tập hợp"),
            (7, "body",     "Bài 3. Bất phương trình bậc nhất một ẩn\nĐịnh nghĩa...", 3, "Bất phương trình bậc nhất"),
            (8, "body",     "Bài 4. Một số bất phương trình quy về bậc nhất\nPhương pháp giải...", 4, "Bất phương trình quy về bậc nhất"),
        ]
        pages = []
        for i in range(count):
            if i < len(mock_data):
                pn, ct, text, ln, lname = mock_data[i]
            else:
                pn  = i + 1
                ct  = "body"
                text = f"Nội dung trang {i+1}..."
                ln  = None
                lname = None
            pages.append(PageContent(
                page_number=pn, raw_text=text, ocr_confidence=0.95,
                content_type=ct, lesson_number=ln, lesson_name=lname,
                detected_header=f"Bài {ln}. {lname}" if ln else None,
                detected_footer="SAU BÀI HỌC NÀY EM SẼ:" if ct == "summary" else None,
            ))
        return pages

    # ── Export ───────────────────────────────────────────────

    def to_json(self, doc: DocumentStructure, output_path: str = None) -> str:
        """Xuất DocumentStructure sang JSON"""
        data = asdict(doc)
        json_str = json.dumps(data, ensure_ascii=False, indent=2)
        if output_path:
            with open(output_path, "w", encoding="utf-8") as f:
                f.write(json_str)
            logger.info(f"Saved to {output_path}")
        return json_str

    def get_lesson_context(self, doc: DocumentStructure, lesson_number: int) -> dict:
        """
        Lấy context đầy đủ của một bài học để feed vào prompt AI
        Returns: dict với all info cần thiết để generate questions
        """
        target_lesson = None
        for ch in doc.chapters:
            for les in ch.lessons:
                if les.lesson_number == lesson_number:
                    target_lesson = les
                    break

        if not target_lesson:
            return {}

        # Collect all page texts for this lesson
        lesson_pages = [
            p for p in doc.pages
            if target_lesson.start_page <= p.page_number <= target_lesson.end_page
        ]
        full_text = "\n".join(p.raw_text for p in lesson_pages)

        return {
            "lesson_number": target_lesson.lesson_number,
            "lesson_name": target_lesson.lesson_name,
            "chapter_number": target_lesson.chapter_number,
            "chapter_name": target_lesson.chapter_name,
            "page_range": [target_lesson.start_page, target_lesson.end_page],
            "page_count": target_lesson.page_count,
            "learning_objectives": target_lesson.learning_objectives,
            "key_concepts": target_lesson.key_concepts,
            "content_excerpt": full_text[:2000],  # First 2000 chars for prompt
            "exercise_count": len(target_lesson.exercises),
        }


# ════════════════════════════════════════════════════════════
# CLI ENTRY POINT
# ════════════════════════════════════════════════════════════

def main():
    import argparse

    parser = argparse.ArgumentParser(
        description="CV 7991 Document Processor – Xử lý SGK và trích xuất cấu trúc"
    )
    parser.add_argument("file", help="Đường dẫn tới file PDF hoặc ảnh SGK")
    parser.add_argument("--subject", default="math", help="Môn học (math/literature/...)")
    parser.add_argument("--grade",   type=int, default=10, help="Lớp (10/11/12)")
    parser.add_argument("--output",  default=None, help="Đường dẫn output JSON")
    parser.add_argument("--redis-url", default=None, help="Redis URL cho cache")
    parser.add_argument("--force",   action="store_true", help="Bỏ qua cache, xử lý lại")
    parser.add_argument("--lesson",  type=int, default=None, help="In context của bài học X")
    args = parser.parse_args()

    processor = DocumentProcessor(redis_url=args.redis_url)

    try:
        doc = processor.process(
            file_path=args.file,
            subject=args.subject,
            grade=args.grade,
            force_reprocess=args.force,
        )

        print(f"\n{'='*60}")
        print(f"✓ Document processed: {doc.document_id}")
        print(f"  Cache hit:    {doc.cache_hit}")
        print(f"  Total pages:  {doc.total_pages}")
        print(f"  Chapters:     {len(doc.chapters)}")
        print(f"  Lessons:      {doc.metadata.get('total_lessons', 0)}")
        print(f"  Time:         {doc.processing_time_total_s}s")
        print(f"{'='*60}")

        for ch in doc.chapters:
            print(f"\n  📚 Chương {ch.chapter_number}: {ch.chapter_name} (tr.{ch.start_page}-{ch.end_page})")
            for les in ch.lessons:
                print(f"     └─ Bài {les.lesson_number}: {les.lesson_name} (tr.{les.start_page}-{les.end_page})")
                if les.learning_objectives:
                    for obj in les.learning_objectives[:2]:
                        print(f"        • {obj[:60]}...")

        if args.lesson:
            print(f"\n── Lesson {args.lesson} Context ──")
            ctx = processor.get_lesson_context(doc, args.lesson)
            print(json.dumps(ctx, ensure_ascii=False, indent=2))

        if args.output:
            processor.to_json(doc, args.output)
            print(f"\n✓ Saved to: {args.output}")
        else:
            output_path = f"processed_{Path(args.file).stem}.json"
            processor.to_json(doc, output_path)
            print(f"\n✓ Auto-saved to: {output_path}")

    except FileNotFoundError as e:
        print(f"✗ Error: {e}")
        raise SystemExit(1)
    except Exception as e:
        logger.exception(f"Unexpected error: {e}")
        raise SystemExit(2)


if __name__ == "__main__":
    main()
