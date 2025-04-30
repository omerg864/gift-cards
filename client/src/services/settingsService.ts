import { client, checkToken, axiosErrorHandler } from './client';
import { Settings } from '../types/settings';

export interface SettingsResponse {
	settings: Settings;
	success: boolean;
}

export const getSettings = async (): Promise<Settings> => {
	try {
		const accessToken = await checkToken();
		if (!accessToken) {
			throw new Error('Please login');
		}
		const response = await client.get<SettingsResponse>('/settings', {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});
		return response.data.settings;
	} catch (error) {
		return axiosErrorHandler(error);
	}
};

export const updateSettings = async (
	data: Partial<Settings>
): Promise<Settings> => {
	try {
		const accessToken = await checkToken();
		if (!accessToken) {
			throw new Error('Please login');
		}
		const response = await client.put<SettingsResponse>('/settings', data, {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});
		return response.data.settings;
	} catch (error) {
		return axiosErrorHandler(error);
	}
};
