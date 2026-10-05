import re

with open("c:\\mencari-online\\apps\\web\\src\\components\\CreatePostModal.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace img with MediaRenderer in the attached project preview
old_img = '''{attachedProject.coverUrls?.[0] || attachedProject.mediaUrls?.[0] ? (
                  <img src={attachedProject.coverUrls?.[0] || attachedProject.mediaUrls?.[0]} alt={attachedProject.title} className="w-20 h-16 rounded-lg object-cover shrink-0 border border-gray-200 dark:border-[#4E4F50]" />
                ) : ('''

new_media = '''{attachedProject.coverUrls?.[0] || attachedProject.mediaUrls?.[0] ? (
                  <div className="relative w-20 h-16 shrink-0 border border-gray-200 dark:border-[#4E4F50] rounded-lg overflow-hidden pointer-events-none">
                    <MediaRenderer url={attachedProject.coverUrls?.[0] || attachedProject.mediaUrls?.[0]} className="w-full h-full object-cover" />
                  </div>
                ) : ('''

content = content.replace(old_img, new_media)

# Same for the modal list preview
old_list_img = '''{p.coverUrls?.[0] || p.mediaUrls?.[0] ? (
                        <img src={p.coverUrls?.[0] || p.mediaUrls?.[0]} alt={p.title} className="w-16 h-12 rounded-lg object-cover" />
                      ) : ('''

new_list_media = '''{p.coverUrls?.[0] || p.mediaUrls?.[0] ? (
                        <div className="relative w-16 h-12 rounded-lg overflow-hidden pointer-events-none shrink-0">
                          <MediaRenderer url={p.coverUrls?.[0] || p.mediaUrls?.[0]} className="w-full h-full object-cover" />
                        </div>
                      ) : ('''
content = content.replace(old_list_img, new_list_media)

with open("c:\\mencari-online\\apps\\web\\src\\components\\CreatePostModal.tsx", "w", encoding="utf-8") as f:
    f.write(content)
