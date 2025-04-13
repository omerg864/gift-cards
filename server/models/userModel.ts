import { UserDocument } from './../types/user';
import * as mongoose from 'mongoose';

const userScheme = new mongoose.Schema<UserDocument>(
	{
		name: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
		},
		image: {
			type: String,
		},
		isVerified: {
			type: Boolean,
			default: false,
		},
		verificationToken: {
			type: String,
		},
		resetPasswordTokenExpiry: {
			type: Date,
		},
		admin: {
			type: Boolean,
			default: false,
		},
		tokens: [
			{
				token: {
					type: String,
					required: true,
				},
				device_id: {
					type: String,
					required: true,
				},
				createdAt: {
					type: Date,
					default: Date.now,
				},
				name: {
					type: String,
					required: true,
				},
				type: {
					type: String,
					required: true,
				},
				unique: {
					type: String,
					required: true,
				},
			},
		],
	},
	{ timestamps: true }
);

export default mongoose.model<UserDocument>('User', userScheme);
