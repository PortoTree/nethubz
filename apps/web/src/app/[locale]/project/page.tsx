import { getTranslations } from "next-intl/server";
import { getAllProjects } from "@/app/actions/projects";
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
      <div className="max-w-[1200px] mx-auto w-full px-4">
        <ProjectShowcase 
          projects={projects} 
          title={t("pageTitle")}
          subtitle={t("pageSubtitle")}
        />
      </div>
    </div>
  );
}
