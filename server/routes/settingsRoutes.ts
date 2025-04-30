import express from 'express';
import { authUser } from '../middleware/authMiddleware';
import { getSettings, updateSettings } from '../controllers/settingsController';

const router = express.Router();

router.get('/', authUser, getSettings);
router.put('/', authUser, updateSettings);

export default router;
