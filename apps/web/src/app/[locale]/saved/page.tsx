import { getTranslations } from "next-intl/server";
import SavedPageClient from "./SavedPageClient";
import HomeNavSidebar from "@/components/HomeNavSidebar";

export default async function SavedPage() {
  const t = await getTranslations("savedPage");

  return (
    <div className="flex flex-col min-h-screen bg-[#F3F2EF] dark:bg-[#18191A] pt-24 pb-10">
      <HomeNavSidebar activeTab="saved" />
      <div className="flex-1 flex justify-center lg:ml-[72px]">
        <div className="max-w-[1200px] w-full px-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2">
              <img src="/folder.svg" alt="Folder" className="w-6 h-6 md:w-8 md:h-8 dark:invert opacity-80" />
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-[#E4E6EB]">
                {t("title")}
              </h1>
            </div>
            <p className="text-sm md:text-base text-gray-500 dark:text-[#B0B3B8] mt-1">
              {t("subtitle")}
            </p>
          </div>
        </div>

        <SavedPageClient />
        </div>
      </div>
    </div>
  );
}
