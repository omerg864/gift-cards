import * as mongoose from 'mongoose';
import { SettingsDocument } from '../types/settings';

const settingsScheme = new mongoose.Schema<SettingsDocument>(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		email1MonthNotification: {
			type: Boolean,
			default: true,
		},
		email2MonthNotification: {
			type: Boolean,
			default: true,
		},
		emailOnNewDevice: {
			type: Boolean,
			default: true,
		},
	},
	{ timestamps: true }
);

export default mongoose.model<SettingsDocument>('Settings', settingsScheme);
