"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";

export type GiveawayRequirementDraft = {
  type: "FOLLOW_USER" | "JOIN_GROUP" | "EXTERNAL_SOCIAL";
  targetId?: string | null;
  url?: string | null;
  platform?: string | null;
  // UI only
  targetUser?: { id: string; username: string; profile?: { displayName?: string; avatarUrl?: string } } | null;
};

export type GiveawayDraft = {
  title?: string;
  rewardType: "GDRIVE_LINK" | "OTHER_LINK";
  rewardLink: string;
  notes: string;
  endsAt: string; // ISO
  mode: "ALL_ELIGIBLE" | "RANDOM_DRAW";
  winnerCount: number | null;
  maxParticipants: number | null;
  minAccountAgeDays: number;
  requirements: GiveawayRequirementDraft[];
};

export function detectPlatform(url: string): string {
  const u = url.toLowerCase();
  if (u.includes("instagram.com")) return "instagram";
  if (u.includes("tiktok.com")) return "tiktok";
  if (u.includes("twitter.com") || u.includes("x.com")) return "x";
  if (u.includes("youtube.com") || u.includes("youtu.be")) return "youtube";
  if (u.includes("facebook.com") || u.includes("fb.com")) return "facebook";
  if (u.includes("threads.net")) return "threads";
  if (u.includes("t.me") || u.includes("telegram")) return "telegram";
  if (u.includes("discord")) return "discord";
  return "other";
}

const URL_RE = /^https?:\/\/\S+$/i;

function toLocalInput(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (draft: GiveawayDraft) => void;
  currentUser: any;
  initial?: GiveawayDraft | null;
}

