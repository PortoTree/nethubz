"use server";

import { revalidatePath } from "next/cache";
import jwt from "jsonwebtoken";

import prisma from "@/utils/prisma";

const verifyToken = (token: string, expectedUserId: string) => {
  if (!token) return false;
  try {
    const secret = process.env.JWT_SECRET || 'mencari-online-secret-key-dev';
    const decoded = jwt.verify(token, secret) as any;
    // Support various JWT claim formats
    const tokenUserId = decoded.sub || decoded.id || decoded._id || decoded.userId;
    return tokenUserId === expectedUserId;
  } catch (error) {
    return false;
  }
};

import { unstable_cache } from "next/cache";

export const getProfile = async (userId: string) => {
  try {
    const getCachedProfile = unstable_cache(
      async () => {
        return await prisma.profile.findUnique({
          where: { userId: userId },
          include: {
            user: {
              include: {
                profileSettings: true,
                socialLinks: true,
                followers: {
                  include: { follower: { include: { profile: true } } }
                },
                following: {
                  include: { following: { include: { profile: true } } }
                },
                friendshipsAsUser: {
                  where: { status: 'ACCEPTED' },
                  include: { friend: { include: { profile: true } } }
                },
                friendshipsAsFriend: {
                  where: { status: 'ACCEPTED' },
                  include: { user: { include: { profile: true } } }
                },
                _count: {
                  select: {
                    posts: true,
                    followers: true,
                    following: true,
                    friendshipsAsUser: { where: { status: 'ACCEPTED' } },
                    friendshipsAsFriend: { where: { status: 'ACCEPTED' } }
                  }
                }
              }
            }
          }
        });
      },
      [`profile-data-${userId}`],
      { tags: [`profile-${userId}`], revalidate: 86400 } // Cache for 1 day
    );

    const profile = await getCachedProfile();
    return { success: true, profile };
  } catch (error) {
    console.error("Error fetching profile:", error);
    return { success: false, error: "Database error" };
  }
};

export async function updateDisplayName(token: string, userId: string, newDisplayName: string) {
  if (!verifyToken(token, userId)) return { success: false, error: "Unauthorized" };
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) return { success: false, error: "Profile not found" };

    const now = new Date();
    const fifteenDaysAgo = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);

    // Filter out dates older than 15 days
    const recentChanges = profile.displayNameChangeDates.filter((date: Date) => date > fifteenDaysAgo);

    if (recentChanges.length >= 2) {
      return { success: false, error: "Limit reached" };
    }

    // Add current date to the array
    recentChanges.push(now);

    await prisma.profile.update({
      where: { userId },
      data: {
        displayName: newDisplayName,
        displayNameChangeDates: recentChanges,
      },
    });

    revalidatePath("/", "layout");

    return { success: true, displayName: newDisplayName, remainingChanges: 2 - recentChanges.length };
  } catch (error) {
    console.error("Error updating display name:", error);
    return { success: false, error: "Database error" };
  }
}

export async function updateProfileMedia(token: string, userId: string, type: "avatar" | "cover", url: string) {
  if (!verifyToken(token, userId)) return { success: false, error: "Unauthorized" };
  try {
    const finalUrl = url + (url.includes('?') ? '&' : '?') + `t=${Date.now()}`;
    if (type === "avatar") {
      await prisma.profile.update({
        where: { userId },
        data: { avatarUrl: finalUrl },
      });
    } else if (type === "cover") {
      await prisma.profile.update({
        where: { userId },
        data: { coverUrl: finalUrl },
      });
    }
    
    
    revalidatePath("/", "layout");

    return { success: true, url: finalUrl };
  } catch (error) {
    console.error("Error updating profile media:", error);
    return { success: false, error: "Database error" };
  }
}

export async function updateProfileInfo(token: string, userId: string, data: any) {
  if (!verifyToken(token, userId)) return { success: false, error: "Unauthorized" };
  try {
    const { bio, locationName, websiteUrl, externalLinks, socialLinks, education, profession, gender, birthDate, softSkills, hardSkills, softwareSkills, hobbies, music, tvShows, movies, games, sports, type, profileVisibility, privacyGender, privacyBirth, privacyLoc, privacyProf, privacySosmed, privacyFriendList, privacyFollowers, privacyFollowing, privacyActivity, privacyOwnedGroups, privacyJoinedGroups, privacyExternalLink, privacyTag, privacyComment, privacyOnline, privacyDM } = data;
    
    // Validate platform and url for socialLinks
    let formattedSocialLinks: any[] = [];
    if (socialLinks && Array.isArray(socialLinks)) {
      formattedSocialLinks = socialLinks.filter(s => s.platform && s.url).map((s, index) => ({
        platform: s.platform,
        url: s.url,
        displayOrder: index
      }));
    }

    await prisma.profile.update({
      where: { userId },
      data: {
        bio,
        locationName,
        websiteUrl,
        externalLinks: externalLinks !== undefined ? externalLinks : undefined,
        education,
        profession,
        gender,
        birthDate: birthDate ? new Date(birthDate) : null,
        type: type !== undefined ? type : undefined,
        softSkills: softSkills !== undefined ? softSkills : undefined,
        hardSkills: hardSkills !== undefined ? hardSkills : undefined,
        softwareSkills: softwareSkills !== undefined ? softwareSkills : undefined,
        hobbies: hobbies !== undefined ? hobbies : undefined,
        music: music !== undefined ? music : undefined,
        tvShows: tvShows !== undefined ? tvShows : undefined,
        movies: movies !== undefined ? movies : undefined,
        games: games !== undefined ? games : undefined,
        sports: sports !== undefined ? sports : undefined,
        ...(formattedSocialLinks.length >= 0 ? {
          user: {
            update: {
              socialLinks: {
                deleteMany: {},
                create: formattedSocialLinks
              }
            }
          }
        } : {}),
      },
    });

      await prisma.profileSettings.upsert({
        where: { userId },
        create: { 
          userId, 
          profileVisibility,
          privacyGender, privacyBirth, privacyLoc, privacyProf, privacySosmed, privacyFriendList, privacyFollowers, privacyFollowing, privacyActivity, privacyOwnedGroups, privacyJoinedGroups, privacyExternalLink, privacyTag, privacyComment, privacyOnline, privacyDM
        },
        update: { 
          profileVisibility,
          privacyGender, privacyBirth, privacyLoc, privacyProf, privacySosmed, privacyFriendList, privacyFollowers, privacyFollowing, privacyActivity, privacyOwnedGroups, privacyJoinedGroups, privacyExternalLink, privacyTag, privacyComment, privacyOnline, privacyDM
        }
      });

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Error updating profile info:", error);
    return { success: false, error: "Database error" };
  }
}

export async function searchUsersForMention(query: string) {
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { username: { contains: query, mode: "insensitive" } },
        { profile: { displayName: { contains: query, mode: "insensitive" } } }
      ]
    },
    take: 5,
    select: {
      id: true,
      username: true,
      profile: { select: { displayName: true, avatarUrl: true } }
    }
  });
  return users.map(u => ({
    id: `${u.username}/${u.id}`,
    display: u.username,
    avatarUrl: u.profile?.avatarUrl,
    displayName: u.profile?.displayName || u.username
  }));
}
