import { Document } from 'mongoose';

export interface User {
	name: string;
	email: string;
	password: string;
    image?: string;
    isVerified?: boolean;
    verificationToken?: string;
}

export interface UserDocument extends User, Document {}
