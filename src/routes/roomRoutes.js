import express from 'express';
import {
    createRoom,
    getRooms,
    getRoomById,
    updateRoom,
    getBookedTimeOfRoom,
    getTopRatedRoom,
    getRoomTypeAvailability,
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
 * /api/rooms:
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
 * /api/rooms:
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
 *         description: Filter rooms by status (true for active, false for inactive)
 *       - in: query
 *         name: size
 *         description: The number of elements per page (maximum 10)
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         description: The page number to return
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of rooms with pagination metadata
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 metadata:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                       description: The current page number
 *                     sizeEachPage:
 *                       type: integer
 *                       description: The number of rooms per page
 *                     totalElements:
 *                       type: integer
 *                       description: The total number of rooms
 *                     totalPages:
 *                       type: integer
 *                       description: The total number of pages
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: The unique identifier of the room
 *                       roomNumber:
 *                         type: string
 *                         description: The room number
 *                       typeId:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             description: The type ID of the room
 *                           images:
 *                             type: array
 *                             items:
 *                               type: string
 *                             description: List of image URLs for the room
 *                           typename:
 *                             type: string
 *                             description: The type name of the room (e.g., Deluxe Room)
 *                       description:
 *                         type: string
 *                         description: A brief description of the room
 *                       status:
 *                         type: boolean
 *                         description: The availability status of the room (true for active)
 *             example:
 *               metadata:
 *                 currentPage: 1
 *                 sizeEachPage: 3
 *                 totalElements: 9
 *                 totalPages: 3
 *               data:
 *                 - _id: "60f7d93d2b4f4c001ed1f4c8"
 *                   roomNumber: "101"
 *                   typeId:
 *                     _id: "60f7d93d2b4f4c001ed1f4c7"
 *                     images: ["image1.jpg", "image2.jpg"]
 *                     typename: "Deluxe Room"
 *                   description: "A spacious deluxe room"
 *                   status: true
 *                 - _id: "60f7d93d2b4f4c001ed1f4c9"
 *                   roomNumber: "102"
 *                   typeId:
 *                     _id: "60f7d93d2b4f4c001ed1f4c7"
 *                     images: ["image3.jpg", "image4.jpg"]
 *                     typename: "Standard Room"
 *                   description: "A cozy standard room"
 *                   status: true
 *                 - _id: "60f7d93d2b4f4c001ed1f4c10"
 *                   roomNumber: "103"
 *                   typeId:
 *                     _id: "60f7d93d2b4f4c001ed1f4c7"
 *                     images: ["image5.jpg", "image6.jpg"]
 *                     typename: "Superior Room"
 *                   description: "A premium superior room"
 *                   status: false
 */
router.get('/', getRooms);

// Retrieve date availability and not availability based on typeRoom
router.get('/room-availability', getRoomTypeAvailability)


// Retrieve top 4 room rating
router.get('/rating', getTopRatedRoom);

/**
 * @swagger
 * /api/rooms/{id}:
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
 * /api/rooms/{id}:
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
 * /api/rooms/{id}/unavailableTime:
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
