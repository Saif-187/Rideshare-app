import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import RiderHome from './pages/RiderHome';
import DriverHome from './pages/DriverHome'; // Import DriverHome

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/rider/home" element={<RiderHome />} />
        <Route path="/driver/home" element={<DriverHome />} /> {/* Add driver home route */}
      </Routes>
    </Router>
  );
}

export default App;
