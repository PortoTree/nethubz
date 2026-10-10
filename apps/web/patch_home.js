const fs = require('fs');
let c = fs.readFileSync('src/app/[locale]/home/page.tsx', 'utf8');
const lines = c.split(/\r?\n/);

const activeTabLine = lines.findIndex(l => l.includes('const [activeTab, setActiveTab] = useState'));
if (activeTabLine === -1) {
    console.error('Could not find activeTab');
    process.exit(1);
}

let endLine = activeTabLine;
while (!lines[endLine].includes('});') && endLine < lines.length) {
    endLine++;
}

lines.splice(endLine + 1, 0,
`  useEffect(() => {
    if (pathname.includes('/obrolan')) setActiveTab('chat');
    else if (pathname.includes('/community')) setActiveTab('community');
    else if (pathname.includes('/friend')) setActiveTab('friend');
    else if (pathname.includes('/search')) setActiveTab('search');
    else if (pathname.includes('/product')) setActiveTab('product');
    else if (pathname.includes('/home')) setActiveTab('home');
  }, [pathname]);`
);

fs.writeFileSync('src/app/[locale]/home/page.tsx', lines.join('\n'));
console.log('Patched');
