import express from 'express';
import { getAllStaffs, updateStaff, getStaff } from '../controllers/staffController.js';
import authorizeRoles from '../middlewares/authorizationMiddleware.js';
import { ROLES } from '../models/roles.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Staffs
 *   description: API for managing staffs
 */

/**
 * @swagger
 * /api/staffs:
 *   get:
 *     summary: Get all Staffs
 *     description: This endpoint retrieves a list of all staffs. Only Admin can access this endpoint
 *     tags: [Staffs]
 *     responses:
 *       200:
 *         description: A list of staffs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/staff'
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
 *                 "role": "Staff",
 *                 "point": 0,
 *                 "version": 0,
 *                 "isVerified": true
 *               },
 *               {
 *                 "id": "670895556f7a8b1acfe73a04",
 *                 "email": "Staffssss@aaa.com",
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
router.get('/', authorizeRoles(ROLES.ADMIN), getAllStaffs);

/**
 * @swagger
 * /api/staffs/{id}:
 *   get:
 *     summary: Get Staff by ID
 *     description: This endpoint retrieves information about a specific staff.  Only Admin and Staff themself can get their info
 *     tags: [Staffs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the staff to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Staff information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/staff'
 *       404:
 *         description: Staff not found
 */
router.get('/:id', getStaff);


/**
 * @swagger
 * /api/staffs/{id}:
 *   put:
 *     summary: Update Staff by ID
 *     description: This endpoint updates information for a specific Staff. Only provide fields that need to update.
 *     tags: [Staffs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the staff to update
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
 *                 description: "The new password for the Staff (hashed on server side)."
 *               fullName:
 *                 type: string
 *                 example: "Jane Doe"
 *                 description: "The full name of the Staff."
 *               gender:
 *                 type: string
 *                 example: "Female"
 *                 description: "The gender of the Staff."
 *               birthDate:
 *                 type: string
 *                 format: date
 *                 example: "1985-05-15"
 *                 description: "The birth date of the Staff."
 *               phoneNumber:
 *                 type: string
 *                 example: "987-654-3210"
 *                 description: "The phone number of the Staff."
 *     responses:
 *       200:
 *         description: Staff updated successfully
 *       400:
 *         description: Bad request due to invalid body (password is not strong enough, wrong type, ...)
 *       404:
 *         description: Staff not found
 *       403:
 *         description: Forbidden
 */
router.put('/:id', updateStaff);


/**
 * @swagger
 * components:
 *   schemas:
 *     staff:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the staff.
 *         email:
 *           type: string
 *           description: Email address of the staff.
 *         fullName:
 *           type: string
 *           description: Full name of the staff.
 *         gender:
 *           type: string
 *           description: Gender of the staff.
 *         birthDate:
 *           type: string
 *           format: date
 *           description: Birth date of the staff.
 *         phoneNumber:
 *           type: string
 *           description: Phone number of the staff.
 *         status:
 *           type: boolean
 *           description: Status indicating if the staff is active.
 *         role:
 *           type: string
 *           description: Role.
 *         salary:
 *           type: integer
 *           description: Salary of the staff.
 *         version:
 *           type: integer
 *           description: Version number for the staff record.
 *         isVerified:
 *           type: boolean
 *           description: Indicates if the account is verified.
 */



export default router;
