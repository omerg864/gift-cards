import { User } from "./user";

export interface Supplier {
	_id: string;
	name: string;
	fromColor: string;
	toColor: string;
	logo?: string;
	description?: string;
	cardTypes: string[];
	stores: Store[];
	user?: User;
}

export interface Store {
	name: string;
	address?: string;
	image?: string;
}

export interface CreateSupplierDetails {
	name: string;
	fromColor: string;
	toColor: string;
	logo?: File | null;
	description?: string;
	cardTypes: string[];
	stores: Store[];
}