"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import PostCard, { formatPostTime } from "./PostCard";
import { MediaRenderer } from "./MediaRenderer";
import { addComment, getComments } from "@/app/actions/interactions";
import { toggleLike } from "@/app/actions/interactions";
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

import { commentsCache } from "@/utils/cache";

interface PostDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: any;
  currentUser: any;
}

export default function PostDetailModal({ isOpen, onClose, post, currentUser }: PostDetailModalProps) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();

  const [comments, setComments] = useState<any[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);

  const [isLiked, setIsLiked] = useState(post.hasLiked || false);
  const [likeCount, setLikeCount] = useState(post._count?.likes || 0);

  const endOfCommentsRef = useRef<HTMLDivElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);

  const autoResize = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) setIsEmojiOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  useEffect(() => {
    const prevBody = document.body.style.overflow;
    const prevHtml = document.documentElement.style.overflow;
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      fetchComments();
    }
    return () => {
      document.body.style.overflow = prevBody;
      document.documentElement.style.overflow = prevHtml;
    };
  }, [isOpen, post.id]);

  const fetchComments = async (cursor?: string) => {
    // If cache exists and this is an initial load (no cursor), use cache directly — no network call.
    if (!cursor) {
      const cached = commentsCache.get(post.id);
      if (cached) {
        setComments(cached.comments);
        setNextCursor(cached.nextCursor);
        setIsLoadingComments(false);
        return; // ← stop here, no fetch
      }
      setIsLoadingComments(true);
    }
    const res = await getComments("post", post.id, cursor, 20);
    if (res.success) {
      if (cursor) {
        setComments(prev => {
          const next = [...prev, ...(res.comments || [])];
          commentsCache.set(post.id, { comments: next, nextCursor: res.nextCursor });
          return next;
        });
      } else {
        commentsCache.set(post.id, { comments: res.comments || [], nextCursor: res.nextCursor });
        setComments(res.comments || []);
      }
      setNextCursor(res.nextCursor);
    }
    if (!cursor) setIsLoadingComments(false);
  };

  const handleLike = async () => {
    if (!currentUser) return;
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    setLikeCount((prev: number) => newLiked ? prev + 1 : Math.max(0, prev - 1));
    await toggleLike(currentUser.id, "post", post.id);
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !currentUser || isSubmitting) return;

    setIsSubmitting(true);
    const res = await addComment(currentUser.id, "post", post.id, commentText);
    if (res.success && res.comment) {
      setComments(prev => {
        const next = [res.comment, ...prev];
        commentsCache.set(post.id, { comments: next, nextCursor });
        return next;
      });
      setCommentText("");
      // Update comment count on parent? For now just visual in modal
    }
    setIsSubmitting(false);
  };

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-2 md:p-4 bg-black/40 dark:bg-black/60 overscroll-contain" onWheel={e => e.stopPropagation()}>

      <div className="w-full max-w-4xl h-full max-h-[80vh] bg-white dark:bg-[#242526] rounded-xl flex flex-col md:flex-row overflow-hidden shadow-2xl border border-gray-200 dark:border-[#3E4042] relative" onClick={e => e.stopPropagation()}>
        
        {/* LEFT COLUMN - POST CONTENT */}
        <div className="w-full md:w-[55%] lg:w-[60%] flex flex-col overflow-y-auto border-r border-gray-200 dark:border-[#3E4042] custom-scrollbar bg-[#F3F2EF] dark:bg-[#18191A]">
          <div className="w-full shrink-0 min-h-full p-0 md:p-3 pb-20 md:pb-6">
             <PostCard post={post} currentUser={currentUser} hideFooter={true} disableClicks={true} />
          </div>
        </div>

        {/* RIGHT COLUMN - COMMENTS */}
        <div className="w-full md:w-[45%] lg:w-[40%] flex flex-col h-full bg-gray-50 dark:bg-[#18191A]">
          <div className="p-4 border-b border-gray-200 dark:border-[#3A3B3C] shrink-0 bg-white dark:bg-[#242526] flex items-center justify-between">
            <h2 className="font-bold text-[18px] text-gray-900 dark:text-white">{t("postModal.title") || "Komentar"}</h2>
            <button onClick={onClose} aria-label="Close" className="w-8 h-8 rounded-full bg-gray-200 dark:bg-[#3A3B3C] hover:bg-gray-300 dark:hover:bg-[#4E4F50] text-gray-700 dark:text-[#E4E6EB] flex items-center justify-center transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-4">
            {isLoadingComments ? (
              <>
                {[ "w-3/4", "w-1/2", "w-2/3", "w-4/5" ].map((w, i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-[#3A3B3C] shrink-0" />
                    <div className="flex-1">
                      <div className={`${w} bg-gray-200 dark:bg-[#3A3B3C] p-3 rounded-2xl rounded-tl-sm space-y-2`}>
                        <div className="h-3 w-1/3 rounded bg-gray-300 dark:bg-[#4E4F50]" />
                        <div className="h-3 w-full rounded bg-gray-300 dark:bg-[#4E4F50]" />
                        <div className="h-3 w-2/3 rounded bg-gray-300 dark:bg-[#4E4F50]" />
                      </div>
                      <div className="h-2.5 w-16 mt-2 ml-1 rounded bg-gray-200 dark:bg-[#3A3B3C]" />
                    </div>
                  </div>
                ))}
              </>
            ) : comments.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center p-8 text-gray-500 h-full">
                <svg className="w-12 h-12 mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                <p>{t("postModal.noComments") || "Belum ada komentar. Jadilah yang pertama!"}</p>
              </div>
            ) : (
              <>
                {comments.map(c => (
                  <div key={c.id} className="flex gap-3 group">
                    <img src={c.author?.profile?.avatarUrl || "/default-avatar.svg"} alt="Avatar" className="w-8 h-8 rounded-full object-cover shrink-0 cursor-pointer" onClick={() => router.push(`/${locale}/p/${c.author?.username}/${c.author?.id}`)} />
                    <div className="flex-1">
                      <div className="bg-white dark:bg-[#242526] p-3 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100 dark:border-[#3A3B3C]">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-[14px] text-gray-900 dark:text-[#E4E6EB] leading-tight cursor-pointer hover:underline" onClick={() => router.push(`/${locale}/p/${c.author?.username}/${c.author?.id}`)}>
                            {c.author?.profile?.displayName || c.author?.username}
                          </h4>
                          <button type="button" aria-label={t("postModal.more") || "Opsi lainnya"} className="-mt-1 -mr-1 p-1 rounded-full text-gray-500 hover:bg-gray-100 dark:text-[#B0B3B8] dark:hover:bg-[#3A3B3C] transition-colors shrink-0">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" /></svg>
                          </button>
                        </div>
                        <p className="text-[14px] text-gray-800 dark:text-gray-300 mt-1 whitespace-pre-wrap">{c.content}</p>
                      </div>
                      <div className="flex items-center gap-3 mt-1 ml-1 text-[12px] font-semibold text-gray-500">
                        <span>{formatPostTime(c.createdAt, t, locale)}</span>
                        <button className="hover:text-blue-500 transition-colors">{t("postModal.like") || "Suka"}</button>
                        <button className="hover:text-blue-500 transition-colors">{t("postModal.reply") || "Balas"}</button>
                      </div>
                    </div>
                  </div>
                ))}
                {nextCursor && (
                  <button 
                    onClick={() => fetchComments(nextCursor)} 
                    className="text-blue-500 hover:underline text-sm font-semibold text-center w-full py-2"
                  >
                    {t("postModal.loadMore") || "Muat lebih banyak"}
                  </button>
                )}
                <div ref={endOfCommentsRef} />
              </>
            )}
          </div>

          <div className="relative p-4 bg-white dark:bg-[#242526] border-t border-gray-200 dark:border-[#3A3B3C] shrink-0">
            <form onSubmit={handleSubmitComment} className="flex gap-3 items-end">
              <img src={currentUser?.profile?.avatarUrl || "/default-avatar.svg"} alt="Avatar" className="w-9 h-9 rounded-full object-cover shrink-0 mb-[2px]" />
              <div className="flex-1 relative">
                <div ref={emojiRef}>
                  <button type="button" onClick={() => setIsEmojiOpen(o => !o)} aria-label="Emoji" className="absolute left-2 bottom-[6px] p-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </button>
                  {isEmojiOpen && (
                    <div className="absolute bottom-full -left-12 mb-4 z-50 shadow-2xl rounded-2xl overflow-hidden picker-container">
                      <style>{`.picker-container em-emoji-picker{height:280px !important;min-height:280px !important;max-height:280px !important;width:328px !important;max-width:calc(100vw - 2rem) !important;}`}</style>
                      <Picker data={data} onEmojiSelect={(e: any) => setCommentText(prev => prev + e.native)} theme={document.documentElement.classList.contains("dark") ? "dark" : "light"} previewPosition="none" skinTonePosition="search" />
                    </div>
                  )}
                </div>
                <textarea 
                  ref={textareaRef}
                  value={commentText}
                  onChange={e => { setCommentText(e.target.value); autoResize(e.target); }}
                  placeholder={t("postModal.writeComment") || "Tulis komentar..."}
                  className="block w-full bg-gray-100 dark:bg-[#3A3B3C] border-none rounded-2xl py-2 pl-11 pr-12 text-[14px] text-gray-900 dark:text-white resize-none focus:ring-0 custom-scrollbar overflow-y-auto"
                  rows={1}
                  style={{ maxHeight: "120px" }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmitComment(e);
                    }
                  }}
                />
                <button 
                  type="submit" 
                  disabled={!commentText.trim() || isSubmitting}
                  className="absolute right-2 bottom-[6px] p-1 text-blue-600 disabled:text-gray-400 dark:text-blue-400 dark:disabled:text-gray-500 transition-colors"
                >
                  <svg className="w-5 h-5 rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
