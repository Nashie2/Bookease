const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ limit: '15mb', extended: true }));

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'BookEase API is running' });
});

// ==========================================
//  USERS
// ==========================================
app.get('/api/users', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, first_name AS first, last_name AS last, email, role, phone, avatar, created_at AS created FROM users');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: `Backend Error: ${err.message}` });
    }
});

app.get('/api/users/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, first_name AS first, last_name AS last, email, role, phone, avatar, created_at AS created FROM users WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: `Backend Error: ${err.message}` });
    }
});

app.put('/api/users/:id', async (req, res) => {
    const { first, last, phone, password, avatar } = req.body;
    try {
        // We allow updating partial fields
        const updates = [];
        const values = [];

        if (first !== undefined) { updates.push('first_name = ?'); values.push(first); }
        if (last !== undefined) { updates.push('last_name = ?'); values.push(last); }
        if (phone !== undefined) { updates.push('phone = ?'); values.push(phone); }
        if (password !== undefined) { updates.push('password_hash = ?'); values.push(password); }
        if (avatar !== undefined) { updates.push('avatar = ?'); values.push(avatar); }

        if (updates.length > 0) {
            values.push(req.params.id);
            await db.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);
        }
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: `Backend Error: ${err.message}` });
    }
});

const nodemailer = require('nodemailer');

