import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import RiderHome from './pages/RiderHome';
import DriverHome from './pages/DriverHome';
import UserProfile from './pages/UserProfile';
import AppSettings from './pages/AppSettings';
import RequestRidePage from './pages/RequestRidePage'; // <- Add this import

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/rider/home" element={<RiderHome />} />
        <Route path="/driver/home" element={<DriverHome />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/settings" element={<AppSettings />} />
        <Route path="/request-ride" element={<RequestRidePage />} /> {/* Add this route */}
      </Routes>
    </Router>
  );
}

export default App;
