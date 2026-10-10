const fs = require('fs');
let page = fs.readFileSync('src/app/[locale]/home/page.tsx', 'utf8');

const refsToRemove = [
  'chatSettingsRef',
  'chatListSettingsRef',
  'chatFilterRef',
  'floatingChatFilterRef',
  'floatingAttachmentMenuRef',
  'chatMenuRef',
  'chatMoreMenuRef'
];

for (const ref of refsToRemove) {
  // Regex to match:
  //       if (
  //         REF.current &&
  //         !REF.current.contains(event.target as Node)
  //       ) {
  //         set...(false);
  //       }
  const regex = new RegExp(
    \`[ \\t]*if \\(\\s*\${ref}\\.current &&\\s*!\${ref}\\.current\\.contains\\(event\\.target as Node\\)\\s*\\)\\s*\\{\\s*set[A-Za-z0-9]+\\((false|null)\\);\\s*\\}\\r?\\n?\`,
    'g'
  );
  page = page.replace(regex, '');
}

fs.writeFileSync('src/app/[locale]/home/page.tsx', page);
console.log('Fixed handleClickOutside with regex');
