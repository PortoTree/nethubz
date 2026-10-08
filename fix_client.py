import re
with open('apps/web/src/app/[locale]/project/[username]/[id]/ClientProjectDetailPage.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('import { toggleLike, addComment, getComments, getCommentReplies } from "@/app/actions/interactions";', 'import { toggleLike, addComment, getComments, getCommentReplies, checkInteractionState } from "@/app/actions/interactions";')

# Now also inject the checkInteractionState fetch logic inside loadProject
fetch_logic = """    if (user?.id) {
      checkInteractionState(user.id, "project", id).then(interaction => {
        if (interaction.success) {
          setIsLiked(interaction.hasLiked);
        }
      });
    }"""

c = c.replace('setIsLiked((res.project as any).hasLiked || false);', 'setIsLiked((res.project as any).hasLiked || false);\n' + fetch_logic)

with open('apps/web/src/app/[locale]/project/[username]/[id]/ClientProjectDetailPage.tsx', 'w', encoding='utf-8') as f:
    f.write(c)
