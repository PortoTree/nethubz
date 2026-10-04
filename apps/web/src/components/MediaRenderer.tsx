"use client";

import React from 'react';

interface MediaRendererProps {
  url: string;
  className?: string;
  alt?: string;
  onError?: (e: any) => void;
}

export function MediaRenderer({ url, className = "", alt = "Media", onError }: MediaRendererProps) {
  // Check for raw video extensions
  if (url.match(/\.(mp4|webm|ogg)$/i)) {
    return (
      <video 
        src={url} 
        controls 
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
  return (
    <img 
      src={url} 
      alt={alt} 
      className={className} 
      onError={onError}
    />
  );
}
