const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

/**
 * Production-ready MySQL Connection Pool using mysql2/promise
 * Maintains reusable database connections and prevents resource exhaustion.
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '',
  database: process.env.DB_NAME || 'sochx_db',
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
});

/**
 * Tests connection to XAMPP MySQL database upon server startup
 */
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT VERSION() AS version, CURRENT_TIMESTAMP AS now');
    console.log('[SochX Backend] ✅ XAMPP MySQL Connected Successfully!');
    console.log(`[SochX Backend] 📌 Host: ${process.env.DB_HOST || 'localhost'} | Database: ${process.env.DB_NAME || 'sochx_db'}`);
    console.log(`[SochX Backend] ⚙️  MySQL/MariaDB Version: ${rows[0].version}`);
    connection.release();
    return true;
  } catch (error) {
    console.error('[SochX Backend] ❌ Failed to connect to XAMPP MySQL:');
    console.error(` -> Error Code: ${error.code || 'UNKNOWN'}`);
    console.error(` -> Error Message: ${error.message}`);
    console.error(' -> Troubleshoot: Ensure MySQL service is running in XAMPP Control Panel and .env credentials match.');
    return false;
  }
};

module.exports = {
  pool,
  testConnection,
};
