const fs = require('fs');
let lines = fs.readFileSync('src/app/[locale]/home/page.tsx', 'utf8').split(/\r?\n/);
const filteredLines = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('chatSettingsRef.current &&')) {
    // skip this and next 4 lines
    i += 4;
    continue;
  }
  if (line.includes('chatListSettingsRef.current &&')) {
    i += 4;
    continue;
  }
  if (line.includes('chatFilterRef.current &&')) {
    i += 4;
    continue;
  }
  if (line.includes('floatingChatFilterRef.current &&')) {
    i += 4;
    continue;
  }
  if (line.includes('floatingAttachmentMenuRef.current &&')) {
    i += 4;
    continue;
  }
  if (line.includes('chatMenuRef.current &&')) {
    i += 4;
    continue;
  }
  if (line.includes('chatMoreMenuRef.current &&')) {
    i += 4;
    continue;
  }
  
  filteredLines.push(line);
}

fs.writeFileSync('src/app/[locale]/home/page.tsx', filteredLines.join('\n'));
console.log('Fixed page.tsx clicks');
