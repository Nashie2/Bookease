CREATE DATABASE IF NOT EXISTS bookease_db;
USE bookease_db;

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    phone VARCHAR(50),
    avatar LONGTEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS services (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    duration INT NOT NULL, -- duration in minutes
    description TEXT,
    category VARCHAR(100),
    icon LONGTEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookings (
    id VARCHAR(50) PRIMARY KEY,
    service_id VARCHAR(50),
    user_id VARCHAR(50),
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
    amount DECIMAL(10, 2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (service_id) REFERENCES services(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value JSON
);

-- Insert mock settings
INSERT INTO settings (setting_key, setting_value) VALUES (
    'business_settings',
    '{
        "bizName": "BookEase Platform",
        "bizEmail": "admin@bookease.com",
        "bizPhone": "+63 912 000 0001",
        "bizAddress": "Dapitan City, Zamboanga del Norte",
        "advance": 30,
        "cancelWindow": 24,
        "emailOn": true,
        "smsOn": false,
        "payOn": true,
        "hours": [
            { "day": "Monday", "open": true, "start": "09:00", "end": "18:00" },
            { "day": "Tuesday", "open": true, "start": "09:00", "end": "18:00" },
            { "day": "Wednesday", "open": true, "start": "09:00", "end": "18:00" },
            { "day": "Thursday", "open": true, "start": "09:00", "end": "18:00" },
            { "day": "Friday", "open": true, "start": "09:00", "end": "17:00" },
            { "day": "Saturday", "open": true, "start": "10:00", "end": "15:00" },
            { "day": "Sunday", "open": false, "start": "10:00", "end": "14:00" }
        ]
    }'
);

