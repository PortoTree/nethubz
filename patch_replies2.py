import re

file_path = r"c:\mencari-online\apps\web\src\components\PostDetailModal.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update CommentItem to pass comment.id to handleReplyClick
# Old: handleReplyClick(comment.author?.username, comment.author?.id, comment.author?.profile?.displayName || comment.author?.username)
# New: handleReplyClick(comment.author?.username, comment.author?.id, comment.author?.profile?.displayName || comment.author?.username, comment.id)
content = content.replace(
    'handleReplyClick(comment.author?.username, comment.author?.id, comment.author?.profile?.displayName || comment.author?.username)',
    'handleReplyClick(comment.author?.username, comment.author?.id, comment.author?.profile?.displayName || comment.author?.username, comment.id)'
)

# 2. Add replyingTo state in PostDetailModal
content = content.replace(
    "const [isEmojiOpen, setIsEmojiOpen] = useState(false);",
    "const [isEmojiOpen, setIsEmojiOpen] = useState(false);\n  const [replyingTo, setReplyingTo] = useState<{commentId: string, name: string} | null>(null);"
)

# 3. Update handleReplyClick in PostDetailModal
old_handle_reply = """  const handleReplyClick = (username: string, id: string, displayName: string) => {
    if (editor) {
      editor.chain().focus().insertContent([
        { type: 'mention', attrs: { id: `${username}/${id}`, label: displayName } },
        { type: 'text', text: ' ' }
      ]).run();
    }
  };"""

new_handle_reply = """  const handleReplyClick = (username: string, id: string, displayName: string, commentId: string) => {
    setReplyingTo({ commentId, name: displayName });
    if (editor) {
      editor.chain().focus().insertContent([
        { type: 'mention', attrs: { id: `${username}/${id}`, label: displayName } },
        { type: 'text', text: ' ' }
      ]).run();
    }
  };"""
content = content.replace(old_handle_reply, new_handle_reply)

# 4. Update handleSubmitComment to pass parentId
old_submit = """    const res = await addComment(currentUser.id, "post", post.id, commentText);"""
new_submit = """    const res = await addComment(currentUser.id, "post", post.id, commentText, replyingTo?.commentId);"""
content = content.replace(old_submit, new_submit)

# Also clear replyingTo after submit
old_clear = """      setCommentText("");
      if (editor) editor.commands.clearContent();"""
new_clear = """      setCommentText("");
      if (editor) editor.commands.clearContent();
      setReplyingTo(null);"""
content = content.replace(old_clear, new_clear)

# 5. Add Replying To badge above textarea
old_form = """          <div className="relative p-4 bg-white dark:bg-[#242526] border-t border-gray-200 dark:border-[#3A3B3C] shrink-0">
            <form onSubmit={handleSubmitComment} className="flex gap-3 items-end">
              <img src={currentUser?.profile?.avatarUrl || "/default-avatar.svg"} alt="Avatar" className="w-9 h-9 rounded-full object-cover shrink-0 mb-[2px]" />
              <div className="flex-1 relative">"""
              
new_form = """          <div className="relative p-4 bg-white dark:bg-[#242526] border-t border-gray-200 dark:border-[#3A3B3C] shrink-0">
            {replyingTo && (
              <div className="flex items-center gap-2 mb-2 ml-12 text-[13px] text-gray-500 bg-gray-100 dark:bg-[#3A3B3C] px-3 py-1.5 rounded-full w-fit">
                <span>Membalas <span className="font-semibold">{replyingTo.name}</span></span>
                <button type="button" onClick={() => setReplyingTo(null)} className="hover:text-red-500">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            )}
            <form onSubmit={handleSubmitComment} className="flex gap-3 items-end">
              <img src={currentUser?.profile?.avatarUrl || "/default-avatar.svg"} alt="Avatar" className="w-9 h-9 rounded-full object-cover shrink-0 mb-[2px]" />
              <div className="flex-1 relative">"""
content = content.replace(old_form, new_form)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("SUCCESS")
