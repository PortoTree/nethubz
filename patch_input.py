import re

file_path = r"c:\mencari-online\apps\web\src\components\PostDetailModal.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add import CommentInput
import_statement = 'import { getMentionSuggestion } from \'@/utils/mentionSuggestion\';'
new_import = import_statement + '\nimport CommentInput from "./CommentInput";'
content = content.replace(import_statement, new_import)

# 2. Add isInputOpen state to PostDetailModal
old_state = '  const [replyingTo, setReplyingTo] = useState<{commentId: string, name: string} | null>(null);'
new_state = old_state + '\n  const [isInputOpen, setIsInputOpen] = useState(false);'
content = content.replace(old_state, new_state)

# 3. Update handleReplyClick to open input and use setTimeout
old_reply_click = """  const handleReplyClick = (username: string, id: string, displayName: string, commentId: string) => {
    setReplyingTo({ commentId, name: displayName });
    if (editor) {
      editor.chain().focus().insertContent([
        { type: 'mention', attrs: { id: `${username}/${id}`, label: displayName } },
        { type: 'text', text: ' ' }
      ]).run();
    }
  };"""

new_reply_click = """  const handleReplyClick = (username: string, id: string, displayName: string, commentId: string) => {
    setIsInputOpen(true);
    setReplyingTo({ commentId, name: displayName });
    setTimeout(() => {
      if (editor) {
        editor.chain().focus().insertContent([
          { type: 'mention', attrs: { id: `${username}/${id}`, label: displayName } },
          { type: 'text', text: ' ' }
        ]).run();
      }
    }, 100);
  };"""
content = content.replace(old_reply_click, new_reply_click)

# 4. Remove the old input container block
# The old input starts at <div className="relative p-4 bg-white dark:bg-[#242526] border-t border-gray-200 dark:border-[#3A3B3C] shrink-0">
# and ends after </form> </div>
old_input_block_pattern = re.compile(r'<div className="relative p-4 bg-white dark:bg-\[#242526\].*?</form>\s*</div>', re.DOTALL)

new_input_block = """<CommentInput 
            editor={editor}
            commentText={commentText}
            isSubmitting={isSubmitting}
            replyingTo={replyingTo}
            setReplyingTo={setReplyingTo}
            handleSubmitComment={handleSubmitComment}
            isEmojiOpen={isEmojiOpen}
            setIsEmojiOpen={setIsEmojiOpen}
            emojiRef={emojiRef}
            isOpen={isInputOpen}
            setIsOpen={setIsInputOpen}
          />"""

content = old_input_block_pattern.sub(new_input_block, content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("SUCCESS")
