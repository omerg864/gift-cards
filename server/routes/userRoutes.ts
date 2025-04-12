import express from 'express';
import {
	login,
	register,
	updateUser,
	refresh,
	googleLogin,
	resendEmail,
	verifyEmail,
	logout,
	disconnectDevice,
	disconnectAllDevices,
	changePassword,
	sendEmailPasswordReset,
	resetPassword,
} from '../controllers/userController';
import { upload } from '../config/cloud';
import { authUser } from '../middleware/authMiddleware';

const router = express.Router();

// User routes

router.post('/register', upload.single('image'), register);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/refresh', refresh);
router.post('/resend', resendEmail);
router.post('/forgot/email', sendEmailPasswordReset);
router.post('/forgot/password/:token/:email', resetPassword);
router.post('/logout', authUser, logout);
router.get('/verify/:id', verifyEmail);
router.put('/password', authUser, changePassword);
router.put('/update', authUser, upload.single('image'), updateUser);
router.get('/disconnect/:id', authUser, disconnectDevice);
router.get('/disconnect', authUser, disconnectAllDevices);

export default router;
