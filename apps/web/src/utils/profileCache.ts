export const profileCache = new Map<string, any>();
export const connectionCache = new Map<string, any>();
export const galleryCache = new Map<string, any>();
export const projectsCache = new Map<string, any>();

/**
 * Call after ANY follow/friend action so every cache is dropped and
 * all mounted components (sidebar, profile page, feed) refetch.
 */
export function notifyConnectionChanged(currentUserId: string, targetId: string) {
  profileCache.delete(targetId);
  connectionCache.delete(targetId);
  connectionCache.delete(`${currentUserId}-${targetId}`);
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("connection-changed", { detail: { currentUserId, targetId } })
    );
  }
}
