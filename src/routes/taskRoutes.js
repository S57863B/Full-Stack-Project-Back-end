import express from 'express';
import {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
} from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router({ mergeParams: true });

// All task routes require a logged-in user.
router.use(protect);

router.route('/')
  .get(getTasks)    // GET  /api/projects/:projectId/tasks
  .post(createTask); // POST /api/projects/:projectId/tasks

router.route('/:taskId')
  .put(updateTask)    // PUT    /api/projects/:projectId/tasks/:taskId
  .delete(deleteTask); // DELETE /api/projects/:projectId/tasks/:taskId

export default router;