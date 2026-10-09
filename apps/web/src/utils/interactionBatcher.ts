import { checkBatchProjectInteractionState } from "@/app/actions/interactions";
import { interactionsCache } from "./cache";

type ResolveFn = (value: any) => void;
type RejectFn = (reason?: any) => void;

interface QueuedRequest {
  projectId: string;
  resolve: ResolveFn;
  reject: RejectFn;
}

let queue: QueuedRequest[] = [];
let batchTimeout: NodeJS.Timeout | null = null;

export async function fetchProjectInteraction(userId: string | undefined, projectId: string) {
  if (!userId) return null;

  return new Promise<any>((resolve, reject) => {
    queue.push({ projectId, resolve, reject });

    if (!batchTimeout) {
      batchTimeout = setTimeout(async () => {
        const currentQueue = [...queue];
        queue = [];
        batchTimeout = null;

        const ids = [...new Set(currentQueue.map((q) => q.projectId))];
        try {
          const results = await checkBatchProjectInteractionState(userId, ids);
          
          currentQueue.forEach((req) => {
            const result = results[req.projectId];
            if (result) {
              const cacheKey = `interaction_project_${req.projectId}_${userId}`;
              interactionsCache.set(cacheKey, {
                myReaction: result.myReaction,
                likeCount: result.likeCount,
                topReactions: result.topReactions,
                commentCount: result.commentCount,
                hasSaved: result.hasSaved,
              });
              req.resolve(result);
            } else {
              req.resolve({ success: false });
            }
          });
        } catch (e) {
          currentQueue.forEach((req) => req.reject(e));
        }
      }, 50); // 50ms batch window
    }
  });
}
