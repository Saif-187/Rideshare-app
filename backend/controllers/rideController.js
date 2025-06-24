// controllers/rideController.js
import pool from '../db.js';

// 1. Create a new ride request (by rider)
export const requestRide = async (req, res) => {
  try {
    const {
      // If using JWT: const { rid } = req.user;
      rider_id,
      start_location,
      end_location,
      start_latitude,
      start_longitude,
      end_latitude,
      end_longitude
    } = req.body;

    // 1. Create a new Ride row (no driver assigned yet, so Vehicle_ID is NULL)
    const rideResult = await pool.query(
      `INSERT INTO Ride
        (Vehicle_ID, Is_Shared, Start_Time, Start_Latitude, Start_Longitude, End_Latitude, End_Longitude, Start_Location, End_Location)
       VALUES (NULL, FALSE, NOW(), $1, $2, $3, $4, $5, $6)
       RETURNING Ride_ID`,
      [
        start_latitude, start_longitude,
        end_latitude, end_longitude,
        start_location, end_location
      ]
    );
    const ride_id = rideResult.rows[0].ride_id;

    // 2. Create Ride_Request row
    const reqRes = await pool.query(
      `INSERT INTO Ride_Request (Request_ID, Ride_ID)
       VALUES (DEFAULT, $1)
       RETURNING Request_ID`,
      [ride_id]
    );
    const request_id = reqRes.rows[0].request_id;

    // 3. Link the rider to this ride (Ride_Riders table)
    await pool.query(
      `INSERT INTO Ride_Riders (Ride_Riders_ID, Rider_ID, Ride_ID)
       VALUES (DEFAULT, $1, $2)`,
      [rider_id, ride_id]
    );

    res.status(201).json({ message: "Ride requested!", ride_id, request_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error requesting ride", error: err.detail || err.message });
  }
};

// 2. Get all available ride requests (for drivers to see)
export const getAvailableRides = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
          Ride.Ride_ID, 
          Start_Location, End_Location,
          Start_Latitude, Start_Longitude,
          End_Latitude, End_Longitude,
          Start_Time
        FROM Ride
        WHERE Vehicle_ID IS NULL
        ORDER BY Start_Time ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch available rides', error: err.message });
  }
};
