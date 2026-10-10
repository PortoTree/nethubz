import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

interface ProfileSuggestionProps {
  profile: any;
  username: string;
  userId: string;
}

export default function ProfileSuggestion({ profile, username, userId }: ProfileSuggestionProps) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("profileSuggestion");

  const [isClosed, setIsClosed] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!profile) return;

    const wajibFilled = !!(profile.locationName && profile.birthDate && profile.avatarUrl && profile.coverUrl);
    
    if (wajibFilled) {
      const dismissed = localStorage.getItem("profileSuggestionDismissed");
      if (dismissed === "true") {
        setIsClosed(true);
      } else {
        setIsClosed(false);
      }
    } else {
      setIsClosed(false);
    }
  }, [profile]);

  if (!mounted || isClosed || !profile) return null;

  const missingWajib = [];
  if (!profile.locationName) missingWajib.push({ label: t("labels.location"), tab: "dasar" });
  if (!profile.birthDate) missingWajib.push({ label: t("labels.birthDate"), tab: "dasar" });
  if (!profile.avatarUrl) missingWajib.push({ label: t("labels.avatar"), tab: "tampilan" });
  if (!profile.coverUrl) missingWajib.push({ label: t("labels.cover"), tab: "tampilan" });

  const missingNonWajib = [];
  if (!profile.profession) missingNonWajib.push({ label: t("labels.profession"), tab: "profesi" });
  if (!profile.education) missingNonWajib.push({ label: t("labels.education"), tab: "pendidikan" });
  if (!profile.socialLinks || profile.socialLinks.length === 0) missingNonWajib.push({ label: t("labels.social"), tab: "sosmed" });
  if (!profile.hobbies || profile.hobbies.length === 0) missingNonWajib.push({ label: t("labels.hobby"), tab: "hobby" });
  
  const hasMinat = (profile.movies?.length > 0) || (profile.music?.length > 0) || (profile.sports?.length > 0) || (profile.games?.length > 0) || (profile.tvShows?.length > 0);
  if (!hasMinat) missingNonWajib.push({ label: t("labels.interests"), tab: "minat" });

  if (missingWajib.length === 0 && missingNonWajib.length === 0) {
    return null;
  }

  const handleClose = () => {
    setIsClosed(true);
    if (missingWajib.length === 0) {
      localStorage.setItem("profileSuggestionDismissed", "true");
    }
  };

  const handleNavigate = (tab: string) => {
    router.push(`/${locale}/p/${username}/${userId}?edit=true&editTab=${tab}`);
  };

  return (
    <div className="mb-6">
      <div 
        className="flex items-center justify-between px-2 py-1.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#3A3B3C] rounded-lg transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span className="font-semibold text-[14px] text-gray-800 dark:text-[#E4E6EB]">{t("title")}</span>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={(e) => { e.stopPropagation(); handleClose(); }}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-[#4E4F50] text-gray-500 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="px-2 pb-2 pt-1 mt-1">
          <p className="text-[12px] text-gray-500 dark:text-[#B0B3B8] pb-3 mb-3 leading-relaxed border-b border-gray-200 dark:border-[#3E4042]">
            {t("subtitle")}
          </p>
          <div className="space-y-1.5 mt-2">
            {missingWajib.map((item, idx) => (
              <div key={`w-${idx}`} className="flex items-center justify-between">
                <span className="text-[13px] text-gray-700 dark:text-[#E4E6EB]">{item.label}</span>
                <button 
                  onClick={() => handleNavigate(item.tab)}
                  className="text-[13px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  {t("addAction")}
                </button>
              </div>
            ))}
            {missingNonWajib.map((item, idx) => (
              <div key={`nw-${idx}`} className="flex items-center justify-between">
                <span className="text-[13px] text-gray-700 dark:text-[#E4E6EB]">{item.label}</span>
                <button 
                  onClick={() => handleNavigate(item.tab)}
                  className="text-[13px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  {t("addAction")}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
