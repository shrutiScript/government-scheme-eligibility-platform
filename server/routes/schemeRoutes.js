import express from 'express';
import {
  getSchemes,
  getSchemeById,
  createScheme,
  updateScheme,
  deleteScheme,
  toggleSchemeStatus
} from '../controllers/schemeController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getSchemes);
router.get('/:id', getSchemeById);

// Admin protected routes
router.post('/', protect, adminOnly, createScheme);
router.put('/:id', protect, adminOnly, updateScheme);
router.delete('/:id', protect, adminOnly, deleteScheme);
router.patch('/:id/toggle-status', protect, adminOnly, toggleSchemeStatus);

export default router;
