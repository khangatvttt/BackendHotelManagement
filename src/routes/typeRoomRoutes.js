import express from 'express';
import {
    createTypeRoom,
    getTypeRooms,
    getTypeRoomById,
    updateTypeRoom
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
 *           type: Date
 *         description: Caculate available rooms for each type by checkInTime and checkOutTime (if use, checkOutTime must be included)
 *       - in: query
 *         name: checkOutTime
 *         schema:
 *           type: Date
 *         description: Caculate available rooms for each type by checkInTime and checkOutTime (if use, checkInTime must be included)
 *       - in: query
 *         name: limit
 *         description: Filter by limit of the type room
 *         schema:
 *           type: integer
 *       - in: query
 *         name: size
 *         description: The number of elementals is in one page
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         description: The page number that want to return
 *         required: true
 *         schema:
 *           type: integer
 *     tags: [TypeRoom]
 *     responses:
 *       200:
 *         description: A list of TypeRooms
 *         headers:
 *           X-Total-Count:
 *             description: A total of page base on Size
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TypeRoom'
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

export default router;