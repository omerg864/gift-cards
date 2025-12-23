"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertSuppliers = exports.deleteUserSupplierById = exports.updateSupplier = exports.getUserSupplier = exports.getSupplier = exports.getUserSuppliers = exports.newUserSupplier = void 0;
const cloud_1 = require("../config/cloud");
const supplierModel_1 = __importDefault(require("../models/supplierModel"));
const uuid_1 = require("uuid");
const cardService_1 = require("./cardService");
const newUserSupplier = (files, name, description, cardTypes, stores, fromColor, toColor, user) => __awaiter(void 0, void 0, void 0, function* () {
    let logo = undefined;
    let store_images = [];
    if (files) {
        // supplier image
        if (files.supplier) {
            const supplierImage = files.supplier[0];
            logo = yield (0, cloud_1.uploadToCloudinary)(supplierImage.buffer, `${process.env.CLOUDINARY_BASE_FOLDER}/suppliers/${user._id}`, (0, uuid_1.v4)());
        }
        // store images
        if (files.stores_images) {
            const storeImages = files.stores_images;
            for (const storeImage of storeImages) {
                const storeImageUrl = yield (0, cloud_1.uploadToCloudinary)(storeImage.buffer, `${process.env.CLOUDINARY_BASE_FOLDER}/suppliers/${user._id}/stores`, `${(0, uuid_1.v4)()}`);
                store_images.push(storeImageUrl);
            }
        }
    }
    stores = stores.map((store, index) => {
        return Object.assign(Object.assign({}, store), { image: store_images[index] || undefined });
    });
    const supplier = yield supplierModel_1.default.create({
        user: user._id,
        name,
        stores,
        logo,
        description,
        fromColor,
        toColor,
        cardTypes,
    });
    return supplier;
});
exports.newUserSupplier = newUserSupplier;
const getUserSuppliers = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const query = {
        $or: [{ user: user._id }, { user: { $exists: false } }],
    };
    const suppliers = yield supplierModel_1.default.find(query);
    return suppliers;
});
exports.getUserSuppliers = getUserSuppliers;
const getSupplier = (supplierId, user) => __awaiter(void 0, void 0, void 0, function* () {
    const supplier = yield supplierModel_1.default.findOne({
        _id: supplierId,
        $or: [{ user: user._id }, { user: { $exists: false } }],
    });
    return supplier;
});
exports.getSupplier = getSupplier;
const getUserSupplier = (supplierId, user) => __awaiter(void 0, void 0, void 0, function* () {
    const supplier = yield supplierModel_1.default.findOne({
        _id: supplierId,
        user: user._id,
    });
    return supplier;
});
exports.getUserSupplier = getUserSupplier;
const updateSupplier = (supplier, data, user, file, deleteImage) => __awaiter(void 0, void 0, void 0, function* () {
    let logo = supplier.logo || null;
    if (deleteImage) {
        if (supplier.logo) {
            yield (0, cloud_1.deleteFromCloudinary)(supplier.logo);
        }
        logo = null;
    }
    else if (file) {
        if (supplier.logo) {
            yield (0, cloud_1.deleteFromCloudinary)(supplier.logo);
        }
        logo = yield (0, cloud_1.uploadToCloudinary)(file.buffer, `${process.env.CLOUDINARY_BASE_FOLDER}/suppliers/${user._id}`, (0, uuid_1.v4)());
    }
    const updatedSupplier = yield supplierModel_1.default.findByIdAndUpdate(supplier._id, Object.assign(Object.assign({}, data), { logo }), {
        new: true,
        runValidators: true,
    });
    return updatedSupplier;
});
exports.updateSupplier = updateSupplier;
const deleteUserSupplierById = (user, id) => __awaiter(void 0, void 0, void 0, function* () {
    const supplier = yield supplierModel_1.default.findOne({
        _id: id,
        user: user._id,
    });
    if (!supplier) {
        return null;
    }
    let promises = [];
    if (supplier.logo) {
        promises.push((0, cloud_1.deleteFromCloudinary)(supplier.logo));
    }
    for (const store of supplier.stores) {
        if (store.image) {
            promises.push((0, cloud_1.deleteFromCloudinary)(store.image));
        }
    }
    promises.push((0, cardService_1.deleteCardsBySupplierId)(user, id));
    yield Promise.allSettled(promises);
    yield supplierModel_1.default.findByIdAndDelete(id);
    return supplier;
});
exports.deleteUserSupplierById = deleteUserSupplierById;
const upsertSuppliers = (suppliers) => __awaiter(void 0, void 0, void 0, function* () {
    const bulkOps = suppliers.map((supplier) => ({
        updateOne: {
            filter: { name: supplier.name },
            update: {
                $set: {
                    name: supplier.name,
                    stores: supplier.stores,
                    description: supplier.description,
                    logo: supplier.logo,
                    fromColor: supplier.fromColor,
                    toColor: supplier.toColor,
                    cardTypes: supplier.cardTypes,
                },
            },
            upsert: true,
        },
    }));
    yield supplierModel_1.default.bulkWrite(bulkOps, { ordered: false });
});
exports.upsertSuppliers = upsertSuppliers;
