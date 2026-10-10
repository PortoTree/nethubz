const fs = require('fs');
const files = [
  'src/app/[locale]/home/page.tsx',
  'src/app/[locale]/chatting/ClientChatPage.tsx',
  'src/app/[locale]/friend/ClientFriendPage.tsx',
  'src/app/[locale]/community/ClientCommunityPage.tsx',
  'src/app/beranda/page.tsx'
];
let changed = 0;
files.forEach(f => {
  if (fs.existsSync(f)) {
    let c = fs.readFileSync(f, 'utf8');

    // Place 1
    const place1Regex = /<div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 overflow-hidden border border-emerald-600 dark:border-emerald-400">\s*<img\s*src="\/chat-aktif\.svg"\s*alt="Profile"\s*className="w-full h-full object-cover"\s*\/>\s*<\/div>/g;
    c = c.replace(place1Regex, '<img src="/chat-aktif.svg" alt="Chat" className="w-8 h-8 shrink-0 object-contain" />');

    // Place 2
    const place2Regex = /<img\s*src="\/chat-aktif\.svg"\s*className="w-full h-full rounded-full object-cover border border-emerald-600 dark:border-emerald-400"\s*\/>/g;
    c = c.replace(place2Regex, '<img src="/chat-aktif.svg" alt="Chat" className="w-10 h-10 object-contain" />');

    fs.writeFileSync(f, c);
    changed++;
  }
});
console.log('Fixed wrappers:', changed);
