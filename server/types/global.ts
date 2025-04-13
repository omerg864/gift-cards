import { Request } from 'express';
import { UserDocument } from './user';

declare module 'express-serve-static-core' {
	interface Request {
		fileValidationError?: string;
		user?: UserDocument;
	}
}

export interface FieldFiles {
	[fieldname: string]: Express.Multer.File[];
}
