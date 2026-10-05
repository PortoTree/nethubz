const fs = require('fs');
const file = 'apps/web/src/components/ProjectFormModal.tsx';
let content = fs.readFileSync(file, 'utf8');

// Chunk 1: Update interface and add CATEGORY_GROUPS
content = content.replace(
  /export interface ProjectDraft \{[\s\S]*?roleNeeded: string;\n\}/,
  `export interface ProjectDraft {
  id?: string;
  title: string;
  description: string;
  status: "RELEASED" | "IN_PROGRESS" | "SEARCHING_TEAM" | "OPEN_SOURCE";
  techStack: string[];
  repoUrl: string;
  demoUrl: string;
  coverUrls?: string[];
  coverFiles?: File[];
  mediaUrls?: string[];
  roleNeeded: string;
  category?: string;
  customCategory?: string;
  collabTypes?: string[];
  linkedProductUrl?: string;
  isForSale?: boolean;
}

const CATEGORY_GROUPS = {
  SOFTWARE: ["WEB_DEV", "MOBILE_APP", "GAME_DEV", "DATA_AI", "DESKTOP_APP", "OPEN_SOURCE"],
  DESIGN: ["UI_UX", "GRAPHIC_DESIGN", "ANIMATION_3D", "VIDEO_FILM"],
  BUSINESS: ["ECOMMERCE", "SAAS", "FINTECH"],
  HARDWARE: ["IOT", "ROBOTICS", "ELECTRONICS"],
  RESEARCH: ["EDTECH", "RESEARCH"],
  ARTS: ["MUSIC_AUDIO"],
  OTHER: ["OTHER", "SOCIAL_IMPACT"]
};

function getCategoryGroup(cat: string) {
  for (const [group, cats] of Object.entries(CATEGORY_GROUPS)) {
    if (cats.includes(cat)) return group;
  }
  return "SOFTWARE";
}`
);

// Chunk 2: Add states
content = content.replace(
  /const \[roleNeeded, setRoleNeeded\] = useState\(""\);\n  const \[error, setError\] = useState<string \| null>\(null\);/,
  `const [roleNeeded, setRoleNeeded] = useState("");
  const [category, setCategory] = useState("WEB_DEV");
  const [customCategory, setCustomCategory] = useState("");
  const [collabTypes, setCollabTypes] = useState<string[]>([]);
  const [linkedProductUrl, setLinkedProductUrl] = useState("");
  const [isForSale, setIsForSale] = useState(false);
  const [linkWithProduct, setLinkWithProduct] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dynLabels = (() => {
    const group = getCategoryGroup(category);
    switch (group) {
      case "SOFTWARE": return { tech: t("project.dynLabel_software_tech"), repo: t("project.dynLabel_software_repo"), demo: t("project.dynLabel_software_demo") };
      case "DESIGN": return { tech: t("project.dynLabel_design_tech"), repo: t("project.dynLabel_design_repo"), demo: t("project.dynLabel_design_demo") };
      case "BUSINESS": return { tech: t("project.dynLabel_business_tech"), repo: t("project.dynLabel_business_repo"), demo: t("project.dynLabel_business_demo") };
      case "HARDWARE": return { tech: t("project.dynLabel_hardware_tech"), repo: t("project.dynLabel_hardware_repo"), demo: t("project.dynLabel_hardware_demo") };
      case "RESEARCH": return { tech: t("project.dynLabel_research_tech"), repo: t("project.dynLabel_research_repo"), demo: t("project.dynLabel_research_demo") };
      case "ARTS": return { tech: t("project.dynLabel_arts_tech"), repo: t("project.dynLabel_arts_repo"), demo: t("project.dynLabel_arts_demo") };
      default: return { tech: t("project.dynLabel_other_tech"), repo: t("project.dynLabel_other_repo"), demo: t("project.dynLabel_other_demo") };
    }
  })();`
);

// Chunk 3: Update initial state
content = content.replace(
  /setRoleNeeded\(initial\.roleNeeded \|\| ""\);\n    \} else \{/,
  `setRoleNeeded(initial.roleNeeded || "");
      setCategory(initial.category || "WEB_DEV");
      setCustomCategory(initial.customCategory || "");
      setCollabTypes(initial.collabTypes || []);
      setLinkedProductUrl(initial.linkedProductUrl || "");
      setIsForSale(initial.isForSale || false);
      setLinkWithProduct(!!initial.linkedProductUrl);
    } else {`
);

// Chunk 4: Update reset state
content = content.replace(
  /setRoleNeeded\(""\);\n    \}\n  \}, \[isOpen, initial\]\);/,
  `setRoleNeeded("");
      setCategory("WEB_DEV");
      setCustomCategory("");
      setCollabTypes([]);
      setLinkedProductUrl("");
      setIsForSale(false);
      setLinkWithProduct(false);
    }
  }, [isOpen, initial]);`
);

