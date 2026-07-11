import React, { useState, useEffect } from 'react';

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80',
];

function getDeterministicFallback(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % FALLBACK_IMAGES.length;
  return FALLBACK_IMAGES[index];
}

export function convertGoogleDriveUrl(url: string | undefined): string {
  if (!url) return '';

  // 1. Check for standard Google Drive URL formats
  // Format A: https://drive.google.com/file/d/FILE_ID/view...
  const fileDMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileDMatch && fileDMatch[1]) {
    const fileId = fileDMatch[1];
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  }

  // Format B: https://drive.google.com/open?id=FILE_ID
  const openIdMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (openIdMatch && openIdMatch[1]) {
    const fileId = openIdMatch[1];
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  }

  // Format C: https://lh3.googleusercontent.com/d/FILE_ID=s0 / =s220
  const lhMatch = url.match(/lh3\.googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/);
  if (lhMatch && lhMatch[1]) {
    const fileId = lhMatch[1];
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  }

  return url;
}

function getInitialUrl(src: string | undefined, alt: string): string {
  if (!src) {
    return getDeterministicFallback(alt);
  }

  // Check if it is a simulated mock ID
  if (src.includes('gdrive_file_') || src.includes('mock_') || src.includes('gdrive_root_')) {
    return getDeterministicFallback(src);
  }

  return convertGoogleDriveUrl(src);
}

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  fallbackType?: 'photo' | 'video' | 'cover';
}

export const SafeImage: React.FC<SafeImageProps> = ({ 
  src, 
  fallbackType = 'photo', 
  alt = 'Media', 
  className,
  onError,
  ...props 
}) => {
  const [displayUrl, setDisplayUrl] = useState<string>(() => getInitialUrl(src, alt));
  const [retryCount, setRetryCount] = useState<number>(0);

  useEffect(() => {
    setDisplayUrl(getInitialUrl(src, alt));
    setRetryCount(0); // Reset retry count for new src
  }, [src, alt]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.warn(`[SafeImage] Error loading image URL: "${displayUrl}" for alt: "${alt}"`);
    
    if (onError) {
      onError(e);
    }

    if (retryCount === 0) {
      const converted = convertGoogleDriveUrl(src);
      if (converted !== displayUrl) {
        console.log(`[SafeImage] Auto-retrying with converted Google Drive URL: "${converted}"`);
        setDisplayUrl(converted);
        setRetryCount(1);
        return;
      }
    }

    const fallbackUrl = getDeterministicFallback(src || alt);
    console.log(`[SafeImage] Using stable fallback image URL: "${fallbackUrl}"`);
    setDisplayUrl(fallbackUrl);
  };

  return (
    <img 
      {...props}
      src={displayUrl || undefined} 
      alt={alt} 
      onError={handleImageError}
      className={className}
      referrerPolicy="no-referrer"
    />
  );
};
