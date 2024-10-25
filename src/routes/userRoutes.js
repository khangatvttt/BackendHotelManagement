import express from 'express';
import { getAllUsers, updateUser, getUser } from '../controllers/userController.js';
import authorizeRoles from '../middlewares/authorizationMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: API for managing users
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     description: This endpoint retrieves a list of all users.
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *         examples:
 *           application/json:
 *             value: [
 *               {
 *                 "id": "67089084acc972cbd027bc05",
 *                 "email": "khangatvttt@gmail.com",
 *                 "fullName": "11",
 *                 "gender": "Female",
 *                 "birthDate": "1985-05-15T00:00:00.000Z",
 *                 "phoneNumber": "987-654-3210",
 *                 "status": true,
 *                 "role": "Customer",
 *                 "point": 0,
 *                 "version": 0,
 *                 "isVerified": true
 *               },
 *               {
 *                 "id": "670895556f7a8b1acfe73a04",
 *                 "email": "customerssss@aaa.com",
 *                 "fullName": "Jane Smith",
 *                 "gender": "Female",
 *                 "birthDate": "1985-05-15T00:00:00.000Z",
 *                 "phoneNumber": "987-654-3210",
 *                 "status": true,
 *                 "role": "Staff",
 *                 "salary": 50000,
 *                 "version": 0,
 *                 "isVerified": false
 *               }
 *             ]
 */

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: This endpoint retrieves information about a specific user.
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the user to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
router.get('/', authorizeRoles('Admin', 'Staff'), getAllUsers);


/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user by ID
 *     description: This endpoint updates information for a specific user.
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the user to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 example: "NewPassword123"
 *                 description: "The new password for the user (hashed on server side)."
 *               fullName:
 *                 type: string
 *                 example: "Jane Doe"
 *                 description: "The full name of the user."
 *               gender:
 *                 type: string
 *                 example: "Female"
 *                 description: "The gender of the user."
 *               birthDate:
 *                 type: string
 *                 format: date
 *                 example: "1985-05-15"
 *                 description: "The birth date of the user."
 *               phoneNumber:
 *                 type: string
 *                 example: "987-654-3210"
 *                 description: "The phone number of the user."
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: User not found
 *       403:
 *         description: Forbidden
 */
router.get('/:id', getUser);


/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the user.
 *         email:
 *           type: string
 *           description: Email address of the user.
 *         fullName:
 *           type: string
 *           description: Full name of the user.
 *         gender:
 *           type: string
 *           description: Gender of the user.
 *         birthDate:
 *           type: string
 *           format: date
 *           description: Birth date of the user.
 *         phoneNumber:
 *           type: string
 *           description: Phone number of the user.
 *         status:
 *           type: boolean
 *           description: Status indicating if the user is active.
 *         role:
 *           type: string
 *           description: Role of the user (Admin, Staff, Customer).
 *         point:
 *           type: integer
 *           description: Points accumulated by the user.
 *         version:
 *           type: integer
 *           description: Version number for the user record.
 *         isVerified:
 *           type: boolean
 *           description: Indicates if the user is verified.
 */
router.put('/:id', updateUser);



export default router;
