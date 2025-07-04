import express from 'express';
import cors from 'cors';
import pool from './db.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = 3002;
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key';

app.use(cors());
app.use(express.json());

/**
 * JWT verification middleware.
 * Call as `authenticateJWT` before any protected route.
 */
function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token provided" });
  const token = authHeader.split(' ')[1];
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid or expired token" });
    req.user = user;
    next();
  });
}

// --- Test route ---
app.get('/test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.send(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('DB connection error');
  }
});

// --- JWT Login Route ---
app.post('/login', async (req, res) => {
  const { role, id, password } = req.body;
  try {
    let result, rid, userData;
    if (role === 'Rider') {
      result = await pool.query(
        'SELECT * FROM Rider WHERE RID = $1 AND Password = $2',
        [id, password]
      );
      if (result.rows.length > 0) {
        rid = result.rows[0].rid;
        userData = { rid, role: 'Rider' };
      }
    } else if (role === 'Driver') {
      result = await pool.query(
        'SELECT * FROM Driver WHERE Driver_ID = $1 AND License = $2',
        [id, password]
      );
      if (result.rows.length > 0) {
        rid = result.rows[0].driver_id;
        userData = { rid, role: 'Driver' };
      }
    }

    if (result && result.rows.length > 0) {
      // Issue JWT
      const token = jwt.sign(userData, JWT_SECRET, { expiresIn: '2h' });
      res.json({ message: `Welcome, ${role}!`, token });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Login error');
  }
});

// --- Signup route (no JWT needed) ---
app.post('/signup', async (req, res) => {
  const {
    name, email, phone, password,
    wantsToBeDriver, license, vehicle
  } = req.body;

  try {
    const personInsert = await pool.query(
      'INSERT INTO Person (Email, Name, Phone_Number) VALUES ($1, $2, $3) RETURNING PID',
      [email, name, phone]
    );
    const pid = personInsert.rows[0].pid;

    await pool.query(
      'INSERT INTO Rider (RID, Created_at, Password) VALUES ($1, CURRENT_DATE, $2)',
      [pid, password]
    );

    if (wantsToBeDriver) {
      await pool.query(
        'INSERT INTO Driver (Driver_ID, Rating, Is_active, License) VALUES ($1, 5.0, TRUE, $2)',
        [pid, license]
      );
      await pool.query(
        `INSERT INTO Vehicle (Vehicle_ID, Driver_ID, License_Plate, Manufacturer, Model, Year, Color, Seats)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          pid,
          pid,
          vehicle.plate,
          vehicle.make,
          vehicle.model,
          vehicle.year,
          vehicle.color,
          vehicle.seats
        ]
      );
    }

    res.status(201).json({ message: 'Signup successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Signup failed', error: err.detail });
  }
});

// --- PROTECTED PROFILE ROUTE: expects JWT, no query param ---
app.get('/profile', authenticateJWT, async (req, res) => {
  const { rid } = req.user;
  if (!rid) return res.status(400).json({ message: "RID required" });

  try {
    // Get person info
    const personResult = await pool.query(
      `SELECT Name, Email, Phone_Number, PID FROM Person WHERE PID = $1`,
      [rid]
    );
    if (personResult.rows.length === 0)
      return res.status(404).json({ message: "User not found" });
    let profile = { ...personResult.rows[0] };

    // Is Rider?
    const riderResult = await pool.query(
      `SELECT RID, Created_at, Password FROM Rider WHERE RID = $1`,
      [rid]
    );
    if (riderResult.rows.length > 0) {
      profile.role = "Rider";
      profile.created_at = riderResult.rows[0].created_at;
    }

    // Is Driver?
    const driverResult = await pool.query(
      `SELECT License, Rating, Is_active FROM Driver WHERE Driver_ID = $1`,
      [rid]
    );
    if (driverResult.rows.length > 0) {
      profile.role = "Driver";
      profile.license = driverResult.rows[0].license;
      profile.rating = driverResult.rows[0].rating;
      profile.is_active = driverResult.rows[0].is_active;

      // Get ALL vehicles for this driver!
      const vehicleResult = await pool.query(
        `SELECT Vehicle_ID, License_Plate, Manufacturer, Model, Year, Color, Seats
         FROM Vehicle WHERE Driver_ID = $1`,
        [rid]
      );
      profile.vehicles = vehicleResult.rows;
    }

    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching profile" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
