import { v4 as uuid } from 'uuid';
import { test, expect } from '../fixtures';
import {
  buildAuthorizationCodeUrl,
  fillOtp,
  findTextOnPaginatedTable,
  generateCodeVerifierAndChallenge,
  getOpenIDTokensByAuthCode,
  getOpenIDTokensByClientCredentials,
  getOpenIDTokensByRefreshToken,
  login,
  loginAsAdmin,
  loginFirstTime,
  loginWithMfa,
  logout,
  pickSelectBoxValue,
  retrieveOtpCode,
} from './utils/helpers';

test.describe('User Journey', () => {
  test.describe.configure({ mode: 'serial' });

  const clientName = `example client ${Date.now()}`;
  const clientId = clientName.replaceAll(' ', '_');
  const clientURL = 'https://www.example.com';

  test.describe('Admin prepare client', () => {
    test.describe.configure({ mode: 'serial' });

    test.beforeEach(async ({ page }) => {
      await loginAsAdmin(page);
    });

    test.afterEach(async ({ page }) => {
      await logout(page);
    });

    test('Can login as admin and see all tabs', async ({ page }) => {
      await expect(page.getByRole('tab', { name: 'Profile' })).toBeVisible();
      await expect(page.getByRole('tab', { name: 'Security' })).toBeVisible();
      await expect(page.getByRole('tab', { name: 'Clients' })).toBeVisible();
      await expect(page.getByRole('tab', { name: 'Users' })).toBeVisible();
    });

    test('Can create clients', async ({ page }) => {
      await page.getByRole('tab', { name: 'Clients' }).click();
      await page.getByRole('button', { name: 'Create New Client' }).click();

      await page.locator('[name="clientName"]').fill(clientName);

      await pickSelectBoxValue(page, 'grants', [
        'Authorization Code Flow',
        'Refresh Token',
        'Client Credentials',
      ]);
      await pickSelectBoxValue(page, 'scopes', [
        'Open ID',
        'Email',
        'Offline Access',
      ]);
      await page.locator('[name="redirectUris.0.value"]').fill(clientURL);
      await page.getByRole('button', { name: 'Create Client' }).click();
    });
  });

  test.describe('Login & registration page navigation', () => {
    test.beforeEach(({ page }) => {
      page.goto('/');
    });

    test('Redirected to login', async ({ page }) => {
      await page.waitForURL('/login');
      await expect(page).toHaveURL('/login');
    });

    test('Navigate to registration page and back to login page correctly', async ({
      page,
    }) => {
      await page.getByText('Click here').click();
      await expect(page).toHaveURL('/registration');

      await page.getByText('Click here').click();
      await expect(page).toHaveURL('/login');
    });
  });

  test.describe('User registration', () => {
    test.describe.configure({ mode: 'serial' });

    test('Has all the fields', async ({ page }) => {
      page.goto('/');
      await page.getByText('Click here').click();
      await expect(page).toHaveURL('/registration');

      await expect(page.locator('[name="firstName"]')).toBeVisible();
      await expect(page.locator('[name="lastName"]')).toBeVisible();
      await expect(page.locator('[name="email"]')).toBeVisible();
      await expect(page.getByPlaceholder('Phone number')).toBeVisible();
      await expect(page.locator('[name="password"]')).toBeVisible();
      await expect(page.locator('[name="confirmPassword"]')).toBeVisible();
    });

    test('Errors when fields are not filled out correctly', async ({
      page,
    }) => {
      page.goto('/');
      await page.getByText('Click here').click();
      await expect(page).toHaveURL('/registration');

      await page.getByRole('button', { name: 'REGISTER' }).click();

      await expect(
        page.getByText('firstName is a required field'),
      ).toBeVisible();
      await expect(
        page.getByText('lastName is a required field'),
      ).toBeVisible();
      await expect(page.getByText('email is a required field')).toBeVisible();
      await expect(page.getByText('Please enter a valid number')).toBeVisible();
    });

    test('Successfully registers an user & login for the first time', async ({
      page,
      inbox,
      mailslurp,
    }) => {
      page.goto('/');
      await page.getByText('Click here').click();
      await expect(page).toHaveURL('/registration');

      await page.locator('[name="firstName"]').fill('test');
      await page.locator('[name="lastName"]').fill('test');
      await page.locator('[name="email"]').fill(inbox.emailAddress);
      await page.locator('[name="password"]').fill(inbox.password);
      await page.locator('[name="confirmPassword"]').fill(inbox.password);
      await page.getByPlaceholder('Phone number').fill('447809211141');

      await page.getByRole('button', { name: 'REGISTER' }).click();
      await expect(
        page.getByText('Successfully registered user!'),
      ).toBeVisible();

      await loginFirstTime(page, inbox, mailslurp);
      await expect(page).toHaveURL('/account');

      await expect(page.getByRole('tab', { name: 'Profile' })).toBeVisible();
      await expect(page.getByRole('tab', { name: 'Security' })).toBeVisible();

      await logout(page);
      await expect(page).toHaveURL('/login');
    });

    test('Setup MFA', async ({ page, inbox, mailslurp }) => {
      await login(page, inbox.emailAddress, inbox.password);

      await expect(page).toHaveURL('/account');

      await page.getByRole('tab', { name: 'Security' }).click();

      await page.getByRole('button', { name: 'SETUP MFA' }).nth(2).click();

      await page.getByLabel('Email').fill(inbox.emailAddress);
      await page.getByRole('button', { name: 'Setup', exact: true }).click();

      await page.waitForTimeout(5000);

      const otp = await retrieveOtpCode(mailslurp, inbox.id);
      await fillOtp(page, otp);

      await page.getByRole('button', { name: 'Verify', exact: true }).click();
      await logout(page);
    });

    test('Login with MFA and disable MFA', async ({
      page,
      inbox,
      mailslurp,
    }) => {
      await loginWithMfa(page, inbox, mailslurp);
      await expect(page).toHaveURL('/account');

      await page.getByRole('tab', { name: 'Security' }).click();
      await page
        .locator(
          'div:nth-child(3) > .MuiPaper-root > div > div > div:nth-child(2) > .MuiSwitch-root',
        )
        .click();

      await logout(page);
    });
  });

  test.describe('Open ID Connect Flow', () => {
    test.describe.configure({ mode: 'serial' });

    const state = uuid();
    const nonce = uuid();

    test.beforeEach(async ({ page, context }) => {
      await context.grantPermissions(['clipboard-write']);
      await loginAsAdmin(page);
      await page.getByRole('tab', { name: 'Clients' }).click();

      try {
        const exists = await findTextOnPaginatedTable(page, clientName);

        if (exists) {
          await page
            .getByRole('row', { name: clientId })
            .getByLabel('Copy Secret')
            .click();
        }
      } catch (err) {
        console.log(err);
      }

      await logout(page);
    });

    test('can retrieve access token & refresh token via auth code flow', async ({
      page,
      inbox,
      baseURL,
      context,
    }) => {
      await context.grantPermissions(['clipboard-read']);

      const handle = await page.evaluateHandle(() =>
        navigator.clipboard.readText(),
      );
      const clientSecret = await handle.jsonValue();

      const { codeChallenge, codeVerifier } =
        generateCodeVerifierAndChallenge();

      const authorizationCodeURL = buildAuthorizationCodeUrl({
        clientId,
        redirectUri: clientURL,
        nonce,
        state,
        codeChallenge,
      });
      await page.goto(authorizationCodeURL);

      await expect(page).toHaveURL(/\/oauth\/login\/.*/);

      await page.locator('[name="email"]').fill(inbox.emailAddress);
      await page.getByRole('button', { name: 'NEXT' }).click();
      await page.locator('[name="password"]').fill(inbox.password);
      await page.getByRole('button', { name: 'Sign in', exact: true }).click();

      await expect(page).toHaveURL(/\/oauth\/consent\/.*/);
      await page.getByRole('button', { name: 'Yes' }).click();

      const clientURLRegex = new RegExp(`^${clientURL}/?(\\?.*)?$`);

      await expect(page).toHaveURL(clientURLRegex);

      const url = page.url();
      const urlObj = new URL(url);

      expect(`${urlObj.protocol}//${urlObj.hostname}`).toBe(clientURL);
      expect(urlObj.searchParams.has('code')).toBe(true);
      expect(urlObj.searchParams.get('state')).toBe(state);

      const code = urlObj.searchParams.get('code');

      const { accessToken, refreshToken } = await getOpenIDTokensByAuthCode(
        baseURL!,
        code!,
        clientId,
        clientSecret,
        clientURL,
        codeVerifier,
      );

      expect(
        accessToken,
        'access token received by auth code',
      ).not.toBeUndefined();

      expect(
        refreshToken,
        'refresh token received by auth code',
      ).not.toBeUndefined();

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
        await getOpenIDTokensByRefreshToken(
          baseURL!,
          refreshToken,
          clientId,
          clientSecret,
        );

      expect(
        newAccessToken,
        'access token received by refresh token',
      ).not.toBeUndefined();

      expect(
        newRefreshToken,
        'refresh token received by by refresh token',
      ).not.toBeUndefined();
    });

    test('can retrieve access token via client credential flow', async ({
      page,
      baseURL,
      context,
    }) => {
      await context.grantPermissions(['clipboard-read']);

      const handle = await page.evaluateHandle(() =>
        navigator.clipboard.readText(),
      );
      const clientSecret = await handle.jsonValue();

      const { accessToken } = await getOpenIDTokensByClientCredentials(
        baseURL!,
        clientId,
        clientSecret,
      );

      expect(
        accessToken,
        'access token received by auth code',
      ).not.toBeUndefined();
    });
  });

  test.describe('Admin clear data', () => {
    test.describe.configure({ mode: 'serial' });

    test.beforeEach(async ({ page }) => {
      await loginAsAdmin(page);
    });

    test('Can delete users', async ({ page, inbox }) => {
      await page.getByRole('tab', { name: 'Users' }).click();

      await page.waitForResponse(
        (response) =>
          response.url().includes('/api/admin/users') &&
          response.request().method() === 'GET',
      );

      try {
        const exists = await findTextOnPaginatedTable(page, inbox.emailAddress);
        if (exists) {
          await page
            .getByRole('row', { name: inbox.emailAddress })
            .getByLabel('Delete User')
            .click();

          await page.waitForResponse(
            (response) =>
              /\/api\/admin\/users\/.*/.test(response.url()) &&
              response.request().method() === 'DELETE',
          );

          await expect(
            page.getByRole('row', { name: inbox.emailAddress }),
          ).not.toBeVisible();
        }
      } catch (err) {
        console.log(err);
      }
    });

    test('can delete client', async ({ page }) => {
      await page.getByRole('tab', { name: 'Clients' }).click();
      try {
        const exists = await findTextOnPaginatedTable(page, clientId);

        if (exists) {
          await page
            .getByRole('row', { name: clientId })
            .getByLabel('Delete Client')
            .click();

          await page.waitForResponse(
            (response) =>
              /\/api\/admin\/clients\/.*/.test(response.url()) &&
              response.request().method() === 'DELETE',
          );

          await expect(
            page.getByRole('row', { name: clientId }),
          ).not.toBeVisible();
        }
      } catch (err) {
        console.log(err);
      }
    });

    test.afterEach(async ({ page }) => {
      await logout(page);
    });
  });

  test.afterAll(async ({ mailslurp, inbox }) => {
    await mailslurp.deleteInbox(inbox.id);
  });
});
