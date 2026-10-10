const fs = require('fs');
let c = fs.readFileSync('src/app/[locale]/layout.tsx', 'utf8');
c = c.replace(/import ClientNavbar from "@\\/components\\/ClientNavbar";/, 'import ClientNavbar from "@/components/ClientNavbar";\nimport BottomNav from "@/components/BottomNav";');
c = c.replace(/<ClientNavbar \/>/, '<ClientNavbar />\n        <div className="md:pb-14 pb-14">');
c = c.replace(/<GlobalPostModal \/>/, '<GlobalPostModal />\n        </div>\n        <BottomNav />');
fs.writeFileSync('src/app/[locale]/layout.tsx', c);
console.log('Patched layout');
