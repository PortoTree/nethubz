import re

with open("apps/web/src/components/ProjectShowcase.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add imports
imports_to_add = """
import { ReactionButton, ReactionType, REACTION_CONFIG } from "./ReactionButton";
import { ReactionSummaryPopup } from "./ReactionSummaryPopup";
import { checkInteractionState, toggleLike, incrementShareCount } from "@/app/actions/interactions";
import { interactionsCache } from "@/utils/cache";
import Image from "next/image";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import NProgress from "nprogress";
"""
content = re.sub(r'import { CATEGORY_COLORS, getCategoryBadgeClasses } from "@/components/ProjectCard";\n', 'import { CATEGORY_COLORS, getCategoryBadgeClasses } from "@/components/ProjectCard";\n' + imports_to_add, content)

# 2. Extract ShowcaseCard component
card_component = """
const ShowcaseCard = ({ p, locale, t, tHub, CATEGORY_COLORS, getCategoryBadgeClasses, statusBadgeClass, statusKey }: any) => {
  const router = useRouter();
  const cover = p.coverUrls?.[0] || p.mediaUrls?.[0];
  const username = p.user?.username || "Unknown";
  const displayName = p.user?.profile?.displayName || username;
  const avatarUrl = p.user?.profile?.avatarUrl;

  const [user, setUser] = useState<any>(null);
  const [isUserLoaded, setIsUserLoaded] = useState(false);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [isInteractionLoading, setIsInteractionLoading] = useState(true);
  const [myReaction, setMyReaction] = useState<ReactionType | null>(null);
  const [likeCount, setLikeCount] = useState(p._count?.likes || 0);
  const [commentCount, setCommentCount] = useState(p._count?.comments || 0);
  const [topReactions, setTopReactions] = useState<ReactionType[]>(p.topReactions || []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        setUser(JSON.parse(atob(token.split(".")[1])));
      } catch (e) {}
    }
    setIsUserLoaded(true);
  }, []);

  const loadInteractions = useCallback(() => {
    if (!isUserLoaded) return;
    const cacheKey = `interaction_project_${p.id}_${user?.id || 'guest'}`;
    if (interactionsCache.has(cacheKey)) {
      const cached = interactionsCache.get(cacheKey);
      setMyReaction(cached.myReaction);
      setLikeCount(cached.likeCount);
      setTopReactions(cached.topReactions || []);
      setCommentCount(cached.commentCount);
      setIsInteractionLoading(false);
    } else {
      setIsInteractionLoading(true);
    }
    
    checkInteractionState(user?.id, "project", p.id).then(interaction => {
      if (interaction.success) {
        setMyReaction(interaction.myReaction as ReactionType | null);
        setLikeCount(interaction.likeCount || 0);
        if (interaction.topReactions) {
          setTopReactions(interaction.topReactions as ReactionType[]);
        }
        setCommentCount(interaction.commentCount || 0);
        interactionsCache.set(cacheKey, {
          myReaction: interaction.myReaction as ReactionType | null,
          likeCount: interaction.likeCount || 0,
          topReactions: interaction.topReactions || [],
          commentCount: interaction.commentCount || 0
        });
      }
      setIsInteractionLoading(false);
    });
  }, [p.id, user?.id, isUserLoaded]);

  useEffect(() => {
    loadInteractions();
    const handleRefresh = () => loadInteractions();
    window.addEventListener("refresh_projects", handleRefresh);
    return () => window.removeEventListener("refresh_projects", handleRefresh);
  }, [loadInteractions]);

  const handleLike = async (reactionType: ReactionType = "LIKE") => {
    if (!user || isLikeLoading) {
      if (!user) router.push(`/${locale}/login`);
      return;
    }
    setIsLikeLoading(true);
    const prevReaction = myReaction;
    const isSameReaction = prevReaction === reactionType;
    const isRemovingLike = prevReaction && isSameReaction;
    const isAddingLike = !prevReaction;

    const cacheKey = `interaction_project_${p.id}_${user.id}`;
    let newLikeCount = likeCount;
    let newReaction = isRemovingLike ? null : reactionType;
    let newTopReactions = topReactions;

    if (isRemovingLike) {
      newLikeCount = Math.max(0, likeCount - 1);
    } else {
      if (isAddingLike) newLikeCount = likeCount + 1;
      if (isAddingLike || reactionType !== prevReaction) {
        newTopReactions = [reactionType, ...topReactions.filter((r: any) => r !== reactionType)];
      }
    }
    
    setMyReaction(newReaction);
    setLikeCount(newLikeCount);
    setTopReactions(newTopReactions);
    
    interactionsCache.set(cacheKey, {
      ...interactionsCache.get(cacheKey),
      myReaction: newReaction,
      likeCount: newLikeCount,
      topReactions: newTopReactions
    });

    try {
      await toggleLike(user.id, "project", p.id, reactionType);
      window.dispatchEvent(new Event("refresh_projects"));
    } catch (e) {
      setMyReaction(prevReaction);
      setLikeCount(isRemovingLike ? newLikeCount + 1 : isAddingLike ? Math.max(0, newLikeCount - 1) : newLikeCount);
    } finally {
      setIsLikeLoading(false);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/${locale}/project/${username}/${p.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: p.title,
          text: p.description || p.title,
          url: url,
        });
        if (user) {
          await incrementShareCount(user.id, "project", p.id);
        }
      } catch (err) {}
    } else {
      navigator.clipboard.writeText(url);
      alert(tHub("linkCopied") || "Tautan disalin ke clipboard!");
      if (user) {
        await incrementShareCount(user.id, "project", p.id);
      }
    }
  };

  return (
    <div
      key={p.id}
      className="bg-white dark:bg-[#242526] rounded-[20px] shadow-sm border border-gray-100 dark:border-[#3A3B3C] overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5 flex flex-col md:flex-row min-h-[180px] group/card relative"
    >
      {cover ? (
        <div className="w-full md:w-[260px] md:shrink-0 aspect-video md:aspect-auto relative z-0">
          <MediaRenderer url={cover} className="absolute inset-0 w-full h-full object-cover bg-gray-100 dark:bg-[#3A3B3C]" />
        </div>
      ) : (
        <div className="w-full md:w-[260px] md:shrink-0 aspect-video md:aspect-auto bg-gray-100 dark:bg-[#3A3B3C] flex items-center justify-center text-gray-400">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}

      <div className="p-5 flex flex-col flex-grow relative z-10 w-full min-w-0">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <Link
              href={`/${locale}/project/${username}/${p.id}`}
              className="text-gray-900 dark:text-[#E4E6EB] font-bold text-[17px] line-clamp-2 after:absolute after:inset-0 after:z-0 hover:text-purple-600 dark:hover:text-purple-400"
            >
              {p.title}
            </Link>
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5 relative z-10">
              {p.category && (
                <span className={getCategoryBadgeClasses(CATEGORY_COLORS[p.category] || "blue")}>
                  {p.category === "OTHER" ? p.customCategory : t(`cat_${p.category}` as any)}
                </span>
              )}
              {p.isForSale && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  FOR SALE
                </span>
              )}
            </div>
          </div>
          <span className={statusBadgeClass(p.status) + " relative z-10 shrink-0 mt-0.5"}>
            {t(statusKey(p.status))}
          </span>
        </div>

        <p className="text-gray-600 dark:text-[#B0B3B8] text-[13px] whitespace-pre-line line-clamp-3 mb-4 flex-grow">
          {p.description}
        </p>

        <div className="mt-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-wrap gap-1.5">
              {p.techStack?.length > 0 && p.techStack.slice(0, 4).map((tech: string) => (
                <span
                  key={tech}
                  className="px-2 py-0.5 rounded text-[11px] font-medium transition-colors bg-gray-100 text-gray-600 dark:bg-[#3A3B3C] dark:text-[#E4E6EB]"
                >
                  {tech}
                </span>
              ))}
              {p.techStack?.length > 4 && (
                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-600 dark:bg-[#3A3B3C] dark:text-[#E4E6EB]">
                  +{p.techStack.length - 4}
                </span>
              )}
            </div>
            
            {/* React Summary Popup - Aligned right */}
            <div className="flex items-center gap-1.5 cursor-pointer hover:underline text-[#65676B] dark:text-[#B0B3B8] text-[15px] relative z-10">
              {isInteractionLoading ? (
                <div className="flex items-center gap-1.5">
                  <div className="flex -space-x-1">
                    <div className="w-[18px] h-[18px] rounded-full bg-gray-200 dark:bg-[#3A3B3C] animate-pulse relative z-10 border-2 border-white dark:border-[#242526]"></div>
                    <div className="w-[18px] h-[18px] rounded-full bg-gray-200 dark:bg-[#3A3B3C] animate-pulse relative z-0 border-2 border-white dark:border-[#242526]"></div>
                  </div>
                  <div className="w-4 h-4 bg-gray-200 dark:bg-[#3A3B3C] animate-pulse rounded"></div>
                </div>
              ) : (
                <>
                  <div className="flex items-center -space-x-1 z-0">
                    {topReactions.length > 0 ? (
                      topReactions.slice(0, 3).map((r) => (
                        <ReactionSummaryPopup key={r} targetId={p.id} targetType="PROJECT" likeCount={likeCount} topReactions={topReactions} filterReactionType={r}>
                          <div className="w-[18px] h-[18px] rounded-full bg-white dark:bg-[#242526] relative z-10 flex items-center justify-center shadow-sm hover:z-20 hover:opacity-80 transition-opacity">
                             <Image src={REACTION_CONFIG[r].src} alt={r} fill className="object-contain" />
                          </div>
                        </ReactionSummaryPopup>
                      ))
                    ) : likeCount > 0 ? (
                      <ReactionSummaryPopup targetId={p.id} targetType="PROJECT" likeCount={likeCount} topReactions={topReactions}>
                        <div className="w-[18px] h-[18px] rounded-full bg-blue-500 flex items-center justify-center shadow-sm hover:z-20 hover:opacity-80 transition-opacity">
                          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                          </svg>
                        </div>
                      </ReactionSummaryPopup>
                    ) : null}
                  </div>
                  {likeCount > 0 && <span onClick={(e) => { e.stopPropagation(); NProgress.start(); router.push(`/${locale}/project/${username}/${p.id}`); }}>{likeCount}</span>}
                </>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-[#3A3B3C]">
            <Link href={`/${locale}/project/${username}`} className="flex items-center gap-2.5 group/user relative z-10">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="w-8 h-8 rounded-full object-cover shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-[#3A3B3C] shrink-0 flex items-center justify-center text-gray-500 dark:text-gray-400 font-bold text-sm">
                  {displayName[0]?.toUpperCase()}
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-[13px] font-semibold text-gray-700 dark:text-[#E4E6EB] group-hover/user:text-purple-600 dark:group-hover/user:text-purple-400 transition-colors leading-tight">
                  {tHub("userProjects", { name: displayName })}
                </span>
                <span className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                  @{username}
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-3.5 relative z-10" onClick={(e) => e.stopPropagation()}>
              {isInteractionLoading ? (
                <div className="w-[84px] h-[18px] bg-gray-200 dark:bg-[#3A3B3C] animate-pulse rounded"></div>
              ) : (
                <ReactionButton myReaction={myReaction} onReact={handleLike} count={0} containerClassName="!flex-none" className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors font-medium text-[13px] bg-transparent" />
              )}
              
              <Link href={`/${locale}/project/${username}/${p.id}#comments`} className="flex items-center gap-1.5 text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors font-medium text-[13px]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                {t("comment")} <span className="ml-0.5 text-gray-400 dark:text-gray-500">{commentCount > 0 ? commentCount : ''}</span>
              </Link>
              
              <button onClick={handleShare} className="flex items-center gap-1.5 text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors font-medium text-[13px]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                {t("share")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
"""

start_marker = "{filtered.map((p: any) => {"
end_marker = "})}\n            </div>\n          )}\n        </div>\n\n        {/* RIGHT: Search & Filter Sidebar"

if start_marker in content and end_marker in content:
    pre = content.split(start_marker)[0]
    post = content.split(end_marker)[1]
    
    new_map = """{filtered.map((p: any) => (
                <ShowcaseCard 
                  key={p.id} 
                  p={p} 
                  locale={locale} 
                  t={t} 
                  tHub={tHub}
                  CATEGORY_COLORS={CATEGORY_COLORS}
                  getCategoryBadgeClasses={getCategoryBadgeClasses}
                  statusBadgeClass={statusBadgeClass}
                  statusKey={statusKey}
                />
              ))}"""
              
    content = pre + new_map + "\n            </div>\n          )}\n        </div>\n\n        {/* RIGHT: Search & Filter Sidebar" + post
    
    content = content.replace("export default function ProjectShowcase", card_component + "\nexport default function ProjectShowcase")
    
    with open("apps/web/src/components/ProjectShowcase.tsx", "w", encoding="utf-8") as f:
        f.write(content)
        print("Success")
else:
    print("Failed to find markers")
