-- ==========================================
-- HELPDESK PRO - DATABASE SCHEMA
-- ==========================================

CREATE DATABASE IF NOT EXISTS helpdesk_db;

USE helpdesk_db;


-- ==========================================
-- 1. USERS
-- ==========================================

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,

    role ENUM('USER', 'AGENT', 'ADMIN')
        NOT NULL DEFAULT 'USER',

    enabled BOOLEAN NOT NULL DEFAULT TRUE,

    created_at DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    updated_at DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);


-- ==========================================
-- 2. CATEGORIES
-- ==========================================

CREATE TABLE categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),

    enabled BOOLEAN NOT NULL DEFAULT TRUE,

    created_at DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP
);


-- ==========================================
-- 3. TICKETS
-- ==========================================

CREATE TABLE tickets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,

    category_id BIGINT NOT NULL,
    created_by BIGINT NOT NULL,
    assigned_to BIGINT NULL,

    priority ENUM(
        'LOW',
        'MEDIUM',
        'HIGH',
        'URGENT'
    ) NOT NULL DEFAULT 'MEDIUM',

    status ENUM(
        'OPEN',
        'ASSIGNED',
        'IN_PROGRESS',
        'RESOLVED',
        'CLOSED'
    ) NOT NULL DEFAULT 'OPEN',

    resolution_notes TEXT NULL,

    created_at DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    updated_at DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    resolved_at DATETIME NULL,
    closed_at DATETIME NULL,

    FOREIGN KEY (category_id)
        REFERENCES categories(id),

    FOREIGN KEY (created_by)
        REFERENCES users(id),

    FOREIGN KEY (assigned_to)
        REFERENCES users(id)
);


-- ==========================================
-- 4. TICKET COMMENTS
-- ==========================================

CREATE TABLE ticket_comments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    ticket_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,

    message TEXT NOT NULL,

    created_at DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (ticket_id)
        REFERENCES tickets(id),

    FOREIGN KEY (user_id)
        REFERENCES users(id)
);


-- ==========================================
-- 5. TICKET HISTORY
-- ==========================================

CREATE TABLE ticket_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    ticket_id BIGINT NOT NULL,
    changed_by BIGINT NOT NULL,

    event_type ENUM(
        'CREATED',
        'ASSIGNED',
        'REASSIGNED',
        'STATUS_CHANGED',
        'PRIORITY_CHANGED'
    ) NOT NULL,

    field_name VARCHAR(50),
    old_value VARCHAR(255),
    new_value VARCHAR(255),

    changed_at DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (ticket_id)
        REFERENCES tickets(id),

    FOREIGN KEY (changed_by)
        REFERENCES users(id)
);