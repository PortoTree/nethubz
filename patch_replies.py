import re

file_path = r"c:\mencari-online\apps\web\src\components\PostDetailModal.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Add getCommentReplies to the import
content = content.replace(
    'import { addComment, getComments } from "@/app/actions/interactions";',
    'import { addComment, getComments, getCommentReplies } from "@/app/actions/interactions";'
)

# Extract the existing comment block loop to replace it
comment_loop_start = """                {comments.map(c => ("""
comment_loop_end = """                ))}"""

comment_item_component = """
function CommentItem({ 
  comment, 
  locale, 
  t, 
  router, 
  currentUser,
  handleLikeComment, 
  handleReplyClick,
  renderCommentContent,
  depth = 0
}: any) {
  const [replies, setReplies] = useState<any[]>([]);
  const [showReplies, setShowReplies] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const replyCount = comment._count?.replies || 0;

  const fetchReplies = async (cursor?: string) => {
    setIsLoading(true);
    const res = await getCommentReplies(comment.id, cursor, 5);
    if (res.success && res.replies) {
      setReplies(prev => cursor ? [...prev, ...res.replies] : res.replies);
      setNextCursor(res.nextCursor);
    }
    setIsLoading(false);
  };

  const handleToggleReplies = () => {
    if (!showReplies && replies.length === 0) {
      fetchReplies();
    }
    setShowReplies(!showReplies);
  };

  return (
    <div className={`flex gap-3 group ${depth > 0 ? 'mt-3' : ''}`}>
      <img src={comment.author?.profile?.avatarUrl || "/default-avatar.svg"} alt="Avatar" className="w-8 h-8 rounded-full object-cover shrink-0 cursor-pointer" onClick={() => router.push(`/${locale}/p/${comment.author?.username}/${comment.author?.id}`)} />
      <div className="flex-1">
        <div className="bg-white dark:bg-[#242526] p-3 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100 dark:border-[#3A3B3C]">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-semibold text-[14px] text-gray-900 dark:text-[#E4E6EB] leading-tight cursor-pointer hover:underline" onClick={() => router.push(`/${locale}/p/${comment.author?.username}/${comment.author?.id}`)}>
              {comment.author?.profile?.displayName || comment.author?.username}
            </h4>
            <button type="button" aria-label={t("postModal.more") || "Opsi lainnya"} className="-mt-1 -mr-1 p-1 rounded-full text-gray-500 hover:bg-gray-100 dark:text-[#B0B3B8] dark:hover:bg-[#3A3B3C] transition-colors shrink-0">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" /></svg>
            </button>
          </div>
          <p className="text-[14px] text-gray-800 dark:text-gray-300 mt-1 whitespace-pre-wrap">{renderCommentContent(comment.content)}</p>
        </div>
        <div className="flex items-center gap-3 mt-1 ml-1 text-[12px] font-semibold text-gray-500">
          <span>{formatPostTime(comment.createdAt, t, locale)}</span>
          <button onClick={() => handleLikeComment(comment.id)} className="hover:text-blue-500 transition-colors">{t("postModal.like") || "Suka"}</button>
          <button onClick={() => handleReplyClick(comment.author?.username, comment.author?.id, comment.author?.profile?.displayName || comment.author?.username)} className="hover:text-blue-500 transition-colors">{t("postModal.reply") || "Balas"}</button>
        </div>

        {replyCount > 0 && (
          <div className="mt-2 ml-1">
            <button onClick={handleToggleReplies} className="flex items-center gap-1 text-blue-500 hover:underline text-[13px] font-semibold">
              {showReplies ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                  {t("postModal.hideReplies") || "Sembunyikan balasan"}
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  {t("postModal.viewReplies", { count: replyCount }) || `Lihat ${replyCount} balasan`}
                </>
              )}
            </button>
            
            {showReplies && (
              <div className="mt-3">
                {replies.map(reply => (
                  <CommentItem 
                    key={reply.id} 
                    comment={reply}
                    locale={locale}
                    t={t}
                    router={router}
                    currentUser={currentUser}
                    handleLikeComment={handleLikeComment}
                    handleReplyClick={handleReplyClick}
                    renderCommentContent={renderCommentContent}
                    depth={depth + 1}
                  />
                ))}
                
                {isLoading && (
                  <div className="flex items-center justify-center py-2">
                    <div className="animate-pulse w-5 h-5 rounded-full bg-blue-500/50"></div>
                  </div>
                )}
                
                {nextCursor && !isLoading && (
                  <button onClick={() => fetchReplies(nextCursor)} className="text-blue-500 hover:underline text-[12px] font-semibold mt-2 ml-11">
                    {t("postModal.loadMoreReplies") || "Muat balasan lainnya"}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PostDetailModal({ isOpen, onClose, post, currentUser }: PostDetailModalProps) {"""

# Insert CommentItem right above PostDetailModal
content = content.replace("export default function PostDetailModal({ isOpen, onClose, post, currentUser }: PostDetailModalProps) {", comment_item_component)

# Replace the inner map content with CommentItem call
comment_map_replacement = """                {comments.map(c => (
                  <CommentItem 
                    key={c.id} 
                    comment={c}
                    locale={locale}
                    t={t}
                    router={router}
                    currentUser={currentUser}
                    handleLikeComment={handleLikeComment}
                    handleReplyClick={handleReplyClick}
                    renderCommentContent={renderCommentContent}
                  />
                ))}"""

# I need to use regex to replace from {comments.map(c => ( down to the matching ))}
pattern = re.compile(r'\{comments\.map\(c => \(\s*<div key=\{c\.id\}.*?\s*</div>\s*\)\)\}', re.DOTALL)
content = pattern.sub(comment_map_replacement, content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("SUCCESS")
