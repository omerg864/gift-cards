import {
	getUserSettings,
	updateUserSettings,
} from '../services/settingsService';
import asyncHandler from 'express-async-handler';
import { Settings } from '../types/settings';

const getSettings = asyncHandler(async (req, res) => {
	const user = req.user!;
	const settings = await getUserSettings(user.id);
	res.status(200).json({
		success: true,
		settings,
	});
});

const updateSettings = asyncHandler(async (req, res) => {
	const user = req.user!;
	const {
		email1MonthNotification,
		email2MonthNotification,
	}: Partial<Settings> = req.body;

	const settingsData: Partial<Settings> = {
		email1MonthNotification,
		email2MonthNotification,
	};
	const settings = await updateUserSettings(user.id, settingsData);
	res.status(200).json({
		success: true,
		settings,
	});
});

export { getSettings, updateSettings };
