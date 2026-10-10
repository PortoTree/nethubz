const fs = require('fs');
let c = fs.readFileSync('src/components/Navbar.tsx', 'utf8');
const lines = c.split(/\r?\n/);
const newLines = [
  ...lines.slice(0, 349),
  `          <div`,
  `            onClick={() => handleTabNavigation("project", "project")}`,
  `            className={\`flex flex-col items-center justify-center w-[110px] h-full cursor-pointer transition-colors \${activeTab === "project" ? "border-b-[3px] border-emerald-500 text-emerald-500 dark:text-emerald-400 dark:border-emerald-400 my-0 h-full rounded-none" : "border-b-[3px] border-transparent text-gray-500 dark:text-[#B0B3B8] hover:bg-gray-200 dark:hover:bg-[#3A3B3C] rounded-lg my-1"}\`}`,
  `          >`,
  `            <div`,
  `              className="w-7 h-7 bg-current"`,
  `              style={{`,
  `                WebkitMask: \`url(\${activeTab === "project" ? "/navigasi/project.svg" : "/navigasi/project-outline.svg"}) center/contain no-repeat\`,`,
  `                mask: \`url(\${activeTab === "project" ? "/navigasi/project.svg" : "/navigasi/project-outline.svg"}) center/contain no-repeat\`,`,
  `              }}`,
  `            />`,
  `            <span className="text-[11px] font-semibold mt-0.5">`,
  `              {t("tabs.project")}`,
  `            </span>`,
  `          </div>`,
  `          <div`,
  `            onClick={() => handleTabNavigation("explore", "search")}`,
  `            className={\`flex flex-col items-center justify-center w-[110px] h-full cursor-pointer transition-colors \${activeTab === "explore" || activeTab === "search" ? "border-b-[3px] border-emerald-500 text-emerald-500 dark:text-emerald-400 dark:border-emerald-400 my-0 h-full rounded-none" : "border-b-[3px] border-transparent text-gray-500 dark:text-[#B0B3B8] hover:bg-gray-200 dark:hover:bg-[#3A3B3C] rounded-lg my-1"}\`}`,
  `          >`,
  `            <div`,
  `              className="w-7 h-7 bg-current"`,
  `              style={{`,
  `                WebkitMask: \`url(\${activeTab === "explore" || activeTab === "search" ? "/navigasi/mencari-aktif.svg" : "/navigasi/mencari.svg"}) center/contain no-repeat\`,`,
  `                mask: \`url(\${activeTab === "explore" || activeTab === "search" ? "/navigasi/mencari-aktif.svg" : "/navigasi/mencari.svg"}) center/contain no-repeat\`,`,
  `              }}`,
  `            />`,
  `            <span className="text-[11px] font-semibold mt-0.5">`,
  `              {t("tabs.explore")}`,
  `            </span>`,
  `          </div>`,
  ...lines.slice(394)
];
fs.writeFileSync('src/components/Navbar.tsx', newLines.join('\n'));
console.log('Patched');
