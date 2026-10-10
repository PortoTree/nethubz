"use client";

import React, { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";

import Image from "next/image";

export default function RegisterPage() {
  const t = useTranslations();
  const router = useRouter();
  const [type, setType] = useState<"website" | "profile">("website");
  const [slug, setSlug] = useState("");
  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => setIsMounted(true), []);


  const [isLangOpen, setIsLangOpen] = useState(false);
  const langRef = React.useRef<HTMLDivElement>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);

  React.useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
    } else {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const [currentUser, setCurrentUser] = useState<any>({ displayName: "User", email: "user@example.com", photoURL: "/profil.jpg", username: "User" });

  React.useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.username || payload.name) {
          setCurrentUser({
            username: payload.username || payload.name || "User",
            displayName: payload.displayName || payload.username || payload.name || "User",
            photoURL: "/profil.jpg"
          });
        }
      } catch (e) {
        console.error("Failed to parse token");
      }
    }
  }, []);



  const [activeTab, setActiveTab] = useState<"home" | "search" | "friend" | "community" | "community-groups" | "chat" | "product">("none" as any);
  const [isSearchNavOpen, setIsSearchNavOpen] = useState(false);
  const searchNavRef = React.useRef<HTMLDivElement>(null);
  const [isNotifPanelOpen, setIsNotifPanelOpen] = useState(false);
  const notifBtnRef = React.useRef<HTMLButtonElement>(null);

  const [isNotifMenuOpen, setIsNotifMenuOpen] = React.useState(false);
  const notifMenuRef = React.useRef<HTMLDivElement>(null);
  const [isNotifFilterOpen, setIsNotifFilterOpen] = React.useState(false);
  const notifFilterRef = React.useRef<HTMLDivElement>(null);

  const notifPanelRef = React.useRef<HTMLDivElement>(null);

  const locale = useLocale();

  
  
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchNavRef.current && !searchNavRef.current.contains(event.target as Node)) {
        setIsSearchNavOpen(false);
      }
      if (langRef.current && !langRef.current.contains(event.target as Node)) setIsLangOpen(false);
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsDropdownOpen(false);
      
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target as Node)) setIsNotifMenuOpen(false);
      if (notifFilterRef.current && !notifFilterRef.current.contains(event.target as Node)) setIsNotifFilterOpen(false);
      if (notifBtnRef.current && !notifBtnRef.current.contains(event.target as Node)) {
  
        setIsNotifPanelOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, "").slice(0, 30);
    setSlug(val);
  };

  const handleNav = (tab: string) => {
    if (tab === "home") router.push("/home");
    else if (tab === "product") router.push("/product");
    else if (tab === "friend") router.push("/friend");
    else if (tab === "group") router.push("/community");
  };

  return (
    <>
      <nav className="bg-white dark:bg-[#242526] shadow-sm sticky top-0 z-[100] h-[56px] px-4 flex items-center justify-between border-b border-gray-200 dark:border-[#3E4042]">
        {/* Left: Logo & Search */}
        <div className="flex items-center gap-2">
          {/* Logo - dark text for light mode, white text for dark mode */}
          <img
            src="/logo-horizontal.png"
            alt="NetHubz"
            className="h-[40px] w-auto object-contain dark:hidden"
          />
          <img
            src="/logo-horizontal2.png"
            alt="NetHubz"
            className="h-[40px] w-auto object-contain hidden dark:block"
          />
        </div>

        {/* Center: Tabs */}
        <div className="hidden md:flex items-center justify-center gap-2 absolute left-1/2 -translate-x-1/2 h-full">
          <div
            onClick={() => {
              router.push(`/${locale}/home`);
            }}
            className={`flex flex-col items-center justify-center w-[110px] h-full cursor-pointer ${activeTab === "home" ? "border-b-[3px] border-emerald-500 text-emerald-500 dark:text-emerald-400 dark:border-emerald-400" : "border-b-[3px] border-transparent text-gray-500 dark:text-[#B0B3B8] hover:bg-gray-200 dark:hover:bg-[#3A3B3C] rounded-lg my-1 transition-colors"}`}
          >
            <div
              className="w-7 h-7 bg-current"
              style={{
                WebkitMask: `url(${activeTab === "home" ? "/navigasi/home-aktif.svg" : "/navigasi/home.svg"}) center/contain no-repeat`,
                mask: `url(${activeTab === "home" ? "/navigasi/home-aktif.svg" : "/navigasi/home.svg"}) center/contain no-repeat`,
              }}
            />
            <span className="text-[11px] font-semibold mt-0.5">
              {t("tabs.home")}
            </span>
          </div>
          <div
            onClick={() => {
              router.push(`/${locale}/product`);
            }}
            className={`flex flex-col items-center justify-center w-[110px] h-full cursor-pointer transition-colors ${activeTab === "product" ? "border-b-[3px] border-emerald-500 text-emerald-500 dark:text-emerald-400 dark:border-emerald-400 my-0 h-full rounded-none" : "border-b-[3px] border-transparent text-gray-500 dark:text-[#B0B3B8] hover:bg-gray-200 dark:hover:bg-[#3A3B3C] rounded-lg my-1"}`}
          >
            <div
              className="w-7 h-7 bg-current"
              style={{
                WebkitMask: `url(${activeTab === "product" ? "/navigasi/produk-aktif.svg" : "/navigasi/produk.svg"}) center/contain no-repeat`,
                mask: `url(${activeTab === "product" ? "/navigasi/produk-aktif.svg" : "/navigasi/produk.svg"}) center/contain no-repeat`,
              }}
            />
            <span className="text-[11px] font-semibold mt-0.5">
              {t("tabs.product")}
            </span>
          </div>
          <div
            onClick={() => {
              router.push(`/${locale}/chatting`);
            }}
            className={`flex flex-col items-center justify-center w-[110px] h-full cursor-pointer transition-colors ${activeTab === "chat" ? "border-b-[3px] border-emerald-500 text-emerald-500 dark:text-emerald-400 dark:border-emerald-400 my-0 h-full rounded-none" : "border-b-[3px] border-transparent text-gray-500 dark:text-[#B0B3B8] hover:bg-gray-200 dark:hover:bg-[#3A3B3C] rounded-lg my-1"}`}
          >
            <div
              className="w-7 h-7 bg-current"
              style={{
                WebkitMask: `url(${activeTab === "chat" ? "/navigasi/chat-aktif.svg" : "/navigasi/chat.svg"}) center/contain no-repeat`,
                mask: `url(${activeTab === "chat" ? "/navigasi/chat-aktif.svg" : "/navigasi/chat.svg"}) center/contain no-repeat`,
              }}
            />
            <span className="text-[11px] font-semibold mt-0.5">
              {t("nav.chat")}
            </span>
          </div>
          <div
            onClick={() => {
              router.push(`/${locale}/friend`);
            }}
            className={`flex flex-col items-center justify-center w-[110px] h-full cursor-pointer transition-colors ${activeTab === "friend" ? "border-b-[3px] border-emerald-500 text-emerald-500 dark:text-emerald-400 dark:border-emerald-400 my-0 h-full rounded-none" : "border-b-[3px] border-transparent text-gray-500 dark:text-[#B0B3B8] hover:bg-gray-200 dark:hover:bg-[#3A3B3C] rounded-lg my-1"}`}
          >
            <div
              className="w-7 h-7 bg-current"
              style={{
                WebkitMask: `url(${activeTab === "friend" ? "/navigasi/teman-aktif.svg" : "/navigasi/teman.svg"}) center/contain no-repeat`,
                mask: `url(${activeTab === "friend" ? "/navigasi/teman-aktif.svg" : "/navigasi/teman.svg"}) center/contain no-repeat`,
              }}
            />
            <span className="text-[11px] font-semibold mt-0.5">
              {t("tabs.friends")}
            </span>
          </div>
          <div
            onClick={() => {
              router.push(`/${locale}/community`);
            }}
            className={`flex flex-col items-center justify-center w-[110px] h-full cursor-pointer transition-colors ${activeTab === "community" ? "border-b-[3px] border-emerald-500 text-emerald-500 dark:text-emerald-400 dark:border-emerald-400 my-0 h-full rounded-none" : "border-b-[3px] border-transparent text-gray-500 dark:text-[#B0B3B8] hover:bg-gray-200 dark:hover:bg-[#3A3B3C] rounded-lg my-1"}`}
          >
            <div
              className="w-7 h-7 bg-current"
              style={{
                WebkitMask: `url(${activeTab === "community" ? "/navigasi/komunitas-aktif.svg" : "/navigasi/komunitas.svg"}) center/contain no-repeat`,
                mask: `url(${activeTab === "community" ? "/navigasi/komunitas-aktif.svg" : "/navigasi/komunitas.svg"}) center/contain no-repeat`,
              }}
            />
            <span className="text-[11px] font-semibold mt-0.5">
              {t("tabs.groups")}
            </span>
          </div>
        </div>

        {/* Right: Icons & Avatar */}
        <div className="flex items-center gap-2 relative">
          <div className="relative group" ref={searchNavRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsSearchNavOpen(!isSearchNavOpen);
              }}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors overflow-hidden ${isSearchNavOpen || activeTab === "search" ? "bg-[#D8F0E2] dark:bg-[#203D2E] text-emerald-600 dark:text-emerald-400" : "bg-[#E4E6EB] dark:bg-[#3A3B3C] hover:bg-[#F3F2EF] dark:hover:bg-[#18191A] text-black dark:text-[#E4E6EB]"}`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            
            {/* Tooltip */}
            <div className="absolute top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/80 text-white text-[13px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap z-[60]">
              {t("tabs.search")}
            </div>

            {/* Search Dropdown */}
            {isSearchNavOpen && (
              <div
                className="absolute top-[52px] right-0 w-[300px] sm:w-[360px] bg-white dark:bg-[#242526] rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.2)] border border-gray-100 dark:border-[#3E4042] z-[100]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="relative group/visit">
                      <button
                        onClick={() => router.push(`/${locale}/search`)}
                        className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 dark:bg-[#3A3B3C] hover:bg-emerald-50 dark:hover:bg-[#203D2E] transition-colors shrink-0 border border-gray-200 dark:border-[#4E4F50]"
                      >
                        <img
                          src="/visit.png"
                          alt="Visit"
                          className="w-7 h-7 object-contain group-hover/visit:scale-110 transition-transform"
                        />
                      </button>
                      <div className="absolute top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/80 text-white text-[13px] rounded-lg opacity-0 group-hover/visit:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap z-[60]">
                        {t("search.visit")}
                      </div>
                    </div>
                    <div className="flex-1 flex items-center gap-2 bg-gray-100 dark:bg-[#3A3B3C] rounded-full px-4 py-2 border border-gray-200 dark:border-[#4E4F50] focus-within:border-emerald-500 transition-colors">
                      <svg className="w-5 h-5 text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input
                        type="text"
                        placeholder="Pencarian..."
                        className="w-full bg-transparent border-none outline-none text-[15px] text-black dark:text-[#E4E6EB] placeholder-gray-500 min-w-0"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            setIsSearchNavOpen(false);
                            router.push(`/${locale}/home`);

                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Dummy Recent Searches */}
                  <div className="mt-4 px-1 pb-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-[15px] font-semibold text-black dark:text-[#E4E6EB]">
                        {t("search.recent") || "Pencarian Terakhir"}
                      </h4>
                      <button className="text-[14px] text-emerald-600 dark:text-emerald-400 hover:bg-gray-100 dark:hover:bg-[#3A3B3C] px-2 py-1 rounded-md transition-colors">
                        {t("search.edit") || "Edit"}
                      </button>
                    </div>
                    <div className="flex flex-col">
                      {[
                        "Villa murah di Bali",
                        "Lowongan kerja Jakarta",
                        "Jasa desain grafis",
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-2 -mx-2 hover:bg-gray-100 dark:hover:bg-[#3A3B3C] rounded-lg cursor-pointer group transition-colors">
                          <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-[#4E4F50] flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5 text-gray-600 dark:text-[#B0B3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <span className="flex-1 text-[15px] font-medium text-black dark:text-[#E4E6EB] truncate">
                            {item}
                          </span>
                          <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-300 dark:hover:bg-[#4E4F50] text-gray-500 opacity-0 group-hover:opacity-100 transition-all" title="Hapus">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="relative group">
            <button
              ref={notifBtnRef}
              onClick={() => setIsNotifPanelOpen(!isNotifPanelOpen)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors overflow-hidden ${isNotifPanelOpen ? "bg-[#D8F0E2] dark:bg-[#203D2E]" : "bg-[#E4E6EB] dark:bg-[#3A3B3C] hover:bg-[#F3F2EF] dark:hover:bg-[#18191A]"}`}
            >
              <img
                src="/pemberitahuan.svg"
                alt={t("nav.notifications")}
                className="w-[26px] h-[26px] object-contain"
              />
            </button>
            <div className="absolute top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/80 text-white text-[13px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap z-[60]">
              {t("nav.notifications")}
            </div>
          </div>

          {/* Vertical Separator */}
          <div className="w-[1px] h-6 bg-gray-300 dark:bg-[#3E4042] mx-1"></div>

          {/* Language Switcher */}
          <div className="relative group mx-1" ref={langRef}>
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E4E6EB] dark:bg-[#3A3B3C] hover:bg-[#D8D9DB] dark:hover:bg-[#4E4F50] transition-colors text-black dark:text-[#E4E6EB] text-[13px] font-semibold"
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
                  <path
                    fill="#B31942"
                    d="M0 4.5h36v4.5H0zm0 9h36v4.5H0zm0 9h36v4.5H0zm0 9h36v4.5H0z"
                  />
                  <path
                    fill="#fff"
                    d="M0 9h36v4.5H0zm0 9h36v4.5H0zm0 9h36v4.5H0z"
                  />
                  <path fill="#0A3161" d="M0 0h18v18H0z" />
                  <path
                    fill="#fff"
                    d="M3 3h2v2H3zm4 0h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2zM3 7h2v2H3zm4 0h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2zM3 11h2v2H3zm4 0h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"
                  />
                </svg>
              )}
              {locale === "id" ? "ID" : "EN"}
            </button>

            <div
              className={`absolute top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/80 text-white text-[13px] rounded-lg opacity-0 ${!isLangOpen ? "group-hover:opacity-100" : ""} transition-opacity duration-150 pointer-events-none whitespace-nowrap z-[60]`}
            >
              {t("common.language")}
            </div>

            {isLangOpen && (
              <div className="absolute top-12 right-0 w-[140px] bg-white dark:bg-[#242526] rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.15)] border border-gray-200 dark:border-[#3E4042] p-2 z-[100]">
                <button
                  onClick={() => {
                    document.cookie = `NEXT_LOCALE=id; path=/; max-age=31536000; SameSite=Lax`;
                    localStorage.setItem("NEXT_LOCALE", "id");
                    const currentPath = window.location.pathname;
                    const pathWithoutLocale = currentPath.replace(
                      /^\/(id|en)/,
                      "",
                    );
                    window.location.href =
                      "/id" + (pathWithoutLocale || "/home");
                  }}
                  className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${locale === "id" ? "bg-[#E4E6EB] dark:bg-[#3A3B3C]" : "hover:bg-gray-200 dark:hover:bg-[#3A3B3C]"}`}
                >
                  <svg
                    className="w-[18px] h-[18px] rounded-sm shrink-0 shadow-[0_0_2px_rgba(0,0,0,0.2)]"
                    viewBox="0 0 36 36"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path fill="#ED2939" d="M0 0h36v18H0z" />
                    <path fill="#fff" d="M0 18h36v18H0z" />
                  </svg>
                  <span className="font-semibold text-[14px] text-black dark:text-[#E4E6EB]">
                    Indonesia
                  </span>
                </button>
                <button
                  onClick={() => {
                    document.cookie = `NEXT_LOCALE=en; path=/; max-age=31536000; SameSite=Lax`;
                    localStorage.setItem("NEXT_LOCALE", "en");
                    const currentPath = window.location.pathname;
                    const pathWithoutLocale = currentPath.replace(
                      /^\/(id|en)/,
                      "",
                    );
                    window.location.href =
                      "/en" + (pathWithoutLocale || "/home");
                  }}
                  className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors mt-1 ${String(locale) === "en" ? "bg-[#E4E6EB] dark:bg-[#3A3B3C]" : "hover:bg-gray-200 dark:hover:bg-[#3A3B3C]"}`}
                >
                  <svg
                    className="w-[18px] h-[18px] rounded-sm shrink-0 shadow-[0_0_2px_rgba(0,0,0,0.2)]"
                    viewBox="0 0 36 36"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path fill="#0A3161" d="M0 0h36v36H0z" />
                    <path
                      fill="#B31942"
                      d="M0 4.5h36v4.5H0zm0 9h36v4.5H0zm0 9h36v4.5H0zm0 9h36v4.5H0z"
                    />
                    <path
                      fill="#fff"
                      d="M0 9h36v4.5H0zm0 9h36v4.5H0zm0 9h36v4.5H0z"
                    />
                    <path fill="#0A3161" d="M0 0h18v18H0z" />
                    <path
                      fill="#fff"
                      d="M3 3h2v2H3zm4 0h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2zM3 7h2v2H3zm4 0h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2zM3 11h2v2H3zm4 0h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"
                    />
                  </svg>
                  <span className="font-semibold text-[14px] text-black dark:text-[#E4E6EB]">
                    English
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* MENU ICON - NO CIRCLE */}
          <div className="relative group flex items-center justify-center mr-2 ml-1">
            <button className="flex items-center justify-center transition-transform hover:scale-105 active:scale-95">
              <img
                src="/menu.svg"
                alt="Menu"
                className="w-[34px] h-[34px] object-contain"
              />
            </button>
            <div className="absolute top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/80 text-white text-[13px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap z-[60]">
              {t("nav.menu")}
            </div>
          </div>

          <div className="relative ml-1" ref={dropdownRef}>
            <div
              className="relative cursor-pointer group"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <button className="w-10 h-10 rounded-full hover:brightness-95 transition-all flex items-center justify-center overflow-hidden border border-emerald-600 dark:border-emerald-400 shrink-0">
                <img
                  src="/default-avatar.svg"
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </button>
              {/* Arrow Down Badge */}
              <div className="absolute -bottom-0.5 -right-0.5 w-[16px] h-[16px] bg-[#E4E6EB] dark:bg-[#3A3B3C] rounded-full flex items-center justify-center border-2 border-white dark:border-[#242526]">
                <svg
                  className="w-3 h-3 text-black dark:text-[#E4E6EB]"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="absolute top-12 right-0 px-3 py-1.5 bg-black/80 text-white text-[13px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap z-[60]">
                Informasi
              </div>
            </div>

            {/* Dropdown Profile Panel */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-3 w-[340px] bg-white dark:bg-[#242526] rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.15)] border border-gray-200 dark:border-[#3E4042] p-4 z-[100]">
                <div className="bg-[#F2F2F2] dark:bg-[#3A3B3C] rounded-xl p-3 flex items-center gap-3 mb-2 hover:bg-[#E4E6EB] dark:hover:bg-[#4E4F50] cursor-pointer transition-colors shadow-sm border border-gray-100 dark:border-[#3E4042]">
                  <div className="w-[40px] h-[40px] rounded-full flex items-center justify-center overflow-hidden shrink-0 border border-emerald-600 dark:border-emerald-400">
                    <img
                      src="/default-avatar.svg"
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-[16px] text-black dark:text-[#E4E6EB] leading-tight">
                      {currentUser.username}
                    </h3>
                    <p className="text-[14px] text-gray-500 dark:text-[#B0B3B8]">
                      {t("dropdown.viewAllProfiles")}
                    </p>
                  </div>
                </div>

                <div className="w-full h-[1px] bg-gray-200 dark:bg-[#3A3B3C] my-3"></div>

                <div className="space-y-2">
                  <button className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-[#3A3B3C] transition-colors group/item">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#E4E6EB] dark:bg-[#3A3B3C] flex items-center justify-center shrink-0 overflow-hidden">
                        <svg
                          className="w-[20px] h-[20px] text-black dark:text-[#E4E6EB]"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <span className="font-semibold text-[15px] text-black dark:text-[#E4E6EB]">
                        {t("dropdown.settings")}
                      </span>
                    </div>
                    <svg
                      className="w-6 h-6 text-gray-500 dark:text-[#B0B3B8] group-hover/item:text-black dark:text-[#E4E6EB] transition-colors"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  <button className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-[#3A3B3C] transition-colors group/item">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#E4E6EB] dark:bg-[#3A3B3C] flex items-center justify-center shrink-0 overflow-hidden">
                        <svg
                          className="w-[20px] h-[20px] text-black dark:text-[#E4E6EB]"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <span className="font-semibold text-[15px] text-black dark:text-[#E4E6EB]">
                        {t("dropdown.help")}
                      </span>
                    </div>
                    <svg
                      className="w-6 h-6 text-gray-500 dark:text-[#B0B3B8] group-hover/item:text-black dark:text-[#E4E6EB] transition-colors"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-[#3A3B3C] transition-colors">
                    <div className="w-9 h-9 rounded-full bg-[#E4E6EB] dark:bg-[#3A3B3C] flex items-center justify-center shrink-0 overflow-hidden">
                      <svg
                        className="w-[20px] h-[20px] text-black dark:text-[#E4E6EB]"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="font-semibold text-[15px] text-black dark:text-[#E4E6EB]">
                      {t("dropdown.report")}
                    </span>
                  </button>

                  <button
                    onClick={() => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      localStorage.setItem("theme", "dark");
      document.documentElement.classList.add("dark");
    } else {
      localStorage.setItem("theme", "light");
      document.documentElement.classList.remove("dark");
    }
  }}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-[#3A3B3C] transition-colors"
                  >
                    <div className="w-9 h-9 rounded-full bg-[#E4E6EB] dark:bg-[#3A3B3C] flex items-center justify-center shrink-0 overflow-hidden">
                      {isDarkMode ? (
                        <svg
                          className="w-[20px] h-[20px] text-black dark:text-[#E4E6EB]"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.5-1.591a.75.75 0 10-1.061 1.06l1.5-1.591zM12 18.75a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25a.75.75 0 01.75-.75zM6.166 18.894a.75.75 0 001.06 1.06l1.5-1.591a.75.75 0 10-1.06-1.061l-1.591 1.59zM4.5 12a.75.75 0 01-.75.75H1.5a.75.75 0 010-1.5h2.25a.75.75 0 01.75.75zM6.166 5.106a.75.75 0 00-1.06 1.06l1.591 1.59a.75.75 0 101.06-1.061l-1.5-1.59z" />
                        </svg>
                      ) : (
                        <svg
                          className="w-[20px] h-[20px] text-black dark:text-[#E4E6EB]"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <span className="font-semibold text-[15px] text-black dark:text-[#E4E6EB]">
                      {isDarkMode
                        ? t("dropdown.lightMode")
                        : t("dropdown.darkMode")}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      localStorage.removeItem("token");
                      document.cookie =
                        "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                      window.location.href = `/login`;
                    }}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-[#3A3B3C] transition-colors"
                  >
                    <div className="w-9 h-9 rounded-full bg-[#E4E6EB] dark:bg-[#3A3B3C] flex items-center justify-center shrink-0 overflow-hidden">
                      <svg
                        className="w-5 h-5 text-black dark:text-[#E4E6EB] ml-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
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
      </nav>

      <main className="min-h-screen bg-[#F0F2F5] dark:bg-[#18191A] flex justify-center py-10 px-4">
        <div className="w-full max-w-2xl">
          

          <div className="bg-white dark:bg-[#242526] rounded-xl shadow-sm border border-gray-100 dark:border-[#3E4042] overflow-hidden">
            <div className="bg-emerald-500 p-6 sm:p-8 text-white">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">{t("register.title")}</h1>
              <p className="text-emerald-50 text-[15px] opacity-90">
                {t("register.subtitle")}
              </p>
            </div>

            <div className="p-6 sm:p-8">
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 dark:text-[#E4E6EB] mb-3">
                  {t("register.type_label")}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div 
                    onClick={() => setType("website")}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${type === "website" ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20" : "border-gray-200 dark:border-[#3E4042] hover:border-emerald-300"}`}
                  >
                    <div className="flex items-center gap-3 mb-1">
                      <span className={`font-bold ${type === "website" ? "text-emerald-700 dark:text-emerald-400" : "text-gray-700 dark:text-[#E4E6EB]"}`}>{t("register.type_website")}</span>
                    </div>
                    <p className="text-[13px] text-gray-500 dark:text-[#B0B3B8] ml-2">{t("register.type_website_desc")}</p>
                  </div>
                  
                  <div 
                    onClick={() => setType("profile")}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${type === "profile" ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20" : "border-gray-200 dark:border-[#3E4042] hover:border-emerald-300"}`}
                  >
                    <div className="flex items-center gap-3 mb-1">
                      <span className={`font-bold ${type === "profile" ? "text-emerald-700 dark:text-emerald-400" : "text-gray-700 dark:text-[#E4E6EB]"}`}>{t("register.type_profile")}</span>
                    </div>
                    <p className="text-[13px] text-gray-500 dark:text-[#B0B3B8] ml-2">{t("register.type_profile_desc")}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
              {type === "website" && (
                <div>
                  <label className="block text-[14px] font-bold text-gray-700 dark:text-[#E4E6EB] mb-1.5">
                    {t("register.url_label")} <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="url" 
                    placeholder="https://toko-anda.com" 
                    className="w-full bg-gray-50 dark:bg-[#3A3B3C] border border-gray-200 dark:border-[#4E4F50] rounded-lg px-4 py-2.5 text-[15px] text-black dark:text-[#E4E6EB] focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
              )}

              <div>
                <label className="flex items-center gap-1.5 text-[14px] font-bold text-gray-700 dark:text-[#E4E6EB] mb-1.5">
                  {t("register.name_label")} <span className="text-red-500">*</span>
                  <div className="relative group/info flex items-center">
                    <svg className="w-4 h-4 text-gray-400 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-[220px] bg-black/80 text-white text-[12px] p-2 rounded-lg opacity-0 group-hover/info:opacity-100 transition-opacity pointer-events-none z-10 text-center font-normal leading-relaxed">
                      {t("register.name_tooltip")}
                    </div>
                  </div>
                </label>
                <input 
                  type="text" 
                  placeholder={t("register.name_placeholder")} 
                  className="w-full bg-gray-50 dark:bg-[#3A3B3C] border border-gray-200 dark:border-[#4E4F50] rounded-lg px-4 py-2.5 text-[15px] text-black dark:text-[#E4E6EB] focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              {type === "profile" && (
                <div>
                  <label className="block text-[14px] font-bold text-gray-700 dark:text-[#E4E6EB] mb-1.5">
                    {t("register.slug_label")} <span className="text-red-500">*</span>
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-gray-200 dark:border-[#4E4F50] bg-gray-100 dark:bg-[#242526] text-gray-500 dark:text-[#B0B3B8] text-[15px] font-medium">
                      nethubz.com/
                    </span>
                    <input 
                      type="text" 
                      value={slug}
                      onChange={handleSlugChange}
                      placeholder="tokobudi" 
                      className="flex-1 min-w-0 bg-gray-50 dark:bg-[#3A3B3C] border border-gray-200 dark:border-[#4E4F50] rounded-r-lg px-4 py-2.5 text-[15px] text-black dark:text-[#E4E6EB] focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>
                  <p className="mt-1.5 text-[12px] text-gray-500 dark:text-[#B0B3B8]">
                    {t("register.slug_desc")}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-[14px] font-bold text-gray-700 dark:text-[#E4E6EB] mb-1.5">
                  {t("register.desc_label")}
                </label>
                <textarea 
                  rows={3}
                  placeholder={t("register.desc_placeholder")} 
                  className="w-full bg-gray-50 dark:bg-[#3A3B3C] border border-gray-200 dark:border-[#4E4F50] rounded-lg px-4 py-2.5 text-[15px] text-black dark:text-[#E4E6EB] focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-6">
                <div className="shrink-0">
                  <label className="block text-[14px] font-bold text-gray-700 dark:text-[#E4E6EB] mb-1.5">
                    {t("register.logo_label")}
                  </label>
                  <div className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 dark:border-[#4E4F50] flex flex-col items-center justify-center text-gray-500 dark:text-[#B0B3B8] hover:bg-gray-50 dark:hover:bg-[#3A3B3C] hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors cursor-pointer relative overflow-hidden group">
                     <svg className="w-7 h-7 mb-1 text-gray-400 dark:text-gray-500 group-hover:text-emerald-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>
                     <span className="text-[11px] font-semibold group-hover:text-emerald-600 dark:group-hover:text-emerald-400">Upload</span>
                     <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                  </div>
                </div>

                <div className="flex-1 sm:max-w-[300px]">
                  <label className="block text-[14px] font-bold text-gray-700 dark:text-[#E4E6EB] mb-1.5">
                    {t("register.media_url_label")}
                  </label>
                  <input 
                    type="url" 
                    placeholder="https://..." 
                    className="w-full bg-gray-50 dark:bg-[#3A3B3C] border border-gray-200 dark:border-[#4E4F50] rounded-lg px-4 py-2.5 text-[15px] text-black dark:text-[#E4E6EB] focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
              </div>

              <div className="pt-2">
                  <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[16px] py-3 px-6 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2">
                    <span>{t("register.submit")}</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
{isMounted && createPortal(
    <>
      {/* Click-outside invisible backdrop (no dark overlay) */}
      {isNotifPanelOpen && (
        <div
          onClick={() => setIsNotifPanelOpen(false)}
          className="fixed inset-0 z-[290]"
        />
      )}
      {/* Popup Panel */}
      <div
        ref={notifPanelRef}
        className={`fixed top-[56px] right-4 w-[380px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-72px)] bg-white dark:bg-[#242526] rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.25)] z-[300] flex flex-col overflow-hidden transition-all duration-200 origin-top-right ${isNotifPanelOpen ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 shrink-0">
          <h2 className="text-[20px] font-bold text-black dark:text-[#E4E6EB]">{t("notif.title")}</h2>
          {/* 3-dot menu */}
          <div className="relative" ref={notifMenuRef}>
            <button
              onClick={(e) => { e.stopPropagation(); setIsNotifMenuOpen(!isNotifMenuOpen); }}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors text-gray-500 dark:text-[#B0B3B8] ${isNotifMenuOpen ? "bg-gray-200 dark:bg-[#3A3B3C]" : "hover:bg-gray-200 dark:hover:bg-[#3A3B3C]"}`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
            {/* Dropdown */}
            {isNotifMenuOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-11 w-[240px] bg-white dark:bg-[#3A3B3C] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.2)] border border-gray-100 dark:border-[#4E4F50] overflow-hidden z-10"
              >
                <button
                  onClick={() => setIsNotifMenuOpen(false)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-200 dark:hover:bg-[#4E4F50] transition-colors text-left text-[14px] text-black dark:text-[#E4E6EB]"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[#4E4F50] flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-black dark:text-[#E4E6EB]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="font-medium">{t("notif.markAllRead")}</span>
                </button>
                <button
                  onClick={() => setIsNotifMenuOpen(false)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-200 dark:hover:bg-[#4E4F50] transition-colors text-left text-[14px] text-black dark:text-[#E4E6EB]"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[#4E4F50] flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-black dark:text-[#E4E6EB]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="font-medium">{t("notif.settings")}</span>
                </button>
              </div>
            )}
          </div>
        </div>
        {/* Filter Tabs */}
        <div className="flex items-center justify-between px-4 pb-2 shrink-0">
          <div className="flex gap-1">
            {[t("notif.all"), t("notif.unread")].map((tab, idx) => (
              <button key={tab} className={`px-3 py-1.5 rounded-full text-[13px] font-semibold transition-colors ${idx === 0 ? "bg-[#E7F3FF] dark:bg-[#263951] text-[#2D88FF]" : "bg-gray-100 dark:bg-[#3A3B3C] text-black dark:text-[#E4E6EB] hover:bg-gray-200 dark:hover:bg-[#4E4F50]"}`}>{tab}</button>
            ))}
          </div>
          <div className="relative" ref={notifFilterRef}>
            <button
              onClick={(e) => { e.stopPropagation(); setIsNotifFilterOpen(!isNotifFilterOpen); }}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors text-black dark:text-[#E4E6EB] ${isNotifFilterOpen ? "bg-[#E7F3FF] dark:bg-[#263951] text-[#2D88FF]" : "hover:bg-gray-200 dark:hover:bg-[#3A3B3C]"}`}
            >
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </button>
            {isNotifFilterOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-10 w-[240px] bg-white dark:bg-[#3A3B3C] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.2)] border border-gray-100 dark:border-[#4E4F50] overflow-hidden z-10"
              >
                <button
                  onClick={() => setIsNotifFilterOpen(false)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-200 dark:hover:bg-[#4E4F50] transition-colors text-left text-[14px] text-black dark:text-[#E4E6EB]"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[#4E4F50] flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-black dark:text-[#E4E6EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <span className="font-medium">{t("notif.filterMessage")}</span>
                </button>
                <button
                  onClick={() => setIsNotifFilterOpen(false)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-200 dark:hover:bg-[#4E4F50] transition-colors text-left text-[14px] text-black dark:text-[#E4E6EB]"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[#4E4F50] flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-black dark:text-[#E4E6EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </div>
                  <span className="font-medium">{t("notif.filterFriend")}</span>
                </button>
                <button
                  onClick={() => setIsNotifFilterOpen(false)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-200 dark:hover:bg-[#4E4F50] transition-colors text-left text-[14px] text-black dark:text-[#E4E6EB]"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[#4E4F50] flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-black dark:text-[#E4E6EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <span className="font-medium">{t("notif.filterGroup")}</span>
                </button>
              </div>
            )}
          </div>
        </div>
        {/* Notification List */}
        <div className="flex-1 overflow-y-auto sidebar-scrollbar overscroll-none py-1">
          {/* Friend Request */}
          <div className="flex items-start gap-3 px-3 py-2.5 hover:bg-gray-200 dark:hover:bg-[#3A3B3C] cursor-pointer transition-colors rounded-xl mx-1">
            <div className="relative shrink-0">
              <img src="/default-avatar.svg" className="w-14 h-14 rounded-full border border-gray-200 dark:border-[#3E4042] object-cover" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white dark:border-[#242526]">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" /></svg>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] text-black dark:text-[#E4E6EB] leading-snug">{t("notif.friendRequest", { name: "Budi Santoso" })}</p>
              <p className="text-[12px] text-[#00B47A] font-semibold mt-1">{t("notif.minutesAgo", { n: 5 })}</p>
              <div className="flex gap-2 mt-2">
                <button className="px-4 py-1.5 bg-[#00B47A] hover:bg-[#009E6B] text-white text-[13px] font-semibold rounded-lg transition-colors">{t("notif.confirm")}</button>
                <button className="px-4 py-1.5 bg-gray-100 dark:bg-[#3A3B3C] hover:bg-gray-200 dark:hover:bg-[#4E4F50] text-black dark:text-[#E4E6EB] text-[13px] font-semibold rounded-lg transition-colors">{t("notif.delete")}</button>
              </div>
            </div>
            <div className="w-3 h-3 rounded-full bg-[#00B47A] shrink-0 mt-1"></div>
          </div>
          {/* Like */}
          <div className="flex items-start gap-3 px-3 py-2.5 hover:bg-gray-200 dark:hover:bg-[#3A3B3C] cursor-pointer transition-colors rounded-xl mx-1">
            <div className="relative shrink-0">
              <img src="/default-avatar.svg" className="w-14 h-14 rounded-full border border-gray-200 dark:border-[#3E4042] object-cover" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center border-2 border-white dark:border-[#242526]">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] text-black dark:text-[#E4E6EB] leading-snug">{t("notif.likedPost", { name: "Siti Aminah" })}</p>
              <p className="text-[12px] text-[#00B47A] font-semibold mt-1">{t("notif.minutesAgo", { n: 23 })}</p>
            </div>
            <div className="w-3 h-3 rounded-full bg-[#00B47A] shrink-0 mt-1"></div>
          </div>
          {/* Comment */}
          <div className="flex items-start gap-3 px-3 py-2.5 hover:bg-gray-200 dark:hover:bg-[#3A3B3C] cursor-pointer transition-colors rounded-xl mx-1 opacity-60">
            <div className="relative shrink-0">
              <img src="/default-avatar.svg" className="w-14 h-14 rounded-full border border-gray-200 dark:border-[#3E4042] object-cover" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#2D88FF] rounded-full flex items-center justify-center border-2 border-white dark:border-[#242526]">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" /></svg>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] text-black dark:text-[#E4E6EB] leading-snug">{t("notif.commented", { name: "Agus Pratama", text: "Keren banget bro!" })}</p>
              <p className="text-[12px] text-gray-500 dark:text-[#B0B3B8] font-semibold mt-1">{t("notif.hoursAgo", { n: 2 })}</p>
            </div>
          </div>
          {/* Group Invite */}
          <div className="flex items-start gap-3 px-3 py-2.5 hover:bg-gray-200 dark:hover:bg-[#3A3B3C] cursor-pointer transition-colors rounded-xl mx-1 opacity-60">
            <div className="relative shrink-0">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                <svg className="w-7 h-7 text-emerald-600 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" /></svg>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] text-black dark:text-[#E4E6EB] leading-snug">{t("notif.groupInvite", { name: "Dewi Lestari", group: "Programmer Jakarta" })}</p>
              <p className="text-[12px] text-gray-500 dark:text-[#B0B3B8] font-semibold mt-1">{`${t("notif.yesterday")} 14:30`}</p>
            </div>
          </div>
          {/* Mention */}
          <div className="flex items-start gap-3 px-3 py-2.5 hover:bg-gray-200 dark:hover:bg-[#3A3B3C] cursor-pointer transition-colors rounded-xl mx-1 opacity-60">
            <div className="relative shrink-0">
              <img src="/default-avatar.svg" className="w-14 h-14 rounded-full border border-gray-200 dark:border-[#3E4042] object-cover" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center border-2 border-white dark:border-[#242526]">
                <span className="text-white text-[11px] font-bold">@</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] text-black dark:text-[#E4E6EB] leading-snug">{t("notif.mentioned", { name: "Andi Wijaya" })}</p>
              <p className="text-[12px] text-gray-500 dark:text-[#B0B3B8] font-semibold mt-1">{t("notif.daysAgo", { n: 3 })}</p>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  )}
  
    </>
  );
}
