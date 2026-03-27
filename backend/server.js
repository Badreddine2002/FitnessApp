const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const db = require('./database');
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

    db.run('INSERT INTO users (username, password_hash) VALUES (?, ?)', [username, hashedPassword], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(400).json({ message: 'Username already exists' });
            }
            return res.status(500).json({ message: err.message });
        }
        res.status(201).json({ id: this.lastID, username });
    });
}));

app.post('/api/auth/login', asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Missing fields' });

    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
        if (err) return res.status(500).json({ message: err.message });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: { id: user.id, username: user.username } });
    });
}));

// --- EXERCISE ROUTES ---

app.get('/api/exercises', authenticateToken, (req, res) => {
    db.all('SELECT * FROM exercises WHERE user_id = ?', [req.user.id], (err, rows) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json(rows);
    });
});

app.post('/api/exercises', authenticateToken, (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Missing name' });

    db.run('INSERT INTO exercises (user_id, name) VALUES (?, ?)', [req.user.id, name], function(err) {
        if (err) return res.status(500).json({ message: err.message });
        res.status(201).json({ id: this.lastID, name });
    });
});

// --- SESSION ROUTES ---

app.get('/api/sessions/:exerciseId', authenticateToken, (req, res) => {
    const { exerciseId } = req.params;
    db.all('SELECT * FROM sessions WHERE exercise_id = ? ORDER BY date DESC', [exerciseId], (err, rows) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json(rows);
    });
});

app.post('/api/sessions', authenticateToken, (req, res) => {
    const { exerciseId, date } = req.body;
    if (!exerciseId || !date) return res.status(400).json({ message: 'Missing fields' });

    db.run('INSERT INTO sessions (exercise_id, date) VALUES (?, ?)', [exerciseId, date], function(err) {
        if (err) return res.status(500).json({ message: err.message });
        res.status(201).json({ id: this.lastID, exerciseId, date });
    });
});

// --- SET ROUTES ---

app.get('/api/sets/:sessionId', authenticateToken, (req, res) => {
    const { sessionId } = req.params;
    db.all('SELECT * FROM sets WHERE session_id = ?', [sessionId], (err, rows) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json(rows);
    });
});

app.post('/api/sets', authenticateToken, (req, res) => {
    const { sessionId, reps, weight } = req.body;
    if (!sessionId || reps === undefined || weight === undefined) return res.status(400).json({ message: 'Missing fields' });

    db.run('INSERT INTO sets (session_id, reps, weight) VALUES (?, ?, ?)', [sessionId, reps, weight], function(err) {
        if (err) return res.status(500).json({ message: err.message });
        res.status(201).json({ id: this.lastID, sessionId, reps, weight });
    });
});

// --- PROGRESS ROUTES ---

app.get('/api/records/:exerciseId', authenticateToken, (req, res) => {
    const { exerciseId } = req.params;
    const query = `
        SELECT MAX(weight) as max_weight, MAX(reps) as max_reps
        FROM sets
        WHERE session_id IN (SELECT id FROM sessions WHERE exercise_id = ?)
    `;
    db.get(query, [exerciseId], (err, row) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json(row);
    });
});

app.get('/api/progress/:exerciseId', authenticateToken, (req, res) => {
    const { exerciseId } = req.params;
    const query = `
        SELECT s.date, MAX(st.weight) as max_weight, MAX(st.reps) as max_reps
        FROM sessions s
        JOIN sets st ON s.id = st.session_id
        WHERE s.exercise_id = ?
        GROUP BY s.date
        ORDER BY s.date ASC
    `;
    db.all(query, [exerciseId], (err, rows) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json(rows);
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
