const fs = require('fs');
let widget = fs.readFileSync('src/components/FloatingChatWidget.tsx', 'utf8');

const refsToAdd = `  const chatSettingsRef = useRef<HTMLDivElement>(null);
  const chatListSettingsRef = useRef<HTMLDivElement>(null);
  const chatFilterRef = useRef<HTMLDivElement>(null);
  const floatingAttachmentMenuRef = useRef<HTMLDivElement>(null);
  const chatMenuRef = useRef<HTMLDivElement>(null);
  const chatMoreMenuRef = useRef<HTMLDivElement>(null);
  const [isFloatingAttachmentMenuOpen, setIsFloatingAttachmentMenuOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chatSettingsRef.current && !chatSettingsRef.current.contains(event.target as Node)) {
        setIsChatSettingsOpen(false);
      }
      if (chatListSettingsRef.current && !chatListSettingsRef.current.contains(event.target as Node)) {
        setIsChatListSettingsOpen(false);
      }
      if (chatFilterRef.current && !chatFilterRef.current.contains(event.target as Node)) {
        setIsChatFilterOpen(false);
      }
      if (floatingChatFilterRef.current && !floatingChatFilterRef.current.contains(event.target as Node)) {
        setIsFloatingChatFilterOpen(false);
      }
      if (floatingAttachmentMenuRef.current && !floatingAttachmentMenuRef.current.contains(event.target as Node)) {
        setIsFloatingAttachmentMenuOpen(false);
      }
      if (chatMenuRef.current && !chatMenuRef.current.contains(event.target as Node)) {
        setActiveChatMenu(null);
      }
      if (chatMoreMenuRef.current && !chatMoreMenuRef.current.contains(event.target as Node)) {
        setIsChatMoreMenuOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [
    isChatSettingsOpen, 
    isChatListSettingsOpen, 
    isChatFilterOpen, 
    isFloatingChatFilterOpen, 
    isFloatingAttachmentMenuOpen, 
    activeChatMenu, 
    isChatMoreMenuOpen
  ]);
`;

if (!widget.includes('const chatSettingsRef = useRef')) {
  widget = widget.replace('const floatingChatContainerRef = useRef<HTMLDivElement>(null);', refsToAdd + '\n  const floatingChatContainerRef = useRef<HTMLDivElement>(null);');
  fs.writeFileSync('src/components/FloatingChatWidget.tsx', widget);
}

console.log('Fixed widget missing refs');
