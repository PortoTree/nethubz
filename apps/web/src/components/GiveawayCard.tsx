"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useLocale, useTranslations } from "next-intl";
import {
  getGiveawayState,
  joinGiveaway,
  trackGiveawayLinkClick,
  getGiveawayReward,
  getGiveawayParticipants,
} from "@/app/actions/giveaways";
import { toggleFollow } from "@/app/actions/connections";

type State = NonNullable<Awaited<ReturnType<typeof getGiveawayState>>["state"]>;

const PLATFORM_LABEL: Record<string, string> = {
  instagram: "Instagram", tiktok: "TikTok", x: "X / Twitter", youtube: "YouTube",
  facebook: "Facebook", threads: "Threads", telegram: "Telegram", discord: "Discord", other: "Link",
};

const PLATFORM_ICON: Record<string, string> = {
  instagram: "/sosmed/instagram.webp",
  tiktok: "/sosmed/tiktok.webp",
  x: "/sosmed/twiter.webp",
  youtube: "/sosmed/youtube.webp",
  facebook: "/sosmed/facebook.webp",
  telegram: "/sosmed/telegram.webp",
  threads: "/sosmed/Threads.webp",
};

function useCountdown(endsAt: string) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, new Date(endsAt).getTime() - now);
  const d = Math.floor(diff / 86_400_000);
  const h = Math.floor((diff % 86_400_000) / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1000);
  const text = d > 0 ? `${d}d ${h}h ${m}m` : `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return { diff, text };
}

export default function GiveawayCard({ giveaway, currentUser }: { giveaway: any; currentUser: any }) {
  const t = useTranslations("giveaway");
  const locale = useLocale();
  const [state, setState] = useState<State | null>(null);
  const [usernames, setUsernames] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [busyReqId, setBusyReqId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reward, setReward] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [participants, setParticipants] = useState<any[] | null>(null);

  const { diff, text: countdown } = useCountdown(state?.endsAt || giveaway.endsAt);

  const refresh = useCallback(async () => {
    const res = await getGiveawayState(giveaway.id, currentUser?.id);
    if (res.success && res.state) {
      setState(res.state);
      setUsernames(prev => ({ ...res.state!.externalUsernames, ...prev }));
    }
  }, [giveaway.id, currentUser?.id]);

  useEffect(() => { refresh(); }, [refresh]);

  // When countdown hits zero, refresh once to trigger finalization
  useEffect(() => {
    if (diff === 0 && state?.status === "ACTIVE") refresh();
  }, [diff, state?.status, refresh]);

  // Re-check when user returns to tab (e.g. after following someone)
  useEffect(() => {
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refresh]);

  const status = state?.status || giveaway.status;
  const participantsCount = state?.participants ?? giveaway._count?.entries ?? 0;
  const maxP = state?.maxParticipants ?? giveaway.maxParticipants;
  const isActive = status === "ACTIVE" && diff > 0;
  const isFull = maxP != null && participantsCount >= maxP && !state?.entryStatus;
  const reqStatus = (id: string) => state?.requirementStatuses.find(r => r.id === id);
  const followTarget = (id: string) => (state?.followTargets || giveaway.followTargets || []).find((u: any) => u.id === id);

  const handleExternalClick = async (req: any) => {
    window.open(req.url, "_blank", "noopener,noreferrer");
    if (!currentUser?.id) return;
    await trackGiveawayLinkClick(giveaway.id, currentUser.id, req.id);
    refresh();
  };

  const handleFollowUser = async (req: any, targetId: string) => {
    if (!currentUser?.id) return;
    const token = localStorage.getItem("token") || "";
    setBusyReqId(req.id);

    // Optimistic UI update for instant feedback
    setState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        requirementStatuses: prev.requirementStatuses.map(r =>
          r.id === req.id ? { ...r, met: true } : r
        ),
      };
    });

    const res = await toggleFollow(token, currentUser.id, targetId);
    if (res?.success) {
      await refresh(); // wait until completely updated
    }
    setBusyReqId(null);
  };

  const handleJoin = async () => {
    if (!currentUser?.id) return;
    setBusy(true); setError(null);
    const res: any = await joinGiveaway(giveaway.id, currentUser.id, usernames);
    setBusy(false);
    if (res.success) return refresh();
    const map: Record<string, string> = {
      REQUIREMENTS_NOT_MET: t("errNotMet"),
      ACCOUNT_TOO_NEW: t("errTooNew", { days: res.minDays || 0 }),
      ALREADY_JOINED: t("errAlready"),
      ENDED: t("errEnded"),
      FULL: t("full"),
      OWNER: t("owner"),
    };
    setError(map[res.error] || t("errGeneric"));
    refresh();
  };

  const handleClaim = async () => {
    const res = await getGiveawayReward(giveaway.id, currentUser.id);
    if (res.success && res.rewardLink) setReward(res.rewardLink);
    else setError(t("errGeneric"));
  };

  const handleParticipants = async () => {
    const res = await getGiveawayParticipants(giveaway.id, currentUser.id);
    setParticipants(res.success ? (res.entries as any[]) : []);
  };

  const renderStatusFooter = () => {
    if (!state) return <div className="h-10 rounded-lg bg-amber-100 dark:bg-amber-500/10 animate-pulse" />;
    if (state.isOwner) {
      return (
        <div className="flex items-center justify-between gap-2">
          <span className="text-[13px] font-medium text-amber-900 dark:text-amber-200">{t("owner")}</span>
          <button onClick={handleParticipants} className="px-3 py-1.5 rounded-lg text-[13px] font-semibold bg-white dark:bg-[#3A3B3C] text-black dark:text-[#E4E6EB] border border-amber-300 dark:border-[#4E4F50] hover:bg-amber-100 dark:hover:bg-[#4E4F50] transition-colors">
            {t("viewParticipants")}
          </button>
        </div>
      );
    }
    if (state.entryStatus === "WINNER") {
      return (
        <button onClick={handleClaim} className="w-full py-2.5 rounded-lg font-bold text-[15px] text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 transition-all shadow-sm">
          {t("won")} · {t("claimReward")}
        </button>
      );
    }
    if (state.entryStatus === "ELIGIBLE") {
      return <div className="w-full py-2.5 rounded-lg text-center font-semibold text-[14px] bg-green-100 dark:bg-green-500/15 text-green-800 dark:text-green-300">✓ {status === "ENDED" ? t("lost") : t("joined")}</div>;
    }
    if (state.entryStatus === "REJECTED") {
      return <div className="w-full py-2.5 rounded-lg text-center font-semibold text-[14px] bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-300">{t("rejected")}</div>;
    }
    if (!isActive) return <div className="w-full py-2.5 rounded-lg text-center font-semibold text-[14px] bg-gray-200 dark:bg-[#3A3B3C] text-gray-700 dark:text-[#B0B3B8]">{t("ended")}</div>;
    if (isFull) return <div className="w-full py-2.5 rounded-lg text-center font-semibold text-[14px] bg-gray-200 dark:bg-[#3A3B3C] text-gray-700 dark:text-[#B0B3B8]">{t("full")}</div>;
    if (!currentUser?.id) return <div className="w-full py-2.5 rounded-lg text-center font-semibold text-[14px] bg-gray-200 dark:bg-[#3A3B3C] text-gray-700 dark:text-[#B0B3B8]">{t("loginToJoin")}</div>;
    return (
      <button id={`giveaway-join-${giveaway.id}`} onClick={handleJoin} disabled={busy} className="w-full py-2.5 rounded-lg font-bold text-[15px] text-white bg-[#1877F2] hover:bg-[#166FE5] disabled:opacity-60 transition-colors">
        {busy ? t("joining") : t("join")}
      </button>
    );
  };

  const canInteract = isActive && !state?.isOwner && !state?.entryStatus?.match(/ELIGIBLE|WINNER|REJECTED/);

  return (
    <div className="px-4 mb-3">
      <div className="rounded-xl overflow-hidden border border-amber-400/80 dark:border-amber-500/30 bg-gradient-to-br from-amber-100/70 to-orange-100/70 dark:from-amber-500/10 dark:to-orange-500/5">
        {/* Header */}
        <div className="relative flex items-center gap-3 px-4 pb-5 pt-4 border-b border-amber-200 dark:border-amber-500/20">
          <img src="/navigasi/giveaway.svg" alt="" className="w-9 h-9" />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[16px] text-amber-900 dark:text-amber-200">
              {t("badge")}{giveaway.title ? ` - ${giveaway.title}` : ""}
            </p>
            <p className="text-[12px] text-amber-800 dark:text-amber-300/80">
              {giveaway.mode === "RANDOM_DRAW" ? (
                <>
                  {t("winnersLabel", { count: giveaway.winnerCount || 1 })}
                  {" · "}
                  {maxP != null ? t("participantsMax", { count: participantsCount, max: maxP }) : t("participants", { count: participantsCount })}
                </>
              ) : (
                <>
                  {t("allEligibleLabel")} {maxP != null ? `${participantsCount}/${maxP}` : participantsCount}
                </>
              )}
            </p>
          </div>
          
          <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2 z-10">
            <div className={`px-4 py-1.5 rounded-full text-[13px] font-bold tabular-nums shadow-md border-[3px] border-[#FFF8EE] dark:border-[#2a2722] ${isActive ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white" : "bg-gray-300 dark:bg-[#4E4F50] text-gray-700 dark:text-[#E4E6EB]"}`}>
              {isActive ? t("endsIn", { time: countdown }) : status === "CANCELLED" ? t("cancelled") : t("ended")}
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div className="px-4 py-3 flex flex-col gap-2">
          <p className="text-[12px] font-bold uppercase tracking-wide text-amber-900/70 dark:text-amber-200/70">{t("requirementsSection")}</p>
          {(giveaway.requirements || []).map((req: any) => {
            const st = reqStatus(req.id);
            const met = !!st?.met;
            const icon = (
              <span className={`w-5 h-5 shrink-0 rounded-full flex items-center justify-center text-[11px] font-bold ${met ? "bg-green-500 text-white" : "bg-white dark:bg-[#3A3B3C] border border-gray-300 dark:border-[#4E4F50] text-transparent"}`}>✓</span>
            );
            if (req.type === "FOLLOW_USER") {
              const u = followTarget(req.targetId);
              return (
                <div key={req.id} className="flex items-center gap-2.5 bg-white/70 dark:bg-[#242526]/70 rounded-lg px-3 py-2">
                  {icon}
                  <img src={u?.profile?.avatarUrl || "/default-avatar.svg"} alt="" className="w-6 h-6 rounded-full object-cover" />
                  <span className="flex-1 min-w-0 truncate text-[14px] text-black dark:text-[#E4E6EB]">
                    Follow <b>@{u?.username || "…"}</b>
                  </span>
                  {!met && canInteract && u && (
                    <button
                      onClick={() => handleFollowUser(req, u.id)}
                      disabled={!!busyReqId}
                      className="text-[12px] font-semibold px-2.5 py-1 rounded-md bg-[#1877F2] text-white hover:bg-[#166FE5] disabled:opacity-50 disabled:hover:bg-[#1877F2] disabled:cursor-not-allowed"
                    >
                      {busyReqId === req.id ? "..." : t("followNow")}
                    </button>
                  )}
                </div>
              );
            }
            if (req.type === "EXTERNAL_SOCIAL") {
              return (
                <div key={req.id} className="bg-white/70 dark:bg-[#242526]/70 rounded-lg px-3 py-2 flex flex-col gap-2">
                  <div className="flex items-center gap-2.5">
                    {icon}
                    {PLATFORM_ICON[req.platform] && (
                      <img src={PLATFORM_ICON[req.platform]} alt="" className="w-6 h-6 object-contain drop-shadow-sm" />
                    )}
                    <span className="flex-1 min-w-0 truncate text-[14px] text-black dark:text-[#E4E6EB]">
                      Follow <b>{PLATFORM_LABEL[req.platform] || "Link"}</b>
                    </span>
                    <button onClick={() => handleExternalClick(req)} className={`text-[12px] font-semibold px-2.5 py-1 rounded-md transition-colors ${st?.clicked ? "bg-gray-200 dark:bg-[#3A3B3C] text-gray-700 dark:text-[#E4E6EB]" : "bg-[#1877F2] text-white hover:bg-[#166FE5]"}`}>
                      {t("openLink")}
                    </button>
                  </div>
                  {canInteract && (
                    <input
                      value={usernames[req.id] || ""}
                      onChange={e => setUsernames(prev => ({ ...prev, [req.id]: e.target.value }))}
                      placeholder={t("yourUsernamePlatform", { platform: PLATFORM_LABEL[req.platform] || "Platform" })}
                      maxLength={100}
                      className="w-full bg-[#F0F2F5] dark:bg-[#3A3B3C] rounded-md px-2.5 py-1.5 text-[13px] text-black dark:text-[#E4E6EB] placeholder-gray-500 dark:placeholder-[#8A8D91] outline-none border border-transparent focus:border-[#1877F2]"
                    />
                  )}
                </div>
              );
            }
            return null;
          })}

          {giveaway.notes && (
            <p className="mt-1 text-[13px] text-amber-900 dark:text-amber-100/90 whitespace-pre-wrap break-words">{giveaway.notes}</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 pb-4">
          {error && <p className="mb-2 text-[13px] font-medium text-red-600 dark:text-red-400">{error}</p>}
          {renderStatusFooter()}
        </div>
      </div>

      {/* Reward modal */}
      {reward && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/60 px-4" onMouseDown={e => { if (e.target === e.currentTarget) setReward(null); }}>
          <div className="w-full max-w-[420px] bg-white dark:bg-[#242526] rounded-xl p-5 border border-gray-200 dark:border-[#3E4042] shadow-xl">
            <div className="text-center mb-4">
              <div className="text-[40px]">🎁</div>
              <h3 className="text-[18px] font-bold text-black dark:text-[#E4E6EB]">{t("rewardTitle")}</h3>
            </div>
            <div className="flex gap-2">
              <input readOnly value={reward} className="flex-1 min-w-0 bg-[#F0F2F5] dark:bg-[#3A3B3C] rounded-lg px-3 py-2 text-[13px] text-black dark:text-[#E4E6EB] outline-none" />
              <button onClick={() => { navigator.clipboard.writeText(reward); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="px-3 rounded-lg text-[13px] font-semibold bg-gray-200 dark:bg-[#3A3B3C] text-black dark:text-[#E4E6EB] hover:bg-gray-300 dark:hover:bg-[#4E4F50]">
                {copied ? t("copied") : t("copy")}
              </button>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setReward(null)} className="flex-1 py-2 rounded-lg font-semibold text-[14px] bg-gray-200 dark:bg-[#3A3B3C] text-black dark:text-[#E4E6EB] hover:bg-gray-300 dark:hover:bg-[#4E4F50]">{t("close")}</button>
              <a href={reward} target="_blank" rel="noopener noreferrer" className="flex-1 py-2 rounded-lg font-semibold text-[14px] text-center text-white bg-[#1877F2] hover:bg-[#166FE5]">{t("openLink")}</a>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Participants modal (owner) */}
      {participants && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/60 px-4" onMouseDown={e => { if (e.target === e.currentTarget) setParticipants(null); }}>
          <div className="w-full max-w-[480px] max-h-[80vh] flex flex-col bg-white dark:bg-[#242526] rounded-xl border border-gray-200 dark:border-[#3E4042] shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#3E4042]">
              <h3 className="text-[18px] font-bold text-black dark:text-[#E4E6EB]">{t("viewParticipants")} ({participants.length})</h3>
              <button onClick={() => setParticipants(null)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-[#3A3B3C] text-gray-600 dark:text-[#B0B3B8]" aria-label={t("close")}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="overflow-y-auto p-2">
              {participants.length === 0 && <p className="p-4 text-center text-[14px] text-gray-500 dark:text-[#B0B3B8]">{t("noParticipants")}</p>}
              {participants.map(p => (
                <div key={p.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#3A3B3C]">
                  <img src={p.user.profile?.avatarUrl || "/default-avatar.svg"} alt="" className="w-9 h-9 rounded-full object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-black dark:text-[#E4E6EB] truncate">{p.user.profile?.displayName || p.user.username}</p>
                    <p className="text-[12px] text-gray-500 dark:text-[#B0B3B8]">@{p.user.username}</p>
                    {Object.entries((p.externalUsernames as Record<string, string>) || {}).map(([rid, name]) => {
                      const req = (giveaway.requirements || []).find((r: any) => r.id === rid);
                      return <p key={rid} className="text-[12px] text-gray-700 dark:text-[#E4E6EB]">{PLATFORM_LABEL[req?.platform] || "Link"}: <b>{name}</b></p>;
                    })}
                  </div>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${p.status === "WINNER" ? "bg-amber-500 text-white" : p.status === "REJECTED" ? "bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-300" : "bg-green-100 dark:bg-green-500/15 text-green-800 dark:text-green-300"}`}>
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
