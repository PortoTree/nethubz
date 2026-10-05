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
