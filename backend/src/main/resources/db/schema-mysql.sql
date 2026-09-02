-- MySQL 초기 스키마 (ddl-auto: update가 자동 생성하지만 참조용으로 제공)
-- EC2 배포 전 수동 실행하거나 ddl-auto: update로 자동 생성 가능

CREATE DATABASE IF NOT EXISTS tododb
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE tododb;

-- --------------------------------------------------------
-- users
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS users
(
    id            BIGINT       NOT NULL AUTO_INCREMENT,
    email         VARCHAR(255) NOT NULL,
    password      VARCHAR(255) NOT NULL,
    refresh_token VARCHAR(512),
    created_at    DATETIME(6),
    PRIMARY KEY (id),
    UNIQUE KEY uk_users_email (email)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4;

-- --------------------------------------------------------
-- categories
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories
(
    id         BIGINT       NOT NULL AUTO_INCREMENT,
    name       VARCHAR(100) NOT NULL,
    user_id    BIGINT       NOT NULL,
    created_at DATETIME(6),
    PRIMARY KEY (id),
    KEY idx_category_user_id (user_id),
    CONSTRAINT fk_category_user
        FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4;

-- --------------------------------------------------------
-- todos
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS todos
(
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    title       VARCHAR(255) NOT NULL,
    content     TEXT,
    deadline    DATETIME(6),
    completed   BIT(1)       NOT NULL DEFAULT b'0',
    user_id     BIGINT       NOT NULL,
    category_id BIGINT,
    created_at  DATETIME(6),
    updated_at  DATETIME(6),
    PRIMARY KEY (id),
    KEY idx_todo_user_id (user_id),
    KEY idx_todo_user_created (user_id, created_at),
    CONSTRAINT fk_todo_user
        FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_todo_category
        FOREIGN KEY (category_id) REFERENCES categories (id)
            ON DELETE SET NULL
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4;
