FROM python:3.10-slim

WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# 复制依赖文件
COPY ./backend/requirements.txt .

# 安装Python依赖
RUN pip install --no-cache-dir -r requirements.txt

# 复制应用代码和初始化脚本
COPY ./backend .
COPY ../init_admin.py .
COPY ./start.sh .
RUN chmod +x start.sh

# 设置环境变量
ENV PYTHONPATH=/app
ENV POSTGRES_HOST=db
ENV POSTGRES_DB=file_online
ENV POSTGRES_USER=postgres

# 暴露端口
EXPOSE 8000

# 启动命令
CMD ["sh", "-c", "./start.sh"]