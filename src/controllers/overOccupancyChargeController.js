import NotFoundError from '../errors/badRequestError.js';
import OverOccupancyCharge from '../models/overOccupancyCharge.schema.js';

export const createOverOccupancyCharge = async (req, res, next) => {
    try {
        const { excessGuests, extraCharge } = req.body;
        const overOccupancyCharge = new OverOccupancyCharge({ excessGuests, extraCharge });
        await overOccupancyCharge.save();
        res.status(201).send(overOccupancyCharge);
    } catch (error) {
        next(error);
    }
};

export const getAllOverOccupancyCharges = async (req, res, next) => {
    try {
        const overOccupancyCharges = await OverOccupancyCharge.find();
        res.status(200).json(overOccupancyCharges);
    } catch (error) {
        next(error);
    }
};

// Get a single OverOccupancyCharge by ID
export const getOverOccupancyChargeById = async (req, res, next) => {
    try {
        const overOccupancyCharge = await OverOccupancyCharge.findById(req.params.id);
        if (!overOccupancyCharge){
            NotFoundError(`Charge with id ${req.params.id} doesn't exist`);
        }
        res.status(200).json(overOccupancyCharge);
    } catch (error) {
        next(MediaError)
    }
};

// Update an OverOccupancyCharge by ID
export const updateOverOccupancyCharge = async (req, res, next) => {
    try {
        const { excessGuests, extraCharge } = req.body;
        const overOccupancyCharge = await OverOccupancyCharge.findByIdAndUpdate(
            req.params.id,
            { excessGuests, extraCharge },
            { new: true, runValidators: true}
        );
        if (!overOccupancyCharge){
            NotFoundError(`Charge with id ${req.params.id} doesn't exist`);
        }
        res.status(200).send(overOccupancyCharge);
    } catch (error) {
        next(error);
    }
};

// Delete an OverOccupancyCharge by ID
export const deleteOverOccupancyCharge = async (req, res, next) => {
    try {
        const overOccupancyCharge = await OverOccupancyCharge.findByIdAndDelete(req.params.id);
        if (!overOccupancyCharge){
            NotFoundError(`Charge with id ${req.params.id} doesn't exist`);
        }
        res.status(200).send()
    } catch (error) {
        next(error);
    }
};
