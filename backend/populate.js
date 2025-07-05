import pool from './db.js';

const seedDB = async () => {
  try {
    // ====== CLEAN EXISTING DATA FOR FRESH START ======
    await pool.query(`
      DELETE FROM Payment;
      DELETE FROM Ride_Riders;
      DELETE FROM Ride_Request;
      DELETE FROM Accident;
      DELETE FROM Rating;
      DELETE FROM Ride;
      DELETE FROM Vehicle;
      DELETE FROM Driver;
      DELETE FROM Rider;
      DELETE FROM Person;
      DELETE FROM Admin;
    `);
    await pool.query(`
      ALTER TABLE Ride ADD COLUMN IF NOT EXISTS Status VARCHAR(32) DEFAULT 'pending';
    `);
    // ===== DUMMY DATA SECTION =====

    // --- Riders ---
    const rider1 = await pool.query(
      `INSERT INTO Person (Email, Name, Phone_Number)
       VALUES ('rider1@email.com', 'Rider One', '9000000001') RETURNING PID`
    );
    const rider2 = await pool.query(
      `INSERT INTO Person (Email, Name, Phone_Number)
       VALUES ('rider2@email.com', 'Rider Two', '9000000002') RETURNING PID`
    );
    const rider1PID = rider1.rows[0].pid;
    const rider2PID = rider2.rows[0].pid;

    await pool.query(
      `INSERT INTO Rider (RID, Password) VALUES 
      ($1, 'rider1pass'), 
      ($2, 'rider2pass')`,
      [rider1PID, rider2PID]
    );

    // --- Drivers ---
    const driver1 = await pool.query(
      `INSERT INTO Person (Email, Name, Phone_Number)
       VALUES ('driver1@email.com', 'Driver One', '9110000001') RETURNING PID`
    );
    const driver2 = await pool.query(
      `INSERT INTO Person (Email, Name, Phone_Number)
       VALUES ('driver2@email.com', 'Driver Two', '9110000002') RETURNING PID`
    );
    const driver1PID = driver1.rows[0].pid;
    const driver2PID = driver2.rows[0].pid;

    await pool.query(
      `INSERT INTO Driver 
        (Driver_ID, Rating, Is_active, License, Current_Latitude, Current_Longitude)
       VALUES
        ($1, 4.8, true, 1001001, 23.780636, 90.419325),  -- Banani, Dhaka
        ($2, 4.6, true, 1001002, 23.777176, 90.399452)   -- Dhanmondi, Dhaka
      `,
      [driver1PID, driver2PID]
    );

    // --- Vehicles ---
    await pool.query(
      `INSERT INTO Vehicle 
        (Vehicle_ID, Driver_ID, License_Plate, Manufacturer, Model, Year, Color, Seats)
       VALUES
        ($1, $1, 'BAN123', 'Toyota', 'Corolla', 2021, 'Blue', 4),
        ($2, $2, 'DHA456', 'Honda', 'Civic', 2022, 'Red', 4)
      `,
      [driver1PID, driver2PID]
    );

    // --- Admin (optional, for completeness) ---
    await pool.query(
      `INSERT INTO Admin (UID, Email, Password) VALUES
        (1, 'admin@email.com', 'adminpass')
      `
    );

    console.log('✅ Dummy drivers, riders, vehicles, and admin inserted!');

  } catch (err) {
    console.error('❌ Error setting up database:', err);
  } finally {
    await pool.end();
  }
};

seedDB();
