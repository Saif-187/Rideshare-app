// index.js

import express from 'express';
import cors from 'cors';
import { PORT } from './config.js';

import rideRoutes from './routes/ride.js';
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';

const app = express();

app.use(cors());
app.use(express.json());

// Mount modular routes
app.use(authRoutes);     // Handles /login, /signup, etc.
app.use(profileRoutes);  // Handles /profile and similar
app.use(rideRoutes);     // Handles /request-ride, /available-rides, etc.

// Optional: Catch-all for undefined routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
