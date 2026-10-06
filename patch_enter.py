import re

# 1. Update MentionList.tsx
mention_list_path = r"c:\mencari-online\apps\web\src\components\MentionList.tsx"
with open(mention_list_path, "r", encoding="utf-8") as f:
    mention_content = f.read()

no_result_old = """      <div className="bg-white dark:bg-[#242526] border border-gray-200 dark:border-[#3A3B3C] rounded-lg shadow-xl p-3 text-sm text-gray-500">"""
no_result_new = """      <div id="mention-popup-container" className="bg-white dark:bg-[#242526] border border-gray-200 dark:border-[#3A3B3C] rounded-lg shadow-xl p-3 text-sm text-gray-500">"""
if no_result_old in mention_content:
    mention_content = mention_content.replace(no_result_old, no_result_new)
    print("Patched no result in MentionList")

list_old = """    <div className="bg-white dark:bg-[#242526] border border-gray-200 dark:border-[#3A3B3C] rounded-lg shadow-xl py-2 min-w-[240px] max-h-[250px] overflow-y-auto z-50">"""
list_new = """    <div id="mention-popup-container" className="bg-white dark:bg-[#242526] border border-gray-200 dark:border-[#3A3B3C] rounded-lg shadow-xl py-2 min-w-[240px] max-h-[250px] overflow-y-auto z-50">"""
if list_old in mention_content:
    mention_content = mention_content.replace(list_old, list_new)
    print("Patched list in MentionList")

with open(mention_list_path, "w", encoding="utf-8") as f:
    f.write(mention_content)


# 2. Update PostDetailModal.tsx
post_modal_path = r"c:\mencari-online\apps\web\src\components\PostDetailModal.tsx"
with open(post_modal_path, "r", encoding="utf-8") as f:
    modal_content = f.read()

keydown_old = """      handleKeyDown: (view, event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault();
          if (commentText.trim() && !isSubmitting) {
            handleSubmitComment(event as any);
          }
          return true;
        }
        return false;
      }"""

keydown_new = """      handleKeyDown: (view, event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
          if (document.getElementById('mention-popup-container')) {
            return false;
          }
          event.preventDefault();
          if (commentText.trim() && !isSubmitting) {
            handleSubmitComment(event as any);
          }
          return true;
        }
        return false;
      }"""

if keydown_old in modal_content:
    modal_content = modal_content.replace(keydown_old, keydown_new)
    print("Patched handleKeyDown in PostDetailModal")

with open(post_modal_path, "w", encoding="utf-8") as f:
    f.write(modal_content)
