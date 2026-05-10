const db = require('./config/db');

async function migrate() {
    try {
        console.log('Adding avatar column to users table...');
        // Use ALTER TABLE ... ADD COLUMN IF NOT EXISTS (MySQL doesn't support IF NOT EXISTS for columns natively in older versions, so we catch the duplicate column error)
        try {
            await db.query('ALTER TABLE users ADD COLUMN avatar LONGTEXT');
            console.log('User avatar column added successfully.');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('User avatar column already exists.');
            } else {
                throw err;
            }
        }

        try {
            await db.query('ALTER TABLE services MODIFY COLUMN icon LONGTEXT');
            console.log('Service icon column modified successfully.');
        } catch (err) {
            console.error('Error modifying service icon column:', err);
            throw err;
        }
        process.exit(0);
    } catch (err) {
        console.error('Migration error:', err);
        process.exit(1);
    }
}

migrate();
