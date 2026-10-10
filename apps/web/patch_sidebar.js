const fs = require('fs');
let c = fs.readFileSync('src/components/HomeNavSidebar.tsx', 'utf8');

// Fix "Halaman kamu" onClick
c = c.replace(
  /<button className={\`flex items-center gap-4 p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-\\[#3A3B3C\\] transition-colors\`}>\\s*<div className="w-6 h-6 flex items-center justify-center shrink-0">\\s*<div\\s*className={\`w-full h-full bg-current \\\${activeTab === "webpage"/,
  `<button 
          onClick={() => router.push(\`/\${locale}/mydash\`)}
          className={\`flex items-center gap-4 p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-[#3A3B3C] transition-colors\`}>
          <div className="w-6 h-6 flex items-center justify-center shrink-0">
            <div
              className={\`w-full h-full bg-current \${activeTab === "webpage"`
);

// Make Beranda icon exactly like header if requested, but honestly it's safer to keep consistency. I'll just change the icon itself.
// Actually, it's already using home-aktif and home.svg!
// And text-black dark:text-white is already there!

fs.writeFileSync('src/components/HomeNavSidebar.tsx', c);
console.log('Patched HomeNavSidebar');
