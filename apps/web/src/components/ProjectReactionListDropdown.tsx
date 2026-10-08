"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { REACTION_CONFIG, ReactionType } from "./ReactionButton";
import { getLikers } from "@/app/actions/interactions";

interface ProjectReactionListDropdownProps {
  targetId: string;
  count: number;
}

export function ProjectReactionListDropdown({ targetId, count }: ProjectReactionListDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [likers, setLikers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleDropdown = async () => {
    if (!isOpen) {
      // Calculate position
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setPopupPos({ top: rect.bottom + 8, left: rect.left });
      }
      setIsOpen(true);
      if (likers.length === 0 && !loading) {
        setLoading(true);
        const res = await getLikers(targetId, "PROJECT", 50);
        if (res.success && res.likers) {
          setLikers(res.likers);
        }
        setLoading(false);
      }
    } else {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (isOpen) setIsOpen(false);
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (!isOpen) return;
      if (
        containerRef.current?.contains(e.target as Node) ||
        popupRef.current?.contains(e.target as Node)
      ) {
        return;
      }
      setIsOpen(false);
    };
    if (isOpen) {
      window.addEventListener("scroll", handleScroll, true);
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Group likers by reaction type
  const groupedLikers = likers.reduce((acc, liker) => {
    const type = liker.type as ReactionType;
    if (!acc[type]) acc[type] = [];
    acc[type].push(liker);
    return acc;
  }, {} as Record<ReactionType, any[]>);

  // Sort groups by count (descending)
  const sortedTypes = (Object.keys(groupedLikers) as ReactionType[]).sort(
    (a, b) => groupedLikers[b].length - groupedLikers[a].length
  );

  return (
    <div ref={containerRef} className="relative flex items-center mr-1">
      <button 
        onClick={toggleDropdown}
        className="px-2 py-1 rounded-full flex items-center gap-1.5 text-gray-500 hover:bg-black/5 hover:text-gray-700 dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white/90 transition-colors"
      >
        <svg className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
        <span className="text-[14px] font-semibold">{count}</span>
      </button>

      {isOpen && mounted && createPortal(
        <div 
          ref={popupRef}
          className="fixed bg-white/90 dark:bg-black/80 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-xl shadow-2xl z-[999999] animate-in fade-in zoom-in-95 duration-200"
          style={{ top: popupPos.top, left: popupPos.left }}
        >
          <div className="p-4 max-h-[60vh] overflow-y-auto no-scrollbar min-w-[200px]">
            {loading ? (
              <div className="flex justify-center items-center py-4">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-400/50 dark:border-white/50 border-t-transparent"></div>
              </div>
            ) : likers.length > 0 ? (
              <div className="flex gap-6">
                {sortedTypes.map((type) => (
                  <div key={type} className="flex flex-col gap-3 min-w-[100px]">
                    {/* Header */}
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-200/50 dark:border-white/10">
                      <div className="w-5 h-5 relative shrink-0">
                        <Image src={REACTION_CONFIG[type]?.src || "/react/like.webp"} alt={type} fill className="object-contain" />
                      </div>
                      <span className="text-[13px] font-bold text-gray-700/80 dark:text-white/80 capitalize">
                        {REACTION_CONFIG[type]?.label || type}
                      </span>
                    </div>
                    {/* List */}
                    <div className="flex flex-col gap-2">
                      {groupedLikers[type].map((liker) => (
                        <div key={liker.id} className="text-[13px] font-medium text-gray-600/80 dark:text-white/70 truncate max-w-[120px]">
                          {liker.user?.profile?.displayName || liker.user?.username}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-[13px] text-gray-500/80 dark:text-white/50 text-center py-2 font-medium">
                Belum ada reaksi di project ini
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
