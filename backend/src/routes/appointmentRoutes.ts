import { Router } from 'express';
import { 
  bookAppointment, 
  updateAppointmentStatus 
} from '../controllers/appointmentController';

const router = Router();

router.post('/', bookAppointment);
router.put('/:id', updateAppointmentStatus);

export default router;
