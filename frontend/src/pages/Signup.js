import React, { useState } from 'react';
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

  const handleSubmit = async () => {
    try {
      const res = await axios.post('http://localhost:3002/signup', form);
      alert(res.data.message);
    } catch (err) {
      alert('Signup failed');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Signup</h2>
      <input name="name" placeholder="Name" onChange={handleChange} />
      <br />
      <input name="email" placeholder="Email" onChange={handleChange} />
      <br />
      <input name="phone" placeholder="Phone" onChange={handleChange} />
      <br />
      <input name="password" type="password" placeholder="Password" onChange={handleChange} />
      <br />
      <label>
        <input type="checkbox" name="wantsToBeDriver" onChange={handleChange} />
        I want to be a driver
      </label>
      <br />

      {form.wantsToBeDriver && (
        <>
          <input name="license" placeholder="License Number" onChange={handleChange} />
          <br />
          <input name="vehicle.plate" placeholder="License Plate" onChange={handleChange} />
          <br />
          <input name="vehicle.make" placeholder="Manufacturer" onChange={handleChange} />
          <br />
          <input name="vehicle.model" placeholder="Model" onChange={handleChange} />
          <br />
          <input name="vehicle.year" placeholder="Year" onChange={handleChange} />
          <br />
          <input name="vehicle.color" placeholder="Color" onChange={handleChange} />
          <br />
          <input name="vehicle.seats" placeholder="Seats" onChange={handleChange} />
          <br />
        </>
      )}

      <button onClick={handleSubmit}>Signup</button>
    </div>
  );
};

export default Signup;
