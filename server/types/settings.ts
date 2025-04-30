import { Document, ObjectId } from 'mongoose';
import { UserDocument } from './user';

export interface Settings {
	user: ObjectId | UserDocument;
	email1MonthNotification: boolean;
	email2MonthNotification: boolean;
}

export interface SettingsDocument extends Settings, Document {}
