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
    c = c.replace(/src="\/chat-aktif\.svg"/g, 'src="/navigasi/chat-aktif.svg"');
    fs.writeFileSync(f, c);
    changed++;
  }
});
console.log('Fixed paths:', changed);
