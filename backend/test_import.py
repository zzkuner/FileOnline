import sys
import os

# 添加当前目录到Python路径
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from models import User
    print("Models import successful")
except Exception as e:
    print(f"Import error: {e}")
    import traceback
    traceback.print_exc()