// routes/ride.js

import express from 'express';
import { requestRide, getAvailableRides } from '../controllers/rideController.js';
// import { authenticateJWT } from '../middleware/authenticateJWT.js'; // Uncomment if using JWT authentication

const router = express.Router();

// Route to request a new ride (rider)
router.post('/request-ride', /* authenticateJWT, */ requestRide);

// Route for drivers to get all available ride requests
router.get('/available-rides', getAvailableRides);

export default router;
