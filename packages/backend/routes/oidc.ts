import { Router } from 'express';
import OIDCController, {
  AuthenticateInteractionBody,
  AuthorizeInteractionBody,
} from '../controllers/oidc.ts';
import verifyCaptcha from '../middleware/verify-captcha.ts';
import verifyOrigin from '../middleware/verify-origin.ts';

const router = Router();

// Interaction routes below are only ever called by our own frontend login
// UI, so they're gated behind verifyOrigin. Everything else on this router
// (authorize, token, jwks, userinfo, discovery, via setupOidc) is the actual
// OIDC protocol surface external relying parties call directly.
router.get('/interaction/:uid/status', verifyOrigin, (req, res) =>
  OIDCController.getInteractionStatus(req, res),
);

router.post<Record<string, string>, unknown, AuthenticateInteractionBody>(
  '/interaction/:uid/authenticate',
  verifyOrigin,
  verifyCaptcha,
  (req, res) => OIDCController.authenticateInteraction(req, res),
);

router.post<Record<string, string>, unknown, AuthorizeInteractionBody>(
  '/interaction/:uid/authorize',
  verifyOrigin,
  (req, res) => OIDCController.authorizeInteraction(req, res),
);

router.use('/', (req, res) => OIDCController.setupOidc(req, res));

export default router;
