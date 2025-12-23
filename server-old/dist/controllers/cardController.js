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
exports.emailMonthNotification = exports.updateCardWithNewSupplier = exports.deleteCard = exports.updateCard = exports.createCard = exports.createCardAndSupplier = exports.getCards = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const cardService_1 = require("../services/cardService");
const supplierService_1 = require("../services/supplierService");
const settingsService_1 = require("../services/settingsService");
const functions_1 = require("../utils/functions");
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
const emailMonthNotification = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const usersSettings = yield (0, settingsService_1.getAllUsersSettings)();
    const now = new Date();
    const oneMonthFromNow = new Date();
    oneMonthFromNow.setMonth(now.getMonth() + 1);
    const twoMonthFromNow = new Date();
    twoMonthFromNow.setMonth(now.getMonth() + 2);
    const cards1Month = yield (0, cardService_1.getCardsBetweenDates)(oneMonthFromNow, now, {
        notified1Month: false,
    });
    const cards2Month = yield (0, cardService_1.getCardsBetweenDates)(twoMonthFromNow, oneMonthFromNow, {
        notified2Month: false,
    });
    for (const card of cards1Month) {
        const notify = (_a = usersSettings.find((userSetting) => userSetting.user.toString() ===
            card.user._id.toString())) === null || _a === void 0 ? void 0 : _a.email1MonthNotification;
        if (notify) {
            const month1Html = `
			<!DOCTYPE html>
			<html>
			<head>
				<style>
					body {
						font-family: Arial, sans-serif;
						background-color: #000;
						color: #fff;
						padding: 20px;
					}
					.container {
						background-color: #1a1a1a;
						border: 1px solid #333;
						border-radius: 8px;
						padding: 20px;
						max-width: 600px;
						margin: 0 auto;
					}
					.header {
						text-align: center;
						color: #3b82f6;
						font-size: 24px;
						margin-bottom: 20px;
					}
					.content {
						color: #fff;
						font-size: 16px;
						line-height: 1.5;
					}
					.card-name {
						color: #3b82f6;
						font-weight: bold;
					}
					.footer {
						margin-top: 20px;
						text-align: center;
						font-size: 14px;
						color: #666;
					}
				</style>
			</head>
			<body>
				<div class="container">
					<div class="header">Card Expiration Notice</div>
					<div class="content">
						<p>Dear User,</p>
						<p>
							This is a friendly reminder that your card 
							<span class="card-name">${card.name}</span> 
							is set to expire in one month.
						</p>
						<p>Please take the necessary actions to renew or replace your card to avoid any inconvenience.</p>
					</div>
					<div class="footer">
						<p>Thank you for using our service!</p>
					</div>
				</div>
			</body>
			</html>
		`;
            (0, functions_1.sendEmail)(card.user.email, 'Card Expiration', `Your card (${card.name}) is expiring in 1 month`, month1Html);
            card.notified1Month = true;
            yield card.save();
        }
    }
    for (const card of cards2Month) {
        const notify = (_b = usersSettings.find((userSetting) => userSetting.user.toString() ===
            card.user._id.toString())) === null || _b === void 0 ? void 0 : _b.email2MonthNotification;
        if (notify) {
            const month2Html = `
			<!DOCTYPE html>
			<html>
			<head>
				<style>
					body {
						font-family: Arial, sans-serif;
						background-color: #000;
						color: #fff;
						padding: 20px;
					}
					.container {
						background-color: #1a1a1a;
						border: 1px solid #333;
						border-radius: 8px;
						padding: 20px;
						max-width: 600px;
						margin: 0 auto;
					}
					.header {
						text-align: center;
						color: #3b82f6;
						font-size: 24px;
						margin-bottom: 20px;
					}
					.content {
						color: #fff;
						font-size: 16px;
						line-height: 1.5;
					}
					.card-name {
						color: #3b82f6;
						font-weight: bold;
					}
					.footer {
						margin-top: 20px;
						text-align: center;
						font-size: 14px;
						color: #666;
					}
				</style>
			</head>
			<body>
				<div class="container">
					<div class="header">Card Expiration Notice</div>
					<div class="content">
						<p>Dear User,</p>
						<p>
							This is a friendly reminder that your card 
							<span class="card-name">${card.name}</span> 
							is set to expire in two month.
						</p>
						<p>Please take the necessary actions to renew or replace your card to avoid any inconvenience.</p>
					</div>
					<div class="footer">
						<p>Thank you for using our service!</p>
					</div>
				</div>
			</body>
			</html>
		`;
            (0, functions_1.sendEmail)(card.user.email, 'Card Expiration', `Your card (${card.name}) is expiring in 2 month`, month2Html);
            card.notified2Month = true;
            yield card.save();
        }
    }
    res.status(200).json({
        success: true,
    });
}));
exports.emailMonthNotification = emailMonthNotification;
