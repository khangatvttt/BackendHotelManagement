import Booking from '../models/booking.schema.js';
import Room from '../models/room.schema.js';
import User from '../models/user.schema.js'; // Ensure this exists
import NotFoundError from '../errors/notFoundError.js';

// Create a new Booking
export const createBooking = async (req, res, next) => {
    try {
        // Check if User exists
        const user = await User.findById(req.body.UserID);
        if (!user) {
            throw new NotFoundError(`User with id ${req.body.UserID} doesn't exist`);
        }

        // Check if Rooms exist
        const rooms = await Room.find({ '_id': { $in: req.body.RoomID } });
        if (rooms.length !== req.body.RoomID.length) {
            throw new NotFoundError(`One or more Room IDs do not exist`);
        }

        // Create new booking
        const newBooking = new Booking(req.body);
        await newBooking.save();
        res.status(201).json(newBooking);
    } catch (error) {
        next(error);
    }
};

// Get all Bookings
export const getBookings = async (req, res, next) => {
    try {
        const bookings = await Booking.find()
            .populate('UserID')
            .populate('RoomID');
        res.status(200).json(bookings);
    } catch (error) {
        next(error);
    }
};

// Get a single Booking by ID
export const getBookingById = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('UserID')
            .populate('RoomID');
        if (!booking) {
            throw new NotFoundError(`Booking with id ${req.params.id} doesn't exist`);
        }
        res.status(200).json(booking);
    } catch (error) {
        next(error);
    }
};

// Update a Booking by ID
export const updateBooking = async (req, res, next) => {
    try {
        // Check if User exists
        const user = await User.findById(req.body.UserID);
        if (!user) {
            throw new NotFoundError(`User with id ${req.body.UserID} doesn't exist`);
        }

        // Check if Rooms exist
        const rooms = await Room.find({ '_id': { $in: req.body.RoomID } });
        if (rooms.length !== req.body.RoomID.length) {
            throw new NotFoundError(`One or more Room IDs do not exist`);
        }

        // Update the booking
        const updatedBooking = await Booking.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedBooking) {
            throw new NotFoundError(`Booking with id ${req.params.id} doesn't exist`);
        }
        res.status(200).json(updatedBooking);
    } catch (error) {
        next(error);
    }
};

// Delete a Booking by ID
export const deleteBooking = async (req, res, next) => {
    try {
        const deletedBooking = await Booking.findByIdAndDelete(req.params.id);
        if (!deletedBooking) {
            throw new NotFoundError(`Booking with id ${req.params.id} doesn't exist`);
        }
        res.status(200).json();
    } catch (error) {
        next(error);
    }
};
