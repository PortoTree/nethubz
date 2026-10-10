"use client";
import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations();

  // Hide on certain pages if needed, e.g. login/register
  if (pathname.includes("/login") || pathname.includes("/register")) return null;

  let activeTab = "home";
  if (pathname.includes("/product")) activeTab = "product";
  else if (pathname.includes("/project")) activeTab = "project";
  else if (pathname.includes("/search") || pathname.includes("/explore")) activeTab = "explore";

  const handleNav = (path: string) => {
    router.push(`/${locale}/${path}`);
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-white dark:bg-[#242526] border-t border-gray-200 dark:border-[#3E4042] z-50 flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom)]">
      <div onClick={() => handleNav('home')} className={`flex flex-col items-center justify-center w-16 h-full cursor-pointer ${activeTab === 'home' ? 'text-emerald-500' : 'text-gray-500 dark:text-[#B0B3B8]'}`}>
        <div className="w-6 h-6 bg-current" style={{ WebkitMask: `url(/navigasi/home${activeTab === 'home' ? '-aktif' : ''}.svg) center/contain no-repeat`, mask: `url(/navigasi/home${activeTab === 'home' ? '-aktif' : ''}.svg) center/contain no-repeat` }} />
        <span className="text-[10px] font-medium mt-0.5">{t("tabs.home")}</span>
      </div>
      <div onClick={() => handleNav('product')} className={`flex flex-col items-center justify-center w-16 h-full cursor-pointer ${activeTab === 'product' ? 'text-emerald-500' : 'text-gray-500 dark:text-[#B0B3B8]'}`}>
        <div className="w-6 h-6 bg-current" style={{ WebkitMask: `url(/navigasi/produk${activeTab === 'product' ? '-aktif' : ''}.svg) center/contain no-repeat`, mask: `url(/navigasi/produk${activeTab === 'product' ? '-aktif' : ''}.svg) center/contain no-repeat` }} />
        <span className="text-[10px] font-medium mt-0.5">{t("tabs.product")}</span>
      </div>
      <div onClick={() => handleNav('project')} className={`flex flex-col items-center justify-center w-16 h-full cursor-pointer ${activeTab === 'project' ? 'text-emerald-500' : 'text-gray-500 dark:text-[#B0B3B8]'}`}>
        <div className="w-6 h-6 bg-current" style={{ WebkitMask: `url(/navigasi/project${activeTab === 'project' ? '' : '-outline'}.svg) center/contain no-repeat`, mask: `url(/navigasi/project${activeTab === 'project' ? '' : '-outline'}.svg) center/contain no-repeat` }} />
        <span className="text-[10px] font-medium mt-0.5">{t("tabs.project")}</span>
      </div>
      <div onClick={() => handleNav('explore')} className={`flex flex-col items-center justify-center w-16 h-full cursor-pointer ${activeTab === 'explore' ? 'text-emerald-500' : 'text-gray-500 dark:text-[#B0B3B8]'}`}>
        <div className="w-6 h-6 bg-current" style={{ WebkitMask: `url(/navigasi/explore${activeTab === 'explore' ? '-aktif' : ''}.svg) center/contain no-repeat`, mask: `url(/navigasi/explore${activeTab === 'explore' ? '-aktif' : ''}.svg) center/contain no-repeat` }} />
        <span className="text-[10px] font-medium mt-0.5">{t("tabs.explore")}</span>
      </div>
    </div>
  );
}
