"use client";
import React, { useState, useEffect, useRef } from "react";
import { flushSync, createPortal } from "react-dom";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

import RichTextEditor from "./RichTextEditor";

function useScrollLock(isLocked: boolean) {
  useEffect(() => {
    const sidebar = document.getElementById('mydash-sidebar');
    if (isLocked) {
      if (sidebar) {
        const scrollbarWidth = sidebar.offsetWidth - sidebar.clientWidth;
        sidebar.style.overflow = 'hidden';
        if (scrollbarWidth > 0) {
          sidebar.style.paddingRight = `calc(1.5rem + ${scrollbarWidth}px)`;
        }
      }
      document.body.style.overflow = 'hidden';
    } else {
      if (sidebar) {
        sidebar.style.overflow = '';
        sidebar.style.paddingRight = '';
      }
      document.body.style.overflow = '';
    }
    return () => {
      if (sidebar) {
        sidebar.style.overflow = '';
        sidebar.style.paddingRight = '';
      }
      document.body.style.overflow = '';
    };
  }, [isLocked]);
}

const initialCollections = [
  {
    id: "c1",
    type: "collection",
    title: "Koleksi Ebook & Buku Digital",
    items: [
      { id: "i1", type: "product", title: "THE ULTIMATE BOOK FOR JOB SEEKER" },
      { id: "i2", type: "product", title: "JOB SEEKER ULTIMATE KIT" }
    ]
  },
  {
    id: "c2",
    type: "collection",
    title: "Koleksi Software & Tools",
    items: [
      {
        id: "cat1",
        type: "category",
        title: "Template & Resource",
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
        items: [
          { id: "i3", type: "product", title: "Starter Kit Karir — 4 Template Siap Pakai" },
          { id: "i4", type: "product", title: "Template PPT Pitch Deck Pro" }
        ]
      }
    ]
  },
  {
    id: "c3",
    type: "collection",
    title: "Webinar & Kursus",
    items: [
      { id: "i5", type: "product", title: "Masterclass CV & Interview" },
      { id: "i6", type: "product", title: "Panduan Lengkap LinkedIn" }
    ]
  },
  {
    id: "c4",
    type: "collection",
    title: "Jasa Konsultasi",
    items: [
      { id: "i7", type: "product", title: "Review CV & Portofolio 1on1" }
    ]
  }
];

