import express from 'express';
import {
    createOverOccupancyCharge,
    getAllOverOccupancyCharges,
    getOverOccupancyChargeById,
    updateOverOccupancyCharge,
    deleteOverOccupancyCharge
} from '../controllers/overOccupancyChargeController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: OverOccupancyCharge
 *   description: APi for managing over-occupancy charge
 */

/**
 * @swagger
 * /api/over-occupancy-charges:
 *   post:
 *     summary: Create a new over occupancy charge
 *     tags: [OverOccupancyCharge]
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
 *               excessGuests:
 *                 type: integer
 *                 example: 2
 *               extraCharge:
 *                 type: number
 *                 example: 50
 *     responses:
 *       201:
 *         description: Over occupancy charge created successfully
 *       500:
 *         description: Internal server error
 */
router.post('/', createOverOccupancyCharge);

/**
 * @swagger
 * /api/over-occupancy-charges:
 *   get:
 *     summary: Get all over occupancy charges
 *     tags: [OverOccupancyCharge]
 *     responses:
 *       200:
 *         description: List of all over occupancy charges
 *       500:
 *         description: Internal server error
 */
router.get('/', getAllOverOccupancyCharges);

/**
 * @swagger
 * /over-occupancy-charges/{id}:
 *   get:
 *     summary: Get an over occupancy charge by ID
 *     tags: [OverOccupancyCharge]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The over occupancy charge ID
 *     responses:
 *       200:
 *         description: Over occupancy charge details
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', getOverOccupancyChargeById);

/**
 * @swagger
 * /api/over-occupancy-charges/{id}:
 *   put:
 *     summary: Update an over occupancy charge by ID
 *     tags: [OverOccupancyCharge]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The over occupancy charge ID
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
 *         description: Over occupancy charge updated successfully
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', updateOverOccupancyCharge);

/**
 * @swagger
 * /over-occupancy-charges/{id}:
 *   delete:
 *     summary: Delete an over occupancy charge by ID
 *     tags: [OverOccupancyCharge]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The over occupancy charge ID
 *     responses:
 *       200:
 *         description: Charge deleted successfully
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', deleteOverOccupancyCharge);

export default router;
