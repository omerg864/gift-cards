import { Document } from 'mongoose';

export interface User {
	name: string;
	email: string;
	password: string;
	image?: string | null;
	isVerified?: boolean;
	verificationToken?: string;
	resetPasswordTokenExpiry?: Date;
	tokens: IToken[];
	admin?: boolean;
	verifyToken?: string;
	salt?: string;
}

export interface IToken {
	token: string;
	device_id: string;
	createdAt: Date;
	name: string;
	type: string;
	unique: string;
}

export interface Device {
	id: string;
	name: string;
	type: string;
}

export interface IDevice {
	createdAt: Date;
	device_id: string;
	name: string;
	type: string;
}

export interface UserDocument extends User, Document {}
