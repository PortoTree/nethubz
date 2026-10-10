"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import dynamic from "next/dynamic";
// @ts-ignore
import animationDataLight from "../../../../public/search-bar.json";
// @ts-ignore
import animationDataDark from "../../../../public/search-bar-putih.json";
import HomeNavSidebar from "@/components/HomeNavSidebar";

import { Lottie } from "lottie-react";

export default function ClientSearchPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations();

  const [activeTab, setActiveTab] = useState("search");

  // Local states for Search
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [themeLoaded, setThemeLoaded] = useState(false);
  const lottieRef = useRef<any>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isShortcutModalOpen, setIsShortcutModalOpen] = useState(false);

  // Initialize theme
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isDark = document.documentElement.classList.contains("dark");
      setIsDarkMode(isDark);
      setThemeLoaded(true);

      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === "class") {
            setIsDarkMode(document.documentElement.classList.contains("dark"));
          }
        });
      });
      observer.observe(document.documentElement, { attributes: true });
      return () => observer.disconnect();
    }
  }, []);

  useEffect(() => {
    if (themeLoaded && lottieRef.current) {
      try {
        lottieRef.current.seek(0);
        lottieRef.current.play();
      } catch (e) {
        // ignore if not ready
      }
    }
  }, [isDarkMode, themeLoaded]);

  const handleAnimationComplete = () => {
    setTimeout(() => {
      if (lottieRef.current) {
        lottieRef.current.seek(0);
        lottieRef.current.play();
      }
    }, 5000);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchExpanded(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-[#18191A] text-black dark:text-[#E4E6EB] flex flex-col font-sans">
      {/* GLOBAL MINI SIDEBAR */}
      <HomeNavSidebar activeTab="search" setActiveTab={() => {}} />

      {/* Main Container */}
      <div className="flex w-full pt-6">
        
        {/* We omitted the secondary left sidebar for Search, as it was practically hidden anyway */}

        {/* Center Main Feed */}
        <div className="flex-1 flex justify-center lg:ml-[72px]">
          <div className="w-full flex flex-col items-center pt-8 max-w-[680px]">
            {/* Lottie Animation (Logo) */}
            <div className="w-[400px] h-[140px] mb-4 flex items-center justify-center [&>div]:w-full [&>div]:h-full">
              {themeLoaded && (
                <Lottie
                  lottieRef={lottieRef}
                  src={isDarkMode ? animationDataDark : animationDataLight}
                  loop={false}
                  autoplay={true}
                  subscriptions={{ complete: handleAnimationComplete }}
                />
              )}
            </div>

            {/* Google-style Search Box with Expand Behavior */}
            <div className="relative w-full z-40 h-[48px]" ref={searchRef}>
              <div
                className={`absolute top-0 left-0 w-full bg-white dark:bg-[#242526] ${
                  isSearchExpanded
                    ? "rounded-[24px] shadow-[0_4px_12px_rgba(32,33,36,0.28)] pb-4"
                    : "rounded-full shadow-[0_1px_6px_rgba(32,33,36,0.28)] hover:shadow-[0_1px_6px_rgba(32,33,36,0.4)]"
                } dark:shadow-[0_1px_6px_rgba(0,0,0,0.5)] transition-shadow duration-200 border border-transparent dark:border-[#3E4042] flex flex-col`}
              >
                {/* Input Row */}
                <div className="flex items-center px-4 py-3 min-h-[48px] w-full">
                  <svg
                    className="w-5 h-5 text-gray-400 shrink-0 ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder={t("nav.searchPlaceholder")}
                    className="w-full bg-transparent border-none outline-none ml-4 text-[16px] text-black dark:text-[#E4E6EB] placeholder-gray-500 dark:placeholder-[#B0B3B8]"
                    onFocus={() => setIsSearchExpanded(true)}
                  />
                </div>

                {/* Expanded Dropdown Content */}
                {isSearchExpanded && (
                  <div className="w-full border-t border-gray-100 dark:border-[#3E4042] pt-2 mt-1">
                    <div className="flex flex-col w-full max-h-[195px] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-[#4E4F50] [&::-webkit-scrollbar-thumb]:rounded-full overscroll-none">
                      {[
                        "translate - Google Search",
                        "portotree",
                        "eraser bg",
                        "png to svg",
                        "compress foto",
                        "compress video",
                        "upscale image",
                      ].map((text, i) => (
                        <div
                          key={i}
                          className="px-4 py-2.5 hover:bg-gray-200 dark:hover:bg-[#3A3B3C] cursor-pointer flex items-center justify-between group transition-colors shrink-0"
                        >
                          <div className="flex items-center gap-3">
                            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-[15px] text-black dark:text-[#E4E6EB]">{text}</span>
                          </div>
                          <div
                            className="hidden group-hover:flex items-center justify-center p-1 rounded-full hover:bg-gray-200 dark:hover:bg-[#4E4F50] text-gray-400 hover:text-gray-600 dark:hover:text-[#E4E6EB] transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log("Hapus riwayat:", text);
                            }}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Add Shortcut Button */}
            <div className="mt-8">
              <div
                onClick={() => setIsShortcutModalOpen(true)}
                className="flex flex-col items-center cursor-pointer group p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-[#303134] transition-colors"
              >
                <div className="w-12 h-12 bg-[#F0F2F5] dark:bg-[#3A3B3C] rounded-full flex items-center justify-center mb-2">
                  <svg className="w-6 h-6 text-black dark:text-[#E4E6EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span className="text-[13px] font-medium text-black dark:text-[#E4E6EB]">
                  {t("search.shortcut_add")}
                </span>
              </div>
            </div>

            {/* CTA Block */}
            <div className="w-full max-w-[600px] mx-auto mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Website CTA */}
              <div className="bg-gradient-to-br from-green-800 to-green-950 rounded-xl shadow-sm border border-transparent overflow-hidden p-4 text-white relative h-full flex flex-col justify-between">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-white opacity-10 rounded-full"></div>
                <div className="absolute right-12 -top-2 w-8 h-8 bg-white opacity-10 rounded-full"></div>
                <div className="relative z-10 flex flex-col gap-3 h-full">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center shrink-0 backdrop-blur-sm">
                      <img src="/visit.png" alt="Website" className="w-6 h-6 object-contain" />
                    </div>
                    <h3 className="font-bold text-[15px] leading-snug m-0">{t("search.cta_title")}</h3>
                  </div>
                  <p className="text-[13px] text-emerald-50 leading-relaxed opacity-90 m-0 mb-2 flex-grow">{t("search.cta_desc")}</p>
                  <button onClick={() => router.push(`/${locale}/page`)} className="w-full mt-auto whitespace-nowrap bg-white text-emerald-600 hover:bg-emerald-700 hover:text-white font-bold text-[14px] py-2.5 px-4 rounded-lg transition-colors shadow-sm">
                    {t("search.cta_button")}
                  </button>
                </div>
              </div>

              {/* Product CTA */}
              <div className="bg-gradient-to-br from-orange-700 to-orange-900 rounded-xl overflow-hidden shadow-sm p-4 text-white relative h-full flex flex-col justify-between">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-white opacity-10 rounded-full"></div>
                <div className="absolute right-12 -top-2 w-8 h-8 bg-white opacity-10 rounded-full"></div>
                <div className="relative z-10 flex flex-col gap-3 h-full">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center shrink-0 backdrop-blur-sm">
                      <img src="/navigasi/produk-aktif.svg" alt="Product" className="w-6 h-6 object-contain brightness-0 invert" />
                    </div>
                    <h3 className="font-bold text-[15px] leading-snug m-0">{t("search.product_cta_title")}</h3>
                  </div>
                  <p className="text-[13px] text-orange-50 leading-relaxed opacity-90 m-0 mb-2 flex-grow">{t("search.product_cta_desc")}</p>
                  <button onClick={() => router.push(`/${locale}/product?create=true`)} className="w-full mt-auto whitespace-nowrap bg-white text-orange-700 hover:bg-orange-800 hover:text-white font-bold text-[14px] py-2.5 px-4 rounded-lg transition-colors shadow-sm">
                    {t("search.product_cta_button")}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Add Shortcut Modal */}
      {isShortcutModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-[#242526] w-full max-w-[400px] rounded-lg shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 dark:border-[#3E4042]">
              <h2 className="text-[16px] font-semibold text-black dark:text-[#E4E6EB]">
                {t("search.shortcut_title")}
              </h2>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-[13px] text-gray-600 dark:text-[#B0B3B8] mb-1">
                  {t("search.name")}
                </label>
                <input
                  type="text"
                  className="w-full bg-[#F0F2F5] dark:bg-[#3A3B3C] text-black dark:text-[#E4E6EB] rounded px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-[13px] text-gray-600 dark:text-[#B0B3B8] mb-1">
                  {t("search.url")}
                </label>
                <input
                  type="text"
                  className="w-full bg-[#F0F2F5] dark:bg-[#3A3B3C] text-black dark:text-[#E4E6EB] rounded px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="px-5 py-4 flex justify-end gap-2 bg-[#F8F9FA] dark:bg-[#303134] border-t border-gray-200 dark:border-[#3E4042]">
              <button
                onClick={() => setIsShortcutModalOpen(false)}
                className="px-4 py-2 rounded-md text-[14px] font-medium text-gray-700 dark:text-[#E4E6EB] hover:bg-gray-200 dark:hover:bg-[#4E4F50] transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => setIsShortcutModalOpen(false)}
                className="px-4 py-2 rounded-md text-[14px] font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
