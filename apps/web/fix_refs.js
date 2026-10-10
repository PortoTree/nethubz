const fs = require('fs');
let page = fs.readFileSync('src/app/[locale]/home/page.tsx', 'utf8');

// 1. Fix dependency array
page = page.replace('}, [activeChatIdx, activeFloatingChatIdx, isFloatingChatInfoOpen]);', '}, [activeChatIdx]);');

// 2. Remove floatingChatContainerRef from scrollToBottom
page = page.replace('      if (floatingChatContainerRef.current) {\n        floatingChatContainerRef.current.scrollTop = floatingChatContainerRef.current.scrollHeight;\n      }', '');
page = page.replace('      if (floatingChatContainerRef.current) {\r\n        floatingChatContainerRef.current.scrollTop = floatingChatContainerRef.current.scrollHeight;\r\n      }', '');

// 3. Remove declarations and handleFloatingChatScroll from page.tsx
// It's easier to just comment them out or replace them with empty string. We'll use regex for handleFloatingChatScroll
page = page.replace(/const floatingChatContainerRef = useRef[^\n]+;\r?\n/, '');
page = page.replace(/const \[showFloatingStickyDate, setShowFloatingStickyDate\] = useState[^\n]+;\r?\n/, '');
page = page.replace(/const \[floatingStickyDate, setFloatingStickyDate\] = useState[^\n]+;\r?\n/, '');
page = page.replace(/const handleFloatingChatScroll = [\s\S]+?setShowFloatingStickyDate\(false\);\r?\n    }\r?\n  };\r?\n/, '');

fs.writeFileSync('src/app/[locale]/home/page.tsx', page);

// Now fix FloatingChatWidget.tsx
let widget = fs.readFileSync('src/components/FloatingChatWidget.tsx', 'utf8');

const refsToAdd = `  const floatingChatContainerRef = useRef<HTMLDivElement>(null);
  const [showFloatingStickyDate, setShowFloatingStickyDate] = useState(false);
  const [floatingStickyDate, setFloatingStickyDate] = useState("");

  const handleFloatingChatScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const dateElements = container.querySelectorAll('.chat-date-separator');
    let currentText = "9/9/2026";
    let found = false;
    const containerRect = container.getBoundingClientRect();

    for (let i = dateElements.length - 1; i >= 0; i--) {
      const el = dateElements[i] as HTMLElement;
      const elRect = el.getBoundingClientRect();
      if (elRect.top <= containerRect.top + 60) {
        currentText = el.textContent || "";
        found = true;
        break;
      }
    }
    
    if (found) {
      setFloatingStickyDate(currentText);
      setShowFloatingStickyDate(true);
    } else {
      setShowFloatingStickyDate(false);
    }
  };

  useEffect(() => {
    const scrollToBottom = () => {
      if (floatingChatContainerRef.current) {
        floatingChatContainerRef.current.scrollTop = floatingChatContainerRef.current.scrollHeight;
      }
    };
    scrollToBottom();
    const timeout = setTimeout(scrollToBottom, 50);
    const timeout2 = setTimeout(scrollToBottom, 200);
    return () => {
      clearTimeout(timeout);
      clearTimeout(timeout2);
    };
  }, [activeFloatingChatIdx, isFloatingChatInfoOpen]);
`;

// Insert after floatingChatMessage declaration
if (!widget.includes('const floatingChatContainerRef = useRef')) {
  widget = widget.replace('const [floatingChatMessage, setFloatingChatMessage] = useState("");', 'const [floatingChatMessage, setFloatingChatMessage] = useState("");\n' + refsToAdd);
  fs.writeFileSync('src/components/FloatingChatWidget.tsx', widget);
}

console.log('Fixed refs');
