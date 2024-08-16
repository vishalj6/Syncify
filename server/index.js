import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import youtubeRoutes from './routes/youtubeRoutes.js';
import spotifyRoutes from './routes/spotifyRoutes.js';

dotenv.config();

const app = express();
app.use(cors(
    {
        origin: ['https://syncify-vishal.netlify.app', 'https://syncify-sty0.onrender.com', 'http://localhost:5173'],
        credentials: true
    }
));
app.use(express.json());

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;

app.use('/api', youtubeRoutes);
app.use('/api', spotifyRoutes);

app.get('/', (req, res) => {
    res.send('Server is running');
});

app.get('/auth/spotify', (req, res) => {
    const scopes = 'playlist-modify-private playlist-read-private';
    const state = 'random_string'; // For CSRF protection
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${SPOTIFY_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(SPOTIFY_REDIRECT_URI)}&scope=${encodeURIComponent(scopes)}&state=${state}`;
    res.redirect(authUrl);
});

app.get('/callback', async (req, res) => {
    const { code } = req.query;
    if (!code) {
        return res.status(400).send('No code provided');
    }

    try {
        const response = await axios.post('https://accounts.spotify.com/api/token', new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: SPOTIFY_REDIRECT_URI,
            client_id: SPOTIFY_CLIENT_ID,
            client_secret: SPOTIFY_CLIENT_SECRET,
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const { access_token } = response.data;
        // Store token in session or database and redirect to frontend
        res.redirect(`${process.env.FRONTEND_URI || "http://localhost:5173"}/auth-redirect?access_token=${access_token}`); // Modify this URL as needed
    } catch (error) {
        res.status(500).send('Error getting access token');
    }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
