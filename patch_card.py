import re

file_path = r"c:\mencari-online\apps\web\src\components\PostDetailModal.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

old_comment_render = """      <div className="flex-1">
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
          <button onClick={() => handleReplyClick(comment.author?.username, comment.author?.id, comment.author?.profile?.displayName || comment.author?.username, comment.id)} className="hover:text-blue-500 transition-colors">{t("postModal.reply") || "Balas"}</button>
        </div>"""

new_comment_render = """      <div className="flex-1 group/comment relative">
        <button type="button" aria-label={t("postModal.more") || "Opsi lainnya"} className="absolute right-0 top-0 opacity-0 group-hover/comment:opacity-100 p-1 rounded-full text-gray-500 hover:bg-gray-100 dark:text-[#B0B3B8] dark:hover:bg-[#3A3B3C] transition-all shrink-0">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
        </button>
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-[13px] text-gray-900 dark:text-[#E4E6EB] cursor-pointer hover:underline" onClick={() => router.push(`/${locale}/p/${comment.author?.username}/${comment.author?.id}`)}>
            {comment.author?.profile?.displayName || comment.author?.username}
          </h4>
          <span className="text-[12px] text-gray-500 dark:text-gray-400 font-normal">
            {formatPostTime(comment.createdAt, t, locale)}
          </span>
        </div>
        <p className="text-[14.5px] text-gray-900 dark:text-[#E4E6EB] mt-0.5 whitespace-pre-wrap">{renderCommentContent(comment.content)}</p>
        
        <div className="flex items-center gap-2 mt-1.5 text-[12.5px] font-medium text-gray-600 dark:text-gray-400">
          <button onClick={() => handleLikeComment(comment.id)} className="flex items-center gap-1.5 hover:bg-gray-100 dark:hover:bg-[#3A3B3C] px-2 py-1.5 rounded-full transition-colors -ml-2">
            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
            {comment._count?.likes > 0 && <span>{comment._count.likes}</span>}
          </button>
          <button onClick={() => handleReplyClick(comment.author?.username, comment.author?.id, comment.author?.profile?.displayName || comment.author?.username, comment.id)} className="hover:bg-gray-100 dark:hover:bg-[#3A3B3C] px-3 py-1.5 rounded-full transition-colors">
            {t("postModal.reply") || "Balas"}
          </button>
        </div>"""

content = content.replace(old_comment_render, new_comment_render)

# Now fix the skeleton loader so it matches this new layout
old_skeleton = """            {isLoadingComments ? (
              <>
                {[ "w-3/4", "w-1/2", "w-2/3", "w-4/5" ].map((w, i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-[#3A3B3C] shrink-0" />
                    <div className="flex-1">
                      <div className={`${w} bg-gray-200 dark:bg-[#3A3B3C] p-3 rounded-2xl rounded-tl-sm space-y-2`}>
                        <div className="h-3 w-1/3 rounded bg-gray-300 dark:bg-[#4E4F50]" />
                        <div className="h-3 w-full rounded bg-gray-300 dark:bg-[#4E4F50]" />
                        <div className="h-3 w-2/3 rounded bg-gray-300 dark:bg-[#4E4F50]" />
                      </div>
                      <div className="h-2.5 w-16 mt-2 ml-1 rounded bg-gray-200 dark:bg-[#3A3B3C]" />
                    </div>
                  </div>
                ))}
              </>
            ) : comments.length === 0 ? ("""

new_skeleton = """            {isLoadingComments ? (
              <>
                {[ "w-3/4", "w-1/2", "w-2/3", "w-4/5" ].map((w, i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-[#3A3B3C] shrink-0" />
                    <div className="flex-1 mt-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="h-3 w-24 rounded bg-gray-300 dark:bg-[#4E4F50]" />
                        <div className="h-2.5 w-16 rounded bg-gray-200 dark:bg-[#3A3B3C]" />
                      </div>
                      <div className={`h-3 ${w} rounded bg-gray-300 dark:bg-[#4E4F50] mb-1.5`} />
                      <div className="h-3 w-1/3 rounded bg-gray-300 dark:bg-[#4E4F50] mb-2.5" />
                      
                      <div className="flex items-center gap-4">
                        <div className="h-5 w-5 rounded-full bg-gray-200 dark:bg-[#3A3B3C]" />
                        <div className="h-4 w-12 rounded bg-gray-200 dark:bg-[#3A3B3C]" />
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : comments.length === 0 ? ("""

content = content.replace(old_skeleton, new_skeleton)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("SUCCESS")
