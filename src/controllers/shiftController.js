import Joi from 'joi';
import Shift from '../models/shift.schema.js';
import BadRequestError from '../errors/badRequestError.js'
import NotFoundError from '../errors/badRequestError.js';

// Create a new shift
export const createShift = async (req, res, next) => {
    try {
        const { shiftName, startTime, endTime } = req.body;

        const schemaBody = Joi.object({
            shiftName: Joi.string().required(),
            startTime: Joi.string()
                .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
                .required()
                .messages({
                    'string.pattern.base': 'startTime must be in the format hh:mm and a valid time in day',
                }),
            endTime: Joi.string()
                .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
                .required()
                .messages({
                    'string.pattern.base': 'endTime must be in the format hh:mm and a valid time in day',
                })
        });

        const { error, _ } = schemaBody.validate(req.body)
        if (error) {
            throw new BadRequestError(error.message)
        }

        if (!isValidStartEndTime(startTime, endTime)) {
            throw new BadRequestError('startTime must be before endTime')
        }


        const newShift = new Shift({ shiftName, startTime, endTime });
        const savedShift = await newShift.save();
        res.status(201).json(savedShift);
    } catch (error) {
        next(error);
    }
};

// Get all shifts
export const getAllShifts = async (req, res, next) => {
    try {
        const shifts = await Shift.find();
        res.status(200).json(shifts);
    } catch (error) {
        next(error);
    }
};

// Get a specific shift by ID
export const getShiftById = async (req, res, next) => {
    try {
        const shift = await Shift.findById(req.params.id);
        if (!shift) return res.status(404).json({ message: "Shift not found" });
        res.status(200).json(shift);
    } catch (error) {
        next(error);
    }
};

// Update a shift by ID
export const updateShift = async (req, res, next) => {
    try {
        const schemaBody = Joi.object({
            shiftName: Joi.string().optional(),
            startTime: Joi.string()
                .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
                .optional()
                .messages({
                    'string.pattern.base': 'startTime must be in the format hh:mm and a valid time in day',
                }),
            endTime: Joi.string()
                .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
                .optional()
                .messages({
                    'string.pattern.base': 'endTime must be in the format hh:mm and a valid time in day',
                })
        });

        const { error, _ } = schemaBody.validate(req.body)
        if (error) {
            throw new BadRequestError(error.message)
        }

        const { endTime, startTime } = req.body

        const shift = await Shift.findById(req.params.id);
        if (!shift) {
            throw new NotFoundError(`Shift with id ${req.params.id} doesn't exist`)
        };

        if (!isValidStartEndTime(startTime ? startTime : shift.startTime, endTime ? endTime : shift.endTime)) {
            throw new BadRequestError('startTime must be before endTime');
        }

        const updatedShift = await Shift.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedShift) {
            throw new NotFoundError(`Shift with id ${req.params.id} doesn't exist`)
        };
        res.status(200).json(updatedShift);
    } catch (error) {
        next(error);
    }
};

// Delete a shift by ID
export const deleteShift = async (req, res) => {
    try {
        const deletedShift = await Shift.findByIdAndDelete(req.params.id);
        if (!deletedShift) return res.status(404).json({ message: "Shift not found" });
        res.status(200).send();
    } catch (error) {
        next(error);
    }
};

const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};

const isValidStartEndTime = (startTime, endTime) => {
    const startTimeMinutes = timeToMinutes(startTime);
    const endTimeMinutes = timeToMinutes(endTime);
    if (startTimeMinutes >= endTimeMinutes) {
        return false;
    }
    return true;
}