"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cardController_1 = require("../controllers/cardController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const cloud_1 = require("../config/cloud");
const router = express_1.default.Router();
const uploadFields = cloud_1.upload.fields([
    { name: 'supplier', maxCount: 1 },
    { name: 'stores_images', maxCount: 100 },
]);
router.get('/email/month', cardController_1.emailMonthNotification);
router.get('/', authMiddleware_1.authUser, cardController_1.getCards);
router.post('/', authMiddleware_1.authUser, cardController_1.createCard);
router.post('/supplier', authMiddleware_1.authUser, uploadFields, cardController_1.createCardAndSupplier);
router.put('/:id', authMiddleware_1.authUser, cardController_1.updateCard);
router.put('/supplier/:id', authMiddleware_1.authUser, uploadFields, cardController_1.updateCardWithNewSupplier);
router.delete('/:id', authMiddleware_1.authUser, cardController_1.deleteCard);
exports.default = router;
