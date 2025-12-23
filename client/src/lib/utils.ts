import { clsx, type ClassValue } from 'clsx';
import {
    browserName,
    isAndroid,
    isIOS,
    isTablet,
    osName,
} from 'react-device-detect';
import { toast } from 'react-toastify';
import { twMerge } from 'tailwind-merge';
import { v4 as uuidv4 } from 'uuid';
import { DeviceDetails } from '../types/user';
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

export const generatePath = ({
	route,
	query,
	params,
}: {
	route: string[];
	query?: Record<string, any>;
	params?: Record<string, string>;
}) => {
	let path = route.join('');
	if (params) {
		Object.keys(params).forEach((key) => {
			path = path.replace(`:${key}`, params[key]);
		});
	}
	if (query) {
		const queryString = new URLSearchParams(query).toString();
		path += `?${queryString}`;
	}
	return path;
};
export const getCloudinaryUrl = (publicId: string | null | undefined) => {
	if (!publicId) return '';
	if (publicId.startsWith('http')) return publicId;
	return `https://res.cloudinary.com/omerg/image/upload/f_webp/${publicId}`;
};
