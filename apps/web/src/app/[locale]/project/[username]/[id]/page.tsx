"use client";

import React, { useEffect, useState, useCallback, use } from "react";
import { useTranslations } from "next-intl";
import { getProjectById } from "@/app/actions/projects";
import { getOptimizedUrl } from "@/utils/cloudinary";
import { getProfile } from "@/app/actions/profile";
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { useRef } from "react";
import Link from "next/link";
import { MediaRenderer } from "@/components/MediaRenderer";
import { notFound, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import FloatingUserMenu from "@/components/FloatingUserMenu";
import FloatingProjectHubBtn from "@/components/FloatingProjectHubBtn";



const ProjectGallery = ({ mediaUrls }: { mediaUrls: string[] }) => {
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number | null>(null);

  if (!mediaUrls || mediaUrls.length === 0) return null;

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedMediaIndex !== null) {
      setSelectedMediaIndex((selectedMediaIndex + 1) % mediaUrls.length);
    }
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedMediaIndex !== null) {
      setSelectedMediaIndex((selectedMediaIndex - 1 + mediaUrls.length) % mediaUrls.length);
    }
  };

  const renderGrid = () => {
    if (mediaUrls.length === 1) {
      return (
        <div onClick={() => setSelectedMediaIndex(0)} className="w-full aspect-video bg-black rounded-2xl md:rounded-3xl overflow-hidden mb-10 shadow-sm border border-gray-100 dark:border-[#3A3B3C] flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity">
          <MediaRenderer url={mediaUrls[0]} className="w-full h-full object-contain mx-auto" />
        </div>
      );
    }

    if (mediaUrls.length === 2) {
      return (
        <div className="grid grid-cols-2 gap-2 mb-10 aspect-[2/1]">
          {mediaUrls.map((url, i) => (
            <div key={i} onClick={() => setSelectedMediaIndex(i)} className="w-full h-full bg-black rounded-2xl md:rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-[#3A3B3C] flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity">
              <MediaRenderer url={url} className="w-full h-full object-cover mx-auto" />
            </div>
          ))}
        </div>
      );
    }

    if (mediaUrls.length === 3) {
      return (
        <div className="grid grid-cols-3 grid-rows-2 gap-2 mb-10 aspect-[2/1]">
          <div onClick={() => setSelectedMediaIndex(0)} className="col-span-2 row-span-2 bg-black rounded-2xl md:rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-[#3A3B3C] flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity">
            <MediaRenderer url={mediaUrls[0]} className="w-full h-full object-cover mx-auto" />
          </div>
          <div onClick={() => setSelectedMediaIndex(1)} className="col-span-1 row-span-1 bg-black rounded-2xl md:rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-[#3A3B3C] flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity">
            <MediaRenderer url={mediaUrls[1]} className="w-full h-full object-cover mx-auto" />
          </div>
          <div onClick={() => setSelectedMediaIndex(2)} className="col-span-1 row-span-1 bg-black rounded-2xl md:rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-[#3A3B3C] flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity">
            <MediaRenderer url={mediaUrls[2]} className="w-full h-full object-cover mx-auto" />
          </div>
        </div>
      );
    }

    if (mediaUrls.length === 4) {
      return (
        <div className="grid grid-cols-4 grid-rows-3 gap-2 mb-10 aspect-[2/1]">
          <div onClick={() => setSelectedMediaIndex(0)} className="col-span-3 row-span-3 bg-black rounded-2xl md:rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-[#3A3B3C] flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity">
            <MediaRenderer url={mediaUrls[0]} className="w-full h-full object-cover mx-auto" />
          </div>
          <div onClick={() => setSelectedMediaIndex(1)} className="col-span-1 row-span-1 bg-black rounded-2xl md:rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-[#3A3B3C] flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity">
            <MediaRenderer url={mediaUrls[1]} className="w-full h-full object-cover mx-auto" />
          </div>
          <div onClick={() => setSelectedMediaIndex(2)} className="col-span-1 row-span-1 bg-black rounded-2xl md:rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-[#3A3B3C] flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity">
            <MediaRenderer url={mediaUrls[2]} className="w-full h-full object-cover mx-auto" />
          </div>
          <div onClick={() => setSelectedMediaIndex(3)} className="col-span-1 row-span-1 bg-black rounded-2xl md:rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-[#3A3B3C] flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity">
            <MediaRenderer url={mediaUrls[3]} className="w-full h-full object-cover mx-auto" />
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-2 mb-10">
        <div onClick={() => setSelectedMediaIndex(0)} className="w-full aspect-[2/1] bg-black rounded-2xl md:rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-[#3A3B3C] flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity">
          <MediaRenderer url={mediaUrls[0]} className="w-full h-full object-contain mx-auto" />
        </div>
        <div className="grid grid-cols-4 gap-2 aspect-[4/1]">
          {mediaUrls.slice(1, 5).map((url, i) => (
            <div key={i} onClick={() => setSelectedMediaIndex(i + 1)} className="relative w-full h-full bg-black rounded-xl md:rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-[#3A3B3C] flex items-center justify-center cursor-pointer group">
              <MediaRenderer url={url} className="w-full h-full object-cover mx-auto group-hover:opacity-75 transition-opacity" />
              {i === 3 && mediaUrls.length > 5 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm transition-colors">
                  <span className="text-white font-bold text-xl md:text-2xl">+{mediaUrls.length - 5}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      {renderGrid()}

      {selectedMediaIndex !== null && (
        <div className="fixed inset-0 z-[9999] bg-black/95 flex flex-col justify-between items-center backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200" onClick={() => setSelectedMediaIndex(null)}>
          
          {/* Close Button */}
          <button 
            className="absolute top-6 right-6 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            onClick={(e) => { e.stopPropagation(); setSelectedMediaIndex(null); }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          {/* Main Viewer Area */}
          <div className="relative flex-1 w-full flex items-center justify-center px-12 md:px-24">
            {/* Prev Button */}
            {mediaUrls.length > 1 && (
              <button 
                className="absolute left-4 md:left-10 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                onClick={handlePrev}
              >
                <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
            )}

            {/* Current Image */}
            <div className="w-full max-w-6xl h-[75vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
              <MediaRenderer url={mediaUrls[selectedMediaIndex]} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
            </div>

            {/* Next Button */}
            {mediaUrls.length > 1 && (
              <button 
                className="absolute right-4 md:right-10 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                onClick={handleNext}
              >
                <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            )}
          </div>

          {/* Thumbnail Strip */}
          {mediaUrls.length > 1 && (
            <div className="w-full pb-8 pt-4 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-center px-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 snap-x max-w-full no-scrollbar">
                {mediaUrls.map((url, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setSelectedMediaIndex(idx)}
                    className={`relative w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-lg overflow-hidden snap-center transition-all duration-200 ${selectedMediaIndex === idx ? 'ring-2 ring-purple-500 scale-110 opacity-100 z-10' : 'opacity-50 hover:opacity-100'}`}
                  >
                    <MediaRenderer url={url} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

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
  
  const [commentInput, setCommentInput] = useState("");
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  
  const [isCollabModalOpen, setIsCollabModalOpen] = useState(false);
  const [collabMessage, setCollabMessage] = useState("");
  const [isCollabMessageSent, setIsCollabMessageSent] = useState(false);


  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const userId = payload.sub || payload.id || payload._id || payload.userId || "1";
        setUser({ id: userId, username: payload.username || "Guest" });
        getProfile(userId).then(res => {
          if (res?.success && res?.profile) {
            setUser((prev: any) => ({ ...prev, profile: res.profile }));
          }
        });
      } catch (e) {
        console.error("Invalid token");
      }
    }
  }, []);


  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setIsEmojiPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
    if (res.project.user?.username?.toLowerCase() !== decodedUsername.toLowerCase()) {
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

  useEffect(() => {
    if (!isLoading && window.location.hash === '#comments') {
      // Need a slight delay to allow browser to finish painting the new DOM
      const timer = setTimeout(() => {
        const el = document.getElementById('comments');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#F0F2F5] dark:bg-[#18191A] pt-20 pb-10">
        <div className="max-w-[900px] mx-auto w-full px-4 animate-pulse">
          <div className="w-48 h-6 bg-gray-300 dark:bg-[#3A3B3C] rounded mb-6"></div>
          <div className="w-full aspect-[16/9] md:aspect-[21/9] bg-gray-300 dark:bg-[#3A3B3C] rounded-2xl mb-10"></div>
          <div className="flex flex-col gap-6 border-b border-gray-200 dark:border-[#3A3B3C] pb-8">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <div className="w-3/4 h-10 bg-gray-300 dark:bg-[#3A3B3C] rounded-lg mb-4"></div>
                <div className="flex gap-2">
                  <div className="w-20 h-8 bg-gray-300 dark:bg-[#3A3B3C] rounded-full"></div>
                  <div className="w-24 h-8 bg-gray-300 dark:bg-[#3A3B3C] rounded-full"></div>
                </div>
              </div>
              <div className="w-12 h-12 bg-gray-300 dark:bg-[#3A3B3C] rounded-full shrink-0"></div>
            </div>
          </div>
          <div className="mt-8 flex flex-col gap-4">
             <div className="w-full h-4 bg-gray-300 dark:bg-[#3A3B3C] rounded"></div>
             <div className="w-full h-4 bg-gray-300 dark:bg-[#3A3B3C] rounded"></div>
             <div className="w-5/6 h-4 bg-gray-300 dark:bg-[#3A3B3C] rounded"></div>
          </div>
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
      <FloatingProjectHubBtn 
        customHref={`/${locale}/project/${decodedUsername}`}
        customText={`${displayName}'s Projects`}
      />
      <FloatingUserMenu isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
      <div className="max-w-[900px] mx-auto w-full px-4">
        
        {/* Main Media Gallery */}
        <ProjectGallery mediaUrls={p.mediaUrls?.length ? p.mediaUrls : p.coverUrls || []} />

        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-6 border-b border-gray-200 dark:border-[#3A3B3C] pb-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-[#E4E6EB]">{p.title}</h1>
              <div className="flex flex-wrap items-center gap-2">
                {p.category && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[13px] font-medium bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20">
                    {p.category === "OTHER" ? p.customCategory : t(`cat_${p.category}` as any)}
                  </span>
                )}
                {p.isForSale && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[13px] font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    FOR SALE
                  </span>
                )}
              </div>
            </div>
              <span className={
                "shrink-0 px-2.5 py-1 rounded-md text-[13px] font-semibold " +
                (p.status === "RELEASED" ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400" :
                p.status === "IN_PROGRESS" ? "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400" :
                p.status === "OPEN_SOURCE" ? "bg-white dark:bg-[#242526] text-gray-700 dark:text-gray-300 border border-dashed border-gray-400 dark:border-gray-500" :
                p.status === "SEARCHING_TEAM" ? "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300" :
                "bg-gray-100 text-gray-700")
              }>
                {t(statusKey)}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
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
              
              <div className="flex items-center gap-3 bg-white dark:bg-[#242526] px-5 py-2.5 rounded-full shadow-sm border border-gray-100 dark:border-[#3A3B3C]">
                <button className="flex items-center gap-2 text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 font-semibold transition-colors text-[14px]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
                  <span>{p._count?.likes || 0}</span>
                </button>
                <div className="w-px h-5 bg-gray-200 dark:bg-[#4E4F50]"></div>
                <button onClick={() => document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth' })} className="flex items-center gap-2 text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 font-semibold transition-colors text-[14px]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                  <span>{p._count?.comments || 0}</span>
                </button>
                <div className="w-px h-5 bg-gray-200 dark:bg-[#4E4F50]"></div>
                <button className="flex items-center gap-2 text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 font-semibold transition-colors text-[14px]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                  {t("share") || "Share"}
                </button>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-[#E4E6EB] mb-4">{t("aboutProject") || "About this Project"}</h3>
            <p className="text-gray-700 dark:text-[#B0B3B8] text-[16px] leading-relaxed whitespace-pre-line">
              {p.description}
            </p>
          </div>

          {p.roleNeeded && p.status === "SEARCHING_TEAM" && (
            <div className="p-5 bg-purple-50 dark:bg-purple-500/10 rounded-2xl border border-purple-100 dark:border-purple-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-[16px] font-bold text-purple-800 dark:text-purple-300 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  {t("roleNeeded")}
                </h3>
                <p className="text-purple-700 dark:text-purple-400 text-[15px]">
                  {p.roleNeeded}
                </p>
              </div>
              <button 
                onClick={() => {
                  setCollabMessage(t("collabMessageDefault") || "Halo, saya tertarik untuk berkolaborasi dalam project ini.");
                  setIsCollabMessageSent(false);
                  setIsCollabModalOpen(true);
                }}
                className="shrink-0 flex items-center justify-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors shadow-sm shadow-purple-200 dark:shadow-none"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                {t("sendMessage") || "Kirim pesan"}
              </button>
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
          
          <hr className="border-gray-200 dark:border-[#3A3B3C] my-8" />
          
          {/* Comments Section */}
          <div id="comments" className="pt-2 pb-10">
            <div className="flex flex-col lg:flex-row gap-8">
              
              {/* Left Column (Comments) */}
              <div className="flex-1 lg:max-w-[60%] border border-gray-200 dark:border-[#3A3B3C] rounded-2xl bg-white dark:bg-[#242526] flex flex-col resize-y overflow-hidden min-h-[500px] pb-1">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-[#3A3B3C] bg-gray-50 dark:bg-[#1f2021] rounded-t-2xl">
                  <h3 className="text-[17px] font-bold text-gray-900 dark:text-[#E4E6EB] flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
                    {t("comments") || "Comments"} <span className="text-gray-500 dark:text-[#B0B3B8] font-medium">({p._count?.comments || 0})</span>
                  </h3>
                </div>

                {/* Comments List (Empty for now) */}
                <div className="p-4 flex-1 min-h-[250px] flex flex-col items-center justify-center text-center">
                  <div className="w-14 h-14 bg-gray-100 dark:bg-[#3A3B3C] rounded-full flex items-center justify-center mb-4 text-gray-400 dark:text-[#B0B3B8]">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                  </div>
                  <p className="text-gray-500 dark:text-[#B0B3B8] font-medium text-[15px] max-w-[250px] leading-relaxed">
                    {t("noCommentsYet") || "No comments yet. Be the first to share your thoughts!"}
                  </p>
                </div>

                {/* Comment Input */}
                <div className="p-4 border-t border-gray-200 dark:border-[#3A3B3C] bg-white dark:bg-[#242526] rounded-b-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 shrink-0 rounded-full bg-gray-200 dark:bg-[#3A3B3C] flex items-center justify-center text-gray-500 dark:text-gray-400 font-bold overflow-hidden shadow-sm">
                      {user?.profile?.avatarUrl ? (
                        <img src={getOptimizedUrl(user.profile.avatarUrl, 'thumb')} alt="You" className="w-full h-full object-cover" />
                      ) : (
                        <span>{user?.username?.[0]?.toUpperCase() || "?"}</span>
                      )}
                    </div>
                    <div className="flex-1 bg-gray-100 dark:bg-[#3A3B3C] rounded-xl flex items-end px-4 py-2 border border-transparent focus-within:border-purple-300 dark:focus-within:border-purple-500/50 transition-colors">
                      <div className="relative flex items-center mb-1" ref={emojiPickerRef}>
                        <button 
                          onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                          className="text-gray-400 hover:text-purple-500 dark:hover:text-purple-400 transition-colors shrink-0 p-1"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </button>
                        {isEmojiPickerOpen && (
                          <div className="absolute bottom-12 left-0 z-50">
                            <Picker 
                              data={data} 
                              onEmojiSelect={(emoji: any) => setCommentInput(prev => prev + emoji.native)} 
                              theme={isDarkMode ? 'dark' : 'light'} 
                            />
                          </div>
                        )}
                      </div>
                      <textarea 
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        placeholder={t("writeComment") || "Write a comment..."} 
                        rows={1}
                        className="flex-1 bg-transparent border-none focus:outline-none text-[14px] text-gray-900 dark:text-[#E4E6EB] placeholder-gray-500 px-3 py-1.5 resize-y min-h-[36px] max-h-[200px]"
                      />
                      <button className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-bold text-[14px] px-2 py-1 mb-1 transition-colors shrink-0">
                        <svg className="w-5 h-5 rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column (Profile CTA) */}
              <div className="w-full lg:w-[40%] shrink-0">
                <div className="sticky top-24 flex flex-col items-center text-center">
                  {avatar ? (
                    <img src={avatar} alt={displayName} className="w-24 h-24 rounded-full object-cover shadow-sm ring-4 ring-white dark:ring-[#18191A] mb-4" />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-[#3A3B3C] flex items-center justify-center text-gray-500 dark:text-gray-400 font-bold text-3xl ring-4 ring-white dark:ring-[#18191A] mb-4">
                      {displayName[0].toUpperCase()}
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-gray-900 dark:text-[#E4E6EB] leading-tight">
                    {displayName}
                  </h3>
                  <p className="text-[15px] text-gray-500 dark:text-[#B0B3B8] mt-1 mb-6">
                    @{profileUser.username}
                  </p>
                  
                  <div className="flex flex-col gap-3 w-full max-w-[280px]">
                    <Link href={`/${locale}/p/${profileUser.username}/${profileUser.id}`} className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-center text-[15px] transition-all hover:-translate-y-0.5 shadow-sm shadow-purple-200 dark:shadow-none">
                      {t("viewProfile") || "Lihat Profil"}
                    </Link>
                    <Link href={`/${locale}/project/${profileUser.username}`} className="w-full py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-[#3A3B3C] dark:hover:bg-[#4E4F50] text-gray-800 dark:text-[#E4E6EB] font-bold rounded-xl text-[14px] text-center transition-colors">
                      {t("viewOtherProjects") || "Project Lain"}
                    </Link>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <div className="mt-20 flex justify-center pb-8">
        <img src="/logo-horizontal.png" alt="Mencari" className="h-16 grayscale opacity-50 dark:opacity-40" />
      </div>

      {/* Collaboration Message Modal */}
      {isCollabModalOpen && (
        <div className="fixed inset-0 z-[99999] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#242526] w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            {!isCollabMessageSent && (
              <div className="p-4 border-b border-gray-100 dark:border-[#3A3B3C] flex justify-between items-center bg-gray-50 dark:bg-[#1f2021]">
                <h3 className="font-bold text-gray-900 dark:text-[#E4E6EB]">{t("sendCollabTitle") || "Kirim Pesan Kolaborasi"}</h3>
                <button onClick={() => setIsCollabModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            )}
            
            <div className="p-5">
              {!isCollabMessageSent ? (
                <>
                  <p className="text-[14px] text-gray-600 dark:text-gray-400 mb-4">
                    Kirim pesan ke <span className="font-bold text-gray-900 dark:text-gray-200">@{profileUser.username}</span> terkait project <span className="font-bold">"{p.title}"</span>.
                  </p>
                  <textarea 
                    value={collabMessage}
                    onChange={(e) => setCollabMessage(e.target.value)}
                    className="w-full bg-gray-100 dark:bg-[#3A3B3C] border-none rounded-xl p-3 text-[14px] text-gray-900 dark:text-[#E4E6EB] focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-y min-h-[100px]"
                    placeholder="Tulis pesan Anda disini..."
                  />
                  <div className="mt-5 flex justify-end gap-3">
                    <button 
                      onClick={() => setIsCollabModalOpen(false)}
                      className="px-4 py-2 font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#3A3B3C] rounded-xl transition-colors"
                    >
                      Batal
                    </button>
                    <button 
                      onClick={() => {
                        // TODO: Implement actual chat API call here
                        setIsCollabMessageSent(true);
                      }}
                      className="px-4 py-2 font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors shadow-sm"
                    >
                      {t("send") || "Kirim"}
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-6 animate-in slide-in-from-right-4 duration-300">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <h4 className="font-bold text-gray-900 dark:text-[#E4E6EB] mb-2">
                    {(t("messageSentSuccess") || "Pesan Anda terkirim. Pemilik project akan segera menghubungi Anda.").split('. ').map((str: string, idx: number, arr: string[]) => (
                      <span key={idx} className={idx === 0 ? "text-xl block mb-1" : "text-[15px]"}>
                        {str}{idx < arr.length - 1 ? '.' : ''}
                      </span>
                    ))}
                  </h4>
                  <p className="text-[14px] text-gray-500 dark:text-gray-400 mb-8 mt-1">
                    {t("messageSentSubtext") || "Cek menu obrolan secara berkala"}
                  </p>
                  <div className="flex w-full max-w-[320px] gap-2">
                    <button 
                      onClick={() => alert("Redirecting to Chat...")}
                      className="basis-[40%] px-2 py-2 font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 dark:text-gray-200 dark:bg-[#3A3B3C] dark:hover:bg-[#4E4F50] rounded-xl transition-colors shadow-sm text-[14px]"
                    >
                      {t("openChat") || "Buka pesan"}
                    </button>
                    <button 
                      onClick={() => setIsCollabModalOpen(false)}
                      className="basis-[60%] px-4 py-2 font-bold text-white bg-green-600 hover:bg-green-700 rounded-xl transition-colors shadow-sm"
                    >
                      {t("viewProject") || "Lihat project"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
