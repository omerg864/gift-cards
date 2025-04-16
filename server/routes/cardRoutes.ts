import express from 'express';
import {
	getCards,
	createCardAndSupplier,
	createCard,
	updateCard,
	updateCardWithNewSupplier,
	deleteCard,
} from '../controllers/cardController';
import { authUser } from '../middleware/authMiddleware';
import { upload } from '../config/cloud';

const router = express.Router();

const uploadFields = upload.fields([
	{ name: 'supplier', maxCount: 1 },
	{ name: 'stores_images', maxCount: 100 },
]);

router.get('/', authUser, getCards);
router.post('/', authUser, createCard);
router.post('/supplier', authUser, uploadFields, createCardAndSupplier);
router.put('/:id', authUser, updateCard);
router.put('/supplier/:id', authUser, uploadFields, updateCardWithNewSupplier);
router.delete('/:id', authUser, deleteCard);

export default router;
