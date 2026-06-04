import express from 'express';
import {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
} from '../controllers/projectController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// EVERY project route requires a logged-in user. Instead of adding `protect`
// to each line, router.use(protect) applies it to all routes below.
router.use(protect);

router.route('/')
  .get(getProjects)   // GET    /api/projects     -> list my projects
  .post(createProject); // POST   /api/projects     -> create a project

router.route('/:id')
  .get(getProject)     // GET    /api/projects/:id -> view one (if owner)
  .put(updateProject)  // PUT    /api/projects/:id -> update (if owner)
  .delete(deleteProject); // DELETE /api/projects/:id -> delete (if owner)

export default router;