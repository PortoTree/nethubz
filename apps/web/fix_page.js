const fs = require('fs');
let content = fs.readFileSync('src/app/[locale]/home/page.tsx', 'utf8');
if (!content.includes('</>\n        {/* Product Detail Right Sidebar */}')) {
  content = content.replace('activeTab={activeTab} />', 'activeTab={activeTab} />\n        </>');
  fs.writeFileSync('src/app/[locale]/home/page.tsx', content);
}
console.log('Fixed page.tsx');
