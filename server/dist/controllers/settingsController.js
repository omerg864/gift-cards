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
exports.updateSettings = exports.getSettings = void 0;
const settingsService_1 = require("../services/settingsService");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const getSettings = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const settings = yield (0, settingsService_1.getUserSettings)(user.id);
    res.status(200).json({
        success: true,
        settings,
    });
}));
exports.getSettings = getSettings;
const updateSettings = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const { email1MonthNotification, email2MonthNotification, } = req.body;
    const settingsData = {
        email1MonthNotification,
        email2MonthNotification,
    };
    const settings = yield (0, settingsService_1.updateUserSettings)(user.id, settingsData);
    res.status(200).json({
        success: true,
        settings,
    });
}));
exports.updateSettings = updateSettings;
