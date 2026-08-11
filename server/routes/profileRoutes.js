import express from 'express';
import { getProfile, updateProfile, uploadAvatar } from '../controllers/profileController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getProfile);
router.put('/', updateProfile);
router.post('/upload-avatar', uploadAvatar);

export default router;
