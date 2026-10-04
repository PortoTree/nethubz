"use server";

import { revalidateTag } from "next/cache";
import prisma from "@/utils/prisma";

type RequirementStatus = {
  id: string;
  type: "FOLLOW_USER" | "JOIN_GROUP" | "EXTERNAL_SOCIAL";
  met: boolean;
  clicked?: boolean;
};

async function checkRequirements(
  giveawayId: string,
  userId: string,
  clickedLinks: string[],
  externalUsernames: Record<string, string> = {}
) {
  const requirements = await prisma.giveawayRequirement.findMany({
    where: { giveawayId },
    orderBy: { order: "asc" },
  });

  const followTargets = requirements.filter(r => r.type === "FOLLOW_USER" && r.targetId).map(r => r.targetId!);
  const follows = followTargets.length
    ? await prisma.follow.findMany({
        where: { followerId: userId, followingId: { in: followTargets } },
        select: { followingId: true },
      })
    : [];
  const followed = new Set(follows.map(f => f.followingId));

  const statuses: RequirementStatus[] = requirements.map(r => {
    if (r.type === "FOLLOW_USER") return { id: r.id, type: r.type, met: followed.has(r.targetId!) };
    if (r.type === "EXTERNAL_SOCIAL") {
      const clicked = clickedLinks.includes(r.id);
      const hasUsername = !!externalUsernames[r.id]?.trim();
      return { id: r.id, type: r.type, met: clicked && hasUsername, clicked };
    }
    return { id: r.id, type: r.type, met: false };
  });

  return { requirements, statuses, allMet: statuses.every(s => s.met) };
}

/** Finalize a single giveaway if it has expired. Safe to call repeatedly. */
async function finalizeIfExpired(giveawayId: string) {
  const giveaway = await prisma.giveaway.findUnique({
    where: { id: giveawayId },
    include: { post: { select: { authorId: true, id: true } } },
  });
  if (!giveaway || giveaway.status !== "ACTIVE" || giveaway.endsAt.getTime() > Date.now()) return;

  // Atomic lock: only one caller can flip ACTIVE -> ENDED
  const locked = await prisma.giveaway.updateMany({
    where: { id: giveawayId, status: "ACTIVE" },
    data: { status: "ENDED" },
  });
  if (locked.count === 0) return;

  const entries = await prisma.giveawayEntry.findMany({ where: { giveawayId, status: "ELIGIBLE" } });

  // Re-verify internal follows (anti follow-then-unfollow)
  const followReqs = await prisma.giveawayRequirement.findMany({
    where: { giveawayId, type: "FOLLOW_USER" },
  });
  const stillEligible: typeof entries = [];
  const rejectedIds: string[] = [];
  for (const entry of entries) {
    let ok = true;
    for (const req of followReqs) {
      const f = await prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: entry.userId, followingId: req.targetId! } },
        select: { id: true },
      });
      if (!f) { ok = false; break; }
    }
    if (ok) stillEligible.push(entry); else rejectedIds.push(entry.id);
  }

  let winners = stillEligible;
  if (giveaway.mode === "RANDOM_DRAW") {
    const shuffled = [...stillEligible];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    winners = shuffled.slice(0, giveaway.winnerCount || 1);
  }
  const winnerIds = new Set(winners.map(w => w.id));
  const now = new Date();

  await prisma.$transaction([
    prisma.giveawayEntry.updateMany({ where: { id: { in: rejectedIds } }, data: { status: "REJECTED" } }),
    prisma.giveawayEntry.updateMany({
      where: { id: { in: [...winnerIds] } },
      data: { status: "WINNER", rewardSentAt: now },
    }),
    prisma.notification.createMany({
      data: winners.map(w => ({
        type: "GIVEAWAY_WON" as const,
        userId: w.userId,
        senderId: giveaway.post.authorId,
        postId: giveaway.post.id,
      })),
    }),
    prisma.notification.create({
      data: { type: "GIVEAWAY_ENDED", userId: giveaway.post.authorId, postId: giveaway.post.id },
    }),
  ]);

  revalidateTag("feed_posts", "page");
}

