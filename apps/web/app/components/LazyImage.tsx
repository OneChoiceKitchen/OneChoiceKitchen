'use client';
import { useState } from 'react';

export default function LazyImage({ src, alt, fill, style, className, isNextImage, fallbackSrc }: any) {
  const [error, setError] = useState(false);
  const currentSrc = error || !src ? (fallbackSrc || '/map_placeholder.png') : src;
  
  return (
    <img 
      src={currentSrc} 
      alt={alt || ''} 
      style={{ ...style, ...(fill ? { width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 } : {}) }} 
      className={className}
      loading="lazy"
      decoding="async"
      onError={() => setError(true)} 
    />
  );
}
