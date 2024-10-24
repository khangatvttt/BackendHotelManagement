import Promotion from '../models/promotion.schema.js';
import NotFoundError from '../errors/notFoundError.js';

// Create a new Promotion
export const createPromotion = async (req, res, next) => {
    try {
        // Create a new promotion
        const newPromotion = new Promotion(req.body);
        await newPromotion.save();
        res.status(201).json(newPromotion);
    } catch (error) {
        next(error);
    }
};

// Get all Promotions
export const getPromotions = async (req, res, next) => {
    try {
        const promotions = await Promotion.find();
        res.status(200).json(promotions);
    } catch (error) {
        next(error);
    }
};

// Get a single Promotion by ID
export const getPromotionById = async (req, res, next) => {
    try {
        const promotion = await Promotion.findById(req.params.id);
        if (!promotion) {
            throw new NotFoundError(`Promotion with id ${req.params.id} doesn't exist`);
        }
        res.status(200).json(promotion);
    } catch (error) {
        next(error);
    }
};

// Update a Promotion by ID
export const updatePromotion = async (req, res, next) => {
    try {
        const updatedPromotion = await Promotion.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedPromotion) {
            throw new NotFoundError(`Promotion with id ${req.params.id} doesn't exist`);
        }
        res.status(200).json(updatedPromotion);
    } catch (error) {
        next(error);
    }
};

// Delete a Promotion by ID
export const deletePromotion = async (req, res, next) => {
    try {
        const deletedPromotion = await Promotion.findByIdAndDelete(req.params.id);
        if (!deletedPromotion) {
            throw new NotFoundError(`Promotion with id ${req.params.id} doesn't exist`);
        }
        res.status(200).json();
    } catch (error) {
        next(error);
    }
};
