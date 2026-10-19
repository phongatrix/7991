@echo off
chcp 65001 >nul
title FENG's EXAM - He Thong Tao De Thi Chuan CV 7991
echo ==========================================================
echo   FENG's EXAM - HE THONG TAO DE THI CHUAN CV 7991 BGDDT
echo ==========================================================

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [Loi] Khong tim thay Node.js. Vui long cai dat Node.js tai: https://nodejs.org/
    pause
    exit /b
)

if not exist "backend\node_modules" (
    echo [>>] Dang cai dat thu vien cho backend...
    call npm install --prefix backend
)

echo ==========================================================
echo [>>] He thong dang khoi chay tai: http://localhost:4000
echo ==========================================================
start http://localhost:4000
node backend\server.js
pause
