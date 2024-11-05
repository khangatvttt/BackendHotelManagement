import express from 'express';
import {
    createMaintainSchedule,
    getMaintainSchedules,
    getMaintainScheduleById,
    updateMaintainSchedule,
    deleteMaintainSchedule
} from '../controllers/maintainScheduleController.js'; 
const router = express.Router();

// Create a new MaintainSchedule
router.post('/', createMaintainSchedule);

// Get all MaintainSchedules
router.get('/', getMaintainSchedules);

// Get a single MaintainSchedule by ID
router.get('/:id', getMaintainScheduleById);

// Update a MaintainSchedule by ID
router.put('/:id', updateMaintainSchedule);

// Delete a MaintainSchedule by ID
router.delete('/:id', deleteMaintainSchedule);

export default router;
