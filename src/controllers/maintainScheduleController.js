import MaintainSchedule from '../models/maintainSchedule.schema.js';
import Room from '../models/room.schema.js';
import NotFoundError from '../errors/notFoundError.js';

// Create a new MaintainSchedule
export const createMaintainSchedule = async (req, res, next) => {
    try {
        // Check if Room exists
        const room = await Room.findById(req.body.RoomID);
        if (!room) {
            throw new NotFoundError(`Room with id ${req.body.RoomID} doesn't exist`);
        }

        // Create new maintain schedule
        const newSchedule = new MaintainSchedule(req.body);
        await newSchedule.save();
        res.status(201).json(newSchedule);
    } catch (error) {
        next(error);
    }
};

// Get all MaintainSchedules
export const getMaintainSchedules = async (req, res, next) => {
    try {
        const schedules = await MaintainSchedule.find().populate('RoomID');
        res.status(200).json(schedules);
    } catch (error) {
        next(error);
    }
};

// Get a single MaintainSchedule by ID
export const getMaintainScheduleById = async (req, res, next) => {
    try {
        const schedule = await MaintainSchedule.findById(req.params.id).populate('RoomID');
        if (!schedule) {
            throw new NotFoundError(`MaintainSchedule with id ${req.params.id} doesn't exist`);
        }
        res.status(200).json(schedule);
    } catch (error) {
        next(error);
    }
};

// Update a MaintainSchedule by ID
export const updateMaintainSchedule = async (req, res, next) => {
    try {
        // Check if Room exists
        const room = await Room.findById(req.body.RoomID);
        if (!room) {
            throw new NotFoundError(`Room with id ${req.body.RoomID} doesn't exist`);
        }

        // Update the maintain schedule
        const updatedSchedule = await MaintainSchedule.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedSchedule) {
            throw new NotFoundError(`MaintainSchedule with id ${req.params.id} doesn't exist`);
        }
        res.status(200).json(updatedSchedule);
    } catch (error) {
        next(error);
    }
};

// Delete a MaintainSchedule by ID
export const deleteMaintainSchedule = async (req, res, next) => {
    try {
        const deletedSchedule = await MaintainSchedule.findByIdAndDelete(req.params.id);
        if (!deletedSchedule) {
            throw new NotFoundError(`MaintainSchedule with id ${req.params.id} doesn't exist`);
        }
        res.status(200).json();
    } catch (error) {
        next(error);
    }
};
