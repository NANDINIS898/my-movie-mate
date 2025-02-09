import React, {useState} from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import { useNavigate } from 'react-router-dom'; 

function Home() {
  const [movieName, setMovieName] = useState(''); // State to store the movie name
  const [message, setMessage] = useState(''); 
  const navigate = useNavigate(); // Initialize useNavigate
  
  const handleInputChange = (event) => {
    setMovieName(event.target.value);
  };

  const handleSubmit = () => {
    console.log("Submit clicked!");
    if (movieName.trim() !== '') {
      setMessage('You have a Great taste!');
    } else {
      setMessage('Please enter a movie name.');
    }
  };

  const goToSignup = () => {
    navigate('/signup'); // Navigate to the Signup page
  };

  const goToLogin = () => {
    navigate('/login'); // Navigate to the Login page
  };

    return (
      <div className="home">
        <nav className="navbar1">
          <ul>
            <li>
              <Link to="/" className="nav-link">Home</Link>
            </li>
            <li>
              <Link to="/signup" className="nav-link">Signup</Link>
              </li>
              <li>
                <Link to="/login" className="nav-link">Login</Link>
                </li>
          </ul>
        </nav>
        <h1>Welcome to My Movie Mate</h1>
        <p>Discover the best movies and track your favorites!</p>
        <div className="falling-icons"> 
            <i className="fas fa-film movie-icon"></i>
            <i className="fas fa-theater-masks movie-icon"></i>
            <i className="fas fa-ticket-alt movie-icon"></i>
            <i className="fas fa-tv movie-icon"></i>


        </div>
        {/* Type Bar Section */}
        <div className="type-bar-container">
          <input
            type="text"
            placeholder="What kind of movies do you like to watch?"
            className="type-bar"
            value={movieName}
            onChange={handleInputChange}
          />
          <button className="submit-button" onClick={handleSubmit}>
            Submit
          </button>
        </div>
        {message &&<p className="message">{message}</p>}
    
      </div>
    );
  }
  export default Home;
  