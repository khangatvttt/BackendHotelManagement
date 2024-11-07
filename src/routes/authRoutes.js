import express from 'express';
import {
    login,
    signUp,
    verifyEmail,
    requestResetPassword,
    resetPassword,
    logout,
    getCurrentUser
} from '../controllers/authController.js'; 
import jwtMiddleware from '../middlewares/jwtMiddleware.js'

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Authentication related endpoints
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login
 *     tags: [Authentication]
 *     description: This endpoint allows user to login. Automatically sets a token in a cookie upon successful login.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@gmail.com"
 *               password:
 *                 type: string
 *                 example: "User1234"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             example:
 *               user_id: "60f7d93d2b4f4c001ed1f4c8"
 *               role: "Customer"
 *       401:
 *         description: Login failed due to bad credential
 *       403:
 *         description: Login failed due to disable or unverified account
 */
router.post('/login', login);

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Sign Up
 *     tags: [Authentication]
 *     description: Register a new user. New account must verify its email before login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: "Must be unique."
 *                 example: "newuser@gmail.com"
 *               password:
 *                 type: string
 *                 description: "Must have at least 6 characters, one lowercase,
 *                                                       one uppercase and one digit"
 *                 example: "NewUser1234"
 *               fullName:
 *                 type: string
 *                 example: "Nguyen Van A"
 *               gender:
 *                 type: enum ['Male','Female']
 *                 example: "Male"
 *               birthDate:
 *                 type: date 
 *                 description: Date format yyyy-mm-dd
 *                 example: "2000-12-3"
 *               phoneNumber:
 *                 type: string
 *                 example: "0231233999"
 *               role:
 *                 type: enum ['Customer','OnSiteCustomer','Staff','Admin']
 *                 example: "Customer"
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Input is invalid (Duplicate email, wrong type, missing fields, ...)
 */
router.post('/signup', signUp);

/**
 * @swagger
 * /api/auth/verify:
 *   get:
 *     summary: Verify Email
 *     tags: [Authentication]
 *     description: Verify user email through a verification link.
 *     parameters:
 *       - in: query
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: Verification token
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Email has already been verified or Invalid/Missing token
 */
router.get('/verify', verifyEmail);

/**
 * @swagger
 * /api/auth/password-reset-request:
 *   post:
 *     summary: Request Password Reset
 *     tags: [Authentication]
 *     description: Send a password reset link to the user's email.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@gmail.com"
 *     responses:
 *       200:
 *         description: Password reset link sent
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Account with this email is disable/banned
 *       404:
 *         description: User with this email doesn't exist
 */
router.post('/password-reset-request', requestResetPassword);

/**
 * @swagger
 * /api/auth/password-reset:
 *   post:
 *     summary: Reset Password
 *     tags: [Authentication]
 *     description: Reset the user's password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 example: "ebfa79a1d1101e020129dce7fb9702dfa2f66bfdaf004c5e470c2d6af5d9784f"
 *               newPassword:
 *                 type: string
 *                 description: "Must have at least 6 characters, one lowercase, one uppercase and one digit"
 *                 example: "NewPassword1234"
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid token or Invalid password
 */
router.post('/password-reset', resetPassword);

/**
 * @swagger
 * /api/auth/logout:
 *   get:
 *     summary: Logout
 *     tags: [Authentication]
 *     description: Log out the currently logged-in user.
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.get('/logout', logout);

/**
 * @swagger
 * /api/auth/current-user:
 *   get:
 *     summary: Get user that is logging
 *     tags: [Authentication]
 *     description: Get user id and role that is logging. 
 *     responses:
 *       200:
 *         description: Authenticated user info
 *         content:
 *           application/json:
 *             example:
 *               user_id: "60f7d93d2b4f4c001ed1f4c8"
 *               role: "Customer"
 *       401:
 *         description: Not login yet
 */
router.get('/current-user', jwtMiddleware, getCurrentUser);

export default router;
