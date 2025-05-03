"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cloud_1 = require("../config/cloud");
const supplierController_1 = require("../controllers/supplierController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
const uploadFields = cloud_1.upload.fields([
    { name: 'supplier', maxCount: 1 },
    { name: 'stores', maxCount: 20 },
]);
// Route to scrape gift cards
router.get('/scrape/buyme', supplierController_1.scrapeBuyMeGiftCards);
router.get('/scrape/lovecard', supplierController_1.scrapeLoveCardSupplier);
router.get('/scrape/maxgiftcard', supplierController_1.scrapeMaxGiftCardSupplier);
router.get('/scrape/goldcard', supplierController_1.scrapeTheGoldCardSupplier);
router.get('/scrape/nofshonit', supplierController_1.scrapeNofshonitSupplier);
router.get('/scrape/dreamcard', supplierController_1.scrapeDreamCardSupplier);
router.get('/', authMiddleware_1.authUser, supplierController_1.getSuppliers);
router.post('/', authMiddleware_1.authUser, uploadFields, supplierController_1.createUserSupplier);
router.get('/:id', authMiddleware_1.authUser, supplierController_1.getSupplierById);
router.put('/:id', authMiddleware_1.authUser, cloud_1.upload.single('supplier'), supplierController_1.updateUserSupplier);
router.delete('/:id', authMiddleware_1.authUser, supplierController_1.deleteUserSupplier);
exports.default = router;
