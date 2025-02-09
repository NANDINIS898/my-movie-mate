import React, { useState, useEffect } from 'react';
import './playlists.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 

const Playlists = () => {
    const [playlists, setPlaylists] = useState([]);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [newPlaylistMovies, setNewPlaylistMovies] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);

    const token = localStorage.getItem('token'); // Get the stored JWT token
    const navigate = useNavigate(); 

    // Fetch playlists when the component mounts
    useEffect(() => {
        fetchPlaylists();
    }, []);

    // Fetch playlists from the backend
    const fetchPlaylists = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get('http://localhost:5000/api/playlists', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setPlaylists(response.data);
        } catch (error) {
            setError('Error fetching playlists.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

     // Download a specific playlist as a text file
     const downloadPlaylist = (playlist) => {
        // Ensure movies are treated as an array
        const moviesArray = Array.isArray(playlist.movies)
            ? playlist.movies
            : JSON.parse(playlist.movies || '[]');

        // Create content for the text file
        const fileContent = `Playlist Name: ${playlist.name}\nMovies:\n${moviesArray
            .map((movie, idx) => `${idx + 1}. ${movie}`)
            .join('\n')}`;

        // Create a Blob
        const blob = new Blob([fileContent], { type: 'text/plain' });

        // Create a download link
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${playlist.name}.txt`; // File name based on playlist name

        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Handle creating a new playlist
    const handleCreatePlaylist = async (e) => {
        e.preventDefault();
        if (!newPlaylistName || !newPlaylistMovies) {
            setError('Please fill in all fields.');
            return;
        }

        // Parse the movies into an array (split by comma and trim spaces)
        const moviesArray = newPlaylistMovies.split(',').map((movie) => movie.trim());

        const playlistData = {
            name: newPlaylistName,
            movies: moviesArray,  // Send movies as an array
        };

        try {
            const response = await axios.post('http://localhost:5000/api/playlists', playlistData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            // Add the new playlist to the state
            setPlaylists((prevPlaylists) => [...prevPlaylists, response.data]);
            setNewPlaylistName('');
            setNewPlaylistMovies('');
            setShowCreateForm(false); // Hide form after creating playlist
        } catch (error) {
            setError('Error creating playlist.');
            console.error(error);
        }
    };

    // Handle deleting a playlist
    const handleDeletePlaylist = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/playlists/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            // Remove the deleted playlist from the state
            setPlaylists(playlists.filter((playlist) => playlist.id !== id));
        } catch (error) {
            setError('Error deleting playlist.');
            console.error(error);
        }
    };

    return (
        <div className="playlists-container">
            <button className="back-button" onClick={() => navigate('/movies')}>
                <i className="fa fa-arrow-left"></i>
            </button>

            <h1>Curate your Movie Mood</h1>
            <h2>Your Movie Playlists</h2>
    
            {loading && <p>Loading playlists...</p>}
            {error && <p className="error">{error}</p>}
    
            <div className="playlist-list">
                {playlists.length === 0 ? (
                    <p>No playlists found.</p>
                ) : (
                    playlists.map((playlist) => {
                        // Handle movies to be an array
                        const moviesArray = Array.isArray(playlist.movies)
                            ? playlist.movies
                            : JSON.parse(playlist.movies || "[]"); // If it's a string, parse it
    
                        return (
                            <div key={playlist.id} className="playlist-card">
                                <h3>{playlist.name}</h3>
                                <ul>
                                    {moviesArray.map((movie, index) => (
                                        <li key={index}>{movie}</li> // Display each movie as a bullet point
                                    ))}
                                </ul>
                                <div className="button-group">
                                    <button
                                        className="delete-playlist-btn"
                                        onClick={() => handleDeletePlaylist(playlist.id)}
                                    >
                                        Delete
                                    </button>
                                    <button
                                        className="download-playlist-btn"
                                        onClick={() => downloadPlaylist({ ...playlist, movies: moviesArray })}
                                    >
                                        <i className="fas fa-download"></i> Download
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
    
            <div className="create-playlist">
                <button
                    className="create-playlist-btn"
                    onClick={() => setShowCreateForm(!showCreateForm)}
                >
                    +
                </button>
                <span className="create-playlist-text">Create New Playlist</span>
    
                {showCreateForm && (
                    <form onSubmit={handleCreatePlaylist} className="create-playlist-form">
                        <input
                            type="text"
                            placeholder="Playlist Name"
                            value={newPlaylistName}
                            onChange={(e) => setNewPlaylistName(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Movies (comma separated)"
                            value={newPlaylistMovies}
                            onChange={(e) => setNewPlaylistMovies(e.target.value)}
                        />
                        <button type="submit">Create Playlist</button>
                    </form>
                )}
            </div>
        </div>
    );
}
export default Playlists;