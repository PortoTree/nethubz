"use client";

import React from 'react';

interface MediaRendererProps {
  url: string;
  className?: string;
  alt?: string;
  onError?: (e: any) => void;
  variant?: "thumb" | "feed" | "detail" | "original";
}

function getCloudinaryOptimizedUrl(url: string, variant: "thumb" | "feed" | "detail" | "original" = "feed", isVideo = false) {
  if (!url.includes("res.cloudinary.com") || variant === "original") return url;
  
  let transform = isVideo ? "q_auto,f_auto" : "c_limit,w_800,q_auto,f_auto";
  if (variant === "thumb") transform = isVideo ? "c_limit,w_400,q_auto,f_auto" : "c_fill,w_300,q_auto,f_auto";
  if (variant === "detail") transform = isVideo ? "c_limit,w_1200,q_auto,f_auto" : "c_limit,w_1600,q_auto,f_auto";

  const parts = url.split('/upload/');
  if (parts.length !== 2) return url;

  let rest = parts[1];
  if (!rest.match(/^v\d+\//)) {
    const slashIdx = rest.indexOf('/');
    if (slashIdx !== -1) {
      rest = rest.substring(slashIdx + 1);
    }
  }

  return `${parts[0]}/upload/${transform}/${rest}`;
}

export function MediaRenderer({ url, className = "", alt = "Media", onError, variant = "feed" }: MediaRendererProps) {
  // Check for raw video extensions
  if (url.match(/\.(mp4|webm|ogg)$/i)) {
    const optimizedVideoUrl = getCloudinaryOptimizedUrl(url, variant, true);
    
    // Auto-generate poster by changing extension to jpg and using image transforms
    const posterUrl = getCloudinaryOptimizedUrl(url.replace(/\.(mp4|webm|ogg)$/i, '.jpg'), variant, false);

    return (
      <video 
        src={optimizedVideoUrl}
        poster={url.includes("res.cloudinary.com") ? posterUrl : undefined}
        controls 
        preload="metadata"
        className={className}
        onError={onError}
      />
    );
  }

  // Check for YouTube
  const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (ytMatch && ytMatch[1]) {
    return (
      <iframe
        src={`https://www.youtube.com/embed/${ytMatch[1]}`}
        className={className}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="YouTube Video"
      />
    );
  }

  // Check for TikTok
  const tiktokMatch = url.match(/tiktok\.com\/@.*\/video\/(\d+)/i);
  if (tiktokMatch && tiktokMatch[1]) {
    return (
      <iframe
        src={`https://www.tiktok.com/embed/v2/${tiktokMatch[1]}`}
        className={className}
        allow="encrypted-media; fullscreen"
        title="TikTok Video"
      />
    );
  }

  // Check for Instagram
  const igMatch = url.match(/instagram\.com\/(?:p|reel|tv)\/([^\/?#&]+)/i);
  if (igMatch && igMatch[1]) {
    return (
      <iframe
        src={`https://www.instagram.com/p/${igMatch[1]}/embed`}
        className={className}
        scrolling="no"
        frameBorder="0"
        allowTransparency={true}
        allow="encrypted-media"
        title="Instagram Post"
      />
    );
  }

  // Fallback to Image
  const optimizedImageUrl = getCloudinaryOptimizedUrl(url, variant, false);
  return (
    <img 
      src={optimizedImageUrl} 
      alt={alt} 
      className={className} 
      onError={onError}
      loading={variant === "detail" ? "eager" : "lazy"}
    />
  );
}
