import { ExternalLink, Package } from 'lucide-react';
import type { CatalogProduct } from '../types/catalogProduct';

const AFFILIATE_REL = 'nofollow sponsored';

type ProductCardProps = {
  product: CatalogProduct;
};

function isSafeOutboundUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch {
    return false;
  }
}

/** Amazon-style CTA yellow (brand accent) */
const AMAZON_CTA_BG = '#FFCE12';

export default function ProductCard({ product }: ProductCardProps) {
  const href = (product.amazonLink ?? '').trim();
  const outboundOk = isSafeOutboundUrl(href);
  const imageSrc = product.image_url || product.imageUrls?.[0] || null;

  return (
    <article
      className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow flex"
      data-testid="shop-product-card"
    >
      <div className="w-28 h-28 bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
        {outboundOk && imageSrc ? (
          <a
            href={href}
            target="_blank"
            rel={AFFILIATE_REL}
            className="w-full h-full flex items-center justify-center"
            aria-label={`${product.name} on Amazon (opens in new tab)`}
          >
            <img
              src={imageSrc}
              alt=""
              loading="lazy"
              className="w-full h-full object-contain"
            />
          </a>
        ) : imageSrc ? (
          <img
            src={imageSrc}
            alt=""
            loading="lazy"
            className="w-full h-full object-contain"
          />
        ) : (
          <Package className="h-8 w-8 text-gray-400" aria-hidden />
        )}
      </div>
      <div className="p-3 flex-1 flex flex-col justify-between gap-2 min-w-0">
        <div className="min-w-0">
          {outboundOk ? (
            <a
              href={href}
              target="_blank"
              rel={AFFILIATE_REL}
              className="text-sm font-semibold text-gray-800 line-clamp-2 mb-1 hover:text-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 rounded"
            >
              {product.name}
            </a>
          ) : (
            <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-1">{product.name}</h3>
          )}
          {product.description ? (
            <p className="text-xs text-gray-500 line-clamp-2">{product.description}</p>
          ) : null}
        </div>
        {outboundOk ? (
          <a
            href={href}
            target="_blank"
            rel={AFFILIATE_REL}
            className="inline-flex items-center justify-center gap-1.5 self-start min-h-[36px] px-3 py-1.5 rounded text-xs font-semibold transition-[filter,box-shadow] hover:brightness-[0.97] focus:outline-none focus:ring-2 focus:ring-neutral-900/25 focus:ring-offset-1 border border-neutral-900/10 text-neutral-900 shadow-sm"
            style={{ backgroundColor: AMAZON_CTA_BG }}
          >
            <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
            View on Amazon
          </a>
        ) : (
          <span className="text-xs text-gray-400">Amazon link unavailable</span>
        )}
      </div>
    </article>
  );
}
