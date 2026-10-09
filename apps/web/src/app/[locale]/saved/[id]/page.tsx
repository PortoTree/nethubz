import { getTranslations } from "next-intl/server";
import SavedDetailPageClient from "./SavedDetailPageClient";

export default async function SavedDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const t = await getTranslations("savedPage");
  const resolvedParams = await params;

  return (
    <div className="flex flex-col min-h-screen bg-[#F0F2F5] dark:bg-[#18191A] pt-24 pb-10">
      <div className="max-w-[1200px] mx-auto w-full px-4">
        <SavedDetailPageClient folderId={resolvedParams.id} />
      </div>
    </div>
  );
}
