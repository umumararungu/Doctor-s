import { Router } from 'express';
import { 
  createPaymentIntent, 
  handleWebhook 
} from '../controllers/paymentController';

const router = Router();

router.post('/create-intent', createPaymentIntent);
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

export default router;
