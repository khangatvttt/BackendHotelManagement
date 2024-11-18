import express from 'express';
import {
    createTypeRoom,
    getTypeRooms,
    getTypeRoomById,
    updateTypeRoom,
    availableRoomsByType
} from '../controllers/typeRoomController.js';
import multer from 'multer';
import dotenv from 'dotenv'
import BadRequestError from '../errors/badRequestError.js';

dotenv.config()

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) },
    fileFilter: (req, file, cb) => {
        // Define accepted MIME types
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new BadRequestError('Only image files are allowed (png, gif, jpeg)'), false);
        }
    }
});

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     TypeRoom:
 *       type: object
 *       required:
 *         - description
 *         - typename
 *         - limit
 *         - price
 *       properties:
 *         _id:
 *           type: string
 *         description:
 *           type: string
 *           description: Description of the room type
 *         typename:
 *           type: string
 *           description: Name of the room type
 *         limit:
 *           type: integer
 *           description: Maximum number of occupants allowed
 *         price:
 *           type: object
 *           properties:
 *             hourlyRate:
 *               type: number
 *               description: Hourly rate for the room
 *             dailyRate:
 *               type: number
 *               description: Daily rate for the room
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           description: URLs of uploaded images
 */

/**
 * @swagger
 * /api/typerooms:
 *   post:
 *     summary: Create a new TypeRoom
 *     tags: [TypeRoom]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *               typename:
 *                 type: string
 *               limit:
 *                 type: integer
 *               price:
 *                 type: object
 *                 properties:
 *                   hourlyRate:
 *                     type: number
 *                   dailyRate:
 *                     type: number
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: The TypeRoom was created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TypeRoom'
 *       400:
 *         description: Bad request
 */
router.post('/', upload.array('images', parseInt(process.env.MAX_IMAGES)), createTypeRoom);

/**
 * @swagger
 * /api/typerooms:
 *   get:
 *     summary: Retrieve all TypeRooms
 *     parameters:
 *       - in: query
 *         name: checkInTime
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Calculate available rooms for each type by checkInTime and checkOutTime (if used, checkOutTime must be included)
 *       - in: query
 *         name: checkOutTime
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Calculate available rooms for each type by checkInTime and checkOutTime (if used, checkInTime must be included)
 *       - in: query
 *         name: limit
 *         description: Filter by limit of the type room
 *         schema:
 *           type: integer
 *       - in: query
 *         name: size
 *         description: The number of elements in one page
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         description: The page number that you want to return
 *         required: true
 *         schema:
 *           type: integer
 *     tags: [TypeRoom]
 *     responses:
 *       200:
 *         description: A list of TypeRooms along with metadata for pagination
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
 *                       description: Current page number
 *                     sizeEachPage:
 *                       type: integer
 *                       description: Number of elements per page
 *                     totalElements:
 *                       type: integer
 *                       description: Total number of elements across all pages
 *                     totalPages:
 *                       type: integer
 *                       description: Total number of pages
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TypeRoom'
 *         examples:
 *           application/json:
 *             value: {
 *               "metadata": {
 *                 "currentPage": 1,
 *                 "sizeEachPage": 10,
 *                 "totalElements": 100,
 *                 "totalPages": 10
 *               },
 *               "data": [
 *                 {
 *                   "_id": "type1",
 *                   "name": "Deluxe Room",
 *                   "availableRoom": 5,
 *                   "rating": {
 *                     "averageScore": 4.5,
 *                     "totalRating": 50
 *                   }
 *                 },
 *                 {
 *                   "_id": "type2",
 *                   "name": "Standard Room",
 *                   "availableRoom": 3,
 *                   "rating": {
 *                     "averageScore": 4.0,
 *                     "totalRating": 30
 *                   }
 *                 }
 *               ]
 *             }
 */
router.get('/', getTypeRooms);



/**
 * @swagger
 * /api/typerooms/{id}:
 *   get:
 *     summary: Retrieve a TypeRoom by ID
 *     tags: [TypeRoom]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the TypeRoom to retrieve
 *     responses:
 *       200:
 *         description: The requested TypeRoom
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TypeRoom'
 *       404:
 *         description: TypeRoom not found
 */
router.get('/:id', getTypeRoomById);

/**
 * @swagger
 * /api/typerooms/{id}:
 *   put:
 *     summary: Update a TypeRoom by ID
 *     tags: [TypeRoom]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the TypeRoom to update
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *               typename:
 *                 type: string
 *               limit:
 *                 type: integer
 *               price:
 *                 type: object
 *                 properties:
 *                   hourlyRate:
 *                     type: number
 *                   dailyRate:
 *                     type: number
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               imagesToRemove:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: The TypeRoom was updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TypeRoom'
 *       400:
 *         description: Bad request
 *       404:
 *         description: TypeRoom not found
 */
router.put('/:id', upload.array('images', parseInt(process.env.MAX_IMAGES)), updateTypeRoom);

/**
 * @swagger
 * /api/typerooms/{id}/availableRooms:
 *   get:
 *     summary: Check how many rooms are available in a specific time
 *     tags: [TypeRoom]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the TypeRoom to check
 *       - in: query
 *         name: checkInTime
 *         schema:
 *           type: string
 *           format: date-time
 *         required: true
 *         description: The check-in time
 *       - in: query
 *         name: checkOutTime
 *         schema:
 *           type: string
 *           format: date-time
 *         required: true
 *         description: The check-out time
 *     responses:
 *       200:
 *         description: Number of available rooms
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 availableRooms:
 *                   type: integer
 *                   example: 5
 *       400:
 *         description: Bad request
 *       404:
 *         description: TypeRoom not found
 */
router.get('/:id/availableRooms', availableRoomsByType);

export default router;