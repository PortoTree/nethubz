"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";

interface HomeNavSidebarProps {
  activeTab: string;
  setActiveTab?: (tab: string) => void;
}

export default function HomeNavSidebar({ activeTab, setActiveTab }: HomeNavSidebarProps) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations();

  return (
    <div className="hidden lg:flex flex-col fixed left-0 top-[56px] h-[calc(100vh-56px)] bg-[#F3F2EF] dark:bg-[#18191A] border-r border-gray-300 dark:border-gray-600 z-[60] w-[72px] hover:w-[260px] transition-all duration-300 overflow-hidden group">
      <div className="flex flex-col py-4 w-[260px] px-3 space-y-2">
        {/* Pencarian */}
        <button
          onClick={() => {
            router.push(`/${locale}/search`);
          }}
          className={`flex items-center gap-4 p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-[#3A3B3C] transition-colors`}
        >
          <div className="w-6 h-6 flex items-center justify-center shrink-0">
            <div
              className={`w-full h-full ${activeTab === "search" ? "bg-gradient-to-br from-emerald-400 to-emerald-600" : "bg-current text-gray-600 dark:text-[#B0B3B8]"}`}
              style={{
                WebkitMask: `url(/navigasi/mencari${activeTab === "search" ? "-aktif" : ""}.svg) center/contain no-repeat`,
                mask: `url(/navigasi/mencari${activeTab === "search" ? "-aktif" : ""}.svg) center/contain no-repeat`,
              }}
            />
          </div>
          <span className="font-bold text-[15px] text-black dark:text-[#E4E6EB] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {t("tabs.search")}
          </span>
        </button>

        {/* Jelajahi / Explore */}
        <button 
          onClick={() => router.push(`/${locale}/explore`)}
          className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-[#3A3B3C] transition-colors"
        >
          <div className="w-6 h-6 flex items-center justify-center shrink-0">
            <div
              className={`w-full h-full bg-current ${activeTab === "explore" ? "text-emerald-500" : "text-gray-600 dark:text-[#B0B3B8]"}`}
              style={{
                WebkitMask: `url(/navigasi/explore${activeTab === "explore" ? "-aktif" : ""}.svg) center/contain no-repeat`,
                mask: `url(/navigasi/explore${activeTab === "explore" ? "-aktif" : ""}.svg) center/contain no-repeat`,
              }}
            />
          </div>
          <span className="font-bold text-[15px] text-black dark:text-[#E4E6EB] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {t("tabs.explore")}
          </span>
        </button>

        {/* Beranda */}
        <button
          onClick={() => {
            if (activeTab !== "home") {
              router.push(`/${locale}/home`);
            }
          }}
          className={`flex items-center gap-4 p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-[#3A3B3C] transition-colors`}
        >
          <div className="w-6 h-6 flex items-center justify-center shrink-0">
            <div
              className={`w-full h-full bg-current ${activeTab === "home" ? "text-black dark:text-white" : "text-gray-600 dark:text-[#B0B3B8]"}`}
              style={{
                WebkitMask: `url(/navigasi/home${activeTab === "home" ? "-aktif" : ""}.svg) center/contain no-repeat`,
                mask: `url(/navigasi/home${activeTab === "home" ? "-aktif" : ""}.svg) center/contain no-repeat`,
              }}
            />
          </div>
          <span className="font-bold text-[15px] text-black dark:text-[#E4E6EB] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {t("tabs.home")}
          </span>
        </button>

        {/* Obrolan */}
        <button
          onClick={() => {
            router.push(`/${locale}/obrolan`);
          }}
          className={`flex items-center gap-4 p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-[#3A3B3C] transition-colors`}
        >
          <div className="w-6 h-6 flex items-center justify-center shrink-0">
            <div
              className={`w-full h-full bg-current ${activeTab === "chat" ? "text-sky-400" : "text-gray-600 dark:text-[#B0B3B8]"}`}
              style={{
                WebkitMask: `url(/navigasi/chat${activeTab === "chat" ? "-aktif" : ""}.svg) center/contain no-repeat`,
                mask: `url(/navigasi/chat${activeTab === "chat" ? "-aktif" : ""}.svg) center/contain no-repeat`,
              }}
            />
          </div>
          <span className="font-bold text-[15px] text-black dark:text-[#E4E6EB] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {t("nav.chat")}
          </span>
        </button>

        {/* Teman */}
        <button
          onClick={() => {
            router.push(`/${locale}/friend`);
          }}
          className={`flex items-center gap-4 p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-[#3A3B3C] transition-colors`}
        >
          <div className="w-6 h-6 flex items-center justify-center shrink-0">
            <div
              className={`w-full h-full bg-current ${activeTab === "friend" ? "text-black dark:text-[#E4E6EB]" : "text-gray-600 dark:text-[#B0B3B8]"}`}
              style={{
                WebkitMask:
                  `url(/navigasi/teman${activeTab === "friend" ? "-aktif" : ""}.svg) center/contain no-repeat`,
                mask: `url(/navigasi/teman${activeTab === "friend" ? "-aktif" : ""}.svg) center/contain no-repeat`,
              }}
            />
          </div>
          <span className="font-bold text-[15px] text-black dark:text-[#E4E6EB] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {t("sidebar.friends")}
          </span>
        </button>

        {/* Komunitas */}
        <button
          onClick={() => {
            router.push(`/${locale}/community`);
          }}
          className={`flex items-center gap-4 p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-[#3A3B3C] transition-colors`}
        >
          <div className="w-6 h-6 flex items-center justify-center shrink-0">
            <div
              className={`w-full h-full bg-current ${activeTab === "community" ? "text-blue-800 dark:text-blue-600" : "text-gray-600 dark:text-[#B0B3B8]"}`}
              style={{
                WebkitMask:
                  `url(/navigasi/komunitas${activeTab === "community" ? "-aktif" : ""}.svg) center/contain no-repeat`,
                mask: `url(/navigasi/komunitas${activeTab === "community" ? "-aktif" : ""}.svg) center/contain no-repeat`,
              }}
            />
          </div>
          <span className="font-bold text-[15px] text-black dark:text-[#E4E6EB] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {t("tabs.groups")}
          </span>
        </button>

        {/* Halaman kamu */}
        <button className={`flex items-center gap-4 p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-[#3A3B3C] transition-colors`}>
          <div className="w-6 h-6 flex items-center justify-center shrink-0">
            <div
              className={`w-full h-full bg-current ${activeTab === "webpage" ? "text-green-500" : "text-gray-600 dark:text-[#B0B3B8]"}`}
              style={{
                WebkitMask: `url(/navigasi/yourpage${activeTab === "webpage" ? "-aktif" : ""}.svg) center/contain no-repeat`,
                mask: `url(/navigasi/yourpage${activeTab === "webpage" ? "-aktif" : ""}.svg) center/contain no-repeat`,
              }}
            />
          </div>
          <span className="font-bold text-[15px] text-black dark:text-[#E4E6EB] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {t("nav.webpage")}
          </span>
        </button>

        {/* Produk */}
        <button
          onClick={() => {
            router.push(`/${locale}/product`);
          }}
          className={`flex items-center gap-4 p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-[#3A3B3C] transition-colors`}
        >
          <div className="w-6 h-6 flex items-center justify-center shrink-0">
            <div
              className={`w-full h-full bg-current ${activeTab === "product" ? "text-[#8B4513] dark:text-[#CD853F]" : "text-gray-600 dark:text-[#B0B3B8]"}`}
              style={{
                WebkitMask: `url(/navigasi/produk${activeTab === "product" ? "-aktif" : ""}.svg) center/contain no-repeat`,
                mask: `url(/navigasi/produk${activeTab === "product" ? "-aktif" : ""}.svg) center/contain no-repeat`,
              }}
            />
          </div>
          <span className="font-bold text-[15px] text-black dark:text-[#E4E6EB] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {t("tabs.product")}
          </span>
        </button>

        {/* Proyek */}
        <button 
          onClick={() => router.push(`/${locale}/project`)}
          className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-[#3A3B3C] transition-colors"
        >
          <div className="w-6 h-6 flex items-center justify-center shrink-0">
            <div
              className={`w-full h-full bg-current ${activeTab === "project" ? "text-purple-500" : "text-gray-600 dark:text-[#B0B3B8]"}`}
              style={{
                WebkitMask: `url(/navigasi/project${activeTab === "project" ? "" : "-outline"}.svg) center/contain no-repeat`,
                mask: `url(/navigasi/project${activeTab === "project" ? "" : "-outline"}.svg) center/contain no-repeat`,
              }}
            />
          </div>
          <span className="font-bold text-[15px] text-black dark:text-[#E4E6EB] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {t("feed.project")}
          </span>
        </button>

        {/* Tersimpan */}
        <button 
          onClick={() => router.push(`/${locale}/saved`)}
          className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-[#3A3B3C] transition-colors"
        >
          <div className="w-6 h-6 flex items-center justify-center shrink-0">
            <div
              className={`w-full h-full bg-current ${activeTab === "saved" ? "text-red-500" : "text-gray-600 dark:text-[#B0B3B8]"}`}
              style={{
                WebkitMask: `url(/navigasi/saved${activeTab === "saved" ? "-aktif" : ""}.svg) center/contain no-repeat`,
                mask: `url(/navigasi/saved${activeTab === "saved" ? "-aktif" : ""}.svg) center/contain no-repeat`,
              }}
            />
          </div>
          <span className="font-bold text-[15px] text-black dark:text-[#E4E6EB] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {t("sidebar.saved")}
          </span>
        </button>
      </div>
    </div>
  );
}
