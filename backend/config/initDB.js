const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

/**
 * Automatically initializes MySQL Database and Relational Tables
 * 1. Creates database if it doesn't already exist.
 * 2. Creates tables: users, ideas, and idea_upvotes.
 */
const initDB = async () => {
  const dbName = process.env.DB_NAME || 'sochx_db';
  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const port = Number(process.env.DB_PORT) || 3306;

  let connection;

  try {
    // Connect to MySQL server without selecting a database first
    connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
    });

    console.log(`[SochX InitDB] Checking and creating database '${dbName}'...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await connection.query(`USE \`${dbName}\`;`);

    // ========================================================================
    // 1. TABLE: USERS
    // ========================================================================
    const createUsersTableSQL = `
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
    `;
    await connection.query(createUsersTableSQL);
    console.log('[SochX InitDB] Table `users` checked/created successfully.');

    // ========================================================================
    // 2. TABLE: IDEAS
    // ========================================================================
    const createIdeasTableSQL = `
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
    `;
    await connection.query(createIdeasTableSQL);
    console.log('[SochX InitDB] Table `ideas` checked/created successfully.');

    // ========================================================================
    // 3. TABLE: IDEA_UPVOTES (Strictly prevents duplicate votes)
    // ========================================================================
    const createUpvotesTableSQL = `
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
    `;
    await connection.query(createUpvotesTableSQL);
    console.log('[SochX InitDB] Table `idea_upvotes` checked/created successfully.');

    // ========================================================================
    // 4. TABLE: COMMENTS
    // ========================================================================
    const createCommentsTableSQL = `
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
    `;
    await connection.query(createCommentsTableSQL);
    console.log('[SochX InitDB] Table `comments` checked/created successfully.');

    console.log('[SochX InitDB] All relational database tables initialized successfully!');
    return true;
  } catch (error) {
    console.error(`[SochX InitDB Error] Failed to initialize database: ${error.message}`);
    return false;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

// If executed directly from CLI: node config/initDB.js
if (require.main === module) {
  initDB()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = initDB;
