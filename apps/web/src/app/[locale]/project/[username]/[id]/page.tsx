"use client";

import React, { useEffect, useState, useCallback, use } from "react";
import { useTranslations } from "next-intl";
import { getProjectById } from "@/app/actions/projects";
import { getOptimizedUrl } from "@/utils/cloudinary";
import Link from "next/link";
import { MediaRenderer } from "@/components/MediaRenderer";
import { notFound, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function ProjectDetailsPage({
  params,
}: {
  params: Promise<{ locale: string; username: string; id: string }>;
}) {
  const { locale, username, id } = use(params);
  const decodedUsername = decodeURIComponent(username);
  const t = useTranslations("project");
  const router = useRouter();
  
  const [project, setProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [themeLoaded, setThemeLoaded] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const userId = payload.sub || payload.id || payload._id || payload.userId || "1";
        setUser({ id: userId, username: payload.username || "Guest" });
      } catch (e) {
        console.error("Invalid token");
      }
    }
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
    } else {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
    setThemeLoaded(true);
  }, []);

  useEffect(() => {
    if (!themeLoaded) return;
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode, themeLoaded]);



  const loadProject = useCallback(async () => {
    const res = await getProjectById(id);
    if (!res.success || !res.project) {
      router.push(`/${locale}/404`);
      return;
    }
    
    // Security check
    if (res.project.user?.username !== decodedUsername) {
      router.push(`/${locale}/404`);
      return;
    }

    setProject(res.project);
    setIsLoading(false);
  }, [id, decodedUsername, locale, router]);

  useEffect(() => {
    loadProject();
    const handleRefresh = () => {
      loadProject();
    };
    window.addEventListener("refresh_projects", handleRefresh);
    return () => {
      window.removeEventListener("refresh_projects", handleRefresh);
    };
  }, [loadProject]);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#F0F2F5] dark:bg-[#18191A] pt-20 pb-10">
        <div className="max-w-[1200px] mx-auto w-full px-4 flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!project) return null;

  const p = project;
  const profileUser = p.user;
  const displayName = profileUser.profile?.displayName || profileUser.username;
  const avatar = profileUser.profile?.avatarUrl ? getOptimizedUrl(profileUser.profile.avatarUrl, 'thumb') : null;
  const statusKey = ({ RELEASED: "statusReleased", IN_PROGRESS: "statusInProgress", OPEN_SOURCE: "statusOpenSource", SEARCHING_TEAM: "statusSearchingTeam" } as Record<string, string>)[p.status] || "statusReleased";

  return (
    <div className="flex flex-col min-h-screen bg-[#F0F2F5] dark:bg-[#18191A] pt-20 pb-20">
      <div className="max-w-[900px] mx-auto w-full px-4">
        
        <Link href={`/${locale}/project/${decodedUsername}`} className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 font-semibold mb-6 hover:underline">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          {t("backToProjects", { name: displayName }) || `Back to ${displayName}'s Projects`}
        </Link>

        {/* Main Media Carousel / Cover */}
        {p.mediaUrls && p.mediaUrls.length > 0 ? (
          <div className="w-full aspect-video bg-black rounded-2xl md:rounded-3xl overflow-hidden mb-10 shadow-sm border border-gray-100 dark:border-[#3A3B3C] flex items-center justify-center">
            <MediaRenderer url={p.mediaUrls[0]} className="w-full h-full object-contain mx-auto" />
          </div>
        ) : p.coverUrls && p.coverUrls.length > 0 ? (
          <div className="w-full aspect-video bg-black rounded-2xl md:rounded-3xl overflow-hidden mb-10 shadow-sm border border-gray-100 dark:border-[#3A3B3C] flex items-center justify-center">
            <img src={getOptimizedUrl(p.coverUrls[0], 'preview')} alt={p.title} className="w-full h-full object-contain mx-auto" />
          </div>
        ) : null}

        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-6 border-b border-gray-200 dark:border-[#3A3B3C] pb-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-[#E4E6EB]">{p.title}</h1>
              <span className={
                "px-4 py-1.5 rounded-full text-[13px] font-bold " +
                (p.status === "RELEASED" ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400" :
                p.status === "IN_PROGRESS" ? "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400" :
                p.status === "OPEN_SOURCE" ? "bg-white dark:bg-[#242526] text-gray-700 dark:text-gray-300 border border-dashed border-gray-400 dark:border-gray-500" :
                p.status === "SEARCHING_TEAM" ? "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300" :
                "bg-gray-100 text-gray-700")
              }>
                {t(statusKey)}
              </span>
            </div>

            <Link href={`/${locale}/p/${profileUser.username}/${profileUser.id}`} className="flex items-center gap-4 group w-fit">
              {avatar ? (
                <img src={avatar} alt={displayName} className="w-14 h-14 rounded-full object-cover shadow-sm" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-[#3A3B3C] flex items-center justify-center text-gray-500 dark:text-gray-400 font-bold text-xl">
                  {displayName[0].toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="text-[16px] font-bold text-gray-900 dark:text-[#E4E6EB] group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {displayName}
                </h3>
                <p className="text-[14px] text-gray-500 dark:text-[#B0B3B8]">
                  @{profileUser.username}
                </p>
              </div>
            </Link>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-[#E4E6EB] mb-4">{t("aboutProject") || "About this Project"}</h3>
            <p className="text-gray-700 dark:text-[#B0B3B8] text-[16px] leading-relaxed whitespace-pre-line">
              {p.description}
            </p>
          </div>

          {p.roleNeeded && p.status === "SEARCHING_TEAM" && (
            <div className="p-5 bg-purple-50 dark:bg-purple-500/10 rounded-2xl border border-purple-100 dark:border-purple-500/20">
              <h3 className="text-[16px] font-bold text-purple-800 dark:text-purple-300 mb-2 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                {t("roleNeeded")}
              </h3>
              <p className="text-purple-700 dark:text-purple-400 text-[15px]">
                {p.roleNeeded}
              </p>
            </div>
          )}

          {p.techStack && p.techStack.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-[#E4E6EB] mb-4">{t("technologies") || "Technologies"}</h3>
              <div className="flex flex-wrap gap-2">
                {p.techStack.map((tech: string) => (
                  <span key={tech} className="px-4 py-2 rounded-xl text-[14px] font-semibold bg-gray-200 text-gray-800 dark:bg-[#3A3B3C] dark:text-[#E4E6EB]">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {(p.repoUrl || p.demoUrl) && (
            <div className="flex flex-wrap items-center gap-4 pt-4">
              {p.repoUrl && (
                <a href={p.repoUrl} target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
                  {t("viewRepo")}
                </a>
              )}
              {p.demoUrl && (
                <a href={p.demoUrl} target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors flex items-center gap-2 shadow-sm shadow-purple-200 dark:shadow-none">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  {t("viewDemo")}
                </a>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
