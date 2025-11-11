from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from pydantic import BaseModel
from typing import List
import os

# 邮件配置
conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME", "your_email@example.com"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD", "your_email_password"),
    MAIL_FROM=os.getenv("MAIL_FROM", "your_email@example.com"),
    MAIL_PORT=587,
    MAIL_SERVER=os.getenv("MAIL_SERVER", "smtp.gmail.com"),
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

# 邮件服务实例
mail_service = FastMail(conf)

class EmailSchema(BaseModel):
    recipients: List[str]
    subject: str
    body: str

async def send_email_async(email: EmailSchema):
    """异步发送邮件"""
    message = MessageSchema(
        subject=email.subject,
        recipients=email.recipients,
        body=email.body,
        subtype="html"
    )
    
    await mail_service.send_message(message)

# 邮件模板
def get_verification_email_body(verification_code: str) -> str:
    """生成邮箱验证邮件内容"""
    return f"""
    <html>
        <body>
            <h2>邮箱验证</h2>
            <p>感谢您注册文件在线展示平台！</p>
            <p>您的验证码是: <strong>{verification_code}</strong></p>
            <p>请在网站中输入此验证码完成邮箱验证。</p>
            <p>如果这不是您本人操作，请忽略此邮件。</p>
        </body>
    </html>
    """

def get_password_reset_email_body(reset_link: str) -> str:
    """生成密码重置邮件内容"""
    return f"""
    <html>
        <body>
            <h2>密码重置</h2>
            <p>您请求重置密码，请点击以下链接完成重置：</p>
            <p><a href="{reset_link}">点击重置密码</a></p>
            <p>如果这不是您本人操作，请忽略此邮件。</p>
        </body>
    </html>
    """

def get_subscription_notification_body(user_name: str, subscription_type: str) -> str:
    """生成订阅通知邮件内容"""
    return f"""
    <html>
        <body>
            <h2>订阅成功</h2>
            <p>亲爱的 {user_name}，</p>
            <p>您的 {subscription_type} 订阅已成功生效！</p>
            <p>现在您可以享受平台的全部功能了。</p>
        </body>
    </html>
    """