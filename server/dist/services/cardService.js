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
exports.getCardsBetweenDates = exports.deleteCardsBySupplierId = exports.updateAllCards = exports.deleteCardById = exports.updateCardById = exports.newCard = exports.getUserCards = void 0;
const cardModel_1 = __importDefault(require("../models/cardModel"));
const getUserCards = (user, query) => __awaiter(void 0, void 0, void 0, function* () {
    const cards = yield cardModel_1.default.find({ user: user._id }).populate('supplier');
    if (!query) {
        return cards;
    }
    const filteredCards = cards.filter((card) => {
        var _a;
        if (query) {
            const regex = new RegExp(query, 'i');
            return (card.name.match(regex) ||
                card.supplier.name.match(regex) ||
                ((_a = card.description) === null || _a === void 0 ? void 0 : _a.match(regex)) ||
                card.supplier.stores.some((store) => store.name.match(regex)));
        }
        return true;
    });
    return filteredCards;
});
exports.getUserCards = getUserCards;
const newCard = (user, data) => __awaiter(void 0, void 0, void 0, function* () {
    const card = yield cardModel_1.default.create(Object.assign({ user: user._id }, data));
    return card;
});
exports.newCard = newCard;
const updateCardById = (user, id, data) => __awaiter(void 0, void 0, void 0, function* () {
    const card = yield cardModel_1.default.findOneAndUpdate({ _id: id, user: user._id }, data, {
        new: true,
        runValidators: true,
    });
    return card;
});
exports.updateCardById = updateCardById;
const deleteCardById = (user, id) => __awaiter(void 0, void 0, void 0, function* () {
    const card = yield cardModel_1.default.findOneAndDelete({ _id: id, user: user._id });
    return card;
});
exports.deleteCardById = deleteCardById;
const updateAllCards = (user, data) => __awaiter(void 0, void 0, void 0, function* () {
    const promises = [];
    for (const cardData of data) {
        const card = yield cardModel_1.default.findOneAndUpdate({ _id: cardData._id, user: user._id }, cardData, {
            new: true,
            runValidators: true,
        });
        promises.push(card);
    }
    yield Promise.all(promises);
    return promises;
});
exports.updateAllCards = updateAllCards;
const deleteCardsBySupplierId = (user, supplierId) => __awaiter(void 0, void 0, void 0, function* () {
    const cards = yield cardModel_1.default.find({ user: user._id, supplier: supplierId });
    const deletePromises = cards.map((card) => {
        return cardModel_1.default.findOneAndDelete({ _id: card._id, user: user._id });
    });
    yield Promise.all(deletePromises);
    return cards;
});
exports.deleteCardsBySupplierId = deleteCardsBySupplierId;
const getCardsBetweenDates = (endDate_1, ...args_1) => __awaiter(void 0, [endDate_1, ...args_1], void 0, function* (endDate, startDate = new Date(), query = {}) {
    const cards = yield cardModel_1.default.find(Object.assign({ expiry: {
            $gte: startDate,
            $lte: endDate,
        } }, query)).populate('user');
    if (!cards) {
        return [];
    }
    return cards;
});
exports.getCardsBetweenDates = getCardsBetweenDates;
