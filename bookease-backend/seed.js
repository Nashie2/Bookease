const db = require('./config/db');

async function seed() {
    try {
        console.log('Clearing existing services...');
        await db.query('DELETE FROM services');

        const services = [
            {
                id: 'svc_1',
                name: 'Premium Haircut & Styling',
                price: 550,
                duration: 45,
                description: 'A complete haircut, wash, and premium styling session.',
                category: 'Hair',
                active: true
            },
            {
                id: 'svc_2',
                name: 'Deep Tissue Massage',
                price: 1200,
                duration: 60,
                description: 'A full-hour deep tissue massage to relieve muscle tension.',
                category: 'Wellness',
                active: true
            },
            {
                id: 'svc_3',
                name: 'Basic Consultation',
                price: 0,
                duration: 30,
                description: 'A free 30-minute consultation to discuss your needs.',
                category: 'Consultation',
                active: true
            },
            {
                id: 'svc_4',
                name: 'Signature Facial Treatment',
                price: 850,
                duration: 60,
                description: 'Rejuvenating facial treatment using organic products.',
                category: 'Beauty',
                active: true
            }
        ];

        console.log('Inserting default services...');
        for (const svc of services) {
            await db.query(
                'INSERT INTO services (id, name, price, duration, description, category, active) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [svc.id, svc.name, svc.price, svc.duration, svc.description, svc.category, svc.active]
            );
        }

        console.log('Services seeded successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding services:', err);
        process.exit(1);
    }
}

seed();
