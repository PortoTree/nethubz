const fs = require('fs');

// 1. Fix page.tsx missing states
let pagePath = 'src/app/[locale]/home/page.tsx';
let page = fs.readFileSync(pagePath, 'utf8');

const statesToAdd = `
  const [isChatListSettingsOpen, setIsChatListSettingsOpen] = useState(false);
  const [chatListFilter, setChatListFilter] = useState("semua");
  const [isChatFilterOpen, setIsChatFilterOpen] = useState(false);
  const [isChatInfoOpen, setIsChatInfoOpen] = useState(false);
  const [activeChatMenu, setActiveChatMenu] = useState<number | null>(null);
  const [isTempMessageOn, setIsTempMessageOn] = useState(false);
  const [isChatMoreMenuOpen, setIsChatMoreMenuOpen] = useState(false);
`;

if (!page.includes('const [isChatListSettingsOpen, setIsChatListSettingsOpen] = useState(false);')) {
  page = page.replace('const [activeChatIdx, setActiveChatIdx] = useState<number | null>(null);', 'const [activeChatIdx, setActiveChatIdx] = useState<number | null>(null);\n' + statesToAdd);
}

// Fix line 293 in page.tsx: arithmetic operation
// It's probably related to menuPosition or something. Let's look at the regex later if it fails.

fs.writeFileSync(pagePath, page);

// 2. Fix FloatingChatWidget.tsx missing states & types
let widgetPath = 'src/components/FloatingChatWidget.tsx';
let widget = fs.readFileSync(widgetPath, 'utf8');

// Fix router
if (!widget.includes('const router = useRouter();')) {
  widget = widget.replace('export default function FloatingChatWidget({', 'import { useRouter } from "next/navigation";\n\nexport default function FloatingChatWidget({');
  widget = widget.replace('const [isFloatingAttachmentMenuOpen, setIsFloatingAttachmentMenuOpen] = useState(false);', 'const [isFloatingAttachmentMenuOpen, setIsFloatingAttachmentMenuOpen] = useState(false);\n  const router = useRouter();\n  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });');
}

// Fix type error for floatingChatFilter
widget = widget.replace('useState<"semua" | "belum_dibaca" | "grup">("semua")', 'useState<string>("semua")');

fs.writeFileSync(widgetPath, widget);

console.log('Fixed missing states in page.tsx and FloatingChatWidget.tsx');
