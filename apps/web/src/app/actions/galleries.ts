"use server";

import { unstable_cache, revalidateTag } from "next/cache";

import { revalidatePath } from "next/cache";
import prisma from "@/utils/prisma";

import { PostVisibility } from "@prisma/client";

export const getUserGalleries = async (userId: string, currentUserId?: string | null) => {
  return unstable_cache(
    async () => {
  try {
    console.log(`🔥 DB FETCH (CACHE MISS): getUserGalleries ${userId}`);
    const isSelf = currentUserId === userId;
    let isFriend = false;

    if (!isSelf && currentUserId) {
      const friendship = await prisma.friendship.findFirst({
        where: {
          OR: [
            { userId: userId, friendId: currentUserId },
            { userId: currentUserId, friendId: userId }
          ],
          status: 'ACCEPTED'
        }
      });
      isFriend = !!friendship;
    }

    let allowedVisibilities: PostVisibility[] = ['PUBLIC'];
    if (isSelf) {
      allowedVisibilities = ['PUBLIC', 'FRIENDS', 'PRIVATE', 'COMMUNITY_ONLY'];
    } else if (isFriend) {
      allowedVisibilities = ['PUBLIC', 'FRIENDS'];
    }

    const galleries = await prisma.gallery.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      include: {
        posts: {
          where: {
            visibility: {
              in: allowedVisibilities
            }
          },
          orderBy: { createdAt: 'asc' },
          include: {
            postMedia: {
              include: { media: true }
            }
          }
        }
      }
    });

    // Sembunyikan galeri yang kosong jika bukan milik sendiri
    const filteredGalleries = isSelf ? galleries : galleries.filter((g: any) => g.posts.length > 0);

    return { success: true, galleries: filteredGalleries };
  } catch (error) {
    console.error("Error fetching galleries:", error);
    return { success: false, error: "Failed to fetch galleries" };
  }
},
    ['getUserGalleries', String(userId), String(currentUserId || "guest")],
    { tags: ["global_galleries"] }
  )();
};

export async function createGallery(userId: string, name: string) {
  try {
    const gallery = await prisma.gallery.create({
      data: {
        name,
        userId
      }
    });
    return { success: true, gallery };
  } catch (error) {
    console.error("Error creating gallery:", error);
    return { success: false, error: "Failed to create gallery" };
  }
}

export async function updateGallery(galleryId: string, name?: string, privacy?: string) {
  try {
    const data: any = {};
    if (name !== undefined) data.name = name;
    if (privacy !== undefined) data.privacy = privacy;

    const gallery = await prisma.gallery.update({
      where: { id: galleryId },
      data
    });

    if (privacy !== undefined) {
      const visibility = privacy as any;
      await prisma.post.updateMany({
        where: { galleryId },
        data: { visibility }
      });
    }
    revalidatePath("/", "layout");
    revalidateTag("global_galleries", "page");
    return { success: true, gallery };
  } catch (error) {
    console.error("Error updating gallery:", error);
    return { success: false, error: "Failed to update gallery" };
  }
}

export async function deleteGallery(galleryId: string) {
  try {
    // 1. Ambil semua posts dan medianya sebelum dihapus
    const galleryPosts = await prisma.post.findMany({
      where: { galleryId },
      include: { postMedia: { include: { media: true } } }
    });

    // 2. Kumpulkan semua media yang perlu dihapus dari Cloudinary
    const mediaToDelete = new Map<string, any>();
    galleryPosts.forEach(post => {
      post.postMedia.forEach(pm => {
        if (pm.media && pm.media.publicId) {
          mediaToDelete.set(pm.media.id, pm.media);
        }
      });
    });

    // 3. Hapus semua posts di dalam gallery ini
    //    (PostMedia akan ikut terhapus via onDelete: Cascade)
    if (galleryPosts.length > 0) {
      await prisma.post.deleteMany({
        where: { galleryId }
      });
    }

    // 4. Hapus gallery-nya
    await prisma.gallery.delete({
      where: { id: galleryId }
    });

    // 5. Hapus media dari Cloudinary dan database (yang sudah tidak dipakai post manapun)
    if (mediaToDelete.size > 0) {
      const { deleteFromCloudinary } = await import('@/lib/cloudinary');
      for (const [mediaId, media] of mediaToDelete) {
        const stillUsed = await prisma.postMedia.findFirst({ where: { mediaId } });
        if (!stillUsed) {
          try {
            await deleteFromCloudinary(media.publicId, media.type === 'VIDEO' ? 'video' : 'image');
            await prisma.media.delete({ where: { id: mediaId } });
          } catch (e) {
            console.error("Failed to delete media from Cloudinary/DB:", e);
          }
        }
      }
    }

    revalidatePath("/", "layout");
    revalidateTag("global_galleries", "page");
    return { success: true };
  } catch (error) {
    console.error("Error deleting gallery:", error);
    return { success: false, error: "Failed to delete gallery" };
  }
}

