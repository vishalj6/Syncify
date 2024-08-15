import express from 'express';
import youtubeController from '../controllers/youtubeController.js';

const youtubeRoutes = express.Router();

youtubeRoutes.post('/youtube/fetch-playlist-tracks', async (req, res) => {
    const { accessToken, playlistId } = req.body;
    try {
        const trackUris = await youtubeController.getYouTubePlaylist(accessToken, playlistId);        
        res.json({ trackUris });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching YouTube playlist tracks' });
    }
});

export default youtubeRoutes;
