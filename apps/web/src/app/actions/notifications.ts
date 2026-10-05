"use server";

import { revalidateTag } from "next/cache";
import jwt from "jsonwebtoken";

import prisma from "@/utils/prisma";

const verifyToken = (token: string, expectedUserId: string) => {
  if (!token) return false;
  try {
    const secret = process.env.JWT_SECRET || 'mencari-online-secret-key-dev';
    const decoded = jwt.verify(token, secret) as any;
    return decoded.sub === expectedUserId;
  } catch (error) {
    return false;
  }
};

export async function getNotifications(token: string, userId: string) {
  if (!verifyToken(token, userId)) return { success: false, error: "Unauthorized" };

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            profile: {
              select: {
                displayName: true,
                avatarUrl: true
              }
            }
          }
        }
      },
      take: 20
    });

    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false }
    });

    return { success: true, notifications, unreadCount };
  } catch (error: any) {
    console.error("Error fetching notifications:", error);
    return { success: false, error: "Database error: " + (error?.message || String(error)) };
  }
}

export async function markAsRead(token: string, userId: string, notificationId?: string) {
  if (!verifyToken(token, userId)) return { success: false, error: "Unauthorized" };

  try {
    if (notificationId) {
      await prisma.notification.updateMany({
        where: { id: notificationId, userId },
        data: { isRead: true }
      });
    } else {
      // Mark all as read
      await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true }
      });
    }

    revalidateTag(`notifications-${userId}`, "page");
    return { success: true };
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return { success: false, error: "Database error" };
  }
}

export async function deleteNotification(token: string, userId: string, notificationId: string) {
  if (!verifyToken(token, userId)) return { success: false, error: "Unauthorized" };

  try {
    await prisma.notification.deleteMany({
      where: { id: notificationId, userId }
    });
    revalidateTag(`notifications-${userId}`, "page");
    return { success: true };
  } catch (error) {
    console.error("Error deleting notification:", error);
    return { success: false, error: "Database error" };
  }
}
