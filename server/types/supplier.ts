import { Document, ObjectId } from 'mongoose';
import { UserDocument } from './user';

export interface Store {
    name: string;
    address?: string;
    image?: string;
}

export interface Supplier {
    user?: ObjectId | UserDocument;
    name: string;
    stores: Store[];
    image?: string;
    description?: string;
    cardTypes: string[];
}

export interface SupplierDocument extends Supplier, Document {}
