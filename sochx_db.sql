-- ==============================================================================
-- Project: SochX - Where Ideas Go Live
-- Database: sochx_db
-- Target Environment: MySQL 5.7+ / MariaDB 10.3+ / XAMPP phpMyAdmin
-- Character Set: utf8mb4 | Collation: utf8mb4_unicode_ci | Engine: InnoDB
-- ==============================================================================

-- Disable foreign key checks during schema creation / drop
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

-- ------------------------------------------------------------------------------
-- 1. DATABASE INITIALIZATION
-- ------------------------------------------------------------------------------
CREATE DATABASE IF NOT EXISTS `sochx_db`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `sochx_db`;

-- ------------------------------------------------------------------------------
-- 2. DROP EXISTING TABLES (Safe Re-run)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `comments`;
DROP TABLE IF EXISTS `idea_upvotes`;
DROP TABLE IF EXISTS `ideas`;
DROP TABLE IF EXISTS `users`;

-- ------------------------------------------------------------------------------
-- 3. TABLE: USERS
-- Stores core member profiles, credentials, role-based access, and badges.
-- ------------------------------------------------------------------------------
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `fullName` VARCHAR(255) NOT NULL,
  `username` VARCHAR(100) NOT NULL UNIQUE,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL COMMENT 'Bcrypt-hashed password',
  `roleBadge` VARCHAR(100) DEFAULT 'Full Stack Developer',
  `bio` TEXT DEFAULT 'Turning coffee into code and ideas into innovation at SochX.',
  `rankVal` INT DEFAULT 4,
  `role` ENUM('user', 'admin') DEFAULT 'user',
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_users_role` (`role`),
  INDEX `idx_users_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 4. TABLE: IDEAS
-- Primary repository of submitted concepts, categorizations, and metrics.
-- ------------------------------------------------------------------------------
CREATE TABLE `ideas` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `problemDescription` TEXT NOT NULL,
  `proposedSolution` TEXT NOT NULL,
  `category` ENUM('Technology', 'Education', 'Health', 'Business', 'Social', 'Sustainability') NOT NULL,
  `submitterName` VARCHAR(255) NULL,
  `submitterEmail` VARCHAR(255) NULL,
  `authorId` INT NULL,
  `status` ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
  `upvoteCount` INT DEFAULT 0,
  `commentsCount` INT DEFAULT 0,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_ideas_category` (`category`),
  INDEX `idx_ideas_status` (`status`),
  INDEX `idx_ideas_author` (`authorId`),
  CONSTRAINT `fk_ideas_author`
    FOREIGN KEY (`authorId`)
    REFERENCES `users` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 5. TABLE: IDEA_UPVOTES
-- Enforces atomic 1-vote-per-user constraint and tracks engagement.
-- ------------------------------------------------------------------------------
CREATE TABLE `idea_upvotes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `ideaId` INT NOT NULL,
  `userId` INT NOT NULL,
  `votedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_user_idea_vote` (`ideaId`, `userId`),
  INDEX `idx_upvotes_user` (`userId`),
  CONSTRAINT `fk_upvotes_idea`
    FOREIGN KEY (`ideaId`)
    REFERENCES `ideas` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_upvotes_user`
    FOREIGN KEY (`userId`)
    REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 6. TABLE: COMMENTS
-- Collaborative discussion threads attached to specific idea submissions.
-- ------------------------------------------------------------------------------
CREATE TABLE `comments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `ideaId` INT NOT NULL,
  `userId` INT NOT NULL,
  `commentText` TEXT NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_comments_idea` (`ideaId`),
  INDEX `idx_comments_user` (`userId`),
  CONSTRAINT `fk_comments_idea`
    FOREIGN KEY (`ideaId`)
    REFERENCES `ideas` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_comments_user`
    FOREIGN KEY (`userId`)
    REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 7. SEED DATA / REALISTIC DUMMY RECORDS
-- Passwords below are hashed using standard bcrypt ($2b$10$).
-- Plaintext credentials for testing:
--   - arqam@sochx.com  / Admin@123
--   - faryal@sochx.com / Lead@123
--   - hamza@sochx.com  / User@123
-- ------------------------------------------------------------------------------

