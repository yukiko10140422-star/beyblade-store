import {useState} from 'react';
import type {ProductVariantFragment} from 'storefrontapi.generated';

interface MediaImage {
  id: string;
  image: {
    id?: string;
    url: string;
    altText?: string | null;
    width?: number;
    height?: number;
  };
}

/** Shopify CDN resize (the original stays available for the full-size link). */
function sized(url: string, width: number): string {
  return `${url}${url.includes('?') ? '&' : '?'}width=${width}`;
}

/**
 * Product photos on white. Thumbnails sit left of the main photo on wide
 * screens and below it on phones. The main photo links to the full-size
 * original (buyers inspect corners and edges of one-of-a-kind cards).
 */
export function ProductImage({
  image,
  media,
  alt,
  note,
}: {
  image: ProductVariantFragment['image'];
  media?: MediaImage[];
  /** Fallback alt text (product name + condition). */
  alt: string;
  /** e.g. "Photos show the actual card you will receive." */
  note?: string | null;
}) {
  const images: MediaImage[] =
    media && media.length > 0
      ? media
      : image
        ? [
            {
              id: image.id ?? 'variant',
              image: {
                url: image.url,
                altText: image.altText,
                width: image.width ?? undefined,
                height: image.height ?? undefined,
              },
            },
          ]
        : [];
  const [selected, setSelected] = useState(0);
  const current = images[Math.min(selected, images.length - 1)];

  return (
    <div className="flex flex-col gap-2 lg:flex-row-reverse lg:gap-3.5">
      <div className="flex flex-1 flex-col gap-2">
        {current ? (
          <a
            href={current.image.url}
            target="_blank"
            rel="noopener noreferrer"
            title="Open the full-size photo in a new tab"
            className="block cursor-zoom-in rounded-[4px] border border-vault-700 bg-white"
          >
            <img
              src={sized(current.image.url, 1000)}
              srcSet={`${sized(current.image.url, 600)} 600w, ${sized(current.image.url, 1000)} 1000w, ${sized(current.image.url, 1600)} 1600w`}
              sizes="(min-width: 1024px) 50vw, 100vw"
              alt={current.image.altText || alt}
              width={current.image.width || 1000}
              height={current.image.height || 1400}
              loading={selected === 0 ? 'eager' : 'lazy'}
              fetchPriority={selected === 0 ? 'high' : undefined}
              className="mx-auto block aspect-[3/4] max-h-[60vh] w-full object-contain lg:max-h-[620px]"
            />
          </a>
        ) : (
          <div className="flex aspect-[3/4] max-h-[60vh] items-center justify-center rounded-[4px] border border-vault-700 bg-white text-sm text-chrome-600">
            No photo yet
          </div>
        )}
        {note && (
          <span className="text-[13px] font-medium text-holo-500">{note}</span>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto lg:max-h-[620px] lg:w-[80px] lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setSelected(i)}
              aria-label={`Photo ${i + 1} of ${images.length}`}
              aria-current={i === selected}
              className={`h-[100px] w-[72px] shrink-0 overflow-hidden rounded-[3px] border bg-white ${
                i === selected ? 'border-2 border-holo-500' : 'border-vault-600'
              }`}
            >
              <img
                src={sized(img.image.url, 160)}
                alt=""
                loading="lazy"
                width={72}
                height={100}
                className="h-full w-full object-contain"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
