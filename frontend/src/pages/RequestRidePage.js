import React, { useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useNavigate } from "react-router-dom";

// Fetch suggestions from OpenStreetMap Nominatim
const fetchSuggestions = async (query) => {
  if (!query) return [];
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
  );
  return await res.json();
};

const RequestRidePage = () => {
  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [startSuggestions, setStartSuggestions] = useState([]);
  const [endSuggestions, setEndSuggestions] = useState([]);
  const [pickupCoords, setPickupCoords] = useState(null);
  const [endCoords, setEndCoords] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState({ start: false, end: false });

  const navigate = useNavigate();
  const startInputRef = useRef();
  const endInputRef = useRef();

  // Autocomplete for start
  const handleStartInput = async (e) => {
    const value = e.target.value;
    setStartLocation(value);
    if (value.length > 2) {
      setShowSuggestions(s => ({ ...s, start: true }));
      const suggestions = await fetchSuggestions(value);
      setStartSuggestions(suggestions);
    } else {
      setStartSuggestions([]);
      setShowSuggestions(s => ({ ...s, start: false }));
    }
  };

  // Autocomplete for end
  const handleEndInput = async (e) => {
    const value = e.target.value;
    setEndLocation(value);
    if (value.length > 2) {
      setShowSuggestions(s => ({ ...s, end: true }));
      const suggestions = await fetchSuggestions(value);
      setEndSuggestions(suggestions);
    } else {
      setEndSuggestions([]);
      setShowSuggestions(s => ({ ...s, end: false }));
    }
  };

  // User picks from suggestion
  const selectStartSuggestion = (s) => {
    setStartLocation(s.display_name);
    setPickupCoords({ lat: parseFloat(s.lat), lng: parseFloat(s.lon) });
    setStartSuggestions([]);
    setShowSuggestions(s => ({ ...s, start: false }));
    endInputRef.current?.focus();
  };
  const selectEndSuggestion = (s) => {
    setEndLocation(s.display_name);
    setEndCoords({ lat: parseFloat(s.lat), lng: parseFloat(s.lon) });
    setEndSuggestions([]);
    setShowSuggestions(s => ({ ...s, end: false }));
  };

  // Use browser geolocation for pickup
  const handleUseCurrent = () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPickupCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setStartLocation("Current Location");
        setStartSuggestions([]);
        setShowSuggestions(s => ({ ...s, start: false }));
      },
      () => setError("Failed to get location")
    );
  };

  // Submit the request
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const body = {
        start_location: startLocation,
        end_location: endLocation,
        start_latitude: pickupCoords?.lat,
        start_longitude: pickupCoords?.lng,
        end_latitude: endCoords?.lat,
        end_longitude: endCoords?.lng,
      };

      const res = await fetch("http://localhost:3002/request-ride", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : undefined,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Ride requested! Your request ID: " + data.request_id);
        navigate("/rider/home");
      } else {
        setError(data.message || "Failed to request ride");
      }
    } catch (err) {
      setError("Network or server error");
    }
    setSubmitting(false);
  };

  // Make marker draggable for pickup point fine-tuning
  const onMarkerDragEnd = (e) => {
    const marker = e.target;
    const position = marker.getLatLng();
    setPickupCoords({ lat: position.lat, lng: position.lng });
  };

  // Hide suggestions on blur after small delay to allow click
  const blurSuggestions = (type) => {
    setTimeout(() => setShowSuggestions(s => ({ ...s, [type]: false })), 150);
  };

  return (
    <div style={{
      maxWidth: 420,
      margin: "90px auto",
      padding: 24,
      background: "#fff",
      borderRadius: 10,
      boxShadow: "0 2px 8px #eee",
      minHeight: 450,
      position: "relative"
    }}>
      <h2 style={{ textAlign: "center" }}>Request a Ride</h2>
      <form onSubmit={handleSubmit} autoComplete="off">
        <div style={{ margin: "18px 0", position: "relative" }}>
          <label>
            <b>Start Location:</b>
            <input
              type="text"
              ref={startInputRef}
              value={startLocation}
              onChange={handleStartInput}
              onFocus={() => { if (startLocation.length > 2) setShowSuggestions(s => ({ ...s, start: true })) }}
              onBlur={() => blurSuggestions("start")}
              placeholder="Enter start address or click button"
              style={inputStyle}
              required
              autoComplete="off"
            />
          </label>
          <button type="button" style={miniBtnStyle} onClick={handleUseCurrent}>
            Use Current Location
          </button>
          {showSuggestions.start && startSuggestions.length > 0 && (
            <div style={suggestionBoxStyle}>
              {startSuggestions.map(s => (
                <div
                  key={s.place_id}
                  style={suggestionItemStyle}
                  onMouseDown={() => selectStartSuggestion(s)}
                >
                  {s.display_name}
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ margin: "18px 0", position: "relative" }}>
          <label>
            <b>End Location:</b>
            <input
              type="text"
              ref={endInputRef}
              value={endLocation}
              onChange={handleEndInput}
              onFocus={() => { if (endLocation.length > 2) setShowSuggestions(s => ({ ...s, end: true })) }}
              onBlur={() => blurSuggestions("end")}
              placeholder="Enter destination address"
              style={inputStyle}
              required
              autoComplete="off"
            />
          </label>
          {showSuggestions.end && endSuggestions.length > 0 && (
            <div style={suggestionBoxStyle}>
              {endSuggestions.map(s => (
                <div
                  key={s.place_id}
                  style={suggestionItemStyle}
                  onMouseDown={() => selectEndSuggestion(s)}
                >
                  {s.display_name}
                </div>
              ))}
            </div>
          )}
        </div>

        {pickupCoords && (
          <div style={{ margin: "20px 0" }}>
            <MapContainer
              center={[pickupCoords.lat, pickupCoords.lng]}
              zoom={15}
              style={{ height: "240px", width: "100%", borderRadius: 8 }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              <Marker
                position={[pickupCoords.lat, pickupCoords.lng]}
                draggable={true}
                eventHandlers={{
                  dragend: onMarkerDragEnd
                }}
              >
                <Popup>Drag to adjust pickup point</Popup>
              </Marker>
              {/* Optionally show end marker */}
              {endCoords && (
                <Marker position={[endCoords.lat, endCoords.lng]}>
                  <Popup>Destination</Popup>
                </Marker>
              )}
            </MapContainer>
          </div>
        )}

        {error && (
          <div style={{ color: "red", textAlign: "center", marginBottom: 10 }}>{error}</div>
        )}

        <button
          type="submit"
          disabled={submitting}
          style={{
            width: "100%",
            padding: "12px 0",
            borderRadius: 8,
            background: "#1976d2",
            color: "#fff",
            fontSize: 17,
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
            boxShadow: "0 2px 8px #dde3f0",
            marginTop: 18
          }}
        >
          {submitting ? "Requesting..." : "Confirm Request"}
        </button>
      </form>
    </div>
  );
};

const inputStyle = {
  display: "block",
  width: "100%",
  marginTop: 8,
  marginBottom: 5,
  padding: 10,
  borderRadius: 7,
  border: "1px solid #bbb",
  fontSize: 15
};
const miniBtnStyle = {
  marginLeft: 10,
  padding: "7px 16px",
  border: "none",
  borderRadius: 6,
  background: "#e3e9f5",
  color: "#1976d2",
  fontWeight: 600,
  cursor: "pointer",
  fontSize: 14,
  marginTop: 8
};
const suggestionBoxStyle = {
  position: "absolute",
  top: 45,
  left: 0,
  background: "#fff",
  border: "1px solid #ddd",
  borderRadius: 4,
  zIndex: 20,
  width: "100%",
  maxHeight: 160,
  overflowY: "auto",
  boxShadow: "0 2px 8px #eee"
};
const suggestionItemStyle = {
  padding: "9px 14px",
  cursor: "pointer",
  fontSize: 15,
  borderBottom: "1px solid #f4f4f4"
};

export default RequestRidePage;
