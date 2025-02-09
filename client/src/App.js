import React ,{useState} from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';
import Signup from './Signup';
import Login from './login';
import Movies from './Movies';
import Home from './Home';
import Favorites from './Favorites';
import Playlists from './Playlists';
import './App.css'; // Optional: for styling

function App() {
  const [token, setToken] = useState(null); // State to store the JWT token

  const handleTokenUpdate = (newToken) => {
    setToken(newToken); // Update the token after login
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/login"
          element={<Login onLogin={handleTokenUpdate} />} // Pass handleTokenUpdate to Login
        />
        <Route
          path="/movies"
          element={<Movies token={token} />} // Pass token to Movies
        />
        <Route
          path="/favorites"
          element={<Favorites token={token} />} // Pass token to Favorites
        />
        <Route
          path="/Playlists"
          element={<Playlists token={token} />} // Pass token to Favorites
        />
      </Routes>
    </Router>
  );
}

export default App;
