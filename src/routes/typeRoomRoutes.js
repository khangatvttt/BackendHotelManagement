import express from 'express';
import {
    createTypeRoom,
    getTypeRooms,
    getTypeRoomById,
    updateTypeRoom,
    deleteTypeRoom
} from '../controllers/typeRoomController.js';

const router = express.Router();

//Create a new TypeRoom
router.post('/', createTypeRoom);

//Retrieve all TypeRooms
router.get('/', getTypeRooms);

//Retrieve a TypeRoom by ID
router.get('/:id', getTypeRoomById);

//Update a TypeRoom by ID
router.put('/:id', updateTypeRoom);

//Delete a TypeRoom by ID
router.delete('/:id', deleteTypeRoom);

export default router;
