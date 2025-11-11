import os
import sys

# 添加当前目录到Python路径
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

print(f"Python路径: {sys.path}")

try:
    print("正在导入database...")
    from database import Base, engine
    print("database导入成功")
    
    print("正在导入models...")
    from models import User, File, AccessLog, Payment
    print("models导入成功")
    
    print("正在导入其他模块...")
    from auth import get_password_hash
    from dependencies import get_db
    print("其他模块导入成功")
    
    print("所有导入测试通过！")
    
except Exception as e:
    print(f"导入失败: {e}")
    import traceback
    traceback.print_exc()