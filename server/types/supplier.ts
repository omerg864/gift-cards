import { Document, ObjectId } from 'mongoose';
import { UserDocument } from './user';

export interface Store {
	name: string;
	address?: string;
	image?: string;
	description?: string;
	store_id?: string;
	website?: string;
	phone?: string;
}

export interface Supplier {
	user?: ObjectId | UserDocument;
	name: string;
	stores: Store[];
	logo?: string;
	description?: string;
	cardTypes: string[];
	fromColor: string;
	toColor: string;
}

export interface SupplierDocument extends Supplier, Document {}
