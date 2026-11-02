/**
 * ==============================================================================
 * Project: SochX - Where Ideas Go Live
 * Database Seeder: backend/seeds/seedData.js
 * Description: Populates XAMPP sochx_db database with rich demo users, ideas,
 *              relational upvotes, and discussion comments.
 * Run via: node seeds/seedData.js
 * ==============================================================================
 */

const path = require('path');
const fs = require('fs');

// Attempt to load .env from backend/.env or root .env
const envPaths = [
  path.join(__dirname, '../.env'),
  path.join(__dirname, '.env'),
  path.join(__dirname, '../../.env'),
];

for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
    break;
  }
}

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '',
  database: process.env.DB_NAME || 'sochx_db',
};

async function seedDatabase() {
  console.log('====================================================================');
  console.log('🌱 SochX: Initializing Database Seeding Workflow...');
  console.log(`📌 Target MySQL Host: ${DB_CONFIG.host}:${DB_CONFIG.port}`);
  console.log(`📂 Database:          ${DB_CONFIG.database}`);
  console.log('====================================================================');

  let connection;

  try {
    // 1. Connect to MySQL server (without selecting DB first to ensure it exists)
    connection = await mysql.createConnection({
      host: DB_CONFIG.host,
      port: DB_CONFIG.port,
      user: DB_CONFIG.user,
      password: DB_CONFIG.password,
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_CONFIG.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await connection.query(`USE \`${DB_CONFIG.database}\`;`);

    // 2. Ensure schema tables exist
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        fullName VARCHAR(255) NOT NULL,
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        roleBadge VARCHAR(100) DEFAULT 'Full Stack Developer',
        bio TEXT DEFAULT 'Turning coffee into code and ideas into innovation at SochX.',
        rankVal INT DEFAULT 4,
        role ENUM('user', 'admin') DEFAULT 'user',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_users_role (role),
        INDEX idx_users_username (username)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS ideas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        problemDescription TEXT NOT NULL,
        proposedSolution TEXT NOT NULL,
        category ENUM('Technology', 'Education', 'Health', 'Business', 'Social', 'Sustainability') NOT NULL,
        submitterName VARCHAR(255),
        submitterEmail VARCHAR(255),
        authorId INT,
        status VARCHAR(50) DEFAULT 'PENDING',
        upvoteCount INT DEFAULT 0,
        commentsCount INT DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_ideas_category (category),
        INDEX idx_ideas_status (status),
        INDEX idx_ideas_author (authorId),
        CONSTRAINT fk_ideas_author FOREIGN KEY (authorId) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS idea_upvotes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ideaId INT NOT NULL,
        userId INT NOT NULL,
        votedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_idea_vote (ideaId, userId),
        INDEX idx_upvotes_user (userId),
        CONSTRAINT fk_upvotes_idea FOREIGN KEY (ideaId) REFERENCES ideas(id) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT fk_upvotes_user FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ideaId INT NOT NULL,
        userId INT NOT NULL,
        commentText TEXT NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_comments_idea (ideaId),
        INDEX idx_comments_user (userId),
        CONSTRAINT fk_comments_idea FOREIGN KEY (ideaId) REFERENCES ideas(id) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT fk_comments_user FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log('✅ Verified schema tables: users, ideas, idea_upvotes, comments.');

    // 3. Clean existing tables safely
    await connection.query('SET FOREIGN_KEY_CHECKS = 0;');
    await connection.query('TRUNCATE TABLE comments;');
    await connection.query('TRUNCATE TABLE idea_upvotes;');
    await connection.query('TRUNCATE TABLE ideas;');
    await connection.query('TRUNCATE TABLE users;');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1;');
    console.log('🧹 Flushed previous demo records (Safe re-seed).');

    // 4. Generate BCRYPT Hashed Passwords
    const saltRounds = 10;
    const adminHash = await bcrypt.hash('Admin@123', saltRounds);
    const founderHash = await bcrypt.hash('Lead@123', saltRounds);
    const studentHash = await bcrypt.hash('Student@123', saltRounds);

    // 5. Seed Users
    const usersData = [
      [
        1,
        'SochX Administrator',
        'sochxadmin',
        'admin@sochx.com',
        adminHash,
        'SYSTEM ADMINISTRATOR',
        'Chief System Administrator & Platform Overseer for SochX.',
        1,
        'admin',
      ],
      [
        2,
        'Arqam Ishaq',
        'arqamishaq',
        'arqamishaq22@gmail.com',
        adminHash,
        'CO-FOUNDER & FULL STACK ARCHITECT',
        'Co-Founder & Full Stack Architect at SochX. Passionate about scalable distributed systems and turning ideas into impactful reality.',
        1,
        'admin',
      ],
      [
        3,
        'Faryal Azhar',
        'faryalazhar',
        'faryalazhar@gmail.com',
        founderHash,
        'CO-FOUNDER & LEAD FRONTEND ARCHITECT',
        'Co-Founder & Lead Frontend Architect at SochX. Dedicated to human-centered product design, design systems, and empowering community innovation.',
        2,
        'admin',
      ],
      [
        4,
        'Junaid Dar',
        'junaiddar',
        'junaiddar@gmail.com',
        studentHash,
        'Student Innovator',
        'Passionate computer science scholar exploring AI applications and embedded IoT.',
        4,
        'user',
      ],
      [
        5,
        'Sarah Ahmed',
        'sarahahmed',
        'sarahahmed@gmail.com',
        studentHash,
        'Full Stack Developer',
        'Building community-driven software for sustainable energy and peer education.',
        4,
        'user',
      ],
    ];

    for (const u of usersData) {
      await connection.query(
        `INSERT INTO users (id, fullName, username, email, password, roleBadge, bio, rankVal, role)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        u
      );
    }
    console.log(`👤 Seeded ${usersData.length} User Accounts (1 Admin, 2 Founders, 2 Students).`);

    // 6. Seed Ideas
    const ideasData = [
      [
        1,
        'Smart Traffic Management AI',
        'Urban traffic gridlock causes billions of dollars in lost economic productivity, excessive fuel wastage, and hazardous vehicle emissions due to static, unoptimized timer-based traffic lights.',
        'An adaptive, real-time edge AI system utilizing computer vision cameras on traffic signals. It dynamically adjusts light durations according to real-time traffic volume, weather conditions, and provides automatic green corridors for emergency responders.',
        'Technology',
        'Arqam Ishaq',
        'arqamishaq22@gmail.com',
        2,
        'Approved',
        124,
        18,
      ],
      [
        2,
        'Peer-to-Peer Skill Swap',
        'Traditional higher education and corporate bootcamps are prohibitively expensive for students, creating a steep barrier for aspiring programmers, UI designers, and entrepreneurs wanting hands-on mentorship.',
        'A decentralized, reciprocal micro-mentorship platform where students barter verified skills directly (e.g., 1 hour of React code review in exchange for 1 hour of Figma UI/UX prototyping), secured by a reputation-based escrow ledger.',
        'Social',
        'Faryal Azhar',
        'faryalazhar@gmail.com',
        3,
        'Approved',
        89,
        5,
      ],
      [
        3,
        'Solar Powered Benches',
        'Public city parks, green belts, and university campuses lack weather-resistant charging infrastructure and ambient environmental monitoring for students and citizens working outdoors.',
        'Autonomous, ergonomic urban street benches fitted with high-efficiency bifacial solar canopies, Qi wireless charging stations, high-speed USB-PD ports, and integrated IoT environmental sensors broadcasting local Air Quality Index (AQI) metrics.',
        'Sustainability',
        'Arqam Ishaq',
        'arqamishaq22@gmail.com',
        2,
        'Approved',
        210,
        32,
      ],
      [
        4,
        'Smart Education App',
        'Students in crowded lecture halls and underprivileged schools lack personalized pacing, real-time concept comprehension feedback, and access to interactive adaptive problem sets.',
        'An offline-first mobile learning application featuring personalized micro-quizzes, voice-assisted AI tutoring in native regional dialects, and decentralized peer study groups requiring zero internet bandwidth.',
        'Education',
        'Junaid Dar',
        'junaiddar@gmail.com',
        4,
        'Pending',
        14,
        2,
      ],
    ];

    for (const idea of ideasData) {
      await connection.query(
        `INSERT INTO ideas (id, title, problemDescription, proposedSolution, category, submitterName, submitterEmail, authorId, status, upvoteCount, commentsCount)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        idea
      );
    }
    console.log(`💡 Seeded ${ideasData.length} Student Innovations (3 Approved, 1 Pending).`);

    // 7. Seed Relational Upvotes (mapped to users to verify stats calculations)
    const upvotesData = [
      [1, 1], // Admin -> Idea 1
      [1, 2], // Arqam -> Idea 1
      [1, 3], // Faryal -> Idea 1
      [1, 4], // Junaid -> Idea 1
      [1, 5], // Sarah -> Idea 1
      [2, 1], // Admin -> Idea 2
      [2, 2], // Arqam -> Idea 2
      [2, 4], // Junaid -> Idea 2
      [3, 1], // Admin -> Idea 3
      [3, 3], // Faryal -> Idea 3
      [3, 4], // Junaid -> Idea 3
      [3, 5], // Sarah -> Idea 3
      [4, 4], // Junaid -> Idea 4
      [4, 5], // Sarah -> Idea 4
    ];

    for (const [ideaId, userId] of upvotesData) {
      await connection.query(
        `INSERT IGNORE INTO idea_upvotes (ideaId, userId) VALUES (?, ?)`,
        [ideaId, userId]
      );
    }
    console.log(`👍 Seeded ${upvotesData.length} relational upvote records across users.`);

    // 8. Seed Discussion Comments
    const commentsData = [
      [
        1,
        3,
        'Incredible initiative Arqam! Prioritizing emergency vehicle corridors can save thousands of lives in metropolitan areas. Excited to see this move to MVP testing.',
      ],
      [
        1,
        2,
        'Thanks Faryal! We are validating real-time vehicle classification with YOLOv8 on simulated intersection feeds right now.',
      ],
      [
        1,
        4,
        'Would love to see how this integrates with traffic light hardware in Lahore and Karachi!',
      ],
      [
        2,
        2,
        'The skill-barter model completely removes financial friction for university students. Huge potential for widespread adoption across CS and Art departments.',
      ],
      [
        2,
        5,
        'I would happily offer 2 hours of React / CSS mentoring in exchange for Figma prototyping help! Sign me up.',
      ],
      [
        3,
        1,
        'Outstanding sustainability project. The university campus administration should approve pilot deployment immediately.',
      ],
      [
        4,
        5,
        'Offline-first architecture is critical for students with spotty internet connectivity. Great proposal Junaid!',
      ],
    ];

    for (const [ideaId, userId, text] of commentsData) {
      await connection.query(
        `INSERT INTO comments (ideaId, userId, commentText) VALUES (?, ?, ?)`,
        [ideaId, userId, text]
      );
    }
    console.log(`💬 Seeded ${commentsData.length} discussion feedback comments.`);

    console.log('====================================================================');
    console.log('🎉 SOCHX DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('====================================================================');
    console.log('🔑 DEMO LOGIN CREDENTIALS:');
    console.log('   1. Super Admin:      admin@sochx.com         | Password: Admin@123');
    console.log('   2. Founder Architect: arqamishaq22@gmail.com | Password: Admin@123');
    console.log('   3. Founder Frontend:  faryalazhar@gmail.com  | Password: Lead@123');
    console.log('   4. Student Innovator: junaiddar@gmail.com    | Password: Student@123');
    console.log('   5. Student Developer: sarahahmed@gmail.com   | Password: Student@123');
    console.log('====================================================================');

    return true;
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    return false;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Execute when run directly
if (require.main === module) {
  seedDatabase()
    .then((success) => process.exit(success ? 0 : 1))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = seedDatabase;
