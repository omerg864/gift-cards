import { SupplierStore } from "@shared/types/supplier.types";

export interface CreateSupplierDetails {
	name: string;
	fromColor: string;
	toColor: string;
	logo?: File | null;
	description?: string;
	cardTypes: string[];
	stores: SupplierStore[];
	deleteImage?: boolean;
}