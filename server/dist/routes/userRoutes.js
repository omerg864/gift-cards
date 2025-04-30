"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const cloud_1 = require("../config/cloud");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// User routes
router.post('/register', cloud_1.upload.single('image'), userController_1.register);
router.post('/login', userController_1.login);
router.post('/google', userController_1.googleLogin);
router.post('/refresh', userController_1.refresh);
router.post('/resend', userController_1.resendEmail);
router.post('/forgot/email', userController_1.sendEmailPasswordReset);
router.post('/forgot/password/:email', userController_1.resetPassword);
router.post('/logout', authMiddleware_1.authUser, userController_1.logout);
router.get('/verify/:id', userController_1.verifyEmail);
router.put('/password', authMiddleware_1.authUser, userController_1.changePassword);
router.put('/update', authMiddleware_1.authUser, cloud_1.upload.single('image'), userController_1.updateUser);
router.get('/disconnect/:id', authMiddleware_1.authUser, userController_1.disconnectDevice);
router.get('/disconnect', authMiddleware_1.authUser, userController_1.disconnectAllDevices);
router.post('/encryption', authMiddleware_1.authUser, userController_1.createEncryptionKey);
router.put('/encryption', authMiddleware_1.authUser, userController_1.changeEncryptionKey);
router.put('/encryption/reset', authMiddleware_1.authUser, userController_1.resetEncryptionKey);
router.get('/devices', authMiddleware_1.authUser, userController_1.getConnectedDevices);
exports.default = router;
