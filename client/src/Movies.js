import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Movies.css';
import { useNavigate } from 'react-router-dom'; 
import { AiFillHeart } from 'react-icons/ai';

function Movies() {
  const [movies, setMovies] = useState([]);
  const [genre, setGenre] = useState('28'); // Default genre: Action
  const navigate = useNavigate(); // Initialize navigate
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');

  useEffect(() => {
    if (!token) {
      alert('Access denied. Please log in.');
      navigate('/login');
    }
  }, [token, navigate]);

  // Fetch movies whenever the selected genre changes
  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/movies/${genre}`, {
        headers: { Authorization: `Bearer ${token}` }, // Include token
      })
      .then((response) => setMovies(response.data))
      .catch((error) => {
        console.error('Error fetching movies:', error);
        if (error.response && error.response.status === 401) {
          alert('Session expired. Please log in again.');
          navigate('/login');
        }
      });
  }, [genre, token, navigate]);

  const addToFavorites = async (movie) => {
    const { id, title, poster_path, overview } = movie;  // Get the required details from the movie object
    
    try {
      const response = await axios.post(
        `http://localhost:5000/api/favorites`,
        {
          movieId: id,
          title: title,
          poster_path: poster_path,
          overview: overview
        },
        {
          headers: {
            Authorization: `Bearer ${token}` // Pass the token for authentication
          }
        }
      );
  
      alert('Movie added to favorites');
    } catch (error) {
      console.error('Failed to add movie to favorites:', error);
      alert('Failed to add movie to favorites.');
    }
  };

  const goToFavorites = () => {
    navigate('/favorites'); // This will navigate to the Favorites page
  };

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('username');
    localStorage.removeItem('token');

    // Redirect to the home page (or login page)
    navigate('/'); // Change this path to your home/login page
  };

  const goToplaylist=() =>{
    navigate('/Playlists');

  }

  return (
    <div className="Movies">
      <div className="greeting">
        {username ? `Hi, ${username}, welcome` : 'Hi,Welcome!'}
      </div>
      <h1>My Movie Mate</h1>
      <button className="favorites-button" onClick={goToFavorites}>
        <AiFillHeart size={20} style={{ marginRight: '10px' }} /> {/* Heart icon */}
        Favorites
      </button>

      <nav className="navbar">
        <h3>Select Genre!</h3>
        <button onClick={() => setGenre('28')}>Action</button>
        <button onClick={() => setGenre('35')}>Comedy</button>
        <button onClick={() => setGenre('18')}>Drama</button>
        <button onClick={() => setGenre('10749')}>Romance</button>
        <button onClick={() => setGenre('53')}>Thriller</button>

        
        <button className="my-playlist" onClick={goToplaylist}> My Playlist</button>
        <button className="logout-button" onClick={handleLogout}>Logout</button>
      </nav>
      
      <h2>Movie Recommendations</h2>
      {/* Movie list */}
      <div className="movie-list">
        {movies.map((movie) => (
          <div key={movie.id} className="movie-card">
            <h3>{movie.title}</h3>
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
              alt={movie.title} 
              width="200"
            />
            <button
              className="heart-button" 
              onClick={() => addToFavorites(movie)} // Pass full movie object to the function
            >
              ❤️ Add to Favorites
            </button>
            <p>{movie.overview}</p>
          </div>))}
     
      
      </div>
    </div>
  );
}

export default Movies;