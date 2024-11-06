import express from 'express';
import {
    createRating,
    getAllRatings,
    getRatingById,
    updateRating,
    deleteRating
} from '../controllers/ratingController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Rating
 *   description: APi for managing ratings
 */

/**
 * @swagger
 * /api/rating:
 *   post:
 *     summary: Create a new rating
 *     tags: [Rating]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - excessGuests
 *               - extraCharge
 *             properties:
 *               bookingId:
 *                 type: string
 *                 example: 671f138dc45752411d1c232e
 *               typeRoomId:
 *                 type: string
 *                 example: 671f138dc45752411d1c232e
 *               score:
 *                 type: number
 *                 description: From 1 to 5, accept half-of-interger or interger
 *                 example: 1.5
 *               feedback:
 *                 type: string
 *                 example: Good
 *     responses:
 *       201:
 *         description: Rating created successfully
 *       500:
 *         description: Internal server error
 */
router.post('/', createRating);

/**
 * @swagger
 * /api/rating:
 *   get:
 *     summary: Get all ratings
 *     tags: [Rating]
 *     responses:
 *       200:
 *         description: List of all ratings
 *       500:
 *         description: Internal server error
 */
router.get('/', getAllRatings);

/**
 * @swagger
 * /rating/{id}:
 *   get:
 *     summary: Get a rating by ID
 *     tags: [Rating]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The rating ID
 *     responses:
 *       200:
 *         description: Rating details
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', getRatingById);

/**
 * @swagger
 * /api/rating/{id}:
 *   put:
 *     summary: Update a rating by ID
 *     tags: [Rating]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The rating ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               excessGuests:
 *                 type: integer
 *                 example: 3
 *               extraCharge:
 *                 type: number
 *                 example: 600
 *     responses:
 *       200:
 *         description: Rating updated successfully
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', updateRating);

/**
 * @swagger
 * /rating/{id}:
 *   delete:
 *     summary: Delete a rating by ID
 *     tags: [Rating]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The rating ID
 *     responses:
 *       200:
 *         description: Charge deleted successfully
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', deleteRating);

export default router;
