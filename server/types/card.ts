import { Document, ObjectId } from 'mongoose';
import { UserDocument } from './user';
import { SupplierDocument } from './supplier';

export interface Card {
    user: ObjectId | UserDocument;
    name: string;
    supplier: ObjectId | SupplierDocument;
    description?: string;
    isPhysical: boolean;
    amount: number;
    currency: string;
    cardNumber?: string;
    expirationMonth?: number;
    expirationYear?: number;
    cvv?: string;
    encryptionKey?: string;
    encryptedCardNumber?: string;
}

export interface CardDocument extends Card, Document {}
