
"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { Lottie } from "lottie-react";
// @ts-ignore
import animationDataLight from "../../../../public/search-bar.json";
// @ts-ignore
import animationDataDark from "../../../../public/search-bar-putih.json";
import { getNotifications, markAsRead, deleteNotification } from "@/app/actions/notifications";
import { handlePrimaryConnectionAction } from "@/app/actions/connections";
import { notifyConnectionChanged } from "@/utils/cache";
import { getProfile } from "@/app/actions/profile";
import { getOptimizedUrl } from "@/utils/cloudinary";

const navProfileCache = new Map<string, { avatarUrl: string | null, displayName: string | null }>();
let globalNotifsCache: { list: any[], unread: number, userId: string } | null = null;

export default function Navbar({
  activeTab = "home",
  setActiveTab = () => {},
  isDarkMode,
  setIsDarkMode,
  themeLoaded,
  currentUser
}: any) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleTabNavigation = (tabName: string, routeName: string) => {
    if (pathname.includes("/p/") || pathname.includes("/project")) {
      router.push(`/${locale}/${routeName}`);
    } else {
      setActiveTab(tabName);
      window.history.pushState(null, "", `/${locale}/${routeName}`);
    }
  };

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearchNavOpen, setIsSearchNavOpen] = useState(false);
  const [isNotifPanelOpen, setIsNotifPanelOpen] = useState(false);
  const [isNotifMenuOpen, setIsNotifMenuOpen] = useState(false);
  const [isNotifFilterOpen, setIsNotifFilterOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isShowingAllNotifs, setIsShowingAllNotifs] = useState(false);
  const [isLoadingMoreNotifs, setIsLoadingMoreNotifs] = useState(false);
  const [openNotifMenuId, setOpenNotifMenuId] = useState<string | null>(null);
  const [processingNotifId, setProcessingNotifId] = useState<string | null>(null);
  const [navAvatar, setNavAvatar] = useState<string | null>(navProfileCache.get(currentUser?.id)?.avatarUrl || null);
  const [navDisplayName, setNavDisplayName] = useState<string | null>(navProfileCache.get(currentUser?.id)?.displayName || null);
  const [isLoadingNotifs, setIsLoadingNotifs] = useState(!globalNotifsCache || globalNotifsCache.userId !== currentUser?.id);

  useEffect(() => { setIsMounted(true); }, []);

  // Fetch avatar + displayName from DB when currentUser is ready
  useEffect(() => {
    if (!currentUser?.id) return;
    
    if (navProfileCache.has(currentUser.id)) {
      const cached = navProfileCache.get(currentUser.id)!;
      setNavAvatar(cached.avatarUrl);
      setNavDisplayName(cached.displayName);
      return; // Skip fetching if already in cache
    }

    getProfile(currentUser.id).then((res) => {
      if (res.success && res.profile) {
        const avatarUrl = res.profile.avatarUrl || null;
        const displayName = res.profile.displayName || null;
        setNavAvatar(avatarUrl);
        setNavDisplayName(displayName);
        navProfileCache.set(currentUser.id, { avatarUrl, displayName });
      }
    });
  }, [currentUser?.id]);

  // Listen for avatar-updated event dispatched from profile page after crop/upload
  useEffect(() => {
    const handleAvatarUpdated = (e: Event) => {
      const event = e as CustomEvent<{ url: string; type: string }>;
      if (event.detail.type === "avatar") {
        setNavAvatar(event.detail.url);
        if (currentUser?.id) {
          navProfileCache.set(currentUser.id, { 
            avatarUrl: event.detail.url, 
            displayName: navDisplayName || navProfileCache.get(currentUser.id)?.displayName || null 
          });
        }
      }
    };
    window.addEventListener("avatar-updated", handleAvatarUpdated);
    return () => window.removeEventListener("avatar-updated", handleAvatarUpdated);
  }, [currentUser?.id, navDisplayName]);

  const fetchNotifs = async (isBackground = false) => {
    const token = localStorage.getItem("token") || "";
    if (!token || !currentUser?.id) return;
    
    if (!isBackground) setIsLoadingNotifs(true);
    
    try {
      const res = await getNotifications(token, currentUser.id);
      if (res.success) {
        setNotifications(res.notifications || []);
        setUnreadCount(res.unreadCount || 0);
        globalNotifsCache = { list: res.notifications || [], unread: res.unreadCount || 0, userId: currentUser.id };
      } else {
        console.error("fetchNotifs returned false success:", res.error);
        if (res.error === "Unauthorized") {
          console.warn("Token is invalid! You might need to login again.");
        }
      }
    } catch (e) {
      console.error("Failed to fetch notifications:", e);
    } finally {
      setIsLoadingNotifs(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (currentUser?.id && globalNotifsCache !== null && globalNotifsCache?.userId === currentUser.id) {
      setNotifications(globalNotifsCache!.list);
      setUnreadCount(globalNotifsCache!.unread);
      // Fetch in background to check for delta
      fetchNotifs(true);
    } else {
      fetchNotifs(false);
    }
  }, [currentUser?.id]);

  // Poll every 60s
  useEffect(() => {
    const token = localStorage.getItem("token") || "";
    if (!token || !currentUser?.id) return;
    const interval = setInterval(() => fetchNotifs(true), 60000);
    return () => clearInterval(interval);
  }, [currentUser?.id]);

  // When panel opens, always re-fetch + show skeleton
  useEffect(() => {
    if (isNotifPanelOpen) {
      setIsLoadingNotifs(true);
      fetchNotifs();
    }
  }, [isNotifPanelOpen]);

  const handleMarkAsRead = async () => {
    if (!currentUser) return;
    const token = localStorage.getItem("token") || "";
    // Only mark the IDs that are currently visible/loaded — not future ones
    const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
    if (unreadIds.length === 0) return;
    // Mark each one individually so new DB notifications aren't affected
    await Promise.all(unreadIds.map(id => markAsRead(token, currentUser.id, id)));
    setUnreadCount(0);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleShowAllNotifs = () => {
    setIsLoadingMoreNotifs(true);
    setTimeout(() => {
      setIsLoadingMoreNotifs(false);
      setIsShowingAllNotifs(true);
    }, 800); // 800ms skeleton effect
  };

  const handleAcceptFriend = async (e: React.MouseEvent, senderId: string, notifId: string) => {
    e.stopPropagation();
    if (!currentUser || processingNotifId === notifId) return;
    setProcessingNotifId(notifId);
    const token = localStorage.getItem("token") || "";
    const res = await handlePrimaryConnectionAction(token, currentUser.id, senderId);
    if (res.success) {
      notifyConnectionChanged(currentUser.id, senderId);
      // Delete the FRIEND_REQUEST notification from DB so it doesn't reappear on refresh
      await deleteNotification(token, currentUser.id, notifId);
      // Remove it from local state
      setNotifications(prev => prev.filter(n => n.id !== notifId));
      setUnreadCount(prev => Math.max(0, prev - 1));
      // Dispatch custom event so profile page can update counts without reload
      window.dispatchEvent(new CustomEvent("friend-accepted", { detail: { senderId, currentUserId: currentUser.id } }));
    }
    setProcessingNotifId(null);
  };

  const handleMarkOneRead = async (notifId: string) => {
    if (!currentUser) return;
    const token = localStorage.getItem("token") || "";
    setNotifications(prev => prev.map(n =>
      n.id === notifId ? { ...n, isRead: true } : n
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
    // Pass the specific ID — only THIS notification gets marked in DB
    await markAsRead(token, currentUser.id, notifId);
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    const diffMinutes = Math.floor(diff / 60);
    const diffHours = Math.floor(diff / 3600);

    if (diffHours < 1) {
      if (diffMinutes === 0) return t("notif.timeMinutes", { min: 1 });
      return t("notif.timeMinutes", { min: diffMinutes });
    }
    
    if (diffHours < 3) {
      return t("notif.timeHours", { hour: diffHours });
    }

    // Is it today?
    const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }).replace('.', ':');
    }

    // Is it yesterday?
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth() && date.getFullYear() === yesterday.getFullYear();
    if (isYesterday) {
      return `${t("notif.timeYesterday")} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }).replace('.', ':')}`;
    }

    // Older than yesterday
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchNavRef = useRef<HTMLDivElement>(null);
  const notifPanelRef = useRef<HTMLDivElement>(null);
  const notifBtnRef = useRef<HTMLButtonElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);
  const notifFilterRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchNavRef.current && !searchNavRef.current.contains(event.target as Node)) {
        setIsSearchNavOpen(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (
        notifPanelRef.current &&
        !notifPanelRef.current.contains(event.target as Node) &&
        notifBtnRef.current &&
        !notifBtnRef.current.contains(event.target as Node)
      ) {
        setIsNotifPanelOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target as Node)) {
        setIsNotifMenuOpen(false);
      }
      if (notifFilterRef.current && !notifFilterRef.current.contains(event.target as Node)) {
        setIsNotifFilterOpen(false);
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

  return (
    <>
    <nav className="bg-white dark:bg-[#242526] shadow-sm fixed top-0 w-full z-[10100] h-[56px] px-4 flex items-center justify-between border-b border-gray-200 dark:border-[#3E4042]">
        {/* Left: Logo & Search */}
        <div className="flex items-center gap-2">
          {/* Logo - dark text for light mode, white text for dark mode */}
          <img
            src="/logo-horizontal.png"
            alt="NetHubz"
            className="h-[50px] w-auto object-contain dark:hidden"
          />
          <img
            src="/logo-horizontal2.png"
            alt="NetHubz"
            className="h-[50px] w-auto object-contain hidden dark:block"
          />
        </div>

        {/* Center: Tabs */}
        <div className="hidden md:flex items-center justify-center gap-2 absolute left-1/2 -translate-x-1/2 h-full">
          <div
            onClick={() => handleTabNavigation("home", "home")}
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
            onClick={() => handleTabNavigation("product", "product")}
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
            onClick={() => handleTabNavigation("chat", "obrolan")}
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
            onClick={() => handleTabNavigation("friend", "friend")}
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
            onClick={() => handleTabNavigation("community", "community")}
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
                className="absolute top-[52px] right-0 w-[300px] sm:w-[360px] bg-white dark:bg-[#242526] rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.2)] border border-gray-100 dark:border-[#3E4042] z-[10200]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="relative group/visit">
                      <button
                        onClick={() => { setIsSearchNavOpen(false); handleTabNavigation("search", "search"); }}
                        className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 dark:bg-[#3A3B3C] hover:bg-emerald-50 dark:hover:bg-[#203D2E] transition-colors shrink-0 border border-gray-200 dark:border-[#4E4F50]"
                      >
                        <img
                          src="/navigasi/mencari-online.png"
                          alt="Mencari Online"
                          className="w-8 h-8 object-contain group-hover/visit:scale-110 transition-transform"
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
                          if (e.key === 'Enter') {
                            setActiveTab("search");
                            setIsSearchNavOpen(false);
                            window.history.pushState(null, "", `/${locale}/search`);
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
            
            {/* Notification Badge */}
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white dark:border-[#242526]">
                {unreadCount > 99 ? "99+" : unreadCount}
              </div>
            )}
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
              <div className="absolute top-12 right-0 w-[140px] bg-white dark:bg-[#242526] rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.15)] border border-gray-200 dark:border-[#3E4042] p-2 z-[10200]">
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
                  className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors mt-1 ${locale === "en" ? "bg-[#E4E6EB] dark:bg-[#3A3B3C]" : "hover:bg-gray-200 dark:hover:bg-[#3A3B3C]"}`}
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
                  src={navAvatar ? getOptimizedUrl(navAvatar, "avatar") : "/default-avatar.svg"}
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
              <div className="absolute right-0 mt-3 w-[340px] bg-white dark:bg-[#242526] rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.15)] border border-gray-200 dark:border-[#3E4042] p-4 z-[10200]">
                <div className="bg-[#F2F2F2] dark:bg-[#3A3B3C] rounded-xl p-3 flex items-center gap-3 mb-2 hover:bg-[#E4E6EB] dark:hover:bg-[#4E4F50] cursor-pointer transition-colors shadow-sm border border-gray-100 dark:border-[#3E4042]"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    router.push(`/${locale}/p/${currentUser.username}/${currentUser.id}`);
                  }}
                >
                  <div className="w-[40px] h-[40px] rounded-full flex items-center justify-center overflow-hidden shrink-0 border border-emerald-600 dark:border-emerald-400">
                    <img
                      src={navAvatar ? getOptimizedUrl(navAvatar, "avatar") : "/default-avatar.svg"}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-[16px] text-black dark:text-[#E4E6EB] leading-tight">
                      {navDisplayName || currentUser.displayName || currentUser.username}
                    </h3>
                    <p className="text-[13px] text-gray-500 dark:text-[#B0B3B8]">
                      @{currentUser.username}
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
                    onClick={() => setIsDarkMode(!isDarkMode)}
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
  {isMounted && createPortal(
    <>
      {/* Click-outside invisible backdrop (no dark overlay) */}
      {isNotifPanelOpen && (
        <div
          onClick={() => setIsNotifPanelOpen(false)}
          className="fixed inset-0 z-[10200]"
        />
      )}
      {/* Popup Panel */}
      <div
        ref={notifPanelRef}
        className={`fixed top-[56px] right-4 w-[380px] max-w-[calc(100vw-2rem)] min-h-[560px] max-h-[calc(100vh-72px)] bg-white dark:bg-[#242526] rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.25)] z-[10201] flex flex-col overflow-hidden transition-all duration-200 origin-top-right ${isNotifPanelOpen ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"}`}
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
                  onClick={(e) => { e.stopPropagation(); handleMarkAsRead(); setIsNotifMenuOpen(false); }}
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
          {isLoadingNotifs ? (
            // Skeleton loading - matches real notif layout
            <div className="px-1 space-y-1 py-1">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col gap-2 px-3 py-3 rounded-xl mx-1">
                  {/* Top row: avatar + text + dot */}
                  <div className="flex items-start gap-3">
                    {/* Avatar circle with badge */}
                    <div className="relative shrink-0">
                      <div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-[#3A3B3C] animate-pulse" />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gray-300 dark:bg-[#4E4F50] border-2 border-white dark:border-[#242526] animate-pulse" />
                    </div>
                    {/* Text lines */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center gap-2 pt-1">
                      <div className="h-3.5 bg-gray-200 dark:bg-[#3A3B3C] rounded-full animate-pulse w-4/5" />
                      <div className="h-3 bg-gray-200 dark:bg-[#3A3B3C] rounded-full animate-pulse w-3/5" />
                      <div className="h-2.5 bg-gray-200 dark:bg-[#3A3B3C] rounded-full animate-pulse w-1/4" />
                    </div>
                    {/* Unread dot placeholder */}
                    <div className="w-3 h-3 rounded-full bg-gray-200 dark:bg-[#3A3B3C] animate-pulse shrink-0 mt-2" />
                  </div>
                  {/* Action buttons skeleton (show on first 2 items) */}
                  {i <= 2 && (
                    <div className="flex gap-2 pl-[68px] pr-2 pt-1">
                      <div className="flex-1 h-8 bg-gray-200 dark:bg-[#3A3B3C] rounded-lg animate-pulse" />
                      <div className="flex-1 h-8 bg-gray-200 dark:bg-[#3A3B3C] rounded-lg animate-pulse" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-[#B0B3B8]">
              {t("notif.empty")}
            </div>
          ) : (
            <>
              {notifications.slice(0, isShowingAllNotifs ? notifications.length : 6).map((notif) => (
                <div 
                  key={notif.id}
                  onClick={async () => {
                    if (!notif.isRead) await handleMarkOneRead(notif.id);
                    setIsNotifPanelOpen(false);
                    if (notif.postId) {
                      router.push(`${pathname}?postId=${notif.postId}`);
                    } else if (notif.projectId) {
                      router.push(`/${locale}/project/${notif.sender?.username}/${notif.projectId}`);
                    } else {
                      router.push(`/${locale}/p/${notif.sender?.username}/${notif.senderId}`);
                    }
                  }}
                  className={`relative flex flex-col gap-2 px-3 py-3 hover:bg-gray-200 dark:hover:bg-[#3A3B3C] cursor-pointer transition-colors rounded-xl mx-1 ${!notif.isRead ? '' : 'opacity-70'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative shrink-0">
                      <img src={notif.sender ? (notif.sender.profile?.avatarUrl || "/default-avatar.svg") : "/navigasi/giveaway.svg"} className="w-14 h-14 rounded-full border border-gray-200 dark:border-[#3E4042] object-cover p-2 bg-gray-100 dark:bg-[#3A3B3C]" />
                      <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white dark:border-[#242526] ${
                        notif.type === "FOLLOW" ? "bg-emerald-500" :
                        notif.type === "FRIEND_REQUEST" || notif.type === "FRIEND_ACCEPT" || notif.type === "FRIEND_NOW" ? "bg-blue-500" :
                        notif.type === "POST_LIKE" || notif.type === "PROJECT_LIKE" || notif.type === "COMMENT_LIKE" ? "bg-red-500" :
                        notif.type === "POST_TAG" || notif.type === "COMMENT_MENTION" ? "bg-purple-500" :
                        "bg-[#2D88FF]"
                      }`}>
                        {notif.type === "FOLLOW" && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                        )}
                        {(notif.type === "FRIEND_REQUEST" || notif.type === "FRIEND_ACCEPT" || notif.type === "FRIEND_NOW") && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" /></svg>
                        )}
                        {(notif.type === "POST_LIKE" || notif.type === "PROJECT_LIKE" || notif.type === "COMMENT_LIKE") && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
                        )}
                        {(notif.type === "POST_TAG" || notif.type === "COMMENT_MENTION") && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" /></svg>
                        )}
                        {(notif.type === "GIVEAWAY_JOINED" || notif.type === "GIVEAWAY_WON" || notif.type === "GIVEAWAY_REWARD" || notif.type === "GIVEAWAY_ENDED") && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-1 1h1zm3 0a1 1 0 10-1-1v1h1z" clipRule="evenodd" />
                            <path d="M9 11H3v5a2 2 0 002 2h4v-7zM11 18h4a2 2 0 002-2v-5h-6v7z" />
                          </svg>
                        )}
                        {notif.type === "POST_SHARE" && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" /></svg>
                        )}
                        {(notif.type === "COMMENT_REPLY" || notif.type === "POST_COMMENT" || notif.type === "PROJECT_COMMENT") && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" /></svg>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <p className="text-[14px] text-black dark:text-[#E4E6EB] leading-snug">
                        {notif.sender && <span className="font-semibold">{notif.sender?.profile?.displayName || notif.sender?.username}</span>}
                        {notif.type === "FOLLOW" && ` ${t("notif.typeFollow")}`}
                        {notif.type === "FRIEND_REQUEST" && ` ${t("notif.typeFriendRequest")}`}
                        {notif.type === "FRIEND_ACCEPT" && ` ${t("notif.typeFriendAccept")}`}
                        {notif.type === "FRIEND_NOW" && ` ${t("notif.typeFriendNow")}`}
                        {notif.type === "POST_LIKE" && ` ${t("notif.typePostLike")}`}
                        {notif.type === "POST_COMMENT" && ` ${t("notif.typePostComment")}`}
                        {notif.type === "PROJECT_LIKE" && ` ${t("notif.typeProjectLike")}`}
                        {notif.type === "PROJECT_COMMENT" && ` ${t("notif.typeProjectComment")}`}
                        {notif.type === "COMMENT_LIKE" && ` ${t("notif.typeCommentLike")}`}
                        {notif.type === "POST_TAG" && ` ${t("notif.typePostTag")}`}
                        {notif.type === "COMMENT_MENTION" && ` ${t("notif.typeCommentMention")}`}
                        {notif.type === "COMMENT_REPLY" && ` ${t("notif.typeCommentReply")}`}
                        {notif.type === "POST_SHARE" && ` ${t("notif.typePostShare")}`}
                        {notif.type === "GIVEAWAY_JOINED" && ` ${t("notif.typeGiveawayJoined")}`}
                        {notif.type === "GIVEAWAY_WON" && ` ${t("notif.typeGiveawayWon")}`}
                        {notif.type === "GIVEAWAY_REWARD" && ` ${t("notif.typeGiveawayReward")}`}
                        {notif.type === "GIVEAWAY_ENDED" && t("notif.typeGiveawayEnded")}
                      </p>
                      <p className="text-[12px] text-gray-500 dark:text-[#B0B3B8] font-semibold mt-1">
                        {formatTimeAgo(notif.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 mt-1">
                      {!notif.isRead && (
                        <div className="w-3 h-3 rounded-full bg-[#00B47A] shrink-0"></div>
                      )}
                      {/* 3-dot menu button */}
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenNotifMenuId(openNotifMenuId === notif.id ? null : notif.id);
                          }}
                          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-300 dark:hover:bg-[#4E4F50] text-gray-500 dark:text-gray-400 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </button>
                        {openNotifMenuId === notif.id && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setOpenNotifMenuId(null); }} />
                            <div className="absolute right-0 top-8 w-44 bg-white dark:bg-[#242526] rounded-xl shadow-lg border border-gray-100 dark:border-white/10 z-50 overflow-hidden">
                              {!notif.isRead && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMarkOneRead(notif.id);
                                    setOpenNotifMenuId(null);
                                  }}
                                  className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#3A3B3C] flex items-center gap-2 transition-colors"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                  Tandai dibaca
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setNotifications(prev => prev.filter(n => n.id !== notif.id));
                                  setOpenNotifMenuId(null);
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-[#3A3B3C] flex items-center gap-2 transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                Hapus notifikasi
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Action Buttons - only show for FRIEND_REQUEST (not FRIEND_ACCEPT) */}
                  {notif.type === "FRIEND_REQUEST" && (
                    <div className="flex gap-2 pl-[68px] pr-2 pt-1">
                      <button 
                        onClick={(e) => handleAcceptFriend(e, notif.senderId, notif.id)}
                        disabled={processingNotifId === notif.id}
                        className="flex-1 bg-[#2D88FF] hover:bg-[#1A6ED8] disabled:opacity-70 disabled:cursor-not-allowed text-white text-[14px] font-semibold py-1.5 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        {processingNotifId === notif.id ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          "Terima"
                        )}
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsNotifPanelOpen(false);
                          router.push(`/${locale}/p/${notif.sender?.username}/${notif.senderId}`);
                        }}
                        className="flex-1 bg-gray-200 dark:bg-[#4E4F50] text-black dark:text-white hover:bg-gray-300 dark:hover:bg-[#5E5F60] text-[14px] font-semibold py-1.5 rounded-lg transition-colors"
                      >
                        Lihat
                      </button>
                    </div>
                  )}
                  {notif.type === "FOLLOW" && (
                    <div className="flex gap-2 pl-[68px] pr-2 pt-1">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsNotifPanelOpen(false);
                          router.push(`/${locale}/p/${notif.sender?.username}/${notif.senderId}`);
                        }}
                        className="flex-1 bg-[#2D88FF] hover:bg-[#1A6ED8] text-white text-[14px] font-semibold py-1.5 rounded-lg transition-colors"
                      >
                        Lihat
                      </button>
                    </div>
                  )}
                </div>
              ))}
              
              {isLoadingMoreNotifs && (
                <div className="px-4 py-4 space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse flex items-center gap-3">
                      <div className="w-14 h-14 bg-gray-300 dark:bg-[#3E4042] rounded-full shrink-0"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-gray-300 dark:bg-[#3E4042] rounded w-3/4"></div>
                        <div className="h-3 bg-gray-300 dark:bg-[#3E4042] rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!isShowingAllNotifs && notifications.length > 6 && !isLoadingMoreNotifs && (
                <div className="px-4 py-3">
                  <button 
                    onClick={handleShowAllNotifs}
                    className="w-full py-2 bg-gray-100 hover:bg-gray-200 dark:bg-[#3A3B3C] dark:hover:bg-[#4E4F50] text-black dark:text-white rounded-xl font-semibold text-[14px] transition-colors"
                  >
                    See all
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>,
    document.body
  )}
    </>
  );
}