// Chunk 5: handleSave return
content = content.replace(
  /roleNeeded: roleNeeded\.trim\(\)\n    \}\);/,
  `roleNeeded: roleNeeded.trim(),
      category,
      customCategory: category === "OTHER" ? customCategory.trim() : "",
      collabTypes,
      linkedProductUrl: status === "RELEASED" && linkWithProduct ? linkedProductUrl.trim() : "",
      isForSale: status === "RELEASED" ? isForSale : false
    });`
);

// Chunk 6: Add Category Select & Status, customCategory, and isForSale block
content = content.replace(
  /<div>\s*<label className="block text-\[14px\] font-semibold text-gray-700 dark:text-\[#E4E6EB\] mb-1\.5">\{t\("project\.status"\)\}<\/label>\s*<select[\s\S]*?<\/select>\s*<\/div>/,
  `<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[14px] font-semibold text-gray-700 dark:text-[#E4E6EB] mb-1.5">{t("project.category")}</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                disabled={isSubmitting}
                className="w-full bg-gray-50 dark:bg-[#3A3B3C] border border-gray-300 dark:border-[#4E4F50] rounded-xl px-4 py-3 text-black dark:text-[#E4E6EB] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#1877F2] transition-shadow appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="WEB_DEV">{t("project.cat_WEB_DEV")}</option>
                <option value="MOBILE_APP">{t("project.cat_MOBILE_APP")}</option>
                <option value="GAME_DEV">{t("project.cat_GAME_DEV")}</option>
                <option value="DATA_AI">{t("project.cat_DATA_AI")}</option>
                <option value="DESKTOP_APP">{t("project.cat_DESKTOP_APP")}</option>
                <option value="OPEN_SOURCE">{t("project.cat_OPEN_SOURCE")}</option>
                <option value="UI_UX">{t("project.cat_UI_UX")}</option>
                <option value="GRAPHIC_DESIGN">{t("project.cat_GRAPHIC_DESIGN")}</option>
                <option value="ANIMATION_3D">{t("project.cat_ANIMATION_3D")}</option>
                <option value="VIDEO_FILM">{t("project.cat_VIDEO_FILM")}</option>
                <option value="MUSIC_AUDIO">{t("project.cat_MUSIC_AUDIO")}</option>
                <option value="ECOMMERCE">{t("project.cat_ECOMMERCE")}</option>
                <option value="SAAS">{t("project.cat_SAAS")}</option>
                <option value="FINTECH">{t("project.cat_FINTECH")}</option>
                <option value="SOCIAL_IMPACT">{t("project.cat_SOCIAL_IMPACT")}</option>
                <option value="IOT">{t("project.cat_IOT")}</option>
                <option value="ROBOTICS">{t("project.cat_ROBOTICS")}</option>
                <option value="ELECTRONICS">{t("project.cat_ELECTRONICS")}</option>
                <option value="EDTECH">{t("project.cat_EDTECH")}</option>
                <option value="RESEARCH">{t("project.cat_RESEARCH")}</option>
                <option value="OTHER">{t("project.cat_OTHER")}</option>
              </select>
            </div>

            <div>
              <label className="block text-[14px] font-semibold text-gray-700 dark:text-[#E4E6EB] mb-1.5">{t("project.status")}</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                disabled={isSubmitting}
                className="w-full bg-gray-50 dark:bg-[#3A3B3C] border border-gray-300 dark:border-[#4E4F50] rounded-xl px-4 py-3 text-black dark:text-[#E4E6EB] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#1877F2] transition-shadow appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="RELEASED">{t("project.statusReleased")}</option>
                <option value="IN_PROGRESS">{t("project.statusInProgress")}</option>
                <option value="OPEN_SOURCE">{t("project.statusOpenSource")}</option>
                <option value="SEARCHING_TEAM">{t("project.statusSearchingTeam")}</option>
              </select>
            </div>
          </div>

          {category === "OTHER" && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="block text-[14px] font-semibold text-gray-700 dark:text-[#E4E6EB] mb-1.5">{t("project.customCategory")} <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                value={customCategory} 
                onChange={e => setCustomCategory(e.target.value)}
                disabled={isSubmitting}
                placeholder={t("project.customCategoryPlaceholder")}
                className="w-full bg-gray-50 dark:bg-[#3A3B3C] border border-gray-300 dark:border-[#4E4F50] rounded-xl px-4 py-3 text-black dark:text-[#E4E6EB] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#1877F2] transition-shadow placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          )}`
);

