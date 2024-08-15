import express from 'express';
import axios from 'axios';
import spotifyController from '../controllers/spotifyController.js';

const spotifyRoutes = express.Router();

spotifyRoutes.post('/spotify/create-playlist', async (req, res) => {
    const { accessToken, playlistName, trackUris } = req.body;
    try {
        console.log(accessToken);

        // Get the user ID from Spotify
        const userIdResponse = await axios.get('https://api.spotify.com/v1/me', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });
        const userId = userIdResponse.data.id;

        // Create Spotify playlist and add tracks
        const playlist = await spotifyController.createSpotifyPlaylist(accessToken, userId, playlistName);
        const addedPlaylist = await spotifyController.addTracksToSpotifyPlaylist(accessToken, playlist.id, trackUris);

        // Construct the playlist link
        const playlistLink = `https://open.spotify.com/playlist/${playlist.id}`;

        res.json({
            message: 'Playlist created and tracks added',
            addedPlaylist,
            playlistLink, // Include the playlist link in the response
        });
    } catch (error) {
        if (error.response && error.response.status === 401) {
            // Handle unauthorized error
            res.status(401).json({ message: 'Unauthorized. Please re-authenticate with Spotify.' });
        } else {
            console.error('Error creating playlist:', error.message);
            res.status(500).json({ message: 'Error creating playlist and adding tracks' });
        }
    }
});

export default spotifyRoutes;
