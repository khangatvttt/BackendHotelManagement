import express from 'express';
import {
    login,
    signUp,
    verifyEmail,
    requestResetPassword,
    resetPassword,
    logout
} from '../controllers/authController.js'; 

const router = express.Router();

router.post('/login', login);
router.post('/signup', signUp)
router.get('/verify', verifyEmail)
router.post('/password-reset-request', requestResetPassword)
router.post('/password-reset', resetPassword)
router.get('/logout', logout)



export default router;