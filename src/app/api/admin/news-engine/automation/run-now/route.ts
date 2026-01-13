import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/authorization";

export const dynamic = "force-dynamic";

const INTERNAL_RUN_TIMEOUT_MS = 110_000;

function pickErrorMessage(payload: unknown): string | null {
	if (!payload || typeof payload !== "object") return null;
	if ("error" in payload && typeof (payload as any).error === "string") {
		const msg = String((payload as any).error).trim();
		return msg ? msg : null;
	}
	return null;
}

function pickSummary(payload: unknown): unknown {
	if (!payload || typeof payload !== 'object') return null;
	const summary = (payload as any).summary;
	return summary && typeof summary === 'object' ? summary : null;
}

type NormalizedRunSummary = {
	ok: boolean | null;
	pipelineStatus: string | null;
	runMode: string | null;
	dryRun: boolean | null;
	skipped: boolean | null;
	skippedReason: string | null;
	enabledSourceCount: number | null;
	rssImportedCount: number | null;
	selectedEntryCount: number | null;
	draftCreatedCount: number | null;
	ignoredByRulesCount: number | null;
	forcedNeedsReviewCount: number | null;
	priorityOverridesCount: number | null;
	lastError: string | null;
};

function normalizeRunSummary(value: unknown): NormalizedRunSummary | null {
	if (!value || typeof value !== 'object') return null;
	const s: any = value;

	const pickBool = (v: unknown): boolean | null => (typeof v === 'boolean' ? v : null);
	const pickNum = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null);
	const pickStr = (v: unknown): string | null => (typeof v === 'string' && v.trim() ? v : null);
	const pickNullableStr = (v: unknown): string | null => {
		if (v === null) return null;
		return pickStr(v);
	};

	return {
		ok: pickBool(s.ok),
		pipelineStatus: pickStr(s.pipelineStatus),
		runMode: pickStr(s.runMode),
		dryRun: pickBool(s.dryRun),
		skipped: pickBool(s.skipped),
		skippedReason: pickNullableStr(s.skippedReason),
		enabledSourceCount: pickNum(s.enabledSourceCount),
		rssImportedCount: pickNum(s.rssImportedCount),
		selectedEntryCount: pickNum(s.selectedEntryCount),
		draftCreatedCount: pickNum(s.draftCreatedCount),
		ignoredByRulesCount: pickNum(s.ignoredByRulesCount),
		forcedNeedsReviewCount: pickNum(s.forcedNeedsReviewCount),
		priorityOverridesCount: pickNum(s.priorityOverridesCount),
		lastError: pickNullableStr(s.lastError),
	};
}

function pickRunId(payload: unknown): string | null {
	if (!payload || typeof payload !== 'object') return null;
	const runId = (payload as any).runId;
	return typeof runId === 'string' && runId.trim() ? runId.trim() : null;
}

function pickTiming(payload: unknown): { startedAt: string | null; finishedAt: string | null } {
	if (!payload || typeof payload !== 'object') return { startedAt: null, finishedAt: null };
	const startedAt = (payload as any).startedAt;
	const finishedAt = (payload as any).finishedAt;
	return {
		startedAt: typeof startedAt === 'string' ? startedAt : null,
		finishedAt: typeof finishedAt === 'string' ? finishedAt : null,
	};
}

export async function POST(request: Request) {
	await requireAdmin();

	const url = new URL(request.url);
	const modeRaw = (url.searchParams.get('mode') || '').trim().toLowerCase();
	const mode = modeRaw === 'dry' ? 'dry' : 'live';

	const secret = process.env.NEWS_ENGINE_CRON_SECRET;
	if (!secret) {
		return NextResponse.json(
			{
				ok: false,
				error: "NEWS_ENGINE_CRON_SECRET is not set",
			},
			{ status: 500 }
		);
	}

	const internalUrl = new URL("/api/internal/news-engine/automation/run", request.url);
	internalUrl.searchParams.set('mode', mode);

	let internalRes: Response;
	try {
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), INTERNAL_RUN_TIMEOUT_MS);
		try {
			internalRes = await fetch(internalUrl, {
			method: "POST",
			headers: {
				"x-news-engine-cron-secret": secret,
			},
			cache: "no-store",
			signal: controller.signal,
		});
		} finally {
			clearTimeout(timeout);
		}
	} catch (error) {
		const message =
			error instanceof Error ? error.message : 'Failed to call internal runner';
		const isTimeout =
			error instanceof Error && (error.name === 'AbortError' || message.toLowerCase().includes('aborted'));
		if (isTimeout) {
			return NextResponse.json(
				{
					ok: false,
					error: `Timed out waiting for automation runner after ${Math.round(INTERNAL_RUN_TIMEOUT_MS / 1000)}s`,
					mode,
				},
				{ status: 504 }
			);
		}
		return NextResponse.json(
			{
				ok: false,
				error: message,
				mode,
			},
			{ status: 500 }
		);
	}

	let payload: unknown = null;
	try {
		payload = await internalRes.json();
	} catch {
		payload = null;
	}

	if (!internalRes.ok) {
		const internalError = pickErrorMessage(payload);
		return NextResponse.json(
			{
				ok: false,
				error: internalError ?? "Internal automation runner failed",
				status: internalRes.status,
				payload,
				mode,
			},
			{ status: 500 }
		);
	}

	const summary = normalizeRunSummary(pickSummary(payload));
	const runId = pickRunId(payload);
	const timing = pickTiming(payload);

	return NextResponse.json({
		ok: true,
		mode,
		runId,
		startedAt: timing.startedAt,
		finishedAt: timing.finishedAt,
		summary,
		payload,
	});
}
