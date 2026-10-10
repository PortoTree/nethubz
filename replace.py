import sys

path = r'c:\nethubz\apps\web\src\components\PostCard.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    '<div className=\"flex items-center gap-1 pt-1 border-t border-gray-100 dark:border-[#3E4042]\">',
    '<div className=\"flex items-center justify-end sm:justify-start gap-4 sm:gap-1 pt-0 sm:pt-1 border-t-0 sm:border-t border-gray-100 dark:border-[#3E4042]\">'
)

content = content.replace(
    '<ReactionButton myReaction={isLiked} onReact={handleLike} count={0} />',
    '<ReactionButton myReaction={isLiked} onReact={handleLike} count={0} containerClassName=\"flex-none sm:flex-1\" />'
)

# Update comment text for mobile
old_comment_block = '''            <span className="hidden sm:inline">{t("feed.comment") || "Komentar"}</span>
            {post._count?.comments > 0 ? (
              <>
                <span className="ml-1 inline sm:hidden">{post._count.comments}</span>
                <span className="ml-0.5 hidden sm:inline">({post._count.comments})</span>
              </>
            ) : (
              <span className="ml-0.5 hidden sm:inline">(0)</span>
            )}'''
new_comment_block = '''            <span className="hidden sm:inline">{t("feed.comment") || "Komentar"}</span>
            {post._count?.comments > 0 ? (
              <>
                <span className="ml-0.5 inline sm:hidden">{post._count.comments}</span>
                <span className="ml-0.5 hidden sm:inline">({post._count.comments})</span>
              </>
            ) : null}'''

content = content.replace(old_comment_block, new_comment_block)

with open(path, 'w', encoding='utf-8', newline='') as f:
    f.write(content)
