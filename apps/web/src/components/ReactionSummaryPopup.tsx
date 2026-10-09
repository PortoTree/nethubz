"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { REACTION_CONFIG, ReactionType } from "./ReactionButton";
import { getLikers } from "@/app/actions/interactions";

interface ReactionSummaryPopupProps {
  targetId: string;
  targetType: "POST" | "COMMENT" | "PROJECT";
  likeCount: number;
  topReactions: ReactionType[];
  filterReactionType?: ReactionType;
  children: React.ReactNode;
}

export function ReactionSummaryPopup({ targetId, targetType, likeCount, topReactions, filterReactionType, children }: ReactionSummaryPopupProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [likers, setLikers] = useState<any[]>([]);
  const [totalLikersCount, setTotalLikersCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      let left = rect.left;
      if (left + 270 > window.innerWidth) left = window.innerWidth - 270;
      setPopupPos({ top: rect.bottom + 5, left: Math.max(10, left) });
    }
    
    timeoutRef.current = setTimeout(async () => {
      setIsHovered(true);
      if (likers.length === 0 && !loading) {
        setLoading(true);
        const res = await getLikers(targetId, targetType, 10, filterReactionType);
        if (res.success && res.likers) {
          setLikers(res.likers);
          setTotalLikersCount(res.totalCount || res.likers.length);
        }
        setLoading(false);
      }
    }, 400);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsHovered(false), 200);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (isHovered) setIsHovered(false);
    };
    if (isHovered) window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [isHovered]);

  return (
    <div 
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative flex items-center"
    >
      {children}

      {isHovered && mounted && createPortal(
        <div 
          className="fixed bg-black/80 dark:bg-white/15 backdrop-blur-md border border-white/10 rounded-lg shadow-xl w-64 max-h-80 overflow-y-auto z-[999999] animate-in fade-in slide-in-from-top-2 duration-200"
          style={{ top: popupPos.top, left: popupPos.left }}
        >
          <div className="p-3">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
              {filterReactionType ? (
                <>
                  <div className="w-5 h-5 relative shrink-0">
                    <Image src={REACTION_CONFIG[filterReactionType].src} alt={filterReactionType} fill className="object-contain" />
                  </div>
                  <h4 className="text-[14px] font-bold text-white capitalize">
                    {REACTION_CONFIG[filterReactionType].label.toLowerCase()}
                  </h4>
                </>
              ) : (
                <h4 className="text-[14px] font-bold text-white">Semua Reaksi</h4>
              )}
            </div>
            {loading ? (
              <div className="flex justify-center p-4">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/50 border-t-transparent"></div>
              </div>
            ) : likers.length > 0 ? (
              <div className="space-y-3">
                {likers.map((liker) => (
                  <div key={liker.id} className="flex items-center justify-between">
                    <span className="text-[14px] font-medium text-white truncate pr-2">
                      {liker.user?.profile?.displayName || liker.user?.username}
                    </span>
                    <div className="w-5 h-5 flex-shrink-0 relative">
                      <Image 
                        src={REACTION_CONFIG[liker.type as ReactionType]?.src || "/react/like.webp"} 
                        alt={liker.type} 
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                ))}
                {totalLikersCount > likers.length && (
                  <div className="text-[13px] text-gray-300 text-center pt-1 font-medium">
                    Dan {totalLikersCount - likers.length} lainnya...
                  </div>
                )}
              </div>
            ) : (
              <div className="text-[13px] text-gray-300 text-center py-2 font-medium">
                Tidak ada reaksi
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
