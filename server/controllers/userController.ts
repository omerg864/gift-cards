import asyncHandler from 'express-async-handler';
import * as bcrypt from 'bcrypt';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { email_regex, password_regex } from '../utils/regex';
import { sendEmail } from '../utils/functions';
import { OAuth2Client } from 'google-auth-library';
import { v4 as uuid } from 'uuid';
import { Device, UserDocument } from '../types/user';
import { deleteFromCloudinary, uploadToCloudinary } from '../config/cloud';
import {
	createUser,
	getUserByEmail,
	getUserById,
	updateUserById,
} from '../services/userService';

const createUserLogin = async (
	res: Response,
	user: UserDocument,
	device: Device
) => {
	const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, {
		expiresIn: '1h',
	});
	const unique = uuid();
	const refreshToken = jwt.sign(
		{ id: user.id, device: device.id, unique },
		process.env.JWT_SECRET_REFRESH!
	);
	const hashedToken = await bcrypt.hash(refreshToken, 10);
	const token = user.tokens.find((t: any) => t.device_id === device.id);
	if (token) {
		const index = user.tokens.findIndex(
			(t: any) => t.device_id === device.id
		);
		user.tokens[index] = {
			device_id: token.device_id,
			type: token.type,
			name: token.name,
			createdAt: token.createdAt,
			token: hashedToken,
			unique,
		};
	} else {
		user.tokens.push({
			token: hashedToken,
			device_id: device.id,
			createdAt: new Date(),
			name: device.name,
			type: device.type,
			unique,
		});
	}
	await user.save();
	res.json({
		success: true,
		user,
		accessToken,
		refreshToken,
	});
};

const login = asyncHandler(
	async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		const {
			email,
			password,
			device,
		}: {
			email: string;
			password: string;
			device: Device;
		} = req.body;
		if (
			!email ||
			!password ||
			!device ||
			!device.id ||
			!device.name ||
			!device.type
		) {
			res.status(400);
			throw new Error('All fields are required');
		}
		if (!email_regex.test(email)) {
			res.status(400);
			throw new Error('Invalid email');
		}
		const user: UserDocument | null = await getUserByEmail(email);
		if (!user) {
			res.status(400);
			throw new Error('Invalid email or password');
		}
		if (!user.isVerified) {
			res.status(400);
			throw new Error('Please verify your email');
		}
		const isMatch = await bcrypt.compare(password, user.password!);
		if (!isMatch) {
			res.status(400);
			throw new Error('Invalid email or password');
		}
		await createUserLogin(res, user, device);
	}
);

const register = asyncHandler(
	async (req: Request, res: Response): Promise<void> => {
		const {
			name,
			email,
			password,
		}: {
			name: string;
			email: string;
			password: string;
		} = req.body;
		if (!name || !email || !password) {
			res.status(400);
			throw new Error('All fields are required');
		}
		if (!email_regex.test(email)) {
			res.status(400);
			throw new Error('Invalid email');
		}
		if (!password_regex.test(password)) {
			res.status(400);
			throw new Error(
				'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, and one number'
			);
		}
		const userFound = await getUserByEmail(email);
		if (userFound) {
			res.status(400);
			throw new Error('User already exists');
		}
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);
		let image_url: string | undefined = undefined;
		if (req.file) {
			const imageID = uuid();
			image_url = await uploadToCloudinary(
				req.file.buffer,
				`${process.env.CLOUDINARY_BASE_FOLDER}/users`,
				imageID
			);
		}
		const user = await createUser({
			name,
			email,
			password: hashedPassword,
			image: image_url,
			isVerified: false,
		});
		let promises: Promise<any>[] = [];
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
		promises.push(
			sendEmail(
				email,
				'Verify your email',
				`please verify your email: ${process.env.HOST_ADDRESS}/verify/${user.id}`,
				htmlContent
			)
		);
		const [userSaved, sent] = await Promise.all(promises);
		res.status(201);
		res.json({
			success: true,
			message: 'User created successfully',
			sent,
		});
	}
);

const deleteUser = asyncHandler(
	async (req: Request, res: Response): Promise<void> => {
		const user = req.user!;
		const id = user.id;

		res.json({
			success: true,
			message: 'User deleted successfully',
		});
	}
);

const verifyEmail = asyncHandler(
	async (req: Request, res: Response): Promise<void> => {
		const { id } = req.params;
		const user = await getUserById(id);
		if (!user) {
			res.status(400);
			throw new Error('User not found');
		}
		if (user.isVerified) {
			res.status(400);
			throw new Error('Email already verified');
		}
		user.isVerified = true;
		await user.save();
		res.json({
			success: true,
			message: 'Email verified successfully',
		});
	}
);

