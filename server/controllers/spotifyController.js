import axios from 'axios';

const SPOTIFY_API_BASE_URL = 'https://api.spotify.com/v1';

const cleanTrackName = (trackName) => {
    return trackName
        .replace(/[\[\]\(\)'"-]/g, '')  // Remove brackets, quotes, hyphens, and parentheses
        .replace(/\s+by\s+.*$/, '')    // Remove "by" and anything after it
        .trim()
        .replace(/\s+/g, ' ');         // Collapse multiple spaces into a single space
};

const searchSpotifyTrack = async (accessToken, trackName) => {
    const maxRetries = 5;
    const maxTrackNameLength = 50; // Increased length to accommodate more comprehensive search terms
    const maxWords = 4; // Maximum number of words to use in search

    // Function to clean and truncate track name
    const cleanAndTruncateTrackName = (name, wordCount) => {
        const cleanedName = cleanTrackName(name);
        const words = cleanedName.split(' ').slice(0, wordCount).join(' ');
        return words.length > maxTrackNameLength ? words.substring(0, maxTrackNameLength) : words;
    };

    // Function to filter out unwanted tracks
    const isValidTrack = (track) => {
        const name = track.name.toLowerCase();
        const albumName = track.album.name.toLowerCase();
        return !name.includes('cover') &&
            !name.includes('karaoke') &&
            !name.includes('tribute') &&
            !albumName.includes('cover') &&
            !albumName.includes('karaoke') &&
            !albumName.includes('tribute') &&
            !name.includes('originally performed by') &&
            !albumName.includes('originally performed by') &&
            !name.includes('made popular by') &&
            !albumName.includes('made popular by');
    };

    // Function to search for track on Spotify
    const searchTrack = async (query) => {
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                const response = await axios.get(`${SPOTIFY_API_BASE_URL}/search`, {
                    params: {
                        q: query,
                        type: 'track',
                        limit: 10,
                        market: 'US',
                    },
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                    },
                });

                const tracks = response.data.tracks.items;
                const validTracks = tracks.filter(isValidTrack).sort((a, b) => b.popularity - a.popularity);

                if (validTracks.length > 0) {
                    return validTracks[0].id; // Return the most popular valid track
                } else {
                    throw new Error('No valid matching track found on Spotify');
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

    // Try different lengths of track name
    for (let wordCount = 3; wordCount <= maxWords; wordCount++) {
        const query = `track:${cleanAndTruncateTrackName(trackName, wordCount)}`;
        try {
            const trackId = await searchTrack(query);
            return trackId;
        } catch (error) {
            if (error.message !== 'No valid matching track found on Spotify') {
                throw error; // If error is not 'No valid matching track found', rethrow it
            }
            console.log(`No track found with ${wordCount} words. Trying with more words...`);
        }
    }

    // Fallback search using only 2 words from the track name
    const fallbackQuery = `track:${cleanAndTruncateTrackName(trackName, 2)}`;
    try {
        const trackId = await searchTrack(fallbackQuery);
        return trackId;
    } catch (error) {
        console.error('No track found with 2 words. Returning null.');
        return null; // Return null if no track found with 2 words
    }
};



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

export default { createSpotifyPlaylist, addTracksToSpotifyPlaylist };
export { searchSpotifyTrack };
