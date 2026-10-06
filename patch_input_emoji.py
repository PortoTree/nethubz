import re

file_path = r"c:\mencari-online\apps\web\src\components\CommentInput.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Remove emoji block from form
emoji_block_pattern = re.compile(r'            <div ref={emojiRef} className="shrink-0 mb-1">.*?</div>\n\n', re.DOTALL)
content = emoji_block_pattern.sub('', content)

# 2. Add emoji block above the toggle button
# Find the toggle button block
toggle_button_block = """      {/* The floating chat bubble toggle button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`pointer-events-auto bg-blue-500 hover:bg-blue-600 text-white p-3.5 rounded-full shadow-lg transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-12' : 'rotate-0'}`}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>"""

new_buttons_container = """      {/* Buttons Column */}
      <div className="flex flex-col items-center gap-3">
        {/* Emoji Button - Only visible when isOpen */}
        <div className={`transition-all duration-300 origin-bottom ${isOpen ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' : 'opacity-0 translate-y-4 scale-50 h-0 overflow-hidden pointer-events-none'}`}>
          <div ref={emojiRef} className="relative">
            <button type="button" onClick={() => setIsEmojiOpen(o => !o)} aria-label="Emoji" className="bg-white dark:bg-[#3A3B3C] p-3 rounded-full shadow-md text-gray-500 hover:text-blue-500 transition-colors border border-gray-200 dark:border-[#4E4F50]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </button>
            {isEmojiOpen && (
              <div className="absolute bottom-full right-0 mb-4 z-50 shadow-2xl rounded-2xl overflow-hidden picker-container">
                <style>{`.picker-container em-emoji-picker{height:280px !important;min-height:280px !important;max-height:280px !important;width:328px !important;max-width:calc(100vw - 2rem) !important;}`}</style>
                <Picker data={data} onEmojiSelect={(e: any) => {
                  if (editor) editor.chain().focus().insertContent(e.native).run();
                }} theme={typeof document !== "undefined" && document.documentElement.classList.contains("dark") ? "dark" : "light"} previewPosition="none" skinTonePosition="search" />
              </div>
            )}
          </div>
        </div>

        {/* The floating chat bubble toggle button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`pointer-events-auto bg-blue-500 hover:bg-blue-600 text-white p-3.5 rounded-full shadow-lg transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-12' : 'rotate-0'}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      </div>"""

content = content.replace(toggle_button_block, new_buttons_container)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("SUCCESS")
