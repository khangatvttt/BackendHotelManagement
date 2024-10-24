import express from 'express';
import { createUser, getAllUsers, updateUser, deleteUser } from '../controllers/userController.js';

const router = express.Router();

router.post('/', createUser); // Create a user
router.get('/', getAllUsers); // Get all users
router.put('/:id', updateUser); // Update a user by ID
router.delete('/:id', deleteUser); // Delete a user by ID

export default router;
