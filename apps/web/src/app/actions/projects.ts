"use server";

import prisma from "@/utils/prisma";
import { revalidateTag, unstable_cache } from "next/cache";

export interface CreateProjectInput {
  userId: string;
  title: string;
  description: string;
  status: "RELEASED" | "IN_PROGRESS" | "SEARCHING_TEAM" | "OPEN_SOURCE";
  techStack: string[];
  repoUrl?: string;
  demoUrl?: string;
  coverUrls?: string[];
  mediaUrls?: string[];
  roleNeeded?: string;
}

export async function createProject(data: CreateProjectInput) {
  try {
    if (!data.title || !data.description) {
      return { success: false, error: "Title and description are required" };
    }

    const project = await prisma.project.create({
      data: {
        userId: data.userId,
        title: data.title,
        description: data.description,
        status: data.status,
        techStack: data.techStack || [],
        repoUrl: data.repoUrl || null,
        demoUrl: data.demoUrl || null,
        coverUrls: data.coverUrls || [],
        mediaUrls: data.mediaUrls || [],
        roleNeeded: data.roleNeeded || null,
      },
    });

    // We can revalidate tags like "user_profile_projects" or "feed"
    // @ts-expect-error Next.js typings might incorrectly expect 2 args
    revalidateTag("projects");

    return { success: true, project };
  } catch (error: any) {
    console.error("createProject Error:", error);
    return { success: false, error: error.message || "Failed to create project" };
  }
}

export const getUserProjectsCached = unstable_cache(
  async (userId: string) => {
    return prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  },
  ["user-projects"],
  { tags: ["projects"] }
);

export async function getUserProjects(userId: string) {
  try {
    if (!userId) return { success: true, projects: [], hasMore: false };
    const allProjects = await getUserProjectsCached(userId);
    
    const limit = 3;
    const projectsToReturn = allProjects.slice(0, limit);
    const hasMore = allProjects.length > limit;

    return { success: true, projects: projectsToReturn, hasMore };
  } catch (error: any) {
    console.error("getUserProjects Error:", error);
    return { success: false, projects: [], hasMore: false, error: error.message || "Failed to fetch projects" };
  }
}

export async function getAllProjects() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          include: {
            profile: true
          }
        }
      }
    });
    return { success: true, projects };
  } catch (error: any) {
    console.error("getAllProjects Error:", error);
    return { success: false, projects: [], error: error.message || "Failed to fetch projects" };
  }
}

export async function getProjectsByUsername(username: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        profile: true
      }
    });

    if (!user) {
      return { success: false, projects: [], error: "User not found" };
    }

    const projects = await prisma.project.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          include: {
            profile: true
          }
        }
      }
    });
    
    return { success: true, projects, user };
  } catch (error: any) {
    console.error("getProjectsByUsername Error:", error);
    return { success: false, projects: [], error: error.message || "Failed to fetch projects" };
  }
}
export async function getProjectById(id: string) {
  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        user: {
          include: {
            profile: true
          }
        }
      }
    });

    if (!project) {
      return { success: false, project: null, error: "Project not found" };
    }

    return { success: true, project };
  } catch (error: any) {
    console.error("getProjectById Error:", error);
    return { success: false, project: null, error: error.message || "Failed to fetch project" };
  }
}

export async function deleteProject(id: string, userId: string) {
  try {
    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      return { success: false, error: "Project not found" };
    }

    if (project.userId !== userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Hapus cover project di Cloudinary jika ada
    if (project.coverUrls && project.coverUrls.length > 0) {
      try {
        const { deleteFromCloudinary } = await import('@/lib/cloudinary');
        for (const url of project.coverUrls) {
          // Ekstrak publicId dari URL Cloudinary
          // Contoh URL: https://res.cloudinary.com/ecdhyrfa/image/upload/v1234/project-cover/img_abc.png
          // publicId: project-cover/img_abc
          const match = url.match(/\/v\d+\/(.+?)\.[a-z0-9]+$/i);
          if (match && match[1]) {
            const publicId = match[1];
            await deleteFromCloudinary(publicId, "image");
          }
        }
      } catch (e) {
        console.error("Failed to delete project cover from Cloudinary:", e);
      }
    }

    await prisma.project.delete({
      where: { id },
    });

    // @ts-expect-error Next.js typings might incorrectly expect 2 args
    revalidateTag("projects");
    return { success: true };
  } catch (error: any) {
    console.error("deleteProject Error:", error);
    return { success: false, error: error.message || "Failed to delete project" };
  }
}

export async function updateProject(id: string, userId: string, data: {
  title?: string;
  description?: string;
  status?: any;
  techStack?: string[];
  repoUrl?: string;
  demoUrl?: string;
  coverUrls?: string[];
  mediaUrls?: string[];
  roleNeeded?: string;
}) {
  try {
    const project = await prisma.project.findUnique({
      where: { id }
    });
    
    if (!project) return { success: false, error: "Project not found" };
    if (project.userId !== userId) return { success: false, error: "Unauthorized" };
    
    const updated = await prisma.project.update({
      where: { id },
      data: {
        title: data.title !== undefined ? data.title : project.title,
        description: data.description !== undefined ? data.description : project.description,
        status: data.status !== undefined ? data.status : project.status,
        techStack: data.techStack !== undefined ? data.techStack : project.techStack,
        repoUrl: data.repoUrl !== undefined ? data.repoUrl : project.repoUrl,
        demoUrl: data.demoUrl !== undefined ? data.demoUrl : project.demoUrl,
        coverUrls: data.coverUrls !== undefined ? data.coverUrls : project.coverUrls,
        mediaUrls: data.mediaUrls !== undefined ? data.mediaUrls : project.mediaUrls,
        roleNeeded: data.roleNeeded !== undefined ? data.roleNeeded : project.roleNeeded,
      }
    });
    
    // @ts-expect-error Next.js typings might incorrectly expect 2 args
    revalidateTag("projects");
    return { success: true, project: updated };
  } catch (error: any) {
    console.error("updateProject Error:", error);
    return { success: false, error: error.message || "Failed to update project" };
  }
}
