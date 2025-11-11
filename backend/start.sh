#!/bin/bash
# 后端启动脚本

# 等待数据库准备就绪
echo "等待数据库准备就绪..."
until PGPASSWORD=$POSTGRES_PASSWORD psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c '\q'; do
  >&2 echo "数据库未就绪 - 睡眠1秒"
  sleep 1
done

echo "数据库已就绪，开始初始化..."

# 运行数据库迁移（如果有的话）
# alembic upgrade head

# 初始化管理员用户
echo "初始化管理员用户..."
python init_admin.py

# 启动应用
echo "启动应用..."
exec uvicorn main:app --host 0.0.0.0 --port 8000