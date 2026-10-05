import re

with open("c:\\mencari-online\\apps\\web\\src\\components\\CreatePostModal.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add import
if 'import { getAllUserProjects }' not in content:
    content = content.replace('import { getUserGalleries, createGallery } from "@/app/actions/galleries";',
'''import { getUserGalleries, createGallery } from "@/app/actions/galleries";
import { getAllUserProjects } from "@/app/actions/projects";''')

# 2. Add state
state_code = '''
  // Project Attachment State
  const [projects, setProjects] = useState<any[]>([]);
  const [attachedProject, setAttachedProject] = useState<any>(initialPost?.project || null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
'''
if 'const [projects, setProjects]' not in content:
    content = content.replace('  // Gallery state', state_code + '\n  // Gallery state')

# 3. Handle Project click
project_btn = '''                    {/* Project */}
                    <button onClick={() => {
                      setIsProjectModalOpen(true);
                      setIsMorePopupOpen(false);
                      if (projects.length === 0 && !isLoadingProjects && currentUser?.id) {
                        setIsLoadingProjects(true);
                        getAllUserProjects(currentUser.id).then(res => {
                          if (res.success) setProjects(res.projects || []);
                          setIsLoadingProjects(false);
                        });
                      }
                    }} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-100 dark:hover:bg-[#4E4F50] transition-colors cursor-pointer">
                      <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
                        <div className="w-5 h-5 bg-purple-500" style={{ WebkitMask: "url(/navigasi/project.svg) center/contain no-repeat", mask: "url(/navigasi/project.svg) center/contain no-repeat" }} />
                      </div>
                      <span className="text-[14px] font-semibold text-black dark:text-[#E4E6EB]">{t("feed.project") || "Proyek"}</span>
                    </button>'''
old_project_btn_pattern = re.compile(r'\{\/\* Project \*\/\}.*?<\/button>', re.DOTALL)
if 'getAllUserProjects(currentUser.id)' not in content:
    content = old_project_btn_pattern.sub(project_btn, content)

# 4. Add ProjectSelectionModal rendering
project_modal_code = '''
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#242526] w-full max-w-md rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#3A3B3C]">
              <h2 className="text-xl font-bold text-gray-900 dark:text-[#E4E6EB]">Pilih Proyek</h2>
              <button onClick={() => setIsProjectModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-[#3A3B3C] text-gray-500 transition-colors">
                ✕
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {isLoadingProjects ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : projects.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-[#B0B3B8]">
                  Belum ada proyek. Buat proyek terlebih dahulu di profil kamu.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {projects.map((p) => (
                    <div 
                      key={p.id} 
                      onClick={() => {
                        setAttachedProject(p);
                        setIsProjectModalOpen(false);
                      }}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${attachedProject?.id === p.id ? 'border-purple-500 bg-purple-50 dark:bg-purple-500/10' : 'border-gray-200 dark:border-[#4E4F50] hover:bg-gray-50 dark:hover:bg-[#3A3B3C]'}`}
                    >
                      {p.coverUrls?.[0] || p.mediaUrls?.[0] ? (
                        <img src={p.coverUrls?.[0] || p.mediaUrls?.[0]} alt={p.title} className="w-16 h-12 rounded-lg object-cover" />
                      ) : (
                        <div className="w-16 h-12 rounded-lg bg-gray-200 dark:bg-[#4E4F50] flex items-center justify-center">
                          <span className="text-xs text-gray-500">No Image</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-gray-900 dark:text-[#E4E6EB] truncate">{p.title}</div>
                        <div className="text-xs text-gray-500 dark:text-[#B0B3B8]">{p.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
'''
if 'Pilih Proyek' not in content:
    content = content.replace('{/* Modal Overlay */}', project_modal_code + '\n      {/* Modal Overlay */}')

# 5. Show attached project in compose area
attached_preview = '''
            {attachedProject && (
              <div className="relative mb-4 border border-gray-200 dark:border-[#4E4F50] rounded-xl overflow-hidden p-3 bg-gray-50 dark:bg-[#3A3B3C]/50 flex gap-3">
                <button onClick={() => setAttachedProject(null)} className="absolute top-2 right-2 w-7 h-7 bg-white dark:bg-[#242526] rounded-full shadow-md flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#3A3B3C] z-10">✕</button>
                {attachedProject.coverUrls?.[0] || attachedProject.mediaUrls?.[0] ? (
                  <img src={attachedProject.coverUrls?.[0] || attachedProject.mediaUrls?.[0]} alt={attachedProject.title} className="w-20 h-16 rounded-lg object-cover shrink-0 border border-gray-200 dark:border-[#4E4F50]" />
                ) : (
                  <div className="w-20 h-16 rounded-lg bg-gray-200 dark:bg-[#4E4F50] flex items-center justify-center shrink-0 border border-gray-200 dark:border-[#4E4F50]">
                    <span className="text-[10px] text-gray-500">No Image</span>
                  </div>
                )}
                <div className="flex-1 min-w-0 py-1">
                  <div className="text-[11px] font-bold text-purple-600 dark:text-purple-400 mb-0.5">Attached Project</div>
                  <div className="font-bold text-[15px] text-gray-900 dark:text-[#E4E6EB] truncate leading-tight">{attachedProject.title}</div>
                  <div className="text-[12px] text-gray-500 dark:text-[#B0B3B8] capitalize mt-0.5">{attachedProject.status?.replace('_', ' ')}</div>
                </div>
              </div>
            )}
'''
if 'Attached Project' not in content:
    content = content.replace('{/* Add to your post */}', attached_preview + '\n          {/* Add to your post */}')

# 6. Send projectId in handlePost
if 'projectId: attachedProject?.id' not in content:
    content = content.replace('galleryId: selectedGalleryId === "none" ? undefined : selectedGalleryId,', 'galleryId: selectedGalleryId === "none" ? undefined : selectedGalleryId,\n        projectId: attachedProject?.id || undefined,')

with open("c:\\mencari-online\\apps\\web\\src\\components\\CreatePostModal.tsx", "w", encoding="utf-8") as f:
    f.write(content)
