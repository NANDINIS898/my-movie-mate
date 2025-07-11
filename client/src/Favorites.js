import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Favorites.css';
import { useNavigate } from 'react-router-dom';

function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate(); 

  const token = localStorage.getItem('token'); // ✅ Fetch token directly here

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchFavorites = async () => {
      try {
        const response = await axios.get(`https://my-movie-mate-1.onrender.com/api/favorites`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFavorites(response.data);
      } catch (error) {
        console.error('Failed to fetch favorites:', error);
        setError('Failed to fetch favorites.');
      }
    };

    fetchFavorites();
  }, [token, navigate]);

  const handleUnfavorite = async (movieId) => {
    try {
      await axios.delete(`https://my-movie-mate-1.onrender.com/api/favorites/${movieId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFavorites(favorites.filter(movie => movie.movie_id !== movieId));
    } catch (error) {
      console.error('Failed to unfavorite movie:', error);
      setError('Failed to unfavorite movie.');
    }
  };

  const gotoRecommendations = () => navigate('/Movies');

  return (
    <div>
      <h2>Your Favorite Movies</h2>
      <button className="recommendations" onClick={gotoRecommendations}>
        Recommendations
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {favorites.length > 0 ? (
        <div className="favorite-list">
          {favorites.map((movie) => (
            <div key={movie.movie_id} className="favorite-card">
              <h3>{movie.title}</h3>
              {movie.poster_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                  className="movie-image"
                />
              ) : (
                <p>No image available</p>
              )}
              <p>{movie.overview}</p>
              <button
                className="unfavorite-btn"
                onClick={() => handleUnfavorite(movie.movie_id)}
              >
                ❤️ Remove
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p>You haven't added any movies to your favorites yet.</p>
      )}
    </div>
  );
}

export default Favorites;
