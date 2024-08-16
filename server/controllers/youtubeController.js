import axios from 'axios';
import { searchSpotifyTrack } from './spotifyController.js';

const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/playlistItems';

const getYouTubePlaylist = async (accessToken, playlistId) => {
    let allTrackUris = [];
    let nextPageToken = null;

    try {
        do {
            const response = await axios.get(YOUTUBE_API_URL, {
                params: {
                    part: 'snippet',
                    playlistId: playlistId,
                    key: process.env.YOUTUBE_API_KEY,
                    maxResults: 50,
                    pageToken: nextPageToken,
                },
            });

            const trackUris = await Promise.all(response.data.items.map(async (item) => {
                const trackName = item.snippet.title;
                const artistName = item.snippet.videoOwnerChannelTitle; // Placeholder, refine as needed
                try {
                    const spotifyTrackId = await searchSpotifyTrack(accessToken, trackName, artistName);
                    return `spotify:track:${spotifyTrackId}`;
                } catch (error) {
                    console.warn(`Track not found on Spotify: ${trackName} by ${artistName}`);
                    return null;
                }
            }));

            allTrackUris = [...allTrackUris, ...trackUris.filter(uri => uri !== null)];

            nextPageToken = response.data.nextPageToken;
        } while (nextPageToken);

        return allTrackUris;
    } catch (error) {
        console.error('Error fetching YouTube playlist:', error.message);
        throw new Error('Error fetching YouTube playlist');
    }
};

export default { getYouTubePlaylist };
