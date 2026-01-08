@echo off
chcp 65001
cd /d "%~dp0"
echo 正在启动开发服务器...
npm run dev
pause
