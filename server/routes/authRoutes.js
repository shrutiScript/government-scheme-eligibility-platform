import express from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  updateProfile,
  updateEmail,
  updatePassword,
  forgotPassword,
  verifyResetOtp,
  resetPassword
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public Authentication & Password Reset Routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOtp);
router.post('/reset-password', resetPassword);

// Protected Account Management Routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/email', protect, updateEmail);
router.post('/update-email', protect, updateEmail);
router.put('/password', protect, updatePassword);
router.post('/update-password', protect, updatePassword);

export default router;
