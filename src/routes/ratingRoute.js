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
 * components:
 *   schemas:
 *     Rating:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The unique identifier of the rating
 *           example: "6727a1d346ecf25c91b10d83"
 *         bookingId:
 *           type: object
 *           description: Details of the associated booking
 *           properties:
 *             _id:
 *               type: string
 *               description: The unique identifier of the booking
 *               example: "671f138dc45752411d1c232e"
 *             userId:
 *               type: object
 *               description: Details of the user who made the booking
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The unique identifier of the user
 *                   example: "671dcd0a222dcb3e4993674b"
 *                 fullName:
 *                   type: string
 *                   description: Full name of the user
 *                   example: "Nguyễn Phú Khang"
 *                 role:
 *                   type: string
 *                   description: Role of the user
 *                   example: "OnSiteCustomer"
 *                 id:
 *                   type: string
 *                   description: The user ID for public reference
 *                   example: "671dcd0a222dcb3e4993674b"
 *         typeRoomId:
 *           type: string
 *           description: ID of the room type associated with the rating
 *           example: "6705f9e148140aaf9f1ac9cb"
 *         score:
 *           type: number
 *           description: The rating score (minimum 1, maximum 5)
 *           format: float
 *           example: 4.5
 *         feedback:
 *           type: string
 *           description: User's feedback for the rating
 *           example: "So beautiful"
 *         createAt:
 *           type: string
 *           format: date-time
 *           description: When the rating was created
 *           example: "2024-11-03T16:15:47.246Z"
 *         __v:
 *           type: integer
 *           description: The version key (used internally by MongoDB)
 *           example: 0
 */
router.get('/', getAllRatings);


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
 *     parameters:
 *       - in: query
 *         name: size
 *         description: The number of elements per page (max 10).
 *         schema:
 *           type: integer
 *           example: 5
 *       - in: query
 *         name: page
 *         description: The page number to retrieve.
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: score
 *         description: Filter ratings by score (min 1, max 5).
 *         schema:
 *           type: number
 *           format: float
 *           example: 4.5
 *       - in: query
 *         name: typeRoomId
 *         description: Filter ratings by TypeRoom ID.
 *         schema:
 *           type: string
 *           example: "64d890843cabc72cbd028a11"
 *       - in: query
 *         name: bookingId
 *         description: Filter ratings by Booking ID.
 *         schema:
 *           type: string
 *           example: "64d890843cabc72cbd028b01"
 *     responses:
 *       200:
 *         description: A list of ratings with metadata.
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
 *                       description: The current page number.
 *                       example: 1
 *                     sizeEachPage:
 *                       type: integer
 *                       description: The number of elements per page.
 *                       example: 5
 *                     totalElements:
 *                       type: integer
 *                       description: The total number of ratings.
 *                       example: 50
 *                     totalPages:
 *                       type: integer
 *                       description: The total number of pages.
 *                       example: 10
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Rating'
 *       400:
 *         description: Invalid query parameters.
 *       500:
 *         description: Internal server error.
 */


/**
 * @swagger
 * /api/rating/{id}:
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
 * /apis/rating/{id}:
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
