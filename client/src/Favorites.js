import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Favorites.css';
import { useNavigate } from 'react-router-dom';

function Favorites({ token }) {
  const [favorites, setFavorites] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate(); 


  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await axios.get(`https://movie-mate-production.up.railway.app/api/favorites`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log(response.data);  
        setFavorites(response.data);
      } catch (error) {
        console.error('Failed to fetch favorites:', error);
        alert('Failed to fetch favorites.');
      }
    };
    fetchFavorites();
  }, [token]);

  const handleUnfavorite = async (movieId) => {
    console.log('Attempting to unfavorite movie with ID:', movieId);
    const token = localStorage.getItem('token'); // Retrieve the token

    if (!token) {
      setError('No token found. Please log in.');
      return;
    }

    try {
      await axios.delete(`https://movie-mate-production.up.railway.app/api/favorites/${movieId}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Send token in Authorization header
        },
      });

      // After successful unfavorite, remove the movie from state
      setFavorites(favorites.filter(favorite => favorite.movie_id !== movieId));
    } catch (error) {
      console.error('Failed to unfavorite movie:', error);
      setError('Failed to unfavorite movie. Please try again.');
    }
  };

  const gotoRecommendations =() => {
    navigate('/Movies');
  }

  return (
    <div>
      <h2>Your Favorite Movies</h2>
      <button className="recommendations" onClick={gotoRecommendations}>
        Recommendations
      </button>
      {favorites.length > 0 ? (
        <div className="favorite-list">
          {favorites.map((movie, index) => (
            <div key={index} className="favorite-card">
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
                <i className="fas fa-heart-broken" ></i>
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