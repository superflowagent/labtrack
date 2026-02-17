import express from 'express';

const app = express();

const allowedOrigins = new Set(['http://localhost:5173']);

app.use((req, res, next) => {
    const origin = req.headers.origin;

    if (origin && allowedOrigins.has(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    }

    res.header('Vary', 'Origin');
    res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }

    next();
});

console.log('Creating test server...');

// Middleware
app.use(express.json());
console.log('Middleware registered');

// Routes
app.get('/test', (req, res) => {
    console.log('GET /test called');
    res.json({ status: 'ok' });
});

app.post('/poll/:id', (req, res) => {
    console.log('POST /poll/:id called with id:', req.params.id);
    res.json({ id: req.params.id });
});

app.listen(3001, () => {
    console.log('Server listening on port 3001');
});
