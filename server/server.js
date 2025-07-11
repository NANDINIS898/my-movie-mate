require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg'); // PostgreSQL client
const app = express();
const port = process.env.PORT || 5000;
const SECRET_KEY = process.env.SECRET_KEY || '343477';

app.use(cors());
app.use(express.json());

const TMDB_API_KEY = process.env.TMDB_API_KEY || '482956122a3f6909e6d22e014cefece3';
const BASE_URL = 'https://api.themoviedb.org/3';

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Authentication middleware
function authenticateToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access Denied' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid Token' });
    req.user = user;
    next();
  });
}
const bcrypt = require('bcrypt');

// Signup route
app.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;
  console.log('✅ Signup endpoint hit');
  console.log('Request body:', req.body);


  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: 'User already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username',
      [username, email, hashedPassword]
    );

    const user = result.rows[0];
    const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '7d' });

    res.status(201).json({ token, username: user.username });
  } catch (err) {
    console.error('Signup error:', ["POST http://localhost:5000/signup 500 (Internal Server Error"
]);
    res.status(500).json({ message: 'Internal server error during signup' });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('👉 Login attempt:', email);

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      console.log('❌ User not found');
      return res.status(401).json({ message: 'User not found.' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log('❌ Incorrect password');
      return res.status(401).json({ message: 'Incorrect password.' });
    }

    const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '7d' });

    res.status(200).json({ token, username: user.username });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal server error during login' });
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

// Get movies by genre
app.get('/api/movies/:genreId', async (req, res) => {
  const { genreId } = req.params;
  console.log(`📽️ Request received for genre ID: ${genreId}`);

  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genreId}`
    );

    res.json(response.data.results);
  } catch (error) {
    console.error('❌ TMDB fetch error:', error.response?.data || error.message);
    res.status(500).send('Error fetching data from TMDB');
  }
});

// Add to favorites
app.post('/api/favorites', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { movieId, title, poster_path, overview } = req.body;

  if (!movieId || !title || !poster_path || !overview) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    await pool.query(
      'INSERT INTO favorites (user_id, movie_id, title, poster_path, overview) VALUES ($1, $2, $3, $4, $5)',
      [userId, movieId, title, poster_path, overview]
    );
    res.status(200).json({ message: 'Movie added to favorites successfully' });
  } catch (err) {
    console.error('DB Error:', err);
    res.status(500).json({ message: 'Failed to add favorite', error: err.message });
  }
});

// Get favorites
app.get('/api/favorites', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  try {
    const result = await pool.query(
      'SELECT movie_id, title, poster_path, overview FROM favorites WHERE user_id = $1',
      [userId]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).send('Error fetching favorites.');
  }
});

// Delete favorite
app.delete('/api/favorites/:movieId', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { movieId } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM favorites WHERE user_id = $1 AND movie_id = $2',
      [userId, movieId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Movie not found in favorites.' });
    }

    res.json({ message: 'Movie unfavorited successfully.' });
  } catch (err) {
    res.status(500).send('Error unfavoriting movie.');
  }
});

// Get playlists
app.get('/api/playlists', authenticateToken, async (req, res) => {
  const userId = req.user.userId;

  try {
    const result = await pool.query(
      'SELECT * FROM playlists WHERE user_id = $1',
      [userId]
    );

    // Parse the movies JSON string back to array
    const playlists = result.rows.map((playlist) => {
      return {
        ...playlist,
        movies: typeof playlist.movies === 'string'
          ? JSON.parse(playlist.movies)
          : playlist.movies,
      };
    });

    res.json(playlists);
  } catch (err) {
    console.error('❌ Error fetching playlists:', err);
    res.status(500).json({ message: 'Error fetching playlists.' });
  }
});

// Create playlist
app.post('/api/playlists', authenticateToken, async (req, res) => {
  const { name, movies } = req.body;
  const userId = req.user.userId;

  if (!name || !movies || !Array.isArray(movies)) {
    return res.status(400).json({ message: 'Name and movies (as array) are required.' });
  }

  // Ensure each movie is an object with title and poster_path
  const validMovies = movies.map((movie) => ({
    title: movie.title,
    poster_path: movie.poster_path || '',
  }));

  try {
    const result = await pool.query(
      'INSERT INTO playlists (name, user_id, movies) VALUES ($1, $2, $3) RETURNING *',
      [name, userId, JSON.stringify(validMovies)]
    );

    const createdPlaylist = {
      ...result.rows[0],
      movies: validMovies,
    };

    res.json(createdPlaylist);
  } catch (err) {
    console.error('❌ Error creating playlist:', err);
    res.status(500).json({ message: 'Error creating playlist.' });
  }
});

// Delete playlist
app.delete('/api/playlists/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    const result = await pool.query(
      'DELETE FROM playlists WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Playlist not found or no permission.' });
    }

    res.json({ message: 'Playlist deleted successfully.' });
  } catch (err) {
    console.error('❌ Error deleting playlist:', err);
    res.status(500).json({ message: 'Error deleting playlist.' });
  }
});


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
