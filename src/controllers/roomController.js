import Room from '../models/room.schema.js';
import TypeRoom from '../models/typeRoom.schema.js';
import NotFoundError from '../errors/notFoundError.js'

// Create a new Room
export const createRoom = async (req, res, next) => {
    try {
        // Check if TypeRoom exists
        const typeRoom = await TypeRoom.findById(req.body.TypeId);
        if (!typeRoom) {
            throw new NotFoundError(`Typeroom with id ${typeRoom} doesn't exist`)
        }
        // Create new room
        const newRoom = new Room(req.body);
        await newRoom.save();
        res.status(201).json(newRoom);
    } catch (error) {
        next(error);
    }
};

// Get all Rooms
export const getRooms = async (req, res, next) => {
    try {
        const rooms = await Room.find().populate('TypeId');
        res.status(200).json(rooms);
    } catch (error) {
        next(error);
    }
};

// Get a single Room by ID
export const getRoomById = async (req, res, next) => {
    try {
        const room = await Room.findById(req.params.id).populate('TypeId');
        if (!room) {
            throw new NotFoundError(`Room with id ${req.params.id} doesn't exist`);
        }
        res.status(200).json(room);
    } catch (error) {
        next(error);
    }
};

// Update a Room by ID
export const updateRoom = async (req, res, next) => {
    try {
        // Check if TypeRoom exists
        const typeRoom = await TypeRoom.findById(req.body.TypeId);
        if (!typeRoom) {
            throw new NotFoundError(`Typeroom with id ${typeRoom} doesn't exist`);
        }

        // Update room directly with req.body
        const updatedRoom = await Room.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedRoom) {
            throw new NotFoundError(`Room with id ${req.params.id} doesn't exist`);
        }
        res.status(200).json(updatedRoom);
    } catch (error) {
        next(error);
    }
};

// Delete a Room by ID
export const deleteRoom = async (req, res, next) => {
    try {
        const deletedRoom = await Room.findByIdAndDelete(req.params.id);
        if (!deletedRoom) {
            throw new NotFoundError(`Room with id ${req.params.id} doesn't exist`);
        }
        res.status(200).json();
    } catch (error) {
        next(error);
    }
};
