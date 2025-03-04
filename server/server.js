require('dotenv').config(); // Ensure environment variables are loaded
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const mysql= require('mysql2');
const app = express();
const port = process.env.PORT || 5000;
const SECRET_KEY =process.env.SECRET_KEY || '343477';

app.use(cors());


const TMDB_API_KEY = process.env.TMDB_API_KEY ||'482956122a3f6909e6d22e014cefece3';
const BASE_URL ='https://api.themoviedb.org/3';

// Database connection
const urldb=`mysql://root:MAGQPtlqsrwKRkezkweagRtaGomJRtjp@mysql.railway.internal:3306/railway`

const db = mysql.createConnection({urldb});
db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to MySQL database.');
});

// Middleware for authentication (Define it or remove it)
function authenticateToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]; // Extract token
  if (!token) return res.status(401).json({ message: 'Access Denied' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid Token' });

    req.user = user;
    next();
  });
}



// Route to get movie recommendations with genres
app.get('/api/movies/:genreId', async (req, res) => {
  const { genreId } = req.params;
  try {
    const response = await axios.get(`${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genreId}`);
    res.json(response.data.results);
  } catch (error) {
    res.status(500).send('Error fetching data from TMDB');
  }
});

// Get genres
app.get('/api/genres', async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/genre/movie/list?api_key=${TMDB_API_KEY}`);
    res.json(response.data.genres);
  } catch (error) {
    res.status(500).send('Error fetching genres.');
  }
});

// Add to favorites
app.post('/api/favorites', authenticateToken, async (req, res) => {
  const userId = req.user.userId; // Extracted from JWT
  const { movieId, title, poster_path, overview } = req.body;

  console.log('User ID:', userId);
  console.log('Movie ID:', movieId);

  if (!movieId || !title || !poster_path || !overview) {
    return res.status(400).json({ message: 'All fields (movieId, title, poster_path, overview) are required.' });
  }
  try {
    // Fetch movie details from TMDB API
    const response = await axios.get(
      `https://api.themoviedb.org/3/movie/${movieId}?api_key=482956122a3f6909e6d22e014cefece3`
    );
    const { title } = response.data;

    // Insert into the database
    const query = 'INSERT INTO favorites (user_id, movie_id, title, poster_path, overview) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [userId, movieId, title, poster_path, overview], (err) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Failed to add favorite', error: err.message });
      }
      res.status(200).json({ message: 'Movie added to favorites successfully' });
    });
  } catch (error) {
    console.error('Error fetching movie details:', error);
    res.status(500).json({ message: 'Failed to fetch movie details', error: error.message });
  }
});


// Get user's favorite movies
app.get('/api/favorites', authenticateToken, (req, res) => {
  const userId = req.user.userId; // Extract userId from the token

  const query = 'SELECT movie_id, title, poster_path, overview FROM favorites WHERE user_id = ?';

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching favorites:', err.message);
      return res.status(500).send('Error fetching favorites.');
    }
    res.status(200).json(results);
  });
});

// Unfavorite a movie (remove it from favorites)
app.delete('/api/favorites/:movieId', authenticateToken, (req, res) => {
  const userId = req.user.userId; // Extract userId from JWT token
  const { movieId } = req.params;

  console.log(movieId);

    // Ensure movieId is a number
  if (isNaN(movieId)) {
    return res.status(400).json({ message: 'Invalid movie ID' });
  }

  const query = 'DELETE FROM favorites WHERE user_id = ? AND movie_id = ?';

  db.query(query, [userId, movieId], (err, result) => {
    if (err) {
      console.error('Error unfavoriting movie:', err.message);
      return res.status(500).send('Error unfavoriting movie.');
    }

    if (result.affectedRows === 0) {
      return res.status(404).send('Movie not found in favorites.');
    }

    res.status(200).json({ message: 'Movie unfavorited successfully.' });
  });
});


// Get all playlists for a user (protected)
app.get('/api/playlists', authenticateToken, (req, res) => {
  const userId = req.user.userId;  // Correcting userId extraction from JWT

  db.query('SELECT * FROM playlists WHERE user_id = ?', [userId], (err, results) => {
    if (err) {
      console.error('Error fetching playlists:', err);
      return res.status(500).json({ message: 'Error fetching playlists from the database.' });
    }
    res.json(results);
  });
});

// Create a new playlist for a user (protected)
app.post('/api/playlists', authenticateToken, (req, res) => {
  const { name, movies } = req.body;
  const userId = req.user.userId;  // Correcting userId extraction from JWT

  if (!name || !movies) {
    return res.status(400).json({ message: 'Name and movies are required to create a playlist.' });
  }

  // Ensure movies is stored as a JSON string if you're using JSON format
  const moviesData = JSON.stringify(movies);  // Convert the movies array to a JSON string

  const query = 'INSERT INTO playlists (name, user_id, movies) VALUES (?, ?, ?)';
  
  db.query(query, [name, userId, moviesData], (err, result) => {
    if (err) {
      console.error('Error creating playlist:', err);
      return res.status(500).json({ message: 'Error creating playlist in the database.' });
    }
    
    res.json({
      id: result.insertId,
      name,
      user_id: userId,
      movies: moviesData,  // You might return the movies as a stringified array or parsed object
      created_at: new Date().toISOString(),
    });
  });
});

// Delete a playlist (protected)
app.delete('/api/playlists/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;  // Correcting userId extraction from JWT

  db.query('DELETE FROM playlists WHERE id = ? AND user_id = ?', [id, userId], (err, result) => {
    if (err) {
      console.error('Error deleting playlist:', err);
      return res.status(500).json({ message: 'Error deleting playlist from the database.' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Playlist not found or you do not have permission to delete this playlist.' });
    }
    
    res.json({ message: 'Playlist deleted successfully.' });
  });
});



app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});