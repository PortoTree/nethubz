import re

file_path = r"c:\mencari-online\apps\web\src\components\PostDetailModal.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update CommentItem Like State
like_state_add = """  const [replies, setReplies] = useState<any[]>([]);
  const [showReplies, setShowReplies] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const replyCount = (comment._count?.replies || 0) + (comment.optimisticReplies?.length || 0);

  const [isLiked, setIsLiked] = useState(comment.hasLiked || false);
  const [likeCount, setLikeCount] = useState(comment._count?.likes || 0);

  useEffect(() => {
    if (comment.optimisticReplies && comment.optimisticReplies.length > 0) {
      setShowReplies(true);
    }
  }, [comment.optimisticReplies]);

  const onLikeClick = async () => {
    if (!currentUser) return;
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    setLikeCount((prev: number) => newLiked ? prev + 1 : Math.max(0, prev - 1));
    await handleLikeComment(comment.id);
  };"""

content = re.sub(
    r'  const \[replies, setReplies\].*?const replyCount = comment\._count\?\.replies \|\| 0;',
    like_state_add,
    content,
    flags=re.DOTALL
)

# 2. Update the CommentItem like button UI
like_btn_old = """          <button onClick={() => handleLikeComment(comment.id)} className="flex items-center gap-1.5 hover:bg-gray-100 dark:hover:bg-[#3A3B3C] px-2 py-1.5 rounded-full transition-colors -ml-2">
            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
            {comment._count?.likes > 0 && <span>{comment._count.likes}</span>}
          </button>"""

like_btn_new = """          <button onClick={onLikeClick} className={`flex items-center gap-1.5 hover:bg-gray-100 dark:hover:bg-[#3A3B3C] px-2 py-1.5 rounded-full transition-colors -ml-2 ${isLiked ? 'text-blue-500' : ''}`}>
            {isLiked ? (
              <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24"><path d="M2 10.5a1.5 1.5 0 113 0v8a1.5 1.5 0 01-3 0v-8zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" /></svg>
            ) : (
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
            )}
            {likeCount > 0 && <span>{likeCount}</span>}
          </button>"""

content = content.replace(like_btn_old, like_btn_new)


# 3. Update CommentItem rendering of replies
replies_map_old = """                {replies.map(reply => (
                  <CommentItem """

replies_map_new = """                {Array.from(new Map([...replies, ...(comment.optimisticReplies || [])].map(r => [r.id, r])).values()).map((reply: any) => (
                  <CommentItem """

content = content.replace(replies_map_old, replies_map_new)


# 4. Update PostDetailModal handleSubmitComment to populate optimisticReplies
submit_comment_old = """      } else {
        // We could trigger a re-render of the specific CommentItem here, 
        // but for now we just don't append it to the root feed to prevent it showing as top-level.
        // It will be visible when they expand the replies.
      }"""

submit_comment_new = """      } else {
        setComments(prev => prev.map(c => {
          if (c.id === replyingTo.commentId) {
            const nextOptimistic = [...(c.optimisticReplies || []), res.comment];
            return {
              ...c,
              optimisticReplies: nextOptimistic
            };
          }
          return c;
        }));
      }"""

content = content.replace(submit_comment_old, submit_comment_new)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("SUCCESS")
