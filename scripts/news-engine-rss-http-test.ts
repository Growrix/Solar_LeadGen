/**
 * News Engine RSS Entry HTTP Test
 *
  const envPath = resolve(process.cwd(), '.env');
  let raw = '';
  try {
    raw = readFileSync(envPath, 'utf8');
  } catch {
    return;
  }

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx <= 0) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if (!key) continue;
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    if (process.env[key] === undefined) process.env[key] = value;
  }


function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function isPortOpen(host: string, port: number): Promise<boolean> {
  return await new Promise((resolve) => {
    const socket = net
      .createConnection({ host, port })
      .once('connect', () => {
        socket.end();
        resolve(true);
      })
      .once('error', () => resolve(false));

    socket.setTimeout(1500, () => {
      socket.destroy();
      resolve(false);
    });
  });
}

async function waitForPort(host: string, port: number, timeoutMs: number): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await isPortOpen(host, port)) return;
    await sleep(500);
  }
  throw new Error(`Dev server did not open ${host}:${port} in time.`);
}

async function ensureDevServer(baseUrl: string): Promise<null | { stop: () => Promise<void> }> {
  const url = new URL(baseUrl);
  const host = url.hostname;
  const port = Number(url.port || '80');

  if (!(host === 'localhost' && port === 3001)) return null;
  if (await isPortOpen(host, port)) return null;

  const child = spawn('npm', ['run', 'dev:e2e'], {
    cwd: process.cwd(),
    env: process.env,
    shell: true,
    stdio: 'inherit',
  });

  await waitForPort(host, port, 90_000);

  return {
    stop: async () => {
      if (!child.pid) return;
      await new Promise<void>((resolve) => {
        const killer = spawn('taskkill', ['/PID', String(child.pid), '/T', '/F'], { shell: true, stdio: 'ignore' });
        killer.on('exit', () => resolve());
        killer.on('error', () => resolve());
      });
    },
  };
}

async function ensureSetting(key: string, value: string): Promise<void> {
  await prisma.settings.upsert({
    where: { key },
    create: { key, value },
    update: { value },
    select: { key: true },
  });
}

async function main(): Promise<void> {
  loadDotEnvFallback();

  const openAiApiKey = (process.env.OPENAI_API_KEY || '').trim();
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001').replace(/\/$/, '');
  const cronSecret = (process.env.NEWS_ENGINE_CRON_SECRET || '').trim();

  if (!cronSecret) throw new Error('Missing NEWS_ENGINE_CRON_SECRET in .env (required to call internal automation runner).');
  if (!openAiApiKey) throw new Error('Missing OPENAI_API_KEY in .env (required to seed a Drafting key for the automation runner).');

  console.log('🧪 News Engine RSS HTTP Test');
  console.log(`- Base URL: ${baseUrl}`);

  const managedServer = await ensureDevServer(baseUrl);
  try {
    await ensureSetting('news.automation.auto_draft', 'true');
    await ensureSetting('news.automation.auto_schedule', 'false');
    await ensureSetting('news.automation.auto_publish', 'false');
    await ensureSetting('news.settings.daily_limit', '10');
    await ensureSetting('news.settings.deduplication_enabled', 'true');

    await prisma.newsApiKey.updateMany({
      where: {
        pools: { has: 'DRAFTING' },
        label: { startsWith: 'E2E Drafting Key' },
      },
      data: { enabled: false },
    });

    const existingDraftingKey = await prisma.newsApiKey.findFirst({
      where: {
        enabled: true,
        provider: 'openai',
        pools: { has: 'DRAFTING' },
      },
      select: { id: true },
    });

    if (!existingDraftingKey) {
      await prisma.newsApiKey.create({
        data: {
          provider: 'openai',
          label: `E2E Script Drafting Key (${new Date().toISOString().slice(0, 10)})`,
          pools: ['DRAFTING'],
          enabled: true,
          encryptedKey: encryptWithNewsMasterKey(openAiApiKey),
        },
        select: { id: true },
      });
    }

    const sourceId = `e2e-http-source-${Date.now().toString(36)}`;
    await prisma.newsSource.create({
      data: {
        id: sourceId,
        name: 'E2E HTTP Test Source (Disabled)',
        url: 'https://example.com/disabled-feed.xml',
        enabled: false,
        kind: 'RSS_FEED',
      },
      select: { id: true },
    });

    const now = new Date();
    const entryUrl = `https://example.com/e2e-http-seed/${now.getTime()}`;
    const entryTitle = `[E2E HTTP Seed] Solar market update ${now.toISOString()}`;

    const entry = await prisma.newsSourceEntry.create({
      data: {
        sourceId,
        url: entryUrl,
        title: entryTitle,
        publishedAt: now,
        fetchedAt: now,
        status: 'NEW',
        rawJson: { title: entryTitle, link: entryUrl, isoDate: now.toISOString(), contentSnippet: 'Seeded test entry.' },
      },
      select: { id: true },
    });

    console.log(`- Seeded NewsSourceEntry: ${entry.id}`);

    const resp = await fetch(`${baseUrl}/api/internal/news-engine/automation/run?mode=live`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-news-engine-cron-secret': cronSecret,
      },
      body: JSON.stringify({ reason: 'e2e_rss_http_test' }),
    });

    const bodyText = await resp.text();
    let bodyJson: any = null;
    try {
      bodyJson = JSON.parse(bodyText);
    } catch {
      bodyJson = null;
    }

    if (!resp.ok) throw new Error(`Runner HTTP ${resp.status}: ${bodyJson?.error || bodyText || 'Unknown error'}`);

    const refreshedEntry = await prisma.newsSourceEntry.findUnique({
      where: { id: entry.id },
      select: { status: true, itemId: true, error: true },
    });

    if (!refreshedEntry) throw new Error('Seeded entry disappeared unexpectedly.');
    if (refreshedEntry.status === 'NEW') throw new Error(`Seeded entry was not processed (status=${refreshedEntry.status}).`);
    if (!refreshedEntry.itemId) throw new Error('Seeded entry processed but did not link to a NewsItem (missing itemId).');

    const item = await prisma.newsItem.findUnique({
      where: { id: refreshedEntry.itemId },
      select: { id: true, title: true, status: true },
    });
    if (!item) throw new Error('Runner created itemId but NewsItem row is missing.');

    console.log('✅ Processed entry status:', refreshedEntry.status);
    console.log('✅ Created/linked NewsItem:', item);
    console.log('\n🎉 RSS HTTP test PASSED');
  } finally {
    await prisma.$disconnect().catch(() => undefined);
    if (managedServer) await managedServer.stop();
  }
}

main().catch((err) => {
  console.error('❌ RSS HTTP test FAILED');
  console.error(err);
  process.exitCode = 1;
});
        const item = await prisma.newsItem.findUnique({
          where: { id: refreshedEntry.itemId },
          select: { id: true, title: true, status: true },
        });

        if (!item) {
          throw new Error('Runner created itemId but NewsItem row is missing.');
        }

        console.log('✅ Processed entry status:', refreshedEntry.status);
        console.log('✅ Created/linked NewsItem:', item);
        console.log('\n🎉 RSS HTTP test PASSED');
      } finally {
        await prisma.$disconnect().catch(() => undefined);
        if (managedServer) await managedServer.stop();
      }
        const resp = await fetch(`${baseUrl}/api/internal/news-engine/automation/run?mode=live`, {

    main().catch((err) => {
      console.error('❌ RSS HTTP test FAILED');
      console.error(err);
      process.exitCode = 1;
    });
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-news-engine-cron-secret': cronSecret,
          },
          body: JSON.stringify({ reason: 'e2e_rss_http_test' }),
        });
  });
        if (!resp.ok) {
          const text = await resp.text().catch(() => '');
          throw new Error(`Runner HTTP failed: ${resp.status} ${resp.statusText} ${text ? `\n${text}` : ''}`);
        }
  });
        const payload = (await resp.json()) as { ok: boolean; summary?: unknown; error?: string };
        if (!payload.ok) {
          throw new Error(`Runner returned ok=false: ${(payload as any).error ?? 'Unknown error'}`);
        }
  console.log('- Refresh /admin/news-engine → Drafts & Reviews to see the new item.');
        // Verify the seeded entry was processed.
        const updated = await prisma.newsSourceEntry.findUnique({
          where: { id: entry.id },
          select: { status: true, itemId: true },
        });

        if (!updated || updated.status === 'NEW') {
          throw new Error(`Seeded entry was not processed (status=${updated?.status ?? 'missing'})`);
        }

        if (!updated.itemId) {
          throw new Error('Seeded entry processed but did not link to a NewsItem (missing itemId).');
        }

        const item = await prisma.newsItem.findUnique({ where: { id: updated.itemId }, select: { id: true, title: true, status: true } });
        if (!item) {
          throw new Error('Runner created itemId but NewsItem row is missing.');
        }

        console.log('✅ Processed entry status:', updated.status);
        console.log('✅ Created/linked NewsItem:', item);

        console.log('\n🎉 RSS HTTP test PASSED');
      } finally {
        if (managedServer) await managedServer.stop();
      }
