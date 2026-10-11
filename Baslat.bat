@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ============================================
echo   ELEKTRONIK AKADEMI - Yerel Sunucu
echo ============================================
echo.
echo Tarayicida aciliyor: http://localhost:8080
echo Kapatmak icin bu pencereyi kapat.
echo.
start "" http://localhost:8080/index.html
python -m http.server 8080
pause
