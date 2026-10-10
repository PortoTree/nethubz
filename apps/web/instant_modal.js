const fs = require('fs');

// Update PostCard.tsx
let postCardPath = 'src/components/PostCard.tsx';
let postCardContent = fs.readFileSync(postCardPath, 'utf8');

postCardContent = postCardContent.replace(
  /const searchParams = new URLSearchParams\(window\.location\.search\);/g,
  '(window as any).__NethubzPrefetchedPost = post;\n                  const searchParams = new URLSearchParams(window.location.search);'
);

fs.writeFileSync(postCardPath, postCardContent);
console.log('PostCard.tsx updated to set window.__NethubzPrefetchedPost');

// Update GlobalPostModal.tsx
let globalModalPath = 'src/components/GlobalPostModal.tsx';
let globalModalContent = fs.readFileSync(globalModalPath, 'utf8');

const newUseEffect = `useEffect(() => {
    if (postId) {
      if (typeof window !== 'undefined' && (window as any).__NethubzPrefetchedPost?.id === postId) {
        setModalPost((window as any).__NethubzPrefetchedPost);
        setIsOpen(true);
      } else {
        getPostById(postId).then(res => {
          if (res.success && res.post) {
            setModalPost(res.post);
            setIsOpen(true);
          }
        });
      }
    } else {
      setIsOpen(false);
      // We don't nullify modalPost immediately to allow close animation
      setTimeout(() => setModalPost(null), 300);
    }
  }, [postId]);`;

globalModalContent = globalModalContent.replace(/useEffect\(\(\) => \{\s*if \(postId\) \{[\s\S]*?\}, \[postId\]\);/, newUseEffect);

fs.writeFileSync(globalModalPath, globalModalContent);
console.log('GlobalPostModal.tsx updated to read window.__NethubzPrefetchedPost');
