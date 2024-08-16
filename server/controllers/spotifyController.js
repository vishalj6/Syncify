import axios from 'axios';

const SPOTIFY_API_BASE_URL = 'https://api.spotify.com/v1';

const createSpotifyPlaylist = async (accessToken, userId, playlistName) => {
    try {
        const response = await axios.post(`${SPOTIFY_API_BASE_URL}/users/${userId}/playlists`, {
            name: playlistName,
            description: 'A playlist created from YouTube playlist',
            public: false,
        }, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error creating Spotify playlist:', error.message);
        throw new Error('Error creating Spotify playlist');
    }
};

const getTrackDetails = async (accessToken, trackIds) => {
    try {
        const response = await axios.get(`${SPOTIFY_API_BASE_URL}/tracks`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
            params: {
                ids: trackIds.join(','),
            },
        });
        return response.data.tracks;
    } catch (error) {
        console.error('Spotify API Error:', error.response ? error.response.data : error.message);
        throw new Error('Error fetching track details');
    }
};

const MAX_TRACKS_PER_REQUEST = 50;

const addTracksToSpotifyPlaylist = async (accessToken, playlistId, trackUris) => {
    try {
        const trackBatches = [];
        for (let i = 0; i < trackUris.length; i += MAX_TRACKS_PER_REQUEST) {
            trackBatches.push(trackUris.slice(i, i + MAX_TRACKS_PER_REQUEST));
        }

        const allTrackDetails = [];

        for (const batch of trackBatches) {
            const requestBody = { uris: batch };
            await axios.post(`${SPOTIFY_API_BASE_URL}/playlists/${playlistId}/tracks`, requestBody, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });

            const trackIds = batch.map(uri => uri.split(':')[2]);
            const tracks = await getTrackDetails(accessToken, trackIds);
            allTrackDetails.push(...tracks);
        }

        return allTrackDetails;
    } catch (error) {
        console.error('Spotify API Error:', error.response ? error.response.data : error.message);
        throw new Error('Error adding tracks to Spotify playlist');
    }
};

const cleanTrackName = (trackName) => {
    return trackName.replace(/(\[.*?\]|\(.*?\)|-|\s+by\s+.*$)/g, '')
        .trim()
        .replace(/\s+/g, ' ');
};

const searchSpotifyTrack = async (accessToken, trackName, artistName) => {
    const maxRetries = 5;
    const maxTrackNameLength = 15;

    const cleanAndTruncateTrackName = (name) => {
        const cleanedName = cleanTrackName(name);
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
                    : (Math.pow(2, attempt) * 1000);

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
