const mysql = require('mysql2');
require('dotenv').config();

// Create the connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'bookease_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000
    // ssl: { rejectUnauthorized: false } // Removed for Railway compatibility
});

// Debug: Verify environment variables (Hiding sensitive info)
console.log('Connecting to Database Host:', process.env.DB_HOST || 'localhost');
console.log('Using Port:', process.env.DB_PORT || 3306);

// Convert pool to use promises
const promisePool = pool.promise();

// Test the connection
promisePool.getConnection()
    .then(connection => {
        console.log('Successfully connected to the MySQL database.');
        connection.release();
    })
    .catch(err => {
        console.error('Error connecting to the database. Please make sure MySQL is running.');
        console.error('Error details:', err.message);
    });

module.exports = promisePool;
