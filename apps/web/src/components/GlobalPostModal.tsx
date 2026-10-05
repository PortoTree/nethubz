"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { getPostById } from "@/app/actions/posts";
import PostDetailModal from "./PostDetailModal";
import { useUser } from "@/contexts/UserContext";

function GlobalPostModalContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const postId = searchParams.get("postId");
  
  const { currentUser } = useUser();
  const [modalPost, setModalPost] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (postId) {
      getPostById(postId).then(res => {
        if (res.success && res.post) {
          setModalPost(res.post);
          setIsOpen(true);
        }
      });
    } else {
      setIsOpen(false);
      // We don't nullify modalPost immediately to allow close animation
      setTimeout(() => setModalPost(null), 300);
    }
  }, [postId]);

  const handleClose = () => {
    setIsOpen(false);
    
    // Remove postId from URL without full page reload
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.delete("postId");
    const newUrl = newSearchParams.toString() ? `${pathname}?${newSearchParams.toString()}` : pathname;
    
    router.replace(newUrl, { scroll: false });
  };

  if (!modalPost) return null;

  return (
    <PostDetailModal
      isOpen={isOpen}
      onClose={handleClose}
      post={modalPost}
      currentUser={currentUser}
    />
  );
}

export default function GlobalPostModal() {
  return (
    <Suspense fallback={null}>
      <GlobalPostModalContent />
    </Suspense>
  );
}
