import re

file_path = r"c:\mencari-online\apps\web\src\components\CommentInput.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update the top level container and FAB logic
old_fab_and_container = """    <div className="absolute bottom-4 right-4 z-50 flex justify-end items-end pointer-events-none">
      {/* The floating chat bubble button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`pointer-events-auto bg-blue-500 hover:bg-blue-600 text-white p-3.5 rounded-full shadow-lg transition-all duration-300 ${
          isOpen ? "opacity-0 scale-50 absolute" : "opacity-100 scale-100 relative"
        }`}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>

      {/* The sliding input box */}
      <div 
        className={`pointer-events-auto flex flex-col items-end transition-all duration-300 origin-bottom-right ${
          isOpen ? "opacity-100 translate-x-0 scale-100 w-[340px] md:w-[400px]" : "opacity-0 translate-x-10 scale-95 w-0 h-0 overflow-hidden"
        }`}
      >"""

new_fab_and_container = """    <div className="absolute bottom-4 right-4 z-50 flex items-end justify-end gap-3 pointer-events-none">
      {/* The sliding input box */}
      <div 
        className={`pointer-events-auto flex flex-col items-end transition-all duration-300 origin-right ${
          isOpen ? "opacity-100 translate-x-0 scale-100 w-[300px] md:w-[380px]" : "opacity-0 translate-x-8 scale-95 w-0 h-0 overflow-hidden"
        }`}
      >"""

content = content.replace(old_fab_and_container, new_fab_and_container)


# 2. Re-insert the FAB after the sliding box, and remove the X button
old_form_end = """          <button 
            type="submit" 
            disabled={!commentText.trim() || isSubmitting}
            className="shrink-0 p-2 text-blue-600 disabled:text-gray-400 dark:text-blue-400 dark:disabled:text-gray-500 transition-colors rounded-full mr-1"
          >
            <svg className="w-5 h-5 rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
          </button>
          
          <button 
            type="button" 
            onClick={() => setIsOpen(false)}
            className="absolute -top-3 -right-2 bg-gray-200 hover:bg-gray-300 dark:bg-[#4E4F50] dark:hover:bg-[#5A5B5C] text-gray-600 dark:text-gray-300 rounded-full p-1 shadow-sm transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </form>
      </div>
    </div>
  );"""

new_form_end = """          <button 
            type="submit" 
            disabled={!commentText.trim() || isSubmitting}
            className="shrink-0 p-2 text-blue-600 disabled:text-gray-400 dark:text-blue-400 dark:disabled:text-gray-500 transition-colors rounded-full mr-1"
          >
            <svg className="w-5 h-5 rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
          </button>
        </form>
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
    </div>
  );"""

content = content.replace(old_form_end, new_form_end)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("SUCCESS")