/** For cron: finalize every expired giveaway. */
export async function finalizeExpiredGiveaways() {
  const expired = await prisma.giveaway.findMany({
    where: { status: "ACTIVE", endsAt: { lte: new Date() } },
    select: { id: true },
    take: 50,
  });
  for (const g of expired) {
    try { await finalizeIfExpired(g.id); } catch (e) { console.error("Finalize giveaway failed", g.id, e); }
  }
  return { processed: expired.length };
}

export async function getGiveawayState(giveawayId: string, userId?: string) {
  try {
    await finalizeIfExpired(giveawayId);

    const giveaway = await prisma.giveaway.findUnique({
      where: { id: giveawayId },
      select: {
        id: true, status: true, endsAt: true, maxParticipants: true, mode: true, winnerCount: true,
        post: { select: { authorId: true } },
        _count: { select: { entries: { where: { status: { not: "PENDING" } } } } },
      },
    });
    if (!giveaway) return { success: false, error: "NOT_FOUND" };

    // Resolve FOLLOW_USER targets for display
    const requirements = await prisma.giveawayRequirement.findMany({ where: { giveawayId }, orderBy: { order: "asc" } });
    const targetIds = requirements.filter(r => r.type === "FOLLOW_USER" && r.targetId).map(r => r.targetId!);
    const targets = targetIds.length
      ? await prisma.user.findMany({
          where: { id: { in: targetIds } },
          select: { id: true, username: true, profile: { select: { displayName: true, avatarUrl: true } } },
        })
      : [];

    let entry = null;
    let statuses: RequirementStatus[] = [];
    if (userId) {
      entry = await prisma.giveawayEntry.findUnique({
        where: { giveawayId_userId: { giveawayId, userId } },
        select: { status: true, clickedLinks: true, externalUsernames: true },
      });
      const res = await checkRequirements(giveawayId, userId, entry?.clickedLinks || [], (entry?.externalUsernames as any) || {});
      statuses = res.statuses;
    }

    const winnersCount = giveaway.status === "ENDED"
      ? await prisma.giveawayEntry.count({ where: { giveawayId, status: "WINNER" } })
      : 0;

    return {
      success: true,
      state: {
        status: giveaway.status,
        endsAt: giveaway.endsAt.toISOString(),
        participants: giveaway._count.entries,
        maxParticipants: giveaway.maxParticipants,
        isOwner: !!userId && giveaway.post.authorId === userId,
        entryStatus: entry?.status || null,
        clickedLinks: entry?.clickedLinks || [],
        externalUsernames: (entry?.externalUsernames as Record<string, string>) || {},
        requirementStatuses: statuses,
        followTargets: targets,
        winnersCount,
      },
    };
  } catch (error: any) {
    console.error("getGiveawayState error", error);
    return { success: false, error: error.message };
  }
}

