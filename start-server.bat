@echo off
title Zekri Dental - Local Server
cd /d D:\zekri-clinic
echo ============================================================
echo   ZEKRI DENTAL CLINIC - local preview server (no-cache)
echo ------------------------------------------------------------
echo   On this PC:   http://localhost:8000
echo   On phone:     http://192.168.100.5:8000
echo   (phone must be on the same Wi-Fi)
echo ------------------------------------------------------------
echo   Keep this window OPEN while testing. Close it to stop.
echo ============================================================
echo.
C:\Python313\python.exe serve_nocache.py
pause
