"use server";
import prisma from "@/utils/prisma";
import { revalidateTag } from "next/cache";

export async function renameFolder(userId: string, folderId: string, newName: string) {
  try {
    const folder = await prisma.folder.findUnique({ where: { id: folderId } });
    if (!folder) return { success: false, error: "Folder not found" };

    // Check if owner or editor
    const isOwner = folder.userId === userId;
    const member = await prisma.folderMember.findUnique({
      where: { folderId_userId: { folderId, userId } }
    });
    const isEditor = member?.role === "EDITOR";

    if (!isOwner && !isEditor) {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.folder.update({
      where: { id: folderId },
      data: { name: newName }
    });

    revalidateTag("saved_items", "page");
    revalidateTag(`saved_items_${userId}`, "page");
    return { success: true };
  } catch (error) {
    console.error("Failed to rename folder:", error);
    return { success: false, error: "Gagal mengganti nama folder" };
  }
}

export async function deleteFolder(userId: string, folderId: string) {
  try {
    const folder = await prisma.folder.findUnique({ where: { id: folderId } });
    if (!folder) return { success: false, error: "Folder not found" };

    if (folder.userId !== userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Remove folder reference from saved items (Prisma setNull action)
    await prisma.savedPost.updateMany({
      where: { folderId },
      data: { folderId: null }
    });
    
    await prisma.savedProject.updateMany({
      where: { folderId },
      data: { folderId: null }
    });

    await prisma.folder.delete({ where: { id: folderId } });

    revalidateTag("saved_items", "page");
    revalidateTag(`saved_items_${userId}`, "page");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete folder:", error);
    return { success: false, error: "Gagal menghapus folder" };
  }
}

export async function searchUsersToInvite(query: string, folderId: string, currentUserId: string) {
  try {
    const existingMembers = await prisma.folderMember.findMany({
      where: { folderId },
      select: { userId: true }
    });
    
    const existingMemberIds = existingMembers.map(m => m.userId);
    
    // also exclude owner if not in folderMember
    const folder = await prisma.folder.findUnique({ where: { id: folderId } });
    if (folder) existingMemberIds.push(folder.userId);

    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            OR: [
              { username: { contains: query, mode: 'insensitive' } },
              { profile: { displayName: { contains: query, mode: 'insensitive' } } }
            ]
          },
          { id: { notIn: existingMemberIds } }
        ]
      },
      select: {
        id: true,
        username: true,
        profile: {
          select: { displayName: true, avatarUrl: true }
        }
      },
      take: 5
    });

    return { success: true, users };
  } catch (error) {
    console.error("Failed to search users:", error);
    return { success: false, error: "Gagal mencari user" };
  }
}

export async function addFolderMember(folderId: string, targetUserId: string, role: string, currentUserId: string) {
  try {
    const folder = await prisma.folder.findUnique({ where: { id: folderId } });
    if (!folder) return { success: false, error: "Folder not found" };

    if (folder.userId !== currentUserId) {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.folderMember.create({
      data: {
        folderId,
        userId: targetUserId,
        role
      }
    });

    revalidateTag("saved_items", "page");
    revalidateTag(`saved_items_${currentUserId}`, "page");
    return { success: true };
  } catch (error) {
    console.error("Failed to add member:", error);
    return { success: false, error: "Gagal menambah member" };
  }
}

export async function updateFolderMemberRole(folderId: string, targetUserId: string, newRole: string, currentUserId: string) {
  try {
    const folder = await prisma.folder.findUnique({ where: { id: folderId } });
    if (!folder) return { success: false, error: "Folder not found" };

    if (folder.userId !== currentUserId) {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.folderMember.update({
      where: {
        folderId_userId: { folderId, userId: targetUserId }
      },
      data: { role: newRole }
    });

    revalidateTag("saved_items", "page");
    revalidateTag(`saved_items_${currentUserId}`, "page");
    return { success: true };
  } catch (error) {
    console.error("Failed to update role:", error);
    return { success: false, error: "Gagal mengubah role" };
  }
}

export async function removeFolderMember(folderId: string, targetUserId: string, currentUserId: string) {
  try {
    const folder = await prisma.folder.findUnique({ where: { id: folderId } });
    if (!folder) return { success: false, error: "Folder not found" };

    if (folder.userId !== currentUserId && currentUserId !== targetUserId) {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.folderMember.delete({
      where: {
        folderId_userId: { folderId, userId: targetUserId }
      }
    });

    revalidateTag("saved_items", "page");
    revalidateTag(`saved_items_${currentUserId}`, "page");
    return { success: true };
  } catch (error) {
    console.error("Failed to remove member:", error);
    return { success: false, error: "Gagal menghapus member" };
  }
}
