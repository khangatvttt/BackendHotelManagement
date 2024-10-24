import express from 'express';
import {
    createBooking,
    getBookings,
    getBookingById,
    updateBooking,
    deleteBooking
} from '../controllers/bookingController.js';

const router = express.Router();

// Create a new Booking
router.post('/bookings', createBooking);

// Get all Bookings
router.get('/bookings', getBookings);

// Get a single Booking by ID
router.get('/bookings/:id', getBookingById);

// Update a Booking by ID
router.put('/bookings/:id', updateBooking);

// Delete a Booking by ID
router.delete('/bookings/:id', deleteBooking);

export default router;
