import { Router } from 'express';
import { 
  createSchedule, 
  updateSchedule, 
  getSchedules 
} from '../controllers/doctorController';

const router = Router();

router.post('/:id/schedules', createSchedule);
router.put('/schedules/:id', updateSchedule);
router.get('/:id/schedules', getSchedules);

export default router;
