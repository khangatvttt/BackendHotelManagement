import express from 'express';
import {
    createBooking,
    getBookings,
    getBookingById,
    updateBooking,
} from '../controllers/bookingController.js';
import authorizeRoles from '../middlewares/authorizationMiddleware.js';
import { ROLES } from '../models/roles.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Booking:
 *       type: object
 *       required:
 *         - userId
 *         - roomIds
 *         - checkInTime
 *         - checkOutTime
 *         - numberOfGuests
 *         - totalAmount
 *         - paymentMethod
 *       properties:
 *         userId:
 *           type: string
 *           description: ID of the user who made the booking
 *         roomIds:
 *           type: array
 *           items:
 *             type: string
 *           description: List of room IDs associated with the booking
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the booking was created
 *         checkInTime:
 *           type: string
 *           format: date-time
 *           description: Booking check-in date and time
 *         checkOutTime:
 *           type: string
 *           format: date-time
 *           description: Booking check-out date and time
 *         numberOfGuests:
 *           type: integer
 *           description: Number of guests included in the booking
 *         paidAmount:
 *           type: object
 *           properties:
 *             amount:
 *               type: number
 *             latestPaidTime:
 *               type: string
 *               format: date-time
 *           description: Paid amount details
 *         totalAmount:
 *           type: number
 *           description: Total booking amount
 *         paymentMethod:
 *           type: string
 *           description: Payment method for the booking
 *         currentStatus:
 *           type: boolean
 *           description: Booking status (true for active, false for canceled)
 *       example:
 *         userId: "60e8b2f4c90e5c1f6c4d8f23"
 *         roomIds: ["60e8b2f4c90e5c1f6c4d8f24", "60e8b2f4c90e5c1f6c4d8f25"]
 *         createdAt: "2023-01-15T10:00:00.000Z"
 *         checkInTime: "2023-01-20T14:00:00.000Z"
 *         checkOutTime: "2023-01-22T12:00:00.000Z"
 *         numberOfGuests: 2
 *         paidAmount: { amount: 200, latestPaidTime: "2023-01-15T11:00:00.000Z" }
 *         totalAmount: 250
 *         paymentMethod: "Credit Card"
 *         currentStatus: true
 */

/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 * 
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *              userId:
 *                  type: string
 *                  description: ID of the user who made the booking
 *              roomIds:
 *                  type: array
 *                  items:
 *                      type: string
 *                      description: List of room IDs associated with the booking
 *              checkInTime:
 *                  type: string
 *                  format: date-time
 *                  description: Booking check-in date and time
 *              checkOutTime:
 *                  type: string
 *                  format: date-time
 *                  description: Booking check-out date and time
 *              numberOfGuests:
 *                  type: integer
 *                  description: Number of guests included in the booking
 *              paidAmount:
 *                  type: number
 *                  description: Amount that paid for deposit
 *              redeemedPoint:
 *                  type: integer
 *                  description: The point that uses to exchange for discount
 *              voucherCode:
 *                  type: string
 *                  description: Voucher that use for this booking
 *              paymentMethod:
 *                  type: string
 *                  description: Payment method for the booking
 *           example:
 *                  userId: "60e8b2f4c90e5c1f6c4d8f23"
 *                  roomIds: ["60e8b2f4c90e5c1f6c4d8f24", "60e8b2f4c90e5c1f6c4d8f25"]
 *                  checkInTime: "2023-11-20T14:00:00.000Z"
 *                  checkOutTime: "2023-11-22T12:00:00.000Z"
 *                  numberOfGuests: 2
 *                  paidAmount: 200
 *                  redeemedPoint: 100
 *                  voucherCode: SALE200
 *                  paymentMethod: "Credit Card"
 *     responses:
 *       201:
 *         description: Booking created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Bad request
 */
router.post('/', createBooking);

/**
 * @swagger
 * /bookings:
 *   get:
 *     summary: Get all bookings
 *     tags: [Bookings]
 *     parameters:
 *       - in: query
 *         name: checkInTime
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter bookings by check-in time
 *       - in: query
 *         name: checkOutTime
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter bookings by check-out time
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter bookings by user ID
 *       - in: query
 *         name: roomId
 *         schema:
 *           type: string
 *         description: Filter bookings by room ID
 *       - in: query
 *         name: currentStatus
 *         schema:
 *           type: boolean
 *         description: Filter bookings by current status
 *     responses:
 *       200:
 *         description: List of bookings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Bad request
 */
router.get('/', authorizeRoles(ROLES.ADMIN, ROLES.STAFF), getBookings);

/**
 * @swagger
 * /bookings/{id}:
 *   get:
 *     summary: Get a booking by ID
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: A booking object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Booking'
 *       404:
 *         description: Booking not found
 */
router.get('/:id', getBookingById);

/**
 * @swagger
 * /bookings/{id}:
 *   put:
 *     summary: Update a booking by ID
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Booking'
 *     responses:
 *       200:
 *         description: Booking updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Bad request
 *       404:
 *         description: Booking not found
 */
router.put('/:id', authorizeRoles(ROLES.ADMIN, ROLES.STAFF), updateBooking);

export default router;
