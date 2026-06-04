import express from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register); // public
router.post('/login', login); // public

router.get('/me', protect, getMe);

export default router;