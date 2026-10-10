const fs = require('fs');
let lines = fs.readFileSync('src/app/[locale]/home/page.tsx', 'utf8').split('\n');
let out = [];
for(let i=0; i<lines.length; i++) {
  // Remove JSX block from 1993 to 2791 (0-indexed lines are 1992 to 2790, but let's match exact indices from earlier which was based on string splits).
  // I will just use string includes instead to be safer against line numbers changing.
  if (lines[i].includes('{/* Right Sidebar (Chat Panel) */}')) {
    out.push('              <FloatingChatWidget currentUser={currentUser} dummyChats={dummyChats} formatChatDate={formatChatDate} ChatStatusMark={ChatStatusMark} MessageDropdownMenu={MessageDropdownMenu} t={t} locale={locale} activeTab={activeTab} />');
    
    // skip until Product Detail Right Sidebar
    while (i < lines.length && !lines[i].includes('{/* Product Detail Right Sidebar */}')) {
      i++;
    }
    i--; // So the Product Detail line gets evaluated next loop
    continue;
  }

  let line = lines[i];
  if (line.includes('const [isChatExpanded, setIsChatExpanded] = useState')) continue;
  if (line.includes('const [isChatInfoOpen, setIsChatInfoOpen] = useState')) continue;
  if (line.includes('const [isChatMoreMenuOpen, setIsChatMoreMenuOpen] = useState')) continue;
  if (line.includes('const [isChatSettingsOpen, setIsChatSettingsOpen] = useState')) continue;
  if (line.includes('const [isChatListSettingsOpen, setIsChatListSettingsOpen] = useState')) continue;
  if (line.includes('const [isNewMessageOpen, setIsNewMessageOpen] = useState')) continue;
  if (line.includes('const [isTempMessageOn, setIsTempMessageOn] = useState')) continue;
  if (line.includes('const [isChatFilterOpen, setIsChatFilterOpen] = useState')) continue;
  if (line.includes('const [chatListFilter, setChatListFilter] = useState')) continue;
  if (line.includes('const [activeChatMenu, setActiveChatMenu] = useState')) continue;
  if (line.includes('const [activeFloatingChatIdx, setActiveFloatingChatIdx] = useState')) continue;
  if (line.includes('const floatingChatFilterRef = useRef')) continue;
  if (line.includes('const [isFloatingChatFilterOpen, setIsFloatingChatFilterOpen] = useState')) continue;
  if (line.includes('const [isFloatingChatInfoOpen, setIsFloatingChatInfoOpen] = useState')) continue;
  if (line.includes('const [floatingChatMessage, setFloatingChatMessage] = useState')) continue;
  
  if (line.includes('if (activeTab === "chat") {') && lines[i+1] && lines[i+1].includes('setActiveFloatingChatIdx(null);')) {
    i += 2; // skip the if, the setActive, and the closing brace
    continue;
  }

  out.push(line);
}

let finalCode = out.join('\n');
if (!finalCode.includes('import FloatingChatWidget')) {
  finalCode = finalCode.replace('import SidebarShortcuts from "@/components/SidebarShortcuts";', 'import SidebarShortcuts from "@/components/SidebarShortcuts";\nimport FloatingChatWidget from "@/components/FloatingChatWidget";');
}
fs.writeFileSync('src/app/[locale]/home/page.tsx', finalCode);
console.log('done refactoring page.tsx');
