const fs = require('fs');
const path = 'src/components/PostCard.tsx';

let content = fs.readFileSync(path, 'utf8');

// Replace setIsPostDetailModalOpen(true) with a function that pushes to router
const pushLogic = `if (!disableClicks) {
                  const searchParams = new URLSearchParams(window.location.search);
                  searchParams.set('postId', post.id);
                  router.push(\`\${window.location.pathname}?\${searchParams.toString()}\`, { scroll: false });
                }`;

content = content.replace(/if \(!disableClicks\) setIsPostDetailModalOpen\(true\);/g, pushLogic);

// Remove the local PostDetailModal rendering
content = content.replace(/\{\/\* Post Detail & Comment Modal \*\/\}\s*\{isPostDetailModalOpen && \([\s\S]*?\}\)/g, '');

// Remove the state variable
content = content.replace(/const \[isPostDetailModalOpen, setIsPostDetailModalOpen\] = useState\(false\);\n/g, '');

fs.writeFileSync(path, content);
console.log('Updated PostCard.tsx to use URL param for Post Detail Modal');
