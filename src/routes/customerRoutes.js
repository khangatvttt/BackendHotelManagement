import express from 'express';
import { getAllCustomers, updateCustomer, getCustomer } from '../controllers/customerController.js';
import authorizeRoles from '../middlewares/authorizationMiddleware.js';
import { ROLES } from '../models/roles.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Customers
 *   description: API for managing customers
 */

/**
 * @swagger
 * /api/customers:
 *   get:
 *     summary: Get all customers
 *     description: This endpoint retrieves a list of all customers, with optional filtering by phone, email, fullName, gender, and status. Only Admin and Staff can access this endpoint.
 *     tags: [Customers]
 *     parameters:
 *       - in: query
 *         name: phone
 *         schema:
 *           type: string
 *         description: Filter by phone number (must be exactly 10 digits).
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         description: Filter by email address.
 *       - in: query
 *         name: fullName
 *         schema:
 *           type: string
 *         description: Filter by full name (case-insensitive partial match).
 *       - in: query
 *         name: gender
 *         schema:
 *           type: string
 *           enum: [Male, Female]
 *         description: Filter by gender.
 *       - in: query
 *         name: status
 *         schema:
 *           type: boolean
 *         description: Filter by account status (true for active, false for inactive).
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
 *     responses:
 *       200:
 *         description: A list of customers
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
 *                 $ref: '#/components/schemas/customer'
 *         examples:
 *           application/json:
 *             value: [
 *               {
 *                 "id": "67089084acc972cbd027bc05",
 *                 "email": "khangatvttt@gmail.com",
 *                 "fullName": "11",
 *                 "gender": "Female",
 *                 "birthDate": "1985-05-15T00:00:00.000Z",
 *                 "phoneNumber": "9876543210",
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
 *                 "phoneNumber": "9876543210",
 *                 "status": true,
 *                 "role": "Staff",
 *                 "salary": 50000,
 *                 "version": 0,
 *                 "isVerified": false
 *               }
 *             ]
 */
router.get('/', authorizeRoles(ROLES.ADMIN, ROLES.STAFF), getAllCustomers);

/**
 * @swagger
 * /api/customers/{id}:
 *   get:
 *     summary: Get customer by ID
 *     description: This endpoint retrieves information about a specific customer.  Only Admid, Staff and Customer themself can get their info
 *     tags: [Customers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the customer to retrieve
 *         schema:
 *           type: string
 *     responses:
 *      200:
 *         description: customer information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/customer'
 *       404:
 *         description: customer not found
 */
router.get('/:id', getCustomer);


/**
 * @swagger
 * /api/customers/{id}:
 *   put:
 *     summary: Update customer by ID
 *     description: This endpoint updates information for a specific customer. Only provide fields that need to update.
 *     tags: [Customers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the customer to update
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
 *                 description: "The new password for the customer (hashed on server side)."
 *               fullName:
 *                 type: string
 *                 example: "Jane Doe"
 *                 description: "The full name of the customer."
 *               gender:
 *                 type: string
 *                 example: "Female"
 *                 description: "The gender of the customer."
 *               birthDate:
 *                 type: string
 *                 format: date
 *                 example: "1985-05-15"
 *                 description: "The birth date of the customer."
 *               phoneNumber:
 *                 type: string
 *                 example: "987-654-3210"
 *                 description: "The phone number of the customer."
 *     responses:
 *       200:
 *         description: Customer updated successfully
 *       400:
 *         description: Bad request due to invalid body (password is not strong enough, wrong type, ...)
 *       404:
 *         description: Customer not found
 *       403:
 *         description: Forbidden
 */
router.put('/:id', updateCustomer);


/**
 * @swagger
 * components:
 *   schemas:
 *     customer:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the customer.
 *         email:
 *           type: string
 *           description: Email address of the customer.
 *         fullName:
 *           type: string
 *           description: Full name of the customer.
 *         gender:
 *           type: string
 *           description: Gender of the customer.
 *         birthDate:
 *           type: string
 *           format: date
 *           description: Birth date of the customer.
 *         phoneNumber:
 *           type: string
 *           description: Phone number of the customer.
 *         status:
 *           type: boolean
 *           description: Status indicating if the customer is active.
 *         role:
 *           type: string
 *           description: Role of the customer (Admin, Staff, Customer).
 *         point:
 *           type: integer
 *           description: Points accumulated by the customer.
 *         version:
 *           type: integer
 *           description: Version number for the customer record.
 *         isVerified:
 *           type: boolean
 *           description: Indicates if the customer is verified.
 */



export default router;
