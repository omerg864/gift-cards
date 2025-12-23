"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./config/db"));
const errorMiddleware_1 = __importDefault(require("./middleware/errorMiddleware"));
const rateLimiterMiddleware_1 = __importDefault(require("./middleware/rateLimiterMiddleware"));
const colors_1 = __importDefault(require("colors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const cardRoutes_1 = __importDefault(require("./routes/cardRoutes"));
const supplierRoutes_1 = __importDefault(require("./routes/supplierRoutes"));
const settingsRoutes_1 = __importDefault(require("./routes/settingsRoutes"));
const cors_1 = __importDefault(require("cors"));
require("./types/global");
dotenv_1.default.config();
const port = process.env.PORT || 5000;
const app = (0, express_1.default)();
(0, db_1.default)();
console.log(process.env.HOST_ADDRESS);
// Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use(errorMiddleware_1.default);
app.use(rateLimiterMiddleware_1.default);
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.HOST_ADDRESS,
    credentials: true,
}));
app.listen(port, () => {
    console.log(colors_1.default.green.underline(`Server running on port ${port}`));
});
// Routes
app.use('/api/user', userRoutes_1.default);
app.use('/api/card', cardRoutes_1.default);
app.use('/api/supplier', supplierRoutes_1.default);
app.use('/api/settings', settingsRoutes_1.default);
app.use(errorMiddleware_1.default);