export default function GiveawayFormModal({ isOpen, onClose, onSave, currentUser, initial }: Props) {
  const t = useTranslations("giveaway");

  const [title, setTitle] = useState("");
  const [rewardType, setRewardType] = useState<GiveawayDraft["rewardType"]>("GDRIVE_LINK");
  const [rewardLink, setRewardLink] = useState("");
  const [followMe, setFollowMe] = useState(true);
  const [otherFollows, setOtherFollows] = useState<GiveawayRequirementDraft[]>([]);
  const [externalOn, setExternalOn] = useState(false);
  const [externalUrls, setExternalUrls] = useState<string[]>([""]);
  const [mode, setMode] = useState<GiveawayDraft["mode"]>("ALL_ELIGIBLE");
  const [winnerCount, setWinnerCount] = useState<number>(1);
  const [unlimited, setUnlimited] = useState(false);
  const [maxParticipants, setMaxParticipants] = useState<number>(100);
  const [endsAtLocal, setEndsAtLocal] = useState("");
  const [minAge, setMinAge] = useState(0);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [searchQ, setSearchQ] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Init / reset when opened
  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    if (initial) {
      setTitle(initial.title || "");
      setRewardType(initial.rewardType);
      setRewardLink(initial.rewardLink);
      setFollowMe(initial.requirements.some(r => r.type === "FOLLOW_USER" && r.targetId === currentUser?.id));
      setOtherFollows(initial.requirements.filter(r => r.type === "FOLLOW_USER" && r.targetId !== currentUser?.id));
      const ext = initial.requirements.filter(r => r.type === "EXTERNAL_SOCIAL");
      setExternalOn(ext.length > 0);
      setExternalUrls(ext.length ? ext.map(r => r.url || "") : [""]);
      setMode(initial.mode);
      setWinnerCount(initial.winnerCount || 1);
      setUnlimited(initial.maxParticipants == null);
      setMaxParticipants(initial.maxParticipants || 100);
      setEndsAtLocal(toLocalInput(new Date(initial.endsAt)));
      setMinAge(initial.minAccountAgeDays);
      setNotes(initial.notes);
    } else {
      const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
      d.setSeconds(0, 0);
      setEndsAtLocal(toLocalInput(d));
    }
  }, [isOpen, initial, currentUser?.id]);

  // User search for "follow other account"
  useEffect(() => {
    if (!searchQ.trim()) { setSearchResults([]); return; }
    const h = setTimeout(async () => {
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(searchQ)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(
            (data.users || []).filter((u: any) => u.id !== currentUser?.id && !otherFollows.some(o => o.targetId === u.id)).slice(0, 5)
          );
        }
      } catch { /* ignore */ }
    }, 300);
    return () => clearTimeout(h);
  }, [searchQ, currentUser?.id, otherFollows]);

  if (!isOpen || typeof document === "undefined") return null;

  const handleSave = () => {
    setError(null);
    if (!URL_RE.test(rewardLink.trim())) return setError(t("errReward"));

    const end = new Date(endsAtLocal);
    if (isNaN(end.getTime()) || end.getTime() <= Date.now() + 5 * 60 * 1000) return setError(t("errEnd"));

    const requirements: GiveawayRequirementDraft[] = [];
    if (followMe && currentUser?.id) {
      requirements.push({ type: "FOLLOW_USER", targetId: currentUser.id, targetUser: currentUser });
    }
    requirements.push(...otherFollows);
    if (externalOn) {
      const urls = externalUrls.map(u => u.trim()).filter(Boolean);
      if (urls.length === 0 || urls.some(u => !URL_RE.test(u))) return setError(t("errExternal"));
      urls.forEach(url => requirements.push({ type: "EXTERNAL_SOCIAL", url, platform: detectPlatform(url) }));
    }
    if (requirements.length === 0) return setError(t("errReq"));
    if (mode === "RANDOM_DRAW" && (!winnerCount || winnerCount < 1)) return setError(t("errWinner"));
    if (!unlimited && (!maxParticipants || maxParticipants < 1)) return setError(t("errLimit"));

    onSave({
      title: title.trim() || undefined,
      rewardType,
      rewardLink: rewardLink.trim(),
      notes: notes.trim(),
      endsAt: end.toISOString(),
      mode,
      winnerCount: mode === "RANDOM_DRAW" ? winnerCount : null,
      maxParticipants: unlimited ? null : maxParticipants,
      minAccountAgeDays: minAge,
      requirements,
    });
  };

  const sectionTitle = "text-[13px] font-bold uppercase tracking-wide text-gray-500 dark:text-[#B0B3B8] mb-2";
  const inputCls = "w-full bg-[#F0F2F5] dark:bg-[#3A3B3C] border border-transparent focus:border-[#1877F2] rounded-lg px-3 py-2 text-[14px] text-black dark:text-[#E4E6EB] placeholder-gray-500 dark:placeholder-[#8A8D91] outline-none transition-colors";
  const chip = (active: boolean) =>
    `flex-1 px-3 py-2 rounded-lg text-[14px] font-semibold border transition-colors text-left ${
      active
        ? "bg-[#E7F3FF] dark:bg-[#263951] text-[#1877F2] dark:text-[#4599FF] border-[#1877F2]/40"
        : "bg-transparent text-gray-700 dark:text-[#E4E6EB] border-gray-300 dark:border-[#3E4042] hover:bg-gray-50 dark:hover:bg-[#3A3B3C]"
    }`;
  const checkRow = "flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#3A3B3C] cursor-pointer transition-colors";
  const checkbox = "w-4 h-4 accent-[#1877F2] cursor-pointer";

  return createPortal(
    <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/60 dark:bg-black/70 px-4" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-[520px] max-h-[90vh] bg-white dark:bg-[#242526] rounded-xl shadow-xl flex flex-col border border-gray-200 dark:border-[#3E4042]">
        {/* Header */}
        <div className="flex items-center justify-center p-4 border-b border-gray-200 dark:border-[#3E4042] relative shrink-0">
          <button onClick={onClose} className="absolute left-4 w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-[#3A3B3C] text-gray-600 dark:text-[#B0B3B8] transition-colors" aria-label={t("cancel")}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="flex items-center gap-2">
            <img src="/navigasi/giveaway.svg" alt="" className="w-6 h-6" />
            <h2 className="text-[20px] font-bold text-black dark:text-[#E4E6EB]">{t("title")}</h2>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto flex flex-col gap-5">
          {/* Title */}
          <section>
            <h3 className={sectionTitle}>{t("titleLabel")}</h3>
            <input 
              type="text" 
              maxLength={9}
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              placeholder={t("titlePlaceholder")} 
              className={inputCls} 
            />
          </section>

          {/* Reward */}
          <section>
            <h3 className={sectionTitle}>{t("rewardSection")}</h3>
            <div className="flex gap-2 mb-2">
              <button id="giveaway-reward-gdrive" type="button" onClick={() => setRewardType("GDRIVE_LINK")} className={chip(rewardType === "GDRIVE_LINK")}>{t("rewardGdrive")}</button>
              <button id="giveaway-reward-other" type="button" onClick={() => setRewardType("OTHER_LINK")} className={chip(rewardType === "OTHER_LINK")}>{t("rewardOther")}</button>
            </div>
            <input id="giveaway-reward-link" type="url" value={rewardLink} onChange={e => setRewardLink(e.target.value)} placeholder={rewardType === "GDRIVE_LINK" ? "https://drive.google.com/..." : t("rewardLinkPlaceholder")} className={inputCls} />
            <p className="mt-1.5 flex items-center gap-1.5 text-[12px] text-gray-500 dark:text-[#B0B3B8]">
              <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
              {t("rewardLinkHint")}
            </p>
          </section>

          {/* Requirements */}
          <section>
            <h3 className={sectionTitle}>{t("requirementsSection")}</h3>
            <label className={checkRow}>
              <input type="checkbox" className={checkbox} checked={followMe} onChange={e => setFollowMe(e.target.checked)} />
              <img src={currentUser?.profile?.avatarUrl || "/default-avatar.svg"} alt="" className="w-7 h-7 rounded-full object-cover" />
              <span className="text-[14px] font-medium text-black dark:text-[#E4E6EB]">{t("reqFollowMe")}</span>
            </label>

            {/* Follow other accounts */}
            <div className="p-2.5">
              <p className="text-[14px] font-medium text-black dark:text-[#E4E6EB] mb-2">{t("reqFollowOther")}</p>
              {otherFollows.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {otherFollows.map(o => (
                    <span key={o.targetId} className="flex items-center gap-1.5 bg-[#F0F2F5] dark:bg-[#3A3B3C] rounded-full pl-1 pr-2 py-1">
                      <img src={o.targetUser?.profile?.avatarUrl || "/default-avatar.svg"} alt="" className="w-5 h-5 rounded-full object-cover" />
                      <span className="text-[12px] font-semibold text-black dark:text-[#E4E6EB]">@{o.targetUser?.username}</span>
                      <button type="button" onClick={() => setOtherFollows(prev => prev.filter(p => p.targetId !== o.targetId))} className="text-gray-500 dark:text-[#B0B3B8] hover:text-red-500" aria-label={t("remove")}>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="relative">
                <input id="giveaway-follow-search" value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder={t("reqFollowSearch")} className={inputCls} />
                {searchResults.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-[#3A3B3C] border border-gray-200 dark:border-[#4E4F50] rounded-lg shadow-xl z-10 overflow-hidden">
                    {searchResults.map(u => (
                      <button key={u.id} type="button" onClick={() => { setOtherFollows(prev => [...prev, { type: "FOLLOW_USER", targetId: u.id, targetUser: u }]); setSearchQ(""); }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-[#4E4F50] text-left">
                        <img src={u.profile?.avatarUrl || "/default-avatar.svg"} alt="" className="w-7 h-7 rounded-full object-cover" />
                        <div className="flex flex-col">
                          <span className="text-[14px] font-semibold text-black dark:text-[#E4E6EB]">{u.profile?.displayName || u.username}</span>
                          <span className="text-[12px] text-gray-500 dark:text-[#B0B3B8]">@{u.username}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className={`${checkRow} opacity-50 cursor-not-allowed`}>
              <input type="checkbox" className={checkbox} disabled />
              <span className="text-[14px] font-medium text-black dark:text-[#E4E6EB]">{t("reqJoinGroup")}</span>
              <span className="ml-auto text-[11px] font-bold px-2 py-0.5 rounded-full bg-gray-200 dark:bg-[#4E4F50] text-gray-600 dark:text-[#E4E6EB]">{t("comingSoon")}</span>
            </div>

            <label className={checkRow}>
              <input type="checkbox" className={checkbox} checked={externalOn} onChange={e => setExternalOn(e.target.checked)} />
              <span className="text-[14px] font-medium text-black dark:text-[#E4E6EB]">{t("reqExternal")}</span>
            </label>
            {externalOn && (
              <div className="pl-9 pr-2.5 flex flex-col gap-2">
                {externalUrls.map((url, i) => (
                  <div key={i} className="flex gap-2">
                    <input type="url" value={url} onChange={e => setExternalUrls(prev => prev.map((p, idx) => (idx === i ? e.target.value : p)))} placeholder={t("reqExternalUrlPlaceholder")} className={inputCls} />
                    {externalUrls.length > 1 && (
                      <button type="button" onClick={() => setExternalUrls(prev => prev.filter((_, idx) => idx !== i))} className="px-2 text-gray-500 dark:text-[#B0B3B8] hover:text-red-500" aria-label={t("remove")}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    )}
                  </div>
                ))}
                {externalUrls.length < 5 && (
                  <button type="button" onClick={() => setExternalUrls(prev => [...prev, ""])} className="self-start text-[13px] font-semibold text-[#1877F2] dark:text-[#4599FF] hover:underline">+ {t("reqExternalAdd")}</button>
                )}
                <p className="text-[12px] text-gray-500 dark:text-[#B0B3B8]">{t("reqExternalHint")}</p>
              </div>
            )}
          </section>

          {/* Mode */}
          <section>
            <h3 className={sectionTitle}>{t("modeSection")}</h3>
            <div className="flex gap-2">
              <button type="button" onClick={() => setMode("ALL_ELIGIBLE")} className={chip(mode === "ALL_ELIGIBLE")}>
                <div>{t("modeAll")}</div>
                <div className="text-[12px] font-normal text-gray-500 dark:text-[#B0B3B8] mt-0.5">{t("modeAllDesc")}</div>
              </button>
              <button type="button" onClick={() => setMode("RANDOM_DRAW")} className={chip(mode === "RANDOM_DRAW")}>
                <div>{t("modeDraw")}</div>
                <div className="text-[12px] font-normal text-gray-500 dark:text-[#B0B3B8] mt-0.5">{t("modeDrawDesc")}</div>
              </button>
            </div>
            {mode === "RANDOM_DRAW" && (
              <div className="mt-2 flex items-center gap-3">
                <span className="text-[14px] text-black dark:text-[#E4E6EB]">{t("winnerCount")}</span>
                <input type="number" min={1} value={winnerCount} onChange={e => setWinnerCount(parseInt(e.target.value) || 0)} className={`${inputCls} !w-24`} />
              </div>
            )}
          </section>

          {/* Participant limit */}
          <section>
            <h3 className={sectionTitle}>{t("limitSection")}</h3>
            <div className="flex items-center gap-3">
              <input type="number" min={1} disabled={unlimited} value={maxParticipants} onChange={e => setMaxParticipants(parseInt(e.target.value) || 0)} className={`${inputCls} !w-32 disabled:opacity-50`} aria-label={t("limitMax")} />
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className={checkbox} checked={unlimited} onChange={e => setUnlimited(e.target.checked)} />
                <span className="text-[14px] text-black dark:text-[#E4E6EB]">{t("limitUnlimited")}</span>
              </label>
            </div>
          </section>

          {/* End date */}
          <section>
            <h3 className={sectionTitle}>{t("endSection")}</h3>
            <input id="giveaway-ends-at" type="datetime-local" value={endsAtLocal} min={toLocalInput(new Date())} onChange={e => setEndsAtLocal(e.target.value)} className={`${inputCls} dark:[color-scheme:dark]`} />
          </section>

          {/* Min account age */}
          <section>
            <h3 className={sectionTitle}>{t("minAgeSection")}</h3>
            <select value={minAge} onChange={e => setMinAge(parseInt(e.target.value))} className={inputCls}>
              <option value={0}>{t("minAgeOff")}</option>
              {[1, 3, 7, 14, 30].map(d => <option key={d} value={d}>{t("minAgeDays", { days: d })}</option>)}
            </select>
          </section>

          {/* Notes */}
          <section>
            <h3 className={sectionTitle}>{t("notesSection")}</h3>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} maxLength={1000} rows={3} placeholder={t("notesPlaceholder")} className={`${inputCls} resize-none`} />
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-[#3E4042] shrink-0">
          {error && <p className="mb-2 text-[13px] font-medium text-red-600 dark:text-red-400">{error}</p>}
          <button id="giveaway-save" type="button" onClick={handleSave} className="w-full py-2.5 rounded-lg font-semibold text-[15px] text-white bg-[#1877F2] hover:bg-[#166FE5] transition-colors">
            {t("save")}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
