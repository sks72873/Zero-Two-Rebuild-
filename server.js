const express = require('express');
const { AccessToken } = require('livekit-server-sdk');
const cors = require('cors');

const app = express();
app.use(cors({
    origin: '*'
    methods: ['GET', 'POST']
    allowedHeaders: ['Content-Type']
}));
app.use(express.json());
app.use(express.static('.'));

const API_KEY = 'APIpjVeVwTguRa7'; // ← CHANGE THIS
const API_SECRET = 'CQq8AsK9D1DkQjSOX30EQma2YzxldEEIqkGqzVY0yed'; // ← CHANGE THIS
const LIVEKIT_URL = 'wss://openai-o3rdyl8j.livekit.cloud'; // ← CHANGE THIS

app.post('/api/token', (req, res) => {
    const { room, username } = req.body;
    
    const at = new AccessToken(API_KEY, API_SECRET, {
        identity: username,
        ttl: '24h'
    });

    at.addGrant({
        roomJoin: true,
        room: room,
        canPublish: true,
        canSubscribe: true,
    });

    res.send(at.toJwt());
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
