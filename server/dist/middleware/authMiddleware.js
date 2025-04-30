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
exports.authAdmin = exports.authUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const userService_1 = require("../services/userService");
const authUser = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
    let decoded;
    try {
        decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
    }
    catch (error) {
        res.status(401);
        throw new Error('Not authorized, token failed');
    }
    const user = yield (0, userService_1.getUserById)(decoded.id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    req.user = user;
    next();
}));
exports.authUser = authUser;
const authAdmin = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
    let decoded;
    try {
        decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
    }
    catch (error) {
        res.status(401);
        throw new Error('Not authorized, token failed');
    }
    const user = yield (0, userService_1.getUserById)(decoded.id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    if (user.admin !== true) {
        res.status(401);
        throw new Error('Not authorized, not an admin');
    }
    req.user = user;
    next();
}));
exports.authAdmin = authAdmin;
