const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const db = require('./database'); // This is the PostgreSQL pool
const asyncHandler = require('express-async-handler');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Middleware for Authentication
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'No token provided' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Forbidden' });
        req.user = user;
        next();
    });
};

// --- AUTH ROUTES ---

app.post('/api/auth/register', asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Missing fields' });

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const result = await db.query(
            'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id',
            [username, hashedPassword]
        );
        res.status(201).json({ id: result.rows[0].id, username });
    } catch (err) {
        if (err.code === '23505') { // PostgreSQL code for unique_violation
            return res.status(400).json({ message: 'Username already exists' });
        }
        res.status(500).json({ message: err.message });
    }
}));

app.post('/api/auth/login', asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Missing fields' });

    const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];

    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, username: user.username } });
}));

// --- EXERCISE ROUTES ---

app.get('/api/exercises', authenticateToken, asyncHandler(async (req, res) => {
    const result = await db.query('SELECT * FROM exercises WHERE user_id = $1', [req.user.id]);
    res.json(result.rows);
}));

app.post('/api/exercises', authenticateToken, asyncHandler(async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Missing name' });

    const result = await db.query(
        'INSERT INTO exercises (user_id, name) VALUES ($1, $2) RETURNING id',
        [req.user.id, name]
    );
    res.status(201).json({ id: result.rows[0].id, name });
}));

// --- SESSION ROUTES ---

app.get('/api/sessions/:exerciseId', authenticateToken, asyncHandler(async (req, res) => {
    const { exerciseId } = req.params;
    const result = await db.query(
        'SELECT * FROM sessions WHERE exercise_id = $1 ORDER BY date DESC',
        [exerciseId]
    );
    res.json(result.rows);
}));

app.post('/api/sessions', authenticateToken, asyncHandler(async (req, res) => {
    const { exerciseId, date } = req.body;
    if (!exerciseId || !date) return res.status(400).json({ message: 'Missing fields' });

    const result = await db.query(
        'INSERT INTO sessions (exercise_id, date) VALUES ($1, $2) RETURNING id',
        [exerciseId, date]
    );
    res.status(201).json({ id: result.rows[0].id, exerciseId, date });
}));

// --- SET ROUTES ---

app.get('/api/sets/:sessionId', authenticateToken, asyncHandler(async (req, res) => {
    const { sessionId } = req.params;
    const result = await db.query('SELECT * FROM sets WHERE session_id = $1', [sessionId]);
    res.json(result.rows);
}));

app.post('/api/sets', authenticateToken, asyncHandler(async (req, res) => {
    const { sessionId, reps, weight } = req.body;
    if (!sessionId || reps === undefined || weight === undefined) return res.status(400).json({ message: 'Missing fields' });

    const result = await db.query(
        'INSERT INTO sets (session_id, reps, weight) VALUES ($1, $2, $3) RETURNING id',
        [sessionId, reps, weight]
    );
    res.status(201).json({ id: result.rows[0].id, sessionId, reps, weight });
}));

// --- PROGRESS ROUTES ---

app.get('/api/records/:exerciseId', authenticateToken, asyncHandler(async (req, res) => {
    const { exerciseId } = req.params;
    const query = `
        SELECT MAX(weight) as max_weight, MAX(reps) as max_reps
        FROM sets
        WHERE session_id IN (SELECT id FROM sessions WHERE exercise_id = $1)
    `;
    const result = await db.query(query, [exerciseId]);
    res.json(result.rows[0]);
}));

app.get('/api/progress/:exerciseId', authenticateToken, asyncHandler(async (req, res) => {
    const { exerciseId } = req.params;
    const query = `
        SELECT s.date, MAX(st.weight) as max_weight, MAX(st.reps) as max_reps
        FROM sessions s
        JOIN sets st ON s.id = st.session_id
        WHERE s.exercise_id = $1
        GROUP BY s.date
        ORDER BY s.date ASC
    `;
    const result = await db.query(query, [exerciseId]);
    res.json(result.rows);
}));

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
