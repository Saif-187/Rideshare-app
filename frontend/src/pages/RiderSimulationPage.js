import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";

// Car/driver icon
const carIcon = new L.DivIcon({
  className: "",
  html: `<svg width="34" height="34" viewBox="0 0 36 36"><circle cx="18" cy="18" r="17" fill="#1976d2" stroke="#fff" stroke-width="3"/><text x="18" y="24" font-size="16" text-anchor="middle" fill="#fff" font-family="Arial" font-weight="bold">&#128663;</text></svg>`,
  iconSize: [34, 34],
  iconAnchor: [17, 34],
});

const pickupIcon = new L.DivIcon({
  className: "",
  html: `<svg width="34" height="34" viewBox="0 0 36 36"><circle cx="18" cy="18" r="17" fill="#43a047" stroke="#fff" stroke-width="3"/><text x="18" y="24" font-size="16" text-anchor="middle" fill="#fff" font-family="Arial">&#x1F6A9;</text></svg>`,
  iconSize: [34, 34],
  iconAnchor: [17, 34],
});

const dropoffIcon = new L.DivIcon({
  className: "",
  html: `<svg width="34" height="34" viewBox="0 0 36 36"><circle cx="18" cy="18" r="17" fill="#d32f2f" stroke="#fff" stroke-width="3"/><text x="18" y="24" font-size="18" text-anchor="middle" fill="#fff" font-family="Arial">&#x1F6A9;</text></svg>`,
  iconSize: [34, 34],
  iconAnchor: [17, 34],
});

const RiderSimulationPage = () => {
  const { rideId } = useParams();
  const navigate = useNavigate();
  const [ride, setRide] = useState(null);

  // Poll ride status and driver location every 3 seconds
  useEffect(() => {
    const poll = () => {
      fetch(`http://localhost:3002/ride/${rideId}/status`)
        .then(res => res.json())
        .then(data => setRide(data));
    };
    poll();
    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [rideId]);

  if (!ride) return <div>Loading...</div>;

  const hasDriver = ride.driver && ride.status !== "pending";

  // Status text mapping for clarity
  function statusText(status) {
    switch (status) {
      case "pending":
        return "Waiting for driver to accept your ride...";
      case "accepted":
        return "Driver is on the way to your pickup location";
      case "picked_up":
        return "Driver has arrived. Please board the car!";
      case "on_the_way":
        return "You are on the way to your destination";
      case "finished":
        return "Ride complete!";
      default:
        return status;
    }
  }

  return (
    <div style={{ maxWidth: 700, margin: "36px auto", padding: 24, background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px #dde3f0" }}>
      <h2 style={{ textAlign: "center" }}>Your Ride Status</h2>
      <div style={{ margin: "22px 0", fontWeight: 500, color: "#1976d2" }}>
        {statusText(ride.status)}
      </div>
      <div style={{ height: 420, borderRadius: 10, overflow: "hidden" }}>
        {ride.start && ride.end && (
          <MapContainer
            center={ride.start}
            zoom={14}
            style={{ height: "100%", width: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[ride.start.lat, ride.start.lng]} icon={pickupIcon}>
              <Popup>Pickup Point</Popup>
            </Marker>
            <Marker position={[ride.end.lat, ride.end.lng]} icon={dropoffIcon}>
              <Popup>Dropoff Point</Popup>
            </Marker>
            {hasDriver && (
              <>
                <Marker position={[ride.driver.lat, ride.driver.lng]} icon={carIcon}>
                  <Popup>Driver</Popup>
                </Marker>
                <Polyline positions={[
                  [ride.driver.lat, ride.driver.lng],
                  (ride.status === "on_the_way" || ride.status === "finished")
                    ? [ride.end.lat, ride.end.lng]
                    : [ride.start.lat, ride.start.lng]
                ]} color="#1976d2" />
              </>
            )}
          </MapContainer>
        )}
      </div>
      <div style={{ marginTop: 18, textAlign: "center" }}>
        {ride.status === "finished" && (
          <button style={buttonStyle} onClick={() => navigate("/rider/home")}>
            Back to Home
          </button>
        )}
      </div>
    </div>
  );
};

const buttonStyle = {
  padding: "12px 32px",
  background: "#1976d2",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  fontSize: 17,
  fontWeight: 600,
  cursor: "pointer"
};

export default RiderSimulationPage;
