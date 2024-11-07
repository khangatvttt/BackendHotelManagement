import express from 'express';
import {
    createSchedule,
    getAllSchedules,
    getScheduleById,
    updateSchedule,
    deleteSchedule
} from '../controllers/scheduleController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Schedules
 *   description: API to manage work schedules
 */

/**
 * @swagger
 * /schedules:
 *   post:
 *     summary: Create a new schedule
 *     tags: [Schedules]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - workDate
 *               - shiftId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user for the schedule
 *               workDate:
 *                 type: string
 *                 format: date
 *                 description: The work date for the schedule (YYYY-MM-DD format)
 *               shiftId:
 *                 type: string
 *                 description: The ID of the shift for the schedule
 *     responses:
 *       201:
 *         description: Schedule created successfully
 *       400:
 *         description: Bad request, validation failed
 *       404:
 *         description: User or shift not found
 */
router.post('/', createSchedule);

/**
 * @swagger
 * /schedules:
 *   get:
 *     summary: Get all schedules
 *     tags: [Schedules]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter schedules starting from this date (YYYY-MM-DD format)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter schedules up to this date (YYYY-MM-DD format)
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter schedules by user ID
 *     responses:
 *       200:
 *         description: A list of schedules
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   shifts:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: List of shift IDs
 *                   schedule:
 *                     type: object
 *                     properties:
 *                       userId:
 *                         type: string
 *                         description: The ID of the user for the schedule
 *                       workDate:
 *                         type: string
 *                         format: date-time
 *                         description: The work date for the schedule
 *             examples:
 *               example:
 *                 value: [
 *                   {
 *                     "shifts": ["672871c09919a18d92fa553d"],
 *                     "schedule": {
 *                       "userId": "67152996998ab86e655509e5",
 *                       "workDate": "2024-11-09T00:00:00.000Z"
 *                     }
 *                   },
 *                   {
 *                     "shifts": ["67287034dbaeb49a7e5731a8"],
 *                     "schedule": {
 *                       "userId": "670895556f7a8b1acfe73a04",
 *                       "workDate": "2024-11-06T00:00:00.000Z"
 *                     }
 *                   },
 *                   {
 *                     "shifts": [
 *                       "67287034dbaeb49a7e5731a8",
 *                       "672886fe6398fa909c9454ef",
 *                       "672871c09919a18d92fa553d"
 *                     ],
 *                     "schedule": {
 *                       "userId": "670895556f7a8b1acfe73a04",
 *                       "workDate": "2024-11-09T00:00:00.000Z"
 *                     }
 *                   }
 *                 ]
 */
router.get('/', getAllSchedules);

/**
 * @swagger
 * /schedules/{id}:
 *   get:
 *     summary: Get a schedule by ID
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The schedule ID
 *     responses:
 *       200:
 *         description: The schedule data
 *       404:
 *         description: Schedule not found
 */
router.get('/:id', getScheduleById);

/**
 * @swagger
 * /schedules/{id}:
 *   put:
 *     summary: Update a schedule status by ID
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The schedule ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: ['Scheduled', 'Completed', 'Cancelled']
 *                 description: The new status of the schedule
 *     responses:
 *       200:
 *         description: The updated schedule
 *       400:
 *         description: Bad request, validation failed
 *       404:
 *         description: Schedule not found
 */
router.put('/:id', updateSchedule);

/**
 * @swagger
 * /schedules/{id}:
 *   delete:
 *     summary: Delete a schedule by ID
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The schedule ID
 *     responses:
 *       200:
 *         description: Schedule deleted successfully
 *       404:
 *         description: Schedule not found
 */
router.delete('/:id', deleteSchedule);

export default router;
