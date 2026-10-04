import { getTranslations } from "next-intl/server";
import { getAllProjects } from "@/app/actions/projects";
import { getOptimizedUrl } from "@/utils/cloudinary";
import Link from "next/link";
import { MediaRenderer } from "@/components/MediaRenderer";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("project");
  
  const res = await getAllProjects();
  const projects = res.success ? res.projects : [];

  return (
    <div className="flex flex-col min-h-screen bg-[#F0F2F5] dark:bg-[#18191A] pt-20 pb-10">
      <div className="max-w-[1200px] mx-auto w-full px-4">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-[#E4E6EB] mb-3">Project Showcase</h1>
          <p className="text-gray-600 dark:text-[#B0B3B8] max-w-2xl mx-auto">
            Explore amazing projects created by our community.
          </p>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-[#242526] rounded-2xl border border-gray-100 dark:border-[#3A3B3C]">
            <p className="text-gray-500 dark:text-[#B0B3B8]">No projects available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((p: any) => {
              const cover = p.coverUrls?.[0] || p.mediaUrls?.[0];
              const statusKey = ({ RELEASED: "statusReleased", IN_PROGRESS: "statusInProgress", OPEN_SOURCE: "statusOpenSource", SEARCHING_TEAM: "statusSearchingTeam" } as Record<string, string>)[p.status] || "statusReleased";
              const username = p.user?.username || "Unknown";
              const displayName = p.user?.profile?.displayName || username;
              const avatar = p.user?.profile?.avatarUrl ? getOptimizedUrl(p.user.profile.avatarUrl, 'thumb') : null;

              return (
                <div key={p.id} className="bg-white dark:bg-[#242526] rounded-[20px] shadow-sm border border-gray-100 dark:border-[#3A3B3C] overflow-hidden transition-all hover:shadow-md hover:-translate-y-1 flex flex-col h-full group/card relative block">
                  {cover ? (
                    <div className="w-full aspect-video relative z-0">
                      <MediaRenderer url={cover} className="w-full h-full object-cover bg-gray-100 dark:bg-[#3A3B3C]" />
                    </div>
                  ) : (
                    <div className="w-full aspect-video bg-gray-100 dark:bg-[#3A3B3C] flex items-center justify-center text-gray-400">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                  )}
                  
                  <div className="p-5 flex flex-col flex-grow relative z-10">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <Link href={`/${locale}/project/${username}/${p.id}`} className="text-gray-900 dark:text-[#E4E6EB] font-bold text-[18px] line-clamp-2 after:absolute after:inset-0 after:z-0 hover:text-purple-600 dark:hover:text-purple-400">
                        {p.title}
                      </Link>
                      <span className="shrink-0 px-3 py-1 rounded-full text-[11px] font-semibold bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300 relative z-10">
                        {t(statusKey)}
                      </span>
                    </div>

                    <p className="text-gray-600 dark:text-[#B0B3B8] text-[14px] whitespace-pre-line line-clamp-3 mb-4 flex-grow">
                      {p.description}
                    </p>

                    <div className="mt-auto">
                      {p.techStack?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {p.techStack.slice(0, 4).map((tech: string) => (
                            <span key={tech} className="px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-600 dark:bg-[#3A3B3C] dark:text-[#E4E6EB]">{tech}</span>
                          ))}
                          {p.techStack.length > 4 && (
                            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-600 dark:bg-[#3A3B3C] dark:text-[#E4E6EB]">+{p.techStack.length - 4}</span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-[#3A3B3C]">
                        <div className="flex items-center gap-2 group/user relative z-10">
                          <Link href={`/${locale}/p/${username}/${p.userId}`} className="flex items-center gap-2">
                            {avatar ? (
                              <img src={avatar} alt={displayName} className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-[#3A3B3C] flex items-center justify-center text-gray-500 dark:text-gray-400 font-bold text-sm">
                                {displayName[0].toUpperCase()}
                              </div>
                            )}
                            <span className="text-sm font-semibold text-gray-700 dark:text-[#E4E6EB] group-hover/user:text-purple-600 dark:group-hover/user:text-purple-400 transition-colors">
                              {displayName}
                            </span>
                          </Link>
                        </div>
                        
                        <div className="flex gap-3 text-[13px] font-semibold relative z-10">
                          {p.repoUrl && <a href={p.repoUrl} target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 hover:underline">{t("viewRepo")} ↗</a>}
                          {p.demoUrl && <a href={p.demoUrl} target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 hover:underline">{t("viewDemo")} ↗</a>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