export async function deleteMediaFromGallery(postId: string, mediaId: string) {
  try {
    // Check if the post exists and has other media or content
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { postMedia: true }
    });

    if (!post) {
      return { success: false, error: "Post not found" };
    }

    // Delete the specific media link
    await prisma.postMedia.deleteMany({
      where: {
        postId: postId,
        mediaId: mediaId
      }
    });

    // If it was the only media and there's no text content, delete the post entirely
    const postWasDeleted = post.postMedia.length === 1 && post.postMedia[0].mediaId === mediaId && (!post.content || post.content.trim() === '');
    if (postWasDeleted) {
      await prisma.post.delete({ where: { id: postId } });
    }

    // Auto-delete gallery if it's now empty (no more posts)
    if (post.galleryId) {
      const remainingPostsInGallery = await prisma.post.count({ where: { galleryId: post.galleryId } });
      if (remainingPostsInGallery === 0) {
        await prisma.gallery.delete({ where: { id: post.galleryId } });
      }
    }

    // Check if the media is used in any other post
    const otherUsage = await prisma.postMedia.findFirst({
      where: { mediaId: mediaId }
    });

    if (!otherUsage) {
      // Find the media to get its URL/publicId
      const media = await prisma.media.findUnique({
        where: { id: mediaId }
      });

      if (media && media.publicId) {
        try {
          const { deleteFromCloudinary } = await import('@/lib/cloudinary');
          const resourceType = media.type === 'VIDEO' ? 'video' : 'image';
          await deleteFromCloudinary(media.publicId, resourceType);
          
          // Delete from database
          await prisma.media.delete({ where: { id: mediaId } });
        } catch (e) {
          console.error("Failed to delete media from Cloudinary/DB:", e);
        }
      }
    }

    revalidatePath("/", "layout");
    revalidateTag("global_galleries", "page");
    return { success: true };
  } catch (error) {
    console.error("Error deleting media from gallery:", error);
    return { success: false, error: "Failed to delete media" };
  }
}

export async function moveMediaToAnotherGallery(userId: string, postId: string, mediaId: string, targetGalleryId: string) {
  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { postMedia: true }
    });

    if (!post) {
      return { success: false, error: "Post not found" };
    }

    // Target gallery privacy
    const gallery = await prisma.gallery.findUnique({
      where: { id: targetGalleryId }
    });
    const newVisibility = gallery ? gallery.privacy as any : "PUBLIC";

    // 1. Create a new post for this single media in the new gallery
    const newPost = await prisma.post.create({
      data: {
        authorId: userId,
        content: "",
        visibility: newVisibility,
        label: post.label,
        mediaLayout: "GRID",
        galleryId: targetGalleryId,
      }
    });

    // 2. Re-link the media to the new post
    await prisma.postMedia.updateMany({
      where: {
        postId: postId,
        mediaId: mediaId
      },
      data: {
        postId: newPost.id,
        order: 0
      }
    });

    // 3. Clean up old post if it's now empty
    if (post.postMedia.length === 1 && post.postMedia[0].mediaId === mediaId && (!post.content || post.content.trim() === '')) {
      await prisma.post.delete({ where: { id: postId } });
    }

    revalidatePath("/", "layout");
    revalidateTag("global_galleries", "page");
    return { success: true };
  } catch (error) {
    console.error("Error moving media:", error);
    return { success: false, error: "Failed to move media" };
  }
}

export async function setGalleryCover(galleryId: string, mediaUrl: string) {
  try {
    await prisma.gallery.update({
      where: { id: galleryId },
      data: { coverUrl: mediaUrl }
    });
    revalidatePath("/", "layout");
    revalidateTag("global_galleries", "page");
    return { success: true };
  } catch (error) {
    console.error("Error setting gallery cover:", error);
    return { success: false, error: "Failed to set gallery cover" };
  }
}


