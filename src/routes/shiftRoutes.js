import express from 'express';
import {
    createShift,
    getAllShifts,
    getShiftById,
    updateShift,
    deleteShift
} from '../controllers/shiftController.js';
import authorizeRoles from '../middlewares/authorizationMiddleware.js';
import { ROLES } from '../models/roles.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Shift:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the shift
 *         shiftName:
 *           type: string
 *           description: Name of the shift
 *           example: "Morning Shift"
 *         startTime:
 *           type: string
 *           description: Start time of the shift in HH:mm format
 *           example: "08:00"
 *         endTime:
 *           type: string
 *           description: End time of the shift in HH:mm format
 *           example: "16:00"
 *       required:
 *         - shiftName
 *         - startTime
 *         - endTime
 */

/**
 * @swagger
 * /api/shifts:
 *   post:
 *     summary: Create a new shift
 *     tags:
 *       - Shifts
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               shiftName:
 *                 type: string
 *                 example: "Morning Shift"
 *                 description: "Name of the shift"
 *               startTime:
 *                 type: string
 *                 example: "08:00"
 *                 description: "Start time of the shift in HH:mm format"
 *               endTime:
 *                 type: string
 *                 example: "16:00"
 *                 description: "End time of the shift in HH:mm format"
 *     responses:
 *       201:
 *         description: Shift created successfully
 *       400:
 *         description: Invalid input data
 */
router.post('/', authorizeRoles(ROLES.ADMIN), createShift);

/**
 * @swagger
 * /api/shifts:
 *   get:
 *     summary: Get all shifts
 *     tags:
 *       - Shifts
 *     responses:
 *       200:
 *         description: A list of all shifts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Shift'
 */
router.get('/', getAllShifts);

/**
 * @swagger
 * /api/shifts/{id}:
 *   get:
 *     summary: Get a specific shift by ID
 *     tags:
 *       - Shifts
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The shift ID
 *     responses:
 *       200:
 *         description: Shift found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Shift'
 *       404:
 *         description: Shift not found
 */
router.get('/:id', getShiftById);

/**
 * @swagger
 * /api/shifts/{id}:
 *   put:
 *     summary: Update a shift by ID
 *     tags:
 *       - Shifts
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The shift ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Shift'
 *     responses:
 *       200:
 *         description: Shift updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Shift'
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Shift not found
 */
router.put('/:id', authorizeRoles(ROLES.ADMIN), updateShift);

/**
 * @swagger
 * /api/shifts/{id}:
 *   delete:
 *     summary: Delete a shift by ID
 *     tags:
 *       - Shifts
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The shift ID
 *     responses:
 *       200:
 *         description: Shift deleted successfully
 *       404:
 *         description: Shift not found
 */
router.delete('/:id', authorizeRoles(ROLES.ADMIN), deleteShift);

export default router;
