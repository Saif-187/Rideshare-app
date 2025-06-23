import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';

const DriverHome = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navigate = useNavigate();
  const dropdownRef = useRef();

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
      () => {
        setError('Unable to retrieve your location. Please allow location access.');
        setLoading(false);
      }
    );
  }, []);

  // Dropdown click-outside close
  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    window.addEventListener('mousedown', handleClick);
    return () => window.removeEventListener('mousedown', handleClick);
  }, [dropdownOpen]);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('rid');
    setDropdownOpen(false);
    navigate('/');
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
          Driver Dashboard
        </div>
        <div style={{ position: "relative" }} ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((open) => !open)}
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
            title="User Profile"
          >
            <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="24" fill="#1976d2" />
              <circle cx="24" cy="18" r="8" fill="#fff" />
              <ellipse cx="24" cy="34" rx="12" ry="8" fill="#fff" />
            </svg>
          </button>
          {dropdownOpen && (
            <div style={{
              position: "absolute",
              right: 0,
              top: 40,
              background: "#fff",
              border: "1px solid #e0e4ea",
              boxShadow: "0 2px 16px #dde3f0cc",
              borderRadius: 12,
              minWidth: 148,
              zIndex: 999,
              overflow: "hidden"
            }}>
              <button
                onClick={() => { setDropdownOpen(false); navigate('/profile'); }}
                style={dropdownItemStyle}
              >Profile</button>
              <button
                onClick={() => { setDropdownOpen(false); navigate('/settings'); }}
                style={dropdownItemStyle}
              >Settings</button>
              <button
                onClick={handleLogout}
                style={{ ...dropdownItemStyle, color: "#c0392b", borderTop: "1px solid #f3f3f3" }}
              >Logout</button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: 540,
        margin: '84px auto 0 auto',
        padding: 24,
        border: '1px solid #eee',
        borderRadius: 10,
        boxShadow: '0 2px 8px #eee',
        position: "relative",
        background: "#fff"
      }}>
        <h2 style={{ textAlign: 'center', marginTop: 0 }}>Welcome, Driver!</h2>

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

const dropdownItemStyle = {
  width: "100%",
  padding: "11px 17px",
  textAlign: "left",
  background: "none",
  border: "none",
  fontSize: 15.5,
  color: "#222",
  cursor: "pointer",
  fontWeight: 500,
  outline: "none"
};

export default DriverHome;
