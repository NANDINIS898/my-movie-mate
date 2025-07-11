import React, { useState } from 'react';
import axios from 'axios';
import './login.css'; 
import { useNavigate } from 'react-router-dom';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault(); // Prevent form from reloading the page
    try {
      const response = await axios.post('https://my-movie-mate-1.onrender.com/login', {
        email,
        password,
      });

      const { token, username: responseUsername } = response.data;

      // Store username and token in localStorage
      
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('username', responseUsername);
        onLogin(token); // Pass token to App.js or parent component
        navigate('/movies'); // Redirect to Movies tab
      } else {
        setError('Invalid credentials');
      }
    } catch (error) {
      setError('Login failed. Please try again.');
    }
  };
  
  return (
    <div className='card'>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default Login;
