import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlaylistContext } from '../context/PlaylistContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaSpinner } from 'react-icons/fa';
import { SiConvertio } from 'react-icons/si';
import axiosInstance from '../axios';

const Home: React.FC = () => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [playlistName, setPlaylistName] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { setPlaylist, setPlaylistLink } = useContext(PlaylistContext);
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = localStorage.getItem('spotifyAccessToken');
    if (!accessToken) {
      navigate('/auth-redirect');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const accessToken = localStorage.getItem('spotifyAccessToken');
    if (!accessToken) {
      setStatus('Please authenticate with Spotify.');
      navigate('/auth-redirect');
      return;
    }

    setLoading(true);

    try {
      // Fetch tracks from YouTube playlist
      const tracksResponse = await axiosInstance.post('/api/youtube/fetch-playlist-tracks', {
        accessToken,
        playlistId: extractPlaylistId(youtubeUrl),
      });
      const tracks = tracksResponse?.data?.trackUris;

      // Create Spotify playlist
      const playlistResponse = await axiosInstance.post('/api/spotify/create-playlist', {
        accessToken,
        playlistName,
        trackUris: tracks,
      });

      setPlaylist(playlistResponse.data.addedPlaylist);
      setPlaylistLink(playlistResponse.data.playlistLink);

      toast.success('Successfully added the playlist to Spotify');
      setTimeout(() => {
        navigate('/results', {
          state: {
            message: 'Playlist created successfully!',
          },
        });
      }, 1000);
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('spotifyAccessToken');
        setStatus('Session expired. Please re-authenticate with Spotify.');
        toast.error('Session expired. Please log in again.');
        setTimeout(() => {
          navigate('/auth-redirect');
        }, 1000);
      } else {
        console.error('Error creating playlist:', error);
        setStatus('Error creating playlist. Please try again.');
        toast.error('Error creating playlist. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const extractPlaylistId = (url: string) => {
    const match = url.match(/list=([^&]+)/);
    return match ? match[1] : '';
  };

  return (
    <div className="relative min-h-screen bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(https://images.pexels.com/photos/518389/pexels-photo-518389.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1)' }}>
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="relative z-10 p-6 flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-8 flex items-center justify-center gap-4">
          <span>YouTube</span>
          <SiConvertio size={32} />
          <span>Spotify</span>
        </h1>
        <form onSubmit={handleSubmit} className="bg-white bg-opacity-10 p-8 rounded-lg shadow-lg backdrop-blur-md w-full max-w-md md:max-w-lg space-y-6">
          <div>
            <label className="block mb-2 text-gray-300 text-lg font-semibold">YouTube Playlist URL:</label>
            <input
              type="text"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              className="border border-gray-400 rounded px-4 py-2 w-full bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              name="youtubePlaylistUrl"
              required
            />
          </div>
          <div>
            <label className="block mb-2 text-gray-300 text-lg font-semibold">Spotify Playlist Name:</label>
            <input
              type="text"
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
              className="border border-gray-400 rounded px-4 py-2 w-full bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              name="spotifyPlaylistName"
              required
            />
          </div>
          <button
            type="submit"
            className={`bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? <FaSpinner className="animate-spin mx-auto" /> : 'Create Playlist'}
          </button>
        </form>
        {status && <p className="mt-4 text-white text-lg">{status}</p>}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </div>
  );
};

export default Home;
