import { SupplierDocument } from '../types/supplier';
import * as mongoose from 'mongoose';

const supplierScheme = new mongoose.Schema<SupplierDocument>(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false,
        },
        name: {
            type: String,
            required: true,
        },
        stores: [
            {
                name: {
                    type: String,
                    required: true,
                },
                address: {
                    type: String,
                },
                image: {
                    type: String,
                },
            },
        ],
        image: {
            type: String,
        },
        description: {
            type: String,
        },
        cardTypes: [
            {
                type: String,
                required: true,
            },
        ],
        fromColor: {
            type: String,
            required: true,
        },
        toColor: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

supplierScheme.path('cardTypes').default(['virtual', 'physical']);

export default mongoose.model<SupplierDocument>('Supplier', supplierScheme);