/** Records that the user opened an external social link (soft verification). */
export async function trackGiveawayLinkClick(giveawayId: string, userId: string, requirementId: string) {
  try {
    const req = await prisma.giveawayRequirement.findFirst({
      where: { id: requirementId, giveawayId, type: "EXTERNAL_SOCIAL" },
      select: { id: true },
    });
    if (!req) return { success: false, error: "INVALID_REQUIREMENT" };

    // Store clicks on a PENDING entry (not counted as participant until joined)
    const existing = await prisma.giveawayEntry.findUnique({
      where: { giveawayId_userId: { giveawayId, userId } },
      select: { clickedLinks: true },
    });
    const clicked = Array.from(new Set([...(existing?.clickedLinks || []), requirementId]));
    await prisma.giveawayEntry.upsert({
      where: { giveawayId_userId: { giveawayId, userId } },
      update: { clickedLinks: clicked },
      create: { giveawayId, userId, clickedLinks: clicked, status: "PENDING" },
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function joinGiveaway(giveawayId: string, userId: string, externalUsernames: Record<string, string> = {}) {
  try {
    await finalizeIfExpired(giveawayId);

    const giveaway = await prisma.giveaway.findUnique({
      where: { id: giveawayId },
      include: { post: { select: { authorId: true, id: true } } },
    });
    if (!giveaway) return { success: false, error: "NOT_FOUND" };
    if (giveaway.status !== "ACTIVE" || giveaway.endsAt.getTime() <= Date.now()) return { success: false, error: "ENDED" };
    if (giveaway.post.authorId === userId) return { success: false, error: "OWNER" };

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { createdAt: true } });
    if (!user) return { success: false, error: "UNAUTHORIZED" };

    if (giveaway.minAccountAgeDays > 0) {
      const ageDays = (Date.now() - user.createdAt.getTime()) / 86_400_000;
      if (ageDays < giveaway.minAccountAgeDays) return { success: false, error: "ACCOUNT_TOO_NEW", minDays: giveaway.minAccountAgeDays };
    }

    const existing = await prisma.giveawayEntry.findUnique({
      where: { giveawayId_userId: { giveawayId, userId } },
    });
    if (existing && existing.status !== "PENDING") return { success: false, error: "ALREADY_JOINED" };

    if (giveaway.maxParticipants != null) {
      const joined = await prisma.giveawayEntry.count({ where: { giveawayId, status: { not: "PENDING" } } });
      if (joined >= giveaway.maxParticipants) return { success: false, error: "FULL" };
    }

    const cleanUsernames: Record<string, string> = {};
    for (const [k, v] of Object.entries(externalUsernames)) {
      const val = String(v || "").trim().slice(0, 100);
      if (val) cleanUsernames[k] = val;
    }

    const { statuses, allMet } = await checkRequirements(giveawayId, userId, existing?.clickedLinks || [], cleanUsernames);
    if (!allMet) return { success: false, error: "REQUIREMENTS_NOT_MET", statuses };

    await prisma.giveawayEntry.upsert({
      where: { giveawayId_userId: { giveawayId, userId } },
      update: { status: "ELIGIBLE", externalUsernames: cleanUsernames },
      create: { giveawayId, userId, status: "ELIGIBLE", externalUsernames: cleanUsernames },
    });

    await prisma.notification.create({
      data: { type: "GIVEAWAY_JOINED", userId, senderId: giveaway.post.authorId, postId: giveaway.post.id },
    });

    return { success: true };
  } catch (error: any) {
    console.error("joinGiveaway error", error);
    return { success: false, error: error.message };
  }
}

/** Returns the secret reward link ONLY to winners. */
export async function getGiveawayReward(giveawayId: string, userId: string) {
  try {
    const entry = await prisma.giveawayEntry.findUnique({
      where: { giveawayId_userId: { giveawayId, userId } },
      select: { status: true, giveaway: { select: { rewardLink: true, rewardType: true } } },
    });
    if (!entry || entry.status !== "WINNER") return { success: false, error: "NOT_WINNER" };
    return { success: true, rewardLink: entry.giveaway.rewardLink, rewardType: entry.giveaway.rewardType };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/** Owner-only: list participants with their submitted external usernames. */
export async function getGiveawayParticipants(giveawayId: string, ownerId: string) {
  try {
    const giveaway = await prisma.giveaway.findUnique({
      where: { id: giveawayId },
      select: { post: { select: { authorId: true } } },
    });
    if (!giveaway || giveaway.post.authorId !== ownerId) return { success: false, error: "UNAUTHORIZED" };

    const entries = await prisma.giveawayEntry.findMany({
      where: { giveawayId, status: { not: "PENDING" } },
      orderBy: { createdAt: "asc" },
      select: {
        id: true, status: true, externalUsernames: true, createdAt: true,
        user: { select: { id: true, username: true, profile: { select: { displayName: true, avatarUrl: true } } } },
      },
    });
    return { success: true, entries };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
