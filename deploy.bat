@echo off
REM 文件在线展示平台 - 部署脚本 (Windows)

echo 文件在线展示平台部署脚本
echo ==============================

REM 检查Docker是否安装
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未找到Docker，请先安装Docker Desktop
    pause
    exit /b 1
)

REM 检查Docker Compose是否可用
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未找到Docker Compose，请确保安装了Docker Desktop
    pause
    exit /b 1
)

REM 检查.env文件是否存在
if not exist ".env" (
    echo 警告: .env文件不存在，复制示例配置文件...
    if exist ".env.example" (
        copy .env.example .env
        echo 请编辑 .env 文件以配置环境变量
        notepad .env
    ) else (
        echo 错误: 找不到 .env.example 文件
        pause
        exit /b 1
    )
)

echo.
echo 选择部署选项:
echo 1. 首次部署（构建并启动所有服务）
echo 2. 重新部署（停止、构建并重新启动所有服务）
echo 3. 启动已存在的服务
echo 4. 停止所有服务
echo 5. 查看服务状态
echo 6. 查看日志
echo 7. 退出
echo.

set /p choice="请输入选项 (1-7): "

if "%choice%"=="1" goto first_deploy
if "%choice%"=="2" goto redeploy
if "%choice%"=="3" goto start
if "%choice%"=="4" goto stop
if "%choice%"=="5" goto status
if "%choice%"=="6" goto logs
if "%choice%"=="7" goto exit_script

echo 无效选项
pause
exit /b 1

:first_deploy
echo.
echo 开始首次部署...
docker-compose -f docker-compose.prod.yml up -d --build
if %errorlevel% equ 0 (
    echo 部署成功！
    echo 服务将在后台运行
) else (
    echo 部署失败，请检查错误信息
)
goto finish

:redeploy
echo.
echo 停止现有服务...
docker-compose -f docker-compose.prod.yml down
echo 重新构建并启动服务...
docker-compose -f docker-compose.prod.yml up -d --build
if %errorlevel% equ 0 (
    echo 重新部署成功！
) else (
    echo 重新部署失败，请检查错误信息
)
goto finish

:start
echo.
echo 启动服务...
docker-compose -f docker-compose.prod.yml up -d
if %errorlevel% equ 0 (
    echo 服务启动成功！
) else (
    echo 服务启动失败，请检查错误信息
)
goto finish

:stop
echo.
echo 停止所有服务...
docker-compose -f docker-compose.prod.yml down
if %errorlevel% equ 0 (
    echo 服务已停止
) else (
    echo 停止服务失败
)
goto finish

:status
echo.
echo 服务状态:
docker-compose -f docker-compose.prod.yml ps
goto finish

:logs
echo.
echo 选择查看日志的选项:
echo 1. 所有服务日志
echo 2. 仅Nginx日志
echo 3. 仅后端日志
echo 4. 仅数据库日志
echo 5. 返回主菜单
set /p log_choice="请输入选项 (1-5): "

if "%log_choice%"=="1" (
    docker-compose -f docker-compose.prod.yml logs -f
) else if "%log_choice%"=="2" (
    docker-compose -f docker-compose.prod.yml logs -f nginx
) else if "%log_choice%"=="3" (
    docker-compose -f docker-compose.prod.yml logs -f backend
) else if "%log_choice%"=="4" (
    docker-compose -f docker-compose.prod.yml logs -f db
) else if "%log_choice%"=="5" (
    goto main_menu
) else (
    echo 无效选项
)
goto finish

:finish
echo.
echo 按任意键继续...
pause >nul
goto main_menu

:main_menu
cls
goto start

:exit_script
echo.
echo 退出部署脚本
pause