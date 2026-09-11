"use client";

import { useState } from "react";
import Image from "next/image";

type Media = { id: string; url: string; alt: string };

export function ProductGallery({
  media,
  fallbackThumbnail,
  productName,
}: {
  media: Media[];
  fallbackThumbnail?: { url: string; alt?: string | null } | null;
  productName: string;
}) {
  const images =
    media.length > 0
      ? media
      : fallbackThumbnail?.url
        ? [{ id: "thumbnail", url: fallbackThumbnail.url, alt: fallbackThumbnail.alt ?? productName }]
        : [];

  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex];

  if (!active) {
    return <div className="aspect-square w-full rounded-lg bg-surface-muted" />;
  }

  return (
    <div className="flex flex-col gap-3">
      <Image
        src={active.url}
        alt={active.alt || productName}
        width={480}
        height={480}
        className="aspect-square w-full rounded-lg object-cover"
      />
      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-md border ${
                i === activeIndex ? "border-accent" : "border-border"
              }`}
            >
              <Image
                src={img.url}
                alt={img.alt || productName}
                width={64}
                height={64}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
