import io

with io.open('apps/web/src/components/PostCard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_class = 'className="border border-gray-200 dark:border-[#4E4F50] rounded-2xl overflow-hidden cursor-pointer hover:bg-gray-50 dark:hover:bg-[#3A3B3C]/50 transition-colors bg-white dark:bg-[#242526]"'
new_class = 'className="border border-gray-200 dark:border-[#4E4F50] rounded-xl overflow-hidden cursor-pointer hover:bg-gray-50 dark:hover:bg-[#3A3B3C]/50 transition-colors bg-white dark:bg-[#242526] flex flex-col sm:flex-row"'

start_idx = content.find(old_class)

if start_idx != -1:
    h3_text = '<h3 className="font-bold text-[17px] text-gray-900 dark:text-[#E4E6EB] leading-tight">{post.project.title}</h3>'
    end_idx = content.find(h3_text, start_idx)
    if end_idx != -1:
        before = content[:start_idx]
        after = content[end_idx + len(h3_text):]
        
        replacement = new_class + '''
          >
            <div className="w-full sm:w-[140px] shrink-0 relative pointer-events-none border-b sm:border-b-0 sm:border-r border-gray-200 dark:border-[#4E4F50]">
              {post.project.coverUrls?.[0] || post.project.mediaUrls?.[0] ? (
                <MediaRenderer url={post.project.coverUrls?.[0] || post.project.mediaUrls?.[0]} className="w-full h-full object-cover sm:aspect-auto aspect-video sm:min-h-[140px]" />
              ) : (
                <div className="w-full h-full sm:min-h-[140px] aspect-video sm:aspect-auto bg-gray-100 dark:bg-[#3A3B3C] flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-300 dark:text-[#4E4F50]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
              )}
            </div>
            <div className="p-3 sm:p-4 flex-1 flex flex-col justify-center">
              <div className="flex items-start justify-between mb-1 gap-2">
                <h3 className="font-bold text-[16px] text-gray-900 dark:text-[#E4E6EB] leading-tight line-clamp-2">{post.project.title}</h3>'''
        
        new_content = before + replacement + after
        
        tech_start = new_content.find('{post.project.techStack && post.project.techStack.length > 0 && (')
        if tech_start != -1:
            flex_idx = new_content.find('<div className="flex flex-wrap gap-1 mt-2">', tech_start)
            if flex_idx != -1:
                new_content = new_content[:flex_idx] + '<div className="flex flex-wrap gap-1 mt-auto">' + new_content[flex_idx + len('<div className="flex flex-wrap gap-1 mt-2">'):]
                
        with io.open('apps/web/src/components/PostCard.tsx', 'w', encoding='utf-8') as f:
            f.write(new_content)
        print('Success!')
    else:
        print('End marker not found')
else:
    print('Start marker not found')
