"use server";

import { revalidateTag } from "next/cache";
import prisma from "@/utils/prisma";
import { mapPost } from "./posts";

const GIVEAWAY_PUBLIC_SELECT = {
  id: true,
  title: true,
  rewardType: true,
  notes: true,
  endsAt: true,
  mode: true,
  winnerCount: true,
  maxParticipants: true,
  minAccountAgeDays: true,
  status: true,
  requirements: { orderBy: { order: "asc" as const } },
  _count: { select: { entries: { where: { status: { not: "PENDING" as const } } } } },
};

export async function createFolder(
  userId: string,
  name: string,
  description?: string
) {
  try {
    const folder = await prisma.folder.create({
      data: {
        name,
        description,
        userId,
      },
    });

    // Automatically add the creator as an EDITOR
    await prisma.folderMember.create({
      data: {
        folderId: folder.id,
        userId: userId,
        role: "EDITOR",
      },
    });

    // Invalidate the cache for saved items
    revalidateTag("saved_items", "page");
    revalidateTag(`saved_items_${userId}`, "page");

    return { success: true, folder };
  } catch (error) {
    console.error("Failed to create folder:", error);
    return { success: false, error: "Gagal membuat folder" };
  }
}

export async function getUserFolders(userId: string) {
  try {
    const folders = await prisma.folder.findMany({
      where: {
        OR: [
          { userId: userId }, // Folders owned by user
          { members: { some: { userId: userId } } } // Folders shared with user
        ]
      },
      include: {
        user: {
          select: {
            username: true,
            profile: {
              select: {
                avatarUrl: true
              }
            }
          }
        },
        members: {
          include: {
            user: {
              select: {
                username: true,
                profile: {
                  select: {
                    avatarUrl: true
                  }
                }
              }
            }
          }
        },
        _count: {
          select: { savedPosts: true, savedProjects: true }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, folders };
  } catch (error) {
    console.error("Failed to fetch folders:", error);
    return { success: false, error: "Gagal memuat folder" };
  }
}

export async function getFolderDetails(folderId: string, userId?: string) {
  try {
    const folder = await prisma.folder.findUnique({
      where: { id: folderId },
      include: {
        user: { include: { profile: true } },
        members: {
          include: {
            user: {
              include: { profile: true }
            }
          }
        },
        savedPosts: {
          include: { 
            post: { 
              include: { 
                author: { include: { profile: true } },
                postMedia: { include: { media: true }, orderBy: { order: 'asc' } },
                taggedUsers: { select: { id: true, username: true, profile: { select: { displayName: true, avatarUrl: true, coverUrl: true } } } },
                gallery: { select: { id: true, name: true } },
                _count: { select: { likes: true, comments: true } },
                giveaway: { select: GIVEAWAY_PUBLIC_SELECT },
                project: true,
                likes: userId ? { where: { userId } } : false,
                savedBy: userId ? { where: { userId } } : false
              } 
            } 
          }
        },
        savedProjects: {
          include: { 
            project: { 
              include: { 
                user: { include: { profile: true } },
                _count: { select: { likes: true, comments: true } },
                likes: userId ? { where: { userId } } : false,
                savedBy: userId ? { where: { userId } } : false
              } 
            } 
          }
        }
      }
    });
    
    if (folder) {
      folder.savedPosts = await Promise.all(folder.savedPosts.map(async (sp: any) => {
        sp.post = await mapPost(sp.post);
        return sp;
      }));
    }
    
    return { success: true, folder };
  } catch (e) {
    return { success: false };
  }
}

export async function assignItemToFolder(
  userId: string,
  targetType: "post" | "project",
  targetId: string,
  folderId: string | null
) {
  try {
    if (targetType === "post") {
      const existing = await prisma.savedPost.findUnique({
        where: { userId_postId: { userId, postId: targetId } }
      });
      if (!existing) {
        return { success: false, error: "Item belum disimpan" };
      }
      await prisma.savedPost.update({
        where: { id: existing.id },
        data: { folderId }
      });
    } else {
      const existing = await prisma.savedProject.findUnique({
        where: { userId_projectId: { userId, projectId: targetId } }
      });
      if (!existing) {
        return { success: false, error: "Item belum disimpan" };
      }
      await prisma.savedProject.update({
        where: { id: existing.id },
        data: { folderId }
      });
    }
    revalidateTag("saved_items", "page");
    revalidateTag(`saved_items_${userId}`, "page");
    return { success: true };
  } catch (error) {
    console.error("Failed to assign item to folder:", error);
    return { success: false, error: "Gagal memindahkan ke folder" };
  }
}

export async function getRootItems(userId: string) {
  try {
    let savedPosts = await prisma.savedPost.findMany({
      where: { userId, folderId: null },
      include: { 
        post: { 
          include: { 
            author: { include: { profile: true } },
            postMedia: { include: { media: true }, orderBy: { order: 'asc' } },
            taggedUsers: { select: { id: true, username: true, profile: { select: { displayName: true, avatarUrl: true, coverUrl: true } } } },
            gallery: { select: { id: true, name: true } },
            _count: { select: { likes: true, comments: true } },
            giveaway: { select: GIVEAWAY_PUBLIC_SELECT },
            project: true,
            likes: { where: { userId } },
            savedBy: { where: { userId } }
          } 
        } 
      },
      orderBy: { createdAt: "desc" }
    });

    savedPosts = await Promise.all(savedPosts.map(async (sp: any) => {
      sp.post = await mapPost(sp.post);
      return sp;
    }));

    const savedProjects = await prisma.savedProject.findMany({
      where: { userId, folderId: null },
      include: { 
        project: { 
          include: { 
            user: { include: { profile: true } },
            _count: { select: { likes: true, comments: true } },
            likes: { where: { userId } },
            savedBy: { where: { userId } }
          } 
        } 
      },
      orderBy: { createdAt: "desc" }
    });

    const items = [
      ...savedPosts.map((p: any) => ({ ...p, type: 'post' })),
      ...savedProjects.map((p: any) => ({ ...p, type: 'project' }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return { success: true, items };
  } catch (error) {
    console.error("Failed to fetch root items:", error);
    return { success: false, items: [] };
  }
}