const updateUser = asyncHandler(
	async (req: Request, res: Response): Promise<void> => {
		const user = req.user!;
		const {
			name,
			deletePicture,
		}: {
			name: string;
			deletePicture: string | undefined;
		} = req.body;
		if (!name) {
			res.status(400);
			throw new Error('First name and last name and gender are required');
		}
		let image: string | undefined | null = user.image;
		let deletePictureBool = deletePicture === 'true';
		if (req.file) {
			if (user.image) {
				await deleteFromCloudinary(user.image);
			}
			image = await uploadToCloudinary(
				req.file.buffer,
				`${process.env.CLOUDINARY_BASE_FOLDER}/users`,
				uuid()
			);
		}
		if (deletePictureBool) {
			if (user.image) {
				await deleteFromCloudinary(user.image);
			}
			image = undefined;
		}
		const userUpdated = await updateUserById(user.id, {
			image,
			name,
		});
		res.json({
			success: true,
			user: userUpdated,
		});
	}
);

const refresh = asyncHandler(async (req, res) => {
	const { refreshToken } = req.body;
	if (!refreshToken) {
		res.status(400);
		throw new Error('No refresh token provided.');
	}
	let decoded;
	try {
		decoded = jwt.verify(
			refreshToken,
			process.env.JWT_SECRET_REFRESH!
		) as JwtPayload;
	} catch (error) {
		res.status(400);
		throw new Error('Token failed');
	}

	const user = await getUserById(decoded.id);
	if (!user) {
		res.status(404);
		throw new Error('User not found');
	}
	const device = user.tokens.find((t) => t.device_id === decoded.device);
	if (!device) {
		res.status(401);
		throw new Error('Invalid refresh token');
	}
	if (
		!bcrypt.compareSync(refreshToken, device.token) ||
		device.unique !== decoded.unique
	) {
		user.tokens = [];
		await user.save();
		res.status(401);
		throw new Error('Invalid refresh token');
	}
	const accessToken: string = jwt.sign(
		{ id: decoded.id },
		process.env.JWT_SECRET!,
		{ expiresIn: '1h' }
	);

	const unique = uuid();

	const newRefreshToken: string = jwt.sign(
		{ id: decoded.id, device: device.device_id, unique },
		process.env.JWT_SECRET_REFRESH!
	);

	const newHashedToken = await bcrypt.hash(newRefreshToken, 10);

	const index = user.tokens.findIndex((t) => t.device_id === decoded.device);

	user.tokens[index] = {
		device_id: device.device_id,
		type: device.type,
		name: device.name,
		createdAt: device.createdAt,
		token: newHashedToken,
		unique,
	};
	await user.save();

	res.json({
		success: true,
		accessToken,
		refreshToken: newRefreshToken,
	});
});

const logout = asyncHandler(
	async (req: Request, res: Response): Promise<void> => {
		const authHeader = req.headers['authorization'];
		const refreshToken = authHeader && authHeader.split(' ')[1];
		if (!refreshToken) {
			res.status(400);
			throw new Error('No refresh token provided.');
		}
		let decoded;
		try {
			decoded = jwt.verify(
				refreshToken,
				process.env.JWT_SECRET_REFRESH!
			) as JwtPayload;
		} catch (error) {
			res.status(400);
			throw new Error('Token failed');
		}
		const user = await getUserById(decoded.id);
		if (!user) {
			res.status(404);
			throw new Error('User not found');
		}
		const device = user.tokens.find((t) => t.device_id === decoded.device);
		if (!device) {
			res.status(401);
			throw new Error('Invalid token');
		}
		if (
			!bcrypt.compareSync(refreshToken, device.token) ||
			device.unique !== decoded.unique
		) {
			user.tokens = [];
			await user.save();
			res.status(401);
			throw new Error('Invalid refresh token');
		}
		user.tokens = user.tokens.filter((t) => t.device_id !== decoded.device);
		await user.save();
		res.json({
			success: true,
			message: 'Logged out successfully',
		});
	}
);

const resendEmail = asyncHandler(
	async (req: Request, res: Response): Promise<void> => {
		const { email } = req.body;
		if (!email_regex.test(email)) {
			res.status(400);
			throw new Error('Invalid email');
		}
		const user = await getUserByEmail(email);
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

		const sent = await sendEmail(
			user.email,
			'Verify your email',
			`please verify your email: ${process.env.HOST_ADDRESS}/verify/${user._id}`,
			htmlContent
		);
		res.json({
			success: true,
			sent,
		});
	}
);

