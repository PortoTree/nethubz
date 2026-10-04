"use server";

import prisma from "@/utils/prisma";
import { revalidateTag } from "next/cache";

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
    revalidateTag("projects");

    return { success: true, project };
  } catch (error: any) {
    console.error("createProject Error:", error);
    return { success: false, error: error.message || "Failed to create project" };
  }
}

export async function getUserProjects(userId: string) {
  try {
    if (!userId) return { success: true, projects: [] };
    const projects = await prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, projects };
  } catch (error: any) {
    console.error("getUserProjects Error:", error);
    return { success: false, projects: [], error: error.message || "Failed to fetch projects" };
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
