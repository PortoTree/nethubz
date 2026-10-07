import re

with open('apps/web/src/app/actions/posts.ts', 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Replace the includes in findMany with flattened includes
# We want to remove postMedia, likes, savedBy, and project.likes from the includes.
c = re.sub(r'''\s*postMedia:\s*\{\s*include:\s*\{\s*media:\s*true\s*\},\s*orderBy:\s*\{\s*order:\s*'asc'\s*\}\s*\},''', '', c)
c = re.sub(r'''\s*likes:\s*\{\s*where:\s*\{\s*userId\s*\}\s*\},''', '', c)
c = re.sub(r'''\s*savedBy:\s*\{\s*where:\s*\{\s*userId\s*\}\s*\},''', '', c)

# Replace project include with project select
c = re.sub(r'''project:\s*\{\s*include:\s*\{\s*_count:\s*\{\s*select:\s*\{\s*likes:\s*true,\s*comments:\s*true\s*\}\s*\},\s*likes:\s*\{\s*where:\s*\{\s*userId\s*\}\s*\},\s*savedBy:\s*\{\s*where:\s*\{\s*userId\s*\}\s*\},\s*\}\s*\}''', 'project: { select: { id: true, title: true, status: true, mediaUrls: true, coverUrls: true, isForSale: true, category: true, customCategory: true } }', c)

# 2. Add sequential queries instead of Promise.all
new_queries = """
    const fetchedProjectIds = posts.map(p => p.projectId).filter(Boolean) as string[];

    const allMedia = fetchedPostIds.length ? await prisma.postMedia.findMany({ where: { postId: { in: fetchedPostIds } }, include: { media: true }, orderBy: { order: 'asc' } }) : [];
    const allLikes = fetchedPostIds.length ? await prisma.like.findMany({ where: { postId: { in: fetchedPostIds }, userId } }) : [];
    const allSaves = fetchedPostIds.length ? await prisma.savedPost.findMany({ where: { postId: { in: fetchedPostIds }, userId } }) : [];
    const fetchedReactionGroups = fetchedPostIds.length ? await prisma.like.groupBy({ by: ['postId', 'type'], where: { postId: { in: fetchedPostIds } }, _count: true }) : [];
    const projectLikes = fetchedProjectIds.length ? await prisma.like.findMany({ where: { projectId: { in: fetchedProjectIds }, userId } }) : [];
    const projectSaves = fetchedProjectIds.length ? await prisma.savedProject.findMany({ where: { projectId: { in: fetchedProjectIds }, userId } }) : [];
    const projectCounts = fetchedProjectIds.length ? await prisma.project.findMany({ where: { id: { in: fetchedProjectIds } }, select: { id: true, _count: { select: { likes: true, comments: true } } } }) : [];

    for (const post of posts as any[]) {
      post.postMedia = allMedia.filter((m: any) => m.postId === post.id);
      post.likes = allLikes.filter((l: any) => l.postId === post.id);
      post.savedBy = allSaves.filter((s: any) => s.postId === post.id);
      post.topReactions = fetchedReactionGroups.filter((g: any) => g.postId === post.id).sort((a: any, b: any) => b._count - a._count).slice(0, 3).map((g: any) => g.type);
      
      if (post.project) {
        post.project.likes = projectLikes.filter((l: any) => l.projectId === post.project.id);
        post.project.savedBy = projectSaves.filter((s: any) => s.projectId === post.project.id);
        post.project._count = projectCounts.find((c: any) => c.id === post.project.id)?._count || { likes: 0, comments: 0 };
      }
    }
"""

c = re.sub(r'''\s*const fetchedReactionGroups = await prisma\.like\.groupBy\(\{ by: \['postId', 'type'\], where: \{ postId: \{ in: fetchedPostIds \} \}, _count: true \}\);\s*const fetchedMappedPosts = \[\];\s*for \(const post of posts\) \{\s*post\.topReactions = fetchedReactionGroups\.filter\(g => g\.postId === post\.id\)\.sort\(\(a, b\) => b\._count - a\._count\)\.slice\(0, 3\)\.map\(g => g\.type\);\s*fetchedMappedPosts\.push\(await mapPost\(post\)\);\s*\}''', new_queries + '\\n    const fetchedMappedPosts = [];\\n    for (const post of posts) {\\n      fetchedMappedPosts.push(await mapPost(post));\\n    }', c)


# 3. Update mapPost to support in-memory topReactions
c = re.sub(r'''\s*if \(post\.id\) \{\s*try \{\s*const reactionGroups = await prisma\.like\.groupBy''', '\\n    if (post.topReactions) { mapped.topReactions = post.topReactions; } else if (post.id) { try { const reactionGroups = await prisma.like.groupBy', c)


with open('apps/web/src/app/actions/posts.ts', 'w', encoding='utf-8') as f:
    f.write(c)

print("Done")
