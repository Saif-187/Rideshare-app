import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const emojiMap = {
  Rider: "🧑‍🦱",   // Or you can use "👤" if you prefer a simpler look
  Driver: "🚕"
};

const Login = () => {
  const [role, setRole] = useState('Rider');
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setErrorMsg('');
    setMessage('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:3002/login', {
        role,
        id,
        password,
      });

      setMessage(res.data.message);

      // Redirect to appropriate home page on successful login
      if (res.status === 200) {
        setTimeout(() => {
          if (role === 'Rider') {
            navigate('/rider/home');
          } else if (role === 'Driver') {
            navigate('/driver/home');
          }
        }, 700);
      }
    } catch (error) {
      setErrorMsg(
        error.response?.data?.message ||
        'Login failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f7fffc 0%, #a7bfe8 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <div style={{
        background: "#fff",
        padding: "40px 32px",
        borderRadius: 16,
        boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.12)",
        minWidth: 350,
        maxWidth: "94vw",
        textAlign: "center"
      }}>
        <div style={{
          marginBottom: 18,
          fontWeight: 700,
          color: "#1976d2",
          fontSize: 38,
          letterSpacing: 1
        }}>
          {emojiMap[role]} {/* Dynamic emoji */}
        </div>
        <div style={{
          marginBottom: 14,
          fontWeight: 700,
          color: "#1976d2",
          fontSize: 28,
          letterSpacing: 1
        }}>
          Login as {role}
        </div>
        <div style={{ marginBottom: 22, color: "#666", fontSize: 15 }}>
          Welcome back! Please login to your account.
        </div>
        <div style={{ marginBottom: 20, textAlign: "left" }}>
          <label style={{ fontWeight: 500, color: "#1976d2" }}>
            Role:
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{
                marginLeft: 10,
                padding: "6px 14px",
                border: "1px solid #bfc9d6",
                borderRadius: 5,
                fontSize: 15,
                color: "#1976d2",
                background: "#f7fafd"
              }}
            >
              <option value="Rider">Rider</option>
              <option value="Driver">Driver</option>
            </select>
          </label>
        </div>
        <input
          type="text"
          placeholder={role === 'Rider' ? "Rider ID" : "Driver ID"}
          value={id}
          onChange={(e) => setId(e.target.value)}
          style={{
            width: "100%",
            marginBottom: 16,
            padding: 12,
            border: "1.5px solid #dde3f0",
            borderRadius: 7,
            fontSize: 17
          }}
        />
        <input
          type="password"
          placeholder={role === 'Rider' ? "Password" : "License (for Driver)"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            marginBottom: 20,
            padding: 12,
            border: "1.5px solid #dde3f0",
            borderRadius: 7,
            fontSize: 17
          }}
        />
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: "100%",
            padding: "13px 0",
            background: loading ? "#8ab4f8" : "#1976d2",
            color: "white",
            border: "none",
            borderRadius: 8,
            fontSize: 19,
            fontWeight: 600,
            letterSpacing: 1,
            marginBottom: 18,
            boxShadow: "0 3px 12px #dde3f0",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "background 0.2s"
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        {message && (
          <div style={{
            color: '#219653',
            marginTop: 6,
            marginBottom: 6,
            fontWeight: 500
          }}>{message}</div>
        )}
        {errorMsg && (
          <div style={{
            color: '#e23b41',
            marginTop: 6,
            marginBottom: 6,
            fontWeight: 500
          }}>{errorMsg}</div>
        )}
        <div style={{
          textAlign: "center",
          marginTop: 18,
          fontSize: 15
        }}>
          New here?{" "}
          <a href="/signup" style={{ color: "#1976d2", fontWeight: 600 }}>
            Signup
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
