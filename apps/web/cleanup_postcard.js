const fs = require('fs');
const path = 'src/components/PostCard.tsx';

let content = fs.readFileSync(path, 'utf8');

// Remove the import
content = content.replace(/import PostDetailModal from "\.\/PostDetailModal";\r?\n/g, '');

// Remove state
content = content.replace(/  const \[isPostDetailModalOpen, setIsPostDetailModalOpen\] = useState\(false\);\r?\n/g, '');

// Remove rendering block
content = content.replace(/      \{\/\* Post Detail & Comment Modal \*\/\}\r?\n      \{isPostDetailModalOpen && \(\r?\n        <PostDetailModal\r?\n          isOpen=\{isPostDetailModalOpen\}\r?\n          onClose=\{\(\) => setIsPostDetailModalOpen\(false\)\}\r?\n          post=\{post\}\r?\n          currentUser=\{currentUser\}\r?\n        \/>\r?\n      \)\}\r?\n/g, '');

fs.writeFileSync(path, content);
console.log('PostCard.tsx cleaned up!');
