import express from 'express';
import { register, login, logout, getMe, updateProfile, updatePassword } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validateRegister, validateLogin } from '../middleware/validation.js';

const router = express.Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, updatePassword);

export default router;