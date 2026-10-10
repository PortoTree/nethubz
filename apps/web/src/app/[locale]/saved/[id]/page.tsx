import { getTranslations } from "next-intl/server";
import SavedDetailPageClient from "./SavedDetailPageClient";
import HomeNavSidebar from "@/components/HomeNavSidebar";

export default async function SavedDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const t = await getTranslations("savedPage");
  const resolvedParams = await params;

  return (
    <div className="flex flex-col min-h-screen bg-[#F0F2F5] dark:bg-[#18191A] pt-24 pb-10">
      <HomeNavSidebar activeTab="saved" />
      <div className="flex-1 flex justify-center lg:ml-[72px]">
        <div className="max-w-[1200px] w-full px-4">
          <SavedDetailPageClient folderId={resolvedParams.id} />
        </div>
      </div>
    </div>
  );
}
