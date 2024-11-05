import express from 'express';
import {
    createRoom,
    getRooms,
    getRoomById,
    updateRoom,
    getBookedTimeOfRoom
} from '../controllers/roomController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Rooms
 *   description: Room management API
 */

/**
 * @swagger
 * /rooms:
 *   post:
 *     summary: Create a new room
 *     tags: [Rooms]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               roomNumber:
 *                 type: string
 *                 example: "101"
 *               typeId:
 *                 type: string
 *                 example: "60f7d93d2b4f4c001ed1f4c7"
 *               description:
 *                 type: string
 *                 example: "A spacious deluxe room"
 *               status:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Room created successfully
 *         content:
 *           application/json:
 *             example:
 *               _id: "60f7d93d2b4f4c001ed1f4c8"
 *               roomNumber: "101"
 *               typeId: "60f7d93d2b4f4c001ed1f4c7"
 *               description: "A spacious deluxe room"
 *               status: true
 *       404:
 *         description: TypeRoom not found
 *       400:
 *         description: Bad request
 */
router.post('/', createRoom);

/**
 * @swagger
 * /rooms:
 *   get:
 *     summary: Retrieve all rooms
 *     tags: [Rooms]
 *     parameters:
 *       - in: query
 *         name: typeId
 *         schema:
 *           type: string
 *         description: Filter rooms by type ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: boolean
 *         description: Filter rooms by status
 *     responses:
 *       200:
 *         description: A list of rooms
 *         content:
 *           application/json:
 *             example:
 *               - _id: "60f7d93d2b4f4c001ed1f4c8"
 *                 roomNumber: "101"
 *                 typeId:
 *                   _id: "60f7d93d2b4f4c001ed1f4c7"
 *                   images: ["image1.jpg", "image2.jpg"]
 *                   typename: "Deluxe Room"
 *                 description: "A spacious deluxe room"
 *                 status: true
 */
router.get('/', getRooms);

/**
 * @swagger
 * /rooms/{id}:
 *   get:
 *     summary: Retrieve a room by ID
 *     tags: [Rooms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The room ID
 *     responses:
 *       200:
 *         description: Room details
 *         content:
 *           application/json:
 *             example:
 *               _id: "60f7d93d2b4f4c001ed1f4c8"
 *               roomNumber: "101"
 *               typeId:
 *                 _id: "60f7d93d2b4f4c001ed1f4c7"
 *                 images: ["image1.jpg", "image2.jpg"]
 *                 typename: "Deluxe Room"
 *               description: "A spacious deluxe room"
 *               status: true
 *       404:
 *         description: Room not found
 */
router.get('/:id', getRoomById);

/**
 * @swagger
 * /rooms/{id}:
 *   put:
 *     summary: Update a room by ID
 *     tags: [Rooms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The room ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               roomNumber:
 *                 type: string
 *                 example: "101"
 *               typeId:
 *                 type: string
 *                 example: "60f7d93d2b4f4c001ed1f4c7"
 *               description:
 *                 type: string
 *                 example: "A spacious deluxe room"
 *               status:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Room updated successfully
 *         content:
 *           application/json:
 *             example:
 *               _id: "60f7d93d2b4f4c001ed1f4c8"
 *               roomNumber: "101"
 *               typeId: "60f7d93d2b4f4c001ed1f4c7"
 *               description: "An updated spacious deluxe room"
 *               status: true
 *       404:
 *         description: Room or TypeRoom not found
 *       400:
 *         description: Bad request
 */
router.put('/:id', updateRoom);

/**
 * @swagger
 * /rooms/{id}/unavailableTime:
 *   get:
 *     summary: Get unavailable booking times for a room
 *     tags: [Rooms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The room ID
 *     responses:
 *       200:
 *         description: A list of unavailable times
 *         content:
 *           application/json:
 *             example:
 *               - checkInTime: "2023-08-01T14:00:00.000Z"
 *                 checkOutTime: "2023-08-02T11:00:00.000Z"
 *               - checkInTime: "2023-08-05T14:00:00.000Z"
 *                 checkOutTime: "2023-08-06T11:00:00.000Z"
 *       404:
 *         description: Room not found
 *       400:
 *         description: Bad Request
 */
router.get('/:id/unavailableTime', getBookedTimeOfRoom);

export default router;
