import express from 'express';
import { authHandler } from '../middleware/authHandler.ts';
import { validate } from '../middleware/validate.ts';
import { walletCreateSchema } from '../validation/wallet.schema.ts';
import { createWallet, deactivateWallet, singleWalletDetails, walletLookup } from '../controller/wallet.ts';

const router = express.Router();

router.post('/create', authHandler, validate(walletCreateSchema), createWallet);
router.get('/lookup', authHandler, walletLookup);
router.get('/lookup/:id', authHandler, singleWalletDetails);
router.patch('/:id/deactivate', authHandler, deactivateWallet);

export default router;