const googleLogin = asyncHandler(
	async (req: Request, res: Response): Promise<void> => {
		const client = new OAuth2Client(
			process.env.GOOGLE_CLIENT_ID,
			process.env.GOOGLE_CLIENT_SECRET,
			'postmessage'
		);
		const {
			code,
			device,
		}: {
			code: string;
			device: Device;
		} = req.body;
		if (!code) {
			res.status(400);
			throw new Error('No code provided');
		}
		if (!device || !device.id || !device.name || !device.type) {
			res.status(400);
			throw new Error('Invalid device');
		}
		const response = await client.getToken(code);
		const ticket = await client.verifyIdToken({
			idToken: response.tokens.id_token!,
			audience: process.env.GOOGLE_CLIENT_ID!,
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
		const user = await getUserByEmail(email);
		if (!user) {
			// create user
			const password = uuid();
			const newUser = await createUser({
				name: payload.given_name + ' ' + payload.family_name,
				email,
				password,
				image: payload.picture,
				isVerified: true,
			});
			await newUser.save();
			await createUserLogin(res, newUser, device);
		} else {
			if (!user.isVerified) {
				user.isVerified = true;
				await user.save();
			}
			await createUserLogin(res, user, device);
		}
	}
);

const changePassword = asyncHandler(
	async (req: Request, res: Response): Promise<void> => {
		const user = req.user!;
		const { password } = req.body;
		if (!password) {
			res.status(400);
			throw new Error('Password is required');
		}
		if (!password_regex.test(password)) {
			res.status(400);
			throw new Error(
				'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, and one number'
			);
		}
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);
		user.password = hashedPassword;
		await user.save();
		res.json({
			success: true,
			message: 'Password changed successfully',
		});
	}
);

const disconnectDevice = asyncHandler(
	async (req: Request, res: Response): Promise<void> => {
		const user = req.user!;
		const { id } = req.params;
		const device = user.tokens.find((t) => t.device_id === id);
		if (!device) {
			res.status(404);
			throw new Error('Device not found');
		}
		user.tokens = user.tokens.filter((t) => t.device_id !== id);
		await user.save();
		res.json({
			success: true,
			message: 'Device disconnected successfully',
		});
	}
);

const disconnectAllDevices = asyncHandler(
	async (req: Request, res: Response): Promise<void> => {
		const user = req.user!;
		user.tokens = [];
		await user.save();
		res.json({
			success: true,
			message: 'All devices disconnected successfully',
		});
	}
);

const sendEmailPasswordReset = asyncHandler(
	async (req: Request, res: Response): Promise<void> => {
		const { email } = req.body;
		if (!email_regex.test(email)) {
			res.status(400);
			throw new Error('Invalid email');
		}
		const user = await getUserByEmail(email);
		if (!user) {
			res.status(404);
			throw new Error('User not found');
		}
		const token = uuid();
		const salt = await bcrypt.genSalt(10);
		const hashedToken = await bcrypt.hash(token, salt);
		user.verificationToken = hashedToken;
		user.resetPasswordTokenExpiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now
		await user.save();
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

		const sent = await sendEmail(
			email,
			'Reset your password - Gift Cards',
			`Reset your password: ${process.env.HOST_ADDRESS}/forgot/password/${token}/${email}`,
			htmlContent
		);

		res.json({
			success: true,
			sent,
			token: process.env.NODE_ENV === 'test' ? token : undefined,
		});
	}
);

const resetPassword = asyncHandler(
	async (req: Request, res: Response): Promise<void> => {
		const { email } = req.params;
		const { password, token } = req.body;
		if (!email_regex.test(email)) {
			res.status(400);
			throw new Error('Invalid email');
		}
		if (!password_regex.test(password)) {
			res.status(400);
			throw new Error(
				'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, and one number'
			);
		}
		const user = await getUserByEmail(email);
		if (!user) {
			res.status(400);
			throw new Error('Invalid token');
		}
		if (!user.verificationToken) {
			res.status(400);
			throw new Error('Invalid token');
		}
		const isMatch = await bcrypt.compare(token, user.verificationToken);
		if (!isMatch) {
			res.status(400);
			throw new Error('Invalid token');
		}
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);
		user.password = hashedPassword;
		user.verificationToken = '';
		user.resetPasswordTokenExpiry = undefined;
		await user.save();
		res.json({
			success: true,
			message: 'Password changed successfully',
		});
	}
);

const createEncryptionKey = asyncHandler(
	async (req: Request, res: Response): Promise<void> => {
		const user = req.user!;
		const { salt, verifyToken } = req.body;

		if (!salt || !verifyToken) {
			res.status(400);
			throw new Error('Salt and verify token are required');
		}

		user.salt = salt;
		user.verifyToken = verifyToken;
		await user.save();

		res.json({
			success: true,
			message: 'Encryption key created successfully',
		});
	}
);

export {
	login,
	register,
	deleteUser,
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
	createEncryptionKey
};
