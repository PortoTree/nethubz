"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getProfile } from "@/app/actions/profile";
import { getOptimizedUrl } from "@/utils/cloudinary";

export default function FloatingUserMenu({
  isDarkMode,
  setIsDarkMode,
}: {
  isDarkMode: boolean;
  setIsDarkMode: (v: boolean) => void;
}) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [navAvatar, setNavAvatar] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const userId = payload.sub || payload.id || payload._id || payload.userId;
        if (userId) {
          const res = await getProfile(userId);
          if (res.success && res.profile) {
            const userObj = { id: userId, username: payload.username || "Guest", profile: res.profile };
            setCurrentUser(userObj);
            setNavAvatar(res.profile.avatarUrl || null);
          }
        }
      } catch(e) {}
    };
    fetchUser();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!currentUser) return null;

  const displayName = currentUser.profile?.displayName || currentUser.username;

  return (
    <div className="fixed top-6 right-6 z-[9999] flex items-center gap-3">
      {/* Language Switcher */}
      <div className="relative group mx-1" ref={langRef}>
        <button
          onClick={() => setIsLangOpen(!isLangOpen)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#3A3B3C] shadow-md hover:bg-gray-100 dark:hover:bg-[#4E4F50] transition-colors text-black dark:text-[#E4E6EB] text-[13px] font-semibold"
        >
          {locale === "id" ? (
            <svg
              className="w-5 h-5 rounded-[2px] shrink-0 shadow-[0_0_2px_rgba(0,0,0,0.2)]"
              viewBox="0 0 36 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path fill="#ED2939" d="M0 0h36v18H0z" />
              <path fill="#fff" d="M0 18h36v18H0z" />
            </svg>
          ) : (
            <svg
              className="w-5 h-5 rounded-[2px] shrink-0 shadow-[0_0_2px_rgba(0,0,0,0.2)]"
              viewBox="0 0 36 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path fill="#0A3161" d="M0 0h36v36H0z" />
              <path fill="#B31942" d="M0 4.5h36v4.5H0zm0 9h36v4.5H0zm0 9h36v4.5H0zm0 9h36v4.5H0z" />
              <path fill="#fff" d="M0 9h36v4.5H0zm0 9h36v4.5H0zm0 9h36v4.5H0z" />
              <path fill="#0A3161" d="M0 0h18v18H0z" />
              <path fill="#fff" d="M3 3h2v2H3zm4 0h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2zM3 7h2v2H3zm4 0h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2zM3 11h2v2H3zm4 0h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z" />
            </svg>
          )}
          {locale === "id" ? "ID" : "EN"}
        </button>
        {isLangOpen && (
          <div className="absolute right-0 top-12 w-40 bg-white dark:bg-[#242526] rounded-xl shadow-lg border border-gray-100 dark:border-white/10 p-2 overflow-hidden">
            <button
              onClick={() => {
                document.cookie = `NEXT_LOCALE=id; path=/; max-age=31536000; SameSite=Lax`;
                localStorage.setItem("NEXT_LOCALE", "id");
                const currentPath = window.location.pathname;
                const pathWithoutLocale = currentPath.replace(/^\/(id|en)/, "");
                window.location.href = "/id" + (pathWithoutLocale || "/home");
              }}
              className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${locale === "id" ? "bg-[#E4E6EB] dark:bg-[#3A3B3C]" : "hover:bg-gray-200 dark:hover:bg-[#3A3B3C]"}`}
            >
              <svg className="w-[18px] h-[18px] rounded-sm shrink-0 shadow-[0_0_2px_rgba(0,0,0,0.2)]" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill="#ED2939" d="M0 0h36v18H0z" />
                <path fill="#fff" d="M0 18h36v18H0z" />
              </svg>
              <span className="font-semibold text-[14px] text-black dark:text-[#E4E6EB]">Indonesia</span>
            </button>
            <button
              onClick={() => {
                document.cookie = `NEXT_LOCALE=en; path=/; max-age=31536000; SameSite=Lax`;
                localStorage.setItem("NEXT_LOCALE", "en");
                const currentPath = window.location.pathname;
                const pathWithoutLocale = currentPath.replace(/^\/(id|en)/, "");
                window.location.href = "/en" + (pathWithoutLocale || "/home");
              }}
              className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors mt-1 ${locale === "en" ? "bg-[#E4E6EB] dark:bg-[#3A3B3C]" : "hover:bg-gray-200 dark:hover:bg-[#3A3B3C]"}`}
            >
              <svg className="w-[18px] h-[18px] rounded-sm shrink-0 shadow-[0_0_2px_rgba(0,0,0,0.2)]" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill="#0A3161" d="M0 0h36v36H0z" />
                <path fill="#B31942" d="M0 4.5h36v4.5H0zm0 9h36v4.5H0zm0 9h36v4.5H0zm0 9h36v4.5H0z" />
                <path fill="#fff" d="M0 9h36v4.5H0zm0 9h36v4.5H0zm0 9h36v4.5H0z" />
                <path fill="#0A3161" d="M0 0h18v18H0z" />
                <path fill="#fff" d="M3 3h2v2H3zm4 0h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2zM3 7h2v2H3zm4 0h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2zM3 11h2v2H3zm4 0h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z" />
              </svg>
              <span className="font-semibold text-[14px] text-black dark:text-[#E4E6EB]">English</span>
            </button>
          </div>
        )}
      </div>

      {/* Avatar Dropdown */}
      <div className="relative ml-1" ref={dropdownRef}>
        <div
          className="relative cursor-pointer group"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <button className="w-10 h-10 rounded-full hover:brightness-95 transition-all flex items-center justify-center overflow-hidden border border-emerald-600 dark:border-emerald-400 shrink-0 shadow-md">
            <img
              src={navAvatar ? getOptimizedUrl(navAvatar, "avatar") : "/default-avatar.svg"}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </button>
          <div className="absolute -bottom-0.5 -right-0.5 w-[16px] h-[16px] bg-[#E4E6EB] dark:bg-[#3A3B3C] rounded-full flex items-center justify-center border-2 border-white dark:border-[#242526]">
            <svg className="w-3 h-3 text-black dark:text-[#E4E6EB]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {isDropdownOpen && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 mt-3 w-80 bg-white dark:bg-[#242526] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.2)] border border-gray-100 dark:border-[#3A3B3C] p-3 overflow-hidden"
          >
            <div className="flex flex-col gap-2">
              <Link
                href={`/${locale}/p/${currentUser.username}/${currentUser.id}`}
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-[#3A3B3C] rounded-xl transition-all shadow-sm shadow-gray-200 dark:shadow-none bg-gray-50 dark:bg-[#18191A]"
              >
                <img
                  src={navAvatar ? getOptimizedUrl(navAvatar, "avatar") : "/default-avatar.svg"}
                  alt="Profile"
                  className="w-12 h-12 rounded-full border border-gray-200 dark:border-white/10 object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[16px] text-gray-900 dark:text-[#E4E6EB] truncate">
                    {displayName}
                  </h3>
                  <p className="text-[14px] text-gray-500 dark:text-[#B0B3B8] font-medium truncate">
                    @{currentUser.username}
                  </p>
                </div>
              </Link>
              <div className="h-[1px] bg-gray-200 dark:bg-[#3E4042] my-1" />
              <button className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-[#3A3B3C] transition-colors group/item">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#E4E6EB] dark:bg-[#3A3B3C] flex items-center justify-center shrink-0 overflow-hidden">
                    <svg className="w-[20px] h-[20px] text-black dark:text-[#E4E6EB]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="font-semibold text-[15px] text-black dark:text-[#E4E6EB]">
                    {t("dropdown.settings")}
                  </span>
                </div>
                <svg className="w-6 h-6 text-gray-500 dark:text-[#B0B3B8] group-hover/item:text-black dark:text-[#E4E6EB] transition-colors" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>

              <button className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-[#3A3B3C] transition-colors group/item">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#E4E6EB] dark:bg-[#3A3B3C] flex items-center justify-center shrink-0 overflow-hidden">
                    <svg className="w-[20px] h-[20px] text-black dark:text-[#E4E6EB]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="font-semibold text-[15px] text-black dark:text-[#E4E6EB]">
                    {t("dropdown.help")}
                  </span>
                </div>
                <svg className="w-6 h-6 text-gray-500 dark:text-[#B0B3B8] group-hover/item:text-black dark:text-[#E4E6EB] transition-colors" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>

              <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-[#3A3B3C] transition-colors">
                <div className="w-9 h-9 rounded-full bg-[#E4E6EB] dark:bg-[#3A3B3C] flex items-center justify-center shrink-0 overflow-hidden">
                  <svg className="w-[20px] h-[20px] text-black dark:text-[#E4E6EB]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="font-semibold text-[15px] text-black dark:text-[#E4E6EB]">
                  {t("dropdown.report")}
                </span>
              </button>

              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-[#3A3B3C] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#E4E6EB] dark:bg-[#3A3B3C] flex items-center justify-center shrink-0 overflow-hidden">
                    {isDarkMode ? (
                      <svg className="w-[20px] h-[20px] text-black dark:text-[#E4E6EB]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.5-1.591a.75.75 0 10-1.061 1.06l1.5-1.591zM12 18.75a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25a.75.75 0 01.75-.75zM6.166 18.894a.75.75 0 001.06 1.06l1.5-1.591a.75.75 0 10-1.06-1.061l-1.591 1.59zM4.5 12a.75.75 0 01-.75.75H1.5a.75.75 0 010-1.5h2.25a.75.75 0 01.75.75zM6.166 5.106a.75.75 0 00-1.06 1.06l1.591 1.59a.75.75 0 101.06-1.061l-1.5-1.59z" /></svg>
                    ) : (
                      <svg className="w-[20px] h-[20px] text-black dark:text-[#E4E6EB]" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd" /></svg>
                    )}
                  </div>
                  <span className="font-semibold text-[15px] text-black dark:text-[#E4E6EB]">
                    {isDarkMode ? t("dropdown.lightMode") : t("dropdown.darkMode")}
                  </span>
                </div>
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                  window.location.href = `/login`;
                }}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-[#3A3B3C] transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-[#E4E6EB] dark:bg-[#3A3B3C] flex items-center justify-center shrink-0 overflow-hidden">
                  <svg className="w-5 h-5 text-black dark:text-[#E4E6EB] ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                </div>
                <span className="font-semibold text-[15px] text-black dark:text-[#E4E6EB]">
                  {t("dropdown.logout")}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
