import sys

path = r'c:\nethubz\apps\web\src\components\PostCard.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Top row layout
old_top_row = '''      {/* Reaction Summary & Counts */}
      <div className="px-4 pb-2 flex items-center justify-between text-[#65676B] dark:text-[#B0B3B8] text-[15px]">
        <div className="flex items-center gap-1.5 cursor-pointer hover:underline">'''

new_top_row = '''      {/* Reaction Summary & Counts */}
      <div className="px-4 pb-2 flex items-center justify-end sm:justify-between text-[#65676B] dark:text-[#B0B3B8] text-[15px]">
        <div className="hidden sm:flex items-center gap-1.5 cursor-pointer hover:underline">'''

content = content.replace(old_top_row, new_top_row)

# Extract the reaction summary block
# It starts from: <div className="flex items-center gap-1.5 cursor-pointer hover:underline">
# to: </div> before <div className="flex items-center gap-3">

start_str = '''        <div className="hidden sm:flex items-center gap-1.5 cursor-pointer hover:underline">
          <div className="flex items-center -space-x-1 z-0">'''

# Let's just find the exact block since it's hard to parse. 
reaction_summary_block = '''<div className="flex items-center gap-1.5 cursor-pointer hover:underline">
          <div className="flex items-center -space-x-1 z-0">
            {topReactions.length > 0 ? (
              (showAllReactions ? topReactions : topReactions.slice(0, 3)).map((r, i) => (
                <ReactionSummaryPopup key={r} targetId={post.id} targetType="POST" likeCount={likeCount} topReactions={topReactions} filterReactionType={r}>
                  <div className="w-[18px] h-[18px] rounded-full bg-white dark:bg-[#242526] relative z-10 flex items-center justify-center shadow-sm hover:z-20 hover:opacity-80 transition-opacity">
                     <Image src={REACTION_CONFIG[r].src} alt={r} fill className="object-contain" />
                  </div>
                </ReactionSummaryPopup>
              ))
            ) : likeCount > 0 ? (
              <ReactionSummaryPopup targetId={post.id} targetType="POST" likeCount={likeCount} topReactions={topReactions}>
                <div className="w-[18px] h-[18px] rounded-full bg-blue-500 flex items-center justify-center shadow-sm hover:z-20 hover:opacity-80 transition-opacity">
                  <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                  </svg>
                </div>
              </ReactionSummaryPopup>
            ) : null}
          </div>
          {likeCount > 0 && <span onClick={() => { if (!disableClicks) {
                  (window as any).__NethubzPrefetchedPost = post;
                  const searchParams = new URLSearchParams(window.location.search);
                  searchParams.set('postId', post.id);
                  router.push(${window.location.pathname}?, { scroll: false });
                } }}>{likeCount}</span>}
        </div>'''

mobile_reaction_summary = reaction_summary_block.replace(
    '<div className="flex items-center gap-1.5 cursor-pointer hover:underline">',
    '<div className="flex sm:hidden items-center gap-1.5 cursor-pointer hover:underline">'
)

old_footer_actions = '''      {/* Footer Actions */}
      <div className="px-4 pb-4 mt-2">
        <div className="flex items-center justify-end sm:justify-start gap-4 sm:gap-1 pt-0 sm:pt-1 border-t-0 sm:border-t border-gray-100 dark:border-[#3E4042]">
          <ReactionButton myReaction={isLiked} onReact={handleLike} count={0} containerClassName="flex-none sm:flex-1" />'''

new_footer_actions = '''      {/* Footer Actions */}
      <div className="px-4 pb-4 mt-2">
        <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-1 pt-0 sm:pt-1 border-t-0 sm:border-t border-gray-100 dark:border-[#3E4042]">
          
          {/* Mobile Reaction Summary */}
''' + mobile_reaction_summary + '''

          {/* Action Buttons */}
          <div className="flex items-center justify-end flex-1 sm:flex-none gap-3 sm:gap-1">
            <ReactionButton myReaction={isLiked} onReact={handleLike} count={0} containerClassName="flex-none sm:flex-1" />'''

content = content.replace(old_footer_actions, new_footer_actions)

# Fix the comment text visibility and remove count
old_comment_block = '''            <span className="hidden sm:inline">{t("feed.comment") || "Komentar"}</span>
            {post._count?.comments > 0 ? (
              <>
                <span className="ml-0.5 inline sm:hidden">{post._count.comments}</span>
                <span className="ml-0.5 hidden sm:inline">({post._count.comments})</span>
              </>
            ) : null}'''

new_comment_block = '''            <span>{t("feed.comment") || "Komentar"}</span>'''

content = content.replace(old_comment_block, new_comment_block)

with open(path, 'w', encoding='utf-8', newline='') as f:
    f.write(content)
