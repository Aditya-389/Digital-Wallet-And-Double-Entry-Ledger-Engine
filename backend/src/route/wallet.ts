import express from 'express';
import { authHandler } from '../middleware/authHandler.ts';
import { validate } from '../middleware/validate.ts';
import { walletCreateSchema } from '../validation/wallet.schema.ts';
import { createWallet, walletLookup } from '../controller/wallet.ts';

const router = express.Router();

router.post('/create', authHandler, validate(walletCreateSchema), createWallet);
router.get('/lookup', authHandler, walletLookup);

export default router;