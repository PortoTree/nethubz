const fs = require('fs');
const file = 'apps/web/src/components/ProjectCard.tsx';
let content = fs.readFileSync(file, 'utf8');

// Insert Category and For Sale badges below title
const badgesHtml = `
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              {p.category && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20">
                  {p.category === "OTHER" ? p.customCategory : tProject(\`cat_\${p.category}\` as any)}
                </span>
              )}
              {p.isForSale && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  FOR SALE
                </span>
              )}
            </div>`;

content = content.replace(
  /(<h3[\s\S]*?>\s*\{p\.title\}\s*<\/h3>)/,
  `$1${badgesHtml}`
);

fs.writeFileSync(file, content);
console.log('ProjectCard.tsx patched');
