"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";

interface FloatingChatWidgetProps {
  currentUser: any;
  dummyChats: any[];
  formatChatDate: (ts: number, locale: string) => string;
  ChatStatusMark: React.FC<{status?: string}>;
  MessageDropdownMenu: React.FC<{isIncoming?: boolean, t: any}>;
  t: any;
  locale: string;
  activeTab?: string;
}

import { useRouter } from "next/navigation";

export default function FloatingChatWidget({
  currentUser,
  dummyChats,
  formatChatDate,
  ChatStatusMark,
  MessageDropdownMenu,
  t,
  locale,
  activeTab
}: FloatingChatWidgetProps) {
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [isChatInfoOpen, setIsChatInfoOpen] = useState(true);
  const [isChatMoreMenuOpen, setIsChatMoreMenuOpen] = useState(false);
  const [isChatSettingsOpen, setIsChatSettingsOpen] = useState(false);
  const [isChatListSettingsOpen, setIsChatListSettingsOpen] = useState(false);
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);
  const [isTempMessageOn, setIsTempMessageOn] = useState(false);
  const [isChatFilterOpen, setIsChatFilterOpen] = useState(false);
  const [chatListFilter, setChatListFilter] = useState<'semua' | 'belum_dibaca' | 'grup'>('semua');
  const [activeChatMenu, setActiveChatMenu] = useState<number | null>(null);
  const [activeFloatingChatIdx, setActiveFloatingChatIdx] = useState<number | null>(null);
  const floatingChatFilterRef = useRef<HTMLDivElement>(null);
  const [isFloatingChatFilterOpen, setIsFloatingChatFilterOpen] = useState(false);
  const [isFloatingChatInfoOpen, setIsFloatingChatInfoOpen] = useState(false);
  const [floatingChatMessage, setFloatingChatMessage] = useState("");
    const chatSettingsRef = useRef<HTMLDivElement>(null);
  const chatListSettingsRef = useRef<HTMLDivElement>(null);
  const chatFilterRef = useRef<HTMLDivElement>(null);
  const floatingAttachmentMenuRef = useRef<HTMLDivElement>(null);
  const chatMenuRef = useRef<HTMLDivElement>(null);
  const chatMoreMenuRef = useRef<HTMLDivElement>(null);
  const [isFloatingAttachmentMenuOpen, setIsFloatingAttachmentMenuOpen] = useState(false);
  const router = useRouter();
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chatSettingsRef.current && !chatSettingsRef.current.contains(event.target as Node)) {
        setIsChatSettingsOpen(false);
      }
      if (chatListSettingsRef.current && !chatListSettingsRef.current.contains(event.target as Node)) {
        setIsChatListSettingsOpen(false);
      }
      if (chatFilterRef.current && !chatFilterRef.current.contains(event.target as Node)) {
        setIsChatFilterOpen(false);
      }
      if (floatingChatFilterRef.current && !floatingChatFilterRef.current.contains(event.target as Node)) {
        setIsFloatingChatFilterOpen(false);
      }
      if (floatingAttachmentMenuRef.current && !floatingAttachmentMenuRef.current.contains(event.target as Node)) {
        setIsFloatingAttachmentMenuOpen(false);
      }
      if (chatMenuRef.current && !chatMenuRef.current.contains(event.target as Node)) {
        setActiveChatMenu(null);
      }
      if (chatMoreMenuRef.current && !chatMoreMenuRef.current.contains(event.target as Node)) {
        setIsChatMoreMenuOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [
    isChatSettingsOpen, 
    isChatListSettingsOpen, 
    isChatFilterOpen, 
    isFloatingChatFilterOpen, 
    isFloatingAttachmentMenuOpen, 
    activeChatMenu, 
    isChatMoreMenuOpen
  ]);

  const floatingChatContainerRef = useRef<HTMLDivElement>(null);
  const [showFloatingStickyDate, setShowFloatingStickyDate] = useState(false);
  const [floatingStickyDate, setFloatingStickyDate] = useState("");

  const handleFloatingChatScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const dateElements = container.querySelectorAll('.chat-date-separator');
    let currentText = "9/9/2026";
    let found = false;
    const containerRect = container.getBoundingClientRect();

    for (let i = dateElements.length - 1; i >= 0; i--) {
      const el = dateElements[i] as HTMLElement;
      const elRect = el.getBoundingClientRect();
      if (elRect.top <= containerRect.top + 60) {
        currentText = el.textContent || "";
        found = true;
        break;
      }
    }
    
    if (found) {
      setFloatingStickyDate(currentText);
      setShowFloatingStickyDate(true);
    } else {
      setShowFloatingStickyDate(false);
    }
  };

  useEffect(() => {
    const scrollToBottom = () => {
      if (floatingChatContainerRef.current) {
        floatingChatContainerRef.current.scrollTop = floatingChatContainerRef.current.scrollHeight;
      }
    };
    scrollToBottom();
    const timeout = setTimeout(scrollToBottom, 50);
    const timeout2 = setTimeout(scrollToBottom, 200);
    return () => {
      clearTimeout(timeout);
      clearTimeout(timeout2);
    };
  }, [activeFloatingChatIdx, isFloatingChatInfoOpen]);


  useEffect(() => {
    if (activeTab === "chat") {
      setActiveFloatingChatIdx(null);
    }
  }, [activeTab]);

  return (
    <>
{/* Right Sidebar (Chat Panel) */}
          <div
            className={`hidden lg:block relative z-50 ${activeTab === "chat" ? "!hidden" : ""}`}
          >
            {/* Chat Bubble Fixed bottom right */}
            <div
              className={`fixed bottom-0 left-[80px] w-[300px] bg-white dark:bg-[#242526] rounded-t-xl shadow-[0_0_15px_rgba(0,0,0,0.15)] border border-gray-200 dark:border-[#3E4042] flex flex-col transition-all duration-300 ease-in-out ${isChatExpanded ? "h-[500px]" : "h-[48px]"}`}
            >
              {/* Header */}
              <div
                onClick={() => setIsChatExpanded(!isChatExpanded)}
                className="px-3 py-2 flex items-center justify-between border-b border-gray-100 dark:border-[#3E4042] hover:bg-gray-200 dark:hover:bg-[#3A3B3C] cursor-pointer rounded-t-xl transition-colors shrink-0 h-[48px]"
              >
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <img src="/navigasi/chat-aktif.svg" alt="Chat" className="w-6 h-6 shrink-0 object-contain" />
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#31A24C] rounded-full border-2 border-white dark:border-[#242526]"></div>
                  </div>
                  <span className="font-semibold text-black dark:text-[#E4E6EB] text-[15px]">
                    {t("chat.title")}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-500 dark:text-[#B0B3B8]">
                  <div
                    className={`relative ${isChatExpanded ? "block" : "hidden"}`}
                    ref={chatSettingsRef}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsChatSettingsOpen(!isChatSettingsOpen);
                      }}
                      className="p-1.5 hover:bg-gray-200 dark:hover:bg-[#4E4F50] dark:bg-[#3A3B3C] rounded-full transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                      </svg>
                    </button>

                    {/* Chat Settings Dropdown */}
                    {isChatSettingsOpen && (
                      <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#242526] rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.1)] border border-gray-100 dark:border-[#3E4042] py-1.5 z-50">
                        <button onClick={(e) => { e.stopPropagation(); setChatListFilter('requests'); setIsChatListSettingsOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-200 dark:hover:bg-[#3A3B3C] flex items-center gap-3 text-[14px] font-semibold text-black dark:text-[#E4E6EB] transition-colors">
                          <svg className="w-5 h-5 text-gray-500 dark:text-[#B0B3B8]" fill="currentColor" viewBox="0 0 24 24"><path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                          {t('chat.messageRequests')}
                        </button>
                        <div className="h-[1px] bg-gray-200 dark:bg-[#3E4042] my-1 mx-2"></div>
                        <button onClick={(e) => { e.stopPropagation(); setIsChatListSettingsOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-200 dark:hover:bg-[#3A3B3C] flex items-center gap-3 text-[14px] font-semibold text-black dark:text-[#E4E6EB] transition-colors">
                          <svg className="w-5 h-5 text-gray-500 dark:text-[#B0B3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h.01M4 12h.01M4 18h.01M8 6h12M8 12h12M8 18h12" /></svg>
                          {t('chat.manage')}
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setIsChatListSettingsOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-200 dark:hover:bg-[#3A3B3C] flex items-center gap-3 text-[14px] font-semibold text-black dark:text-[#E4E6EB] transition-colors">
                          <svg className="w-5 h-5 text-gray-500 dark:text-[#B0B3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          {t('chat.settings')}
                        </button>

                      </div>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsNewMessageOpen(!isNewMessageOpen);
                    }}
                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-[#4E4F50] dark:bg-[#3A3B3C] rounded-full transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-[#4E4F50] dark:bg-[#3A3B3C] rounded-full transition-colors pointer-events-none"
                  >
                    {isChatExpanded ? (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 15l7-7 7 7"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Expanded Content */}
              <div
                className={`flex-1 flex flex-col overflow-hidden transition-opacity duration-300 ${isChatExpanded ? "opacity-100" : "opacity-0 pointer-events-none"}`}
              >
                {/* Tabs */}
                <div className="flex items-center gap-1 px-3 pt-1 border-b border-gray-200 dark:border-[#3E4042] shrink-0">
                  <button className="px-3 py-1.5 font-semibold text-[14px] text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-600 dark:border-emerald-400">
                    {t("chat.all")}
                  </button>
                  <button className="px-3 py-1.5 font-semibold text-[14px] text-gray-500 dark:text-[#B0B3B8] hover:text-gray-800 dark:hover:text-[#E4E6EB] transition-colors">
                    {t("chat.unread")}
                  </button>

                  <div className="ml-auto relative" ref={floatingChatFilterRef}>
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsFloatingChatFilterOpen(!isFloatingChatFilterOpen);
                      }}
                      className="p-1.5 hover:bg-gray-200 dark:hover:bg-[#3A3B3C] rounded-full cursor-pointer transition-colors"
                    >
                      <svg
                        className="w-4 h-4 text-gray-600 dark:text-[#B0B3B8]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6h16M7 12h10M10 18h4"
                        />
                      </svg>
                    </div>

                    {/* Filter Dropdown */}
                    {isFloatingChatFilterOpen && (
                      <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-[#242526] rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.1)] border border-gray-100 dark:border-[#3E4042] py-1.5 z-50">
                        <button onClick={(e) => { e.stopPropagation(); setChatListFilter('favorite'); setIsFloatingChatFilterOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-200 dark:hover:bg-[#3A3B3C] flex items-center gap-3 text-[14px] font-semibold text-black dark:text-[#E4E6EB] transition-colors">
                          <svg className="w-5 h-5 text-gray-500 dark:text-[#B0B3B8]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z" /></svg>
                          {t('chat.filterFavorite')}
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setChatListFilter('community'); setIsFloatingChatFilterOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-200 dark:hover:bg-[#3A3B3C] flex items-center gap-3 text-[14px] font-semibold text-black dark:text-[#E4E6EB] transition-colors">
                          <svg className="w-5 h-5 text-gray-500 dark:text-[#B0B3B8]" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" /></svg>
                          {t('chat.filterGroup')}
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setChatListFilter('archive'); setIsFloatingChatFilterOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-200 dark:hover:bg-[#3A3B3C] flex items-center gap-3 text-[14px] font-semibold text-black dark:text-[#E4E6EB] transition-colors">
                          <svg className="w-5 h-5 text-gray-500 dark:text-[#B0B3B8]" fill="currentColor" viewBox="0 0 24 24"><path d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12.14l.84 1H5.12z" /></svg>
                          {t('chat.filterArchive')}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Chat List */}
                <div className="overscroll-contain flex-1 overflow-y-auto sidebar-scrollbar">
                  {dummyChats.map((chat, idx) => (
                    <div
                      key={idx}
                      onClick={() => { setActiveFloatingChatIdx(idx); setIsFloatingChatInfoOpen(false); }}
                      className={`relative group flex items-center gap-3 p-3 hover:bg-gray-200 dark:hover:bg-[#3A3B3C] cursor-pointer transition-colors ${activeFloatingChatIdx === idx ? "bg-gray-200 dark:bg-[#3A3B3C]" : ""
                        }`}
                    >
                      <div className="relative w-12 h-12 shrink-0">
                        <div className="w-full h-full rounded-full flex items-center justify-center overflow-hidden border border-emerald-600 dark:border-emerald-400">
                          <img
                            src="/default-avatar.svg"
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {chat.isOnline && (
                          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#31A24C] rounded-full border-2 border-white dark:border-[#242526]"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <h4 className="font-semibold text-[14px] text-black dark:text-[#E4E6EB] truncate">
                            {chat.name}
                          </h4>
                          <span
                            className="text-[12px] text-gray-500 dark:text-[#B0B3B8] shrink-0"



                            suppressHydrationWarning
                          >
                            {formatChatDate(chat.ts, locale)}
                          </span>
                        </div>
                        <p className="text-[13px] text-gray-500 dark:text-[#B0B3B8] truncate mt-0.5">
                          <ChatStatusMark status={(chat as any).status} />
                          {chat.msg}
                        </p>
                      </div>
























                      {activeChatMenu === idx && (
                        <div
                          ref={chatMenuRef}
                          onClick={(e) => e.stopPropagation()}
                          className="fixed z-[200] w-[280px] bg-white dark:bg-[#242526] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.25)] border border-gray-100 dark:border-[#3E4042] overflow-hidden py-2"
                          style={{
                            right: "388px",
                            top: Math.min(
                              menuPosition.top,
                              window.innerHeight - 520,
                            ),
                          }}
                        >
                          <button onClick={(e) => { e.stopPropagation(); router.push(`/${locale}/p/${chat.name}/${(chat as any).id || "1"}`); }} className="w-full text-left px-5 py-2 hover:bg-gray-200 dark:hover:bg-[#3A3B3C] flex items-center gap-4 text-[15px] font-semibold text-black dark:text-[#E4E6EB] transition-colors">
                            <svg className="w-6 h-6 text-black dark:text-[#E4E6EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {t("chat.viewProfile")}
                          </button>
                          <button className="w-full text-left px-5 py-2 hover:bg-gray-200 dark:hover:bg-[#3A3B3C] flex items-center gap-4 text-[15px] font-semibold text-black dark:text-[#E4E6EB] transition-colors">
                            <svg className="w-6 h-6 text-black dark:text-[#E4E6EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                            </svg>
                            {t("chat.archiveChat")}
                          </button>
                          <button className="w-full text-left px-5 py-2 hover:bg-gray-200 dark:hover:bg-[#3A3B3C] flex items-center gap-4 text-[15px] font-semibold text-black dark:text-[#E4E6EB] transition-colors">
                            <svg className="w-6 h-6 text-black dark:text-[#E4E6EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                            {t("chat.pinChat")}
                          </button>
                          <button className="w-full text-left px-5 py-2 hover:bg-gray-200 dark:hover:bg-[#3A3B3C] flex items-center gap-4 text-[15px] font-semibold text-black dark:text-[#E4E6EB] transition-colors">
                            <svg className="w-6 h-6 text-black dark:text-[#E4E6EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            {t("chat.markUnread")}
                          </button>
                          <button className="w-full text-left px-5 py-2 hover:bg-gray-200 dark:hover:bg-[#3A3B3C] flex items-center gap-4 text-[15px] font-semibold text-black dark:text-[#E4E6EB] transition-colors">
                            <svg className="w-6 h-6 text-black dark:text-[#E4E6EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            {t("chat.addFavorite")}
                          </button>
                          <button className="w-full text-left px-5 py-2 hover:bg-gray-200 dark:hover:bg-[#3A3B3C] flex items-center justify-between text-[15px] font-semibold text-black dark:text-[#E4E6EB] transition-colors">
                            <div className="flex items-center gap-4">
                              <svg className="w-6 h-6 text-black dark:text-[#E4E6EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                              </svg>
                              {t("chat.addToList")}
                            </div>
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                          <div className="border-t border-gray-100 dark:border-[#3E4042] my-2" />
                          <button className="w-full text-left px-5 py-2 hover:bg-gray-200 dark:hover:bg-[#3A3B3C] flex items-center gap-4 text-[15px] font-semibold text-red-500 transition-colors">
                            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                            </svg>
                            {t("chat.report")}
                          </button>
                          <button className="w-full text-left px-5 py-2 hover:bg-gray-200 dark:hover:bg-[#3A3B3C] flex items-center gap-4 text-[15px] font-semibold text-red-500 transition-colors">
                            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                            {t("chat.block")}
                          </button>
                          <button className="w-full text-left px-5 py-2 hover:bg-gray-200 dark:hover:bg-[#3A3B3C] flex items-center gap-4 text-[15px] font-semibold text-[#F15C00] transition-colors">
                            <svg className="w-6 h-6 text-[#F15C00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {t("chat.clearChat")}
                          </button>
                          <button className="w-full text-left px-5 py-2 hover:bg-gray-200 dark:hover:bg-[#3A3B3C] flex items-center gap-4 text-[15px] font-semibold text-[#F15C00] transition-colors">
                            <svg className="w-6 h-6 text-[#F15C00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            {t("chat.deleteChat")}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Floating Chat Room Panel */}
          <div
            className={`hidden lg:flex fixed bottom-0 left-[396px] w-[380px] bg-white dark:bg-[#242526] rounded-t-xl shadow-[0_0_15px_rgba(0,0,0,0.15)] border border-gray-200 dark:border-[#3E4042] flex-col z-50 transition-all duration-300 ease-in-out transform origin-bottom ${activeFloatingChatIdx !== null ? "scale-y-100 opacity-100 h-[500px]" : "scale-y-0 opacity-0 h-0 pointer-events-none"}`}
          >
            {!isFloatingChatInfoOpen ? (
              <>
                {/* Header */}
                <div className="h-[60px] bg-white dark:bg-[#242526] border-b border-gray-200 dark:border-[#3E4042] flex items-center justify-between px-4 shadow-sm shrink-0 rounded-t-xl hover:bg-gray-200 dark:hover:bg-[#3A3B3C] transition-colors cursor-pointer" onClick={() => setIsFloatingChatInfoOpen(true)}>
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="relative w-10 h-10 shrink-0">
                      <img src="/default-avatar.svg" alt="Avatar" className="w-full h-full rounded-full object-cover" />
                      {activeFloatingChatIdx !== null && dummyChats[activeFloatingChatIdx]?.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#31A24C] rounded-full border-2 border-white dark:border-[#242526]"></div>
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <h3 className="font-semibold text-[15px] text-black dark:text-[#E4E6EB] leading-tight truncate max-w-[200px]">
                        {activeFloatingChatIdx !== null && dummyChats[activeFloatingChatIdx] ? dummyChats[activeFloatingChatIdx].name : "Obrolan"}
                      </h3>
                      <p className="text-[12px] text-gray-500 dark:text-[#B0B3B8] leading-tight truncate">
                        {activeFloatingChatIdx !== null && dummyChats[activeFloatingChatIdx]?.isOnline ? t("chat.activeNow") : t("chat.offline", { defaultMessage: "Offline" })}
                      </p>
                    </div>
                  </div>

                  <div className="ml-auto flex items-center gap-1 shrink-0">
                    {/* Optional Phone/Video Call icons could go here if there was space, but it's very cramped in 320px */}
                    <button
                      onClick={(e) => { e.stopPropagation(); setActiveFloatingChatIdx(null); }}
                      className="w-7 h-7 hover:bg-gray-200 dark:hover:bg-[#4E4F50] rounded-full transition-colors flex items-center justify-center text-gray-500 dark:text-[#B0B3B8]"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Messages Area */}
                {/* Floating Chat Sticky Date */}
                <div className={`absolute top-[60px] left-1/2 transform -translate-x-1/2 z-20 pointer-events-none transition-opacity duration-300 ${showFloatingStickyDate ? "opacity-100" : "opacity-0"}`}>
                  <span className="bg-[#E5E5E5] dark:bg-[#242526] text-gray-600 dark:text-[#A8ABAF] px-3 py-1 rounded-lg text-[12.5px] font-semibold tracking-wide shadow-md">
                    {floatingStickyDate}
                  </span>
                </div>
                <div ref={floatingChatContainerRef} onScroll={handleFloatingChatScroll} className="flex-1 overflow-y-auto relative p-3 flex flex-col gap-2 bg-[#F0F2F5] dark:bg-[#18191A] sidebar-scrollbar overscroll-none">
                  {activeFloatingChatIdx !== null && dummyChats[activeFloatingChatIdx] && (
                    <>
                      <div className="flex flex-col items-center justify-center pt-4 pb-6">
                        <div className="w-[80px] h-[80px] mb-2 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center overflow-hidden shrink-0">
                          <img src="/default-avatar.svg" className="w-full h-full object-cover" />
                        </div>
                        <h2 className="text-[16px] font-semibold text-black dark:text-[#E4E6EB] mb-1">{dummyChats[activeFloatingChatIdx].name}</h2>
                        <p className="text-gray-500 dark:text-[#B0B3B8] text-[12px] mb-3 text-center leading-relaxed max-w-[200px]">
                          <svg className="w-3 h-3 inline-block mr-1 align-baseline text-gray-400 dark:text-[#B0B3B8]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                          {t("chat.e2eEncryptionText")}
                        </p>
                      </div>

                      {/* Tanggal Chat */}
                      <div className="flex justify-center my-3">
                        <span className="bg-[#E5E5E5] dark:bg-[#242526] text-gray-600 dark:text-[#A8ABAF] px-3 py-1 rounded-lg text-[12.5px] font-semibold tracking-wide shadow-sm">
                          9/9/2026
                        </span>
                      </div>

                      <div className="flex items-start gap-2 max-w-[90%] group">
                        <img src="/default-avatar.svg" className="w-7 h-7 rounded-full border border-gray-300 shrink-0 mt-1" />
                        <div className="flex flex-col gap-1 ">
                          <div className="bg-white dark:bg-[#3A3B3C] px-3 py-2 rounded-2xl rounded-tl-none shadow-sm flex flex-col">
                            <p className="text-[13.5px] text-black dark:text-[#E4E6EB]">
                              {dummyChats[activeFloatingChatIdx].msg}
                            </p>
                            <span className="text-[10.5px] text-gray-500 dark:text-[#B0B3B8] mt-1 self-start">
                              {new Date(dummyChats[activeFloatingChatIdx].ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })}
                            </span>
                          </div>
                        </div>
                      </div>
                      {/* Bubble 1: Gagal Terkirim */}
                      <div className="flex items-end justify-end gap-2 max-w-[90%] self-end mt-2">
                        <div className="flex flex-col gap-1 items-end">
                          <div className="bg-emerald-600 dark:bg-emerald-500 px-3 py-2 rounded-2xl rounded-tr-none shadow-sm flex flex-col items-end">
                            <p className="text-[13.5px] text-white">
                              Waduh, sinyal lagi jelek nih bro.
                            </p>
                            <span className="text-[10px] text-emerald-100 mt-1">10.25</span>
                          </div>
                          <div className="flex items-center gap-1 mr-1">
                            <div className="w-3.5 h-3.5 bg-red-500" style={{ WebkitMask: 'url(/mark/tidak-terkirim.svg) no-repeat center', WebkitMaskSize: 'contain', mask: 'url(/mark/tidak-terkirim.svg) no-repeat center', maskSize: 'contain' }} />
                            <span className="text-[10px] text-gray-500 dark:text-[#B0B3B8]">Gagal terkirim</span>
                          </div>
                        </div>
                      </div>

                      {/* Bubble 2: Pending */}
                      <div className="flex items-end justify-end gap-2 max-w-[90%] self-end mt-2">
                        <div className="flex flex-col gap-1 items-end">
                          <div className="bg-emerald-600 dark:bg-emerald-500 px-3 py-2 rounded-2xl rounded-tr-none shadow-sm flex flex-col items-end">
                            <p className="text-[13.5px] text-white">
                              Sabar yak, ini lagi jalan ke warkop cari wifi.
                            </p>
                            <span className="text-[10px] text-emerald-100 mt-1">10.27</span>
                          </div>
                          <div className="flex items-center gap-1 mr-1">
                            <div className="w-3.5 h-3.5 bg-orange-500" style={{ WebkitMask: 'url(/mark/pending.svg) no-repeat center', WebkitMaskSize: 'contain', mask: 'url(/mark/pending.svg) no-repeat center', maskSize: 'contain' }} />
                            <span className="text-[10px] text-gray-500 dark:text-[#B0B3B8]">Mengirimkan...</span>
                          </div>
                        </div>
                      </div>

                      {/* Bubble 3: Terkirim */}
                      <div className="flex items-end justify-end gap-2 max-w-[90%] self-end mt-2">
                        <div className="flex flex-col gap-1 items-end">
                          <div className="bg-emerald-600 dark:bg-emerald-500 px-3 py-2 rounded-2xl rounded-tr-none shadow-sm flex flex-col items-end">
                            <p className="text-[13.5px] text-white">
                              Nah udah masuk nih pesannya!
                            </p>
                            <span className="text-[10px] text-emerald-100 mt-1">10.35</span>
                          </div>
                          <div className="flex items-center gap-1 mr-1">
                            <div className="w-3.5 h-3.5 bg-blue-500" style={{ WebkitMask: 'url(/mark/terkirim.svg) no-repeat center', WebkitMaskSize: 'contain', mask: 'url(/mark/terkirim.svg) no-repeat center', maskSize: 'contain' }} />
                            <span className="text-[10px] text-gray-500 dark:text-[#B0B3B8]">Terkirim</span>
                          </div>
                        </div>
                      </div>

                      {/* Bubble 4: Dilihat */}
                      <div className="flex items-end justify-end gap-2 max-w-[90%] self-end mt-2">
                        <div className="flex flex-col gap-1 items-end">
                          <div className="bg-emerald-600 dark:bg-emerald-500 px-3 py-2 rounded-2xl rounded-tr-none shadow-sm flex flex-col items-end">
                            <p className="text-[13.5px] text-white">
                              Baik bro! Iyak nih kapan ya terakhir ketemu, sibuk parah wkwk.
                            </p>
                            <span className="text-[10px] text-emerald-100 mt-1">11.11</span>
                          </div>
                          <div className="flex items-center gap-1 mr-1">
                            <div className="w-4 h-4 bg-green-500" style={{ WebkitMask: 'url(/mark/diliat.svg) no-repeat center', WebkitMaskSize: 'contain', mask: 'url(/mark/diliat.svg) no-repeat center', maskSize: 'contain' }} />
                            <span className="text-[10px] text-gray-500 dark:text-[#B0B3B8]">Dilihat 11.12</span>
                          </div>
                        </div>
                      </div>
                      {/* Tanggal Chat 2 */}
                      <div className="flex justify-center my-4">
                        <span className="chat-date-separator bg-[#E5E5E5] dark:bg-[#242526] text-gray-600 dark:text-[#A8ABAF] px-3 py-1 rounded-lg text-[12.5px] font-semibold tracking-wide shadow-sm">
                          10/9/2026
                        </span>
                      </div>

                      <div className="flex items-start gap-2 max-w-[90%] group mt-2">
                        <img src="/default-avatar.svg" className="w-7 h-7 rounded-full border border-gray-300 shrink-0 mt-1" />
                        <div className="flex flex-col gap-1 ">
                          <div className="bg-white dark:bg-[#3A3B3C] px-3 py-2 rounded-2xl rounded-tl-none shadow-sm flex flex-col">
                            <p className="text-[13.5px] text-black dark:text-[#E4E6EB]">
                              Eh bro, sorry baru balas. Kemarin sibuk banget parah.
                            </p>
                            <span className="text-[10px] text-gray-500 dark:text-[#B0B3B8] mt-1 self-start">
                              08:15
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-end justify-end gap-2 max-w-[90%] self-end mt-2">
                        <div className="flex flex-col gap-1 items-end">
                          <div className="bg-emerald-600 dark:bg-emerald-500 px-3 py-2 rounded-2xl rounded-tr-none shadow-sm flex flex-col items-end">
                            <p className="text-[13.5px] text-white">
                              Santai bro, ini besok jadi kumpul kan di tempat biasa?
                            </p>
                            <span className="text-[10px] text-emerald-100 mt-1">08:20</span>
                          </div>
                          <div className="flex items-center gap-1 mr-1">
                            <div className="w-4 h-4 bg-green-500" style={{ WebkitMask: 'url(/mark/diliat.svg) no-repeat center', WebkitMaskSize: 'contain', mask: 'url(/mark/diliat.svg) no-repeat center', maskSize: 'contain' }} />
                            <span className="text-[10px] text-gray-500 dark:text-[#B0B3B8]">Dilihat 08:22</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Input Area */}
                <div className="p-3 bg-white dark:bg-[#242526] shrink-0 border-t border-gray-200 dark:border-[#3E4042]">
                  <div className="flex items-end gap-2">
                    <div className="relative" ref={floatingAttachmentMenuRef}>
                      <button
                        onClick={() => setIsFloatingAttachmentMenuOpen(!isFloatingAttachmentMenuOpen)}
                        className="bg-[#00B47A] text-white hover:bg-[#009E6B] p-1.5 rounded-full transition-colors flex items-center justify-center shrink-0"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                      </button>

                      {isFloatingAttachmentMenuOpen && (
                        <div className="absolute bottom-full left-0 mb-3 w-[200px] bg-white dark:bg-[#242526] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.25)] border border-gray-100 dark:border-[#3E4042] overflow-hidden py-1.5 z-50">
                          <button className="w-full text-left px-4 py-2 hover:bg-gray-200 dark:hover:bg-[#3A3B3C] flex items-center gap-3 text-[14px] font-medium text-black dark:text-[#E4E6EB] transition-colors">
                            <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                              <svg className="w-4 h-4 text-[#2D88FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            {t("chat.uploadImage")}
                          </button>
                          <button className="w-full text-left px-4 py-2 hover:bg-gray-200 dark:hover:bg-[#3A3B3C] flex items-center gap-3 text-[14px] font-medium text-black dark:text-[#E4E6EB] transition-colors">
                            <div className="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                              <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            {t("chat.uploadFile")}
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 flex items-end bg-[#F0F2F5] dark:bg-[#3A3B3C] border border-gray-300 dark:border-[#4E4F50] rounded-[20px] px-3 py-1.5 min-w-0">
                      <textarea
                        rows={1}
                        placeholder={t("chat.typeMessage")}
                        className="flex-1 bg-transparent border-none outline-none text-[13px] text-black dark:text-[#E4E6EB] placeholder-gray-500 dark:placeholder-[#B0B3B8] min-w-0 resize-none max-h-[100px] overflow-y-auto sidebar-scrollbar overscroll-none"
                        style={{ minHeight: "20px" }}
                        value={floatingChatMessage}
                        onChange={(e) => {
                          setFloatingChatMessage(e.target.value);
                          const prev = e.target.style.height;
                          e.target.style.height = 'auto';
                          e.target.style.height = e.target.scrollHeight + 'px';
                          if (prev !== e.target.style.height) {
                            const msgs = e.target.closest('.flex-col')?.querySelector('.overflow-y-auto');
                            if (msgs) msgs.scrollTop = msgs.scrollHeight;
                          }
                        }}
                      />
                      <button className="text-[#00B47A] hover:text-[#009E6B] transition-colors shrink-0 ml-1.5 flex items-center justify-center">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>

                    {floatingChatMessage.trim().length > 0 ? (
                      <button className="flex items-center justify-center gap-1 bg-[#00B47A] hover:bg-[#009E6B] text-white px-2.5 py-1.5 rounded-full transition-colors font-bold text-[11px] shadow-sm shrink-0 ml-1 min-w-[76px]">
                        {t("chat.send")}
                        <svg className="w-3.5 h-3.5 rotate-90" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                      </button>
                    ) : (
                      <button className="flex items-center justify-center gap-1 bg-red-500 hover:bg-red-600 text-white px-2.5 py-1.5 rounded-full transition-colors font-bold text-[11px] shadow-sm shrink-0 ml-1 min-w-[76px]">
                        <svg
                          className="w-3.5 h-3.5"
                          viewBox="0 0 512 512"
                          fill="currentColor"
                        >
                          <g
                            transform="translate(0,512) scale(0.1,-0.1)"
                            stroke="none"
                          >
                            <path d="M2256 5104 c-140 -34 -288 -147 -353 -269 -49 -94 -66 -167 -65 -275 2 -215 153 -2686 167 -2744 51 -199 230 -368 429 -405 141 -26 291 -6 405 54 135 71 253 228 281 375 6 30 46 661 90 1402 71 1228 77 1353 65 1422 -38 221 -198 389 -420 441 -83 20 -515 19 -599 -1z" />
                            <path d="M414 3206 c-42 -18 -71 -60 -137 -191 -130 -260 -208 -507 -253 -800 -26 -169 -26 -541 0 -710 23 -151 74 -359 121 -495 41 -119 172 -397 212 -448 77 -101 228 -72 261 51 14 49 9 64 -80 242 -108 220 -176 432 -215 680 -24 153 -24 497 0 650 39 248 107 460 215 680 89 178 94 193 80 242 -24 90 -119 136 -204 99z" />
                            <path d="M4596 3210 c-58 -18 -96 -73 -96 -140 0 -30 19 -79 78 -198 112 -227 175 -424 218 -687 26 -154 26 -496 0 -650 -43 -263 -106 -460 -218 -687 -88 -177 -96 -219 -55 -278 59 -87 177 -91 240 -9 40 53 161 309 206 436 214 601 197 1264 -46 1848 -40 95 -133 277 -160 314 -40 53 -99 71 -167 51z" />
                            <path d="M934 2906 c-43 -19 -74 -63 -138 -196 -222 -463 -256 -981 -95 -1465 45 -136 142 -344 183 -392 66 -78 194 -64 241 27 29 56 19 106 -44 232 -88 175 -141 346 -167 537 -43 327 17 667 172 972 42 82 54 116 54 151 0 106 -108 176 -206 134z" />
                            <path d="M4063 2900 c-25 -11 -51 -33 -63 -52 -35 -58 -27 -103 44 -250 120 -250 176 -482 176 -738 0 -256 -56 -488 -176 -738 -74 -153 -80 -194 -39 -254 34 -50 100 -76 154 -59 65 19 89 47 155 181 270 546 274 1171 11 1718 -68 142 -88 170 -139 193 -52 23 -71 23 -123 -1z" />
                            <path d="M1475 2613 c-66 -16 -133 -122 -198 -308 -56 -164 -71 -258 -71 -445 0 -122 4 -188 18 -255 39 -190 139 -423 200 -470 47 -35 95 -41 150 -17 98 44 110 122 42 265 -56 117 -83 199 -101 312 -36 221 1 450 106 656 45 88 51 145 19 197 -31 51 -105 80 -165 65z" />
                            <path d="M3577 2610 c-58 -10 -108 -65 -114 -124 -5 -41 0 -60 40 -144 58 -124 84 -205 102 -317 36 -221 4 -424 -102 -645 -39 -82 -45 -100 -40 -143 10 -112 144 -168 236 -99 58 43 159 284 198 472 13 61 18 131 18 250 0 119 -5 189 -18 250 -39 186 -140 429 -197 471 -35 26 -78 36 -123 29z" />
                            <path d="M2455 1090 c-198 -44 -352 -180 -417 -368 -32 -95 -32 -249 0 -344 56 -164 180 -288 348 -350 85 -31 263 -31 348 0 168 62 292 186 348 350 32 -95 32 -249 0 -344 -57 -164 -183 -291 -348 -349 -67 23 -215 33 -279 19z" />
                          </g>
                        </svg>
                        PING
                      </button>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 overflow-y-auto bg-white dark:bg-[#242526] relative rounded-t-xl flex flex-col">
                <div className="h-[60px] border-b border-gray-200 dark:border-[#3E4042] flex items-center px-4 shrink-0 shadow-sm">
                  <button onClick={(e) => { e.stopPropagation(); setIsFloatingChatInfoOpen(false); }} className="w-8 h-8 rounded-full hover:bg-gray-200 dark:hover:bg-[#3A3B3C] flex items-center justify-center transition-colors text-gray-500 dark:text-[#B0B3B8]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                  </button>
                  <span className="ml-3 font-semibold text-black dark:text-[#E4E6EB] text-[15px]">Info Profil</span>
                </div>
                <div className="flex-1 overflow-y-auto sidebar-scrollbar p-4 flex flex-col items-center gap-4 overscroll-none">
                  <div className="w-24 h-24 shrink-0 rounded-full overflow-hidden border-2 border-gray-200 dark:border-[#3E4042] mt-4">
                    <img
                      src="/default-avatar.svg"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-bold text-[20px] text-black dark:text-[#E4E6EB]">
                    {activeFloatingChatIdx !== null ? dummyChats[activeFloatingChatIdx]?.name : "Budi Santoso"}
                  </h3>
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center gap-1 cursor-pointer group">
                      <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#3A3B3C] group-hover:bg-gray-200 dark:group-hover:bg-[#4E4F50] flex items-center justify-center transition-colors">
                        <svg
                          className="w-5 h-5 text-black dark:text-[#E4E6EB] group-hover:text-[#00B47A] transition-colors"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <span className="text-[12px] text-black dark:text-[#E4E6EB] group-hover:text-[#00B47A] transition-colors">
                        {t("chat.profile")}
                      </span>
                    </div>
                  </div>

                  {/* Categories */}
                  <div className="w-full flex flex-col mt-4">
                    {/* Category: Links */}
                    <div className="w-full border-t border-gray-200 dark:border-[#3E4042]">
                      <button className="w-full flex items-center justify-between py-4 transition-colors group px-2 -mx-2 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-[#2D88FF]">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                          </div>
                          <span className="font-semibold text-[15px] text-black dark:text-[#E4E6EB] group-hover:underline">{t("chat.links")}</span>
                        </div>
                        <svg className="w-5 h-5 text-gray-500 group-hover:text-black dark:group-hover:text-[#E4E6EB] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </button>
                      <div className="flex flex-col gap-2 pb-4">
                        <a href="#" className="flex items-center gap-3 p-2 -mx-2 text-[14px] text-[#2D88FF] hover:bg-gray-200 dark:hover:bg-[#3A3B3C]/50 rounded-lg group/link transition-colors">
                          <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                          </div>
                          <span className="truncate group-hover/link:underline">https://dribbble.com/shots/popular</span>
                        </a>
                        <a href="#" className="flex items-center gap-3 p-2 -mx-2 text-[14px] text-[#2D88FF] hover:bg-gray-200 dark:hover:bg-[#3A3B3C]/50 rounded-lg group/link transition-colors">
                          <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                          </div>
                          <span className="truncate group-hover/link:underline">https://github.com/nethubz/web-app</span>
                        </a>
                      </div>
                    </div>

                    {/* Category: Media Gallery */}
                    <div className="w-full border-t border-gray-200 dark:border-[#3E4042]">
                      <button className="w-full flex items-center justify-between py-4 transition-colors group px-2 -mx-2 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-[#00B47A]">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          </div>
                          <span className="font-semibold text-[15px] text-black dark:text-[#E4E6EB] group-hover:underline">{t("chat.mediaGallery")}</span>
                        </div>
                        <svg className="w-5 h-5 text-gray-500 group-hover:text-black dark:group-hover:text-[#E4E6EB] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </button>
                      <div className="grid grid-cols-3 gap-2 pb-4 px-2 -mx-2">
                        <div className="aspect-square bg-gray-100 dark:bg-[#3A3B3C] rounded-lg cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-center overflow-hidden border border-transparent dark:border-[#4E4F50]">
                          <img src="/default-avatar.svg" className="w-full h-full object-cover opacity-90" />
                        </div>
                        <div className="aspect-square bg-gray-100 dark:bg-[#3A3B3C] rounded-lg cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-center overflow-hidden border border-transparent dark:border-[#4E4F50]">
                          <img src="/default-avatar.svg" className="w-full h-full object-cover opacity-90" />
                        </div>
                        <div className="aspect-square bg-gray-100 dark:bg-[#3A3B3C] rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-[#4E4F50] transition-colors flex items-center justify-center border border-transparent dark:border-[#4E4F50]">
                          <span className="text-[14px] font-semibold text-gray-500 dark:text-[#B0B3B8]">12+</span>
                        </div>
                      </div>
                    </div>

                    {/* Category: Media File */}
                    <div className="w-full border-t border-gray-200 dark:border-[#3E4042]">
                      <button className="w-full flex items-center justify-between py-4 transition-colors group px-2 -mx-2 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                          </div>
                          <span className="font-semibold text-[15px] text-black dark:text-[#E4E6EB] group-hover:underline">{t("chat.mediaFiles")}</span>
                        </div>
                        <svg className="w-5 h-5 text-gray-500 group-hover:text-black dark:group-hover:text-[#E4E6EB] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </button>
                      <div className="flex flex-col gap-1 pb-4">
                        <div className="flex items-center gap-3 cursor-pointer group/file p-2 -mx-2 hover:bg-gray-200 dark:hover:bg-[#3A3B3C]/50 rounded-lg transition-colors">
                          <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 flex items-center justify-center shrink-0">
                            <span className="text-[11px] font-bold text-red-600 dark:text-red-400">PDF</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[14px] font-semibold text-black dark:text-[#E4E6EB] truncate">Briefing_Design_Q3.pdf</p>
                            <p className="text-[12px] text-gray-500">2.4 MB • 12 Ags</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 cursor-pointer group/file p-2 -mx-2 hover:bg-gray-200 dark:hover:bg-[#3A3B3C]/50 rounded-lg transition-colors">
                          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center shrink-0">
                            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">DOC</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[14px] font-semibold text-black dark:text-[#E4E6EB] truncate">Draft_Kontrak_Kerja.docx</p>
                            <p className="text-[12px] text-gray-500">840 KB • 10 Ags</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* New Message Panel */}
          <div
            style={{ right: activeFloatingChatIdx !== null ? "712px" : "396px" }}
            className={`hidden lg:flex fixed bottom-0 left-[396px] w-[300px] bg-white dark:bg-[#242526] rounded-t-xl shadow-[0_0_15px_rgba(0,0,0,0.15)] border border-gray-200 dark:border-[#3E4042] flex-col z-50 transition-all duration-300 ease-in-out transform origin-bottom ${isNewMessageOpen ? "scale-y-100 opacity-100 h-[420px]" : "scale-y-0 opacity-0 h-0 pointer-events-none"}`}
          >
            {/* Header */}
            <div className="px-3 py-2 flex items-center justify-between border-b border-gray-100 dark:border-[#3E4042] shrink-0 h-[48px]">
              <span className="font-semibold text-black dark:text-[#E4E6EB] text-[15px] pl-1">
                {t("chat.newMessage")}
              </span>
              <button
                onClick={() => setIsNewMessageOpen(false)}
                className="p-1 hover:bg-gray-200 dark:hover:bg-[#4E4F50] dark:bg-[#3A3B3C] rounded-full transition-colors text-gray-500 dark:text-[#B0B3B8] hover:text-gray-700 dark:hover:text-[#E4E6EB]"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* To: Input */}
            <div className="px-4 py-3 border-b border-gray-100 dark:border-[#3E4042] flex items-center gap-2">
              <span className="text-gray-500 dark:text-[#B0B3B8] text-[15px]">
                {t("chat.to")}
              </span>
              <input
                type="text"
                className="flex-1 outline-none text-[15px] bg-transparent text-black dark:text-[#E4E6EB] placeholder-gray-400"
              />
            </div>

            {/* Contact List */}
            <div className="flex-1 overflow-y-auto sidebar-scrollbar overscroll-none">
              {/* Pam Faiz */}
              <div className="flex items-center gap-3 p-3 hover:bg-gray-200 dark:hover:bg-[#3A3B3C] cursor-pointer transition-colors">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 overflow-hidden border border-emerald-600 dark:border-emerald-400">
                  <img
                    src="/default-avatar.svg"
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-[15px] text-black dark:text-[#E4E6EB] truncate">
                    Pam Faiz
                  </span>
                </div>
              </div>
            </div>
          </div>
    </>
  );
}