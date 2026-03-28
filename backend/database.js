const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

const initializeDatabase = async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        // Users Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL
            )
        `);

        // Exercises Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS exercises (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);

        // Sessions Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS sessions (
                id SERIAL PRIMARY KEY,
                exercise_id INTEGER NOT NULL,
                date TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (exercise_id) REFERENCES exercises(id)
            )
        `);

        // Sets Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS sets (
                id SERIAL PRIMARY KEY,
                session_id INTEGER NOT NULL,
                reps INTEGER NOT NULL,
                weight REAL NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (session_id) REFERENCES sessions(id)
            )
        `);

        await client.query('COMMIT');
        console.log('PostgreSQL database initialized successfully.');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error initializing database:', err.message);
    } finally {
        client.release();
    }
};

initializeDatabase();

module.exports = pool;
