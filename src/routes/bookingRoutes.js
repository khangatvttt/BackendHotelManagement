import express from 'express';
import {
    createBooking,
    getBookings,
    getBookingById,
    updateBooking,
} from '../controllers/bookingController.js';
import authorizeRoles from '../middlewares/authorizationMiddleware.js';
import { ROLES } from '../models/roles.js';
import { momoPayment } from '../utils/momoPayment.js';

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
 * /api/bookings:
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
 *               userId:
 *                 type: string
 *                 description: ID of the user who made the booking
 *               typeRooms:
 *                 type: array
 *                 description: List of room types and the number of rooms booked for each type
 *                 items:
 *                   type: object
 *                   properties:
 *                     typeId:
 *                       type: string
 *                       description: ID of the room type
 *                     numberOfRooms:
 *                       type: integer
 *                       description: Number of rooms booked for this type
 *               checkInTime:
 *                 type: string
 *                 format: date-time
 *                 description: Booking check-in date and time
 *               checkOutTime:
 *                 type: string
 *                 format: date-time
 *                 description: Booking check-out date and time
 *               numberOfGuests:
 *                 type: integer
 *                 description: Number of guests included in the booking
 *               paidAmount:
 *                 type: number
 *                 description: Amount paid as deposit
 *               redeemedPoint:
 *                 type: integer
 *                 description: Points used for discount
 *               voucherCode:
 *                 type: string
 *                 description: Voucher code used for this booking
 *               paymentMethod:
 *                 type: string
 *                 description: Payment method for the booking
 *           example:
 *             userId: "60e8b2f4c90e5c1f6c4d8f23"
 *             typeRooms: [
 *               {
 *                 typeId: "6705f9e148140aaf9f1ac9cb",
 *                 numberOfRooms: 1
 *               },
 *               {
 *                 typeId: "6705fad548140aaf9f1ac9cd",
 *                 numberOfRooms: 1
 *               }
 *             ]
 *             checkInTime: "2023-11-20T14:00:00.000Z"
 *             checkOutTime: "2023-11-22T12:00:00.000Z"
 *             numberOfGuests: 2
 *             paidAmount: 200
 *             redeemedPoint: 100
 *             voucherCode: "SALE200"
 *             paymentMethod: "Credit Card"
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
 * /api/bookings:
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
 *           type: string
 *         description: Filter bookings by current status
 *       - in: query
 *         name: size
 *         description: The number of elements per page
 *         required: true
 *         schema:
 *           type: integer
 *           example: 5
 *       - in: query
 *         name: page
 *         description: The page number to retrieve
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: List of bookings with metadata
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
 *                       example: 1
 *                     sizeEachPage:
 *                       type: integer
 *                       example: 5
 *                     totalElements:
 *                       type: integer
 *                       example: 20
 *                     totalPages:
 *                       type: integer
 *                       example: 4
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Bad request
 */
router.get('/', getBookings);


/**
 * @swagger
 * /api/bookings/{id}:
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
 * /api/bookings/{id}:
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
router.put('/:id', updateBooking);


/**
 * @swagger
 * /api/bookings/payment:
 *   post:
 *     summary: Process a payment via MoMo
 *     tags: [Bookings]
 *     description: Initiates a payment request to the MoMo payment gateway.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: integer
 *                 example: 200000
 *                 description: The amount to be paid in VND.
 *     responses:
 *       200:
 *         description: Payment processed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 partnerCode:
 *                   type: string
 *                   example: MOMO
 *                 orderId:
 *                   type: string
 *                   example: MOMO1732375966094
 *                 requestId:
 *                   type: string
 *                   example: MOMO1732375966094
 *                 amount:
 *                   type: integer
 *                   example: 200000
 *                 responseTime:
 *                   type: integer
 *                   example: 1732375966356
 *                 message:
 *                   type: string
 *                   example: Thành công.
 *                 resultCode:
 *                   type: integer
 *                   example: 0
 *                 payUrl:
 *                   type: string
 *                   example: https://test-payment.momo.vn/v2/gateway/pay?s=88610ac1dd26f0633af301f4020f48bfd9ac5dca9be62f33c99bdabb5d45d0b7&t=TU9NT3xNT01PMTczMjM3NTk2NjA5NA
 *                 shortLink:
 *                   type: string
 *                   example: https://test-payment.momo.vn/shortlink/tZxqn9E4H8
 */
router.post('/payment', momoPayment);


export default router;
