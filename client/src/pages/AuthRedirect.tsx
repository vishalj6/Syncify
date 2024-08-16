// src/components/AuthRedirect.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthRedirect: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const spotifyAccessToken = localStorage.getItem('spotifyAccessToken');
    if (spotifyAccessToken) {
      navigate('/');
    }
    handleAccessToken();
  }, []);

  const handleAuthorize = () => {
    const backendUrl = import.meta.env.VITE_BACKENDURI;
    window.location.href = `${backendUrl}/auth/spotify`;
  }

  const handleAccessToken = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');
    if (accessToken) {
      localStorage.setItem('spotifyAccessToken', accessToken);
      navigate('/');
    } else {
      // Handle the error if there's no access token
      console.error('No access token found');
    }
  };


  return (
    <div className="flex items-center justify-center flex-col h-screen bg-gray-900">
      {!localStorage.getItem('spotifyAccessToken') ?
        <button className='bg-green-500 text-white px-3 py-2 rounded-md text-2xl' onClick={handleAuthorize}>Authorize</button>
        : <p className='text-white'>Redirecting to Spotify...</p>
      }
    </div>
  );
};

export default AuthRedirect;
