-- BGT Secure Exam Management System - Database Schema
-- Database: bgt_secure_exam

CREATE DATABASE IF NOT EXISTS `bgt_secure_exam`;
USE `bgt_secure_exam`;

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(100) NOT NULL UNIQUE,
    `email` VARCHAR(150) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `role` ENUM('ADMIN', 'PROFESSOR', 'STUDENT') NOT NULL DEFAULT 'STUDENT',
    `is_approved` BOOLEAN DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `avatar_url` VARCHAR(255) DEFAULT NULL
);

-- 2. CLASSES TABLE
CREATE TABLE IF NOT EXISTS `classes` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `class_name` VARCHAR(100) NOT NULL UNIQUE
);

-- Join table for Students in Classes
CREATE TABLE IF NOT EXISTS `student_classes` (
    `student_id` INT NOT NULL,
    `class_id` INT NOT NULL,
    PRIMARY KEY (`student_id`, `class_id`),
    FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON DELETE CASCADE
);

-- 3. EXAMS TABLE
CREATE TABLE IF NOT EXISTS `exams` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `prof_id` INT NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `subject` VARCHAR(100) NOT NULL,
    `url` TEXT NOT NULL COMMENT 'Link to Google Form/Moodle',
    `code` VARCHAR(10) NOT NULL UNIQUE COMMENT '6-char alphanumeric code',
    `start_time` DATETIME NOT NULL,
    `duration` INT NOT NULL COMMENT 'Duration in minutes',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`prof_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

-- 4. EXAM RESULTS TABLE
CREATE TABLE IF NOT EXISTS `exam_results` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `exam_id` INT NOT NULL,
    `student_id` INT NOT NULL,
    `score` DECIMAL(5,2) DEFAULT NULL,
    `status` ENUM('IN_PROGRESS', 'FINISHED', 'DISQUALIFIED') DEFAULT 'IN_PROGRESS',
    `start_actual` DATETIME DEFAULT NULL,
    `end_actual` DATETIME DEFAULT NULL,
    `violation_log` TEXT DEFAULT NULL COMMENT 'JSON or text log of security violations',
    FOREIGN KEY (`exam_id`) REFERENCES `exams`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

-- Initial Admin Seed (Password: Admin123! - *HASH THIS IN REAL APP*)
-- INSERT INTO users (username, email, password_hash, role, is_approved) 
-- VALUES ('admin', 'admin@bgt.edu', 'HASHED_PASSWORD_HERE', 'ADMIN', TRUE);
