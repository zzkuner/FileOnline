-- PostgreSQL initialization script
CREATE DATABASE fileonline;
\c fileonline

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    subscription_type VARCHAR(20) DEFAULT 'free',
    subscription_end_date TIMESTAMP,
    is_admin BOOLEAN DEFAULT FALSE,  -- 管理员权限
    is_email_verified BOOLEAN DEFAULT FALSE,  -- 邮箱验证状态
    email_verification_code VARCHAR(6),  -- 邮箱验证代码
    password_reset_token VARCHAR(255),  -- 密码重置令牌
    password_reset_token_expires TIMESTAMP,  -- 密码重置令牌过期时间
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE files (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,  -- 注意：不再使用外键约束，以避免循环依赖
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    file_type VARCHAR(50),
    unique_code VARCHAR(12) UNIQUE NOT NULL,
    access_password VARCHAR(255),
    max_access_count INTEGER,
    current_access_count INTEGER DEFAULT 0,
    access_start_date TIMESTAMP,
    access_end_date TIMESTAMP,
    allowed_countries TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE access_logs (
    id SERIAL PRIMARY KEY,
    file_id INTEGER,  -- 注意：不再使用外键约束
    ip_address VARCHAR(45),  -- 使用VARCHAR而不是INET以提高兼容性
    user_agent TEXT,
    device_type VARCHAR(50),
    access_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    session_duration INTEGER
);

CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,  -- 注意：不再使用外键约束
    order_id VARCHAR(50) UNIQUE NOT NULL,
    amount DECIMAL(10,2),
    payment_method VARCHAR(20),
    payment_status VARCHAR(20) DEFAULT 'pending',
    subscription_type VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);