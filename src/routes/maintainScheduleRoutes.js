import express from 'express';
import {
    createMaintainSchedule,
    getMaintainSchedules,
    getMaintainScheduleById,
    updateMaintainSchedule,
    deleteMaintainSchedule
} from '../controllers/maintainScheduleController.js'; // Assuming your controller file is named maintainScheduleController.js

const router = express.Router();

// Create a new MaintainSchedule
router.post('/maintain-schedules', createMaintainSchedule);

// Get all MaintainSchedules
router.get('/maintain-schedules', getMaintainSchedules);

// Get a single MaintainSchedule by ID
router.get('/maintain-schedules/:id', getMaintainScheduleById);

// Update a MaintainSchedule by ID
router.put('/maintain-schedules/:id', updateMaintainSchedule);

// Delete a MaintainSchedule by ID
router.delete('/maintain-schedules/:id', deleteMaintainSchedule);

export default router;
