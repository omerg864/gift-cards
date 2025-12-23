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
exports.updateUserById = exports.createUser = exports.getUserById = exports.getUserByEmail = void 0;
const userModel_1 = __importDefault(require("../models/userModel"));
const getUserByEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield userModel_1.default.findOne({
        email: { $regex: new RegExp(`^${email}$`, 'i') },
    });
    return user;
});
exports.getUserByEmail = getUserByEmail;
const getUserById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield userModel_1.default.findById(id);
    return user;
});
exports.getUserById = getUserById;
const createUser = (userData) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield userModel_1.default.create(userData);
    return user;
});
exports.createUser = createUser;
const updateUserById = (id, updateData) => __awaiter(void 0, void 0, void 0, function* () {
    const updatedUser = yield userModel_1.default.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
    });
    return updatedUser;
});
exports.updateUserById = updateUserById;
