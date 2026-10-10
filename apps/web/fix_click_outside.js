const fs = require('fs');
let page = fs.readFileSync('src/app/[locale]/home/page.tsx', 'utf8');

const blocksToRemove = [
`      if (
        chatSettingsRef.current &&
        !chatSettingsRef.current.contains(event.target as Node)
      ) {
        setIsChatSettingsOpen(false);
      }`,
`      if (
        chatListSettingsRef.current &&
        !chatListSettingsRef.current.contains(event.target as Node)
      ) {
        setIsChatListSettingsOpen(false);
      }`,
`      if (
        chatFilterRef.current &&
        !chatFilterRef.current.contains(event.target as Node)
      ) {
        setIsChatFilterOpen(false);
      }`,
`      if (
        floatingChatFilterRef.current &&
        !floatingChatFilterRef.current.contains(event.target as Node)
      ) {
        setIsFloatingChatFilterOpen(false);
      }`,
`      if (
        floatingAttachmentMenuRef.current &&
        !floatingAttachmentMenuRef.current.contains(event.target as Node)
      ) {
        setIsFloatingAttachmentMenuOpen(false);
      }`,
`      if (
        chatMenuRef.current &&
        !chatMenuRef.current.contains(event.target as Node)
      ) {
        setActiveChatMenu(null);
      }`,
`      if (
        chatMoreMenuRef.current &&
        !chatMoreMenuRef.current.contains(event.target as Node)
      ) {
        setIsChatMoreMenuOpen(false);
      }`
];

for (const block of blocksToRemove) {
  page = page.replace(block + '\n', '');
  page = page.replace(block + '\r\n', '');
  // Also try replacing without trailing newline if it fails
  page = page.replace(block, '');
}

page = page.replace(
  '}, [activeChatMenu, isChatMoreMenuOpen, isRoomSearchOpen, isAttachmentMenuOpen, activeMessageDropdown]);',
  '}, [isRoomSearchOpen, isAttachmentMenuOpen, activeMessageDropdown]);'
);

fs.writeFileSync('src/app/[locale]/home/page.tsx', page);
console.log('Fixed handleClickOutside');
