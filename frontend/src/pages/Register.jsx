//REGISTER PAGE
/*/import React, { useState } from 'react';
import API from '../services/api';

/*function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
    const handleRegister = async (e) => {
    e.preventDefault();

    try {
        const response = await API.post('/register', {
            username,
            password
        });
        if (response.data.status === 'success') {
            setMessage('Registration successful! Please log in.');
        } else {
            setMessage(response.data.message);
        }
    } catch (error) {
        setMessage('Registration failed');
        console.error(error);
    }
    };
    return (
    <div>
      <h1>Register</h1>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
        />
        <br /><br />
        <input
          type="password"
          placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
        />
        <br /><br />
        <button type="submit">Register</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}*/

function Register() {
  return (
    <div>
      <h1>Register Page</h1>
    </div>
  );
}

export default Register;