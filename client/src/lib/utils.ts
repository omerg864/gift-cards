import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
	browserName,
	osName,
	isIOS,
	isAndroid,
	isTablet,
} from 'react-device-detect';
import { v4 as uuidv4 } from 'uuid';
import { DeviceDetails } from '../types/user';
import { toast } from 'react-toastify';
import { DEVICE_ID } from './constants';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const getDeviceDetails = (): DeviceDetails => {
	let id = localStorage.getItem(DEVICE_ID);
	if (!id) {
		id = uuidv4();
		localStorage.setItem(DEVICE_ID, id);
	}
	let name = `${browserName} (${osName})`;
	let type = 'desktop';
	if (isIOS) {
		if (isTablet) {
			name = 'iPad';
			type = 'tablet';
		} else {
			name = 'iPhone';
			type = 'mobile';
		}
	} else if (isAndroid) {
		if (isTablet) {
			name = 'Android tablet';
			type = 'tablet';
		} else {
			name = 'Android phone';
			type = 'mobile';
		}
	}
	return { name, type, id };
};

export const toastError = (error: unknown) => {
	if (error instanceof Error) {
		toast.error(error.message);
	} else {
		toast.error('Login failed due to an unexpected error.');
	}
};
