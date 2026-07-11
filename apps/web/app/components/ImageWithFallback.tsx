'use client';
import { useState } from 'react';

export default function ImageWithFallback({ src, fallbackSrc, alt, fallbackIconSize, ...props }: any) {
  const [error, setError] = useState(false);
  return <img src={error || !src ? fallbackSrc : src} alt={alt || ''} onError={() => setError(true)} {...props} />;
}
