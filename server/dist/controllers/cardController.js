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
exports.updateCardWithNewSupplier = exports.deleteCard = exports.updateCard = exports.createCard = exports.createCardAndSupplier = exports.getCards = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const cardService_1 = require("../services/cardService");
const supplierService_1 = require("../services/supplierService");
const getCards = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const { query } = req.query;
    const cards = yield (0, cardService_1.getUserCards)(user, query);
    res.status(200).json({
        success: true,
        cards,
    });
}));
exports.getCards = getCards;
const createCardAndSupplier = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const { name, supplierName, description, isPhysical, amount, currency, cardNumber, cvv, last4, expiry, fromColor, toColor, } = req.body;
    let { stores = '[]' } = req.body;
    stores = JSON.parse(stores);
    if (!supplierName ||
        !name ||
        isNaN(amount) ||
        !currency ||
        !fromColor ||
        !toColor) {
        res.status(400);
        throw new Error('Please add all required fields');
    }
    const newSupplier = yield (0, supplierService_1.newUserSupplier)(undefined, supplierName, '', undefined, stores, fromColor, toColor, user);
    if (!newSupplier) {
        res.status(400);
        throw new Error('Error creating supplier');
    }
    const card = yield (0, cardService_1.newCard)(user, {
        name,
        supplier: newSupplier.id,
        description,
        isPhysical,
        amount,
        currency,
        cardNumber,
        cvv,
        last4,
        expiry,
    });
    if (!card) {
        res.status(400);
        throw new Error('Error creating card');
    }
    res.status(201).json({
        success: true,
        card,
        supplier: newSupplier,
    });
}));
exports.createCardAndSupplier = createCardAndSupplier;
const createCard = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const { name, supplier, description, isPhysical, amount, currency, cardNumber, cvv, last4, expiry, } = req.body;
    if (!supplier || !name || isNaN(amount) || !currency) {
        res.status(400);
        throw new Error('Please add all required fields');
    }
    const card = yield (0, cardService_1.newCard)(user, {
        name,
        supplier,
        description,
        isPhysical,
        amount,
        currency,
        cardNumber,
        cvv,
        last4,
        expiry,
    });
    if (!card) {
        res.status(400);
        throw new Error('Error creating card');
    }
    res.status(201).json({
        success: true,
        card,
    });
}));
exports.createCard = createCard;
const updateCardWithNewSupplier = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const cardId = req.params.id;
    const { name, supplierName, description, isPhysical, amount, currency, cardNumber, cvv, last4, expiry, fromColor, toColor, } = req.body;
    let { stores = '[]' } = req.body;
    stores = JSON.parse(stores);
    if (!supplierName ||
        !name ||
        isNaN(amount) ||
        !currency ||
        !fromColor ||
        !toColor) {
        res.status(400);
        throw new Error('Please add all required fields');
    }
    const newSupplier = yield (0, supplierService_1.newUserSupplier)(undefined, supplierName, '', undefined, stores, fromColor, toColor, user);
    if (!newSupplier) {
        res.status(400);
        throw new Error('Error creating supplier');
    }
    const card = yield (0, cardService_1.updateCardById)(user, cardId, {
        name,
        supplier: newSupplier.id,
        description,
        isPhysical,
        amount,
        currency,
        cardNumber,
        cvv,
        last4,
        expiry,
    });
    if (!card) {
        res.status(400);
        throw new Error('Error updating card');
    }
    res.status(200).json({
        success: true,
        card,
        supplier: newSupplier,
    });
}));
exports.updateCardWithNewSupplier = updateCardWithNewSupplier;
const updateCard = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const cardId = req.params.id;
    const { name, supplier, description, isPhysical, amount, currency, cardNumber, cvv, last4, expiry, } = req.body;
    if (!supplier || !name || isNaN(amount) || !currency) {
        res.status(400);
        throw new Error('Please add all required fields');
    }
    const card = yield (0, cardService_1.updateCardById)(user, cardId, {
        name,
        supplier,
        description,
        isPhysical,
        amount,
        currency,
        cardNumber,
        cvv,
        last4,
        expiry,
    });
    if (!card) {
        res.status(400);
        throw new Error('Error updating card');
    }
    res.status(200).json({
        success: true,
        card,
    });
}));
exports.updateCard = updateCard;
const deleteCard = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const cardId = req.params.id;
    if (!cardId) {
        res.status(400);
        throw new Error('Please add all required fields');
    }
    const card = yield (0, cardService_1.deleteCardById)(user, cardId);
    if (!card) {
        res.status(400);
        throw new Error('Error deleting card');
    }
    res.status(200).json({
        success: true,
        card,
    });
}));
exports.deleteCard = deleteCard;
