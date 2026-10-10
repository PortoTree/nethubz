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
    const place1Regex = /<img\s*src="\/navigasi\/chat-aktif\.svg"\s*alt="Chat"\s*className="w-8 h-8 shrink-0 object-contain"\s*\/>/g;
    c = c.replace(place1Regex, '<img src="/navigasi/chat-aktif.svg" alt="Chat" className="w-6 h-6 shrink-0 object-contain dark:invert" />');

    // Place 2
    const place2Regex = /<img\s*src="\/navigasi\/chat-aktif\.svg"\s*alt="Chat"\s*className="w-10 h-10 object-contain"\s*\/>/g;
    c = c.replace(place2Regex, '<img src="/navigasi/chat-aktif.svg" alt="Chat" className="w-8 h-8 object-contain dark:invert" />');

    fs.writeFileSync(f, c);
    changed++;
  }
});
console.log('Fixed sizes and colors:', changed);
