const fs = require('fs'); 
const files = [
  'src/app/[locale]/home/page.tsx', 
  'src/app/[locale]/chatting/ClientChatPage.tsx', 
  'src/app/[locale]/friend/ClientFriendPage.tsx', 
  'src/app/[locale]/community/ClientCommunityPage.tsx', 
  'src/app/[locale]/product/ClientProductPage.tsx', 
  'src/app/beranda/page.tsx'
]; 

files.forEach(f => { 
  if(fs.existsSync(f)) { 
    let content = fs.readFileSync(f, 'utf8'); 
    if (!content.includes('import SidebarShortcuts')) { 
      content = content.replace('import ProfileSuggestion from "@/components/ProfileSuggestion";', 'import ProfileSuggestion from "@/components/ProfileSuggestion";\nimport SidebarShortcuts from "@/components/SidebarShortcuts";'); 
      content = content.replace(/<ProfileSuggestion ([^\>]+) \/>/g, '<ProfileSuggestion $1 />\n              {activeTab === "home" || activeTab === undefined ? <SidebarShortcuts /> : null}'); 
      fs.writeFileSync(f, content); 
    } 
  } 
}); 
console.log('Done');
