import axios from 'axios';
import { searchSpotifyTrack } from './spotifyController.js';

const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/playlistItems';

const getYouTubePlaylist = async (accessToken, playlistId) => {
    let allTrackUris = [];
    let nextPageToken = null; // Start with no page token

    try {
        do {
            const response = await axios.get(YOUTUBE_API_URL, {
                params: {
                    part: 'snippet',
                    playlistId: playlistId,
                    key: process.env.YOUTUBE_API_KEY,
                    maxResults: 50, // Fetch 50 items per request, maximum allowed by YouTube API
                    pageToken: nextPageToken, // Set the page token for pagination
                },
            });

            // Process each item in the playlist
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

            // Append the URIs of the tracks found to the allTrackUris array
            allTrackUris = [...allTrackUris, ...trackUris.filter(uri => uri !== null)];

            // Update nextPageToken for the next request, if it exists
            nextPageToken = response.data.nextPageToken;
        } while (nextPageToken); // Continue fetching until there is no nextPageToken

        return allTrackUris;
    } catch (error) {
        console.error('Error fetching YouTube playlist:', error.message);
        throw new Error('Error fetching YouTube playlist');
    }
};



export default { getYouTubePlaylist };