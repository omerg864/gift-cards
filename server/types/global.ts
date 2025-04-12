import { Request } from 'express';
import { UserDocument } from './user';

declare module 'express-serve-static-core' {
	interface Request {
		fileValidationError?: string;
		user?: UserDocument;
	}
}
