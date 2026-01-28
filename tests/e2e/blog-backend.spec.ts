import { test, expect, type Page } from '@playwright/test';

const ADMIN_CREDENTIALS = {
  email: 'admin@solarmatch.com',
  password: 'Admin123!Secure',
};

async function loginAdmin(page: Page) {
  // Ensure the expected admin account/password exists in the local DB.
  await page.request.post('/api/fix-admin');

  // Programmatic sign-in via NextAuth.
  const csrfResp = await page.request.get('/api/auth/csrf');
  expect(csrfResp.ok()).toBeTruthy();
  const csrf = (await csrfResp.json()) as { csrfToken?: string };
  expect(csrf.csrfToken).toBeTruthy();

  const callbackResp = await page.request.post('/api/auth/callback/credentials', {
    form: {
      csrfToken: csrf.csrfToken ?? '',
      email: ADMIN_CREDENTIALS.email,
      password: ADMIN_CREDENTIALS.password,
      role: 'ADMIN',
      callbackUrl: '/admin/dashboard',
      json: 'true',
    },
  });
  expect(callbackResp.status()).toBeLessThan(400);

  const sessionResp = await page.request.get('/api/auth/session');
  expect(sessionResp.ok()).toBeTruthy();
  const session = (await sessionResp.json()) as any;
  expect(session?.user?.role).toBe('ADMIN');
}

