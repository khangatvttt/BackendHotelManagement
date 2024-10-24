import express from 'express';
import {
    createPromotion,
    getPromotions,
    getPromotionById,
    updatePromotion,
    deletePromotion
} from '../controllers/promotionController.js';

const router = express.Router();

// Create a new Promotion
router.post('/promotions', createPromotion);

// Get all Promotions
router.get('/promotions', getPromotions);

// Get a single Promotion by ID
router.get('/promotions/:id', getPromotionById);

// Update a Promotion by ID
router.put('/promotions/:id', updatePromotion);

// Delete a Promotion by ID
router.delete('/promotions/:id', deletePromotion);

export default router;
