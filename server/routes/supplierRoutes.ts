import express from 'express';
import { upload } from '../config/cloud';
import {
	getSuppliers,
	createUserSupplier,
	getSupplierById,
	updateUserSupplier,
	deleteUserSupplier,
	scrapeBuyMeGiftCards,
	scrapeLoveCardSupplier,
	scrapeMaxGiftCardSupplier,
	scrapeTheGoldCardSupplier
} from '../controllers/supplierController';
import { authUser } from '../middleware/authMiddleware';

const router = express.Router();

const uploadFields = upload.fields([
	{ name: 'supplier', maxCount: 1 },
	{ name: 'stores', maxCount: 20 },
]);

// Route to scrape gift cards
router.get('/scrape/buyme', scrapeBuyMeGiftCards);
router.get('/scrape/lovecard', scrapeLoveCardSupplier);
router.get('/scrape/maxgiftcard', scrapeMaxGiftCardSupplier);
router.get('/scrape/goldcard', scrapeTheGoldCardSupplier);

router.get('/', authUser, getSuppliers);
router.post('/', authUser, uploadFields, createUserSupplier);
router.get('/:id', authUser, getSupplierById);
router.put('/:id', authUser, upload.single('supplier'), updateUserSupplier);
router.delete('/:id', authUser, deleteUserSupplier);

export default router;
