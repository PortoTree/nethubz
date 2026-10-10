"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";

import HomeNavSidebar from "@/components/HomeNavSidebar";

export default function ClientProductPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations();

  const [productSearch, setProductSearch] = useState("");
  const [productFilter, setProductFilter] = useState("all");
  const [isProductSortOpen, setIsProductSortOpen] = useState(false);
  const [productSort, setProductSort] = useState("popular");
  const [isProductDetailOpen, setIsProductDetailOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      const cat = url.searchParams.get("category");
      if (cat) {
        setProductFilter(cat);
      }
    }
  }, []);

  return (
    <main className="min-h-screen bg-[#F3F2EF] dark:bg-[#18191A] text-black dark:text-[#E4E6EB] pb-10 pt-[56px]">
      <HomeNavSidebar activeTab="product" />
      <div className="flex w-full pt-6">
        {/* Left Sidebar for Product */}
        <div className="hidden lg:flex flex-col fixed left-[72px] top-[56px] w-[280px] xl:w-[320px] h-[calc(100vh-56px)]">
          <div className="flex-1 overscroll-contain overflow-y-auto pt-6 px-4 pb-4 sidebar-scrollbar">
            <div className="space-y-4">
              {/* Store Profile Card */}
              <div className="bg-white dark:bg-[#242526] rounded-xl shadow-sm border border-gray-100 dark:border-[#3E4042] overflow-hidden">
                <div className="h-20 bg-emerald-500 dark:bg-emerald-600 w-full relative">
                  <div className="absolute -bottom-8 left-4 w-[72px] h-[72px] rounded-xl shadow-sm overflow-hidden bg-white dark:bg-[#3A3B3C]">
                    <img src="/produk-placeholder.png" alt="Toko" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  </div>
                </div>
                <div className="pt-10 pb-4 px-4 text-left">
                  <h3 className="font-bold text-[17px] text-black dark:text-[#E4E6EB]">
                    Toko Digital Kreatif
                  </h3>
                  <div className="mt-1 flex items-center gap-1.5 text-gray-500 dark:text-[#B0B3B8] hover:text-emerald-500 transition-colors cursor-pointer group w-fit">
                    <span className="text-[13px] truncate">nethubz.com/toko</span>
                    <svg className="w-3.5 h-3.5 text-gray-400 group-hover:text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  </div>
                  <button className="mt-3.5 w-full py-1.5 bg-gray-100 dark:bg-[#3A3B3C] hover:bg-gray-200 dark:hover:bg-[#4E4F50] text-black dark:text-[#E4E6EB] font-semibold text-[13.5px] rounded-lg transition-colors">
                    {t("product.manage") || "Kelola Produk"}
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="bg-white dark:bg-[#242526] rounded-xl shadow-sm border border-gray-100 dark:border-[#3E4042] p-2 flex flex-col gap-0.5">
                <h4 className="font-bold text-[14px] text-black dark:text-[#E4E6EB] px-2 pt-1 pb-2">{t("product.category") || "Kategori"}</h4>
                {[
                  { id: "all", label: t("product.filter_all") || "Semua", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg> },
                  { id: "ai_prompt", label: t("product.categories.ai_prompt") || "AI Prompt", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> },
                  { id: "design", label: t("product.categories.design") || "Desain", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg> },
                  { id: "document", label: t("product.categories.document") || "Dokumen", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
                  { id: "ebook", label: t("product.categories.ebook") || "E-Book", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg> },
                  { id: "course", label: t("product.categories.course") || "Kursus", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg> },
                  { id: "software", label: t("product.categories.software") || "Software", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> },
                  { id: "business", label: t("product.categories.business") || "Bisnis", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> },
                  { id: "social", label: t("product.categories.social") || "Sosial Media", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg> },
                  { id: "photo_video", label: t("product.categories.photo_video") || "Foto & Video", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
                  { id: "audio", label: t("product.categories.audio") || "Audio", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg> },
                  { id: "gaming", label: t("product.categories.gaming") || "Gaming", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
                  { id: "website", label: t("product.categories.website") || "Website", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg> },
                  { id: "career", label: t("product.categories.career") || "Karir", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> },
                  { id: "printable", label: t("product.categories.printable") || "Cetak", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg> },
                  { id: "3d_asset", label: t("product.categories.3d_asset") || "3D Asset", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg> },
                  { id: "font", label: t("product.categories.font") || "Font", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg> },
                  { id: "marketing", label: t("product.categories.marketing") || "Marketing", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg> },
                  { id: "lifestyle", label: t("product.categories.lifestyle") || "Gaya Hidup", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg> },
                  { id: "membership", label: t("product.categories.membership") || "Membership", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg> },
                  { id: "bundle", label: t("product.categories.bundle") || "Bundle", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg> }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setProductFilter(cat.id);
                      const url = new URL(window.location.href);
                      url.searchParams.set("category", cat.id);
                      window.history.pushState({}, "", url.toString());
                    }}
                    className={`w-full text-left px-3 py-2.5 text-[13.5px] font-medium transition-colors flex items-center gap-3 rounded-lg ${productFilter === cat.id
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 font-bold"
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-200 dark:text-[#E4E6EB] dark:hover:bg-[#3A3B3C]"
                      }`}
                  >
                    <span className="shrink-0 flex items-center justify-center opacity-80">{cat.icon}</span>
                    <span className="truncate">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>
            {/* Divider */}
            <div className="h-px w-full bg-gray-200 dark:border-[#3E4042] dark:bg-[#3E4042] mt-4"></div>
          </div>
        </div>

        {/* Center Main Feed */}
        <div className="flex-1 flex justify-center lg:ml-[352px] xl:ml-[392px] lg:mr-[280px] xl:mr-[320px]">
          <div className="w-full max-w-[680px] pt-6 pb-24 mx-auto px-2 sm:px-0">
            <h2 className="text-xl font-bold text-black dark:text-[#E4E6EB] mb-4 mt-[56px] sm:mt-0 px-2 sm:px-0">{t("product.title") || "Produk"}</h2>

            {/* Search & Sort */}
            <div className="mb-6 px-2 sm:px-0">
              <div className="flex items-center gap-2 mb-4 relative z-10">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400 dark:text-[#B0B3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </div>
                  <input
                    type="text"
                    placeholder={t("product.search_placeholder") || "Cari produk..."}
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full bg-white dark:bg-[#242526] border border-gray-200 dark:border-[#3E4042] rounded-full py-2.5 pl-10 pr-4 text-[14px] text-black dark:text-[#E4E6EB] focus:outline-none focus:ring-2 focus:ring-emerald-500/50 shadow-sm"
                  />
                </div>

                {/* Sort Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProductSortOpen(!isProductSortOpen)}
                    className="flex items-center justify-center w-[42px] h-[42px] bg-white dark:bg-[#242526] border border-gray-200 dark:border-[#3E4042] rounded-full text-gray-600 dark:text-[#B0B3B8] hover:bg-gray-200 dark:hover:bg-[#3A3B3C] transition-colors shadow-sm"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                  </button>

                  {isProductSortOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsProductSortOpen(false)}></div>
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#242526] rounded-xl shadow-lg border border-gray-100 dark:border-[#3E4042] py-2 z-20 overflow-hidden">
                        <div className="px-3 py-1.5 text-[11px] font-bold text-gray-400 dark:text-[#B0B3B8] uppercase tracking-wider">
                          {t("product.sort_placeholder") || "Urutkan"}
                        </div>
                        {[
                          { id: "popular", label: t("product.sort_popular") || "Populer" },
                          { id: "lowest_price", label: t("product.sort_lowest_price") || "Harga Terendah" },
                          { id: "highest_price", label: t("product.sort_highest_price") || "Harga Tertinggi" },
                          { id: "highest_rating", label: t("product.sort_highest_rating") || "Rating Tertinggi" }
                        ].map((option) => (
                          <button
                            key={option.id}
                            onClick={() => { setProductSort(option.id); setIsProductSortOpen(false); }}
                            className={`w-full text-left px-4 py-2 text-[13px] transition-colors ${productSort === option.id
                              ? "bg-emerald-50 text-emerald-600 dark:bg-[#203D2E] dark:text-emerald-400 font-medium"
                              : "text-gray-700 dark:text-[#E4E6EB] hover:bg-gray-200 dark:hover:bg-[#3A3B3C]"
                              }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {Array.from({ length: 11 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-[#242526] rounded-xl shadow-sm border border-gray-100 dark:border-[#3E4042] overflow-hidden hover:shadow-md transition-shadow flex flex-col group" onClick={() => { setSelectedProduct({ index: i, name: `Template Website Profesional ${i + 1}`, store: `Toko Digital Kreatif ${i + 1}`, price: "Rp 150.000", description: "Template website profesional dengan desain modern, responsif, dan mudah dikustomisasi. Cocok untuk bisnis, portofolio, maupun landing page produk digital Anda." }); setIsProductDetailOpen(true); }}>
                  <div className="aspect-square bg-gray-100 dark:bg-[#3A3B3C] w-full flex items-center justify-center relative overflow-hidden cursor-pointer">
                    <svg className="w-10 h-10 text-gray-300 dark:text-[#4E4F50] group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                  <div className="p-3 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-2" onClick={(e) => e.stopPropagation()}>
                      <div className="w-5 h-5 rounded bg-transparent overflow-hidden shrink-0 flex items-center justify-center">
                        <img src="/produk-placeholder.png" alt="Store" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                      </div>
                      <span className="text-[12px] font-medium text-gray-500 dark:text-[#B0B3B8] truncate hover:underline hover:text-gray-700 dark:hover:text-[#E4E6EB] transition-colors cursor-pointer">Toko Digital Kreatif {i + 1}</span>
                    </div>
                    <h3 className="font-semibold text-[13px] sm:text-[14px] text-black dark:text-[#E4E6EB] line-clamp-2 leading-tight flex-1">Template Website Profesional {i + 1}</h3>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="font-bold text-emerald-500 text-[13px] sm:text-[14px]">Rp 150.000</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Product Detail Right Sidebar */}
      <div
        className={`hidden lg:block fixed right-0 top-[56px] w-[340px] xl:w-[380px] overscroll-contain h-[calc(100vh-56px)] overflow-y-auto bg-[#F0F2F5] dark:bg-[#18191A] sidebar-scrollbar transition-transform duration-300 ease-in-out transform ${isProductDetailOpen ? "translate-x-0" : "translate-x-full"} z-[9999]`}
      >
        {selectedProduct && (
          <div className="p-4">
            <div className="bg-white dark:bg-[#242526] rounded-xl shadow-sm border border-gray-100 dark:border-[#3E4042] overflow-hidden">
              {/* Image / Video */}
              {(() => {
                const url = selectedProduct.videoUrl || "";
                let isDirectVideo = false;
                let embedUrl = "";
                if (url) {
                  if (url.match(/\.(mp4|webm|ogg)$/i)) {
                    isDirectVideo = true;
                    embedUrl = url;
                  } else if (url.includes("youtube.com") || url.includes("youtu.be")) {
                    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
                    if (match && match[1]) {
                      embedUrl = `https://www.youtube.com/embed/${match[1]}`;
                    }
                  } else if (url.includes("tiktok.com/")) {
                    const match = url.match(/video\/(\d+)/);
                    if (match && match[1]) {
                      embedUrl = `https://www.tiktok.com/embed/v2/${match[1]}`;
                    }
                  } else if (url.includes("vimeo.com")) {
                    const match = url.match(/vimeo\.com\/(?:.*#|.*\/)?(\d+)/);
                    if (match && match[1]) {
                      embedUrl = `https://player.vimeo.com/video/${match[1]}`;
                    }
                  }
                }

                return embedUrl ? (
                  <div className="aspect-video bg-gray-100 dark:bg-[#3A3B3C] w-full relative overflow-hidden">
                    {isDirectVideo ? (
                      <video src={embedUrl} controls className="w-full h-full object-cover" />
                    ) : (
                      <iframe width="100%" height="100%" src={embedUrl} title="Video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                    )}
                    <button
                      onClick={() => setIsProductModalOpen(true)}
                      className="absolute top-2 left-2 p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white z-10 transition-colors backdrop-blur-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                    </button>
                    <button
                      onClick={() => setIsProductDetailOpen(false)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white z-10 transition-colors backdrop-blur-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ) : (
                  <div className="aspect-square bg-gray-100 dark:bg-[#3A3B3C] w-full flex items-center justify-center relative overflow-hidden">
                    <svg className="w-12 h-12 text-gray-300 dark:text-[#4E4F50]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <button
                      onClick={() => setIsProductModalOpen(true)}
                      className="absolute top-2 left-2 p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white z-10 transition-colors backdrop-blur-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                    </button>
                    <button
                      onClick={() => setIsProductDetailOpen(false)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white z-10 transition-colors backdrop-blur-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                );
              })()}

              {/* Body */}
              <div className="p-3 flex flex-col">
                {/* Store Row */}
                <div className="flex items-center gap-2 mb-2" onClick={(e) => e.stopPropagation()}>
                  <div className="w-5 h-5 rounded bg-gray-100 dark:bg-[#3A3B3C] overflow-hidden shrink-0 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                    <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg>
                  </div>
                  <span className="text-[12px] font-medium text-gray-500 dark:text-[#B0B3B8] truncate hover:underline hover:text-gray-700 dark:hover:text-[#E4E6EB] transition-colors cursor-pointer">{selectedProduct.store}</span>
                </div>

                {/* Name */}
                <h2 className="font-semibold text-[14px] text-black dark:text-[#E4E6EB] leading-snug mb-2">
                  {selectedProduct.name}
                </h2>

                {/* Badges (Koleksi & Kategori) */}
                {(selectedProduct.collection || selectedProduct.category) && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedProduct.collection && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-orange-500/10 border border-orange-500/20 rounded-md">
                        <svg className="w-3.5 h-3.5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        <span className="text-[11px] font-medium text-orange-500">{selectedProduct.collection}</span>
                      </div>
                    )}
                    {selectedProduct.category && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                        <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                        <span className="text-[11px] font-medium text-emerald-500">{selectedProduct.category}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Description */}
                <div className="mt-1 mb-4">
                  <h3 className="text-[10px] font-bold text-gray-500 dark:text-[#B0B3B8] uppercase tracking-wider mb-1">Deskripsi</h3>
                  <p className="text-[12px] text-gray-600 dark:text-[#B0B3B8] leading-relaxed">
                    {selectedProduct.description}
                  </p>
                </div>

                {/* Price */}
                <div className="flex items-end gap-2 mb-3">
                  {selectedProduct.salePrice ? (
                    <>
                      <div className="text-[18px] font-bold text-emerald-500 leading-none">
                        Rp {Number(selectedProduct.salePrice.toString().replace(/\D/g, '') || 0).toLocaleString('id-ID')}
                      </div>
                      <div className="text-[13px] text-gray-400 dark:text-[#B0B3B8] line-through mb-[1px]">
                        Rp {Number(selectedProduct.price?.toString().replace(/\D/g, '') || 0).toLocaleString('id-ID')}
                      </div>
                    </>
                  ) : (
                    <div className="text-[18px] font-bold text-emerald-500 leading-none">
                      Rp {Number(selectedProduct.price?.toString().replace(/\D/g, '') || 0).toLocaleString('id-ID')}
                    </div>
                  )}
                </div>

                {/* CTA */}
                <div className="flex gap-2 mb-2">
                  <button className="w-11 shrink-0 bg-white dark:bg-[#2A2B2C] hover:bg-gray-50 dark:hover:bg-[#3A3B3C] border border-gray-200 dark:border-gray-700/80 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </button>
                  <button className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 rounded-xl transition-colors text-[14px]">
                    {selectedProduct.ctaType === "custom" && selectedProduct.customCta
                      ? selectedProduct.customCta
                      : (selectedProduct.ctaType ? t(`mydash.cta_${selectedProduct.ctaType}`) : t("product.buy_now") || "Beli Sekarang")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Overlay for product detail on mobile */}
      {isProductDetailOpen && (
        <div className="fixed inset-0 z-[9998] lg:hidden bg-black/50" onClick={() => setIsProductDetailOpen(false)} />
      )}
    </main>
  );
}
