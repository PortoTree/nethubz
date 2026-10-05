const fs = require('fs');
const file = 'apps/web/src/app/[locale]/project/[username]/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const badgesHtml = `
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-[#E4E6EB]">{p.title}</h1>
              <div className="flex flex-wrap items-center gap-2">
                {p.category && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[13px] font-medium bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20">
                    {p.category === "OTHER" ? p.customCategory : t(\`cat_\${p.category}\` as any)}
                  </span>
                )}
                {p.isForSale && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[13px] font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    FOR SALE
                  </span>
                )}
              </div>
            </div>`;

content = content.replace(
  /<h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-\[#E4E6EB\]">\{p\.title\}<\/h1>/,
  badgesHtml
);

fs.writeFileSync(file, content);
console.log('ProjectDetailsPage patched');
