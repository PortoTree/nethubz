import { NextResponse } from "next/server";
import { finalizeExpiredGiveaways } from "@/app/actions/giveaways";

// Called by Vercel Cron (see vercel.json) or any scheduler with `Authorization: Bearer <CRON_SECRET>`
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await finalizeExpiredGiveaways();
  return NextResponse.json(result);
}
