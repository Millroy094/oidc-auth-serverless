import { Router } from 'express';
import PasskeyController, {
  CheckPasskeyExistsBody,
  DeletePasskeyBody,
  GetPasskeysQuery,
  LoginWithPasskeyBody,
  RegisterPasskeyBody,
  VerifyLoginPasskeyBody,
  VerifyPasskeyRegistrationBody,
} from '../controllers/passkey.ts';
import UserController, {
  ChangeMFAPreferenceBody,
  ChangePasswordBody,
  LoginBody,
  LoginConfigurationQuery,
  RegisterBody,
  ResetMFABody,
  SendOtpBody,
  SessionIdParams,
  SetupMFABody,
  VerifyMFABody,
} from '../controllers/user.ts';
import authenticate from '../middleware/authenticate.ts';
import verifyCaptcha from '../middleware/verify-captcha.ts';

const router = Router();

router.post<Record<string, string>, unknown, RegisterBody>(
  '/register',
  verifyCaptcha,
  (req, res) => UserController.register(req, res),
);
router.post<Record<string, string>, unknown, LoginBody>(
  '/login',
  verifyCaptcha,
  (req, res) => UserController.login(req, res),
);
router.get('/logout', (req, res) => UserController.logout(req, res));
router.get('/is-authenticated', authenticate, (req, res) =>
  UserController.isAuthenticated(req, res),
);
router.get('/profile-details', authenticate, (req, res) =>
  UserController.getProfileDetails(req, res),
);

router.put('/profile-details', authenticate, (req, res) =>
  UserController.updateProfileDetails(req, res),
);

router.get('/sessions', authenticate, (req, res) =>
  UserController.getSessions(req, res),
);

router.delete('/sessions', authenticate, (req, res) =>
  UserController.deleteAllSessions(req, res),
);

router.delete<SessionIdParams>(
  '/sessions/:sessionId',
  authenticate,
  (req, res) => UserController.deleteSession(req, res),
);

router.get('/mfa-settings', authenticate, (req, res) =>
  UserController.getMFASettings(req, res),
);
router.post<Record<string, string>, unknown, SetupMFABody>(
  '/mfa-setup',
  authenticate,
  (req, res) => UserController.setupMFA(req, res),
);
router.post<Record<string, string>, unknown, VerifyMFABody>(
  '/mfa-verify',
  authenticate,
  (req, res) => UserController.verifyMFA(req, res),
);
router.post<Record<string, string>, unknown, ResetMFABody>(
  '/mfa-reset',
  authenticate,
  (req, res) => UserController.resetMFA(req, res),
);
router.post<Record<string, string>, unknown, ChangeMFAPreferenceBody>(
  '/mfa-change-preference',
  authenticate,
  (req, res) => UserController.changeMFAPreference(req, res),
);
router.get('/generate-recovery-codes', authenticate, (req, res) =>
  UserController.generateRecoveryCodes(req, res),
);

router.get<Record<string, string>, unknown, unknown, GetPasskeysQuery>(
  '/get-passkeys',
  authenticate,
  (req, res) => PasskeyController.getPasskeys(req, res),
);
router.delete<Record<string, string>, unknown, DeletePasskeyBody>(
  '/delete-passkey',
  authenticate,
  (req, res) => PasskeyController.deletePasskey(req, res),
);
router.post<Record<string, string>, unknown, RegisterPasskeyBody>(
  '/register-passkey',
  authenticate,
  (req, res) => PasskeyController.registerPasskey(req, res),
);
router.post<Record<string, string>, unknown, VerifyPasskeyRegistrationBody>(
  '/verify-passkey-registration',
  authenticate,
  (req, res) => PasskeyController.verifyPasskeyRegistration(req, res),
);
router.post<Record<string, string>, unknown, LoginWithPasskeyBody>(
  '/login-with-passkey',
  (req, res) => PasskeyController.loginWithPasskey(req, res),
);
router.post<Record<string, string>, unknown, VerifyLoginPasskeyBody>(
  '/verify-passkey-login',
  (req, res) => PasskeyController.verifyLoginPasskey(req, res),
);
router.post<Record<string, string>, unknown, CheckPasskeyExistsBody>(
  '/check-passkey-already-exists',
  authenticate,
  (req, res) => PasskeyController.checkPasskeyExists(req, res),
);

router.post<Record<string, string>, unknown, SendOtpBody>(
  '/send-otp',
  (req, res) => UserController.sendOtp(req, res),
);
router.post<Record<string, string>, unknown, ChangePasswordBody>(
  '/change-password',
  (req, res) => UserController.changePassword(req, res),
);

router.get<Record<string, string>, unknown, unknown, LoginConfigurationQuery>(
  '/get-login-configuration',
  (req, res) => UserController.getLoginConfiguration(req, res),
);

router.get('/public-config', (req, res) =>
  UserController.getPublicConfig(req, res),
);

export default router;
