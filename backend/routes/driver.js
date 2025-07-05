import express from 'express';
import { updateDriverLocation, getDriverLocation } from '../controllers/driverController.js';
import { authenticateJWT } from '../middleware/AuthenticateJWT.js';

const router = express.Router();

// PATCH /api/driver/location (Driver updates their current location)
router.patch('/location', authenticateJWT, updateDriverLocation);

// GET /api/driver/location?driver_id=... (Anyone can fetch a driver's current location)
router.get('/location', getDriverLocation);

export default router;
