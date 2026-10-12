"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * Immagine con lazy loading, effetto blur-up e fallback di sicurezza:
 * se `src` non è disponibile, passa a `fallback`.
 */
export function SmartImage({
  src,
  fallback,
  alt,
  sizes,
  priority = false,
  className = "",
}: {
  src: string;
  fallback?: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  return (
    <Image
      src={failed && fallback ? fallback : src}
      alt={alt}
      fill
      priority={priority}
      loading={priority ? undefined : "lazy"}
      sizes={sizes}
      onLoad={() => setLoaded(true)}
      onError={() => setFailed(true)}
      className={`${className} transition-all duration-700 ${
        loaded ? "opacity-100 blur-0" : "opacity-60 blur-md"
      }`}
    />
  );
}
