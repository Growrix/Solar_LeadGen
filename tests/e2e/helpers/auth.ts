import { expect, type Page } from '@playwright/test';

type LoginCredentials = {
  email: string;
  password: string;
};

async function waitForRoleSession(page: Page, expectedRole: string, maxAttempts = 15, delayMs = 300) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Use page.evaluate() to fetch session in browser context (shares cookies with page)
    const sessionData = await page.evaluate(async () => {
      const res = await fetch('/api/auth/session');
      return res.json();
    });
    
    console.log(`[Auth Debug] Attempt ${attempt + 1}/${maxAttempts}: Data:`, JSON.stringify(sessionData, null, 2));
    
    const role = sessionData?.user?.role as string | undefined;
    if (role === expectedRole) {
      console.log(`[Auth Debug] ✅ Session established with role: ${expectedRole}`);
      return;
    }
    
    // Log cookies after first attempt to track session token creation
    if (attempt === 0) {
      const cookies = await page.context().cookies();
      console.log('[Auth Debug] Cookies after signIn:', cookies.map(c => ({ name: c.name, domain: c.domain, httpOnly: c.httpOnly })));
    }

    await page.waitForTimeout(delayMs);
  }

  throw new Error(`Timed out waiting for session role '${expectedRole}' after ${maxAttempts} attempts`);
}

async function waitForAuthModal(page: Page) {
  const dialog = page.locator('[role="dialog"][aria-modal="true"]');
  await expect(dialog).toBeVisible();
  return dialog;
}

export async function loginAsInstaller(page: Page, { email, password }: LoginCredentials) {
  await page.goto('/');

  // TopBar is only shown for guests on non-installer/homeowner/admin routes.
  // The visible text is responsive, so we avoid relying purely on getByRole(name).
  await page.locator('#top-bar button').nth(1).click();

  const dialog = await waitForAuthModal(page);
  await dialog.locator('input[name="email"]').fill(email);
  await dialog.locator('input[name="password"]').fill(password);
  
  // Click Sign In and wait for modal to close (indicates signIn() completed successfully)
  await dialog.getByRole('button', { name: 'Sign In' }).click();
  await expect(dialog).not.toBeVisible({ timeout: 3000 }); // Modal closes after successful sign-in

  await waitForRoleSession(page, 'INSTALLER');
  await page.goto('/installer/leads');
  await page.waitForURL('**/installer/**');
}

export async function loginAsHomeowner(page: Page, { email, password }: LoginCredentials) {
  await page.goto('/');

  // HeaderMenu (desktop) has an explicit "Login" button.
  await page.getByRole('button', { name: 'Login', exact: true }).click();

  const dialog = await waitForAuthModal(page);
  await dialog.locator('input[name="email"]').fill(email);
  await dialog.locator('input[name="password"]').fill(password);
  
  // Click Sign In and wait for modal to close (indicates signIn() completed successfully)
  await dialog.getByRole('button', { name: 'Sign In' }).click();
  await expect(dialog).not.toBeVisible({ timeout: 3000 }); // Modal closes after successful sign-in

  await waitForRoleSession(page, 'HOMEOWNER');
  await page.goto('/homeowner/dashboard');
  await page.waitForURL('**/homeowner/**');
}
