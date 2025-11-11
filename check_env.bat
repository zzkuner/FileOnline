@echo off
REM 环境检查脚本

echo 文件在线展示平台 - 环境检查
echo ==============================

echo 检查必需的工具...

REM 检查Docker
echo.
echo 检查 Docker...
docker --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [✓] Docker 已安装
    docker --version
) else (
    echo [✗] Docker 未安装或不可用
    set error=1
)

REM 检查Docker Compose
echo.
echo 检查 Docker Compose...
docker-compose --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [✓] Docker Compose 已安装
    docker-compose --version
) else (
    echo [✗] Docker Compose 未安装或不可用
    set error=1
)

REM 检查Node.js (仅用于构建)
echo.
echo 检查 Node.js...
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [✓] Node.js 已安装
    node --version
) else (
    echo [!] Node.js 未安装 (仅在需要构建前端时需要)
)

REM 检查必需的文件
echo.
echo 检查必需的配置文件...
if exist "docker-compose.prod.yml" (
    echo [✓] docker-compose.prod.yml 存在
) else (
    echo [✗] docker-compose.prod.yml 不存在
    set error=1
)

if exist "nginx.conf" (
    echo [✓] nginx.conf 存在
) else (
    echo [✗] nginx.conf 不存在
    set error=1
)

if exist ".env" (
    echo [✓] .env 文件存在
) else if exist ".env.example" (
    echo [!] .env 文件不存在，但 .env.example 存在
) else (
    echo [✗] .env 和 .env.example 文件都不存在
    set error=1
)

REM 检查端口占用情况
echo.
echo 检查端口占用情况...
netstat -an | findstr "80 " >nul 2>&1
if %errorlevel% equ 0 (
    echo [!] 端口 80 可能已被占用，请检查
) else (
    echo [✓] 端口 80 未被占用
)

netstat -an | findstr "443 " >nul 2>&1
if %errorlevel% equ 0 (
    echo [!] 端口 443 可能已被占用，请检查
) else (
    echo [✓] 端口 443 未被占用
)

REM 检查Docker服务状态
echo.
echo 检查 Docker 服务状态...
docker info >nul 2>&1
if %errorlevel% equ 0 (
    echo [✓] Docker 服务正在运行
) else (
    echo [✗] Docker 服务未运行，请启动 Docker Desktop
    set error=1
)

echo.
if "%error%"=="1" (
    echo.
    echo [✗] 检查发现问题，请解决后重试
    echo.
    echo 建议:
    echo - 安装 Docker Desktop (包含 Docker Compose)
    echo - 启动 Docker Desktop 服务
    echo - 复制 .env.example 为 .env 并配置环境变量
    echo - 确保端口 80 和 443 未被占用
) else (
    echo.
    echo [✓] 所有检查通过，环境准备就绪
    echo.
    echo 接下来可以运行部署脚本:
    echo   deploy.bat
)

echo.
echo 按任意键退出...
pause >nul