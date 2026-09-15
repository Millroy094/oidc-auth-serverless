import { Router } from 'express';
import HealthCheckController from '../controllers/health-check.ts';

const router = Router();

router.get('/status', (req, res) => HealthCheckController.getStatus(req, res));

export default router;
