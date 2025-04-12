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
	},
	{ timestamps: true }
);

export default mongoose.model<UserDocument>('User', userScheme);
