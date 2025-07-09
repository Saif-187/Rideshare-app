import express from 'express';
import cors from 'cors';
import { PORT } from './config.js';
import driverRoutes from './routes/driver.js';
import rideRoutes from './routes/ride.js';
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import directionsRouter from './routes/directions.js';


const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use(authRoutes);         // /login, /signup
app.use(profileRoutes);      // /profile
app.use(rideRoutes);         // /request-ride, /accept-ride, /available-rides, /ride-status/:ride_id
app.use('/api/driver', driverRoutes); // /api/driver/update-location, etc.
app.use('/api', directionsRouter);

// 404 for everything else
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
