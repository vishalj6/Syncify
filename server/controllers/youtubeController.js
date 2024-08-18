import axios from 'axios';
import { searchSpotifyTrack } from './spotifyController.js';

const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/playlistItems';

const determineSearchTerm = (title) => {
    let normalizedTitle = title.toLowerCase();

    // Extract the part after the first ' - ' if it exists
    let trackName = normalizedTitle.split(' - ')[1] || normalizedTitle;

    // Remove extra details and delimiters to get the track name
    trackName = trackName.split(' (')[0]
        .split(' x ')[0]
        .split(' | ')[0]
        .split(' [')[0]
        .split(' ft. ')[0]
        .split(' feat. ')[0]
        .split(' featuring ')[0];

    trackName = trackName.replace(/'/g, '');
    return trackName.trim();
};

const determineArtistName = (title) => {
    let normalizedTitle = title.toLowerCase();

    // Check if the title contains ' - '
    if (normalizedTitle.includes(' - ')) {
        // Extract the artist name (part before ' - ')
        const [artistName] = normalizedTitle.split(' - ', 2);
        return artistName.trim();
    }

    // Return an empty string if the format does not match
    return '';
};

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
                const videoTitle = item.snippet.title;
                const trackName = determineSearchTerm(videoTitle);
                const artistName = determineArtistName(videoTitle);

                try {
                    const spotifyTrackId = await searchSpotifyTrack(accessToken, trackName, artistName);
                    return `spotify:track:${spotifyTrackId}`;
                } catch (error) {
                    if (error.message.includes('Unauthorized')) {
                        // Handle unauthorized error
                        return { error: 'Unauthorized: Please re-authenticate.' };
                    } else {
                        console.warn(`Track not found on Spotify: ${trackName}`);
                        return { error: error?.message };
                    }
                }
            }));

            allTrackUris = [...allTrackUris, ...trackUris.filter(uri => typeof uri === 'string')];
            nextPageToken = response.data.nextPageToken;
        } while (nextPageToken);

        return allTrackUris;
    } catch (error) {
        console.error('Error fetching YouTube playlist:', error.message);
        throw new Error('Error fetching YouTube playlist');
    }
};

export default { getYouTubePlaylist };