'use client';

import { useState } from 'react';
import Image from 'next/image';
import { CheckCircle2, ShoppingBag, Sprout } from 'lucide-react';
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
import { Card, CardBody } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { WhatsAppButton } from './WhatsAppButton';

export interface ProductGalleryProps {
  product: Product;
}

export function ProductGallery({ product }: ProductGalleryProps) {
  const { addItem, openDrawer } = useCart();
  const { showToast } = useToast();
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [qty, setQty] = useState(product.minOrderQty ?? 1);

  const images =
    product.images.length > 0
      ? product.images
      : product.thumbnailUrl
        ? [product.thumbnailUrl]
        : [];
  const activeImage = images[selectedIdx];
  const isSoldOut = product.status === 'soldout';

  const handleAddToCart = () => {
    addItem(product, qty);
    showToast(`${qty} ${product.unit} ${product.name} ditambahkan ke keranjang.`, 'success');
    openDrawer();
  };

  return (
    <div className="product-gallery">
      <div>
        <div className="product-gallery__main">
          {activeImage ? (
            <Image
              src={activeImage}
              alt={product.name}
              width={640}
              height={480}
              className="product-card__img"
              priority
            />
          ) : (
            <div className="product-card__placeholder">
              <Sprout size={52} aria-hidden="true" />
              <span>{PRODUCT_CATEGORY_LABELS[product.category]}</span>
            </div>
          )}
        </div>

        {images.length > 1 ? (
          <div className="product-gallery__thumbs">
            {images.map((url, idx) => (
              <button
                key={url}
                type="button"
                aria-label={`Lihat foto ${idx + 1}`}
                className={[
                  'product-gallery__thumb',
                  idx === selectedIdx ? 'product-gallery__thumb--active' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => setSelectedIdx(idx)}
              >
                <Image
                  src={url}
                  alt={`${product.name} ${idx + 1}`}
                  width={72}
                  height={56}
                  className="product-card__img"
                />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="stack">
        <div className="cluster">
          <Badge tone="organic">{PRODUCT_CATEGORY_LABELS[product.category]}</Badge>
          <Badge tone={product.status}>{STOCK_STATUS_LABELS[product.status]}</Badge>
          {product.badge ? <Badge tone="soil">{product.badge}</Badge> : null}
        </div>

        <div>
          <h2>{product.name}</h2>
          <p className="text-muted">{product.shortDescription}</p>
        </div>

        <div className="cluster cluster--between">
          <div>
            <span className="product-card__price">{formatRupiah(product.price)}</span>{' '}
            <span className="product-card__unit">/ {product.unit}</span>
          </div>
          <span className="text-sm text-muted">
            Stok live: <strong>{product.stockQty} {product.unit}</strong>
          </span>
        </div>

        <div className="cluster">
          <div className="cart-qty" aria-label="Jumlah pembelian">
            <button
              type="button"
              className="cart-qty__btn"
              aria-label="Kurangi jumlah"
              onClick={() => setQty((prev) => Math.max(1, prev - 1))}
            >
              -
            </button>
            <span className="cart-qty__val">{qty}</span>
            <button
              type="button"
              className="cart-qty__btn"
              aria-label="Tambah jumlah"
              onClick={() => setQty((prev) => prev + 1)}
            >
              +
            </button>
          </div>
          <span className="text-sm font-semibold">
            Subtotal: {formatRupiah(product.price * qty)}
          </span>
        </div>

        <div className="grid-2">
          <Button
            variant="primary"
            size="lg"
            block
            disabled={isSoldOut}
            onClick={handleAddToCart}
          >
            <ShoppingBag size={18} />
            <span>{isSoldOut ? 'Stok Habis' : 'Tambah ke Keranjang'}</span>
          </Button>
          <WhatsAppButton
            message={buildProductWhatsAppMessage(product, qty)}
            label="Pesan Langsung WA"
            size="lg"
            block
          />
        </div>

        {product.description ? (
          <Card tinted>
            <CardBody>
              <h3>Deskripsi Produk</h3>
              <p className="text-sm">{product.description}</p>
            </CardBody>
          </Card>
        ) : null}

        {product.benefits && product.benefits.length > 0 ? (
          <div className="stack stack--xs">
            <h3>Keunggulan</h3>
            <ul className="product-gallery__spec-list">
              {product.benefits.map((item) => (
                <li key={item} className="product-gallery__spec-item">
                  <CheckCircle2 size={17} className="text-success" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {product.usageGuide ? (
          <Card>
            <CardBody>
              <h3>Panduan Takaran &amp; Pemakaian</h3>
              <p className="text-sm text-muted">{product.usageGuide}</p>
            </CardBody>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
