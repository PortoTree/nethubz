"use server";

import prisma from "@/utils/prisma";

export async function toggleLike(userId: string, targetType: "post" | "comment" | "project", targetId: string) {
  try {
    const existingLike = await prisma.like.findFirst({
      where: {
        userId,
        postId: targetType === "post" ? targetId : null,
        commentId: targetType === "comment" ? targetId : null,
        projectId: targetType === "project" ? targetId : null,
      },
    });

    if (existingLike) {
      await prisma.like.delete({
        where: { id: existingLike.id },
      });
      return { success: true, action: "unliked" };
    } else {
      await prisma.like.create({
        data: {
          userId,
          postId: targetType === "post" ? targetId : undefined,
          commentId: targetType === "comment" ? targetId : undefined,
          projectId: targetType === "project" ? targetId : undefined,
        },
      });

      // TODO: Create Notification
      let targetOwnerId: string | undefined;
      let notifPostId: string | undefined;
      let notifProjectId: string | undefined;
      
      if (targetType === "post") {
        const post = await prisma.post.findUnique({ where: { id: targetId } });
        if (post) {
          targetOwnerId = post.authorId;
          notifPostId = targetId;
        }
      } else if (targetType === "project") {
        const project = await prisma.project.findUnique({ where: { id: targetId } });
        if (project) {
          targetOwnerId = project.userId;
          notifProjectId = targetId;
        }
      } else if (targetType === "comment") {
        const comment = await prisma.comment.findUnique({ where: { id: targetId } });
        if (comment) {
          targetOwnerId = comment.authorId;
          notifPostId = comment.postId || undefined;
          notifProjectId = comment.projectId || undefined;
        }
      }
      
      if (targetOwnerId && targetOwnerId !== userId) {
        await prisma.notification.create({
          data: {
            type: targetType === "post" ? "POST_LIKE" : targetType === "project" ? "PROJECT_LIKE" : "COMMENT_LIKE" as any,
            userId: targetOwnerId,
            senderId: userId,
            postId: notifPostId,
            projectId: notifProjectId,
            commentId: targetType === "comment" ? targetId : undefined,
          }
        });
      }

      return { success: true, action: "liked" };
    }
  } catch (error: any) {
    console.error("Toggle Like Error:", error);
    return { success: false, error: error.message };
  }
}

export async function toggleSave(userId: string, targetType: "post" | "project", targetId: string) {
  try {
    if (targetType === "post") {
      const existingSave = await prisma.savedPost.findUnique({
        where: { userId_postId: { userId, postId: targetId } },
      });

      if (existingSave) {
        await prisma.savedPost.delete({
          where: { id: existingSave.id },
        });
        return { success: true, action: "unsaved" };
      } else {
        await prisma.savedPost.create({
          data: { userId, postId: targetId },
        });
        return { success: true, action: "saved" };
      }
    } else {
      const existingSave = await prisma.savedProject.findUnique({
        where: { userId_projectId: { userId, projectId: targetId } },
      });

      if (existingSave) {
        await prisma.savedProject.delete({
          where: { id: existingSave.id },
        });
        return { success: true, action: "unsaved" };
      } else {
        await prisma.savedProject.create({
          data: { userId, projectId: targetId },
        });
        return { success: true, action: "saved" };
      }
    }
  } catch (error: any) {
    console.error("Toggle Save Error:", error);
    return { success: false, error: error.message };
  }
}

export async function incrementShareCount(targetType: "post" | "project", targetId: string) {
  try {
    if (targetType === "post") {
      await prisma.post.update({
        where: { id: targetId },
        data: { shareCount: { increment: 1 } },
      });
    } else {
      await prisma.project.update({
        where: { id: targetId },
        data: { shareCount: { increment: 1 } },
      });
    }
    return { success: true };
  } catch (error: any) {
    console.error("Increment Share Error:", error);
    return { success: false, error: error.message };
  }
}

