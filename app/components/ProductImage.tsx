import type {ProductVariantFragment} from 'storefrontapi.generated';
import {Image} from '@shopify/hydrogen';
import {ImagePlaceholderIcon} from '~/components/icons';

export function ProductImage({
  image,
}: {
  image: ProductVariantFragment['image'];
}) {
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
