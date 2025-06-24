import pool from '../db.js';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config.js';

export const login = async (req, res) => {
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
      const token = jwt.sign(userData, JWT_SECRET, { expiresIn: '2h' });
      res.json({ message: `Welcome, ${role}!`, token });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Login error');
  }
};

export const signup = async (req, res) => {
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
};
