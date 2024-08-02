import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/LoginPage.css';

const SignupPage = (props) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordsTouched, setPasswordsTouched] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };
  
  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
    if (passwordsTouched) {
      setPasswordsTouched(event.target.value !== confirmPassword);
    }
  };

  const handleConfirmPasswordChange = (event) => {
    setConfirmPassword(event.target.value);
    if (passwordsTouched) {
      setPasswordsTouched(event.target.value !== password);
    }
  };

  const handleConfirmPasswordBlur = () => {
    setPasswordsTouched(true);
  };

  const isEmailValid = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignup = async () => {
    if (!username || !email || !password || !confirmPassword) {
      setError('All fields are required.');
      return;
    }

    if (!isEmailValid(email)) {
      setError('Invalid email format.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
        const baseURL = process.env.REACT_APP_API_BASE_URL;;
        // Update the API endpoint to match the server route
        const token = 'secret-token'; // Replace with your actual token
        const response = await axios.post(`${baseURL}/users`, {
        name: username,
        password,
        email,
        }, {
        headers: {
            'Authorization': `${token}`
        }
        });
      
        // Handle the response from your backend
        console.log(response.data);
        // Redirect or show a success message
        navigate('/login');
      } catch (error) {
        setError(`There was an error signing up: ${error.response?.data?.message || error.message}`);
        console.error('Signup error', error);
      }
  };

  const showError = passwordsTouched && password !== confirmPassword;

  return (
    <div className="login-box center">
        <div className="login-header">
            <header>Sign Up</header>
        </div>
        <div className="input-box">
    <input
        type="text"
        className="input-field"
        placeholder="Username"
        autoComplete="off"
        value={username}
        onChange={handleUsernameChange}
        required
    />
    </div>
    <div className="input-box">
    <input
        type="text"
        className="input-field"
        placeholder="Email"
        autoComplete="off"
        value={email}
        onChange={handleEmailChange}
        required
    />
    </div>
        <div className="input-box">
            <input 
              type="password" 
              className={`input-field ${showError ? 'error' : ''}`} 
              placeholder="Password" 
              autoComplete="off" 
              value={password}
              onChange={handlePasswordChange} 
              required
            />
        </div>
        <div className="input-box">
            <input 
              type="password" 
              className={`input-field ${showError ? 'error' : ''}`} 
              placeholder="Confirm Password" 
              autoComplete="off" 
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              onBlur={handleConfirmPasswordBlur} 
              required
            />
        </div>
      {error && <p className="error-message">{error}</p>}
      <div className="input-submit mt-3 mb-5">
        <button className="submit-btn" style={{color: 'white'}} onClick={handleSignup}>Sign Up</button>
      </div>
    </div>
  );
};

export default SignupPage;
