"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import PostCard, { formatPostTime } from "./PostCard";
import { MediaRenderer } from "./MediaRenderer";
import { addComment, getComments, getCommentReplies } from "@/app/actions/interactions";
import { toggleLike } from "@/app/actions/interactions";
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Mention from '@tiptap/extension-mention';
import Placeholder from '@tiptap/extension-placeholder';
import { searchUsersForMention } from '@/app/actions/profile';
import { getMentionSuggestion } from '@/utils/mentionSuggestion';
import CommentInput from "./CommentInput";

import { commentsCache } from "@/utils/cache";

interface PostDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: any;
  currentUser: any;
}


function CommentItem({ 
  comment, 
  locale, 
  t, 
  router, 
  currentUser,
  handleLikeComment, 
  handleReplyClick,
  renderCommentContent,
  replyingToId,
  renderInput,
  depth = 0,
  isLast = false,
  isExpanded = false
}: any) {
  const [replies, setReplies] = useState<any[]>([]);
  const [showReplies, setShowReplies] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const inputElement = renderInput ? renderInput(comment.id) : null;
  const replyCount = (comment._count?.replies || 0) + (comment.optimisticReplies?.length || 0);

  const [isLiked, setIsLiked] = useState(comment.hasLiked || false);
  const [likeCount, setLikeCount] = useState(comment._count?.likes || 0);

  useEffect(() => {
    if (comment.optimisticReplies && comment.optimisticReplies.length > 0) {
      setShowReplies(true);
    }
  }, [comment.optimisticReplies]);

  const onLikeClick = async () => {
    if (!currentUser) return;
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    setLikeCount((prev: number) => newLiked ? prev + 1 : Math.max(0, prev - 1));
    await handleLikeComment(comment.id);
  };

  const fetchReplies = async (cursor?: string) => {
    setIsLoading(true);
    const res = await getCommentReplies(comment.id, cursor, 5);
    if (res.success && res.replies) {
      setReplies(prev => cursor ? [...prev, ...res.replies] : res.replies);
      setNextCursor(res.nextCursor);
    }
    setIsLoading(false);
  };

  const handleToggleReplies = () => {
    if (!showReplies && replies.length === 0) {
      fetchReplies();
    }
    setShowReplies(!showReplies);
  };

  const isReplying = replyingToId === comment.id;

  return (
    <div className={`flex gap-3 group relative z-0 ${depth > 0 ? 'mt-3' : ''} ${isReplying ? 'bg-blue-50/50 dark:bg-blue-900/10 p-2 -mx-2 rounded-lg' : ''}`}>
      {depth > 0 && (
        <div className={`absolute ${isReplying ? '-left-[25px]' : '-left-[33px]'} top-[-16px] w-[49px] h-[32px] border-b-[2px] border-l-[2px] border-gray-300 dark:border-[#4E4F50] rounded-bl-[12px] z-10`} />
      )}
      {depth > 0 && isLast && (
        <div className={`absolute ${isReplying ? '-left-[25px]' : '-left-[33px]'} top-[0] bottom-[0] w-[2px] z-[5] ${isReplying ? 'bg-blue-50 dark:bg-[#2c3746]' : (isExpanded ? 'bg-white dark:bg-[#242526]' : 'bg-gray-50 dark:bg-[#18191A]')}`} />
      )}
      {(showReplies || inputElement) && depth < 2 && (
        <div className={`absolute ${isReplying ? 'left-[23px]' : 'left-[15px]'} top-[32px] bottom-[24px] border-l-[2px] border-gray-300 dark:border-[#4E4F50] z-0`} />
      )}
      <img src={comment.author?.profile?.avatarUrl || "/default-avatar.svg"} alt="Avatar" className="w-8 h-8 rounded-full object-cover shrink-0 cursor-pointer relative z-10" onClick={() => router.push(`/${locale}/p/${comment.author?.username}/${comment.author?.id}`)} />
      <div className="flex-1 group/comment relative">
        <button type="button" aria-label={t("postModal.more") || "Opsi lainnya"} className="absolute right-0 top-0 opacity-0 group-hover/comment:opacity-100 p-1 rounded-full text-gray-500 hover:bg-gray-100 dark:text-[#B0B3B8] dark:hover:bg-[#3A3B3C] transition-all shrink-0">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
        </button>
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-[13px] text-gray-900 dark:text-[#E4E6EB] cursor-pointer hover:underline" onClick={() => router.push(`/${locale}/p/${comment.author?.username}/${comment.author?.id}`)}>
            {comment.author?.profile?.displayName || comment.author?.username}
          </h4>
          <span className="text-[12px] text-gray-500 dark:text-gray-400 font-normal">
            {formatPostTime(comment.createdAt, t, locale)}
          </span>
        </div>
        <p className="text-[14.5px] text-gray-900 dark:text-[#E4E6EB] mt-0.5 whitespace-pre-wrap">{renderCommentContent(comment.content)}</p>
        
        <div className="flex items-center gap-2 mt-1.5 text-[12.5px] font-medium text-gray-600 dark:text-gray-400">
          <button onClick={onLikeClick} className={`flex items-center gap-1.5 hover:bg-gray-100 dark:hover:bg-[#3A3B3C] px-2 py-1.5 rounded-full transition-colors -ml-2 ${isLiked ? 'text-blue-500' : ''}`}>
            {isLiked ? (
              <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24"><path d="M2 10.5a1.5 1.5 0 113 0v8a1.5 1.5 0 01-3 0v-8zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" /></svg>
            ) : (
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
            )}
            {likeCount > 0 && <span>{likeCount}</span>}
          </button>
          <button onClick={() => {
            const parentIdForDB = depth >= 2 ? comment.parentId : comment.id;
            handleReplyClick(comment.author?.username, comment.author?.id, comment.author?.profile?.displayName || comment.author?.username, comment.id, parentIdForDB);
          }} className="hover:bg-gray-100 dark:hover:bg-[#3A3B3C] px-3 py-1.5 rounded-full transition-colors">
            {t("postModal.reply") || "Balas"}
          </button>
        </div>

        {(replyCount > 0 || inputElement) && depth < 2 && (
          <div className="mt-2 ml-1 relative">
            {replyCount > 0 && (
              <button onClick={handleToggleReplies} className="flex items-center gap-1 text-blue-500 hover:underline text-[13px] font-semibold relative z-10">
                {showReplies ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                    {t("postModal.hideReplies") || "Sembunyikan balasan"}
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    {t("postModal.viewReplies", { count: replyCount }) || `Lihat ${replyCount} balasan`}
                  </>
                )}
              </button>
            )}
            
            {(showReplies || inputElement) && (
              <div className="mt-3 relative">
                {showReplies && Array.from(new Map([...replies, ...(comment.optimisticReplies || [])].map(r => [r.id, r])).values()).map((reply: any, index, arr) => (
                  <CommentItem 
                    key={reply.id} 
                    comment={reply}
                    locale={locale}
                    t={t}
                    router={router}
                    currentUser={currentUser}
                    handleLikeComment={handleLikeComment}
                    handleReplyClick={handleReplyClick}
                    renderCommentContent={renderCommentContent}
                    replyingToId={replyingToId}
                    renderInput={renderInput}
                    depth={depth + 1}
                    isLast={index === arr.length - 1 && !inputElement && !isLoading}
                    isExpanded={isExpanded}
                  />
                ))}
                
                {inputElement && (
                  <div className="relative z-0 mt-3">
                    <div className="absolute -left-[33px] top-[-16px] w-[49px] h-[32px] border-b-[2px] border-l-[2px] border-gray-300 dark:border-[#4E4F50] rounded-bl-[12px] z-10" />
                    {!isLoading && (
                      <div className={`absolute -left-[33px] top-[0] bottom-[0] w-[2px] z-[5] ${isExpanded ? 'bg-white dark:bg-[#242526]' : 'bg-gray-50 dark:bg-[#18191A]'}`} />
                    )}
                    <div className="relative z-20">
                      {inputElement}
                    </div>
                  </div>
                )}
                
                {isLoading && (
                  <div className="relative z-0 mt-3">
                    <div className="absolute -left-[33px] top-[-16px] w-[49px] h-[32px] border-b-[2px] border-l-[2px] border-gray-300 dark:border-[#4E4F50] rounded-bl-[12px] z-10" />
                    <div className={`absolute -left-[33px] top-[0] bottom-[0] w-[2px] z-[5] ${isExpanded ? 'bg-white dark:bg-[#242526]' : 'bg-gray-50 dark:bg-[#18191A]'}`} />
                    <div className="relative z-20 flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-[#3A3B3C] animate-pulse shrink-0"></div>
                      <div className="flex-1 flex flex-col gap-2 pt-1">
                        <div className="h-3 bg-gray-200 dark:bg-[#3A3B3C] rounded-full w-1/3 animate-pulse"></div>
                        <div className="h-3 bg-gray-200 dark:bg-[#3A3B3C] rounded-full w-2/3 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                )}
                
                {nextCursor && !isLoading && (
                  <button onClick={() => fetchReplies(nextCursor)} className="text-blue-500 hover:underline text-[12px] font-semibold mt-2 ml-11">
                    {t("postModal.loadMoreReplies") || "Muat balasan lainnya"}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function InlineReplyInput({ currentUser, onSubmit, onCancel, initialMention, t }: { currentUser: any, onSubmit: (text: string) => Promise<void>, onCancel: () => void, initialMention: any, t: any }) {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getMentionsText = (ed: any) => {
    const json = ed.getJSON();
    let txt = '';
    const parseNode = (node: any) => {
      if (node.type === 'text') txt += node.text;
      if (node.type === 'mention') txt += `@[${node.attrs.label}](${node.attrs.id})`;
      if (node.type === 'paragraph' && txt !== '') txt += '\n';
      if (node.content) node.content.forEach(parseNode);
    }
    if (json.content) json.content.forEach(parseNode);
    return txt.trim();
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ bold: false, italic: false, strike: false, code: false, codeBlock: false, heading: false, bulletList: false, orderedList: false, listItem: false, blockquote: false, horizontalRule: false }),
      Placeholder.configure({
        placeholder: t("postModal.writeReply") || "Tulis balasan...",
        emptyEditorClass: 'is-editor-empty text-gray-400',
      }),
      Mention.configure({
        HTMLAttributes: {
          class: 'text-blue-500 dark:text-blue-400 font-bold underline cursor-pointer bg-blue-50 dark:bg-blue-900/30 rounded px-1',
        },
        suggestion: getMentionSuggestion(),
      }),
    ],
    onUpdate: ({ editor }) => {
      setText(getMentionsText(editor));
    },
    editorProps: {
      attributes: {
        class: 'w-full min-h-[24px] max-h-[120px] overflow-y-auto outline-none custom-scrollbar',
      },
      handleKeyDown: (view, event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
          const popup = document.querySelector('.tippy-box');
          if (popup) return false;
          event.preventDefault();
          handleSubmit(new Event('submit') as any);
          return true;
        }
        return false;
      },
    },
  });

  const hasInsertedMention = useRef(false);

  useEffect(() => {
    if (editor && initialMention && !hasInsertedMention.current) {
      editor.chain().focus().insertContent([
        { type: 'mention', attrs: { id: `${initialMention.username}/${initialMention.id}`, label: initialMention.displayName } },
        { type: 'text', text: ' ' }
      ]).run();
      hasInsertedMention.current = true;
    }
  }, [editor, initialMention]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isSubmitting) return;
    setIsSubmitting(true);
    await onSubmit(text);
    setIsSubmitting(false);
  };

  return (
    <div className="mt-3 flex gap-2 items-start w-full pr-2">
      <img src={currentUser?.profile?.avatarUrl || "/default-avatar.svg"} alt="Avatar" className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5" />
      <form onSubmit={handleSubmit} className="flex-1 flex bg-white dark:bg-[#3A3B3C] border border-gray-300 dark:border-[#4E4F50] rounded-2xl overflow-hidden focus-within:border-gray-400 dark:focus-within:border-gray-500 transition-colors relative min-h-[36px]">
        <div className="flex-1 px-3 py-1.5 cursor-text text-[14px]" onClick={() => editor?.chain().focus().run()}>
          <style>{`
            .ProseMirror { outline: none; white-space: pre-wrap; word-break: break-word; color: #111827; }
            :is(.dark .ProseMirror) { color: #E4E6EB; }
            .ProseMirror p.is-editor-empty:first-child::before { color: #9ca3af; content: attr(data-placeholder); float: left; height: 0; pointer-events: none; }
            .ProseMirror p { margin: 0; }
          `}</style>
          <EditorContent editor={editor} />
        </div>
        <div className="flex items-center self-end mb-0.5 mr-0.5 gap-1">
          <button type="button" onClick={onCancel} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <button type="submit" disabled={!text.trim() || isSubmitting} className="p-1.5 text-blue-500 hover:text-blue-600 disabled:text-gray-400 dark:disabled:text-gray-500 transition-colors">
            <svg className="w-4 h-4 rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
          </button>
        </div>
      </form>
    </div>
  );
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
  const [replyingTo, setReplyingTo] = useState<{commentId: string, name: string, parentId?: string} | null>(null);
  const [isInputOpen, setIsInputOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Focus helper for MentionsInput
  const handleReplyClick = (username: string, id: string, displayName: string, exactCommentId: string, parentIdForDB?: string) => {
    setReplyingTo({ commentId: exactCommentId, name: displayName, parentId: parentIdForDB, username, id });
  };

  const getMentionsText = (ed: any) => {
    const json = ed.getJSON();
    let text = '';
    const parseNode = (node: any) => {
      if (node.type === 'text') text += node.text;
      if (node.type === 'mention') text += `@[${node.attrs.label}](${node.attrs.id})`;
      if (node.type === 'paragraph' && text !== '') text += '\n';
      if (node.content) node.content.forEach(parseNode);
    }
    if (json.content) json.content.forEach(parseNode);
    return text.trim();
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ bold: false, italic: false, strike: false, code: false, codeBlock: false, heading: false, bulletList: false, orderedList: false, listItem: false, blockquote: false, horizontalRule: false }),
      Placeholder.configure({
        placeholder: t("postModal.writeComment") || "Tulis komentar...",
        emptyEditorClass: 'is-editor-empty text-gray-400',
      }),
      Mention.configure({
        HTMLAttributes: {
          class: 'text-blue-500 dark:text-blue-400 font-bold underline cursor-pointer bg-blue-50 dark:bg-blue-900/30 rounded px-1',
        },
        suggestion: getMentionSuggestion(),
      }),
    ],
    onUpdate: ({ editor }) => {
      setCommentText(getMentionsText(editor));
    },
    editorProps: {
      attributes: {
        class: 'w-full min-h-[24px] max-h-[120px] overflow-y-auto outline-none custom-scrollbar',
      },
      handleKeyDown: (view, event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
          if (document.getElementById('mention-popup-container')) {
            return false;
          }
          event.preventDefault();
          if (commentText.trim() && !isSubmitting) {
            handleSubmitComment(event as any);
          }
          return true;
        }
        return false;
      }
    },
  });

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

  const handleInlineSubmit = async (text: string, parentId: string) => {
    if (!currentUser) return;
    const res = await addComment(currentUser.id, "post", post.id, text, parentId);
    if (res.success && res.comment) {
      // Recursive helper to find and append the reply in the tree
      const appendReply = (commentsList: any[], targetParentId: string): any[] => {
        return commentsList.map(c => {
          if (c.id === targetParentId) {
            return {
              ...c,
              optimisticReplies: [...(c.optimisticReplies || []), res.comment]
            };
          }
          if (c.optimisticReplies && c.optimisticReplies.length > 0) {
            return {
              ...c,
              optimisticReplies: appendReply(c.optimisticReplies, targetParentId)
            };
          }
          return c;
        });
      };
      
      setComments(prev => appendReply(prev, parentId));
      setReplyingTo(null);
    }
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
      if (editor) editor.commands.clearContent();
    }
    setIsSubmitting(false);
  };

  const handleLikeComment = async (commentId: string) => {
    if (!currentUser) return;
    try {
      await toggleLike(currentUser.id, "comment", commentId);
      // Optional: optimistic UI update for comment likes here
    } catch (error) {
      console.error("Error toggling comment like:", error);
    }
  };

  // fetchUsers function is now in mentionSuggestion

  const renderCommentContent = (content: string) => {
    if (!content) return null;
    const parts = content.split(/(@\[.*?\]\([^\)]+\))/g);
    return parts.map((part, i) => {
      const match = part.match(/@\[(.*?)\]\(([^\)]+)\)/);
      if (match) {
        const username = match[2].split('/')[0];
        const id = match[2].split('/')[1] || username;
        const isCurrentUser = currentUser && (id === currentUser.id || username === currentUser.username);
        const colorClass = isCurrentUser ? "text-blue-500 font-semibold bg-blue-50 dark:bg-blue-900/30 px-1 rounded" : "text-sky-500 dark:text-sky-400";
        return <span key={i} className={`${colorClass} cursor-pointer hover:underline`} onClick={(e) => { e.stopPropagation(); router.push(`/${locale}/p/${username}/${id}`); }}>@{match[1]}</span>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-2 md:p-4 bg-black/40 dark:bg-black/60 overscroll-contain" onWheel={e => e.stopPropagation()}>

      <div className="w-full max-w-4xl h-full h-[95vh] max-h-[95vh] bg-white dark:bg-[#242526] rounded-xl flex flex-col md:flex-row overflow-hidden shadow-2xl border border-gray-200 dark:border-[#3E4042] relative" onClick={e => e.stopPropagation()}>
        
        {/* LEFT COLUMN - POST CONTENT */}
        {!isExpanded && (
          <div className="w-full md:w-[50%] lg:w-[52%] flex flex-col overflow-y-auto border-r border-gray-200 dark:border-[#3E4042] custom-scrollbar bg-[#F3F2EF] dark:bg-[#18191A]">
            <div className="w-full shrink-0 min-h-full p-0 md:p-2 pb-16 md:pb-4">
               <PostCard post={post} currentUser={currentUser} hideFooter={true} disableClicks={true} />
            </div>
          </div>
        )}

        {/* RIGHT COLUMN - COMMENTS */}
        <div className={`w-full flex flex-col h-full relative ${isExpanded ? 'md:w-full lg:w-full bg-gray-100 dark:bg-black/40' : 'md:w-[50%] lg:w-[48%] bg-gray-50 dark:bg-[#18191A]'}`}>
          <div className={`flex flex-col h-full w-full ${isExpanded ? 'max-w-3xl mx-auto bg-white dark:bg-[#242526] border-x border-gray-200 dark:border-[#3E4042] shadow-2xl' : ''}`}>
            <div className="p-4 border-b border-gray-200 dark:border-[#3A3B3C] shrink-0 bg-white dark:bg-[#242526] flex items-center justify-between">
            <h2 className="font-bold text-[18px] text-gray-900 dark:text-white">{t("postModal.title") || "Komentar"}</h2>
            <div className="flex items-center gap-2">
              <button onClick={() => setIsExpanded(!isExpanded)} aria-label="Expand" className="w-8 h-8 rounded-full bg-gray-200 dark:bg-[#3A3B3C] hover:bg-gray-300 dark:hover:bg-[#4E4F50] text-gray-700 dark:text-[#E4E6EB] flex items-center justify-center transition-colors">
                {isExpanded ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 15L3 21M9 15h-6M9 15v6M15 9l6-6M15 9h6M15 9v-6" /></svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" /></svg>
                )}
              </button>
              <button onClick={onClose} aria-label="Close" className="w-8 h-8 rounded-full bg-gray-200 dark:bg-[#3A3B3C] hover:bg-gray-300 dark:hover:bg-[#4E4F50] text-gray-700 dark:text-[#E4E6EB] flex items-center justify-center transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 pb-24 custom-scrollbar flex flex-col gap-4">
            {isLoadingComments ? (
              <>
                {[ "w-3/4", "w-1/2", "w-2/3", "w-4/5" ].map((w, i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-[#3A3B3C] shrink-0" />
                    <div className="flex-1 mt-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="h-3 w-24 rounded bg-gray-300 dark:bg-[#4E4F50]" />
                        <div className="h-2.5 w-16 rounded bg-gray-200 dark:bg-[#3A3B3C]" />
                      </div>
                      <div className={`h-3 ${w} rounded bg-gray-300 dark:bg-[#4E4F50] mb-1.5`} />
                      <div className="h-3 w-1/3 rounded bg-gray-300 dark:bg-[#4E4F50] mb-2.5" />
                      
                      <div className="flex items-center gap-4">
                        <div className="h-5 w-5 rounded-full bg-gray-200 dark:bg-[#3A3B3C]" />
                        <div className="h-4 w-12 rounded bg-gray-200 dark:bg-[#3A3B3C]" />
                      </div>
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
                  <CommentItem 
                    key={c.id} 
                    comment={c}
                    locale={locale}
                    t={t}
                    router={router}
                    currentUser={currentUser}
                    handleLikeComment={handleLikeComment}
                    handleReplyClick={handleReplyClick}
                    renderCommentContent={renderCommentContent}
                    replyingToId={replyingTo?.commentId}
                    isExpanded={isExpanded}
                    renderInput={(commentId: string) => {
                      if (replyingTo?.commentId !== commentId) return null;
                      return (
                        <InlineReplyInput 
                          currentUser={currentUser}
                          t={t}
                          initialMention={{
                            username: (replyingTo as any).username,
                            id: (replyingTo as any).id,
                            displayName: replyingTo.name
                          }}
                          onCancel={() => setReplyingTo(null)}
                          onSubmit={(text) => handleInlineSubmit(text, replyingTo.parentId!)}
                        />
                      );
                    }}
                  />
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

          <CommentInput 
            editor={editor}
            commentText={commentText}
            isSubmitting={isSubmitting}
            replyingTo={replyingTo}
            setReplyingTo={setReplyingTo}
            handleSubmitComment={handleSubmitComment}
            isEmojiOpen={isEmojiOpen}
            setIsEmojiOpen={setIsEmojiOpen}
            emojiRef={emojiRef}
            isOpen={isInputOpen}
            setIsOpen={setIsInputOpen}
          />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
