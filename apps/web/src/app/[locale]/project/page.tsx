import { getTranslations } from "next-intl/server";
import { getAllProjects } from "@/app/actions/projects";
import ClientNavbar from "@/components/ClientNavbar";
import ProjectShowcase from "@/components/ProjectShowcase";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("projectShowcase");

  const res = await getAllProjects();
  const projects = res.success ? res.projects : [];

  return (
    <div className="flex flex-col min-h-screen bg-[#F0F2F5] dark:bg-[#18191A] pt-24 pb-10">
      <ClientNavbar activeTab="project" />
      <div className="max-w-[1200px] mx-auto w-full px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-[#E4E6EB]">{t("pageTitle")}</h1>
          <p className="text-gray-500 dark:text-[#B0B3B8] text-[14px] mt-1">{t("pageSubtitle", { count: projects.length })}</p>
        </div>

        <ProjectShowcase projects={projects} />
      </div>
    </div>
  );
}
