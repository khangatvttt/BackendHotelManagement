import Voucher from '../models/voucher.schema.js';
import NotFoundError from '../errors/notFoundError.js';
import BadRequestError from '../errors/badRequestError.js';

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
        const { available, totalAmount } = req.query;
        const query = {};

        if (available === 'true') {
            query.startDate = { $lte: new Date() };
            query.endDate = { $gt: new Date() };
        }

        if (totalAmount !== undefined) {
            const parsedTotalAmount = parseFloat(totalAmount);
            query.minSpend = { $lte: parsedTotalAmount };
        }

        const vouchers = await Voucher.find(query).lean();

        const processedVouchers = vouchers.filter(voucher => {
            // Reach limit or this user is already used it
            if (voucher.userUsedVoucher.length >= voucher.limit || voucher.userUsedVoucher.includes(req.user.id)) {
                return false;
            } else {
                voucher.remainingUses = voucher.limitUse - voucher.userUsedVoucher.length;
                return true;
            }
        });

        res.status(200).json(processedVouchers);
    } catch (error) {
        next(error);
    }
};

// Get a single Voucher by ID
export const getVoucher = async (req, res, next) => {
    try {
        const voucher = await Voucher.findById(req.params.id);
        if (!voucher) {
            throw new NotFoundError(`Voucher with id ${req.params.id} doesn't exist`);
        }
        res.status(200).json(voucher);
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

export const getAvailableVouchers = async (req, res, next) => {
    try {
        const availableVouchers = await Voucher.find({
            startDate: { $lte: Date.now() },
            endDate: { $gt: Date.now() },
            minSpend: { $lt: req.query.totalAmount }
        });
        res.status(200).json(availableVouchers)
    }
    catch (error) {
        console.log(error)
        next(error)
    }

};
