import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import axios from 'axios';

const profileModalStyle = {
  position: "fixed",
  top: 0, left: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(0,0,0,0.25)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999
};

const profileCardStyle = {
  background: "#fff",
  padding: "32px 28px",
  borderRadius: 16,
  minWidth: 320,
  boxShadow: "0 8px 32px rgba(31, 38, 135, 0.14)",
  maxWidth: "92vw"
};

const RiderHome = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');

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

  // Debug: profileOpen changes
  useEffect(() => {
    console.log("profileOpen state changed:", profileOpen);
  }, [profileOpen]);

  // Debug: profile changes
  useEffect(() => {
    if (profile) {
      console.log("Profile state updated:", profile);
    }
  }, [profile]);

  const handleProfileOpen = async () => {
    console.log("Profile button clicked!");
    setProfileOpen(true);
    setProfileLoading(true);
    setProfileError('');
    try {
      // Always get rid from localStorage
      const rid = localStorage.getItem('rid');
      if (!rid) {
        setProfileError("No RID found in localStorage. Please login again.");
        setProfileLoading(false);
        return;
      }
      const res = await axios.get(`http://localhost:3002/profile?rid=${rid}`);
      console.log("Profile fetch success:", res.data);
      setProfile(res.data);
    } catch (e) {
      console.log("Profile fetch error:", e);
      setProfileError("Failed to load profile.");
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: 500,
      margin: '40px auto',
      padding: 24,
      border: '1px solid #eee',
      borderRadius: 10,
      boxShadow: '0 2px 8px #eee',
      position: "relative"
    }}>
      {/* Floating Facebook-style Profile Button */}
      <button
        onClick={handleProfileOpen}
        style={{
          position: "fixed",
          top: 30, right: 30,
          width: 58, height: 58,
          background: "#1976d2",
          color: "#fff",
          border: "none",
          borderRadius: "50%",
          fontSize: 27,
          fontWeight: "bold",
          boxShadow: "0 4px 16px #dde3f0",
          cursor: "pointer",
          zIndex: 101,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
        title="User Profile"
      >
        <svg
          width="36"
          height="36"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <circle cx="24" cy="24" r="24" fill="#fff" opacity="0.18"/>
          <circle cx="24" cy="18" r="8" fill="#b0b6be"/>
          <ellipse cx="24" cy="34" rx="12" ry="8" fill="#b0b6be"/>
        </svg>
      </button>

      <h2 style={{ textAlign: 'center' }}>Welcome, Rider!</h2>

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

      {/* Profile Modal */}
      {profileOpen && (
        <div style={profileModalStyle} onClick={() => {
          setProfileOpen(false);
          console.log("Modal closed");
        }}>
          <div style={profileCardStyle} onClick={e => e.stopPropagation()}>
            <h3 style={{ textAlign: "center", marginBottom: 16, color: "#1976d2" }}>Your Profile</h3>
            <div style={{ color: "#1976d2" }}>[DEBUG] Modal is visible!</div>
            {profileLoading && <div>Loading...</div>}
            {profileError && <div style={{ color: "red" }}>{profileError}</div>}
            {profile && (
              <div style={{ fontSize: 17, lineHeight: "1.7" }}>
                <div><b>Name:</b> {profile.name}</div>
                <div><b>Email:</b> {profile.email}</div>
                <div><b>Phone:</b> {profile.phone_number}</div>
                <div>
                  <b>Account Created:</b>{" "}
                  {profile.created_at && (new Date(profile.created_at)).toLocaleDateString()}
                </div>
                <div><b>Role:</b> {profile.role}</div>
                {profile.role === "Driver" && (
                  <div style={{ marginTop: 12, background: "#f3e1ea", padding: 10, borderRadius: 8 }}>
                    <div><b>License:</b> {profile.license}</div>
                    <div><b>Vehicle Plate:</b> {profile.vehicle?.plate}</div>
                    <div><b>Vehicle:</b> {profile.vehicle?.make} {profile.vehicle?.model} {profile.vehicle?.year}</div>
                    <div><b>Color:</b> {profile.vehicle?.color}</div>
                    <div><b>Seats:</b> {profile.vehicle?.seats}</div>
                  </div>
                )}
              </div>
            )}
            <button
              style={{
                marginTop: 24,
                padding: "10px 24px",
                background: "#1976d2",
                color: "#fff",
                border: "none",
                borderRadius: 7,
                fontWeight: 600,
                fontSize: 17,
                letterSpacing: 1,
                cursor: "pointer",
                width: "100%"
              }}
              onClick={() => {
                setProfileOpen(false);
                console.log("Modal closed");
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiderHome;
