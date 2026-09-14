import { Router } from 'express';
import OIDCController from '../controllers/oidc.ts';

const router = Router();

router.get('/interaction/:uid/status', OIDCController.getInteractionStatus);

router.post(
  '/interaction/:uid/authenticate',
  OIDCController.authenticateInteraction,
);

router.post('/interaction/:uid/authorize', OIDCController.authorizeInteraction);

router.use('/', OIDCController.setupOidc);

export default router;
