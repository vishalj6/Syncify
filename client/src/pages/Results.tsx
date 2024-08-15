import React, { useContext, useEffect, useState } from 'react';
import { PlaylistContext } from '../context/PlaylistContext';
import { useNavigate } from 'react-router-dom';

interface ISingleSong {
  uri: string;
  album: {
    images: { url: string }[];
    name: string;
    artists: {
      name: string;
    }[];
  };
}

const Results: React.FC = () => {
  const { playlist, playlistLink } = useContext(PlaylistContext);
  const navigate = useNavigate();
  const handleBackClick = () => {
    navigate('/');
  };

  return (
    <div
      style={{ backgroundImage: "url(https://images.pexels.com/photos/7304689/pexels-photo-7304689.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1)" }}
      className="min-h-screen bg-fixed bg-blend-overlay bg-[#b8bcbcb8] p-6 flex flex-col items-center relative bg-cover"
    >
      <h1 className="text-4xl font-bold text-white mb-8">Playlist Results</h1>
      {playlist.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {playlist.map((singleSong: ISingleSong, index: number) => (
            <div key={index} className="bg-[#111111cf] rounded-lg overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-300 border-1 border-gray-500">
              <img
                src={singleSong.album.images[0]?.url || 'https://via.placeholder.com/300'}
                alt={singleSong.album.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <a
                  href={`https://open.spotify.com/track/${singleSong.uri.split(':')[2]}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xl font-semibold text-white hover:text-blue-400 transition-colors duration-300"
                >
                  {singleSong.album.name}
                </a>
                <p className="text-gray-300 mt-1">{singleSong.album.artists.map(artist => artist.name).join(', ')}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-white text-lg">No tracks found.</p>
      )}
      {playlistLink && (
        <a
          href={playlistLink}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-4 right-4 bg-gradient-to-r from-green-600 to-teal-700 text-white px-8 py-4 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-transform duration-300 ease-in-out"
        >
          <span className="text-lg font-semibold">View Playlist</span>
        </a>


      )}
      <button
        onClick={handleBackClick}
        className="fixed bottom-4 right-1/2 translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300"
      >
        Back
      </button>
    </div>
  );
};

export default Results;
