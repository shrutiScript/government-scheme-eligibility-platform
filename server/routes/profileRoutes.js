import express from 'express';
import {
  getProfile,
  updateProfile,
  uploadAvatar,
  removeAvatar,
  getSavedSchemes,
  saveScheme,
  removeSavedScheme
} from '../controllers/profileController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getProfile);
router.put('/', updateProfile);
router.post('/upload-avatar', uploadAvatar);
router.delete('/avatar', removeAvatar);

// Saved / Bookmarked Schemes
router.get('/saved-schemes', getSavedSchemes);
router.post('/saved-schemes/:schemeId', saveScheme);
router.delete('/saved-schemes/:schemeId', removeSavedScheme);

export default router;

