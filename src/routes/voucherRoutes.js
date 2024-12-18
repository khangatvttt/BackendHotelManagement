import express from 'express';
import {
    createVoucher,
    getVouchers,
    getVoucher,
    updateVoucher,
    deleteVoucher
} from '../controllers/voucherController.js';
import authorizeRoles from '../middlewares/authorizationMiddleware.js'
import { ROLES } from '../models/roles.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Voucher:
 *       type: object
 *       required:
 *         - code
 *         - description
 *         - discountPercentage
 *         - startDate
 *         - endDate
 *         - minSpend
 *         - maxDiscount
 *         - limitUse
 *       properties:
 *         code:
 *           type: string
 *           description: Unique code for the voucher
 *         description:
 *           type: string
 *           description: Description of the voucher
 *         discountPercentage:
 *           type: number
 *           description: Discount percentage of the voucher
 *         startDate:
 *           type: string
 *           format: date-time
 *           description: Start date of voucher validity
 *         endDate:
 *           type: string
 *           format: date-time
 *           description: End date of voucher validity
 *         minSpend:
 *           type: number
 *           description: Minimum spend required to use the voucher
 *         maxDiscount:
 *           type: number
 *           description: Maximum discount amount
 *         limitUse:
 *           type: number
 *           description: Number of times the voucher can be used
 *         userUsedVoucher:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of user IDs who have used the voucher
 *       example:
 *         code: "SAVE20"
 *         description: "20% off on orders above $50"
 *         discountPercentage: 20
 *         startDate: "2023-01-01T00:00:00.000Z"
 *         endDate: "2023-12-31T23:59:59.000Z"
 *         minSpend: 50
 *         maxDiscount: 100
 *         limitUse: 100
 *         userUsedVoucher: ["60e8b2f4c90e5c1f6c4d8f24", "60e8b2f4c90e5c1f6c4d8f25"]
 */

/**
 * @swagger
 * tags:
 *   name: Vouchers
 *   description: API for managing vouchers
 */

/**
 * @swagger
 * /api/vouchers:
 *   post:
 *     summary: Create a new voucher
 *     tags: [Vouchers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Voucher'
 *     responses:
 *       201:
 *         description: The voucher was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Voucher'
 *       400:
 *         description: Bad request
 */
router.post('/',authorizeRoles(ROLES.ADMIN, ROLES.STAFF), createVoucher);

/**
 * @swagger
 * /api/vouchers:
 *   get:
 *     summary: Retrieve a list of all vouchers
 *     tags: [Vouchers]
 *     parameters:
 *       - in: query
 *         name: available
 *         schema:
 *           type: boolean
 *         description: if true, get all vouchers that can use for now
 *       - in: totalAmount
 *         name: available
 *         schema:
 *           type: number
 *         description: filter all vouchers that can use for certain total amount
 *     responses:
 *       200:
 *         description: A list of vouchers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Voucher'
 *       500:
 *         description: Server error
 */
router.get('/', getVouchers);

/**
 * @swagger
 * /api/vouchers/{id}:
 *   get:
 *     summary: Retrieve a voucher by ID
 *     tags: [Vouchers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The voucher ID
 *     responses:
 *       200:
 *         description: A single voucher
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Voucher'
 *       404:
 *         description: Voucher not found
 */
router.get('/:id', authorizeRoles(ROLES.ADMIN, ROLES.STAFF), getVoucher);

/**
 * @swagger
 * /api/vouchers/{id}:
 *   put:
 *     summary: Update a voucher by ID
 *     tags: [Vouchers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The voucher ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Voucher'
 *     responses:
 *       200:
 *         description: The voucher was successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Voucher'
 *       404:
 *         description: Voucher not found
 *       400:
 *         description: Bad request
 */
router.put('/:id',authorizeRoles(ROLES.ADMIN, ROLES.STAFF), updateVoucher);

/**
 * @swagger
 * /api/vouchers/{id}:
 *   delete:
 *     summary: Delete a voucher by ID
 *     tags: [Vouchers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The voucher ID
 *     responses:
 *       200:
 *         description: The voucher was successfully deleted
 *       404:
 *         description: Voucher not found
 */
router.delete('/:id',authorizeRoles(ROLES.ADMIN, ROLES.STAFF), deleteVoucher);

export default router;
