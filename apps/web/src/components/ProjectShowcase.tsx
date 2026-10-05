"use client";

import React, { useState, useMemo, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { MediaRenderer } from "@/components/MediaRenderer";

export default function ProjectShowcase({ projects, title, subtitle }: { projects: any[], title?: string, subtitle?: string }) {
  const t = useTranslations("project");
  const tHub = useTranslations("projectShowcase");
  const locale = useLocale();

  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const [search, setSearch] = useState("");
  const [activeStatus, setActiveStatus] = useState("ALL");
  const [showFilter, setShowFilter] = useState(false);
  const [activeCategory, setActiveCategory] = useState("ALL");

  const categories = [
    { key: "WEB_DEV", label: "Web Dev", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg> },
    { key: "MOBILE_APP", label: "Mobile Apps", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg> },
    { key: "GAME_DEV", label: "Game Dev", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg> },
    { key: "DATA_AI", label: "Data & AI", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> },
    { key: "DESKTOP_APP", label: "Desktop Apps", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> },
    { key: "OPEN_SOURCE", label: "Open Source", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
    { key: "UI_UX", label: "UI/UX Design", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg> },
    { key: "GRAPHIC_DESIGN", label: "Graphic Design", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg> },
    { key: "ANIMATION_3D", label: "3D & Animation", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg> },
    { key: "VIDEO_FILM", label: "Video & Film", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg> },
    { key: "MUSIC_AUDIO", label: "Music & Audio", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg> },
    { key: "ECOMMERCE", label: "E-Commerce", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg> },
    { key: "SAAS", label: "SaaS", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg> },
    { key: "FINTECH", label: "Fintech", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { key: "SOCIAL_IMPACT", label: "Social Impact", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg> },
    { key: "IOT", label: "IoT", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" /></svg> },
    { key: "ROBOTICS", label: "Robotics", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg> },
    { key: "ELECTRONICS", label: "Electronics", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg> },
    { key: "EDTECH", label: "EdTech", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14v6" /></svg> },
    { key: "RESEARCH", label: "Research", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg> },
    { key: "COURSE", label: "Course & Module", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg> },
    { key: "COMIC", label: "Comic/Webtoon", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg> },
    { key: "BOOK", label: "Book/Novel", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg> },
    { key: "OTHER", label: "Other", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg> }
  ];

  const statusFilters = [
    { key: "ALL", label: tHub("filterAll") },
    { key: "RELEASED", label: t("statusReleased") },
    { key: "IN_PROGRESS", label: t("statusInProgress") },
    { key: "OPEN_SOURCE", label: t("statusOpenSource") },
    { key: "SEARCHING_TEAM", label: t("statusSearchingTeam") },
    { key: "HIATUS", label: t("statusHiatus") },
  ];



  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        p.title?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.user?.username?.toLowerCase().includes(q) ||
        p.user?.profile?.displayName?.toLowerCase().includes(q) ||
        p.techStack?.some((t: string) => t.toLowerCase().includes(q));
      const matchStatus = activeStatus === "ALL" || p.status === activeStatus;
      const matchCategory = activeCategory === "ALL" || p.category === activeCategory || (!p.category && activeCategory === "SOFTWARE_IT");
      return matchSearch && matchStatus && matchCategory;
    });
  }, [projects, search, activeStatus, activeCategory]);

  const statusBadgeClass = (status: string) =>
    "shrink-0 px-2.5 py-1 rounded-md text-[11px] font-semibold " +
    (status === "RELEASED"
      ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400"
      : status === "IN_PROGRESS"
      ? "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400"
      : status === "OPEN_SOURCE"
      ? "bg-white dark:bg-[#242526] text-gray-700 dark:text-gray-300 border border-dashed border-gray-400 dark:border-gray-500"
      : status === "SEARCHING_TEAM"
      ? "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300"
      : status === "HIATUS"
      ? "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"
      : "bg-gray-100 text-gray-700");

  const statusKey = (status: string) =>
    ({ RELEASED: "statusReleased", IN_PROGRESS: "statusInProgress", OPEN_SOURCE: "statusOpenSource", SEARCHING_TEAM: "statusSearchingTeam" } as Record<string, string>)[status] || "statusReleased";

  return (
    <div className="flex flex-col gap-6 w-full">
      {title && subtitle && (
        <div className="flex items-end justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-[#E4E6EB]">{title}</h1>
            <p className="text-gray-500 dark:text-[#B0B3B8] text-[14px] mt-1">{subtitle}</p>
          </div>
        </div>
      )}

      {/* HERO CATEGORIES CAROUSEL */}
      <div ref={carouselRef} className="flex gap-3 overflow-x-auto pb-4 pt-2 px-1 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth">
        {categories.map((c) => {
          const count = projects.filter((p) => p.category === c.key || (!p.category && c.key === "WEB_DEV")).length;
          return (
            <button
              key={c.key}
              onClick={() => setActiveCategory(activeCategory === c.key ? "ALL" : c.key)}
              className={`shrink-0 w-[120px] snap-start flex flex-col items-center justify-center p-4 rounded-2xl border transition-all relative ${
                activeCategory === c.key
                  ? "bg-purple-100 border-purple-200 text-purple-700 dark:bg-purple-500/20 dark:border-purple-500/30 dark:text-purple-300 shadow-sm translate-y-[2px]"
                  : "bg-white border-gray-100 border-b-gray-200 text-gray-600 hover:border-purple-200 hover:-translate-y-1 hover:shadow-lg dark:bg-[#242526] dark:border-[#3A3B3C] dark:border-b-[#4E4F50] dark:text-[#B0B3B8] dark:hover:border-purple-500/30 shadow-md border-b-[4px]"
              }`}
            >
              <div className={`mb-3 p-2.5 rounded-full transition-colors ${activeCategory === c.key ? "bg-purple-200 dark:bg-purple-500/40 text-purple-700 dark:text-purple-300" : "bg-gray-50 dark:bg-[#3A3B3C] text-gray-500 dark:text-gray-400"}`}>
                {c.icon}
              </div>
              <span className="text-[12px] font-bold text-center leading-tight tracking-wide mb-1">{c.label}</span>
              <span className="text-[10px] font-medium opacity-70">{count} project</span>
            </button>
          );
        })}
      </div>

      <div className="flex gap-6 items-start w-full">
        {/* LEFT: Project Cards */}
      <div className="flex-1 min-w-0">
        
        <div className="flex flex-col gap-3 mb-5">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-bold text-gray-800 dark:text-[#E4E6EB]">
              {tHub("categoryTitle")} <span className="text-purple-600 dark:text-purple-400">{activeCategory === "ALL" ? tHub("allCategories") : categories.find(c => c.key === activeCategory)?.label}</span>
            </h2>
            <div className="flex gap-2">
              <button onClick={scrollLeft} className="w-8 h-8 rounded-full bg-white dark:bg-[#3A3B3C] border border-gray-200 dark:border-[#4E4F50] flex items-center justify-center text-gray-600 dark:text-[#E4E6EB] hover:bg-gray-50 dark:hover:bg-[#4E4F50] transition-colors shadow-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button onClick={scrollRight} className="w-8 h-8 rounded-full bg-white dark:bg-[#3A3B3C] border border-gray-200 dark:border-[#4E4F50] flex items-center justify-center text-gray-600 dark:text-[#E4E6EB] hover:bg-gray-50 dark:hover:bg-[#4E4F50] transition-colors shadow-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
          <div className="h-px w-full bg-gray-200 dark:bg-[#3A3B3C]"></div>
        </div>


        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-[#242526] rounded-2xl border border-gray-100 dark:border-[#3A3B3C]">
            <svg className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-500 dark:text-[#B0B3B8] font-medium">{tHub("noResults")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5">
            {filtered.map((p: any) => {
              const cover = p.coverUrls?.[0] || p.mediaUrls?.[0];
              const username = p.user?.username || "Unknown";
              const displayName = p.user?.profile?.displayName || username;
              const avatarUrl = p.user?.profile?.avatarUrl;

              return (
                <div
                  key={p.id}
                  className="bg-white dark:bg-[#242526] rounded-[20px] shadow-sm border border-gray-100 dark:border-[#3A3B3C] overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5 flex flex-col md:flex-row min-h-[180px] group/card relative"
                >
                  {cover ? (
                    <div className="w-full md:w-[260px] md:shrink-0 aspect-video md:aspect-auto relative z-0">
                      <MediaRenderer url={cover} className="absolute inset-0 w-full h-full object-cover bg-gray-100 dark:bg-[#3A3B3C]" />
                    </div>
                  ) : (
                    <div className="w-full md:w-[260px] md:shrink-0 aspect-video md:aspect-auto bg-gray-100 dark:bg-[#3A3B3C] flex items-center justify-center text-gray-400">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}

                  <div className="p-5 flex flex-col flex-grow relative z-10 w-full min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <Link
                        href={`/${locale}/project/${username}/${p.id}`}
                        className="text-gray-900 dark:text-[#E4E6EB] font-bold text-[17px] line-clamp-2 after:absolute after:inset-0 after:z-0 hover:text-purple-600 dark:hover:text-purple-400"
                      >
                        {p.title}
                      </Link>
                      <span className={statusBadgeClass(p.status)}>
                        {t(statusKey(p.status))}
                      </span>
                    </div>

                    <p className="text-gray-600 dark:text-[#B0B3B8] text-[13px] whitespace-pre-line line-clamp-3 mb-4 flex-grow">
                      {p.description}
                    </p>

                    <div className="mt-auto">
                      {p.techStack?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {p.techStack.slice(0, 4).map((tech: string) => (
                            <span
                              key={tech}
                              className="px-2 py-0.5 rounded text-[11px] font-medium transition-colors bg-gray-100 text-gray-600 dark:bg-[#3A3B3C] dark:text-[#E4E6EB]"
                            >
                              {tech}
                            </span>
                          ))}
                          {p.techStack.length > 4 && (
                            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-600 dark:bg-[#3A3B3C] dark:text-[#E4E6EB]">
                              +{p.techStack.length - 4}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-[#3A3B3C]">
                        <Link href={`/${locale}/project/${username}`} className="flex items-center gap-2.5 group/user relative z-10">
                          {avatarUrl ? (
                            <img src={avatarUrl} alt={displayName} className="w-8 h-8 rounded-full object-cover shrink-0" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-[#3A3B3C] shrink-0 flex items-center justify-center text-gray-500 dark:text-gray-400 font-bold text-sm">
                              {displayName[0]?.toUpperCase()}
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="text-[13px] font-semibold text-gray-700 dark:text-[#E4E6EB] group-hover/user:text-purple-600 dark:group-hover/user:text-purple-400 transition-colors leading-tight">
                              {tHub("userProjects", { name: displayName })}
                            </span>
                            <span className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                              @{username}
                            </span>
                          </div>
                        </Link>

                        <div className="flex items-center gap-3.5 relative z-10" onClick={(e) => e.stopPropagation()}>
                          <button className="flex items-center gap-1.5 text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors font-medium text-[13px]">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
                            {t("like")} <span className="ml-0.5 text-gray-400 dark:text-gray-500">{p._count?.likes || 0}</span>
                          </button>
                          <Link href={`/${locale}/project/${username}/${p.id}#comments`} className="flex items-center gap-1.5 text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors font-medium text-[13px]">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                            {t("comment")} <span className="ml-0.5 text-gray-400 dark:text-gray-500">{p._count?.comments || 0}</span>
                          </Link>
                          <button className="flex items-center gap-1.5 text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors font-medium text-[13px]">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                            {t("share")}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* RIGHT: Search & Filter Sidebar */}
      <div className="w-[300px] shrink-0 flex flex-col gap-4 sticky top-24">
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[13px] font-bold text-gray-500 dark:text-[#B0B3B8] uppercase tracking-wide">
              {tHub("searchTitle")}
            </p>
            <div className="relative">
              <button 
                onClick={() => setShowFilter(!showFilter)}
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                  showFilter || activeStatus !== "ALL" 
                  ? "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300" 
                  : "bg-gray-200 text-gray-600 dark:bg-[#3A3B3C] dark:text-[#E4E6EB] hover:bg-gray-300 dark:hover:bg-[#4E4F50]"
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </button>
              
              {/* Filter Popup */}
              {showFilter && (
                <>
                  {/* Invisible overlay to close on outside click */}
                  <div className="fixed inset-0 z-40" onClick={() => setShowFilter(false)}></div>
                  <div className="absolute right-0 top-full mt-2 w-[220px] bg-white dark:bg-[#242526] rounded-xl border border-gray-100 dark:border-[#3A3B3C] shadow-lg p-2 z-50">
                    <p className="text-[12px] font-bold text-gray-500 dark:text-[#B0B3B8] px-2 py-1 mb-1 uppercase tracking-wide">{tHub("filterStatus")}</p>
                    <div className="flex flex-col gap-1">
                      {statusFilters.map((f) => (
                        <button
                          key={f.key}
                          onClick={() => { setActiveStatus(f.key); setShowFilter(false); }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                            activeStatus === f.key
                              ? "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300"
                              : "text-gray-700 dark:text-[#E4E6EB] hover:bg-gray-100 dark:hover:bg-[#3A3B3C]"
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={tHub("searchPlaceholder")}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-[#F0F2F5] dark:bg-[#3A3B3C] text-gray-900 dark:text-[#E4E6EB] text-[14px] outline-none border border-transparent focus:border-purple-400 dark:focus:border-purple-500 transition-colors placeholder:text-gray-400"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>


      </div>
    </div>
  </div>
  );
}
