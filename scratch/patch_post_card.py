import re

with open("c:\\mencari-online\\apps\\web\\src\\components\\PostCard.tsx", "r", encoding="utf-8") as f:
    content = f.read()

project_embed_code = '''
      {/* Embedded Project */}
      {post.project && (
        <div className="px-4 pb-3">
          <div 
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/${locale}/project/${post.author?.username || post.authorId}/${post.project.id}`);
            }}
            className="border border-gray-200 dark:border-[#4E4F50] rounded-2xl overflow-hidden cursor-pointer hover:bg-gray-50 dark:hover:bg-[#3A3B3C]/50 transition-colors bg-white dark:bg-[#242526]"
          >
            {post.project.coverUrls?.[0] || post.project.mediaUrls?.[0] ? (
              <img src={post.project.coverUrls?.[0] || post.project.mediaUrls?.[0]} alt={post.project.title} className="w-full aspect-video object-cover" />
            ) : null}
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-[17px] text-gray-900 dark:text-[#E4E6EB] leading-tight">{post.project.title}</h3>
                <span className={`text-[11px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shrink-0 ${
                  post.project.status === "RELEASED" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                  post.project.status === "IN_PROGRESS" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                  post.project.status === "OPEN_SOURCE" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                  "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                }`}>
                  {post.project.status.replace('_', ' ')}
                </span>
              </div>
              
              {post.project.techStack && post.project.techStack.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {post.project.techStack.slice(0, 5).map((tech: string, i: number) => (
                    <span key={i} className="text-[11px] px-2 py-0.5 bg-gray-100 dark:bg-[#3A3B3C] text-gray-600 dark:text-[#E4E6EB] rounded-full">
                      {tech}
                    </span>
                  ))}
                  {post.project.techStack.length > 5 && (
                    <span className="text-[11px] px-2 py-0.5 bg-gray-100 dark:bg-[#3A3B3C] text-gray-500 rounded-full">
                      +{post.project.techStack.length - 5}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
'''

if 'post.project' not in content:
    content = content.replace('{/* Gallery badge', project_embed_code + '\n      {/* Gallery badge')

with open("c:\\mencari-online\\apps\\web\\src\\components\\PostCard.tsx", "w", encoding="utf-8") as f:
    f.write(content)
