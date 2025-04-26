import AsyncHandler from 'express-async-handler';
import {
	deleteUserSupplierById,
	getSupplier,
	getUserSupplier,
	getUserSuppliers,
	newUserSupplier,
	updateSupplier,
} from '../services/supplierService';

const getSuppliers = AsyncHandler(async (req, res) => {
	const user = req.user!;
	const suppliers = await getUserSuppliers(user);
	res.status(200).json({
		success: true,
		suppliers,
	});
});

const createUserSupplier = AsyncHandler(async (req, res) => {
	const user = req.user!;
	const { name, description, fromColor, toColor } = req.body;
	let { stores = '[]', cardTypes = '["digital"]' } = req.body;
	stores = JSON.parse(stores);
	cardTypes = JSON.parse(cardTypes);

	if (!name || !fromColor || !toColor) {
		res.status(400);
		throw new Error('Please add all required fields');
	}
	if (!Array.isArray(cardTypes) || !cardTypes || cardTypes.length === 0) {
		res.status(400);
		throw new Error('Card types are required');
	}

	const supplier = await newUserSupplier(
		req.files,
		name,
		description,
		cardTypes,
		stores,
		fromColor,
		toColor,
		user
	);

	res.status(201).json({
		success: true,
		supplier,
	});
});

const getSupplierById = AsyncHandler(async (req, res) => {
	const user = req.user!;
	const supplierId = req.params.id;

	const supplier = await getSupplier(supplierId, user);

	if (!supplier) {
		res.status(404);
		throw new Error('Supplier not found');
	}

	res.status(200).json({
		success: true,
		supplier,
	});
});

const updateUserSupplier = AsyncHandler(async (req, res) => {
	const user = req.user!;
	const supplierId = req.params.id;
	const { name, deleteImageBool, description, cardTypes } = req.body;
	let { stores = [] } = req.body;

	const deleteImage = deleteImageBool === 'true' ? true : false;

	stores = JSON.parse(stores);

	if (!name) {
		res.status(400);
		throw new Error('Please add all required fields');
	}

	if (!supplierId) {
		res.status(400);
		throw new Error('Please add all required fields');
	}

	const supplier = await getUserSupplier(supplierId, user);

	if (!supplier) {
		res.status(404);
		throw new Error('Supplier not found');
	}

	const updatedSupplier = await updateSupplier(
		supplier,
		{
			name,
			stores,
			description,
			cardTypes,
		},
		user,
		req.file,
		deleteImage
	);

	res.status(200).json({
		success: true,
		supplier: updatedSupplier,
	});
});

const deleteUserSupplier = AsyncHandler(async (req, res) => {
	const user = req.user!;
	const supplierId = req.params.id;
	const supplier = await deleteUserSupplierById(user, supplierId);
	if (!supplier) {
		res.status(404);
		throw new Error('Supplier not found');
	}
	res.status(200).json({
		success: true,
		message: 'Supplier deleted',
	});
});

export {
	getSuppliers,
	createUserSupplier,
	getSupplierById,
	updateUserSupplier,
	deleteUserSupplier,
};
