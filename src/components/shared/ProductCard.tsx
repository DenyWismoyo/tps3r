'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Sprout } from 'lucide-react';
import {
  PRODUCT_CATEGORY_LABELS,
  STOCK_STATUS_LABELS,
  type Product,
} from '@/types/database';
import { formatRupiah } from '@/utils/format';
import { buildProductWhatsAppMessage } from '@/utils/whatsapp';
import { useCart } from '@/hooks/useCart';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardFooter } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { WhatsAppButton } from './WhatsAppButton';

export interface ProductCardProps {
  product: Product;
  variant?: 'compact' | 'full';
  onAddToCart?: (product: Product) => void;
  showQuickWa?: boolean;
}

export function ProductCard({
  product,
  variant = 'full',
  onAddToCart,
  showQuickWa = true,
}: ProductCardProps) {
  const { addItem, openDrawer } = useCart();
  const { showToast } = useToast();

  const coverImage = product.images[0] || product.thumbnailUrl;
  const isSoldOut = product.status === 'soldout';

  const handleAdd = () => {
    if (onAddToCart) {
      onAddToCart(product);
      return;
    }
    addItem(product, 1);
    showToast(`${product.name} ditambahkan ke keranjang.`, 'success');
    openDrawer();
  };

  return (
    <Card interactive>
      <Link href={`/katalog/${product.slug}`} className="product-card__media">
        {coverImage ? (
          <Image
            src={coverImage}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="product-card__img"
          />
        ) : (
          <div className="product-card__placeholder">
            <Sprout size={34} aria-hidden="true" />
            <span>{PRODUCT_CATEGORY_LABELS[product.category]}</span>
          </div>
        )}
        <div className="product-card__badges">
          <Badge tone="organic">{PRODUCT_CATEGORY_LABELS[product.category]}</Badge>
          <Badge tone={product.status}>{STOCK_STATUS_LABELS[product.status]}</Badge>
        </div>
      </Link>

      <CardBody>
        <h3 className="product-card__title">
          <Link href={`/katalog/${product.slug}`}>{product.name}</Link>
        </h3>
        {variant === 'full' && product.shortDescription ? (
          <p className="text-sm text-muted">{product.shortDescription}</p>
        ) : null}

        <div className="product-card__price-row">
          <div>
            <span className="product-card__price">{formatRupiah(product.price)}</span>{' '}
            <span className="product-card__unit">/ {product.unit}</span>
          </div>
          <span className="product-card__stock">
            Stok: <strong>{product.stockQty}</strong>
          </span>
        </div>
      </CardBody>

      <CardFooter>
        <div className="product-card__actions">
          <Button
            variant="primary"
            size="sm"
            disabled={isSoldOut}
            onClick={handleAdd}
          >
            <ShoppingBag size={16} />
            <span>{isSoldOut ? 'Habis' : '+ Keranjang'}</span>
          </Button>
          {showQuickWa ? (
            <WhatsAppButton
              message={buildProductWhatsAppMessage(product, 1)}
              label="Tanya WA"
              variant="wa"
              size="sm"
            />
          ) : (
            <Link href={`/katalog/${product.slug}`} className="btn btn--outline btn--sm">
              Detail Produk
            </Link>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
