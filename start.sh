#!/usr/bin/env bash
# ==========================================================
# FENG's EXAM – HỆ THỐNG TẠO ĐỀ THI CHUẨN CV 7991 BGDĐT
# Script khởi chạy toàn bộ website & backend API
# ==========================================================

set -e
cd "$(dirname "$0")"

echo "=========================================================="
echo "  FENG's EXAM - HỆ THỐNG TẠO ĐỀ THI CHUẨN CV 7991 BGDĐT   "
echo "=========================================================="

if ! command -v node &> /dev/null; then
    echo "❌ Lỗi: Không tìm thấy Node.js trên máy của bạn."
    echo "   Vui lòng cài đặt Node.js phiên bản >= 18.0.0 từ https://nodejs.org/"
    exit 1
fi

echo "✔ Phiên bản Node.js: $(node -v)"

# Kiểm tra node_modules
if [ ! -d "backend/node_modules" ]; then
    echo ">> Đang cài đặt các thư viện cần thiết cho Backend..."
    npm install --prefix backend
fi

echo "=========================================================="
echo "🚀 Đang khởi động hệ thống FENG's EXAM tại: http://localhost:4000"
echo "   - Giao diện Website:   http://localhost:4000/"
echo "   - Backend API Docs:    http://localhost:4000/api/docs"
echo "   - WebSocket realtime:  ws://localhost:4000/ws"
echo "=========================================================="
echo ">> Nhấn Ctrl+C để dừng hệ thống bất kỳ lúc nào."
echo ""

node backend/server.js
