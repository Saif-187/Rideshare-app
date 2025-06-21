import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Signup = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    wantsToBeDriver: false,
    license: '',
    vehicle: {
      plate: '',
      make: '',
      model: '',
      year: '',
      color: '',
      seats: ''
    }
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('vehicle.')) {
      const key = name.split('.')[1];
      setForm((prev) => ({
        ...prev,
        vehicle: {
          ...prev.vehicle,
          [key]: value
        }
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await axios.post('http://localhost:3002/signup', form);
      alert(res.data.message);
      navigate('/login');
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message ||
        err.message ||
        'Signup failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      padding: 24,
      maxWidth: 400,
      margin: "40px auto",
      border: "1px solid #eee",
      borderRadius: 10,
      boxShadow: "0 2px 8px #eee"
    }}>
      <h2 style={{ textAlign: "center" }}>Signup</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          required
          style={{ width: "100%", marginBottom: 12, padding: 8 }}
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          style={{ width: "100%", marginBottom: 12, padding: 8 }}
        />
        <input
          name="phone"
          placeholder="Phone"
          value={form.phone}
          onChange={handleChange}
          required
          style={{ width: "100%", marginBottom: 12, padding: 8 }}
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          style={{ width: "100%", marginBottom: 12, padding: 8 }}
        />

        <label style={{ display: "block", marginBottom: 12 }}>
          <input
            type="checkbox"
            name="wantsToBeDriver"
            checked={form.wantsToBeDriver}
            onChange={handleChange}
          />{' '}
          I want to be a driver
        </label>

        {form.wantsToBeDriver && (
          <div style={{ marginLeft: 10, marginBottom: 12 }}>
            <input
              name="license"
              placeholder="License Number"
              value={form.license}
              onChange={handleChange}
              required
              style={{ width: "100%", marginBottom: 8, padding: 8 }}
            />
            <input
              name="vehicle.plate"
              placeholder="License Plate"
              value={form.vehicle.plate}
              onChange={handleChange}
              required
              style={{ width: "100%", marginBottom: 8, padding: 8 }}
            />
            <input
              name="vehicle.make"
              placeholder="Manufacturer"
              value={form.vehicle.make}
              onChange={handleChange}
              required
              style={{ width: "100%", marginBottom: 8, padding: 8 }}
            />
            <input
              name="vehicle.model"
              placeholder="Model"
              value={form.vehicle.model}
              onChange={handleChange}
              required
              style={{ width: "100%", marginBottom: 8, padding: 8 }}
            />
            <input
              name="vehicle.year"
              placeholder="Year"
              value={form.vehicle.year}
              onChange={handleChange}
              required
              style={{ width: "100%", marginBottom: 8, padding: 8 }}
            />
            <input
              name="vehicle.color"
              placeholder="Color"
              value={form.vehicle.color}
              onChange={handleChange}
              required
              style={{ width: "100%", marginBottom: 8, padding: 8 }}
            />
            <input
              name="vehicle.seats"
              placeholder="Seats"
              value={form.vehicle.seats}
              onChange={handleChange}
              required
              style={{ width: "100%", marginBottom: 8, padding: 8 }}
            />
          </div>
        )}

        {errorMsg && (
          <div style={{ color: "red", marginBottom: 12 }}>
            {errorMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: 10,
            background: "#1976d2",
            color: "white",
            border: "none",
            borderRadius: 5,
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Signing up..." : "Signup"}
        </button>
      </form>
      <div style={{ textAlign: "center", marginTop: 16 }}>
        Already have an account? <a href="/login">Login</a>
      </div>
    </div>
  );
};

export default Signup;
