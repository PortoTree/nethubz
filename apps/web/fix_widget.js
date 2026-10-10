const fs = require('fs');
let content = fs.readFileSync('src/components/FloatingChatWidget.tsx', 'utf8');

// The file has:
// 845:           </div>
// 846:         </>
// 847: 
// 848:         {/* Product Detail Right Sidebar */}
// 849:     </>
// 850:   );
// 851: }

// I want to remove from 846 to 848.
const lines = content.split(/\r?\n/);
let out = [];
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('</>') && lines[i+2] && lines[i+2].includes('{/* Product Detail Right Sidebar */}')) {
    // Skip 3 lines
    i += 2;
    continue;
  }
  out.push(lines[i]);
}

fs.writeFileSync('src/components/FloatingChatWidget.tsx', out.join('\n'));
console.log('Fixed widget');
