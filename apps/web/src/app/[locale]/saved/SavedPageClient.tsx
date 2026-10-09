"use client";
import NProgress from "nprogress";


import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { createFolder, getUserFolders, getRootItems } from "@/app/actions/folders";
import { useUser } from "@/contexts/UserContext";
import { foldersCache, rootItemsCache } from "@/utils/cache";
import PostCard from "@/components/PostCard";
import HorizontalProjectCard from "@/components/HorizontalProjectCard";

const activeFetches = new Map<string, Promise<any>>();

export default function SavedPageClient() {
  const t = useTranslations("savedPage");
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || "id";
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  
  const [collections, setCollections] = useState<any[]>([]);
  const [rootItems, setRootItems] = useState<any[]>([]);
  const { currentUser: user } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [isRootLoading, setIsRootLoading] = useState(true);

  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.id) {
      if (foldersCache.has(user.id)) {
        setCollections(foldersCache.get(user.id));
        setIsLoading(false);
      } else {
        setIsLoading(true);
      }
      if (rootItemsCache.has(user.id)) {
        setRootItems(rootItemsCache.get(user.id));
        setIsRootLoading(false);
      } else {
        setIsRootLoading(true);
      }
      fetchFolders(user.id);
      fetchRootItems(user.id);
    }
  }, [user?.id]);

  const fetchFolders = async (userId: string) => {
    const key = `folders_${userId}`;
    let promise = activeFetches.get(key);

    if (!promise) {
      promise = getUserFolders(userId);
      activeFetches.set(key, promise);
      promise.finally(() => activeFetches.delete(key));
    }

    try {
      const res = await promise;
      if (res.success && res.folders) {
        foldersCache.set(userId, res.folders);
        setCollections(res.folders);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRootItems = async (userId: string) => {
    const key = `rootItems_${userId}`;
    let promise = activeFetches.get(key);

    if (!promise) {
      promise = getRootItems(userId);
      activeFetches.set(key, promise);
      promise.finally(() => activeFetches.delete(key));
    }

    try {
      const res = await promise;
      if (res.success && res.items) {
        rootItemsCache.set(userId, res.items);
        setRootItems(res.items);
      }
    } finally {
      setIsRootLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!user || !formName.trim()) return;
    setIsSubmitting(true);
    const res = await createFolder(user.id, formName, formDesc);
    if (res.success) {
      setIsModalOpen(false);
      setFormName("");
      setFormDesc("");
      fetchFolders(user.id); // Refresh
    }
    setIsSubmitting(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-[#3A3B3C] pb-4">
        {/* Toggle Layout */}
        <div className="flex bg-white dark:bg-[#242526] rounded-lg border border-gray-200 dark:border-[#3A3B3C] p-1">
          <button 
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-md transition-all ${viewMode === "grid" ? "bg-gray-100 dark:bg-[#3A3B3C] shadow-sm text-[#0866FF] dark:text-[#E4E6EB]" : "text-gray-500 dark:text-[#B0B3B8] opacity-60 hover:opacity-100"}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
          </button>
          <button 
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded-md transition-all ${viewMode === "list" ? "bg-gray-100 dark:bg-[#3A3B3C] shadow-sm text-[#0866FF] dark:text-[#E4E6EB]" : "text-gray-500 dark:text-[#B0B3B8] opacity-60 hover:opacity-100"}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
          </button>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-[#0866FF] hover:bg-blue-600 text-white rounded-lg font-medium text-sm transition-colors"
        >
          + {t("createCollection")}
        </button>
      </div>

      {isLoading ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white dark:bg-[#242526] p-4 rounded-xl border border-gray-200 dark:border-[#3A3B3C] flex items-center gap-4 animate-pulse">
                <div className="w-12 h-12 bg-gray-200 dark:bg-[#3A3B3C] rounded-lg flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <div className="h-5 bg-gray-200 dark:bg-[#3A3B3C] rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-[#3A3B3C] rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full text-left">
            <div className="grid grid-cols-12 gap-4 items-center pb-3 mb-2 px-2 border-b border-gray-200 dark:border-[#3A3B3C]">
              <div className="col-span-11 sm:col-span-5 lg:col-span-5"><div className="h-4 bg-gray-200 dark:bg-[#3A3B3C] rounded w-1/3"></div></div>
              <div className="hidden md:block md:col-span-3 lg:col-span-2"><div className="h-4 bg-gray-200 dark:bg-[#3A3B3C] rounded w-2/3"></div></div>
              <div className="hidden sm:block sm:col-span-3 lg:col-span-2"><div className="h-4 bg-gray-200 dark:bg-[#3A3B3C] rounded w-2/3"></div></div>
              <div className="hidden lg:block lg:col-span-2 flex justify-center"><div className="h-4 bg-gray-200 dark:bg-[#3A3B3C] rounded w-1/2 mx-auto"></div></div>
            </div>
            <div className="flex flex-col">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="grid grid-cols-12 gap-4 items-center py-3 px-2 border-b border-gray-100 dark:border-[#3A3B3C]/50 animate-pulse">
                  <div className="col-span-11 sm:col-span-5 lg:col-span-5 flex items-center gap-4 pr-4">
                    <div className="w-6 h-6 bg-gray-200 dark:bg-[#3A3B3C] rounded flex-shrink-0"></div>
                    <div className="h-5 bg-gray-200 dark:bg-[#3A3B3C] rounded w-3/4"></div>
                  </div>
                  <div className="hidden md:flex md:col-span-3 lg:col-span-2 items-center gap-2">
                    <div className="w-6 h-6 bg-gray-200 dark:bg-[#3A3B3C] rounded-full shrink-0"></div>
                    <div className="h-4 bg-gray-200 dark:bg-[#3A3B3C] rounded w-1/2"></div>
                  </div>
                  <div className="hidden sm:block sm:col-span-3 lg:col-span-2">
                    <div className="h-4 bg-gray-200 dark:bg-[#3A3B3C] rounded w-3/4"></div>
                  </div>
                  <div className="hidden lg:flex lg:col-span-2 justify-center">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map(j => <div key={j} className="w-6 h-6 rounded-full ring-2 ring-white dark:ring-[#242526] bg-gray-200 dark:bg-[#3A3B3C]"></div>)}
                    </div>
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <div className="w-4 h-4 bg-gray-200 dark:bg-[#3A3B3C] rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      ) : collections.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#242526] rounded-2xl border border-gray-100 dark:border-[#3A3B3C]">
          <div className="w-24 h-24 mb-4 opacity-50">
            <img src="/add-folder.svg" alt="Add Folder" className="w-full h-full dark:invert" />
          </div>
          <p className="text-gray-500 dark:text-[#B0B3B8] text-lg font-medium">
            {t("emptyState")}
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 text-[#0866FF] font-medium hover:underline text-sm"
          >
            {t("createCollection")}
          </button>
        </div>
      ) : (
        <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : "w-full text-left"}>
          {viewMode === "list" && (
            <div className="grid grid-cols-12 gap-4 items-center text-sm font-semibold text-gray-500 dark:text-[#B0B3B8] border-b border-gray-200 dark:border-[#3A3B3C] pb-3 mb-2 px-2">
              <div 
                className="col-span-11 sm:col-span-5 lg:col-span-5 flex items-center gap-2 cursor-pointer hover:text-gray-700 dark:hover:text-[#E4E6EB] transition-colors select-none"
                onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
              >
                Nama
                <div className={`bg-[#0866FF] text-white rounded-full p-0.5 transition-transform duration-200 ${sortOrder === "desc" ? "rotate-180" : ""}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 19V5M5 12l7-7 7 7"/>
                  </svg>
                </div>
              </div>
              <div className="hidden md:block md:col-span-3 lg:col-span-2">Pemilik</div>
              <div className="hidden sm:block sm:col-span-3 lg:col-span-2">Tanggal diubah</div>
              <div className="hidden lg:block lg:col-span-2 text-center">Member</div>
              <div className="col-span-1"></div>
            </div>
          )}
          <div className={viewMode === "list" ? "flex flex-col" : "contents"}>
            {[...collections]
              .sort((a, b) => sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name))
              .map(folder => (
              viewMode === "grid" ? (
                <div key={folder.id} onClick={() => { NProgress.start(); router.push(`/${locale}/saved/${folder.id}`); }} className="bg-white dark:bg-[#242526] p-4 rounded-xl border-2 border-gray-900 dark:border-[#555] shadow-[6px_6px_0px_0px_rgba(17,24,39,1)] dark:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-[2px_2px_0px_0px_rgba(17,24,39,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer flex items-center gap-4 relative group">
                  <div className="w-12 h-12 flex-shrink-0 opacity-80">
                    <img src={folder.members?.length > 1 ? "/folder-share.svg" : "/folder-lock.svg"} alt="Folder Icon" className="w-full h-full dark:invert" />
                  </div>
                  <div className="flex-1 min-w-0 pr-6">
                    <h3 className="font-bold text-gray-900 dark:text-[#E4E6EB] truncate">{folder.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-[#B0B3B8] truncate">
                      {(folder._count?.savedPosts || 0) + (folder._count?.savedProjects || 0)} Items
                    </p>
                  </div>
                  
                  <div className="absolute right-4 flex justify-end relative group/menu">
                    <button onClick={(e) => e.stopPropagation()} className="p-1 text-gray-500 hover:text-gray-900 dark:text-[#B0B3B8] dark:hover:text-[#E4E6EB] rounded-full hover:bg-gray-200 dark:hover:bg-[#3A3B3C] transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="1"></circle>
                        <circle cx="12" cy="5" r="1"></circle>
                        <circle cx="12" cy="19" r="1"></circle>
                      </svg>
                    </button>
                    {/* Dropdown Menu */}
                    <div onClick={(e) => e.stopPropagation()} className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-[#242526] rounded-xl shadow-lg border border-gray-100 dark:border-[#3A3B3C] py-1 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-10">
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-[#E4E6EB] hover:bg-gray-100 dark:hover:bg-[#3A3B3C] flex items-center gap-2 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                        {t("rename") || "Ganti Nama"}
                      </button>
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-[#E4E6EB] hover:bg-gray-100 dark:hover:bg-[#3A3B3C] flex items-center gap-2 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                        {t("pin") || "Sematkan"}
                      </button>
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-[#E4E6EB] hover:bg-gray-100 dark:hover:bg-[#3A3B3C] flex items-center gap-2 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
                        {t("allowUser") || "Allow user"}
                      </button>
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-[#E4E6EB] hover:bg-gray-100 dark:hover:bg-[#3A3B3C] flex items-center gap-2 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                        {t("folderInfo") || "Informasi Folder"}
                      </button>
                      <div className="h-px bg-gray-200 dark:bg-[#3A3B3C] my-1"></div>
                      <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-500 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                        {t("deleteFolder") || "Hapus Folder"}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div key={folder.id} onClick={() => { NProgress.start(); router.push(`/${locale}/saved/${folder.id}`); }} className="grid grid-cols-12 gap-4 items-center py-3 px-2 border-b border-gray-100 dark:border-[#3A3B3C]/50 hover:bg-gray-50 dark:hover:bg-[#3A3B3C]/30 transition-colors cursor-pointer group">
                  <div className="col-span-11 sm:col-span-5 lg:col-span-5 flex items-center gap-4 min-w-0 pr-4">
                    <img src={folder.members?.length > 1 ? "/folder-share.svg" : "/folder-lock.svg"} alt="Folder" className="w-6 h-6 dark:invert opacity-70 group-hover:opacity-100 transition-opacity" />
                    <span className="font-medium text-gray-900 dark:text-[#E4E6EB] truncate">{folder.name}</span>
                  </div>
                  <div className="hidden md:flex md:col-span-3 lg:col-span-2 items-center gap-2 min-w-0">
                    {user?.id === folder.userId && user?.profile?.avatarUrl ? (
                      <img src={user.profile.avatarUrl} alt="Avatar" className="w-6 h-6 rounded-full object-cover shrink-0" />
                    ) : folder.user?.profile?.avatarUrl ? (
                      <img src={folder.user.profile.avatarUrl} alt="Avatar" className="w-6 h-6 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">
                        {user?.id === folder.userId ? user?.username?.[0]?.toUpperCase() : (folder.user?.username?.[0]?.toUpperCase() || "?")}
                      </div>
                    )}
                    <span className="text-sm text-gray-600 dark:text-[#B0B3B8] truncate">
                      {user?.id === folder.userId ? "saya" : folder.user?.username}
                    </span>
                  </div>
                  <div className="hidden sm:block sm:col-span-3 lg:col-span-2 text-sm text-gray-500 dark:text-[#B0B3B8] truncate">
                    {new Date(folder.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}{" "}
                    {user?.id === folder.userId ? "saya" : ""}
                  </div>
                  <div className="hidden lg:flex lg:col-span-2 items-center justify-center">
                    {!folder.members || folder.members.length <= 1 ? (
                      <span className="text-gray-400 dark:text-[#B0B3B8] font-bold">-</span>
                    ) : (
                      <div className="flex -space-x-2 overflow-hidden">
                        {folder.members?.slice(0, 5).map((member: any) => (
                          <div key={member.id} className="inline-block w-6 h-6 rounded-full ring-2 ring-white dark:ring-[#242526] bg-gray-200 dark:bg-gray-700 overflow-hidden shrink-0">
                            {member.user?.profile?.avatarUrl ? (
                              <img src={member.user.profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-gray-500">
                                {member.user?.username?.[0]?.toUpperCase() || "?"}
                              </div>
                            )}
                          </div>
                        ))}
                        {folder.members?.length > 5 && (
                          <div className="inline-block w-6 h-6 rounded-full ring-2 ring-white dark:ring-[#242526] bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[10px] font-medium text-gray-500 shrink-0">
                            +{folder.members.length - 5}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="col-span-1 flex justify-end relative group/menu">
                    <button onClick={(e) => e.stopPropagation()} className="p-1 text-gray-500 hover:text-gray-900 dark:text-[#B0B3B8] dark:hover:text-[#E4E6EB] rounded-full hover:bg-gray-200 dark:hover:bg-[#3A3B3C] transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="1"></circle>
                        <circle cx="12" cy="5" r="1"></circle>
                        <circle cx="12" cy="19" r="1"></circle>
                      </svg>
                    </button>
                    {/* Dropdown Menu */}
                    <div onClick={(e) => e.stopPropagation()} className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-[#242526] rounded-xl shadow-lg border border-gray-100 dark:border-[#3A3B3C] py-1 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-10">
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-[#E4E6EB] hover:bg-gray-100 dark:hover:bg-[#3A3B3C] flex items-center gap-2 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                        Ganti Nama
                      </button>
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-[#E4E6EB] hover:bg-gray-100 dark:hover:bg-[#3A3B3C] flex items-center gap-2 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                        Sematkan
                      </button>
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-[#E4E6EB] hover:bg-gray-100 dark:hover:bg-[#3A3B3C] flex items-center gap-2 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                        Informasi Folder
                      </button>
                      <div className="h-px bg-gray-200 dark:bg-[#3A3B3C] my-1"></div>
                      <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-500 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                        Hapus Folder
                      </button>
                    </div>
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      )}

      {/* Root items */}
      <div className="mt-12">
        <h2 className="text-xl font-bold text-gray-900 dark:text-[#E4E6EB] mb-4 border-b border-gray-200 dark:border-[#3A3B3C] pb-2">
          Root Items
        </h2>
        {isRootLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 w-full">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse bg-gray-200 dark:bg-[#3A3B3C] rounded-xl h-64 w-full"></div>
            ))}
          </div>
        ) : rootItems.length === 0 ? (
          <p className="text-gray-500 text-sm">Belum ada item di luar folder.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 w-full">
            {rootItems.map((item, idx) => (
              <div key={`${item.type}-${item.id}`}>
                {item.type === 'post' ? (
                  <PostCard post={item.post} currentUser={user} />
                ) : (
                  <HorizontalProjectCard project={item.project} locale={locale as string} username={item.project.user?.username || 'user'} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#242526] rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-[#3A3B3C] flex justify-between items-center">
              <h3 className="font-bold text-gray-900 dark:text-[#E4E6EB]">
                {t("createCollection")}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-[#B0B3B8] dark:hover:text-[#E4E6EB]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-[#B0B3B8] mb-1">
                  {t("collectionNameLabel")}
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder={t("collectionNamePlaceholder")}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-[#3A3B3C] rounded-lg bg-white dark:bg-[#18191A] text-gray-900 dark:text-[#E4E6EB] focus:outline-none focus:ring-2 focus:ring-[#0866FF] transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-[#B0B3B8] mb-1">
                  {t("collectionDescLabel")}
                </label>
                <textarea
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder={t("collectionDescPlaceholder")}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-[#3A3B3C] rounded-lg bg-white dark:bg-[#18191A] text-gray-900 dark:text-[#E4E6EB] focus:outline-none focus:ring-2 focus:ring-[#0866FF] transition-all resize-none"
                />
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 dark:border-[#3A3B3C] flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 font-medium text-sm text-gray-600 dark:text-[#B0B3B8] hover:bg-gray-100 dark:hover:bg-[#3A3B3C] rounded-lg transition-colors"
                disabled={isSubmitting}
              >
                {t("btnCancel")}
              </button>
              <button
                onClick={handleCreateFolder}
                disabled={isSubmitting || !formName.trim()}
                className="px-4 py-2 font-medium text-sm text-white bg-[#0866FF] hover:bg-blue-600 rounded-lg transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Loading..." : t("btnCreate")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
