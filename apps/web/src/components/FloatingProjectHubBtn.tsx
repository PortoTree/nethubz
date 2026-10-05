"use client";

import React from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";

export default function FloatingProjectHubBtn({
  customHref,
  customText,
}: {
  customHref?: string;
  customText?: string;
}) {
  const t = useTranslations();
  const locale = useLocale();
  
  const targetHref = customHref || `/${locale}/project`;

  return (
    <Link 
      href={targetHref}
      className="fixed top-6 left-6 z-[9999] flex items-center bg-white dark:bg-[#3A3B3C] text-black dark:text-[#E4E6EB] shadow-[0_2px_10px_rgba(0,0,0,0.1)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.5)] rounded-full h-[42px] group overflow-hidden border border-gray-100 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-[#4E4F50] transition-colors"
    >
      <div className="w-[42px] h-[42px] shrink-0 flex items-center justify-center">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </div>
      <div className="flex items-center overflow-hidden transition-all duration-300 max-w-0 group-hover:max-w-[200px]">
        <span className="font-bold text-[14px] truncate pr-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
          {customText || t("projectHub") || "Project Hub"}
        </span>
      </div>
    </Link>
  );
}
