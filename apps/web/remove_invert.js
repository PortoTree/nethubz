const fs = require('fs');
const files = [
  'src/app/[locale]/home/page.tsx',
  'src/app/[locale]/chatting/ClientChatPage.tsx',
  'src/app/[locale]/friend/ClientFriendPage.tsx',
  'src/app/[locale]/community/ClientCommunityPage.tsx',
  'src/app/beranda/page.tsx'
];

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  content = content.replaceAll('className="w-6 h-6 shrink-0 object-contain dark:invert"', 'className="w-6 h-6 shrink-0 object-contain"');
  fs.writeFileSync(f, content);
});
console.log('Done');
