import express from 'express';
import cors from 'cors';
import { PORT } from './config.js';

import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';

const app = express();

app.use(cors());
app.use(express.json());

// Mount your routes (order doesn't matter unless there's overlap)
app.use(authRoutes);     // Handles /login, /signup, etc.
app.use(profileRoutes);  // Handles /profile and similar

// You can add a catch-all 404 if you like:
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
