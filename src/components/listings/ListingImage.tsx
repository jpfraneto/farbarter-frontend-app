"use client";

import Image from "next/image";
import { Suspense } from "react";

interface ListingImageProps {
  imageUrl?: string;
  alt: string;
}

export function ListingImage({ imageUrl, alt }: ListingImageProps) {
  return (
    <div className="relative w-full h-64">
      <Suspense
        fallback={<div className="w-full h-full bg-slate-800 animate-pulse" />}
      >
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={alt}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 448px"
          />
        )}
      </Suspense>
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
    </div>
  );
}
