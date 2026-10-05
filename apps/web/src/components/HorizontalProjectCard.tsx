"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { MediaRenderer } from "@/components/MediaRenderer";
import { CATEGORY_COLORS, getCategoryBadgeClasses } from "@/components/ProjectCard";

interface HorizontalProjectCardProps {
  project: any;
  locale: string;
  username: string;
  isOwnProfile?: boolean;
  onEdit?: (project: any) => void;
  onDelete?: (project: any) => void;
}

export default function HorizontalProjectCard({
  project: p,
  locale,
  username,
  isOwnProfile,
  onEdit,
  onDelete,
}: HorizontalProjectCardProps) {
  const router = useRouter();
  const tProject = useTranslations("project");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const coverUrls = (p.coverUrls && p.coverUrls.length > 0) ? p.coverUrls : (p.mediaUrls && p.mediaUrls.length > 0 ? p.mediaUrls : []);
  const cover = coverUrls[0];
  const projectOwner = p.user?.username || username;
  const displayName = p.user?.profile?.displayName || projectOwner;
  const avatarUrl = p.user?.profile?.avatarUrl;

  const statusBadgeClass = (status: string) =>
    "shrink-0 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider " +
    (status === "RELEASED"
      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      : status === "IN_PROGRESS"
        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
        : status === "OPEN_SOURCE"
          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
          : status === "SEARCHING_TEAM"
            ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
            : status === "HIATUS"
              ? "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"
              : "bg-gray-100 text-gray-700");

  const statusKey = ({ RELEASED: "statusReleased", IN_PROGRESS: "statusInProgress", OPEN_SOURCE: "statusOpenSource", SEARCHING_TEAM: "statusSearchingTeam", HIATUS: "statusHiatus" } as Record<string, string>)[p.status] || "statusReleased";

  return (
    <div className="bg-white dark:bg-[#242526] rounded-[20px] shadow-sm border border-gray-100 dark:border-[#3A3B3C] overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5 flex flex-col md:flex-row min-h-[180px] group/card relative">
      {cover ? (
        <div 
          onClick={() => router.push(`/${locale}/project/${projectOwner}/${p.id}`)}
          className="w-full md:w-[200px] md:shrink-0 aspect-video md:aspect-auto relative z-0 cursor-pointer"
        >
          <MediaRenderer url={cover} className="absolute inset-0 w-full h-full object-cover bg-gray-100 dark:bg-[#3A3B3C]" />
        </div>
      ) : (
        <div 
          onClick={() => router.push(`/${locale}/project/${projectOwner}/${p.id}`)}
          className="w-full md:w-[200px] md:shrink-0 aspect-video md:aspect-auto bg-gray-100 dark:bg-[#3A3B3C] flex items-center justify-center text-gray-400 cursor-pointer"
        >
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}

      <div className="p-5 flex flex-col flex-grow relative z-10 w-full min-w-0">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <Link
              href={`/${locale}/project/${projectOwner}/${p.id}`}
              className="text-gray-900 dark:text-[#E4E6EB] font-bold text-[17px] line-clamp-2 after:absolute after:inset-0 after:z-0 hover:text-purple-600 dark:hover:text-purple-400"
            >
              {p.title}
            </Link>
            <div className="flex flex-row items-center gap-2 mt-1.5 relative z-10 w-full overflow-hidden">
              {p.category && (
                <span className={`${getCategoryBadgeClasses(CATEGORY_COLORS[p.category] || "blue")} shrink-0`}>
                  {p.category === "OTHER" ? p.customCategory : tProject(`cat_${p.category}` as any)}
                </span>
              )}
              {p.isForSale && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm shrink-0">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  FOR SALE
                </span>
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2 relative z-10 shrink-0 mt-0.5">
            <span className={statusBadgeClass(p.status)}>
              {tProject(statusKey)}
            </span>
            {isOwnProfile && (
              <div className="relative">
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsMenuOpen(!isMenuOpen);
                  }}
                  className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#4E4F50] text-gray-500 dark:text-gray-400 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                </button>
                
                {isMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsMenuOpen(false);
                      }}
                    />
                    <div 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-[#3A3B3C] rounded-xl shadow-lg border border-gray-100 dark:border-[#4E4F50] py-1 z-50 overflow-hidden"
                    >
                      <button 
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-[#E4E6EB] hover:bg-gray-50 dark:hover:bg-[#4E4F50] flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        {tProject("publish")}
                      </button>
                      <button 
                        onClick={() => {
                          if (onEdit) onEdit(p);
                          setIsMenuOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-[#E4E6EB] hover:bg-gray-50 dark:hover:bg-[#4E4F50] flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        {tProject("editProject")}
                      </button>
                      <div className="h-px bg-gray-100 dark:bg-[#4E4F50] my-1" />
                      <button 
                        onClick={() => {
                          if (onDelete) onDelete(p);
                          setIsMenuOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2 font-medium"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        {tProject("deleteProject")}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <p className="text-gray-600 dark:text-[#B0B3B8] text-[13px] whitespace-pre-line line-clamp-3 mb-4 flex-grow relative z-10">
          {p.description}
        </p>

        <div className="mt-auto relative z-10">
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

          <div className="flex items-center justify-end pt-3 border-t border-gray-100 dark:border-[#3A3B3C]">
            <div className="flex items-center gap-3.5 relative z-10" onClick={(e) => e.stopPropagation()}>
              <button className="flex items-center gap-1.5 text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors font-medium text-[13px]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
                {tProject("like")} <span className="ml-0.5 text-gray-400 dark:text-gray-500">{p._count?.likes || 0}</span>
              </button>
              <Link href={`/${locale}/project/${projectOwner}/${p.id}#comments`} className="flex items-center gap-1.5 text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors font-medium text-[13px]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                {tProject("comment")} <span className="ml-0.5 text-gray-400 dark:text-gray-500">{p._count?.comments || 0}</span>
              </Link>
              <button className="flex items-center gap-1.5 text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors font-medium text-[13px]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                {tProject("share")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
