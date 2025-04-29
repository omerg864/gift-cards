export interface DeviceDetails {
	id: string;
	name: string;
	type: string;
}

export interface Device {
	createdAt: string;
	device_id: string;
	name: string;
	type: string;
}

export interface User {
	_id: string;
	name: string;
	email: string;
	image?: string;
	isVerified?: boolean;
	verifyToken?: string;
	salt?: string;
}
