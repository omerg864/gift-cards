"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConnectedDevices = exports.changeEncryptionKey = exports.resetEncryptionKey = exports.createEncryptionKey = exports.resetPassword = exports.sendEmailPasswordReset = exports.changePassword = exports.disconnectAllDevices = exports.disconnectDevice = exports.logout = exports.verifyEmail = exports.resendEmail = exports.googleLogin = exports.refresh = exports.updateUser = exports.deleteUser = exports.register = exports.login = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const bcrypt = __importStar(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const regex_1 = require("../utils/regex");
const functions_1 = require("../utils/functions");
const google_auth_library_1 = require("google-auth-library");
const uuid_1 = require("uuid");
const cloud_1 = require("../config/cloud");
const userService_1 = require("../services/userService");
const cardService_1 = require("../services/cardService");
const settingsService_1 = require("../services/settingsService");
const createUserLogin = (res, user, device) => __awaiter(void 0, void 0, void 0, function* () {
    const accessToken = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: '1h',
    });
    const unique = (0, uuid_1.v4)();
    const refreshToken = jsonwebtoken_1.default.sign({ id: user.id, device: device.id, unique }, process.env.JWT_SECRET_REFRESH);
    const hashedToken = yield bcrypt.hash(refreshToken, 10);
    const token = user.tokens.find((t) => t.device_id === device.id);
    if (token) {
        const index = user.tokens.findIndex((t) => t.device_id === device.id);
        user.tokens[index] = {
            device_id: token.device_id,
            type: token.type,
            name: token.name,
            createdAt: token.createdAt,
            token: hashedToken,
            unique,
        };
    }
    else {
        user.tokens.push({
            token: hashedToken,
            device_id: device.id,
            createdAt: new Date(),
            name: device.name,
            type: device.type,
            unique,
        });
        const settings = yield (0, settingsService_1.getUserSettings)(user.id);
        if (settings.emailOnNewDevice) {
            const html = `
				<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
					<h2 style="text-align: center; color: #1a73e8;">New Device Connected</h2>
					<p style="color: #333;">Hi ${user.name},</p>
					<p style="color: #333;">We noticed a new device has been connected to your account:</p>
					<ul style="color: #333; list-style-type: none; padding: 0;">
						<li><strong>Device Name:</strong> ${device.name}</li>
						<li><strong>Device Type:</strong> ${device.type}</li>
					</ul>
					<p style="color: #333;">If this was you, no further action is required. If you did not connect this device, please secure your account immediately by changing your password.</p>
					<p style="color: #333;">Thanks,<br>The Gift Cards Team</p>
				</div>
			`;
            yield (0, functions_1.sendEmail)(user.email, 'New device connected', `New device connected: ${device.name} (${device.type})`, html);
        }
    }
    yield user.save();
    res.json({
        success: true,
        user,
        accessToken,
        refreshToken,
    });
});
const login = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, device, } = req.body;
    if (!email ||
        !password ||
        !device ||
        !device.id ||
        !device.name ||
        !device.type) {
        res.status(400);
        throw new Error('All fields are required');
    }
    if (!regex_1.email_regex.test(email)) {
        res.status(400);
        throw new Error('Invalid email');
    }
    const user = yield (0, userService_1.getUserByEmail)(email);
    if (!user) {
        res.status(400);
        throw new Error('Invalid email or password');
    }
    if (!user.isVerified) {
        res.status(400);
        throw new Error('Please verify your email');
    }
    const isMatch = yield bcrypt.compare(password, user.password);
    if (!isMatch) {
        res.status(400);
        throw new Error('Invalid email or password');
    }
    yield createUserLogin(res, user, device);
}));
exports.login = login;
const register = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password, } = req.body;
    if (!name || !email || !password) {
        res.status(400);
        throw new Error('All fields are required');
    }
    if (!regex_1.email_regex.test(email)) {
        res.status(400);
        throw new Error('Invalid email');
    }
    if (!regex_1.password_regex.test(password)) {
        res.status(400);
        throw new Error('Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, and one number');
    }
    const userFound = yield (0, userService_1.getUserByEmail)(email);
    if (userFound) {
        res.status(400);
        throw new Error('User already exists');
    }
    const salt = yield bcrypt.genSalt(10);
    const hashedPassword = yield bcrypt.hash(password, salt);
    let image_url = undefined;
    if (req.file) {
        const imageID = (0, uuid_1.v4)();
        image_url = yield (0, cloud_1.uploadToCloudinary)(req.file.buffer, `${process.env.CLOUDINARY_BASE_FOLDER}/users`, imageID);
    }
    const user = yield (0, userService_1.createUser)({
        name,
        email,
        password: hashedPassword,
        image: image_url,
        isVerified: false,
    });
    let promises = [];
    promises.push(user.save());
    const htmlContent = `
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
				<img src="${process.env.HOST_ADDRESS}/logo.png" alt="Gift Cards Logo" style="width: 100px; display: block; margin: 0 auto 20px;" />
				<h2 style="text-align: center; color: #333;">Verify Your Email</h2>
				<p>Hi,</p>
				<p>Thank you for signing up for Gift Cards! Please verify your email address by clicking the button below:</p>
				<a href="${process.env.HOST_ADDRESS}/verify/${user.id}" 
					style="display: inline-block; background-color: rgb(37, 103, 217); color: #fff; padding: 10px 20px; border-radius: 5px; text-decoration: none;">
					Verify Email
				</a>
				<p>If you did not sign up for Gift Cards, please ignore this email.</p>
				<p>Thanks,<br>The Gift Cards Team</p>
			</div>
		`;
    promises.push((0, functions_1.sendEmail)(email, 'Verify your email', `please verify your email: ${process.env.HOST_ADDRESS}/verify/${user.id}`, htmlContent));
    const [userSaved, sent] = yield Promise.all(promises);
    res.status(201);
    res.json({
        success: true,
        message: 'User created successfully',
        sent,
    });
}));
exports.register = register;
const deleteUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const id = user.id;
    res.json({
        success: true,
        message: 'User deleted successfully',
    });
}));
exports.deleteUser = deleteUser;
const verifyEmail = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const user = yield (0, userService_1.getUserById)(id);
    if (!user) {
        res.status(400);
        throw new Error('User not found');
    }
    if (user.isVerified) {
        res.status(400);
        throw new Error('Email already verified');
    }
    user.isVerified = true;
    yield user.save();
    res.json({
        success: true,
        message: 'Email verified successfully',
    });
}));
exports.verifyEmail = verifyEmail;
const updateUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const { name, deleteImage, } = req.body;
    if (!name) {
        res.status(400);
        throw new Error('First name and last name and gender are required');
    }
    let image = user.image;
    let deletePictureBool = deleteImage === 'true';
    if (req.file) {
        if (user.image) {
            yield (0, cloud_1.deleteFromCloudinary)(user.image);
        }
        image = yield (0, cloud_1.uploadToCloudinary)(req.file.buffer, `${process.env.CLOUDINARY_BASE_FOLDER}/users`, (0, uuid_1.v4)());
    }
    if (deletePictureBool) {
        if (user.image) {
            yield (0, cloud_1.deleteFromCloudinary)(user.image);
        }
        image = null;
    }
    const userUpdated = yield (0, userService_1.updateUserById)(user.id, {
        image,
        name,
    });
    res.json({
        success: true,
        user: userUpdated,
    });
}));
exports.updateUser = updateUser;
const refresh = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        res.status(400);
        throw new Error('No refresh token provided.');
    }
    let decoded;
    try {
        decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_SECRET_REFRESH);
    }
    catch (error) {
        res.status(400);
        throw new Error('Token failed');
    }
    const user = yield (0, userService_1.getUserById)(decoded.id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    const device = user.tokens.find((t) => t.device_id === decoded.device);
    if (!device) {
        res.status(401);
        throw new Error('Invalid refresh token');
    }
    if (!bcrypt.compareSync(refreshToken, device.token) ||
        device.unique !== decoded.unique) {
        user.tokens = [];
        yield user.save();
        res.status(401);
        throw new Error('Invalid refresh token');
    }
    const accessToken = jsonwebtoken_1.default.sign({ id: decoded.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const unique = (0, uuid_1.v4)();
    const newRefreshToken = jsonwebtoken_1.default.sign({ id: decoded.id, device: device.device_id, unique }, process.env.JWT_SECRET_REFRESH);
    const newHashedToken = yield bcrypt.hash(newRefreshToken, 10);
    const index = user.tokens.findIndex((t) => t.device_id === decoded.device);
    user.tokens[index] = {
        device_id: device.device_id,
        type: device.type,
        name: device.name,
        createdAt: device.createdAt,
        token: newHashedToken,
        unique,
    };
    yield user.save();
    res.json({
        success: true,
        accessToken,
        refreshToken: newRefreshToken,
    });
}));
exports.refresh = refresh;
const logout = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers['authorization'];
    const refreshToken = authHeader && authHeader.split(' ')[1];
    if (!refreshToken) {
        res.status(400);
        throw new Error('No refresh token provided.');
    }
    let decoded;
    try {
        decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_SECRET_REFRESH);
    }
    catch (error) {
        res.status(400);
        throw new Error('Token failed');
    }
    const user = yield (0, userService_1.getUserById)(decoded.id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    const device = user.tokens.find((t) => t.device_id === decoded.device);
    if (!device) {
        res.status(401);
        throw new Error('Invalid token');
    }
    if (!bcrypt.compareSync(refreshToken, device.token) ||
        device.unique !== decoded.unique) {
        user.tokens = [];
        yield user.save();
        res.status(401);
        throw new Error('Invalid refresh token');
    }
    user.tokens = user.tokens.filter((t) => t.device_id !== decoded.device);
    yield user.save();
    res.json({
        success: true,
        message: 'Logged out successfully',
    });
}));
exports.logout = logout;
const resendEmail = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    if (!regex_1.email_regex.test(email)) {
        res.status(400);
        throw new Error('Invalid email');
    }
    const user = yield (0, userService_1.getUserByEmail)(email);
    if (!user) {
        res.status(400);
        throw new Error('User not found');
    }
    if (user.isVerified) {
        res.status(400);
        throw new Error('Email already verified');
    }
    const htmlContent = `
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
				<img src="${process.env.HOST_ADDRESS}/logo.png" alt="Gift Cards Logo" style="width: 100px; display: block; margin: 0 auto 20px;" />
				<h2 style="text-align: center; color: #333;">Verify Your Email</h2>
				<p>Hi,</p>
				<p>Thank you for signing up for Gift Cards! Please verify your email address by clicking the button below:</p>
				<a href="${process.env.HOST_ADDRESS}/verify/${user._id}" 
					style="display: inline-block; background-color:rgb(37, 103, 217); color: #fff; padding: 10px 20px; border-radius: 5px; text-decoration: none;">
					Verify Email
				</a>
				<p>If you did not sign up for Gift Cards, please ignore this email.</p>
				<p>Thanks,<br>The Gift Cards Team</p>
			</div>
		`;
    const sent = yield (0, functions_1.sendEmail)(user.email, 'Verify your email', `please verify your email: ${process.env.HOST_ADDRESS}/verify/${user._id}`, htmlContent);
    res.json({
        success: true,
        sent,
    });
}));
exports.resendEmail = resendEmail;
const googleLogin = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, 'postmessage');
    const { code, device, } = req.body;
    if (!code) {
        res.status(400);
        throw new Error('No code provided');
    }
    if (!device || !device.id || !device.name || !device.type) {
        res.status(400);
        throw new Error('Invalid device');
    }
    const response = yield client.getToken(code);
    const ticket = yield client.verifyIdToken({
        idToken: response.tokens.id_token,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload) {
        res.status(400);
        throw new Error('Invalid code');
    }
    const email = payload.email;
    if (!email) {
        res.status(400);
        throw new Error('Invalid email');
    }
    const user = yield (0, userService_1.getUserByEmail)(email);
    if (!user) {
        // create user
        const password = (0, uuid_1.v4)();
        const newUser = yield (0, userService_1.createUser)({
            name: payload.given_name + ' ' + payload.family_name,
            email,
            password,
            image: payload.picture,
            isVerified: true,
        });
        yield newUser.save();
        yield createUserLogin(res, newUser, device);
    }
    else {
        if (!user.isVerified) {
            user.isVerified = true;
            yield user.save();
        }
        yield createUserLogin(res, user, device);
    }
}));
exports.googleLogin = googleLogin;
const changePassword = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const { password } = req.body;
    if (!password) {
        res.status(400);
        throw new Error('Password is required');
    }
    if (!regex_1.password_regex.test(password)) {
        res.status(400);
        throw new Error('Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, and one number');
    }
    const salt = yield bcrypt.genSalt(10);
    const hashedPassword = yield bcrypt.hash(password, salt);
    user.password = hashedPassword;
    yield user.save();
    res.json({
        success: true,
        message: 'Password changed successfully',
    });
}));
exports.changePassword = changePassword;
const disconnectDevice = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const { id } = req.params;
    const device = user.tokens.find((t) => t.device_id === id);
    if (!device) {
        res.status(404);
        throw new Error('Device not found');
    }
    user.tokens = user.tokens.filter((t) => t.device_id !== id);
    yield user.save();
    res.json({
        success: true,
        message: 'Device disconnected successfully',
    });
}));
exports.disconnectDevice = disconnectDevice;
const disconnectAllDevices = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    user.tokens = [];
    yield user.save();
    res.json({
        success: true,
        message: 'All devices disconnected successfully',
    });
}));
exports.disconnectAllDevices = disconnectAllDevices;
const getConnectedDevices = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const devices = user.tokens.map((t) => ({
        device_id: t.device_id,
        type: t.type,
        name: t.name,
        createdAt: t.createdAt,
    }));
    res.json({
        success: true,
        devices,
    });
}));
exports.getConnectedDevices = getConnectedDevices;
const sendEmailPasswordReset = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    if (!regex_1.email_regex.test(email)) {
        res.status(400);
        throw new Error('Invalid email');
    }
    const user = yield (0, userService_1.getUserByEmail)(email);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    const token = (0, uuid_1.v4)();
    const salt = yield bcrypt.genSalt(10);
    const hashedToken = yield bcrypt.hash(token, salt);
    user.verificationToken = hashedToken;
    user.resetPasswordTokenExpiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now
    yield user.save();
    const htmlContent = `
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
				<img src="${process.env.HOST_ADDRESS}/logo.png" alt="Gift Cards Logo" style="width: 100px; display: block; margin: 0 auto 20px;" />
				<h2 style="text-align: center; color: #333;">Reset Your Password</h2>
				<p>Hi,</p>
				<p>We received a request to reset your password. You can reset it by clicking the link below:</p>
				<a href="${process.env.HOST_ADDRESS}/forgot/password/${token}/${email}" 
					style="display: inline-block; background-color: rgb(37, 103, 217); color: #fff; padding: 10px 20px; border-radius: 5px; text-decoration: none;">
					Reset Password
				</a>
				<p>If you did not request this, please ignore this email. The link will expire in 30 minutes.</p>
				<p>Thanks,<br>Gift Cards Team</p>
			</div>
		`;
    const sent = yield (0, functions_1.sendEmail)(email, 'Reset your password - Gift Cards', `Reset your password: ${process.env.HOST_ADDRESS}/forgot/password/${token}/${email}`, htmlContent);
    res.json({
        success: true,
        sent,
        token: process.env.NODE_ENV === 'test' ? token : undefined,
    });
}));
exports.sendEmailPasswordReset = sendEmailPasswordReset;
const resetPassword = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.params;
    const { password, token } = req.body;
    if (!regex_1.email_regex.test(email)) {
        res.status(400);
        throw new Error('Invalid email');
    }
    if (!regex_1.password_regex.test(password)) {
        res.status(400);
        throw new Error('Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, and one number');
    }
    const user = yield (0, userService_1.getUserByEmail)(email);
    if (!user) {
        res.status(400);
        throw new Error('Invalid token');
    }
    if (!user.verificationToken) {
        res.status(400);
        throw new Error('Invalid token');
    }
    const isMatch = yield bcrypt.compare(token, user.verificationToken);
    if (!isMatch) {
        res.status(400);
        throw new Error('Invalid token');
    }
    const salt = yield bcrypt.genSalt(10);
    const hashedPassword = yield bcrypt.hash(password, salt);
    user.password = hashedPassword;
    user.verificationToken = '';
    user.resetPasswordTokenExpiry = undefined;
    yield user.save();
    res.json({
        success: true,
        message: 'Password changed successfully',
    });
}));
exports.resetPassword = resetPassword;
const createEncryptionKey = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const { salt, verifyToken } = req.body;
    if (!salt || !verifyToken) {
        res.status(400);
        throw new Error('Salt and verify token are required');
    }
    user.salt = salt;
    user.verifyToken = verifyToken;
    yield user.save();
    res.json({
        success: true,
        message: 'Encryption key created successfully',
    });
}));
exports.createEncryptionKey = createEncryptionKey;
const resetEncryptionKey = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const { salt, verifyToken, cards } = req.body;
    if (!salt || !verifyToken) {
        res.status(400);
        throw new Error('Salt and verify token are required');
    }
    user.salt = salt;
    user.verifyToken = verifyToken;
    const promises = [];
    promises.push(user.save());
    if (cards && cards.length > 0) {
        promises.push((0, cardService_1.updateAllCards)(user, cards));
    }
    const [userUpdate, cardsUpdate] = yield Promise.all(promises);
    res.json({
        success: true,
        message: 'Encryption key reset successfully',
        cards: cardsUpdate !== null && cardsUpdate !== void 0 ? cardsUpdate : [],
    });
}));
exports.resetEncryptionKey = resetEncryptionKey;
const changeEncryptionKey = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const { salt, verifyToken, cards } = req.body;
    if (!salt || !verifyToken) {
        res.status(400);
        throw new Error('Salt and verify token are required');
    }
    const promises = [];
    user.salt = salt;
    user.verifyToken = verifyToken;
    promises.push(user.save());
    if (cards && cards.length > 0) {
        promises.push((0, cardService_1.updateAllCards)(user, cards));
    }
    const [userUpdate, cardsUpdate] = yield Promise.all(promises);
    res.json({
        success: true,
        message: 'Encryption key changed successfully',
        cards: cardsUpdate !== null && cardsUpdate !== void 0 ? cardsUpdate : [],
    });
}));
exports.changeEncryptionKey = changeEncryptionKey;
