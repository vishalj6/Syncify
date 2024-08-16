import axios from 'axios';

const SPOTIFY_API_BASE_URL = 'https://api.spotify.com/v1';

const createSpotifyPlaylist = async (accessToken, userId, playlistName) => {
    try {
        const response = await axios.post(`${SPOTIFY_API_BASE_URL}/users/${userId}/playlists`,
            {
                name: playlistName,
                description: 'A playlist created from YouTube playlist',
                public: false,
            },
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });
        return response.data;
    } catch (error) {
        throw new Error('Error creating Spotify playlist');
    }
};

// Function to get track details from Spotify
const getTrackDetails = async (accessToken, trackIds) => {
    try {
        const response = await axios.get(
            `${SPOTIFY_API_BASE_URL}/tracks`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
                params: {
                    ids: trackIds.join(','), // Join track IDs with commas
                },
            }
        );
        return response.data.tracks; // Returns array of track details
    } catch (error) {
        // Log detailed error response from Spotify
        if (error.response) {
            console.error('Spotify API Error:', error.response.data);
        } else {
            console.error('Unexpected Error:', error.message);
        }
        throw new Error('Error fetching track details');
    }
};

const MAX_TRACKS_PER_REQUEST = 50; // Spotify's limit for adding tracks in a single request

const addTracksToSpotifyPlaylist = async (accessToken, playlistId, trackUris) => {
    try {
        // Add tracks to playlist in batches
        const trackBatches = [];
        for (let i = 0; i < trackUris.length; i += MAX_TRACKS_PER_REQUEST) {
            trackBatches.push(trackUris.slice(i, i + MAX_TRACKS_PER_REQUEST));
        }

        // Array to collect track details
        const allTrackDetails = [];

        for (const batch of trackBatches) {
            const requestBody = { uris: batch };
            await axios.post(`${SPOTIFY_API_BASE_URL}/playlists/${playlistId}/tracks`, requestBody, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });

            // Extract track IDs from URIs
            const trackIds = batch.map(uri => uri.split(':')[2]);

            // Fetch track details
            const tracks = await getTrackDetails(accessToken, trackIds);

            // Add the fetched track details to the array
            allTrackDetails.push(...tracks);

            // console.log('Tracks added successfully:', tracks);
        }

        return allTrackDetails; // Return all track details
    } catch (error) {
        // Log detailed error response from Spotify
        if (error.response) {
            console.error('Spotify API Error:', error.response.data);
        } else {
            console.error('Unexpected Error:', error.message);
        }
        throw new Error('Error adding tracks to Spotify playlist');
    }
};


const cleanTrackName = (trackName) => {
    // Remove any text in square brackets, parentheses, or similar
    return trackName.replace(/(\[.*?\]|\(.*?\)|-|\s+by\s+.*$)/g, '') // Remove text in brackets, parentheses, hyphens, and 'by' with remaining text
        .trim()
        .replace(/\s+/g, ' ');
};

const searchSpotifyTrack = async (accessToken, trackName, artistName) => {
    const maxRetries = 5; // Maximum number of retries
    const maxTrackNameLength = 15; // Maximum length for the track name

    // Function to clean and truncate track name
    const cleanAndTruncateTrackName = (name) => {
        const cleanedName = cleanTrackName(name); // Your existing cleaning function
        return cleanedName.length > maxTrackNameLength ? cleanedName.substring(0, maxTrackNameLength) : cleanedName;
    };

    const cleanedTrackName = cleanAndTruncateTrackName(trackName);
    const query = `track:${cleanedTrackName}`;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const response = await axios.get(`${SPOTIFY_API_BASE_URL}/search`, {
                params: {
                    q: query,
                    type: 'track',
                    limit: 1,
                },
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (response.data.tracks.items.length > 0) {
                return response.data.tracks.items[0].id;
            } else {
                throw new Error('No matching track found on Spotify');
            }
        } catch (error) {
            if (error.response && error.response.status === 429) {
                const retryAfter = error.response.headers['retry-after']
                    ? parseInt(error.response.headers['retry-after'], 10) * 1000
                    : (Math.pow(2, attempt) * 1000); // Use retry-after header if available, else exponential backoff

                console.warn(`Rate limit hit, retrying after ${retryAfter}ms... (attempt ${attempt + 1}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, retryAfter));
            } else {
                console.error('Error searching for track on Spotify:', error.message);
                throw new Error('Error searching for track on Spotify');
            }
        }
    }

    throw new Error('Max retries exceeded for searching track on Spotify');
};

export default { createSpotifyPlaylist, addTracksToSpotifyPlaylist };
export { searchSpotifyTrack };
