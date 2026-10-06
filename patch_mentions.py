import re

file_path = r"c:\mencari-online\apps\web\src\components\PostDetailModal.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update renderCommentContent for mention colors
render_comment_old = """        const username = match[2].split('/')[0];
        const id = match[2].split('/')[1] || username;
        return <span key={i} className="text-blue-500 cursor-pointer hover:underline" onClick={(e) => { e.stopPropagation(); router.push(`/${locale}/p/${username}/${id}`); }}>@{match[1]}</span>;
      }"""

render_comment_new = """        const username = match[2].split('/')[0];
        const id = match[2].split('/')[1] || username;
        const isCurrentUser = currentUser && (id === currentUser.id || username === currentUser.username);
        const colorClass = isCurrentUser ? "text-blue-500 font-semibold bg-blue-50 dark:bg-blue-900/30 px-1 rounded" : "text-sky-500 dark:text-sky-400";
        return <span key={i} className={`${colorClass} cursor-pointer hover:underline`} onClick={(e) => { e.stopPropagation(); router.push(`/${locale}/p/${username}/${id}`); }}>@{match[1]}</span>;
      }"""

if render_comment_old in content:
    content = content.replace(render_comment_old, render_comment_new)
    print("Patched renderCommentContent in PostDetailModal")
else:
    print("Could not find renderCommentContent old block in PostDetailModal")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

# Now for PostCard.tsx
file_path_card = r"c:\mencari-online\apps\web\src\components\PostCard.tsx"
with open(file_path_card, "r", encoding="utf-8") as f:
    content_card = f.read()

render_postcard_old = """      } else if (part.match(/^@[\\w.]+$/)) {
        const username = part.slice(1);
        const taggedUser = post.taggedUsers?.find((u: any) => u.username === username);
        if (taggedUser) {
          return (
            <span 
              key={i} 
              className="text-blue-500 hover:underline cursor-pointer font-semibold bg-blue-50 dark:bg-[#263951] px-1 rounded"
              onClick={(e) => {
                e.stopPropagation();
                if (onProfileClick) onProfileClick(taggedUser);
                else router.push(`/${locale}/p/${taggedUser.username}/${taggedUser.id}`);
              }}
            >
              {part}
            </span>
          );
        } else {
          return <span key={i} className="text-blue-500 font-semibold bg-blue-50 dark:bg-[#263951] px-1 rounded">{part}</span>;
        }
      }"""

render_postcard_new = """      } else if (part.match(/^@[\\w.]+$/)) {
        const username = part.slice(1);
        const taggedUser = post.taggedUsers?.find((u: any) => u.username === username);
        if (taggedUser) {
          const isCurrentUser = currentUser?.id === taggedUser.id || currentUser?.username === taggedUser.username;
          const colorClass = isCurrentUser ? "text-blue-500 font-semibold bg-blue-50 dark:bg-[#263951] px-1 rounded" : "text-sky-500 dark:text-sky-400";
          return (
            <span 
              key={i} 
              className={`${colorClass} hover:underline cursor-pointer`}
              onClick={(e) => {
                e.stopPropagation();
                if (onProfileClick) onProfileClick(taggedUser);
                else router.push(`/${locale}/p/${taggedUser.username}/${taggedUser.id}`);
              }}
            >
              {part}
            </span>
          );
        } else {
          return <span key={i} className="text-sky-500 dark:text-sky-400">{part}</span>;
        }
      }"""

if render_postcard_old in content_card:
    content_card = content_card.replace(render_postcard_old, render_postcard_new)
    print("Patched renderContent in PostCard")
else:
    print("Could not find renderContent old block in PostCard")

with open(file_path_card, "w", encoding="utf-8") as f:
    f.write(content_card)
