import * as mongoose from 'mongoose';
import { CardDocument } from '../types/card';

const cardScheme = new mongoose.Schema<CardDocument>(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		name: {
			type: String,
			required: true,
		},
		supplier: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Supplier',
			required: true,
		},
		description: {
			type: String,
		},
		isPhysical: {
			type: Boolean,
			default: false,
		},
		amount: {
			type: Number,
			required: true,
		},
		currency: {
			type: String,
			required: true,
		},
        encryptionKey: {
            type: String,
        },
        encryptedCardNumber: {
            type: String,
        },
		cardNumber: {
			type: String,
		},
		expirationMonth: {
			type: Number,
		},
		expirationYear: {
			type: Number,
		},
		cvv: {
			type: String,
		},
	},
	{ timestamps: true }
);

export default mongoose.model<CardDocument>('Card', cardScheme);
