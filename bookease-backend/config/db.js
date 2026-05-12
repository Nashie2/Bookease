const mysql = require('mysql2/promise');
require('dotenv').config();

// Create a direct connection instead of a pool for testing
async function getConnection() {
    const config = {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'railway',
        connectTimeout: 20000 // 20 seconds
    };
    
    console.log('Attempting direct connection to:', config.host, 'Port:', config.port);
    return await mysql.createConnection(config);
}

// We will export a wrapper that mimics the pool.query behavior
const dbWrapper = {
    query: async (sql, params) => {
        const conn = await getConnection();
        try {
            const [rows] = await conn.execute(sql, params);
            return [rows];
        } finally {
            await conn.end();
        }
    }
};

module.exports = dbWrapper;
