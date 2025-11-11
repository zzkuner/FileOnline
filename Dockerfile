# 使用官方Python运行时作为基础镜像
FROM python:3.9-slim

# 设置工作目录
WORKDIR /app

# 安装编译工具和依赖
RUN apt-get update && apt-get install -y \
    build-essential \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# 复制requirements.txt文件
COPY ./backend/requirements.txt /app/requirements.txt

# 安装依赖
RUN pip install --no-cache-dir -r requirements.txt

# 复制项目代码
COPY ./backend /app
COPY ./init_admin.py /app/
COPY ./backend/start.sh /app/
RUN chmod +x /app/start.sh

# 暴露端口
EXPOSE 8000

# 设置环境变量
ENV PYTHONPATH=/app
ENV POSTGRES_HOST=db
ENV POSTGRES_DB=file_online
ENV POSTGRES_USER=postgres

# 启动应用
CMD ["sh", "-c", "./start.sh"]