"use client";

import React, { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { MediaRenderer } from "@/components/MediaRenderer";

export default function ProjectShowcase({ projects }: { projects: any[] }) {
  const t = useTranslations("project");
  const tHub = useTranslations("projectShowcase");
  const locale = useLocale();

  const [search, setSearch] = useState("");
  const [activeStatus, setActiveStatus] = useState("ALL");
  const [activeTech, setActiveTech] = useState("");

  const statusFilters = [
    { key: "ALL", label: tHub("filterAll") },
    { key: "RELEASED", label: t("statusReleased") },
    { key: "IN_PROGRESS", label: t("statusInProgress") },
    { key: "OPEN_SOURCE", label: t("statusOpenSource") },
    { key: "SEARCHING_TEAM", label: t("statusSearchingTeam") },
  ];

  // Collect all unique tech stacks
  const allTechs = useMemo(() => {
    const techSet = new Set<string>();
    projects.forEach((p) => {
      p.techStack?.forEach((t: string) => techSet.add(t));
    });
    return Array.from(techSet).sort();
  }, [projects]);

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
      const matchTech = !activeTech || p.techStack?.includes(activeTech);
      return matchSearch && matchStatus && matchTech;
    });
  }, [projects, search, activeStatus, activeTech]);

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
      : "bg-gray-100 text-gray-700");

  const statusKey = (status: string) =>
    ({ RELEASED: "statusReleased", IN_PROGRESS: "statusInProgress", OPEN_SOURCE: "statusOpenSource", SEARCHING_TEAM: "statusSearchingTeam" } as Record<string, string>)[status] || "statusReleased";

  return (
    <div className="flex gap-6 items-start w-full">
      {/* LEFT: Project Cards */}
      <div className="flex-1 min-w-0">
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
                              onClick={(e) => { e.preventDefault(); setActiveTech(activeTech === tech ? "" : tech); }}
                              className={`cursor-pointer px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                                activeTech === tech
                                  ? "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300"
                                  : "bg-gray-100 text-gray-600 dark:bg-[#3A3B3C] dark:text-[#E4E6EB] hover:bg-purple-50 dark:hover:bg-purple-500/10"
                              }`}
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
        {/* Searchbar */}
        <div className="bg-white dark:bg-[#242526] rounded-xl border border-gray-100 dark:border-[#3A3B3C] shadow-sm p-4">
          <p className="text-[13px] font-bold text-gray-500 dark:text-[#B0B3B8] mb-2 uppercase tracking-wide">{tHub("searchTitle")}</p>
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

        {/* Status Filter */}
        <div className="bg-white dark:bg-[#242526] rounded-xl border border-gray-100 dark:border-[#3A3B3C] shadow-sm p-4">
          <p className="text-[13px] font-bold text-gray-500 dark:text-[#B0B3B8] mb-3 uppercase tracking-wide">{tHub("filterStatus")}</p>
          <div className="flex flex-col gap-1.5">
            {statusFilters.map((f) => (
              <button
                key={f.key}
                onClick={() => setActiveStatus(f.key)}
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

        {/* Tech Stack Filter */}
        {allTechs.length > 0 && (
          <div className="bg-white dark:bg-[#242526] rounded-xl border border-gray-100 dark:border-[#3A3B3C] shadow-sm p-4">
            <p className="text-[13px] font-bold text-gray-500 dark:text-[#B0B3B8] mb-3 uppercase tracking-wide">{tHub("filterTech")}</p>
            <div className="flex flex-wrap gap-1.5">
              {allTechs.map((tech) => (
                <button
                  key={tech}
                  onClick={() => setActiveTech(activeTech === tech ? "" : tech)}
                  className={`px-2.5 py-1 rounded-md text-[12px] font-medium transition-colors ${
                    activeTech === tech
                      ? "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300"
                      : "bg-gray-100 text-gray-600 dark:bg-[#3A3B3C] dark:text-[#E4E6EB] hover:bg-purple-50 dark:hover:bg-purple-500/10"
                  }`}
                >
                  {tech}
                </button>
              ))}
            </div>
            {activeTech && (
              <button onClick={() => setActiveTech("")} className="mt-2 text-[12px] text-purple-600 dark:text-purple-400 hover:underline">
                {tHub("clearTech")}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
