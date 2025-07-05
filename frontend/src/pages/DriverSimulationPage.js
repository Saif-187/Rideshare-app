import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";

// Icons
const carIcon = new L.DivIcon({
  className: "",
  html: `<svg width="34" height="34" viewBox="0 0 36 36">
    <circle cx="18" cy="18" r="17" fill="#1976d2" stroke="#fff" stroke-width="3"/>
    <text x="18" y="24" font-size="16" text-anchor="middle" fill="#fff" font-family="Arial" font-weight="bold">&#128663;</text>
    </svg>`,
  iconSize: [34, 34],
  iconAnchor: [17, 34],
});
const pickupIcon = new L.DivIcon({
  className: "",
  html: `<svg width="34" height="34" viewBox="0 0 36 36">
    <circle cx="18" cy="18" r="17" fill="#43a047" stroke="#fff" stroke-width="3"/>
    <text x="18" y="24" font-size="16" text-anchor="middle" fill="#fff" font-family="Arial">&#x1F6A9;</text>
    </svg>`,
  iconSize: [34, 34],
  iconAnchor: [17, 34],
});
const dropoffIcon = new L.DivIcon({
  className: "",
  html: `<svg width="34" height="34" viewBox="0 0 36 36">
    <circle cx="18" cy="18" r="17" fill="#d32f2f" stroke="#fff" stroke-width="3"/>
    <text x="18" y="24" font-size="18" text-anchor="middle" fill="#fff" font-family="Arial">&#x1F6A9;</text>
    </svg>`,
  iconSize: [34, 34],
  iconAnchor: [17, 34],
});

function interpolatePosition(start, end, progress) {
  return {
    lat: start.lat + (end.lat - start.lat) * progress,
    lng: start.lng + (end.lng - start.lng) * progress,
  };
}

const POLL_INTERVAL = 2000; // ms

const DriverSimulationPage = () => {
  const { rideId } = useParams();
  const navigate = useNavigate();
  const [ride, setRide] = useState(null);
  const [driverPos, setDriverPos] = useState(null);
  const [step, setStep] = useState("pending");
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef();

  // Poll ride status and driver location
  useEffect(() => {
    function poll() {
      fetch(`http://localhost:3002/ride-status/${rideId}`)
        .then(res => res.json())
        .then(data => {
          setRide(data);
          setStep(data.status); // 'pending', 'accepted', 'picked_up', 'on_the_way', 'finished'
          if (data.driver) setDriverPos({ lat: data.driver.lat, lng: data.driver.lng });
        });
    }
    poll();
    intervalRef.current = setInterval(poll, POLL_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, [rideId]);

  // Simulate movement (DRIVES AND PATCHES STATUS)
  useEffect(() => {
    let anim;
    if (
      ride &&
      driverPos &&
      (step === "accepted" || step === "on_the_way") &&
      ride.start &&
      ride.end
    ) {
      let from, to, targetStatus;
      if (step === "accepted") {
        from = driverPos;
        to = ride.start;
        targetStatus = "picked_up";
      } else if (step === "on_the_way") {
        from = driverPos;
        to = ride.end;
        targetStatus = "finished";
      } else {
        return;
      }
      let t = 0;
      anim = setInterval(() => {
        t += 0.04;
        if (t >= 1) {
          setProgress(1);
          clearInterval(anim);
          // PATCH status advance
          fetch("http://localhost:3002/ride-status", {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
            },
            body: JSON.stringify({ ride_id: rideId, status: targetStatus }),
          }).then(() => setStep(targetStatus));
        } else {
          setProgress(t);
          const nextPos = interpolatePosition(from, to, t);
          setDriverPos(nextPos);
          // PATCH driver location to backend (with JWT)
          fetch("http://localhost:3002/api/driver/location", {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
            },
            body: JSON.stringify({
              lat: nextPos.lat,
              lng: nextPos.lng,
            }),
          });
        }
      }, 300);
    }
    return () => clearInterval(anim);
  }, [step, ride, driverPos, rideId]);

  if (!ride) return <div>Loading simulation...</div>;

  return (
    <div style={{ maxWidth: 700, margin: "36px auto", padding: 24, background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px #dde3f0" }}>
      <h2 style={{ textAlign: "center" }}>Driver Journey Simulation</h2>
      <div style={{ margin: "22px 0" }}>
        <b>Status:</b>{" "}
        {step === "pending" && "Waiting for acceptance"}
        {step === "accepted" && "Driving to pickup..."}
        {step === "picked_up" && "Waiting at pickup point"}
        {step === "on_the_way" && "Driving to dropoff..."}
        {step === "finished" && "Ride complete!"}
      </div>
      <div style={{ height: 420, borderRadius: 10, overflow: "hidden" }}>
        {ride.start && ride.end && driverPos &&
          <MapContainer
            center={driverPos}
            zoom={14}
            style={{ height: "100%", width: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[ride.start.lat, ride.start.lng]} icon={pickupIcon}>
              <Popup>Pickup</Popup>
            </Marker>
            <Marker position={[ride.end.lat, ride.end.lng]} icon={dropoffIcon}>
              <Popup>Dropoff</Popup>
            </Marker>
            <Marker position={[driverPos.lat, driverPos.lng]} icon={carIcon}>
              <Popup>Driver</Popup>
            </Marker>
            {/* Show line to next target */}
            <Polyline positions={
              step === "on_the_way"
                ? [[driverPos.lat, driverPos.lng], [ride.end.lat, ride.end.lng]]
                : [[driverPos.lat, driverPos.lng], [ride.start.lat, ride.start.lng]]
            } color="#1976d2" />
          </MapContainer>
        }
      </div>
      <div style={{ marginTop: 18, textAlign: "center" }}>
        {step === "picked_up" && (
          <button
            style={buttonStyle}
            onClick={() => {
              // Advance to 'on_the_way'
              fetch("http://localhost:3002/ride-status", {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
                },
                body: JSON.stringify({ ride_id: rideId, status: "on_the_way" }),
              }).then(() => setStep("on_the_way"));
            }}
          >Start Ride</button>
        )}
        {step === "finished" && (
          <button style={buttonStyle} onClick={() => navigate("/driver/home")}>Back to Home</button>
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

export default DriverSimulationPage;
