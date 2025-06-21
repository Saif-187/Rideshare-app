import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

const RiderHome = () => {
  const [location, setLocation] = useState(null); // { lat, lng }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  return (
    <div style={{
      maxWidth: 500,
      margin: '40px auto',
      padding: 24,
      border: '1px solid #eee',
      borderRadius: 10,
      boxShadow: '0 2px 8px #eee'
    }}>
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
    </div>
  );
};

export default RiderHome;
