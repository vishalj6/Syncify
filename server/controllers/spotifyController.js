import axios from 'axios';

const SPOTIFY_API_BASE_URL = 'https://api.spotify.com/v1';
const MAX_TRACKS_PER_REQUEST = 50;
const MAX_RETRIES = 5;
const MAX_TRACK_NAME_LENGTH = 50;
const MAX_WORDS = 4;

const cleanTrackName = (trackName) => {
    return trackName
        .replace(/[\[\]\(\)'"-]/g, '')
        .replace(/\s+by\s+.*$/, '')
        .trim()
        .replace(/\s+/g, ' ');
};

const searchSpotifyTrack = async (accessToken, trackName, artistName) => {
    const cleanAndTruncateTrackName = (name, wordCount) => {
        const cleanedName = cleanTrackName(name);
        const words = cleanedName.split(' ').slice(0, wordCount).join(' ');
        return words.length > MAX_TRACK_NAME_LENGTH ? words.substring(0, MAX_TRACK_NAME_LENGTH) : words;
    };

    const isValidTrack = (track) => {
        const name = track.name.toLowerCase();
        const albumName = track.album.name.toLowerCase();
        return !/(cover|karaoke|tribute|originally performed by|made popular by)/.test(name) &&
            !/(cover|karaoke|tribute|originally performed by|made popular by)/.test(albumName);
    };

    const searchTrack = async (query) => {
        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
            try {
                const response = await axios.get(`${SPOTIFY_API_BASE_URL}/search`, {
                    params: { q: query, type: 'track', limit: 10, market: 'US' },
                    headers: { 'Authorization': `Bearer ${accessToken}` },
                });

                const tracks = response.data.tracks.items;
                const validTracks = tracks.filter(isValidTrack).sort((a, b) => b.popularity - a.popularity);

                if (validTracks.length > 0) {
                    return validTracks[0].id;
                }

                throw new Error('No valid matching track found on Spotify');
            } catch (error) {
                if (error.response) {
                    if (error.response.status === 429) {
                        const retryAfter = parseInt(error.response.headers['retry-after'], 10) * 1000 || Math.pow(2, attempt) * 1000;
                        console.warn(`Rate limit hit, retrying after ${retryAfter}ms... (attempt ${attempt + 1}/${MAX_RETRIES})`);
                        await new Promise(resolve => setTimeout(resolve, retryAfter));
                    } else if (error.response.status === 401) {
                        throw new Error('Unauthorized: Invalid or expired token');
                    }
                }
                console.error('Error searching for track on Spotify:', error.message);
                if (attempt === MAX_RETRIES - 1) throw new Error('Max retries exceeded for searching track on Spotify');
            }
        }
    };

    for (let wordCount = 3; wordCount <= MAX_WORDS; wordCount++) {
        const query = `track:${cleanAndTruncateTrackName(trackName, wordCount)}${artistName ? ` artist:${artistName}` : ''}`;
        try {
            const trackId = await searchTrack(query);
            return trackId;
        } catch (error) {
            if (error.message !== 'No valid matching track found on Spotify') throw error;
            console.log(`No track found with ${wordCount} words. Trying with fewer words...`);
        }
    }

    const fallbackQuery = `track:${cleanAndTruncateTrackName(trackName, 2)}${artistName ? ` artist:${artistName}` : ''}`;
    try {
        const trackId = await searchTrack(fallbackQuery);
        return trackId;
    } catch {
        console.error('No track found with 2 words. Returning null.');
        return null;
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
            headers: { 'Authorization': `Bearer ${accessToken}` },
            params: { ids: trackIds.join(',') },
        });
        return response.data.tracks;
    } catch (error) {
        if (error.response && error.response.status === 429) {
            const retryAfter = parseInt(error.response.headers['retry-after'], 10) * 1000;
            console.warn(`Rate limit hit while fetching track details, retrying after ${retryAfter}ms...`);
            await new Promise(resolve => setTimeout(resolve, retryAfter));
            return getTrackDetails(accessToken, trackIds); // Retry after delay
        }
        console.error('Error fetching track details:', error.message);
        throw new Error('Error fetching track details');
    }
};

const addTracksToSpotifyPlaylist = async (accessToken, playlistId, trackUris) => {
    try {
        const trackBatches = [];
        for (let i = 0; i < trackUris.length; i += MAX_TRACKS_PER_REQUEST) {
            trackBatches.push(trackUris.slice(i, i + MAX_TRACKS_PER_REQUEST));
        }

        const allTrackDetails = [];

        for (const batch of trackBatches) {
            await axios.post(`${SPOTIFY_API_BASE_URL}/playlists/${playlistId}/tracks`, { uris: batch }, {
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
        console.error('Error adding tracks to Spotify playlist:', error.message);
        throw new Error('Error adding tracks to Spotify playlist');
    }
};

export {
    searchSpotifyTrack,
    createSpotifyPlaylist,
    addTracksToSpotifyPlaylist,
};
