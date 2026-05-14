const mysql = require('mysql2/promise');

async function test() {
    try {
        const conn = await mysql.createConnection({
            host: 'yamabiko.proxy.rlwy.net',
            port: 27533,
            user: 'root',
            password: 'SNnnkhJRlflgzzrfZemxEZUfORwjJPTe',
            database: 'railway',
        });
        const [rows] = await conn.execute('DESCRIBE users');
        console.log(rows);
        await conn.end();
    } catch(err) {
        console.error(err);
    }
}
test();