function ProductPreviewMockup({ product }: { product: any }) {
  const t = useTranslations();

  let embedUrl = "";
  let isDirectVideo = false;

  if (product?.isVideoEnabled && product?.videoUrl) {
    const url = product.videoUrl;

    if (url.match(/\.(mp4|webm|ogg)$/i) || url.includes("cloudinary.com/video/upload") || url.includes("storage.googleapis.com")) {
      embedUrl = url;
      isDirectVideo = true;
    } else if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0];
      if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes("youtube.com/watch")) {
      try {
        const urlParams = new URLSearchParams(url.split("?")[1]);
        const videoId = urlParams.get("v");
        if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;
      } catch (e) { }
    } else if (url.includes("youtube.com/shorts/")) {
      const videoId = url.split("youtube.com/shorts/")[1]?.split("?")[0];
      if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes("vimeo.com/")) {
      const videoId = url.split("vimeo.com/")[1]?.split(/[?\/]/)[0];
      if (videoId) embedUrl = `https://player.vimeo.com/video/${videoId}`;
    } else if (url.includes("tiktok.com/")) {
      const match = url.match(/video\/(\d+)/);
      if (match && match[1]) {
        embedUrl = `https://www.tiktok.com/embed/v2/${match[1]}`;
      }
    }
  }

  return (
    <div className="w-[320px] h-[640px] mx-auto bg-[#1C1D1F] rounded-[40px] border-[8px] border-gray-800 shadow-2xl overflow-hidden relative flex flex-col">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-3xl z-20"></div>

      {/* Container */}
      <div className="relative w-full h-full flex flex-col overflow-y-auto hide-scrollbar bg-[#242526]">

        {/* Top Image Placeholder */}
        <div className="w-full h-[280px] bg-[#3E4042] relative flex items-center justify-center shrink-0">
          <svg className="w-16 h-16 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        </div>

        {/* Content Details */}
        <div className="flex-1 bg-[#242526] p-4 flex flex-col">
          {/* Store Info */}
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 bg-gray-100 rounded flex items-center justify-center shrink-0">
              <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg>
            </div>
            <span className="text-[12px] text-[#B0B3B8]">Toko Digital Kreatif 1</span>
          </div>

          {/* Title */}
          <h2 className="text-[16px] font-bold text-white leading-snug">
            {product?.title || "Produk kamu"}
          </h2>

          {/* Badges (Koleksi & Kategori) */}
          {(product?.collection || product?.category) && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {product?.collection && (
                <div className="flex items-center gap-1 px-2 py-1 bg-orange-500/10 border border-orange-500/20 rounded-md">
                  <svg className="w-3 h-3 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                  <span className="text-[10px] font-medium text-orange-500">{product.collection}</span>
                </div>
              )}
              {product?.category && (
                <div className="flex items-center gap-1 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                  <svg className="w-3 h-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                  <span className="text-[10px] font-medium text-emerald-500">{product.category}</span>
                </div>
              )}
            </div>
          )}

          {/* Description */}
          <div className="mt-3">
            <h3 className="text-[10px] font-bold text-[#B0B3B8] uppercase tracking-wider mb-1">Deskripsi</h3>
            <div
              className="text-[12px] text-[#B0B3B8] leading-relaxed [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4"
              dangerouslySetInnerHTML={{ __html: product?.description || "Template website profesional dengan desain modern, responsif, dan mudah dikustomisasi. Cocok untuk bisnis, portofolio, maupun landing page produk digital Anda." }}
            />
          </div>

          {/* Video Preview */}
          {embedUrl && (
            <div className="mt-4 rounded-xl overflow-hidden aspect-video bg-[#18191A] border border-gray-800 relative">
              {isDirectVideo ? (
                <video src={embedUrl} controls className="w-full h-full object-cover" />
              ) : (
                <iframe
                  width="100%"
                  height="100%"
                  src={embedUrl}
                  title="Video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              )}
            </div>
          )}

          {/* Reviews Placeholder */}
          <div className="mt-4 pt-4 border-t border-gray-700/50">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-[12px] font-bold text-white">{t("mydash.ulasan_pembeli")}</h3>
              <button className="text-[10px] text-emerald-500 font-medium hover:underline">{t("mydash.selengkapnya")}</button>
            </div>
            <div className="bg-[#18191A] rounded-xl p-3 border border-gray-800 flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-700 shrink-0"></div>
              <div className="flex-1 mt-0.5">
                <div className="flex justify-between items-center mb-1.5">
                  <div className="w-16 h-2.5 bg-gray-600 rounded-full"></div>
                  <div className="w-12 h-2 bg-gray-700 rounded-full"></div>
                </div>
                <div className="flex gap-0.5 mb-2">
                  {[1, 2, 3, 4, 5].map(i => (
                    <svg key={i} className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  ))}
                </div>
                <div className="w-full h-2 bg-gray-700 rounded-full mb-1.5"></div>
                <div className="w-3/4 h-2 bg-gray-700 rounded-full"></div>
              </div>
            </div>
            <button className="w-full mt-3 py-2.5 border border-gray-700/80 rounded-lg text-[11px] font-medium text-gray-400 hover:bg-gray-800 hover:text-gray-300 transition-colors flex justify-center items-center gap-1.5">
              {t("mydash.tambah_ulasan_kamu")}
            </button>
          </div>

          <div className="flex-1 min-h-[16px]"></div>

          {/* Price */}
          <div className="flex items-end gap-2 mt-4">
            {product?.salePrice ? (
              <>
                <div className="text-[18px] font-bold text-emerald-500 leading-none">
                  Rp {Number(product.salePrice).toLocaleString('id-ID')}
                </div>
                <div className="text-[13px] text-[#B0B3B8] line-through mb-[1px]">
                  Rp {Number(product?.price || 0).toLocaleString('id-ID')}
                </div>
              </>
            ) : (
              <div className="text-[18px] font-bold text-emerald-500 leading-none">
                Rp {Number(product?.price || 0).toLocaleString('id-ID')}
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="flex gap-2 mt-3">
            <button className="w-11 shrink-0 bg-[#2A2B2C] hover:bg-[#3A3B3C] border border-gray-700/80 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-colors">
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
            <button className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition-colors text-[14px]">
              {product?.ctaType === "custom" && product?.customCta
                ? product.customCta
                : t(`mydash.cta_${product?.ctaType || "buy_now"}`)}
            </button>
          </div>

          {/* Footer Note */}
          <p className="text-center text-[10px] text-[#B0B3B8] mt-3 pb-2">
            {t("product.checkout_at")} <span className="font-bold text-white">LYNK</span>
          </p>

        </div>
      </div>
    </div>
  );
}

function PhonePreviewMockup({ collections }: { collections: any[] }) {
  const [activeCollection, setActiveCollection] = useState<any>(null);

  return (
    <div className="w-[320px] h-[640px] mx-auto bg-white rounded-[40px] border-[8px] border-gray-800 shadow-xl overflow-hidden relative flex flex-col">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-3xl z-20"></div>

      {/* Container for sliding views */}
      <div className="relative w-full h-full flex overflow-hidden hide-scrollbar bg-[#f3f4f6]">
        {/* Main View */}
        <div
          className={`absolute top-0 left-0 w-full h-full p-4 pt-10 overflow-y-auto hide-scrollbar transition-transform duration-300 ease-in-out ${activeCollection ? '-translate-x-full' : 'translate-x-0'}`}
        >
          <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 bg-gray-200 rounded-full mb-3 flex items-center justify-center overflow-hidden border-2 border-white">
              <img src="/produk-placeholder.png" alt="Profile" className="w-full h-full object-cover" />
            </div>
            <h3 className="font-bold text-black">Toko Digital Kreatif</h3>
            <p className="text-sm text-gray-500 mt-1">Mencari Produk</p>
          </div>

          <div className="space-y-3">
            {collections.map((col, idx) => (
              <button
                key={idx}
                onClick={() => setActiveCollection(col)}
                className="w-full flex items-center justify-between bg-white p-3.5 rounded-2xl shadow-sm border border-gray-100 transition-colors group"
                style={{ viewTransitionName: col.id ? `col-${col.id}-preview` : undefined }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                  </div>
                  <span className="font-bold text-[13px] text-gray-800 text-left leading-tight">{col.title}</span>
                </div>
                <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Collection Detail View */}
        <div
          className={`absolute top-0 left-0 w-full h-full bg-[#f3f4f6] flex flex-col transition-transform duration-300 ease-in-out z-10 ${activeCollection ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="p-4 pt-10 pb-4 bg-white border-b border-gray-200 flex items-center gap-3 shrink-0 shadow-sm z-10">
            <button onClick={() => setActiveCollection(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <h3 className="font-bold text-[14px] text-gray-800 truncate flex-1 leading-tight">{activeCollection?.title}</h3>
          </div>

          <div className="flex-1 overflow-y-auto hide-scrollbar p-4">
            <div className="space-y-3">
              {activeCollection?.items.map((item: any, idx: number) => {
                if (item.type === "product") {
                  return (
                    <div key={idx} className="bg-white p-3 rounded-xl flex items-center gap-3 shadow-sm border border-gray-100" style={{ viewTransitionName: item.id ? `item-${item.id}-preview` : undefined }}>
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                        <img src="/produk-placeholder.png" alt="icon" className="w-full h-full object-cover opacity-80" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                      </div>
                      <div className="text-[13px] font-bold text-gray-800 leading-snug">
                        {item.title}
                      </div>
                    </div>
                  );
                } else if (item.type === "category") {
                  return (
                    <div key={idx} className="mb-2 mt-5" style={{ viewTransitionName: item.id ? `item-${item.id}-preview` : undefined }}>
                      <div className="flex items-center gap-1.5 text-gray-500 mb-3 px-1">
                        {item.icon}
                        <h4 className="text-[11px] font-bold uppercase tracking-wider">{item.title}</h4>
                      </div>
                      <div className="space-y-3">
                        {item.items.map((sub: any, sIdx: number) => (
                          <div key={sIdx} className="bg-white p-3 rounded-xl flex items-center gap-3 shadow-sm border border-gray-100" style={{ viewTransitionName: sub.id ? `item-${sub.id}-preview` : undefined }}>
                            <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                              <img src="/produk-placeholder.png" alt="icon" className="w-full h-full object-cover opacity-80" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                            </div>
                            <div className="text-[13px] font-bold text-gray-800 leading-snug">
                              {sub.title}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BuilderProductItem({ item, onMoveUp, onMoveDown, onEdit, onMoveCategory, onMoveCollection, isFirst, isLast, onDelete }: { item: any, onMoveUp?: () => void, onMoveDown?: () => void, onEdit?: () => void, onMoveCategory?: () => void, onMoveCollection?: () => void, isFirst?: boolean, isLast?: boolean, onDelete?: () => void }) {
  const t = useTranslations();
  const [isSettingPopupOpen, setIsSettingPopupOpen] = useState(false);
  const [popupPos, setPopupPos] = useState<{ top?: number, bottom?: number, right: number } | null>(null);
  const settingRef = useRef<HTMLDivElement>(null);
  const settingBtnRef = useRef<HTMLButtonElement>(null);

  const openSettingPopup = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSettingPopupOpen) {
      setIsSettingPopupOpen(false);
      setPopupPos(null);
      return;
    }
    if (settingBtnRef.current) {
      const rect = settingBtnRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;

      if (spaceBelow < 250) {
        setPopupPos({ bottom: window.innerHeight - rect.top + 6, right: window.innerWidth - rect.right });
      } else {
        setPopupPos({ top: rect.bottom + 6, right: window.innerWidth - rect.right });
      }
    }
    setIsSettingPopupOpen(true);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (settingBtnRef.current && !settingBtnRef.current.closest('[data-setting-popup]') && !target.closest('[data-setting-popup]') && !settingBtnRef.current.contains(target)) {
        setIsSettingPopupOpen(false);
        setPopupPos(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useScrollLock(isSettingPopupOpen);

  return (
    <div className="bg-transparent p-3.5 rounded-xl shadow-sm border border-gray-200 dark:border-[#3E4042] flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-[#3A3B3C] transition-colors group" style={{ viewTransitionName: item.id ? `item-${item.id}` : undefined }}>
      <div className="flex-1 flex items-center gap-3 cursor-pointer group/itemclick min-w-0">
        <div className="w-9 h-9 shrink-0 bg-gray-100 dark:bg-[#E4E6EB] rounded-lg flex items-center justify-center overflow-hidden">
          <img src="/produk-placeholder.png" alt="Icon" className="w-full h-full object-cover opacity-80" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
        </div>
        <div className="flex-1 text-[13px] text-gray-700 dark:text-[#E4E6EB] font-medium leading-snug pr-2 truncate group-hover/itemclick:underline">
          {item.title}
        </div>
      </div>
      <div className="relative flex items-center shrink-0" ref={settingRef}>
        <button ref={settingBtnRef} onClick={openSettingPopup} className="text-gray-400 hover:text-gray-600 dark:hover:text-[#E4E6EB] p-1">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" /></svg>
        </button>
        {isSettingPopupOpen && popupPos && createPortal(
          <div
            data-setting-popup
            className="fixed bg-white dark:bg-[#2A2B2C] border border-gray-200 dark:border-[#4E4F50] rounded-xl min-w-[200px] z-50 py-1"
            style={{
              ...(popupPos.top !== undefined ? { top: popupPos.top } : {}),
              ...(popupPos.bottom !== undefined ? { bottom: popupPos.bottom } : {}),
              right: popupPos.right,
              boxShadow: '0 8px 32px rgba(0,0,0,0.22)'
            }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-gray-700 dark:text-[#E4E6EB] hover:bg-gray-100 dark:hover:bg-[#3A3B3C] transition-colors"
              onClick={(e) => { e.stopPropagation(); onEdit?.(); setIsSettingPopupOpen(false); setPopupPos(null); }}
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              {t("mydash.edit_produk")}
            </button>
            <div className="border-t border-gray-100 dark:border-[#3E4042] my-1" />
            <button
              disabled={isFirst}
              className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-gray-700 dark:text-[#E4E6EB] hover:bg-gray-100 dark:hover:bg-[#3A3B3C] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={(e) => { e.stopPropagation(); onMoveUp?.(); setIsSettingPopupOpen(false); setPopupPos(null); }}
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
              {t("mydash.geser_ke_atas")}
            </button>
            <button
              disabled={isLast}
              className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-gray-700 dark:text-[#E4E6EB] hover:bg-gray-100 dark:hover:bg-[#3A3B3C] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={(e) => { e.stopPropagation(); onMoveDown?.(); setIsSettingPopupOpen(false); setPopupPos(null); }}
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              {t("mydash.geser_ke_bawah")}
            </button>
            <div className="border-t border-gray-100 dark:border-[#3E4042] my-1" />
            <button
              className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-gray-700 dark:text-[#E4E6EB] hover:bg-gray-100 dark:hover:bg-[#3A3B3C] transition-colors"
              onClick={(e) => { e.stopPropagation(); onMoveCategory?.(); setIsSettingPopupOpen(false); setPopupPos(null); }}
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
              {t("mydash.pindah_kategori")}
            </button>
            <button
              className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-gray-700 dark:text-[#E4E6EB] hover:bg-gray-100 dark:hover:bg-[#3A3B3C] transition-colors"
              onClick={(e) => { e.stopPropagation(); onMoveCollection?.(); setIsSettingPopupOpen(false); setPopupPos(null); }}
            >
              <img src="/move.svg" alt="Move" className="w-3.5 h-3.5 opacity-50 dark:invert" />
              {t("mydash.pindah_koleksi")}
            </button>
            <div className="border-t border-gray-100 dark:border-[#3E4042] my-1" />
            <button
              className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              onClick={(e) => { e.stopPropagation(); onDelete?.(); setIsSettingPopupOpen(false); setPopupPos(null); }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              {t("mydash.hapus_produk")}
            </button>
          </div>,
          document.body
        )}
      </div>
    </div>
  );
}

function BuilderCategoryItem({ item, onMoveUp, onMoveDown, isFirst, isLast, onMoveSubItemUp, onMoveSubItemDown, onChangeCategory, onDeleteCategory, onEditProduct }: { item: any, onMoveUp?: () => void, onMoveDown?: () => void, isFirst?: boolean, isLast?: boolean, onMoveSubItemUp?: (idx: number) => void, onMoveSubItemDown?: (idx: number) => void, onChangeCategory?: (newCategory: string) => void, onDeleteCategory?: () => void, onEditProduct?: (product: any) => void }) {
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(true);
  const [isMovePopupOpen, setIsMovePopupOpen] = useState(false);
  const [openMovePopupSubIdx, setOpenMovePopupSubIdx] = useState<number | null>(null);
  const [isSettingPopupOpen, setIsSettingPopupOpen] = useState(false);
  const [isChangeCategoryOpen, setIsChangeCategoryOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const [popupPos, setPopupPos] = useState<{ top?: number, bottom?: number, right: number } | null>(null);
  const settingRef = useRef<HTMLDivElement>(null);
  const settingBtnRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const openSettingPopup = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSettingPopupOpen) {
      setIsSettingPopupOpen(false);
      setPopupPos(null);
      return;
    }
    if (settingBtnRef.current) {
      const rect = settingBtnRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;

      if (spaceBelow < 300) {
        setPopupPos({ bottom: window.innerHeight - rect.top + 6, right: window.innerWidth - rect.right });
      } else {
        setPopupPos({ top: rect.bottom + 6, right: window.innerWidth - rect.right });
      }
    }
    setIsSettingPopupOpen(true);
    setIsChangeCategoryOpen(false);
    setCategorySearch('');
  };

  const PRODUCT_CATEGORIES = [
    "AI & Prompt", "Design & Graphics", "Documents & Templates", "Ebook & Digital Books",
    "Courses & Education", "Software & Tools", "Business & Finance", "Social Media",
    "Photo & Video", "Audio & Music", "Gaming", "Website & Development",
    "Career & Professional", "Printables", "3D & Assets", "Font & Typography",
    "Marketing", "Lifestyle", "Membership & Subscription", "Bundle & Resource Pack"
  ];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.move-popup-container')) {
        setIsMovePopupOpen(false);
        setOpenMovePopupSubIdx(null);
      }
      if (settingBtnRef.current && !settingBtnRef.current.closest('[data-setting-popup]') && !target.closest('[data-setting-popup]') && !settingBtnRef.current.contains(target)) {
        setIsSettingPopupOpen(false);
        setIsChangeCategoryOpen(false);
        setPopupPos(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useScrollLock(isSettingPopupOpen);

  return (
    <div className="ml-2 mb-3 mt-4" style={{ viewTransitionName: item.id ? `item-${item.id}` : undefined }}>
      <div className="flex items-center justify-between mb-3 px-1 cursor-pointer select-none group/cat" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center gap-2 text-gray-500 dark:text-[#B0B3B8]">

          {item.icon}
          <h4 className="text-[12px] font-bold uppercase tracking-wider">{item.title}</h4>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex items-center" ref={settingRef} onClick={(e) => { e.stopPropagation(); onEditProduct?.({ type: 'product', title: '', isNew: true }); }}>
            <button
              ref={settingBtnRef}
              onClick={openSettingPopup}
              className="text-gray-400 hover:text-gray-600 dark:text-[#8B8D90] dark:hover:text-[#E4E6EB] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><circle cx="12" cy="12" r="3" strokeWidth={2} /></svg>
            </button>
            {isSettingPopupOpen && popupPos && createPortal(
              <div
                data-setting-popup
                className="fixed bg-white dark:bg-[#2A2B2C] border border-gray-200 dark:border-[#4E4F50] rounded-xl min-w-[220px]"
                style={{
                  ...(popupPos.top !== undefined ? { top: popupPos.top } : {}),
                  ...(popupPos.bottom !== undefined ? { bottom: popupPos.bottom } : {}),
                  right: popupPos.right,
                  zIndex: 99999,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.22)'
                }}
                onMouseDown={(e) => e.stopPropagation()}
              >
                {!isChangeCategoryOpen ? (
                  <div className="flex flex-col py-1">
                    {/* Ubah Kategori */}
                    <button
                      className="w-full flex items-center justify-between gap-2 px-3 py-2 text-[13px] text-gray-700 dark:text-[#E4E6EB] hover:bg-gray-100 dark:hover:bg-[#3A3B3C] transition-colors"
                      onClick={(e) => { e.stopPropagation(); setIsChangeCategoryOpen(true); setTimeout(() => searchInputRef.current?.focus(), 50); setCategorySearch(''); }}
                    >
                      <span className="flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 text-gray-500 dark:text-[#B0B3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        {t("mydash.ubah_kategori")}
                      </span>
                      <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                    </button>
                    <div className="border-t border-gray-100 dark:border-[#3E4042] my-1" />
                    {/* Move Up */}
                    <button
                      disabled={isFirst}
                      className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-gray-700 dark:text-[#E4E6EB] hover:bg-gray-100 dark:hover:bg-[#3A3B3C] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      onClick={(e) => { e.stopPropagation(); onMoveUp?.(); setIsSettingPopupOpen(false); setPopupPos(null); }}
                    >
                      <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" /></svg>
                      {t("mydash.geser_ke_atas")}
                    </button>
                    {/* Move Down */}
                    <button
                      disabled={isLast}
                      className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-gray-700 dark:text-[#E4E6EB] hover:bg-gray-100 dark:hover:bg-[#3A3B3C] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      onClick={(e) => { e.stopPropagation(); onMoveDown?.(); setIsSettingPopupOpen(false); setPopupPos(null); }}
                    >
                      <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                      {t("mydash.geser_ke_bawah")}
                    </button>
                    <div className="border-t border-gray-100 dark:border-[#3E4042] my-1" />
                    {/* Pindah Koleksi */}
                    <button
                      className="w-full flex items-center justify-between gap-2 px-3 py-2 text-[13px] text-gray-700 dark:text-[#E4E6EB] hover:bg-gray-100 dark:hover:bg-[#3A3B3C] transition-colors"
                      onClick={(e) => { e.stopPropagation(); /* TODO: Implement Pindah Koleksi */ setIsSettingPopupOpen(false); setPopupPos(null); }}
                    >
                      <span className="flex items-center gap-2">
                        <img src="/move.svg" alt="Move" className="w-3.5 h-3.5 opacity-50 dark:invert" />
                        {t("mydash.pindah_koleksi")}
                      </span>
                    </button>
                    <div className="border-t border-gray-100 dark:border-[#3E4042] my-1" />
                    <button
                      className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      onClick={(e) => { e.stopPropagation(); onDeleteCategory?.(); setIsSettingPopupOpen(false); setPopupPos(null); }}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      {t("mydash.hapus_kategori")}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col h-full max-h-[250px] min-w-[220px]">
                    <div className="flex items-center gap-2 px-2 py-2 border-b border-gray-100 dark:border-[#3E4042] shrink-0">
                      <button onClick={(e) => { e.stopPropagation(); setIsChangeCategoryOpen(false); }} className="p-1 hover:bg-gray-100 dark:hover:bg-[#3A3B3C] rounded-lg text-gray-500 dark:text-gray-400 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                      </button>
                      <span className="text-[13px] font-bold text-gray-700 dark:text-[#E4E6EB]">{t("mydash.ubah_kategori")}</span>
                    </div>
                    <div className="px-2 py-2 border-b border-gray-100 dark:border-[#3E4042] shrink-0">
                      <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-[#3A3B3C] rounded-lg px-2 py-1.5">
                        <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" /></svg>
                        <input
                          ref={searchInputRef}
                          type="text"
                          placeholder={t("mydash.cari_kategori")}
                          value={categorySearch}
                          onChange={(e) => setCategorySearch(e.target.value)}
                          onClick={(e) => { e.stopPropagation(); onEditProduct?.({ type: 'product', title: '', isNew: true }); }}
                          onMouseDown={(e) => e.stopPropagation()}
                          className="flex-1 bg-transparent text-[12px] text-gray-700 dark:text-[#E4E6EB] placeholder-gray-400 dark:placeholder-[#8B8D90] outline-none min-w-0"
                        />
                        {categorySearch && (
                          <button onClick={(e) => { e.stopPropagation(); setCategorySearch(''); searchInputRef.current?.focus(); }} className="text-gray-400 hover:text-gray-600 dark:hover:text-[#E4E6EB]">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="overflow-y-auto flex-1 p-1 sidebar-scrollbar">
                      {PRODUCT_CATEGORIES.filter(cat => cat.toLowerCase().includes(categorySearch.toLowerCase())).length === 0 ? (
                        <div className="px-4 py-4 text-[12px] text-gray-400 dark:text-[#8B8D90] text-center">{t("mydash.tidak_ada_hasil")}</div>
                      ) : (
                        PRODUCT_CATEGORIES.filter(cat => cat.toLowerCase().includes(categorySearch.toLowerCase())).map((cat) => (
                          <button
                            key={cat}
                            className={`w-full text-left px-3 py-2 rounded-md text-[12.5px] transition-colors hover:bg-gray-100 dark:hover:bg-[#3A3B3C] flex items-center gap-2 ${item.title === cat
                              ? 'text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-900/20'
                              : 'text-gray-600 dark:text-[#B0B3B8]'
                              }`}
                            onClick={(e) => { e.stopPropagation(); onChangeCategory?.(cat); setIsSettingPopupOpen(false); setIsChangeCategoryOpen(false); setCategorySearch(''); setPopupPos(null); }}
                          >
                            {item.title === cat && <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                            <span className={item.title === cat ? '' : 'pl-5'}>{cat}</span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>,
              document.body
            )}
          </div>
          <button className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/40 px-1.5 py-1 rounded-md hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors" onClick={(e) => { e.stopPropagation(); onEditProduct?.({ type: 'product', title: '', isNew: true }); }}>
            + Produk
          </button>
          <div className="text-gray-400 dark:text-[#8B8D90] transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="space-y-3">
          {item.items.map((subItem: any, subIdx: number) => (
            <BuilderProductItem
              key={subIdx}
              item={subItem}
              isFirst={subIdx === 0}
              isLast={subIdx === item.items.length - 1}
              onMoveUp={() => onMoveSubItemUp?.(subIdx)}
              onMoveDown={() => onMoveSubItemDown?.(subIdx)}
              onEdit={() => onEditProduct?.(subItem)}
              onMoveCategory={() => console.log('Move to Category')}
              onMoveCollection={() => console.log('Move to Collection')}
              onDelete={() => console.log('Delete product')}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BuilderCollectionItem({ collection, index, updateTitle, deleteCollection, moveCollection, moveItem, moveSubItem, changeCategoryTitle, deleteCategoryItem, isFirst, isLast, onEditProduct }: { collection: any, index: number, updateTitle: (idx: number, title: string) => void, deleteCollection: (idx: number) => void, moveCollection: (idx: number, dir: 'up' | 'down') => void, moveItem: (colIdx: number, itemIdx: number, dir: 'up' | 'down') => void, moveSubItem: (colIdx: number, itemIdx: number, subIdx: number, dir: 'up' | 'down') => void, changeCategoryTitle: (colIdx: number, itemIdx: number, newTitle: string) => void, deleteCategoryItem: (colIdx: number, itemIdx: number) => void, isFirst: boolean, isLast: boolean, onEditProduct?: (product: any) => void }) {
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isMovePopupOpen, setIsMovePopupOpen] = useState(false);
  const [openMovePopupItemIdx, setOpenMovePopupItemIdx] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isSettingPopupOpen, setIsSettingPopupOpen] = useState(false);
  const [popupPos, setPopupPos] = useState<{ top?: number, bottom?: number, right: number } | null>(null);
  const settingRef = useRef<HTMLDivElement>(null);
  const settingBtnRef = useRef<HTMLButtonElement>(null);

  const openSettingPopup = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSettingPopupOpen) {
      setIsSettingPopupOpen(false);
      setPopupPos(null);
      return;
    }
    if (settingBtnRef.current) {
      const rect = settingBtnRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;

      if (spaceBelow < 200) {
        setPopupPos({ bottom: window.innerHeight - rect.top + 6, right: window.innerWidth - rect.right });
      } else {
        setPopupPos({ top: rect.bottom + 6, right: window.innerWidth - rect.right });
      }
    }
    setIsSettingPopupOpen(true);
  };

  useEffect(() => {
    if (collection.isNew) {
      containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setIsEditing(true);
    }
  }, [collection.isNew]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (collection.isNew) {
        inputRef.current.select();
      }
    }
  }, [isEditing, collection.isNew]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.move-popup-container')) {
        setIsMovePopupOpen(false);
        setOpenMovePopupItemIdx(null);
      }
      if (settingBtnRef.current && !settingBtnRef.current.closest('[data-setting-popup]') && !target.closest('[data-setting-popup]') && !settingBtnRef.current.contains(target)) {
        setIsSettingPopupOpen(false);
        setPopupPos(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useScrollLock(isSettingPopupOpen);

  return (
    <div className="mb-6" ref={containerRef} style={{ viewTransitionName: collection.id ? `col-${collection.id}` : undefined }}>
      {/* Collection Header */}
      <div className="flex items-center justify-between mb-3 px-1 cursor-pointer select-none group/col" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center gap-2 flex-1 min-w-0 pr-3">

          <div className="w-7 h-7 shrink-0 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          </div>
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={collection.title}
              onChange={(e) => updateTitle(index, e.target.value)}
              onClick={(e) => { e.stopPropagation(); onEditProduct?.({ type: 'product', title: '', isNew: true }); }}
              onBlur={() => setIsEditing(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setIsEditing(false);
              }}
              className="text-[14px] font-bold text-gray-800 dark:text-[#E4E6EB] bg-white dark:bg-[#2A2B2C] outline-none p-1 -ml-1 border border-emerald-500/50 rounded-md shadow-sm w-full"
            />
          ) : (
            <div
              className="flex items-center gap-1.5 group/title cursor-text min-w-0"
              onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
            >
              <h3
                className="text-[14px] font-bold text-gray-800 dark:text-[#E4E6EB] truncate group-hover/title:text-gray-500 dark:group-hover/title:text-[#B0B3B8] transition-colors"
              >
                {collection.title}
              </h3>
              <div className="text-gray-400 opacity-0 group-hover/title:opacity-100 transition-opacity shrink-0">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative flex items-center" ref={settingRef} onClick={(e) => { e.stopPropagation(); onEditProduct?.({ type: 'product', title: '', isNew: true }); }}>
            <button
              ref={settingBtnRef}
              onClick={openSettingPopup}
              className="text-gray-400 hover:text-gray-600 dark:text-[#8B8D90] dark:hover:text-[#E4E6EB] transition-colors p-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><circle cx="12" cy="12" r="3" strokeWidth={2} /></svg>
            </button>
            {isSettingPopupOpen && popupPos && createPortal(
              <div
                data-setting-popup
                className="fixed bg-white dark:bg-[#2A2B2C] border border-gray-200 dark:border-[#4E4F50] rounded-xl min-w-[180px] z-50"
                style={{
                  ...(popupPos.top !== undefined ? { top: popupPos.top } : {}),
                  ...(popupPos.bottom !== undefined ? { bottom: popupPos.bottom } : {}),
                  right: popupPos.right,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.22)'
                }}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <button
                  disabled={isFirst}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-[13px] text-gray-700 dark:text-[#E4E6EB] hover:bg-gray-100 dark:hover:bg-[#3A3B3C] transition-colors rounded-t-xl disabled:opacity-40 disabled:cursor-not-allowed"
                  onClick={(e) => { e.stopPropagation(); moveCollection(index, 'up'); setIsSettingPopupOpen(false); setPopupPos(null); }}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" /></svg>
                  {t("mydash.geser_ke_atas")}
                </button>
                <button
                  disabled={isLast}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-[13px] text-gray-700 dark:text-[#E4E6EB] hover:bg-gray-100 dark:hover:bg-[#3A3B3C] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  onClick={(e) => { e.stopPropagation(); moveCollection(index, 'down'); setIsSettingPopupOpen(false); setPopupPos(null); }}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                  {t("mydash.geser_ke_bawah")}
                </button>
                <div className="border-t border-gray-100 dark:border-[#3E4042]" />
                <button
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-[13px] text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors rounded-b-xl"
                  onClick={(e) => { e.stopPropagation(); deleteCollection(index); setIsSettingPopupOpen(false); setPopupPos(null); }}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  {t("mydash.hapus_koleksi")}
                </button>
              </div>,
              document.body
            )}
          </div>
          {collection.items.length > 0 && (
            <button className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/40 px-2 py-1 rounded-md hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors" onClick={(e) => { e.stopPropagation(); onEditProduct?.({ type: 'product', title: '', isNew: true }); }}>
              + {t("mydash.tambah")}
            </button>
          )}
          <div className="text-gray-400 dark:text-[#8B8D90] transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
      </div>

      {isOpen && (
        <>
          {/* Collection Items */}
          <div className="space-y-3 pl-3 border-l-[3px] border-gray-100 dark:border-[#3E4042] ml-3">
            {collection.items.map((item: any, itemIdx: number) => {
              if (item.type === "product") {
                return (
                  <BuilderProductItem
                    key={itemIdx}
                    item={item}
                    isFirst={itemIdx === 0}
                    isLast={itemIdx === collection.items.length - 1}
                    onMoveUp={() => moveItem(index, itemIdx, 'up')}
                    onMoveDown={() => moveItem(index, itemIdx, 'down')}
                    onEdit={() => onEditProduct?.(item)}
                    onMoveCategory={() => console.log('Move to Category')}
                    onMoveCollection={() => console.log('Move to Collection')}
                    onDelete={() => console.log('Delete product')}
                  />
                );
              } else if (item.type === "category") {
                return <BuilderCategoryItem key={itemIdx} item={item} onMoveUp={() => moveItem(index, itemIdx, 'up')} onMoveDown={() => moveItem(index, itemIdx, 'down')} onMoveSubItemUp={(subIdx) => moveSubItem(index, itemIdx, subIdx, 'up')} onMoveSubItemDown={(subIdx) => moveSubItem(index, itemIdx, subIdx, 'down')} onChangeCategory={(newCat) => changeCategoryTitle(index, itemIdx, newCat)} onDeleteCategory={() => deleteCategoryItem(index, itemIdx)}
                  onEditProduct={onEditProduct} isFirst={itemIdx === 0} isLast={itemIdx === collection.items.length - 1} />;
              }
              return null;
            })}
          </div>

          {/* CTA buttons inside Collection */}
          {collection.items.length === 0 && (
            <div className="flex items-center gap-2 mt-2 ml-6">
              <button className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 hover:text-emerald-600 dark:text-[#B0B3B8] dark:hover:text-emerald-400 bg-white hover:bg-emerald-50 dark:bg-[#2A2B2C] dark:hover:bg-emerald-900/30 px-3 py-1.5 rounded-lg transition-colors border border-gray-200 dark:border-[#4E4F50] shadow-sm">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                {t("mydash.add_category")}
              </button>
              <button className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 hover:text-emerald-600 dark:text-[#B0B3B8] dark:hover:text-emerald-400 bg-white hover:bg-emerald-50 dark:bg-[#2A2B2C] dark:hover:bg-emerald-900/30 px-3 py-1.5 rounded-lg transition-colors border border-gray-200 dark:border-[#4E4F50] shadow-sm">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                {t("mydash.add_product")}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}


const COLOR_PALETTE = [
  "#000000", "#434343", "#666666", "#999999", "#b7b7b7", "#cccccc", "#d9d9d9", "#efefef", "#f3f3f3", "#ffffff",
  "#980000", "#ff0000", "#ff9900", "#ffff00", "#00ff00", "#00ffff", "#4a86e8", "#0000ff", "#9900ff", "#ff00ff",
  "#e6b8af", "#f4cccc", "#fce5cd", "#fff2cc", "#d9ead3", "#d0e0e3", "#c9daf8", "#cfe2f3", "#d9d2e9", "#ead1dc",
  "#dd7e6b", "#ea9999", "#f9cb9c", "#ffe599", "#b6d7a8", "#a2c4c9", "#a4c2f4", "#9fc5e8", "#b4a7d6", "#d5a6bd",
  "#cc4125", "#e06666", "#f6b26b", "#ffd966", "#93c47d", "#76a5af", "#6d9eeb", "#6fa8dc", "#8e7cc3", "#c27ba0",
  "#a61c00", "#cc0000", "#e69138", "#f1c232", "#6aa84f", "#45818e", "#3c78d8", "#3d85c6", "#674ea7", "#a64d79",
  "#85200c", "#990000", "#b45f06", "#bf9000", "#38761d", "#134f5c", "#1155cc", "#0b5394", "#351c75", "#741b47"
];

function ProductEditForm({ product, onClose, onChange }: { product: any, onClose: () => void, onChange?: (updatedProduct: any) => void }) {
  const t = useTranslations();
  const [isVideoEnabled, setIsVideoEnabled] = useState(product?.isVideoEnabled || false);
  const [platform, setPlatform] = useState("lynk");
  const [productLayout, setProductLayout] = useState("grid");
  const [ctaType, setCtaType] = useState(product?.ctaType || "buy_now");
  const [isCtaDropdownOpen, setIsCtaDropdownOpen] = useState(false);
  const [customCta, setCustomCta] = useState(product?.customCta || "");
  const [category, setCategory] = useState("");
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isLibraryCategoryDropdownOpen, setIsLibraryCategoryDropdownOpen] = useState(false);
  const [collection, setCollection] = useState("");
  const [isCollectionDropdownOpen, setIsCollectionDropdownOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");

  const dbCategories: string[] = [];
  const dbCollections: string[] = [];
  const libraryCategories = [
    { id: "ai_prompt", label: "AI & Prompt", icon: <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> },
    { id: "design_graphics", label: "Design & Graphics", icon: <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
    { id: "documents_templates", label: "Documents & Templates", icon: <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg> },
    { id: "ebook_digital_books", label: "Ebook & Digital Books", icon: <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg> },
    { id: "courses_education", label: "Courses & Education", icon: <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg> },
    { id: "software_tools", label: "Software & Tools", icon: <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> },
    { id: "business_finance", label: "Business & Finance", icon: <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
    { id: "social_media", label: "Social Media", icon: <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg> },
    { id: "photo_video", label: "Photo & Video", icon: <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
    { id: "audio_music", label: "Audio & Music", icon: <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg> },
    { id: "gaming", label: "Gaming", icon: <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { id: "website_development", label: "Website & Development", icon: <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg> },
    { id: "career_professional", label: "Career & Professional", icon: <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> },
    { id: "printables", label: "Printables", icon: <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg> },
    { id: "3d_assets", label: "3D & Assets", icon: <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg> },
    { id: "font_typography", label: "Font & Typography", icon: <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg> },
    { id: "marketing", label: "Marketing", icon: <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg> },
    { id: "lifestyle", label: "Lifestyle", icon: <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg> },
    { id: "membership_subscription", label: "Membership & Subscription", icon: <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg> },
    { id: "bundle_resource_pack", label: "Bundle & Resource Pack", icon: <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg> }
  ];

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#1C1D1F] animate-in slide-in-from-right-4 duration-300">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 px-6 pt-8">
        <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-[#3A3B3C] rounded-lg transition-colors text-gray-500 dark:text-[#B0B3B8]">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h2 className="text-[16px] font-bold text-gray-800 dark:text-[#E4E6EB]">{t("mydash.detail")}</h2>
      </div>

      <div className="flex-1 overflow-y-auto sidebar-scrollbar px-6 pb-10 space-y-6">

        {/* Gambar dan Judul */}
        <div className="flex gap-4">
          <div className="space-y-2 shrink-0">
            <label className="text-[15px] font-semibold text-gray-800 dark:text-white">{t("mydash.gambar")}</label>
            <div className="w-[80px] h-[80px] border border-dashed border-gray-300 dark:border-[#4E4F50] rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#3A3B3C] transition-colors">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <span className="text-[10px] text-gray-400 text-center leading-tight">Tambahkan<br />{t("mydash.gambar")}</span>
            </div>
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex items-center justify-between">
              <label className="text-[15px] font-semibold text-gray-800 dark:text-white">{t("mydash.judul_produk")}</label>
              <span className="text-[11px] text-gray-400">{product?.title?.length || 0}/41</span>
            </div>
            <input type="text" maxLength={41} placeholder={t("mydash.judul_produk")} value={product?.title || ""} onChange={(e) => onChange?.({ title: e.target.value })} className="w-full border border-gray-300 dark:border-[#4E4F50] bg-white dark:bg-[#242526] text-[13px] rounded-lg px-3 py-2 text-gray-700 dark:text-[#E4E6EB] outline-none focus:border-emerald-500 placeholder-gray-400" />
          </div>
        </div>

        {/* Keterangan */}
        <div className="space-y-2">
          <label className="text-[15px] font-semibold text-gray-800 dark:text-white">{t("mydash.keterangan")}</label>
          <RichTextEditor
            value={product?.description || ''}
            onChange={(html) => onChange?.({ description: html })}
            placeholder={t("mydash.tuliskan_keterangan")}
            minHeight={150}
          />
        </div>

        {/* Video */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <label className="text-[15px] font-semibold text-gray-800 dark:text-white">{t("mydash.tambahkan_video")}</label>
              <div className="relative group flex items-center">
                <svg className="w-3.5 h-3.5 text-gray-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-[max-content] max-w-[200px] bg-gray-800 text-white text-[11px] px-2.5 py-1.5 rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-lg text-center pointer-events-none z-50">
                  {t("mydash.tooltip_info_video")}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                </div>
              </div>
            </div>
            <button
              onClick={() => { setIsVideoEnabled(!isVideoEnabled); onChange?.({ isVideoEnabled: !isVideoEnabled }); }}
              className={`w-9 h-5 rounded-full relative transition-colors ${isVideoEnabled ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-[#4E4F50]'}`}
            >
              <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-[3px] transition-transform ${isVideoEnabled ? 'left-[19px]' : 'left-[3px]'}`}></div>
            </button>
          </div>
          {isVideoEnabled && (
            <input type="text" value={product?.videoUrl || ""} onChange={(e) => onChange?.({ videoUrl: e.target.value })} placeholder={t("mydash.tempel_url_youtube")} className="w-full border border-gray-300 dark:border-[#4E4F50] bg-white dark:bg-[#242526] text-[13px] rounded-lg px-3 py-2 text-gray-700 dark:text-[#E4E6EB] outline-none focus:border-emerald-500 placeholder-gray-400" />
          )}
        </div>

        {/* Platform */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5">
            <label className="text-[15px] font-semibold text-gray-800 dark:text-white">{t("mydash.platform")}</label>
            <div className="relative group flex items-center">
              <svg className="w-3.5 h-3.5 text-emerald-500 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-[max-content] max-w-[200px] bg-gray-800 text-white text-[11px] px-2.5 py-1.5 rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-lg text-center pointer-events-none z-50">
                {t("mydash.tooltip_info_platform")}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
              </div>
            </div>
          </div>

          <div className="border border-dashed border-gray-300 dark:border-[#4E4F50] rounded-xl p-4 space-y-4">
            <div className="flex flex-wrap gap-2">
              {["LYNK", t("mydash.mengunggah"), "PDF/Ebook", "G-drive", t("mydash.lainnya")].map(p => (
                <div key={p} className="relative group">
                  <button
                    onClick={() => p === "LYNK" && setPlatform(p.toLowerCase())}
                    disabled={p !== "LYNK"}
                    className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors border ${p !== "LYNK"
                      ? "bg-white dark:bg-[#242526] text-red-500 border-red-500 opacity-70 cursor-not-allowed"
                      : platform === p.toLowerCase()
                        ? "bg-emerald-500 text-white border-emerald-500"
                        : "bg-white dark:bg-[#242526] text-emerald-600 dark:text-emerald-400 border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                      }`}
                  >
                    {p}
                  </button>
                  {p !== "LYNK" && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-[max-content] max-w-[200px] bg-gray-800 text-white text-[11px] px-2.5 py-1.5 rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-lg text-center pointer-events-none z-50">
                      {t("mydash.tooltip_payment")}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="relative pt-1">
              <input
                type="text"
                placeholder="http://lynk.id/username/produk/checkout"
                className="w-full bg-transparent border-b border-gray-300 dark:border-[#4E4F50] text-[13px] px-1 py-2 text-gray-700 dark:text-[#E4E6EB] outline-none focus:border-emerald-500 placeholder-gray-400"
              />
              <p className="text-[11px] text-red-500 mt-2">{t("mydash.bantuan_lynk")}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 gap-4 mt-2 items-start">
          {/* Kategori */}
          <div className="relative">
            <label className="block mb-1.5 text-[15px] font-semibold text-gray-800 dark:text-white">{t("mydash.pilih_kategori")}</label>
            <button onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)} className="w-full flex items-center justify-between border border-gray-300 dark:border-[#4E4F50] bg-white dark:bg-[#242526] text-[13px] rounded-lg px-3 py-2 text-gray-700 dark:text-[#E4E6EB] focus:outline-none focus:border-emerald-500 transition-colors">
              {category === "create_new" ? t("mydash.buat_kategori") : (category || t("mydash.pilih_kategori"))}
              <svg className={`w-4 h-4 text-gray-500 transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {isCategoryDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-[#2A2B2C] border border-gray-200 dark:border-[#4E4F50] rounded-xl shadow-lg py-1.5 top-full">
                {dbCategories.map(cat => (
                  <button key={cat} onClick={() => { setCategory(cat); onChange?.({ category: cat }); setIsCategoryDropdownOpen(false); }} className={`w-full text-left px-4 py-2 text-[13px] transition-colors ${category === cat ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'text-gray-700 dark:text-[#E4E6EB] hover:bg-gray-50 dark:hover:bg-[#3A3B3C]'}`}>
                    {cat}
                  </button>
                ))}
                <button onClick={() => { setCategory("create_new"); setIsCategoryDropdownOpen(false); }} className={`w-full text-left px-4 py-2 text-[13px] font-medium transition-colors ${category === 'create_new' ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-[#3A3B3C]'}`}>
                  + {t("mydash.buat_kategori")}
                </button>
              </div>
            )}
            {category === "create_new" && (
              <div className="relative mt-2 animate-in slide-in-from-top-2 fade-in duration-200">
                <button onClick={() => setIsLibraryCategoryDropdownOpen(!isLibraryCategoryDropdownOpen)} className="w-full flex items-center justify-between border border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-900/10 text-[13px] rounded-lg px-3 py-2 text-gray-700 dark:text-[#E4E6EB] focus:outline-none focus:border-emerald-500 transition-colors">
                  {newCategoryName || t("mydash.pilih_dari_pustaka_kategori")}
                  <svg className={`w-4 h-4 text-gray-500 transition-transform ${isLibraryCategoryDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                {isLibraryCategoryDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-[#2A2B2C] border border-gray-200 dark:border-[#4E4F50] rounded-xl shadow-lg py-1.5 top-full max-h-64 overflow-y-auto">
                    {libraryCategories.map(cat => (
                      <button key={cat.id} onClick={() => { setNewCategoryName(cat.label); onChange?.({ category: cat.label }); setIsLibraryCategoryDropdownOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2 text-[13px] transition-colors ${newCategoryName === cat.label ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'text-gray-700 dark:text-[#E4E6EB] hover:bg-gray-50 dark:hover:bg-[#3A3B3C]'}`}>
                        {cat.icon}
                        <span>{cat.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Koleksi */}
          <div className="relative">
            <label className="block mb-1.5 text-[15px] font-semibold text-gray-800 dark:text-white">{t("mydash.pilih_koleksi")}</label>
            <button onClick={() => setIsCollectionDropdownOpen(!isCollectionDropdownOpen)} className="w-full flex items-center justify-between border border-gray-300 dark:border-[#4E4F50] bg-white dark:bg-[#242526] text-[13px] rounded-lg px-3 py-2 text-gray-700 dark:text-[#E4E6EB] focus:outline-none focus:border-emerald-500 transition-colors">
              {collection === "create_new" ? t("mydash.buat_koleksi") : (collection || t("mydash.pilih_koleksi"))}
              <svg className={`w-4 h-4 text-gray-500 transition-transform ${isCollectionDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {isCollectionDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-[#2A2B2C] border border-gray-200 dark:border-[#4E4F50] rounded-xl shadow-lg py-1.5 top-full">
                {dbCollections.map(col => (
                  <button key={col} onClick={() => { setCollection(col); onChange?.({ collection: col }); setIsCollectionDropdownOpen(false); }} className={`w-full text-left px-4 py-2 text-[13px] transition-colors ${collection === col ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'text-gray-700 dark:text-[#E4E6EB] hover:bg-gray-50 dark:hover:bg-[#3A3B3C]'}`}>
                    {col}
                  </button>
                ))}
                <button onClick={() => { setCollection("create_new"); setIsCollectionDropdownOpen(false); }} className={`w-full text-left px-4 py-2 text-[13px] font-medium transition-colors ${collection === 'create_new' ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-[#3A3B3C]'}`}>
                  + {t("mydash.buat_koleksi")}
                </button>
              </div>
            )}
            {collection === "create_new" && (
              <input type="text" value={newCollectionName} onChange={(e) => { setNewCollectionName(e.target.value); onChange?.({ collection: e.target.value }); }} placeholder={t("mydash.nama_koleksi_baru")} className="w-full mt-2 border border-gray-300 dark:border-[#4E4F50] bg-white dark:bg-[#242526] text-[13px] rounded-lg px-3 py-2 text-gray-700 dark:text-[#E4E6EB] outline-none focus:border-emerald-500 animate-in slide-in-from-top-2 fade-in duration-200" />
            )}
          </div>
        </div>

        {/* Produk layout */}
        <div className="mt-6">
          <label className="block mb-3 text-[15px] font-semibold text-gray-800 dark:text-white">{t("mydash.produk_layout")}</label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: "grid", img: "grid.png", label: t("mydash.layout_grid") },
              { id: "list", img: "list.png", label: t("mydash.layout_list") },
              { id: "large", img: "large.png", label: t("mydash.layout_large_image") },
              { id: "cta", img: "compact.png", label: t("mydash.layout_cta") }
            ].map(layout => (
              <button
                key={layout.id}
                onClick={() => setProductLayout(layout.id)}
                className={`flex flex-col items-center gap-1.5 p-1.5 rounded-xl border transition-colors ${productLayout === layout.id ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 shadow-sm' : 'border-gray-200 dark:border-[#4E4F50] hover:border-emerald-300 dark:hover:border-emerald-700 bg-white dark:bg-[#242526]'}`}
              >
                <span className={`text-[10px] font-medium w-full text-center leading-tight truncate px-0.5 ${productLayout === layout.id ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-600 dark:text-[#B0B3B8]'}`}>{layout.label}</span>
                <div className="w-full aspect-[4/5] bg-gray-50 dark:bg-[#18191A] rounded flex items-center justify-center overflow-hidden border border-gray-100 dark:border-[#3A3B3C]">
                  <img src={`/${layout.img}`} alt={layout.label} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Price */}
        <div className="space-y-3 mt-6">
          <label className="text-[15px] font-semibold text-gray-800 dark:text-white">{t("mydash.harga")}</label>
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <span className="absolute left-3 top-[9px] text-[14px] text-gray-500">Rp</span>
              <input type="text" value={product?.price ? Number(product.price).toLocaleString('id-ID') : ""} onChange={(e) => onChange?.({ price: e.target.value.replace(/\D/g, '') })} placeholder="0" className="w-full border border-gray-300 dark:border-[#4E4F50] bg-white dark:bg-[#242526] text-[14px] rounded-lg pl-9 pr-3 py-2 text-gray-700 dark:text-[#E4E6EB] outline-none focus:border-emerald-500" />
            </div>
            <div className="relative">
              <span className="absolute left-3 top-[9px] text-[14px] text-gray-500">Rp</span>
              <input type="text" value={product?.salePrice ? Number(product.salePrice).toLocaleString('id-ID') : ""} onChange={(e) => onChange?.({ salePrice: e.target.value.replace(/\D/g, '') })} placeholder={t("mydash.sale_price")} className="w-full border border-gray-300 dark:border-[#4E4F50] bg-white dark:bg-[#242526] text-[14px] rounded-lg pl-9 pr-3 py-2 text-gray-700 dark:text-[#E4E6EB] outline-none focus:border-emerald-500 placeholder-gray-400" />
            </div>
          </div>
        </div>

        {/* Dropdown */}
        <div className="mt-6 pb-6 space-y-3 relative w-1/2">
          <label className="text-[15px] font-semibold text-gray-800 dark:text-white">{t("mydash.purchase_button")}</label>
          <div className="relative">
            <button onClick={() => setIsCtaDropdownOpen(!isCtaDropdownOpen)} className="w-full flex items-center justify-between border border-gray-300 dark:border-[#4E4F50] bg-white dark:bg-[#242526] text-[14px] rounded-lg px-4 py-2.5 text-gray-700 dark:text-[#E4E6EB] focus:outline-none focus:border-emerald-500 transition-colors">
              {t(`mydash.cta_${ctaType}`)}
              <svg className={`w-4 h-4 text-gray-500 transition-transform ${isCtaDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>

            {isCtaDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-[#2A2B2C] border border-gray-200 dark:border-[#4E4F50] rounded-xl shadow-lg py-2 top-auto bottom-full mb-1">
                {[
                  { id: "i_want_this", label: t("mydash.cta_i_want_this") },
                  { id: "buy_now", label: t("mydash.cta_buy_now") },
                  { id: "support", label: t("mydash.cta_support") },
                  { id: "book_now", label: t("mydash.cta_book_now") },
                  { id: "custom", label: t("mydash.cta_custom") }
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => { setCtaType(opt.id); onChange?.({ ctaType: opt.id }); setIsCtaDropdownOpen(false); }}
                    className={`w-full flex items-center justify-center px-4 py-2.5 text-[14px] transition-colors ${ctaType === opt.id ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'text-gray-700 dark:text-[#E4E6EB] hover:bg-gray-50 dark:hover:bg-[#3A3B3C]'}`}
                  >
                    {opt.label}
                    {opt.id === "custom" && (
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4 ml-1.5 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {ctaType === "custom" && (
            <div className="animate-in slide-in-from-top-2 fade-in duration-200">
              <input
                type="text"
                maxLength={10}
                value={customCta}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                  setCustomCta(val);
                  onChange?.({ customCta: val });
                }}
                placeholder={t("mydash.custom_cta_placeholder")}
                className="w-full border border-gray-300 dark:border-[#4E4F50] bg-white dark:bg-[#242526] text-[14px] rounded-lg px-3 py-2 text-gray-700 dark:text-[#E4E6EB] outline-none focus:border-emerald-500 placeholder-gray-400"
              />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 mb-6 flex items-center justify-end gap-3 pt-6 border-t border-gray-200 dark:border-[#4E4F50]">
          <button onClick={onClose} className="px-5 py-2 text-[14px] font-medium text-gray-600 dark:text-[#B0B3B8] hover:text-gray-900 dark:hover:text-white transition-colors">
            {t("mydash.batal")}
          </button>
          <button onClick={onClose} className="px-5 py-2 text-[14px] font-medium bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors shadow-sm">
            {t("mydash.simpan_produk")}
          </button>
        </div>

      </div>
    </div>
  );
}

export default function MyDashPage() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [isDarkMode, setIsDarkMode] = useState(true);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [themeLoaded, setThemeLoaded] = useState(false);
  const [currentUser] = useState({ id: "1", name: "User", username: "user" });
  const [activeTab, setActiveTab] = useState<"store" | "produk" | "tampilan" | "settings">("store");
  const [collections, setCollections] = useState<any[]>(initialCollections);
  const locale = useLocale();

  useEffect(() => {
    const productParam = searchParams.get("product");
    if (productParam === "new") {
      setEditingProduct({ isNew: true });
      setActiveTab("produk");
    } else if (productParam === "123") {
      setEditingProduct({ id: "123", title: "Mock Edit Product" });
      setActiveTab("produk");
    } else {
      setEditingProduct(null);
    }
  }, [searchParams]);
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const settingsBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (settingsBtnRef.current && !settingsBtnRef.current.contains(target) && !target.closest('.settings-popup-container')) {
        setIsSettingsMenuOpen(false);
        setIsLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useScrollLock(isSettingsMenuOpen);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem("theme", newTheme ? "dark" : "light");
    if (newTheme) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleTabChange = (tab: "store" | "produk" | "tampilan" | "settings") => {
    setActiveTab(tab);
    localStorage.setItem("mydash_tab", tab);
  };

  const handleAddCollection = () => {
    setCollections([
      ...collections,
      {
        id: `c-${Date.now()}`,
        type: "collection",
        title: t("mydash.nama_koleksi"),
        items: [],
        isNew: true
      }
    ]);
  };

  const updateCollectionTitle = (index: number, newTitle: string) => {
    setCollections(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], title: newTitle };
      if (updated[index].isNew) {
        updated[index].isNew = false;
      }
      return updated;
    });
  };

  const deleteCollection = (index: number) => {
    setCollections(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
  };

  const moveCollection = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === collections.length - 1)) return;

    const update = () => {
      setCollections(prev => {
        const updated = [...prev];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        [updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]];
        return updated;
      });
    };

    if (document.startViewTransition) {
      document.startViewTransition(() => {
        flushSync(() => { update(); });
      });
    } else {
      update();
    }
  };

  const changeCategoryTitle = (colIdx: number, itemIdx: number, newTitle: string) => {
    setCollections(prev => {
      const updated = [...prev];
      const items = [...updated[colIdx].items];
      items[itemIdx] = { ...items[itemIdx], title: newTitle };
      updated[colIdx] = { ...updated[colIdx], items };
      return updated;
    });
  };

  const deleteCategoryItem = (colIdx: number, itemIdx: number) => {
    setCollections(prev => {
      const updated = [...prev];
      const items = [...updated[colIdx].items];
      items.splice(itemIdx, 1);
      updated[colIdx] = { ...updated[colIdx], items };
      return updated;
    });
  };

  const moveSubItem = (colIdx: number, itemIdx: number, subItemIdx: number, direction: 'up' | 'down') => {
    const update = () => {
      setCollections(prev => {
        const updated = [...prev];
        const items = [...updated[colIdx].items];
        const subItems = [...items[itemIdx].items];
        if ((direction === 'up' && subItemIdx === 0) || (direction === 'down' && subItemIdx === subItems.length - 1)) return prev;

        const targetIdx = direction === 'up' ? subItemIdx - 1 : subItemIdx + 1;
        [subItems[subItemIdx], subItems[targetIdx]] = [subItems[targetIdx], subItems[subItemIdx]];
        items[itemIdx] = { ...items[itemIdx], items: subItems };
        updated[colIdx] = { ...updated[colIdx], items };
        return updated;
      });
    };

    if (document.startViewTransition) {
      document.startViewTransition(() => {
        flushSync(() => { update(); });
      });
    } else {
      update();
    }
  };

  const moveItem = (colIdx: number, itemIdx: number, direction: 'up' | 'down') => {
    const update = () => {
      setCollections(prev => {
        const updated = [...prev];
        const items = [...updated[colIdx].items];
        if ((direction === 'up' && itemIdx === 0) || (direction === 'down' && itemIdx === items.length - 1)) return prev;

        const targetIdx = direction === 'up' ? itemIdx - 1 : itemIdx + 1;
        [items[itemIdx], items[targetIdx]] = [items[targetIdx], items[itemIdx]];
        updated[colIdx] = { ...updated[colIdx], items };
        return updated;
      });
    };

    if (document.startViewTransition) {
      document.startViewTransition(() => {
        flushSync(() => { update(); });
      });
    } else {
      update();
    }
  };

  useEffect(() => {
    const savedTab = localStorage.getItem("mydash_tab") as any;
    if (savedTab && ["store", "produk", "tampilan", "settings"].includes(savedTab)) {
      setActiveTab(savedTab);
    }

    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    } else if (savedTheme === "light") {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
    } else {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
    setThemeLoaded(true);
  }, []);

  return (
    <>
      <div className="h-screen overflow-hidden bg-[#D1D1D1]">
        <div className="w-full flex flex-col lg:flex-row h-full">

          {/* Icon Sidebar */}
          <div className="w-full lg:w-[72px] shrink-0 h-full flex lg:flex-col items-center justify-start px-4 lg:px-0 pt-3 pb-6 bg-white dark:bg-[#242526] border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-[#3E4042] z-10 relative">

            {/* Top Nav Items */}
            <div className="flex lg:flex-col items-center gap-2 w-full">

              {/* Back to Products */}
              <a href="/product" className="flex items-center justify-center w-10 h-10 bg-transparent text-gray-400 dark:text-[#B0B3B8] rounded-xl transition-colors hover:bg-gray-100 dark:hover:bg-[#3A3B3C] mb-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              </a>

              {/* Divider */}
              <div className="hidden lg:block w-8 h-px bg-gray-200 dark:bg-[#3E4042] mb-1"></div>

              {/* Toko (Home Icon) */}
              <button
                onClick={() => handleTabChange("store")}
                className={`flex flex-col items-center justify-center gap-1.5 w-14 h-14 rounded-xl transition-colors ${activeTab === 'store' ? 'bg-[#f3f4f6] dark:bg-[#3A3B3C] text-emerald-500 shadow-sm' : 'bg-transparent text-gray-500 dark:text-[#B0B3B8] hover:bg-gray-200 dark:hover:bg-[#3A3B3C]'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}>
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                <span className="text-[9px] font-bold">{t("mydash.toko")}</span>
              </button>

              {/* Layout */}
              <button
                onClick={() => handleTabChange("produk")}
                className={`flex flex-col items-center justify-center gap-1.5 w-14 h-14 rounded-xl transition-colors ${activeTab === 'produk' ? 'bg-[#f3f4f6] dark:bg-[#3A3B3C] text-emerald-500 shadow-sm' : 'bg-transparent text-gray-500 dark:text-[#B0B3B8] hover:bg-gray-200 dark:hover:bg-[#3A3B3C]'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v14a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4z" /></svg>
                <span className="text-[9px] font-bold">{t("mydash.layout")}</span>
              </button>

              {/* Tampilan */}
              <button
                onClick={() => handleTabChange("tampilan")}
                className={`flex flex-col items-center justify-center gap-1.5 w-14 h-14 rounded-xl transition-colors ${activeTab === 'tampilan' ? 'bg-[#f3f4f6] dark:bg-[#3A3B3C] text-emerald-500 shadow-sm' : 'bg-transparent text-gray-500 dark:text-[#B0B3B8] hover:bg-gray-200 dark:hover:bg-[#3A3B3C]'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
                <span className="text-[9px] font-bold">{t("mydash.tampilan")}</span>
              </button>

              {/* Settings Icon */}
              <div className="relative w-full flex justify-center">
                <button
                  ref={settingsBtnRef}
                  onClick={() => setIsSettingsMenuOpen(!isSettingsMenuOpen)}
                  className={`flex flex-col items-center justify-center gap-1.5 w-14 h-14 rounded-xl transition-colors ${isSettingsMenuOpen ? 'bg-[#f3f4f6] dark:bg-[#3A3B3C] text-emerald-500 shadow-sm' : 'bg-transparent text-gray-500 dark:text-[#B0B3B8] hover:bg-gray-200 dark:hover:bg-[#3A3B3C]'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <span className="text-[9px] font-bold">{t("mydash.settings")}</span>
                </button>

                {isSettingsMenuOpen && (
                  <div className="absolute left-full ml-4 top-0 w-[300px] settings-popup-container bg-white dark:bg-[#242526] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-gray-200 dark:border-[#3E4042] p-4 z-[10200]">
                    <div className="bg-[#F2F2F2] dark:bg-[#3A3B3C] rounded-xl p-3 flex items-center gap-3 mb-2 shadow-sm border border-gray-100 dark:border-[#3E4042]">
                      <div className="w-[40px] h-[40px] rounded-full flex items-center justify-center overflow-hidden shrink-0 border border-emerald-600 dark:border-emerald-400">
                        <img
                          src="/default-avatar.svg"
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-[15px] text-black dark:text-[#E4E6EB] leading-tight">
                          {currentUser.username}
                        </h3>
                        <p className="text-[13px] text-gray-500 dark:text-[#B0B3B8]">
                          Premium Plan
                        </p>
                      </div>
                    </div>

                    <div className="w-full h-[1px] bg-gray-200 dark:bg-[#3A3B3C] my-3"></div>

                    <div className="space-y-1">
                      {/* Theme Switcher */}
                      <button
                        onClick={toggleTheme}
                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#3A3B3C] transition-colors group/item"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#E4E6EB] dark:bg-[#2A2B2C] flex items-center justify-center shrink-0 overflow-hidden text-gray-600 dark:text-[#E4E6EB] group-hover/item:text-black dark:group-hover/item:text-emerald-400">
                            {isDarkMode ? (
                              <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.5-1.591a.75.75 0 10-1.061 1.06l1.5-1.591zM12 18.75a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25a.75.75 0 01.75-.75zM6.166 18.894a.75.75 0 001.06 1.06l1.5-1.591a.75.75 0 10-1.06-1.061l-1.591 1.59zM4.5 12a.75.75 0 01-.75.75H1.5a.75.75 0 010-1.5h2.25a.75.75 0 01.75.75zM6.166 5.106a.75.75 0 00-1.06 1.06l1.591 1.59a.75.75 0 101.06-1.061l-1.5-1.59z" /></svg>
                            ) : (
                              <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd" /></svg>
                            )}
                          </div>
                          <span className="font-semibold text-[14px] text-gray-700 dark:text-[#E4E6EB]">
                            {isDarkMode ? "Light Mode" : "Dark Mode"}
                          </span>
                        </div>
                      </button>

                      {/* Language Menu Toggle */}
                      <div className="relative">
                        <button
                          onClick={() => setIsLangOpen(!isLangOpen)}
                          className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#3A3B3C] transition-colors group/item"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#E4E6EB] dark:bg-[#2A2B2C] flex items-center justify-center shrink-0 overflow-hidden">
                              {locale === "id" ? (
                                <svg className="w-[18px] h-[18px] rounded-sm shrink-0 shadow-[0_0_2px_rgba(0,0,0,0.2)]" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path fill="#ED2939" d="M0 0h36v18H0z" />
                                  <path fill="#fff" d="M0 18h36v18H0z" />
                                </svg>
                              ) : (
                                <svg className="w-[18px] h-[18px] rounded-sm shrink-0 shadow-[0_0_2px_rgba(0,0,0,0.2)]" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path fill="#0A3161" d="M0 0h36v36H0z" />
                                  <path fill="#B31942" d="M0 4.5h36v4.5H0zm0 9h36v4.5H0zm0 9h36v4.5H0zm0 9h36v4.5H0z" />
                                  <path fill="#fff" d="M0 9h36v4.5H0zm0 9h36v4.5H0zm0 9h36v4.5H0z" />
                                  <path fill="#0A3161" d="M0 0h18v18H0z" />
                                  <path fill="#fff" d="M3 3h2v2H3zm4 0h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2zM3 7h2v2H3zm4 0h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2zM3 11h2v2H3zm4 0h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z" />
                                </svg>
                              )}
                            </div>
                            <span className="font-semibold text-[14px] text-gray-700 dark:text-[#E4E6EB]">
                              {locale === "id" ? "Bahasa Indonesia" : "English"}
                            </span>
                          </div>
                          <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>

                        {/* Language Dropdown */}
                        {isLangOpen && (
                          <div className="absolute left-[100%] top-[-20px] ml-2 w-[160px] bg-white dark:bg-[#1C1D1F] rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.2)] border border-gray-200 dark:border-[#3E4042] p-2 z-[10300]">
                            <button
                              onClick={() => {
                                document.cookie = `NEXT_LOCALE=id; path=/; max-age=31536000; SameSite=Lax`;
                                localStorage.setItem("NEXT_LOCALE", "id");
                                const currentPath = window.location.pathname;
                                const pathWithoutLocale = currentPath.replace(/^\/(id|en)/, "");
                                window.location.href = "/id" + (pathWithoutLocale || "/home");
                              }}
                              className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${locale === "id" ? "bg-[#E4E6EB] dark:bg-[#3A3B3C]" : "hover:bg-gray-100 dark:hover:bg-[#3A3B3C]"}`}
                            >
                              <svg className="w-[16px] h-[16px] rounded-sm shrink-0 shadow-[0_0_2px_rgba(0,0,0,0.2)]" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fill="#ED2939" d="M0 0h36v18H0z" />
                                <path fill="#fff" d="M0 18h36v18H0z" />
                              </svg>
                              <span className="font-semibold text-[13px] text-gray-700 dark:text-[#E4E6EB]">Indonesia</span>
                            </button>
                            <button
                              onClick={() => {
                                document.cookie = `NEXT_LOCALE=en; path=/; max-age=31536000; SameSite=Lax`;
                                localStorage.setItem("NEXT_LOCALE", "en");
                                const currentPath = window.location.pathname;
                                const pathWithoutLocale = currentPath.replace(/^\/(id|en)/, "");
                                window.location.href = "/en" + (pathWithoutLocale || "/home");
                              }}
                              className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors mt-1 ${locale === "en" ? "bg-[#E4E6EB] dark:bg-[#3A3B3C]" : "hover:bg-gray-100 dark:hover:bg-[#3A3B3C]"}`}
                            >
                              <svg className="w-[16px] h-[16px] rounded-sm shrink-0 shadow-[0_0_2px_rgba(0,0,0,0.2)]" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fill="#0A3161" d="M0 0h36v36H0z" />
                                <path fill="#B31942" d="M0 4.5h36v4.5H0zm0 9h36v4.5H0zm0 9h36v4.5H0zm0 9h36v4.5H0z" />
                                <path fill="#fff" d="M0 9h36v4.5H0zm0 9h36v4.5H0zm0 9h36v4.5H0z" />
                                <path fill="#0A3161" d="M0 0h18v18H0z" />
                                <path fill="#fff" d="M3 3h2v2H3zm4 0h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2zM3 7h2v2H3zm4 0h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2zM3 11h2v2H3zm4 0h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z" />
                              </svg>
                              <span className="font-semibold text-[13px] text-gray-700 dark:text-[#E4E6EB]">English</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>

            <div className="flex-1"></div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col lg:flex-row w-full h-full bg-[#D1D1D1]">

            {/* Left Column (Dashboard Controls) */}
            <div id="mydash-sidebar" className={`w-full lg:w-[500px] xl:w-[560px] shrink-0 h-full sidebar-scrollbar bg-white dark:bg-[#1C1D1F] border-r border-gray-200 dark:border-[#3E4042] ${editingProduct && activeTab === 'produk' ? 'overflow-hidden' : 'overflow-y-auto px-6 pt-8 pb-10'}`}>

              {activeTab === "store" && (
                <div className="flex flex-col gap-6">
                  <div className="bg-white dark:bg-[#242526] rounded-2xl border border-gray-200 dark:border-[#3E4042] p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-bold text-gray-600 dark:text-[#E4E6EB]">{t("mydash.link_toko")}</span>
                    </div>
                    <div className="bg-[#f0f9f6] dark:bg-[#1a2e26] rounded-2xl p-3 flex items-center justify-between mb-6 shadow-md dark:shadow-black/40 border border-emerald-100 dark:border-emerald-900/30">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center p-2 shrink-0">
                          {/* Logo Mencari Online */}
                          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-white">
                            <path d="M25 75V40C25 31.7 31.7 25 40 25C48.3 25 55 31.7 55 40V75M55 75V55C55 46.7 61.7 40 70 40C78.3 40 85 46.7 85 55V75" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800 dark:text-[#E4E6EB] text-[15px] leading-tight">NetHubz</h3>
                          <a href="https://nethubz.com/{namatoko}" className="text-emerald-500 text-[13px] hover:underline">https://nethubz.com/{"{namatoko}"}</a>
                        </div>
                      </div>
                      <button className="bg-white dark:bg-[#2A2B2C] border border-gray-200 dark:border-[#3E4042] text-emerald-500 px-4 py-1.5 rounded-full font-bold text-[13px] flex items-center gap-1.5 shadow-sm hover:bg-gray-50 dark:hover:bg-[#3A3B3C] transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                        Share
                      </button>
                    </div>

                    {/* Start creating now */}
                    <div className="flex flex-col gap-3">
                      <h3 className="font-bold text-gray-700 dark:text-[#E4E6EB] text-[14px]">{t("mydash.start_creating_now")}</h3>
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                          <button onClick={handleAddCollection} className="bg-white dark:bg-[#242526] border border-gray-300 dark:border-[#4E4F50] text-gray-600 dark:text-[#B0B3B8] rounded-md px-3 py-1.5 flex items-center gap-1.5 hover:bg-gray-50 dark:hover:bg-[#3A3B3C] transition-colors text-[13px] font-medium shadow-sm shrink-0">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                            {t("mydash.add_collection")}
                          </button>
                          <button className="bg-white dark:bg-[#242526] border border-gray-300 dark:border-[#4E4F50] text-gray-600 dark:text-[#B0B3B8] rounded-md px-3 py-1.5 flex items-center gap-1.5 hover:bg-gray-50 dark:hover:bg-[#3A3B3C] transition-colors text-[13px] font-medium shadow-sm shrink-0">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            {t("mydash.add_category")}
                          </button>
                          <button className="bg-white dark:bg-[#242526] border border-gray-300 dark:border-[#4E4F50] text-gray-600 dark:text-[#B0B3B8] rounded-md px-3 py-1.5 flex items-center gap-1.5 hover:bg-gray-50 dark:hover:bg-[#3A3B3C] transition-colors text-[13px] font-medium shadow-sm shrink-0">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            {t("mydash.add_product")}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Analytics Chart Mockup */}
                  <div className="bg-white dark:bg-[#242526] rounded-2xl border border-gray-200 dark:border-[#3E4042] p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-bold text-gray-800 dark:text-[#E4E6EB] text-[15px]">Analytics</h3>
                      <select className="bg-gray-50 dark:bg-[#3A3B3C] border border-gray-200 dark:border-[#4E4F50] text-gray-600 dark:text-[#B0B3B8] rounded-lg px-3 py-1.5 text-[12px] font-semibold outline-none focus:border-emerald-500">
                        <option>Last 7 Days</option>
                        <option>Last 30 Days</option>
                        <option>All Time</option>
                      </select>
                    </div>

                    <div className="h-48 w-full flex items-end justify-between gap-2">
                      {/* Mockup bars */}
                      {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                        <div key={i} className="w-full bg-emerald-100 dark:bg-emerald-900/30 rounded-t-sm relative group cursor-pointer hover:bg-emerald-200 dark:hover:bg-emerald-800/40 transition-colors" style={{ height: `${h}%` }}>
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 dark:bg-gray-700 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                            {h * 12} Views
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mt-3 text-[11px] font-semibold text-gray-400 dark:text-[#8B8D90] px-1">
                      <span>Mon</span>
                      <span>Tue</span>
                      <span>Wed</span>
                      <span>Thu</span>
                      <span>Fri</span>
                      <span>Sat</span>
                      <span>Sun</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "produk" && (
                editingProduct ? (
                  <ProductEditForm product={editingProduct} onClose={() => router.push(pathname)} onChange={(updates) => setEditingProduct({ ...editingProduct, ...updates })} />
                ) : (
                  <div className="flex flex-col">
                    {/* Your Pages */}
                    <div className="flex flex-col mb-6">
                      <div className="flex items-center">
                        <h2 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">{t("mydash.your_pages")}</h2>
                      </div>
                    </div>

                    {/* Add new block */}
                    <div className="flex gap-2 mb-6 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                      <button onClick={handleAddCollection} className="flex-1 py-2.5 px-3 bg-emerald-500 text-white font-bold rounded-xl text-[13px] hover:bg-emerald-600 transition-colors flex justify-center items-center gap-1.5 shadow-sm whitespace-nowrap">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                        {t("mydash.add_collection")}
                      </button>
                      <button className="flex-1 py-2.5 px-3 bg-emerald-500 text-white font-bold rounded-xl text-[13px] hover:bg-emerald-600 transition-colors flex justify-center items-center gap-1.5 shadow-sm whitespace-nowrap">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                        {t("mydash.add_category")}
                      </button>
                      <button onClick={() => router.push(`${pathname}?product=new`)} className="flex-1 py-2.5 px-3 bg-emerald-500 text-white font-bold rounded-xl text-[13px] hover:bg-emerald-600 transition-colors flex justify-center items-center gap-1.5 shadow-sm whitespace-nowrap">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                        {t("mydash.add_product")}
                      </button>
                    </div>

                    <div className="w-full h-px bg-gray-200 dark:bg-[#3E4042] mb-6"></div>

                    {/* Block List */}
                    <div className="mb-3">
                      <div className="space-y-6">
                        {collections.map((collection, colIdx) => (
                          <BuilderCollectionItem
                            key={colIdx}
                            index={colIdx}
                            collection={collection}
                            updateTitle={updateCollectionTitle}
                            deleteCollection={deleteCollection}
                            moveCollection={moveCollection}
                            moveItem={moveItem}
                            moveSubItem={moveSubItem}
                            changeCategoryTitle={changeCategoryTitle}
                            deleteCategoryItem={deleteCategoryItem}
                            isFirst={colIdx === 0}
                            isLast={colIdx === collections.length - 1}
                            onEditProduct={(p: any) => {
                              if (p?.isNew) {
                                router.push(`${pathname}?product=new`);
                              } else {
                                router.push(`${pathname}?product=${p?.id || '123'}`);
                              }
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>

            {/* Right Column (Preview) */}
            <div className="flex-1 h-full overflow-hidden flex justify-center pt-4 lg:pt-0">
              <div className="w-full h-full flex justify-center items-start lg:items-center">
                {editingProduct && activeTab === "produk" ? (
                  <ProductPreviewMockup product={editingProduct} />
                ) : (
                  <PhonePreviewMockup collections={collections} />
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
