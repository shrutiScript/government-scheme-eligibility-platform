import express from 'express';
<<<<<<< HEAD
import { getProfile, updateProfile, uploadAvatar } from '../controllers/profileController.js';
=======
import {
  getProfile,
  updateProfile,
  uploadAvatar,
  removeAvatar,
  getSavedSchemes,
  saveScheme,
  removeSavedScheme
} from '../controllers/profileController.js';
>>>>>>> second-copy
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getProfile);
router.put('/', updateProfile);
router.post('/upload-avatar', uploadAvatar);
<<<<<<< HEAD

export default router;
=======
router.delete('/avatar', removeAvatar);

// Saved / Bookmarked Schemes
router.get('/saved-schemes', getSavedSchemes);
router.post('/saved-schemes/:schemeId', saveScheme);
router.delete('/saved-schemes/:schemeId', removeSavedScheme);

export default router;

>>>>>>> second-copy