export async function addComment(userId: string, targetType: "post" | "project", targetId: string, content: string, parentId?: string) {
  try {
    const comment = await prisma.comment.create({
      data: {
        authorId: userId,
        content,
        postId: targetType === "post" ? targetId : undefined,
        projectId: targetType === "project" ? targetId : undefined,
        parentId,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            profile: {
              select: { displayName: true, avatarUrl: true }
            }
          }
        },
        _count: {
          select: { replies: true, likes: true }
        }
      }
    });

    // TODO: Create Notification
    let targetOwnerId: string | undefined;
    
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({ where: { id: parentId } });
      if (parentComment && parentComment.authorId !== userId) {
        await prisma.notification.create({
          data: {
            type: "COMMENT_REPLY",
            userId: parentComment.authorId,
            senderId: userId,
            postId: targetType === "post" ? targetId : undefined,
            projectId: targetType === "project" ? targetId : undefined,
          }
        });
      }
    } else {
      if (targetType === "post") {
        const post = await prisma.post.findUnique({ where: { id: targetId } });
        if (post) targetOwnerId = post.authorId;
      } else if (targetType === "project") {
        const project = await prisma.project.findUnique({ where: { id: targetId } });
        if (project) targetOwnerId = project.userId;
      }
      
      if (targetOwnerId && targetOwnerId !== userId) {
        await prisma.notification.create({
          data: {
            type: targetType === "post" ? "POST_COMMENT" : "PROJECT_COMMENT",
            userId: targetOwnerId,
            senderId: userId,
            postId: targetType === "post" ? targetId : undefined,
            projectId: targetType === "project" ? targetId : undefined,
          }
        });
      }
    }


    // Handle Mentions
    const mentionRegex = /@\[.*?\]\(([^\)]+)\)/g;
    let match;
    const mentionedUserIds = new Set<string>();
    while ((match = mentionRegex.exec(content)) !== null) {
      const parts = match[1].split('/');
      const id = parts[1] || parts[0];
      if (id !== userId) {
        mentionedUserIds.add(id);
      }
    }

    if (mentionedUserIds.size > 0) {
      try {
        await Promise.all(
          Array.from(mentionedUserIds).map(mentionedId =>
            prisma.notification.create({
              data: {
                type: "COMMENT_MENTION" as any,
                userId: mentionedId,
                senderId: userId,
                postId: targetType === "post" ? targetId : undefined,
                projectId: targetType === "project" ? targetId : undefined,
                commentId: comment.id,
              }
            })
          )
        );
      } catch (e) {
        console.error("Failed to create mention notifications:", e);
      }
    }

    return { success: true, comment };

  } catch (error: any) {
    console.error("Add Comment Error:", error);
    return { success: false, error: error.message };
  }
}

export async function getComments(targetType: "post" | "project", targetId: string, cursor?: string, limit: number = 10) {
  try {
    const comments = await prisma.comment.findMany({
      where: {
        postId: targetType === "post" ? targetId : undefined,
        projectId: targetType === "project" ? targetId : undefined,
        parentId: null, // Only fetch top-level comments first
      },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            profile: {
              select: { displayName: true, avatarUrl: true }
            }
          }
        },
        _count: {
          select: { replies: true, likes: true }
        }
      }
    });

    let nextCursor: string | undefined = undefined;
    if (comments.length > limit) {
      const nextItem = comments.pop();
      nextCursor = nextItem?.id;
    }

    return { success: true, comments, nextCursor };
  } catch (error: any) {
    console.error("Get Comments Error:", error);
    return { success: false, error: error.message };
  }
}

export async function getCommentReplies(commentId: string, cursor?: string, limit: number = 10) {
  try {
    const replies = await prisma.comment.findMany({
      where: {
        parentId: commentId,
      },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: "asc" }, // Replies are usually oldest first
      include: {
        author: {
          select: {
            id: true,
            username: true,
            profile: {
              select: { displayName: true, avatarUrl: true }
            }
          }
        },
        _count: {
          select: { replies: true, likes: true }
        }
      }
    });

    let nextCursor: string | undefined = undefined;
    if (replies.length > limit) {
      const nextItem = replies.pop();
      nextCursor = nextItem?.id;
    }

    return { success: true, replies, nextCursor };
  } catch (error: any) {
    console.error("Get Comment Replies Error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteComment(userId: string, commentId: string) {
  try {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId }
    });

    if (!comment) return { success: false, error: "Comment not found" };
    if (comment.authorId !== userId) return { success: false, error: "Unauthorized" };

    await prisma.comment.delete({
      where: { id: commentId }
    });

    return { success: true };
  } catch (error: any) {
    console.error("Delete Comment Error:", error);
    return { success: false, error: error.message };
  }
}
