import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';

const RiderHome = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
        setLoading(false);
      },
      (err) => {
        setError('Unable to retrieve your location. Please allow location access.');
        setLoading(false);
      }
    );
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (menuOpen && menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  // Logout logic
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('rid');
    setMenuOpen(false);
    navigate('/');
  };

  // Menu click actions
  const handleMenuClick = (action) => {
    setMenuOpen(false);
    if (action === 'profile') navigate('/profile');
    if (action === 'settings') navigate('/settings');
    if (action === 'logout') handleLogout();
  };

  return (
    <div>
      {/* Top Taskbar */}
      <div style={{
        width: "100vw",
        height: 52,
        background: "#1976d2",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 26px",
        boxSizing: "border-box",
        boxShadow: "0 2px 10px #b0b6be44",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 102,
      }}>
        <div style={{
          color: "#fff",
          fontWeight: 700,
          fontSize: 21,
          letterSpacing: 1,
        }}>
          Rider Home
        </div>
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            style={{
              width: 34,
              height: 34,
              background: "#1565c0",
              color: "#fff",
              border: "none",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 2px 8px #dde3f0",
              padding: 0,
            }}
            title="User Menu"
          >
            <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="24" fill="#1976d2" />
              <circle cx="24" cy="18" r="8" fill="#fff" />
              <ellipse cx="24" cy="34" rx="12" ry="8" fill="#fff" />
            </svg>
          </button>
          {/* Dropdown menu */}
          {menuOpen && (
            <div ref={menuRef} style={{
              position: "absolute",
              right: 0,
              marginTop: 12,
              background: "#fff",
              borderRadius: 10,
              boxShadow: "0 4px 16px #dde3f0",
              minWidth: 140,
              zIndex: 200,
              overflow: "hidden",
            }}>
              <div
                style={menuItemStyle}
                onClick={() => handleMenuClick('profile')}
              >Profile</div>
              <div
                style={menuItemStyle}
                onClick={() => handleMenuClick('settings')}
              >Settings</div>
              <div
                style={{ ...menuItemStyle, color: "#c62828", fontWeight: 700 }}
                onClick={() => handleMenuClick('logout')}
              >Logout</div>
            </div>
          )}
        </div>
      </div>
      {/* Main Content */}
      <div style={{
        maxWidth: 500,
        margin: '84px auto 0 auto', // margin-top: 84px to push content below app bar
        padding: 24,
        border: '1px solid #eee',
        borderRadius: 10,
        boxShadow: '0 2px 8px #eee',
        position: "relative",
        background: "#fff"
      }}>
        <h2 style={{ textAlign: 'center', marginTop: 0 }}>Welcome, Rider!</h2>
        {loading && (
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            Finding your current location...
          </div>
        )}
        {error && (
          <div style={{ color: 'red', marginTop: 16, textAlign: 'center' }}>
            {error}
          </div>
        )}
        {location && (
          <div>
            <div style={{ margin: "12px 0", textAlign: "center" }}>
              <b>Your Current Location:</b>
              <div>Latitude: {location.lat}</div>
              <div>Longitude: {location.lng}</div>
            </div>
            <MapContainer
              center={[location.lat, location.lng]}
              zoom={15}
              style={{ height: "350px", width: "100%", borderRadius: 12 }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              <Marker position={[location.lat, location.lng]}>
                <Popup>
                  You are here!
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        )}
      </div>
    </div>
  );
};

const menuItemStyle = {
  padding: "12px 24px",
  cursor: "pointer",
  borderBottom: "1px solid #f0f0f0",
  background: "#fff",
  fontWeight: 500,
  fontSize: 16,
  transition: "background 0.15s",
};
export default RiderHome;
