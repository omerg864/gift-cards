import { deleteFromCloudinary, uploadToCloudinary } from '../config/cloud';
import { FieldFiles } from '../types/global';
import { Supplier as ISupplier, SupplierDocument } from '../types/supplier';
import { UserDocument } from '../types/user';
import Supplier from '../models/supplierModel';
import { v4 as uuid } from 'uuid';

const newUserSupplier = async (
	files: Express.Request['files'] | undefined,
	name: string,
	description: string | undefined,
	cardTypes: Array<any> | undefined,
	stores: Array<any>,
	user: UserDocument
): Promise<SupplierDocument> => {
	let image: string | undefined = undefined;
	let store_images: string[] = [];
	if (files) {
		// supplier image
		if ((files as FieldFiles).supplier) {
			const supplierImage = (files as FieldFiles).supplier[0];
			image = await uploadToCloudinary(
				supplierImage.buffer,
				`${process.env.CLOUDINARY_BASE_FOLDER}/suppliers/${user._id}`,
				uuid()
			);
		}
		// store images
		if ((files as FieldFiles).stores) {
			const storeImages = (files as FieldFiles).stores;
			for (const storeImage of storeImages) {
				const storeImageUrl = await uploadToCloudinary(
					storeImage.buffer,
					`${process.env.CLOUDINARY_BASE_FOLDER}/suppliers/${user._id}/stores`,
					`${uuid()}`
				);
				store_images.push(storeImageUrl);
			}
		}
	}

	stores = stores.map((store: any, index: number) => {
		return {
			...store,
			image: store_images[index] || undefined,
		};
	});

	const supplier = await Supplier.create({
		user: user._id,
		name,
		stores,
		image,
		description,
		cardTypes,
	});

	return supplier;
};

const getUserSuppliers = async (
	user: UserDocument
): Promise<SupplierDocument[]> => {
	const query = {
		$or: [{ user: user._id }, { user: { $exists: false } }],
	};
	const suppliers = await Supplier.find(query);
	return suppliers;
};

const getSupplier = async (
	supplierId: string,
	user: UserDocument
): Promise<SupplierDocument | null> => {
	const supplier = await Supplier.findOne({
		_id: supplierId,
		$or: [{ user: user._id }, { user: { $exists: false } }],
	});

	return supplier;
};

const getUserSupplier = async (
	supplierId: string,
	user: UserDocument
): Promise<SupplierDocument | null> => {
	const supplier = await Supplier.findOne({
		_id: supplierId,
		user: user._id,
	});

	return supplier;
};

const updateSupplier = async (
	supplier: SupplierDocument,
	data: Partial<ISupplier>,
	user: UserDocument,
	file: Express.Request['file'] | undefined,
	deleteImage: boolean
) => {
	let image: string | undefined = undefined;
	if (deleteImage) {
		if (supplier.image) {
			await deleteFromCloudinary(supplier.image);
		}
		image = undefined;
	} else if (file) {
		if (supplier.image) {
			await deleteFromCloudinary(supplier.image);
		}
		image = await uploadToCloudinary(
			file.buffer,
			`${process.env.CLOUDINARY_BASE_FOLDER}/suppliers/${user._id}`,
			uuid()
		);
	}

	const updatedSupplier = await Supplier.findByIdAndUpdate(
		supplier._id,
		{ ...data, image },
		{
			new: true,
			runValidators: true,
		}
	);

	return updatedSupplier;
};

const deleteUserSupplierById = async (user: UserDocument, id: string) => {
	const supplier = await Supplier.findOne({
		_id: id,
		user: user._id,
	});

	if (!supplier) {
		return null;
	}

	let promises: Promise<any>[] = [];
	if (supplier.image) {
		promises.push(deleteFromCloudinary(supplier.image));
	}

	for (const store of supplier.stores) {
		if (store.image) {
			promises.push(deleteFromCloudinary(store.image));
		}
	}

	await Promise.allSettled(promises);

	await Supplier.findByIdAndDelete(id);

	return supplier;
};

export {
	newUserSupplier,
	getUserSuppliers,
	getSupplier,
	getUserSupplier,
	updateSupplier,
	deleteUserSupplierById,
};
