import express from 'express';
import {
    createRoom,
    getRooms,
    getRoomById,
    updateRoom,
    deleteRoom,
    getAvailableRooms,
    getTopRatedRoom
} from '../controllers/roomController.js';
import multer from 'multer';
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

// Create a new Room
router.post('/',upload.array('images', 10), createRoom);

// Retrieve all Rooms
router.get('/', getRooms);

// Retrieve available rooms based on CheckInTime, CheckOutTime and TypeName
router.get('/available', getAvailableRooms);

// Retrieve top 4 room rating
router.get('/rating', getTopRatedRoom);

// Retrieve a Room by ID
router.get('/:id', getRoomById);

// Update a Room by ID
router.put('/:id', updateRoom);

// Delete a Room by ID
router.delete('/:id', deleteRoom);

export default router;
