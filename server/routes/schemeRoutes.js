import express from 'express';
import {
  getSchemes,
  getSchemeById,
  createScheme,
  updateScheme,
  deleteScheme,
  toggleSchemeStatus
} from '../controllers/schemeController.js';
<<<<<<< HEAD
import { protect, adminOnly } from '../middleware/authMiddleware.js';
=======
import { protect, adminOnly, optionalProtect } from '../middleware/authMiddleware.js';
>>>>>>> second-copy

const router = express.Router();

// Public routes
<<<<<<< HEAD
router.get('/', getSchemes);
router.get('/:id', getSchemeById);
=======
router.get('/', optionalProtect, getSchemes);
router.get('/:id', optionalProtect, getSchemeById);
>>>>>>> second-copy

// Admin protected routes
router.post('/', protect, adminOnly, createScheme);
router.put('/:id', protect, adminOnly, updateScheme);
router.delete('/:id', protect, adminOnly, deleteScheme);
router.patch('/:id/toggle-status', protect, adminOnly, toggleSchemeStatus);

export default router;
