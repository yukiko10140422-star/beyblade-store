import {useState} from 'react';
import type {ProductVariantFragment} from 'storefrontapi.generated';
import {Image} from '@shopify/hydrogen';
import {ImagePlaceholderIcon} from '~/components/icons';

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

/**
 * Single image fallback (no gallery data)
 */
export function ProductImage({
  image,
  media,
}: {
  image: ProductVariantFragment['image'];
  media?: MediaImage[];
}) {
  if (media && media.length > 1) {
    return <ProductGallery images={media} />;
  }

  if (!image) {
    return (
      <div className="aspect-square rounded-xl bg-vault-800 border border-vault-700 flex items-center justify-center">
        <ImagePlaceholderIcon className="w-16 h-16 text-vault-600" />
      </div>
    );
  }

  return (
    <div className="aspect-square rounded-xl overflow-hidden bg-vault-800 border border-vault-700">
      <Image
        alt={image.altText || 'Product Image'}
        aspectRatio="1/1"
        data={image}
        key={image.id}
        sizes="(min-width: 1024px) 50vw, 100vw"
        loading="eager"
        fetchPriority="high"
        className="object-cover w-full h-full"
      />
    </div>
  );
}

function ProductGallery({images}: {images: MediaImage[]}) {
  const [selected, setSelected] = useState(0);
  const current = images[selected];

  return (
    <div className="lg:sticky lg:top-[104px] lg:self-start">
      {/* Main image */}
      <div className="aspect-square rounded-xl overflow-hidden bg-vault-800 border border-vault-700 relative group">
        <img
          src={current.image.url}
          alt={current.image.altText || 'Product Image'}
          width={current.image.width || 1200}
          height={current.image.height || 1200}
          loading={selected === 0 ? 'eager' : 'lazy'}
          fetchPriority={selected === 0 ? 'high' : undefined}
          className="object-contain w-full h-full"
        />

        {/* Prev / Next arrows */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={() =>
                setSelected((s) => (s - 1 + images.length) % images.length)
              }
              className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-vault-950/70 border border-vault-600/50 flex items-center justify-center text-chrome-300 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-vault-800"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path
                  fillRule="evenodd"
                  d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={() => setSelected((s) => (s + 1) % images.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-vault-950/70 border border-vault-600/50 flex items-center justify-center text-chrome-300 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-vault-800"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path
                  fillRule="evenodd"
                  d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </>
        )}

        {/* Counter badge */}
        <span className="absolute bottom-2 right-2 text-[10px] font-heading text-chrome-400 bg-vault-950/70 border border-vault-700/50 rounded-full px-2 py-0.5">
          {selected + 1} / {images.length}
        </span>
      </div>

      {/* Thumbnail strip */}
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {images.map((img, i) => (
          <button
            key={img.id}
            type="button"
            onClick={() => setSelected(i)}
            aria-label={`View image ${i + 1}`}
            className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
              i === selected
                ? 'border-gold-400 ring-1 ring-gold-400/30'
                : 'border-vault-700 hover:border-vault-500 opacity-60 hover:opacity-100'
            }`}
          >
            <img
              src={
                img.image.url +
                (img.image.url.includes('?') ? '&' : '?') +
                'width=128&height=128&crop=center'
              }
              alt={img.image.altText || `Thumbnail ${i + 1}`}
              width={64}
              height={64}
              loading="lazy"
              className="object-cover w-full h-full"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