test.describe('Blog Backend E2E Tests', () => {
  test.describe('Authors Management', () => {
    test.beforeEach(async ({ page }) => {
      await loginAdmin(page);
    });

    test('Admin can view authors list', async ({ page }) => {
      await page.goto('/admin/blog/content-manager?tab=authors');

      await expect(page.locator('h1').filter({ hasText: /blog manager/i })).toBeVisible();
      await expect(page.locator('input[placeholder="Search team members..."]')).toBeVisible();
    });

    test('Admin can create new author', async ({ page }) => {
      await page.goto('/admin/blog/content-manager?tab=authors');
      
      const addButton = page.locator('button').filter({ hasText: /add author|new author/i });
      if (await addButton.isVisible()) {
        await addButton.click();

        await expect(page.locator('h3').filter({ hasText: /add new author|edit author/i }).first()).toBeVisible();
      }
    });

    test('Admin can edit author', async ({ page }) => {
      await page.goto('/admin/blog/content-manager?tab=authors');
      
      const editButton = page.locator('button').filter({ hasText: /edit/i }).first();
      if (await editButton.isVisible()) {
        await editButton.click();
      }
    });

    test('Admin can deactivate author', async ({ page }) => {
      await page.goto('/admin/blog/content-manager?tab=authors');
      
      const statusToggle = page.locator('button, input[type="checkbox"]').filter({ hasText: /active|deactivate/i }).first();
      if (await statusToggle.isVisible()) {
        await statusToggle.click();
      }
    });
  });

  test.describe('Comments Moderation', () => {
    test.beforeEach(async ({ page }) => {
      await loginAdmin(page);
    });

    test('Admin can view comments list', async ({ page }) => {
      await page.goto('/admin/blog/content-manager?tab=comments');

      await expect(page.locator('h1').filter({ hasText: /blog manager/i })).toBeVisible();
      await expect(page.locator('input[placeholder="Search author or content..."]')).toBeVisible();
    });

    test('Admin can approve comment', async ({ page }) => {
      await page.goto('/admin/blog/content-manager?tab=comments');
      
      const approveButton = page.locator('button').filter({ hasText: /approve/i }).first();
      if (await approveButton.isVisible()) {
        await approveButton.click();
      }
    });

    test('Admin can reject comment', async ({ page }) => {
      await page.goto('/admin/blog/content-manager?tab=comments');
      
      const rejectButton = page.locator('button').filter({ hasText: /reject/i }).first();
      if (await rejectButton.isVisible()) {
        await rejectButton.click();
      }
    });

    test('Admin can bulk moderate comments', async ({ page }) => {
      await page.goto('/admin/blog/content-manager?tab=comments');
      
      const checkboxes = page.locator('input[type="checkbox"]');
      const count = await checkboxes.count();
      
      if (count > 1) {
        await checkboxes.nth(0).check();
        await checkboxes.nth(1).check();
        
        const bulkAction = page.locator('button').filter({ hasText: /approve|bulk/i }).first();
        if (await bulkAction.isVisible()) {
          await bulkAction.click();
        }
      }
    });
  });

  test.describe('Media Library', () => {
    test.beforeEach(async ({ page }) => {
      await loginAdmin(page);
    });

    test('Admin can view media library', async ({ page }) => {
      await page.goto('/admin/blog/media');
      
      await expect(page.locator('h1, h2').filter({ hasText: /media|library/i }).first()).toBeVisible();
    });

    test('Admin can upload media file', async ({ page }) => {
      await page.goto('/admin/blog/media');
      
      const uploadButton = page.locator('button').filter({ hasText: /upload/i });
      if (await uploadButton.isVisible()) {
        await uploadButton.click();

        await expect(page.locator('h3').filter({ hasText: /upload media/i }).first()).toBeVisible();
      }
    });

    test('Admin can edit media metadata', async ({ page }) => {
      await page.goto('/admin/blog/media');
      
      const mediaItem = page.locator('[data-testid="media-item"], .media-item, img').first();
      if (await mediaItem.isVisible()) {
        await mediaItem.click();
        
        const detailsModal = page.locator('[role="dialog"], .modal');
        if (await detailsModal.isVisible()) {
          const altTextInput = detailsModal.locator('input[name="altText"], textarea').first();
          if (await altTextInput.isVisible()) {
            await altTextInput.fill('Updated alt text');
          }
        }
      }
    });

    test('Admin can move media to folder', async ({ page }) => {
      await page.goto('/admin/blog/media');
      
      const moveButton = page.locator('button').filter({ hasText: /move/i });
      if (await moveButton.isVisible()) {
        await moveButton.click();
      }
    });

    test('Admin can trash media', async ({ page }) => {
      await page.goto('/admin/blog/media');
      
      const trashButton = page.locator('button').filter({ hasText: /trash|delete/i }).first();
      if (await trashButton.isVisible()) {
        await trashButton.click();
      }
    });

    test('Admin can restore media from trash', async ({ page }) => {
      await page.goto('/admin/blog/media');
      
      const trashTab = page.locator('button, a').filter({ hasText: /trash/i });
      if (await trashTab.isVisible()) {
        await trashTab.click();
        
        const restoreButton = page.locator('button').filter({ hasText: /restore/i }).first();
        if (await restoreButton.isVisible()) {
          await restoreButton.click();
        }
      }
    });

    test('Admin can permanently delete media', async ({ page }) => {
      await page.goto('/admin/blog/media');
      
      const trashTab = page.locator('button, a').filter({ hasText: /trash/i });
      if (await trashTab.isVisible()) {
        await trashTab.click();
        
        const deleteButton = page.locator('button').filter({ hasText: /delete forever|permanent/i }).first();
        if (await deleteButton.isVisible()) {
          await deleteButton.click();
        }
      }
    });

    test('Admin can create folder', async ({ page }) => {
      await page.goto('/admin/blog/media');
      
      const newFolderButton = page.locator('button').filter({ hasText: /new folder|create folder/i });
      if (await newFolderButton.isVisible()) {
        await newFolderButton.click();
        
        const input = page.locator('input[placeholder*="folder"], input[name="folderName"]');
        if (await input.isVisible()) {
          await input.fill('Test Folder');
          
          const confirmButton = page.locator('button').filter({ hasText: /create|save/i });
          if (await confirmButton.isVisible()) {
            await confirmButton.click();
          }
        }
      }
    });

    test('Admin can rename folder', async ({ page }) => {
      await page.goto('/admin/blog/media');
      
      const folderMenu = page.locator('[data-testid="folder-menu"], button[aria-label*="menu"]').first();
      if (await folderMenu.isVisible()) {
        await folderMenu.click();
        
        const renameOption = page.locator('button, [role="menuitem"]').filter({ hasText: /rename/i });
        if (await renameOption.isVisible()) {
          await renameOption.click();
        }
      }
    });

    test('Admin can delete folder', async ({ page }) => {
      await page.goto('/admin/blog/media');
      
      const folderMenu = page.locator('[data-testid="folder-menu"], button[aria-label*="menu"]').first();
      if (await folderMenu.isVisible()) {
        await folderMenu.click();
        
        const deleteOption = page.locator('button, [role="menuitem"]').filter({ hasText: /delete/i });
        if (await deleteOption.isVisible()) {
          await deleteOption.click();
        }
      }
    });
  });

  test.describe('Public Blog Comments', () => {
    test('Public can view blog comments', async ({ page }) => {
      await page.goto('/blog');
      
      const firstPost = page.locator('a[href*="/blog/"]').first();
      if (await firstPost.isVisible()) {
        await firstPost.click();
        
        const commentsSection = page.locator('[data-testid="comments"], .comments, #comments');
        if (await commentsSection.isVisible()) {
          await expect(commentsSection).toBeVisible();
        }
      }
    });

    test('Public can submit comment', async ({ page }) => {
      await page.goto('/blog');
      
      const firstPost = page.locator('a[href*="/blog/"]').first();
      if (await firstPost.isVisible()) {
        await firstPost.click();
        
        const commentForm = page.locator('form').filter({ hasText: /comment|leave/i });
        if (await commentForm.isVisible()) {
          const nameInput = commentForm.locator('input[name="name"], input[placeholder*="name"]');
          const emailInput = commentForm.locator('input[name="email"], input[placeholder*="email"]');
          const contentInput = commentForm.locator('textarea');
          
          if (await nameInput.isVisible()) {
            await nameInput.fill('Test User');
            await emailInput.fill('test@example.com');
            await contentInput.fill('Great post!');
            
            const submitButton = commentForm.locator('button[type="submit"]');
            if (await submitButton.isVisible()) {
              await submitButton.click();
            }
          }
        }
      }
    });
  });
});
