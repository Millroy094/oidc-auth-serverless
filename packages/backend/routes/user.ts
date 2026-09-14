import { Router } from 'express';
import UserController from '../controllers/user.ts';
import authenticate from '../middleware/authenticate.ts';
import PasskeyController from '../controllers/passkey.ts';

const router = Router();

router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.get('/logout', UserController.logout);
router.get('/is-authenticated', authenticate, UserController.isAuthenticated);
router.get('/profile-details', authenticate, UserController.getProfileDetails);

router.put(
  '/profile-details',
  authenticate,
  UserController.updateProfileDetails,
);

router.get('/sessions', authenticate, UserController.getSessions);

router.delete('/sessions', authenticate, UserController.deleteAllSessions);

router.delete(
  '/sessions/:sessionId',
  authenticate,
  UserController.deleteSession,
);

router.get('/mfa-settings', authenticate, UserController.getMFASettings);
router.post('/mfa-setup', authenticate, UserController.setupMFA);
router.post('/mfa-verify', authenticate, UserController.verifyMFA);
router.post('/mfa-reset', authenticate, UserController.resetMFA);
router.post(
  '/mfa-change-preference',
  authenticate,
  UserController.changeMFAPreference,
);
router.get(
  '/generate-recovery-codes',
  authenticate,
  UserController.generateRecoveryCodes,
);

router.get('/get-passkeys', authenticate, PasskeyController.getPasskeys);
router.delete('/delete-passkey', authenticate, PasskeyController.deletePasskey);
router.post(
  '/register-passkey',
  authenticate,
  PasskeyController.registerPasskey,
);
router.post(
  '/verify-passkey-registration',
  authenticate,
  PasskeyController.verifyPasskeyRegistration,
);
router.post('/login-with-passkey', PasskeyController.loginWithPasskey);
router.post('/verify-passkey-login', PasskeyController.verifyLoginPasskey);
router.post(
  '/check-passkey-already-exists',
  authenticate,
  PasskeyController.checkPasskeyExists,
);

router.post('/send-otp', UserController.sendOtp);
router.post('/change-password', UserController.changePassword);

router.get('/get-login-configuration', UserController.getLoginConfiguration);

export default router;
