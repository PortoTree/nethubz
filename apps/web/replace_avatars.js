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

    // Place 1: Floating Chat Bubble Header ("Obrolan")
    // w-8 h-8 rounded-full flex items-center justify-center shrink-0 overflow-hidden border border-emerald-600 dark:border-emerald-400
    c = c.replace(
      /(<div className="w-8 h-8[^>]+>)\s*<img\s+src="\/default-avatar\.svg"/g,
      '$1\n                      <img\n                        src="/chat-aktif.svg"'
    );

    // Place 2: Floating Chat Room Panel Header
    // <div className="relative w-10 h-10 shrink-0">
    c = c.replace(
      /(<div className="relative w-10 h-10 shrink-0">)\s*<img\s+src="\/default-avatar\.svg"/g,
      '$1\n                      <img\n                        src="/chat-aktif.svg"'
    );

    fs.writeFileSync(f, c);
    changed++;
  }
});
console.log('Fixed:', changed);
