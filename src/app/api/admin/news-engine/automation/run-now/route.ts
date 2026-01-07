import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/authorization";

export const dynamic = "force-dynamic";

function pickErrorMessage(payload: unknown): string | null {
	if (!payload || typeof payload !== "object") return null;
	if ("error" in payload && typeof (payload as any).error === "string") {
		const msg = String((payload as any).error).trim();
		return msg ? msg : null;
	}
	return null;
}

export async function POST(request: Request) {
	await requireAdmin();

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

	let internalRes: Response;
	try {
		internalRes = await fetch(internalUrl, {
			method: "POST",
			headers: {
				"x-news-engine-cron-secret": secret,
			},
			cache: "no-store",
		});
	} catch (error) {
		return NextResponse.json(
			{
				ok: false,
				error:
					error instanceof Error ? error.message : "Failed to call internal runner",
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
			},
			{ status: 500 }
		);
	}

	return NextResponse.json({ ok: true, payload });
}
