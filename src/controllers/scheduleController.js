import Joi from 'joi';
import Schedule from '../models/schedule.schema.js';
import { User } from '../models/user.schema.js';
import NotFoundError from '../errors/notFoundError.js';
import Shift from '../models/shift.schema.js'
import { ROLES } from '../models/roles.js';
import BadRequestError from '../errors/badRequestError.js';
import mongoose, { set } from 'mongoose';

// Create a new schedule
export const createSchedule = async (req, res, next) => {
    try {
        const schemaBody = Joi.object({
            userId: Joi.string().required(),
            workDate: Joi.date().required(),
            shiftId: Joi.string().required()
        });

        const { error } = schemaBody.validate(req.body);

        if (error) {
            throw error;
        }

        const data = req.body;

        data.workDate = new Date(data.workDate).setUTCHours(0, 0, 0, 0)

        const user = await User.findById(data.userId);
        if (!user) {
            throw new NotFoundError(`User with id ${data.userId} doesn't exist`)
        }
        if (user.role != ROLES.STAFF) {
            console.log(user)
            console.log(ROLES.STAFF)
            throw new BadRequestError(`User with id ${data.userId} is not a Staff`)
        }

        const shift = await Shift.findById(data.shiftId);
        if (!shift) {
            throw new NotFoundError(`Shift with id ${data.shiftId} doesn't exist`)
        }

        const schedule = new Schedule(data);
        const savedSchedule = await schedule.save();
        res.status(201).json(savedSchedule);
    } catch (error) {
        // Duplicate error of mongoose
        if (error.code === 11000) {
            return next(new BadRequestError('This user has been scheduled for this shift in this date'));
        }
        next(error);
    }
};

// Get all schedules
export const getAllSchedules = async (req, res, next) => {
    try {
        const schemaQuery = Joi.object({
            startDate: Joi.string().isoDate().optional(),
            endDate: Joi.string().isoDate().optional(),
            userId: Joi.string().optional(),
        }).and('startDate', 'endDate');

        const { error } = schemaQuery.validate(req.query);
        if (error) {
            throw error;
        }

        const { startDate, endDate, userId } = req.query

        let matchConditions = {};

        // Conditionally add filters to the match object
        if (startDate && endDate) {
            matchConditions.workDate = { $gte: new Date(startDate), $lt: new Date(endDate) };
        }
        if (userId) {
            matchConditions.userId = new mongoose.Types.ObjectId(userId);
        }

        const pipeline = [];

        if (Object.keys(matchConditions).length > 0) {
            pipeline.push({
                $match: matchConditions
            });
        }
        pipeline.push({
            $group: {
                _id: {
                    userId: "$userId",
                    workDate: "$workDate"
                },
                shifts: { $push: "$shiftId" },
                totalShifts: { $sum: 1 }
            }
        });

        pipeline.push({
            $project: {
                schedule: "$_id",
                shifts: 1,
                _id: 0,
            }
        });

        const result = await Schedule.aggregate(pipeline);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

// Get a single schedule by ID
export const getScheduleById = async (req, res, next) => {
    try {
        const schedule = await Schedule.findById(req.params.id);
        if (!schedule){
            throw new NotFoundError(`Schedule with id ${req.params.id} doesn't exist`);
        }
        
        res.status(200).json(schedule);
    } catch (error) {
        next(error);
    }
};

// Update a schedule

export const updateSchedule = async (req, res, next) => {
    try {
        const {status} = req.body
        const schedule = await Schedule.findByIdAndUpdate(req.params.id, {status}, { new: true, runValidators: true });
        if (!schedule){
            throw new NotFoundError(`Schedule with id ${req.params.id} doesn't exist`);
        }
        res.status(200).json(schedule);
    } catch (error) {
        next(error);
    }
};

// Delete a schedule
export const deleteSchedule = async (req, res, next) => {
    try {
        const schedule = await Schedule.findByIdAndDelete(req.params.id);
        if (!schedule){
            throw new NotFoundError(`Schedule with id ${req.params.id} doesn't exist`);
        }        
        res.status(200).send();
    } catch (error) {
        next(error);
    }
};
