const fs = require('fs');
const files = [
  'src/app/[locale]/home/page.tsx',
  'src/app/[locale]/chatting/ClientChatPage.tsx',
  'src/app/[locale]/friend/ClientFriendPage.tsx',
  'src/app/[locale]/community/ClientCommunityPage.tsx'
];
let changed = 0;
files.forEach(f => {
  if (fs.existsSync(f)) {
    let c = fs.readFileSync(f, 'utf8');
    if (c.includes('isNewMessageOpen ? "scale-y-100')) {
      c = c.replace(/fixed bottom-0 w-\[300px\]/g, 'fixed bottom-0 left-[396px] w-[300px]');
      fs.writeFileSync(f, c);
      changed++;
    }
  }
});
console.log('Fixed:', changed);