// ==========================================
//  EMAIL CONFIG
// ==========================================
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function sendBookingEmail(user, booking, service) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('Email credentials missing. Skipping email.');
        return;
    }

    const mailOptions = {
        from: `"BookEase" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Booking Confirmation — BookEase',
        html: `
            <div style="font-family: sans-serif; padding: 20px; color: #1a1916;">
                <h2 style="color: #1a7a6e;">Booking Confirmed! ✦</h2>
                <p>Hi ${user.first}, your booking has been successfully recorded.</p>
                <div style="background: #f7f6f3; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Service:</strong> ${service.name}</p>
                    <p><strong>Date:</strong> ${booking.date}</p>
                    <p><strong>Time:</strong> ${booking.time}</p>
                    <p><strong>Amount:</strong> ₱${booking.amount}</p>
                </div>
                <p>Thank you for choosing BookEase!</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Confirmation email sent to ${user.email}`);
    } catch (err) {
        console.error('Failed to send email:', err);
    }
}

// ==========================================
//  AUTH
// ==========================================
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows] = await db.query('SELECT id, first_name AS first, last_name AS last, email, role, phone, avatar, password_hash AS password FROM users WHERE email = ? AND password_hash = ?', [email, password]);
        if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: `Backend Error: ${err.message}` });
    }
});

app.post('/api/auth/social', async (req, res) => {
    const { id, email, first, last, avatar, role } = req.body;
    try {
        // Safely ensure avatar column exists (fixes "Unknown column" errors dynamically)
        try {
            await db.query('ALTER TABLE users ADD COLUMN avatar VARCHAR(255) DEFAULT NULL');
        } catch (e) { /* Column likely exists, ignore error */ }

        // Check if user exists
        const [rows] = await db.query('SELECT id, first_name AS first, last_name AS last, email, role, phone, avatar FROM users WHERE email = ? OR id = ?', [email, id]);
        
        if (rows.length > 0) {
            // Update avatar if changed
            if (avatar && rows[0].avatar !== avatar) {
                await db.query('UPDATE users SET avatar = ? WHERE email = ?', [avatar, email]);
            }
            return res.json({ ...rows[0], avatar: avatar || rows[0].avatar });
        }

        // Ensure id is truncated if it exceeds standard varchar limits just in case, but usually 28 chars is fine
        const safeId = id.substring(0, 50);

        // Create new user
        await db.query(
            'INSERT INTO users (id, first_name, last_name, email, role, avatar, password_hash, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [safeId, first || 'User', last || '', email, role === 'client' ? 'user' : (role || 'user'), avatar || null, 'social_login', '']
        );
        
        res.status(201).json({ id: safeId, first, last, email, role: role === 'client' ? 'user' : (role || 'user'), avatar });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: `Backend Error: ${err.message}` });
    }
});

app.post('/api/auth/register', async (req, res) => {
    const { id, first, last, email, password, phone, role } = req.body;
    try {
        const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) return res.status(400).json({ error: 'Email already registered' });
        
        // Enforce max 2 admins
        if (role === 'admin') {
            const [admins] = await db.query('SELECT id FROM users WHERE role = "admin"');
            if (admins.length >= 2) {
                return res.status(403).json({ error: 'Administrator capacity reached (max 2 accounts)' });
            }
        }

        await db.query(
            'INSERT INTO users (id, first_name, last_name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [id, first, last, email, password, phone, role || 'user']
        );
        res.status(201).json({ id, first, last, email, phone, role: role || 'user' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: `Backend Error: ${err.message}` });
    }
});

// ==========================================
//  SERVICES
// ==========================================
app.get('/api/services', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM services');
        // Map to frontend format
        const mapped = rows.map(r => ({
            id: r.id, name: r.name, price: Number(r.price), duration: r.duration, desc: r.description, cat: r.category, icon: r.icon, active: Boolean(r.active)
        }));
        res.json(mapped);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: `Backend Error: ${err.message}` });
    }
});

app.post('/api/services', async (req, res) => {
    const { id, name, price, duration, desc, cat, icon, active } = req.body;
    try {
        await db.query(
            'INSERT INTO services (id, name, price, duration, description, category, icon, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [id, name, price, duration, desc, cat, icon, active]
        );
        res.status(201).json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: `Backend Error: ${err.message}` });
    }
});

app.put('/api/services/:id', async (req, res) => {
    const { name, price, duration, desc, cat, icon, active } = req.body;
    try {
        const updates = [];
        const values = [];

        if (name !== undefined) { updates.push('name = ?'); values.push(name); }
        if (price !== undefined) { updates.push('price = ?'); values.push(price); }
        if (duration !== undefined) { updates.push('duration = ?'); values.push(duration); }
        if (desc !== undefined) { updates.push('description = ?'); values.push(desc); }
        if (cat !== undefined) { updates.push('category = ?'); values.push(cat); }
        if (icon !== undefined) { updates.push('icon = ?'); values.push(icon); }
        if (active !== undefined) { updates.push('active = ?'); values.push(active); }

        if (updates.length > 0) {
            values.push(req.params.id);
            await db.query(`UPDATE services SET ${updates.join(', ')} WHERE id = ?`, values);
        }
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: `Backend Error: ${err.message}` });
    }
});

app.delete('/api/services/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM services WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: `Backend Error: ${err.message}` });
    }
});

// ==========================================
//  BOOKINGS
// ==========================================
app.get('/api/bookings', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM bookings');
        // Map to frontend format
        const mapped = rows.map(r => ({
            id: r.id, serviceId: r.service_id, userId: r.user_id, date: r.booking_date.toISOString().split('T')[0], time: r.booking_time, status: r.status, amount: Number(r.amount), notes: r.notes || ''
        }));
        res.json(mapped);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: `Backend Error: ${err.message}` });
    }
});

app.post('/api/bookings', async (req, res) => {
    const { id, serviceId, userId, date, time, status, amount, notes } = req.body;
    try {
        await db.query(
            'INSERT INTO bookings (id, service_id, user_id, booking_date, booking_time, status, amount, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [id, serviceId, userId, date, time, status, amount, notes]
        );

        // Async email notification
        (async () => {
            try {
                const [[user]]    = await db.query('SELECT first_name AS first, email FROM users WHERE id = ?', [userId]);
                const [[service]] = await db.query('SELECT name FROM services WHERE id = ?', [serviceId]);
                if (user && service) {
                    await sendBookingEmail(user, { date, time, amount }, service);
                }
            } catch (e) {
                console.error('Email preparation failed:', e);
            }
        })();

        res.status(201).json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: `Backend Error: ${err.message}` });
    }
});

app.put('/api/bookings/:id', async (req, res) => {
    // We allow updating partial fields (like status) or full fields
    const keys = Object.keys(req.body);
    const updates = [];
    const values = [];

    if (keys.includes('status')) { updates.push('status = ?'); values.push(req.body.status); }
    if (keys.includes('date')) { updates.push('booking_date = ?'); values.push(req.body.date); }
    if (keys.includes('time')) { updates.push('booking_time = ?'); values.push(req.body.time); }
    
    if (updates.length === 0) return res.status(400).json({ error: 'No valid fields provided' });

    values.push(req.params.id);

    try {
        await db.query(`UPDATE bookings SET ${updates.join(', ')} WHERE id = ?`, values);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: `Backend Error: ${err.message}` });
    }
});

app.delete('/api/bookings/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM bookings WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: `Backend Error: ${err.message}` });
    }
});

// ==========================================
//  SETTINGS
// ==========================================
app.get('/api/settings', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT setting_value FROM settings WHERE setting_key = "business_settings"');
        if (rows.length === 0) return res.json({});
        res.json(rows[0].setting_value);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: `Backend Error: ${err.message}` });
    }
});

app.put('/api/settings', async (req, res) => {
    try {
        await db.query(
            'UPDATE settings SET setting_value = ? WHERE setting_key = "business_settings"',
            [JSON.stringify(req.body)]
        );
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: `Backend Error: ${err.message}` });
    }
});

if (process.env.NODE_ENV !== 'test' && require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

module.exports = app;
