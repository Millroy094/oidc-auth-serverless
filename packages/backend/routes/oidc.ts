import { Router } from 'express';
import OIDCController, {
  AuthenticateInteractionBody,
  AuthorizeInteractionBody,
} from '../controllers/oidc.ts';

const router = Router();

router.get('/interaction/:uid/status', (req, res) =>
  OIDCController.getInteractionStatus(req, res),
);

router.post<Record<string, string>, unknown, AuthenticateInteractionBody>(
  '/interaction/:uid/authenticate',
  (req, res) => OIDCController.authenticateInteraction(req, res),
);

router.post<Record<string, string>, unknown, AuthorizeInteractionBody>(
  '/interaction/:uid/authorize',
  (req, res) => OIDCController.authorizeInteraction(req, res),
);

router.use('/', (req, res) => OIDCController.setupOidc(req, res));

export default router;
