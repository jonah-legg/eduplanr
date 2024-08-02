import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LoginPage.css';

const LoginPage = (props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevents the default form submission behavior
  
    try {
      const baseURL = process.env.REACT_APP_API_BASE_URL;
      const response = await fetch(`${baseURL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'secret-token'
        },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();

      console.log(data);
  
      // Check if the response has a token
      if (response.ok && data.token) {
        localStorage.setItem('token', data.token);
        console.log('Token set in localStorage:', localStorage.getItem('token')); // Debugging line
        navigate('/');
      } else {
        // If the response does not contain a token, handle it as a login failure
        setErrorMessage(data.message || 'Login failed.');
      }
    } catch (error) {
      setErrorMessage('Network error: Could not connect to the server.');
      console.error('There was an error!', error);
    }
  };

  return (
    <div className="login-box center">
      <div className="login-header">
        <header>Login</header>
      </div>
      <form onSubmit={handleLogin}>
        <div className="input-box">
          <input
            type="text"
            className="input-field"
            placeholder="Email"
            autoComplete="off"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="input-box">
          <input
            type="password"
            className="input-field"
            placeholder="Password"
            autoComplete="off"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        <div className="forgot">
          <section>
            <input type="checkbox" id="check" />
            <label htmlFor="check">Remember me</label>
          </section>
          <section>
            <a href="/forgotpassword">Forgot password</a>
          </section>
        </div>
        <div className="input-submit">
          <button type="submit" className="submit-btn" id="submit" style={{color: 'white'}}>Sign In</button>
        </div>
      </form>
      <div className="sign-up-link">
        <p>Don't have account? <a href="/signup">Sign Up</a></p>
      </div>
    </div>
  )
}

export default LoginPage;
