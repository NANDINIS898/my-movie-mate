import React, { useState } from 'react';
import axios from 'axios';
import './Signup.css'; 
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate(); 

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous messages
    setError('');
    setSuccess('');

    try {
      const response = await axios.post('https://my-movie-mate-1.onrender.com/signup', {
        username,
        email,
        password,
      });

      const { token, username: responseUsername } = response.data;

      // Save to localStorage
      localStorage.setItem('username', responseUsername);
      localStorage.setItem('token', token);

      // Show success message
      setSuccess('Signup successful! Redirecting...');

      // Redirect to /movies after 1.5 seconds
      setTimeout(() => {
        navigate('/movies');
      }, 1500);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Error signing up';
      setError(errMsg);
    }
  };

  return (
    <div className='card'>
      <h2>Signup</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        
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

        <button type="submit">Sign Up</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
    </div>
  );
};

export default Signup;
