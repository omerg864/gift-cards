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
exports.scrapeMaxGiftCardSupplier = exports.scrapeLoveCardSupplier = exports.scrapeBuyMeGiftCards = exports.deleteUserSupplier = exports.updateUserSupplier = exports.getSupplierById = exports.createUserSupplier = exports.getSuppliers = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const supplierService_1 = require("../services/supplierService");
const Scraper_1 = require("../utils/Scraper");
const constants_1 = require("../utils/constants");
const colors_1 = require("../utils/colors");
const getSuppliers = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const suppliers = yield (0, supplierService_1.getUserSuppliers)(user);
    res.status(200).json({
        success: true,
        suppliers,
    });
}));
exports.getSuppliers = getSuppliers;
const createUserSupplier = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const { name, description, fromColor, toColor } = req.body;
    let { stores = '[]', cardTypes = '["digital"]' } = req.body;
    stores = JSON.parse(stores);
    cardTypes = JSON.parse(cardTypes);
    if (!Array.isArray(cardTypes) || cardTypes.length === 0) {
        res.status(400);
        throw new Error('Card types are required');
    }
    if (!Array.isArray(stores)) {
        res.status(400);
        throw new Error('Stores are required');
    }
    if (!name || !fromColor || !toColor) {
        res.status(400);
        throw new Error('Please add all required fields');
    }
    if (!Array.isArray(cardTypes) || !cardTypes || cardTypes.length === 0) {
        res.status(400);
        throw new Error('Card types are required');
    }
    const supplier = yield (0, supplierService_1.newUserSupplier)(req.files, name, description, cardTypes, stores, fromColor, toColor, user);
    res.status(201).json({
        success: true,
        supplier,
    });
}));
exports.createUserSupplier = createUserSupplier;
const getSupplierById = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const supplierId = req.params.id;
    const supplier = yield (0, supplierService_1.getSupplier)(supplierId, user);
    if (!supplier) {
        res.status(404);
        throw new Error('Supplier not found');
    }
    res.status(200).json({
        success: true,
        supplier,
    });
}));
exports.getSupplierById = getSupplierById;
const updateUserSupplier = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const supplierId = req.params.id;
    const { name, deleteImageBool, description, fromColor, toColor } = req.body;
    let { stores = '[]', cardTypes = '["digital"]' } = req.body;
    const deleteImage = deleteImageBool === 'true' ? true : false;
    stores = JSON.parse(stores);
    cardTypes = JSON.parse(cardTypes);
    if (!Array.isArray(cardTypes) || !cardTypes || cardTypes.length === 0) {
        res.status(400);
        throw new Error('Card types are required');
    }
    if (!Array.isArray(stores)) {
        res.status(400);
        throw new Error('Stores are required');
    }
    if (!name) {
        res.status(400);
        throw new Error('Please add all required fields');
    }
    if (!supplierId) {
        res.status(400);
        throw new Error('Please add all required fields');
    }
    const supplier = yield (0, supplierService_1.getUserSupplier)(supplierId, user);
    if (!supplier) {
        res.status(404);
        throw new Error('Supplier not found');
    }
    const updatedSupplier = yield (0, supplierService_1.updateSupplier)(supplier, {
        name,
        stores,
        description,
        cardTypes,
        fromColor,
        toColor,
    }, user, req.file, deleteImage);
    res.status(200).json({
        success: true,
        supplier: updatedSupplier,
    });
}));
exports.updateUserSupplier = updateUserSupplier;
const deleteUserSupplier = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const supplierId = req.params.id;
    const supplier = yield (0, supplierService_1.deleteUserSupplierById)(user, supplierId);
    if (!supplier) {
        res.status(404);
        throw new Error('Supplier not found');
    }
    res.status(200).json({
        success: true,
        message: 'Supplier deleted',
    });
}));
exports.deleteUserSupplier = deleteUserSupplier;
const scrapeBuyMeGiftCards = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const options = {
        retryCount: 3,
        cacheTtl: 1000 * 60 * 10,
    };
    const buyMeSuppliers = [];
    for (let i = 0; i < constants_1.buyMeGiftCardsList.length; i++) {
        const giftCardData = constants_1.buyMeGiftCardsList[i];
        const stores = yield Scraper_1.GiftCardScraper.scrapeBuyMe(giftCardData.url, options);
        buyMeSuppliers.push({
            name: giftCardData.name,
            stores: stores,
            description: 'Buy Me',
            logo: 'https://buyme.co.il/files/siteNewLogo17573670.jpg?v=1743667959',
            fromColor: '#ffc400',
            toColor: (0, colors_1.getDarkerColor)('#ffc400'),
            cardTypes: ['digital'],
        });
    }
    if (buyMeSuppliers.length === 0) {
        res.status(404);
        throw new Error('No suppliers found');
    }
    (0, supplierService_1.upsertSuppliers)(buyMeSuppliers);
    res.status(200).json({
        success: true,
        buyMeSuppliers,
    });
}));
exports.scrapeBuyMeGiftCards = scrapeBuyMeGiftCards;
const scrapeLoveCardSupplier = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const options = {
        retryCount: 3,
        cacheTtl: 1000 * 60 * 10,
    };
    const loveCardSuppliers = [];
    for (let i = 0; i < constants_1.loveCardGiftCardsList.length; i++) {
        const giftCardData = constants_1.loveCardGiftCardsList[i];
        const stores = yield Scraper_1.GiftCardScraper.scrapeLoveCard(giftCardData.url, options);
        loveCardSuppliers.push({
            name: giftCardData.name,
            stores: stores,
            description: 'Love Card',
            logo: 'https://img.ice.co.il/giflib/news/rsPhoto/sz_193/rsz_615_346_lovegiftcard870_190818.jpg',
            fromColor: '#383838',
            toColor: (0, colors_1.getDarkerColor)('#383838'),
            cardTypes: ['digital', 'physical'],
        });
    }
    if (loveCardSuppliers.length === 0) {
        res.status(404);
        throw new Error('No suppliers found');
    }
    (0, supplierService_1.upsertSuppliers)(loveCardSuppliers);
    res.status(200).json({
        success: true,
        loveCardSuppliers,
    });
}));
exports.scrapeLoveCardSupplier = scrapeLoveCardSupplier;
const scrapeMaxGiftCardSupplier = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const options = {
        retryCount: 3,
        cacheTtl: 1000 * 60 * 10,
    };
    const maxGiftCardSuppliers = [];
    for (let i = 0; i < constants_1.maxGiftCardList.length; i++) {
        const giftCardData = constants_1.maxGiftCardList[i];
        const stores = yield Scraper_1.GiftCardScraper.scrapeLoveCard(giftCardData.url, options);
        maxGiftCardSuppliers.push({
            name: giftCardData.name,
            stores: stores,
            description: 'Max Gift Card',
            logo: 'https://res.cloudinary.com/omerg/image/upload/v1746091807/GiftCard/suppliers/gv7q3hycpoaagzzhnydh.png',
            fromColor: '#0DF4F8',
            toColor: (0, colors_1.getDarkerColor)('#0DF4F8'),
            cardTypes: ['digital', 'physical'],
        });
    }
    if (maxGiftCardSuppliers.length === 0) {
        res.status(404);
        throw new Error('No suppliers found');
    }
    (0, supplierService_1.upsertSuppliers)(maxGiftCardSuppliers);
    res.status(200).json({
        success: true,
        maxGiftCardSuppliers,
    });
}));
exports.scrapeMaxGiftCardSupplier = scrapeMaxGiftCardSupplier;
