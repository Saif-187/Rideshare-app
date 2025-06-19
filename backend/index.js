import express from 'express';
import cors from 'cors';
import pool from './db.js';

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

// Test route
app.get('/test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.send(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('DB connection error');
  }
});

// Login route
app.post('/login', async (req, res) => {
  const { role, id, password } = req.body;

  try {
    let result;
    if (role === 'Rider') {
      result = await pool.query(
        'SELECT * FROM Rider WHERE RID = $1 AND Password = $2',
        [id, password]
      );
    } else if (role === 'Driver') {
      result = await pool.query(
        'SELECT * FROM Driver WHERE Driver_ID = $1 AND License = $2', // License as pseudo-password
        [id, password]
      );
    }

    if (result.rows.length > 0) {
      res.json({ message: `Welcome, ${role}!` });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Login error');
  }
});

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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
