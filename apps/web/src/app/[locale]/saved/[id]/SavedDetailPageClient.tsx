"use client";
import NProgress from "nprogress";


import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { getFolderDetails } from "@/app/actions/folders";
import { useUser } from "@/contexts/UserContext";
import { folderDetailsCache } from "@/utils/cache";
import PostCard from "@/components/PostCard";
import HorizontalProjectCard from "@/components/HorizontalProjectCard";

export default function SavedDetailPageClient({ folderId }: { folderId: string }) {
  const t = useTranslations("savedPage");
  const router = useRouter();
  const handleItemClick = (item: any) => {
    NProgress.start();
    if (item.type === 'project') {
      router.push(`/${locale}/project/${item.project.user?.username || 'user'}/${item.project.id}`);
    } else {
      router.push(`/${locale}/post/${item.post.id}`);
    }
  };
  const params = useParams();
  const locale = params?.locale || "id";
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  
  const [folder, setFolder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const { currentUser: user } = useUser();
  const [isLoading, setIsLoading] = useState(true);

  const fetchFolderDetails = async (id: string) => {
    try {
      console.log("STARTING FETCH FOR FOLDER ID:", id);
      const res = await getFolderDetails(id);
      console.log("FETCH COMPLETED. RES:", res);
      if (res.success && res.folder) {
        folderDetailsCache.set(id, res.folder);
        setFolder(res.folder);
        // Combine savedPosts and savedProjects into a single items array
        const combinedItems = [
          ...(res.folder.savedPosts || []).map((p: any) => ({ ...p, type: 'post' })),
          ...(res.folder.savedProjects || []).map((p: any) => ({ ...p, type: 'project' }))
        ];
        setItems(combinedItems);
      }
    } catch (err) {
      console.error("ERROR IN FETCH FOLDER DETAILS:", err);
    } finally {
      setIsLoading(false);
      console.log("SET IS LOADING FALSE EXECUTED");
    }
  };

  useEffect(() => {
    if (folderId) {
      if (folderDetailsCache.has(folderId)) {
        const cachedFolder = folderDetailsCache.get(folderId);
        setFolder(cachedFolder);
        const combinedItems = [
          ...(cachedFolder.savedPosts || []).map((p: any) => ({ ...p, type: 'post' })),
          ...(cachedFolder.savedProjects || []).map((p: any) => ({ ...p, type: 'project' }))
        ];
        setItems(combinedItems);
        setIsLoading(false);
      } else {
        setIsLoading(true);
      }
      fetchFolderDetails(folderId);
    }
  }, [user?.id, folderId]);



  return (
    <div>

      <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-[#3A3B3C] pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 text-gray-500 hover:text-gray-900 dark:text-[#B0B3B8] dark:hover:text-[#E4E6EB] hover:bg-gray-100 dark:hover:bg-[#3A3B3C] rounded-full transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-[#E4E6EB]">
              Folder {folder?.name || ""}
            </h1>
            <p className="text-sm text-gray-500 dark:text-[#B0B3B8] mt-1">
              {items.length} {t("itemsSaved") || "Item disimpan"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="hidden sm:flex px-4 py-2 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-semibold rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors text-sm items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
            {t("allowUser") || "Allow user"}
          </button>
          
          <div className="relative group/menu">
            <button className="p-2 text-gray-500 hover:text-gray-900 dark:text-[#B0B3B8] dark:hover:text-[#E4E6EB] rounded-lg hover:bg-gray-100 dark:hover:bg-[#3A3B3C] transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="1"></circle>
                <circle cx="12" cy="5" r="1"></circle>
                <circle cx="12" cy="19" r="1"></circle>
              </svg>
            </button>
            
            {/* Dropdown Menu */}
            <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-[#242526] rounded-xl shadow-lg border border-gray-100 dark:border-[#3A3B3C] py-1 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-10">
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
      </div>
      {isLoading ? (
        <div className="w-full text-left">
          <div className="flex flex-col">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="grid grid-cols-12 gap-4 items-center py-3 px-2 border-b border-gray-100 dark:border-[#3A3B3C]/50 animate-pulse">
                <div className="col-span-11 sm:col-span-5 lg:col-span-5 flex items-center gap-4 pr-4">
                  <div className="h-5 bg-gray-200 dark:bg-[#3A3B3C] rounded w-3/4"></div>
                </div>
                <div className="hidden md:flex md:col-span-3 lg:col-span-2 items-center gap-2">
                  <div className="h-4 bg-gray-200 dark:bg-[#3A3B3C] rounded w-1/2"></div>
                </div>
                <div className="hidden sm:block sm:col-span-3 lg:col-span-2">
                  <div className="h-4 bg-gray-200 dark:bg-[#3A3B3C] rounded w-3/4"></div>
                </div>
                <div className="hidden lg:flex lg:col-span-2 justify-center">
                  <div className="w-1/2 h-4 bg-gray-200 dark:bg-[#3A3B3C] rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#242526] rounded-2xl border border-gray-100 dark:border-[#3A3B3C]">
          <Image src="/empty-folder.svg" alt="Empty Folder" width={96} height={96} className="mb-4 opacity-70 dark:invert" />
          <p className="text-gray-500 dark:text-[#B0B3B8] text-lg font-medium">
            {t("emptyState")}
          </p>
        </div>
      ) : (
          <div className="flex flex-col gap-4 mt-6 w-full max-w-[590px] mx-auto">
            {items.map((item: any) => (
              <div key={item.id} className="w-full">
                {item.type === 'project' ? (
                  <HorizontalProjectCard project={item.project} locale={locale as string} username={item.project.user?.username || 'user'} />
                ) : (
                  <PostCard post={item.post} currentUser={user} />
                )}
              </div>
            ))}
          </div>
      )}
    </div>
  );
}
