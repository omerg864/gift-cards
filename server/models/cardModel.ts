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
		cardNumber: {
			type: String,
		},
		expiry: {
			type: Date,
		},
		last4: {
			type: String,
		},
		cvv: {
			type: String,
		},
	},
	{ timestamps: true }
);

export default mongoose.model<CardDocument>('Card', cardScheme);
