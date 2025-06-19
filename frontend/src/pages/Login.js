import React, { useState } from 'react';
import axios from 'axios';

const Login = () => {
  const [role, setRole] = useState('Rider'); // default role
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async () => {
    try {
      const res = await axios.post('http://localhost:3002/login', {
        role,
        id,
        password,
      });
      setMessage(res.data.message);
    } catch (error) {
      setMessage('Login failed');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Login</h2>
      <label>
        Role:
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="Rider">Rider</option>
          <option value="Driver">Driver</option>
        </select>
      </label>
      <br />
      <input
        type="text"
        placeholder="ID"
        value={id}
        onChange={(e) => setId(e.target.value)}
      />
      <br />
      <input
        type="password"
        placeholder="Password / License (for Driver)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />
      <button onClick={handleLogin}>Login</button>
      <p>{message}</p>
    </div>
  );
};

export default Login;
