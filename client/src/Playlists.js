import React, { useState, useEffect } from 'react';
import './playlists.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Playlists = () => {
  const [playlists, setPlaylists] = useState([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistMovies, setNewPlaylistMovies] = useState([{ title: '', poster_path: '' }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('https://my-movie-mate-1.onrender.com/api/playlists', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPlaylists(response.data);
    } catch (error) {
      setError('Error fetching playlists.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const downloadPlaylist = (playlist) => {
    const moviesArray = Array.isArray(playlist.movies)
      ? playlist.movies
      : JSON.parse(playlist.movies || '[]');

    const fileContent = `Playlist Name: ${playlist.name}\nMovies:\n${moviesArray
      .map((movie, idx) => `${idx + 1}. ${movie.title}`)
      .join('\n')}`;

    const blob = new Blob([fileContent], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${playlist.name}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!newPlaylistName || newPlaylistMovies.length === 0) {
      setError('Please fill in all fields.');
      return;
    }

    const isValid = newPlaylistMovies.every(
      (movie) => movie.title.trim() !== '' && movie.poster_path.trim() !== ''
    );

    if (!isValid) {
      setError('Each movie must have a title and a poster path.');
      return;
    }

    const playlistData = {
      name: newPlaylistName,
      movies: newPlaylistMovies,
    };

    try {
      const response = await axios.post('https://my-movie-mate-1.onrender.com/api/playlists', playlistData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setPlaylists((prevPlaylists) => [...prevPlaylists, response.data]);
      setNewPlaylistName('');
      setNewPlaylistMovies([{ title: '', poster_path: '' }]);
      setShowCreateForm(false);
    } catch (error) {
      setError('Error creating playlist.');
      console.error(error);
    }
  };

  const handleDeletePlaylist = async (id) => {
    try {
      await axios.delete(`https://my-movie-mate-1.onrender.com/api/playlists/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPlaylists(playlists.filter((playlist) => playlist.id !== id));
    } catch (error) {
      setError('Error deleting playlist.');
      console.error(error);
    }
  };

  return (
    <div className="playlists-container">
      <button className="back-button" onClick={() => navigate('/movies')}>
        <i className="fa fa-arrow-left"></i>
      </button>

      <h1>Curate your Movie Mood</h1>
      <h2>Your Movie Playlists</h2>

      {loading && <p>Loading playlists...</p>}
      {error && <p className="error">{error}</p>}

      <div className="playlist-list">
        {playlists.length === 0 ? (
          <p>No playlists found.</p>
        ) : (
          playlists.map((playlist) => {
            const moviesArray = Array.isArray(playlist.movies)
              ? playlist.movies
              : JSON.parse(playlist.movies || '[]');

            return (
              <div key={playlist.id} className="playlist-card">
                <h3>{playlist.name}</h3>
                <ul>
                  {moviesArray.map((movie, index) => (
                    <li key={index}>
                      <strong>{movie.title}</strong>
                      {movie.poster_path && (
                        <img
                          src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                          alt={movie.title}
                          style={{ width: '100px', marginLeft: '10px' }}
                        />
                      )}
                    </li>
                  ))}
                </ul>
                <div className="button-group">
                  <button
                    className="delete-playlist-btn"
                    onClick={() => handleDeletePlaylist(playlist.id)}
                  >
                    Delete
                  </button>
                  <button
                    className="download-playlist-btn"
                    onClick={() => downloadPlaylist({ ...playlist, movies: moviesArray })}
                  >
                    <i className="fas fa-download"></i> Download
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="create-playlist">
        <button
          className="create-playlist-btn"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          +
        </button>
        <span className="create-playlist-text">Create New Playlist</span>

        {showCreateForm && (
          <form onSubmit={handleCreatePlaylist} className="create-playlist-form">
            <input
              type="text"
              placeholder="Playlist Name"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
            />
            {newPlaylistMovies.map((movie, index) => (
              <div key={index} className="movie-input-group">
                <input
                  type="text"
                  placeholder="Movie Title"
                  value={movie.title}
                  onChange={(e) => {
                    const updated = [...newPlaylistMovies];
                    updated[index].title = e.target.value;
                    setNewPlaylistMovies(updated);
                  }}
                />
                <input
                  type="text"
                  placeholder="Poster Path"
                  value={movie.poster_path}
                  onChange={(e) => {
                    const updated = [...newPlaylistMovies];
                    updated[index].poster_path = e.target.value;
                    setNewPlaylistMovies(updated);
                  }}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setNewPlaylistMovies([...newPlaylistMovies, { title: '', poster_path: '' }])
              }
            >
              Add Another Movie
            </button>
            <button type="submit">Create Playlist</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Playlists;


