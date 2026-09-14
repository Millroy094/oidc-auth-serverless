import { Page } from '@playwright/test';
import MailSlurp from 'mailslurp-client';
import axios from 'axios';
import https from 'https';
import crypto from 'crypto';

interface Inbox {
  id: string;
  emailAddress: string;
  password: string;
}

export async function loginAsAdmin(page: Page) {
  await login(page, process.env.ADMIN_EMAIL!, process.env.ADMIN_PASSWORD!);
}

export async function login(page: Page, email: string, password: string) {
  await page.goto('/');
  await page.waitForURL('/login');
  await page.locator('[name="email"]').fill(email);
  await page.getByRole('button', { name: 'NEXT' }).click();
  await page.locator('[name="password"]').fill(password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
}

export async function loginFirstTime(
  page: Page,
  inbox: Inbox,
  mailslurp: MailSlurp,
) {
  await page.goto('/');
  await page.waitForURL('/login');
  await page.locator('[name="email"]').fill(inbox.emailAddress);
  await page.getByRole('button', { name: 'NEXT' }).click();
  await page.locator('[name="password"]').fill(inbox.password);
  await page.getByRole('button', { name: 'NEXT' }).click();

  const otp = await retrieveOtpCode(mailslurp, inbox.id);
  await fillOtp(page, otp);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
}

export async function loginWithMfa(
  page: Page,
  inbox: Inbox,
  mailslurp: MailSlurp,
) {
  await page.goto('/');
  await page.waitForURL('/login');
  await page.locator('[name="email"]').fill(inbox.emailAddress);
  await page.getByRole('button', { name: 'NEXT' }).click();
  await page.locator('[name="password"]').fill(inbox.password);
  await page.getByRole('button', { name: 'NEXT' }).click();

  await page.waitForTimeout(5000);

  const otp = await retrieveOtpCode(mailslurp, inbox.id);
  await fillOtp(page, otp);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
}

export async function retrieveOtpCode(
  mailslurp: MailSlurp,
  inboxId: string,
): Promise<string> {
  const email = await mailslurp.waitForLatestEmail(inboxId);
  const [otp] = /(\d{6})/.exec(email.body!) ?? [''];
  return otp;
}

export async function logout(page: Page) {
  await page.getByRole('button', { name: 'LOG OUT' }).click();
}

export async function fillOtp(page: Page, otp: string) {
  otp.split('').forEach((char, index) => {
    page
      .locator(`[aria-label='Please enter OTP character ${index + 1}']`)
      .fill(char);
  });
}

export async function findTextOnPaginatedTable(page: Page, text: string) {
  while (true) {
    try {
      await Promise.race([
        page.waitForSelector(`[title="${text}"]`, { timeout: 5000 }),
        page.waitForSelector(`text="${text}"`, { timeout: 5000 }),
      ]);
      return true;
    } catch (error) {
      const nextButton = await page
        .$('button[aria-label="Go to next page"]')
        .catch(() => console.log('Next button not found'));
      if (!nextButton || (await nextButton.isDisabled())) {
        console.log(`Text "${text}" not found after checking all pages.`);
        return false;
      }
      await nextButton.click();
      await page.waitForLoadState('networkidle');
    }
  }
}

export const generateCodeVerifierAndChallenge = () => {
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');
  return { codeVerifier, codeChallenge };
};

export function buildAuthorizationCodeUrl({
  clientId,
  redirectUri,
  nonce,
  state,
  codeChallenge,
}) {
  const baseUrl = '/api/oidc/auth';
  const responseType = 'code';
  const scope = 'openid offline_access';
  const codeChallengeMethod = 'S256';
  const prompt = 'consent';

  const queryParams = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: responseType,
    scope,
    nonce,
    state,
    prompt,
    code_challenge: codeChallenge,
    code_challenge_method: codeChallengeMethod,
  });

  return `${baseUrl}?${queryParams.toString()}`;
}

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

export async function getOpenIDTokensByClientCredentials(
  baseUrl: string,
  clientId: string,
  clientSecret: string,
  scope: string = 'openid',
) {
  const tokenUrl = `${baseUrl}/api/oidc/token`;

  try {
    const response = await axios.post(
      tokenUrl,
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
        scope: scope,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        httpsAgent,
      },
    );

    return {
      accessToken: response.data.access_token,
      tokenType: response.data.token_type,
      expiresIn: response.data.expires_in,
    };
  } catch (error) {
    console.error(
      'Error fetching the tokens:',
      error.response ? error.response.data : error.message,
    );
    throw error;
  }
}

export async function getOpenIDTokensByAuthCode(
  baseUrl: string,
  authCode: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string,
  codeVerifier: string,
) {
  const tokenUrl = `${baseUrl}/api/oidc/token`;

  try {
    const response = await axios.post(
      tokenUrl,
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: authCode,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
        code_verifier: codeVerifier,
        scope: 'openid offline_access',
      }),
      { httpsAgent },
    );
    return {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
    };
  } catch (error) {
    console.error('Error fetching the tokens:', error.response);
    throw error;
  }
}

export async function getOpenIDTokensByRefreshToken(
  baseUrl: string,
  refreshToken: string,
  clientId: string,
  clientSecret: string,
): Promise<{ accessToken: string; refreshToken: string }> {
  const tokenUrl = `${baseUrl}/api/oidc/token`;

  try {
    const response = await axios.post(
      tokenUrl,
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
      }),
      { httpsAgent },
    );

    return {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
    };
  } catch (error) {
    console.error('Error refreshing the tokens:', error.response);
    throw error;
  }
}

export async function pickSelectBoxValue(
  page: Page,
  name: string,
  values: string[],
) {
  await page.getByRole('combobox', { name }).click();
  await page.waitForSelector('ul[role="listbox"]', { state: 'visible' });
  if (values?.length > 0) {
    for (const value of values) {
      await page.click(`text=${value}`);
    }
  }
  await page.click('body');
}
