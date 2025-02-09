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

    // Clear any previous error or success message
    setError('');
    setSuccess('');

    // Send POST request to the backend for signup
    try {
      const response = await axios.post('http://localhost:5000/signup', {
        username,
        email,
        password,
      });

      const { token, username: responseUsername } = response.data;

      // Store username and token in localStorage
      localStorage.setItem('username', responseUsername); // Store username
      localStorage.setItem('token', token); // Store token

      setSuccess(response.data); 
      navigate('/movies');// Show success message
    } catch (err) {
      setError(err.response ? err.response.data : 'Error signing up'); // Show error message
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
