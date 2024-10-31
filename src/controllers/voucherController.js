import Voucher from '../models/voucher.schema.js';
import NotFoundError from '../errors/notFoundError.js';

// Create a new Voucher
export const createVoucher = async (req, res, next) => {
    try {
        // Create a new Voucher
        const newVoucher = new Voucher(req.body);
        await newVoucher.save();
        res.status(201).json(newVoucher);
    } catch (error) {
        next(error);
    }
};

// Get all Vouchers
export const getVouchers = async (req, res, next) => {
    try {
        const Vouchers = await Voucher.find();
        res.status(200).json(Vouchers);
    } catch (error) {
        next(error);
    }
};

// Get a single Voucher by ID
export const getVoucher = async (req, res, next) => {
    try {
        const Voucher = await Voucher.findById(req.params.id);
        if (!Voucher) {
            throw new NotFoundError(`Voucher with id ${req.params.id} doesn't exist`);
        }
        res.status(200).json(Voucher);
    } catch (error) {
        next(error);
    }
};

// Update a Voucher by ID
export const updateVoucher = async (req, res, next) => {
    try {
        const updatedVoucher = await Voucher.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedVoucher) {
            throw new NotFoundError(`Voucher with id ${req.params.id} doesn't exist`);
        }
        res.status(200).json(updatedVoucher);
    } catch (error) {
        next(error);
    }
};

// Delete a Voucher by ID
export const deleteVoucher = async (req, res, next) => {
    try {
        const deletedVoucher = await Voucher.findByIdAndDelete(req.params.id);
        if (!deletedVoucher) {
            throw new NotFoundError(`Voucher with id ${req.params.id} doesn't exist`);
        }
        res.status(200).json();
    } catch (error) {
        next(error);
    }
};