// Chunk 7: Insert "For Sale" checkboxes after SEARCHING_TEAM block (before TechStack)
content = content.replace(
  /(<p className="text-\[12px\] text-gray-500 mt-1">\{t\("project\.roleNeededHint"\)\}<\/p>\s*<\/div>\s*\)\})/,
  `$1

          {status === "RELEASED" && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-4 bg-gray-50/50 dark:bg-[#18191A]/30 border border-gray-200 dark:border-[#3E4042] rounded-xl p-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={isForSale}
                    onChange={e => setIsForSale(e.target.checked)}
                    disabled={isSubmitting}
                    className="peer sr-only"
                  />
                  <div className="w-5 h-5 border-2 border-gray-300 dark:border-[#4E4F50] rounded flex items-center justify-center peer-checked:border-[#1877F2] peer-checked:bg-[#1877F2] transition-colors group-hover:border-[#1877F2]/50">
                    <svg className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                </div>
                <span className="text-[14.5px] font-medium text-gray-700 dark:text-[#E4E6EB] select-none">{t("project.isForSaleToggle")}</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={linkWithProduct}
                    onChange={e => setLinkWithProduct(e.target.checked)}
                    disabled={isSubmitting}
                    className="peer sr-only"
                  />
                  <div className="w-5 h-5 border-2 border-gray-300 dark:border-[#4E4F50] rounded flex items-center justify-center peer-checked:border-[#1877F2] peer-checked:bg-[#1877F2] transition-colors group-hover:border-[#1877F2]/50">
                    <svg className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                </div>
                <span className="text-[14.5px] font-medium text-gray-700 dark:text-[#E4E6EB] select-none">{t("project.linkProductToggle")}</span>
              </label>
              
              {linkWithProduct && (
                <div className="pt-2">
                  <label className="block text-[13px] font-semibold text-gray-600 dark:text-[#B0B3B8] mb-1.5">{t("project.productLink")}</label>
                  <input 
                    type="url" 
                    value={linkedProductUrl} 
                    onChange={e => setLinkedProductUrl(e.target.value)}
                    disabled={isSubmitting}
                    placeholder={t("project.productLinkPlaceholder")}
                    className="w-full bg-white dark:bg-[#3A3B3C] border border-gray-300 dark:border-[#4E4F50] rounded-xl px-4 py-2.5 text-black dark:text-[#E4E6EB] text-[14.5px] focus:outline-none focus:ring-2 focus:ring-[#1877F2] transition-shadow placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              )}
            </div>
          )}`
);

// Chunk 8: Dynamic Labels
content = content.replace(
  /\{t\("project\.techStack"\)\}/,
  `{dynLabels.tech}`
);

content = content.replace(
  /\{t\("project\.repoUrl"\)\}/,
  `{dynLabels.repo}`
);

content = content.replace(
  /\{t\("project\.demoUrl"\)\}/,
  `{dynLabels.demo}`
);

// Update repoUrl condition to show github.com conditionally
content = content.replace(
  /<div className="relative">\s*<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none gap-1\.5">\s*<svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">[\s\S]*?<\/svg>\s*<span className="text-gray-400 font-medium text-\[15px\]">github\.com\/<\/span>\s*<\/div>\s*<input \s*type="text" \s*value=\{repoUrl\} \s*onChange=\{e => \{\s*let val = e\.target\.value;\s*if \(val\.includes\("github\.com\/"\)\) val = val\.split\("github\.com\/"\)\[1\];\s*setRepoUrl\(val\.replace\(\/\^https\?:\\\\\/\\\\\/\/i, ""\)\.replace\(\/\^www\\\\\.\/i, ""\)\.replace\(\/\^\\\\\/\+\/, ""\)\);\s*\}\}\s*disabled=\{isSubmitting\}\s*placeholder="username\/repo"\s*className="w-full bg-gray-50 dark:bg-\[#3A3B3C\] border border-gray-300 dark:border-\[#4E4F50\] rounded-xl pl-\[125px\] pr-4 py-3 text-black dark:text-\[#E4E6EB\] text-\[15px\] focus:outline-none focus:ring-2 focus:ring-\[#1877F2\] transition-shadow placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"\s*\/>\s*<\/div>/,
  `{getCategoryGroup(category) === "SOFTWARE" || getCategoryGroup(category) === "OPEN_SOURCE" ? (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none gap-1.5">
                    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                    <span className="text-gray-400 font-medium text-[15px]">github.com/</span>
                  </div>
                  <input 
                    type="text" 
                    value={repoUrl} 
                    onChange={e => {
                      let val = e.target.value;
                      if (val.includes("github.com/")) val = val.split("github.com/")[1];
                      setRepoUrl(val.replace(/^https?:\\/\\//i, "").replace(/^www\\./i, "").replace(/^\\/+/, ""));
                    }}
                    disabled={isSubmitting}
                    placeholder="username/repo"
                    className="w-full bg-gray-50 dark:bg-[#3A3B3C] border border-gray-300 dark:border-[#4E4F50] rounded-xl pl-[125px] pr-4 py-3 text-black dark:text-[#E4E6EB] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#1877F2] transition-shadow placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                  </div>
                  <input 
                    type="url" 
                    value={repoUrl} 
                    onChange={e => setRepoUrl(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="https://..."
                    className="w-full bg-gray-50 dark:bg-[#3A3B3C] border border-gray-300 dark:border-[#4E4F50] rounded-xl pl-10 pr-4 py-3 text-black dark:text-[#E4E6EB] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#1877F2] transition-shadow placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              )}`
);

fs.writeFileSync(file, content);
console.log('Patched');
