"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";

export interface ProjectDraft {
  id?: string;
  title: string;
  status: "RELEASED" | "IN_PROGRESS" | "SEARCHING_TEAM" | "OPEN_SOURCE";
  techStack: string[];
  repoUrl: string;
  demoUrl: string;
  coverUrl?: string;
  coverFile?: File;
  videoUrl?: string;
  roleNeeded: string;
}

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: ProjectDraft) => void;
  initial?: ProjectDraft | null;
}

export default function ProjectFormModal({
  isOpen,
  onClose,
  onSave,
  initial
}: ProjectFormModalProps) {
  const t = useTranslations();
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<ProjectDraft["status"]>("RELEASED");
  const [techStack, setTechStack] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [roleNeeded, setRoleNeeded] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    if (initial) {
      setTitle(initial.title || "");
      setStatus(initial.status || "RELEASED");
      setTechStack(initial.techStack?.join(", ") || "");
      setRepoUrl(initial.repoUrl || "");
      setDemoUrl(initial.demoUrl || "");
      setVideoUrl(initial.videoUrl || "");
      setCoverUrl(initial.coverUrl || "");
      setCoverPreview(initial.coverUrl || null);
      setCoverFile(null);
      setRoleNeeded(initial.roleNeeded || "");
    } else {
      setTitle("");
      setStatus("RELEASED");
      setTechStack("");
      setRepoUrl("");
      setDemoUrl("");
      setVideoUrl("");
      setCoverUrl("");
      setCoverPreview(null);
      setCoverFile(null);
      setRoleNeeded("");
    }
  }, [isOpen, initial]);

  if (!isOpen || typeof document === "undefined") return null;

  const handleSave = () => {
    setError(null);
    if (!title.trim()) {
      return setError(t("project.errTitle"));
    }

    const URL_RE = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    if (repoUrl.trim() && !URL_RE.test(repoUrl.trim())) {
      return setError(t("project.errRepoUrl"));
    }
    if (demoUrl.trim() && !URL_RE.test(demoUrl.trim())) {
      return setError(t("project.errDemoUrl"));
    }

    if (videoUrl.trim() && !URL_RE.test(videoUrl.trim())) {
      return setError(t("project.errDemoUrl")); // Reuse error for now
    }

    if (status === "SEARCHING_TEAM" && !roleNeeded.trim()) {
      return setError(t("project.errRoleNeeded"));
    }

    const techArray = techStack
      .split(",")
      .map(t => t.trim())
      .filter(t => t.length > 0);

    onSave({
      id: initial?.id,
      title: title.trim(),
      status,
      techStack: techArray,
      repoUrl: repoUrl.trim(),
      demoUrl: demoUrl.trim(),
      videoUrl: videoUrl.trim(),
      coverUrl,
      coverFile: coverFile || undefined,
      roleNeeded: roleNeeded.trim()
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/60 dark:bg-black/80 px-4 py-6">
      <div 
        className="w-full max-w-[550px] max-h-full overflow-y-auto bg-white dark:bg-[#242526] rounded-2xl shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-center p-4 border-b border-gray-200 dark:border-[#3E4042] bg-white dark:bg-[#242526] rounded-t-2xl">
          <h2 className="text-[20px] font-bold text-black dark:text-[#E4E6EB]">
            {initial ? t("project.editProject") : t("project.addProject")}
          </h2>
          <button 
            onClick={onClose} 
            className="absolute right-4 w-9 h-9 bg-gray-100 dark:bg-[#3A3B3C] rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-[#4E4F50] transition-colors text-gray-600 dark:text-[#B0B3B8]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-2">
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              {error}
            </div>
          )}

          <div>
            <label className="block text-[14px] font-semibold text-gray-700 dark:text-[#E4E6EB] mb-1.5">{t("project.title")} <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              value={title} 
              onChange={e => setTitle(e.target.value)}
              placeholder={t("project.titlePlaceholder")}
              className="w-full bg-gray-50 dark:bg-[#3A3B3C] border border-gray-300 dark:border-[#4E4F50] rounded-xl px-4 py-3 text-black dark:text-[#E4E6EB] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#1877F2] transition-shadow placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>

          <div>
            <label className="block text-[14px] font-semibold text-gray-700 dark:text-[#E4E6EB] mb-1.5">{t("project.coverImage")}</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`w-full aspect-[21/9] rounded-xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden cursor-pointer transition-colors ${coverPreview ? 'border-transparent' : 'border-gray-300 dark:border-[#4E4F50] hover:bg-gray-50 dark:hover:bg-[#3A3B3C]'}`}
            >
              {coverPreview ? (
                <div className="relative w-full h-full group">
                  <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="text-white font-medium text-sm">Ganti Gambar</span>
                  </div>
                </div>
              ) : (
                <div className="text-center p-4">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-[#3A3B3C] rounded-full flex items-center justify-center mx-auto mb-2 text-gray-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                  <span className="text-gray-500 text-sm font-medium">Upload Gambar (opsional)</span>
                </div>
              )}
            </div>
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setCoverFile(file);
                  setCoverPreview(URL.createObjectURL(file));
                }
              }}
            />
            <p className="text-[12px] text-gray-500 mt-1">{t("project.coverImageHint")}</p>
          </div>

          <div>
            <label className="block text-[14px] font-semibold text-gray-700 dark:text-[#E4E6EB] mb-1.5">{t("project.status")}</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as any)}
              className="w-full bg-gray-50 dark:bg-[#3A3B3C] border border-gray-300 dark:border-[#4E4F50] rounded-xl px-4 py-3 text-black dark:text-[#E4E6EB] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#1877F2] transition-shadow appearance-none"
            >
              <option value="RELEASED">{t("project.statusReleased")}</option>
              <option value="IN_PROGRESS">{t("project.statusInProgress")}</option>
              <option value="OPEN_SOURCE">{t("project.statusOpenSource")}</option>
              <option value="SEARCHING_TEAM">{t("project.statusSearchingTeam")}</option>
            </select>
          </div>

          {status === "SEARCHING_TEAM" && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="block text-[14px] font-semibold text-gray-700 dark:text-[#E4E6EB] mb-1.5">{t("project.roleNeeded")} <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                value={roleNeeded} 
                onChange={e => setRoleNeeded(e.target.value)}
                placeholder={t("project.roleNeededPlaceholder")}
                className="w-full bg-blue-50 dark:bg-[#263951] border border-blue-200 dark:border-[#1877F2]/30 rounded-xl px-4 py-3 text-black dark:text-[#E4E6EB] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#1877F2] transition-shadow placeholder-blue-300 dark:placeholder-blue-300/50"
              />
              <p className="text-[12px] text-gray-500 mt-1">{t("project.roleNeededHint")}</p>
            </div>
          )}

          <div>
            <label className="block text-[14px] font-semibold text-gray-700 dark:text-[#E4E6EB] mb-1.5">{t("project.techStack")}</label>
            <input 
              type="text" 
              value={techStack} 
              onChange={e => setTechStack(e.target.value)}
              placeholder={t("project.techStackPlaceholder")}
              className="w-full bg-gray-50 dark:bg-[#3A3B3C] border border-gray-300 dark:border-[#4E4F50] rounded-xl px-4 py-3 text-black dark:text-[#E4E6EB] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#1877F2] transition-shadow placeholder-gray-400 dark:placeholder-gray-500"
            />
            <p className="text-[12px] text-gray-500 mt-1">{t("project.techStackHint")}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-[14px] font-semibold text-gray-700 dark:text-[#E4E6EB] mb-1.5">{t("project.repoUrl")}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                </div>
                <input 
                  type="url" 
                  value={repoUrl} 
                  onChange={e => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/..."
                  className="w-full bg-gray-50 dark:bg-[#3A3B3C] border border-gray-300 dark:border-[#4E4F50] rounded-xl pl-10 pr-4 py-3 text-black dark:text-[#E4E6EB] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#1877F2] transition-shadow placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
            </div>
            
            <div className="flex-1">
              <label className="block text-[14px] font-semibold text-gray-700 dark:text-[#E4E6EB] mb-1.5">{t("project.demoUrl")}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                </div>
                <input 
                  type="url" 
                  value={demoUrl} 
                  onChange={e => setDemoUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-gray-50 dark:bg-[#3A3B3C] border border-gray-300 dark:border-[#4E4F50] rounded-xl pl-10 pr-4 py-3 text-black dark:text-[#E4E6EB] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#1877F2] transition-shadow placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-[14px] font-semibold text-gray-700 dark:text-[#E4E6EB] mb-1.5">{t("project.videoUrl")}</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
              </div>
              <input 
                type="url" 
                value={videoUrl} 
                onChange={e => setVideoUrl(e.target.value)}
                placeholder={t("project.videoUrlPlaceholder")}
                className="w-full bg-gray-50 dark:bg-[#3A3B3C] border border-gray-300 dark:border-[#4E4F50] rounded-xl pl-10 pr-4 py-3 text-black dark:text-[#E4E6EB] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#1877F2] transition-shadow placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>
          </div>
          
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-[#3E4042] bg-gray-50/50 dark:bg-[#242526] flex items-center gap-3 rounded-b-2xl">
          <button 
            type="button" 
            onClick={onClose} 
            className="flex-1 py-2.5 rounded-xl text-[15px] font-semibold text-gray-600 dark:text-[#B0B3B8] hover:bg-gray-100 dark:hover:bg-[#3A3B3C] transition-colors"
          >
            {t("project.cancel")}
          </button>
          <button 
            type="button" 
            onClick={handleSave} 
            className="flex-1 py-2.5 rounded-xl text-[15px] font-semibold bg-[#1877F2] hover:bg-blue-600 text-white transition-colors"
          >
            {initial ? t("project.saveChanges") : t("project.addProject")}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
