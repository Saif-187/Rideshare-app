import pool from './db.js';

const seedDB = async () => {
  try {
    await pool.query(`
      -- Drop existing tables for clean setup (optional for dev/testing)
      DROP TABLE IF EXISTS Ride_Riders, Payment, Accident, Ride_Request, Rating, Ride, Vehicle, Driver, Rider, Motorcycle, Car, Microbus, Admin, Person CASCADE;

      -- Person table (auto ID)
      CREATE TABLE Person (
        PID BIGSERIAL PRIMARY KEY,
        Email VARCHAR(255) UNIQUE NOT NULL,
        Name VARCHAR(255) NOT NULL,
        Phone_Number VARCHAR(20) UNIQUE NOT NULL
      );

      -- Rider table
      CREATE TABLE IF NOT EXISTS Rider (
        RID BIGINT PRIMARY KEY REFERENCES Person(PID),
        Created_at DATE DEFAULT CURRENT_DATE,
        Password VARCHAR(255)
      );

      -- Driver table
      CREATE TABLE IF NOT EXISTS Driver (
        Driver_ID BIGINT PRIMARY KEY REFERENCES Person(PID),
        Rating FLOAT,
        Is_active BOOLEAN,
        License BIGINT
      );

      -- Vehicle table
      CREATE TABLE IF NOT EXISTS Vehicle (
        Vehicle_ID BIGINT PRIMARY KEY,
        Driver_ID BIGINT REFERENCES Driver(Driver_ID),
        License_Plate VARCHAR(255),
        Manufacturer VARCHAR(255),
        Model VARCHAR(255),
        Year INT,
        Color VARCHAR(255),
        Seats INT
      );

      -- Ride-related tables
      CREATE TABLE IF NOT EXISTS Ride (
        Ride_ID BIGSERIAL PRIMARY KEY,
        Vehicle_ID BIGINT REFERENCES Vehicle(Vehicle_ID),
        Pick_up BIGINT,
        Drop_off BIGINT,
        History_ID BIGINT,
        Is_Shared BOOLEAN,
        Start_Time TIMESTAMP,
        End_Time TIMESTAMP,
        Fare FLOAT,
        Start_Latitude FLOAT,
        Start_Longitude FLOAT,
        End_Latitude FLOAT,
        End_Longitude FLOAT,
        Start_Location VARCHAR(255),
        End_Location VARCHAR(255)
      );

      CREATE TABLE IF NOT EXISTS Rating (
        Rating_ID BIGSERIAL PRIMARY KEY,
        Ride_ID BIGINT REFERENCES Ride(Ride_ID),
        Rating_Value FLOAT,
        Comment VARCHAR(255),
        Time TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS Ride_Request (
        Request_ID BIGSERIAL PRIMARY KEY,
        Ride_ID BIGINT REFERENCES Ride(Ride_ID)
      );

      CREATE TABLE IF NOT EXISTS Accident (
        Accident_ID BIGSERIAL PRIMARY KEY,
        Ride_ID BIGINT REFERENCES Ride(Ride_ID),
        Time TIME,
        Latitude FLOAT,
        Longitude FLOAT,
        Location VARCHAR(255)
      );

      CREATE TABLE IF NOT EXISTS Ride_Riders (
        Ride_Riders_ID BIGSERIAL PRIMARY KEY,
        Rider_ID BIGINT REFERENCES Rider(RID),
        Ride_ID BIGINT REFERENCES Ride(Ride_ID)
      );

      CREATE TABLE IF NOT EXISTS Payment (
        Payment_ID BIGSERIAL PRIMARY KEY,
        Ride_ID BIGINT REFERENCES Ride(Ride_ID),
        Amount FLOAT,
        Method VARCHAR(255),
        Status VARCHAR(255),
        Time TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS Motorcycle (
        Bike_ID BIGSERIAL PRIMARY KEY,
        KickStart BOOLEAN,
        Type VARCHAR(255)
      );

      CREATE TABLE IF NOT EXISTS Car (
        Car_ID BIGSERIAL PRIMARY KEY,
        AC BOOLEAN
      );

      CREATE TABLE IF NOT EXISTS Microbus (
        Bus_ID BIGSERIAL PRIMARY KEY,
        Roof_Rack BOOLEAN,
        AC BOOLEAN
      );

      CREATE TABLE IF NOT EXISTS Admin (
        Admin_ID BIGSERIAL PRIMARY KEY,
        UID BIGINT,
        Email VARCHAR(255),
        Password VARCHAR(255)
      );
    `);

    // Insert dummy users for login testing
    const alice = await pool.query(
      `INSERT INTO Person (Email, Name, Phone_Number)
       VALUES ('alice@example.com', 'Alice Wonderland', '0123456789')
       RETURNING PID`
    );
    const bob = await pool.query(
      `INSERT INTO Person (Email, Name, Phone_Number)
       VALUES ('bob@example.com', 'Bob Builder', '0987654321')
       RETURNING PID`
    );

    const aliceID = alice.rows[0].pid;
    const bobID = bob.rows[0].pid;

    await pool.query(
      `INSERT INTO Rider (RID, Password) VALUES
       ($1, 'alicepass'), ($2, 'bobpass')`,
      [aliceID, bobID]
    );

    await pool.query(
      `INSERT INTO Driver (Driver_ID, Rating, Is_active, License) VALUES
       ($1, 4.9, TRUE, 123123),
       ($2, 4.7, TRUE, 456456)`,
      [aliceID, bobID]
    );

    await pool.query(
      `INSERT INTO Vehicle (Vehicle_ID, Driver_ID, License_Plate, Manufacturer, Model, Year, Color, Seats) VALUES
       ($1, $1, 'ALICE123', 'Toyota', 'Corolla', 2020, 'Blue', 4),
       ($2, $2, 'BOB456', 'Honda', 'Civic', 2019, 'Red', 4)`,
      [aliceID, bobID]
    );

    console.log('✅ All tables created and test users inserted successfully!');
  } catch (err) {
    console.error('❌ Error setting up database:', err);
  } finally {
    await pool.end();
  }
};

seedDB();