-- Seed Users (Founders & Contributor)
INSERT INTO `users` (`id`, `fullName`, `username`, `email`, `password`, `roleBadge`, `bio`, `rankVal`, `role`) VALUES
(1, 'Arqam Ishaq', 'arqamishaq', 'arqam@sochx.com', '$2a$10$ruRHa8DBeZcf8AHg/Xn7SO0kIeNu4toF43bnMlIr27423z2KD38W6', 'Founder & Lead Architect', 'Co-Founder & Lead Engineer at SochX. Passionate about scalable distributed systems and turning ideas into impactful reality.', 1, 'admin'),
(2, 'Faryal Azhar', 'faryalazhar', 'faryal@sochx.com', '$2a$10$TDihmixrXzpasUSVIuoLfuG9REeaBCFo2x6uegc0QfDfHwXSj2T5O', 'Co-Founder & Product Strategist', 'Co-Founder at SochX. Dedicated to human-centered product design, design systems, and empowering community innovation.', 2, 'admin'),
(3, 'Hamza Khan', 'hamzakhan', 'hamza@sochx.com', '$2a$10$7ZrtmmgCpzsJN7CjRxxPP.CcUEvmCWKZ5788haum61CbwixscZSPe', 'Full Stack Developer', 'Turning coffee into code and ideas into innovation at SochX.', 4, 'user');

-- Seed Ideas
INSERT INTO `ideas` (`id`, `title`, `problemDescription`, `proposedSolution`, `category`, `submitterName`, `submitterEmail`, `authorId`, `status`, `upvoteCount`, `commentsCount`) VALUES
(1,
 'Smart Traffic Management AI',
 'Urban traffic gridlock causes billions of dollars in lost economic productivity, excessive fuel wastage, and hazardous vehicle emissions due to static, unoptimized timer-based traffic lights.',
 'An adaptive, real-time edge AI system utilizing computer vision cameras on traffic signals. It dynamically adjusts light durations according to real-time traffic volume, weather conditions, and provides automatic green corridors for emergency responders.',
 'Technology',
 'Arqam Ishaq',
 'arqam@sochx.com',
 1,
 'Approved',
 2,
 2
),
(2,
 'Peer-to-Peer Skill Swap',
 'Traditional higher education and corporate bootcamps are prohibitively expensive for students, creating a steep barrier for aspiring programmers, UI designers, and entrepreneurs wanting hands-on mentorship.',
 'A decentralized, reciprocal micro-mentorship platform where students barter verified skills directly (e.g., 1 hour of React code review in exchange for 1 hour of Figma UI/UX prototyping), secured by a reputation-based escrow ledger.',
 'Education',
 'Faryal Azhar',
 'faryal@sochx.com',
 2,
 'Approved',
 1,
 1
),
(3,
 'Solar Powered Smart Benches',
 'Public city parks, green belts, and university campuses lack weather-resistant charging infrastructure and ambient environmental monitoring for students and citizens working outdoors.',
 'Autonomous, ergonomic urban street benches fitted with high-efficiency bifacial solar canopies, Qi wireless charging stations, high-speed USB-PD ports, and integrated IoT environmental sensors broadcasting local Air Quality Index (AQI) metrics.',
 'Sustainability',
 'Arqam Ishaq',
 'arqam@sochx.com',
 1,
 'Approved',
 1,
 0
),
(4,
 'Rural TeleHealth Smart Kiosk',
 'Remote peri-urban and rural communities face critical shortages of licensed doctors, forcing residents to travel dozens of miles for basic diagnostics and preventative primary consultations.',
 'Compact, low-power solar medical kiosks equipped with calibrated vitals sensors (blood pressure, pulse oximetry, contactless temperature, digital stethoscope) connecting patients with remote certified doctors via WebRTC on low-bandwidth satellite links.',
 'Health',
 'Hamza Khan',
 'hamza@sochx.com',
 3,
 'Pending',
 0,
 0
);

-- Seed Idea Upvotes (Strictly unique per user and idea)
INSERT INTO `idea_upvotes` (`ideaId`, `userId`) VALUES
(1, 1),
(1, 2),
(2, 1),
(3, 2);

-- Seed Comments
INSERT INTO `comments` (`ideaId`, `userId`, `commentText`) VALUES
(1, 2, 'Incredible initiative Arqam! Prioritizing emergency vehicle corridors can save thousands of lives in metropolitan areas. Excited to see this move to MVP!'),
(1, 1, 'Thanks Faryal! We are testing real-time vehicle classification with YOLOv8 on simulated intersection feeds right now.'),
(2, 1, 'The skill-barter model completely removes financial friction for university students. Huge potential for widespread adoption across universities.');

-- Re-enable foreign key constraints
SET FOREIGN_KEY_CHECKS = 1;
