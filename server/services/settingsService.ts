import Settings from '../models/settingsModel';
import { Settings as ISettings } from '../types/settings';

const getUserSettings = async (userId: string) => {
	const settings = await Settings.findOne({
		user: userId,
	});
	if (!settings) {
		const newSettings = await Settings.create({
			user: userId,
		});
		return newSettings;
	}
	return settings;
};

const updateUserSettings = async (
	userId: string,
	settingsData: Partial<ISettings>
): Promise<ISettings | null> => {
	const settings = await Settings.findOneAndUpdate(
		{ user: userId },
		settingsData,
		{
			new: true,
			runValidators: true,
		}
	);
	return settings;
};

export { getUserSettings, updateUserSettings };
