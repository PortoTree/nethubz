"use client";

import React, { useEffect, useState, useCallback, use } from "react";
import { useTranslations } from "next-intl";
import { getProjectsByUsername } from "@/app/actions/projects";
import { getOptimizedUrl } from "@/utils/cloudinary";
import { uploadToCloudinary } from "@/utils/uploadImage";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import ProjectCard from "@/components/ProjectCard";
import Navbar from "@/components/Navbar";
import { projectsCache } from "@/utils/profileCache";

import ProjectFormModal from "@/components/ProjectFormModal";
import { deleteProject, createProject, updateProject } from "@/app/actions/projects";

export default function UserProjectPage({
  params,
}: {
  params: Promise<{ locale: string; username: string }>;
}) {
  const { locale, username } = use(params);
  const decodedUsername = decodeURIComponent(username);
  const t = useTranslations("project");
  const router = useRouter();
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
  
  const [profileUser, setProfileUser] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  const [isDeleteProjectModalOpen, setIsDeleteProjectModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<any>(null);
  const [projectToDelete, setProjectToDelete] = useState<any>(null);
  const [isDeletingProjectLoading, setIsDeletingProjectLoading] = useState(false);
  const [isSubmittingProject, setIsSubmittingProject] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [themeLoaded, setThemeLoaded] = useState(false);

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

  const handleDeleteProject = async () => {
    if (!projectToDelete || !user) return;
    try {
      setIsDeletingProjectLoading(true);
      await deleteProject(projectToDelete.id, user.id);
      window.dispatchEvent(new Event("refresh_projects"));
      setIsDeleteProjectModalOpen(false);
      setProjectToDelete(null);
    } catch (e) {
      console.error(e);
      alert(t("errorDefault") || "Terjadi kesalahan");
    } finally {
      setIsDeletingProjectLoading(false);
    }
  };

  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    const res = await getProjectsByUsername(decodedUsername);
    if (res.success && res.user) {
      setProfileUser(res.user);
      const fetchedProjects = res.projects || [];
      projectsCache.set(res.user.id, fetchedProjects);
      setProjects(fetchedProjects);
    } else {
      router.push(`/${locale}/404`);
    }
    setIsLoading(false);
  }, [decodedUsername, router, locale]);

  useEffect(() => {
    loadProjects();
    const handleRefresh = () => {
      loadProjects();
    };
    window.addEventListener("refresh_projects", handleRefresh);
    return () => {
      window.removeEventListener("refresh_projects", handleRefresh);
    };
  }, [loadProjects]);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#F0F2F5] dark:bg-[#18191A] pt-20 pb-10">
        <div className="max-w-[1200px] mx-auto w-full px-4 flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!profileUser) return null;

  const displayName = profileUser.profile?.displayName || profileUser.username;
  const avatar = profileUser.profile?.avatarUrl ? getOptimizedUrl(profileUser.profile.avatarUrl, 'thumb') : null;
  const isOwnProfile = user?.id === profileUser.id;

  return (
    <div className="flex flex-col min-h-screen bg-[#F0F2F5] dark:bg-[#18191A] pt-20 pb-10">
      <div className="max-w-[1200px] mx-auto w-full px-4">
        <div className="flex flex-col items-center justify-center text-center mb-10">
          <Link href={`/${locale}/p/${profileUser.username}/${profileUser.id}`} className="block mb-4 hover:opacity-80 transition-opacity">
            {avatar ? (
              <img src={avatar} alt={displayName} className="w-24 h-24 rounded-full object-cover shadow-sm mx-auto border-4 border-white dark:border-[#242526]" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-[#3A3B3C] flex items-center justify-center text-gray-500 dark:text-gray-400 font-bold text-3xl mx-auto border-4 border-white dark:border-[#242526]">
                {displayName[0].toUpperCase()}
              </div>
            )}
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-[#E4E6EB] mb-2">{displayName}'s Portfolio</h1>
          <p className="text-gray-600 dark:text-[#B0B3B8] max-w-2xl mx-auto flex items-center justify-center gap-2">
            <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            Showcasing {projects.length} {projects.length === 1 ? 'project' : 'projects'}
          </p>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-[#242526] rounded-2xl border border-gray-100 dark:border-[#3A3B3C]">
            <p className="text-gray-500 dark:text-[#B0B3B8]">
              {t("userHasNoProject", { username: displayName }) || `Saat ini ${displayName} belum mempublikasikan project apapun.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((p: any) => (
              <div key={p.id} className="block relative z-0 h-full">
                <ProjectCard
                  project={p}
                  locale={locale}
                  username={profileUser.username}
                  isOwnProfile={isOwnProfile}
                  onEdit={(project) => {
                    setProjectToEdit(project);
                    setIsCreateProjectModalOpen(true);
                  }}
                  onDelete={(project) => {
                    setProjectToDelete(project);
                    setIsDeleteProjectModalOpen(true);
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <ProjectFormModal
        isOpen={isCreateProjectModalOpen}
        onClose={() => {
          setIsCreateProjectModalOpen(false);
          setProjectToEdit(null);
        }}
        isSubmitting={isSubmittingProject}
        initial={projectToEdit || undefined}
        onSave={async (projectDraft) => {
          setIsSubmittingProject(true);
          try {
            let finalCoverUrls = projectDraft.coverUrls || [];
            
            // Upload new cover files if any
            if (projectDraft.coverFiles && projectDraft.coverFiles.length > 0) {
              const uploadPromises = projectDraft.coverFiles.map(file => uploadToCloudinary(file, "project-cover"));
              const uploadedUrls = await Promise.all(uploadPromises);
              finalCoverUrls = [...finalCoverUrls, ...uploadedUrls];
            }

            let res;
            if (projectDraft.id) {
              res = await updateProject(projectDraft.id, user.id, {
                title: projectDraft.title,
                description: projectDraft.description,
                status: projectDraft.status,
                techStack: projectDraft.techStack,
                repoUrl: projectDraft.repoUrl,
                demoUrl: projectDraft.demoUrl,
                coverUrls: finalCoverUrls,
                mediaUrls: projectDraft.mediaUrls,
                roleNeeded: projectDraft.roleNeeded,
              });
            } else {
              res = await createProject({
                userId: user.id,
                title: projectDraft.title,
                description: projectDraft.description,
                status: projectDraft.status,
                techStack: projectDraft.techStack,
                repoUrl: projectDraft.repoUrl,
                demoUrl: projectDraft.demoUrl,
                coverUrls: finalCoverUrls,
                mediaUrls: projectDraft.mediaUrls,
                roleNeeded: projectDraft.roleNeeded,
              });
            }

            if (res.success) {
              setIsCreateProjectModalOpen(false);
              setProjectToEdit(null);
              window.dispatchEvent(new Event("refresh_projects"));
            } else {
              alert("Gagal menyimpan proyek: " + res.error);
            }
          } catch (error: any) {
            alert("Terjadi kesalahan: " + error.message);
          } finally {
            setIsSubmittingProject(false);
          }
        }}
      />

      {isDeleteProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm" onClick={() => !isDeletingProjectLoading && setIsDeleteProjectModalOpen(false)} />
          <div className="bg-white dark:bg-[#242526] rounded-2xl p-6 w-full max-w-md relative z-10 shadow-xl border border-gray-100 dark:border-[#3A3B3C]">
            <div className="mb-6">
              <h3 className="text-[18px] font-bold text-black dark:text-[#E4E6EB] mb-2">{t("deleteProjectConfirmTitle") || "Hapus Project"}</h3>
              <p className="text-gray-600 dark:text-[#B0B3B8] text-[15px]">
                {t("deleteProjectConfirmText") || "Apakah Anda yakin ingin menghapus project"} <span className="font-semibold text-gray-900 dark:text-white">"{projectToDelete?.title}"</span>?
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                disabled={isDeletingProjectLoading}
                onClick={() => setIsDeleteProjectModalOpen(false)}
                className="px-5 py-2.5 rounded-xl font-bold text-[15px] bg-gray-100 dark:bg-[#3A3B3C] text-gray-700 dark:text-[#E4E6EB] hover:bg-gray-200 dark:hover:bg-[#4E4F50] transition-colors disabled:opacity-50"
              >
                {t("cancel") || "Batal"}
              </button>
              <button
                disabled={isDeletingProjectLoading}
                onClick={handleDeleteProject}
                className="px-5 py-2.5 rounded-xl font-bold text-[15px] bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isDeletingProjectLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {t("deleteProject") || "Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
