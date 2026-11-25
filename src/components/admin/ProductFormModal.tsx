'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import Image from 'next/image';
import { Trash2, Upload } from 'lucide-react';
import {
  PRODUCT_CATEGORY_LABELS,
  STOCK_STATUS_LABELS,
  type Product,
  type ProductCategory,
  type StockStatus,
} from '@/types/database';
import { productInputSchema } from '@/validations/schemas';
import {
  createProduct,
  updateProduct,
  uploadProductImage,
} from '@/services/products.service';
import { slugify } from '@/utils/slugify';
import { Modal } from '@/components/ui/Modal';
import {
  CheckboxField,
  InputField,
  SelectField,
  TextareaField,
} from '@/components/ui/InputField';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

export interface ProductFormModalProps {
  open: boolean;
  editingProduct: Product | null;
  onClose: () => void;
  onSaved: () => void;
}

const CATEGORY_OPTIONS = (
  Object.entries(PRODUCT_CATEGORY_LABELS) as [ProductCategory, string][]
).map(([value, label]) => ({ value, label }));

const STATUS_OPTIONS = (
  Object.entries(STOCK_STATUS_LABELS) as [StockStatus, string][]
).map(([value, label]) => ({ value, label }));

export function ProductFormModal({
  open,
  editingProduct,
  onClose,
  onSaved,
}: ProductFormModalProps) {
  const { showToast } = useToast();

  const [name, setName] = useState(editingProduct?.name ?? '');
  const [slug, setSlug] = useState(editingProduct?.slug ?? '');
  const [category, setCategory] = useState<ProductCategory>(
    editingProduct?.category ?? 'kompos'
  );
  const [price, setPrice] = useState(String(editingProduct?.price ?? 0));
  const [unit, setUnit] = useState(editingProduct?.unit ?? 'kg');
  const [stockQty, setStockQty] = useState(String(editingProduct?.stockQty ?? 0));
  const [status, setStatus] = useState<StockStatus>(
    editingProduct?.status ?? 'available'
  );
  const [shortDescription, setShortDescription] = useState(
    editingProduct?.shortDescription ?? ''
  );
  const [description, setDescription] = useState(editingProduct?.description ?? '');
  const [usageGuide, setUsageGuide] = useState(editingProduct?.usageGuide ?? '');
  const [badge, setBadge] = useState(editingProduct?.badge ?? '');
  const [images, setImages] = useState<string[]>(editingProduct?.images ?? []);
  const [isFeatured, setIsFeatured] = useState(editingProduct?.isFeatured ?? true);
  const [isActive, setIsActive] = useState(editingProduct?.isActive ?? true);

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingProduct) {
      setSlug(slugify(val));
    }
  };

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setErrorMsg(null);
    try {
      const targetId = editingProduct?.id || slug || slugify(name || 'produk');
      const url = await uploadProductImage(targetId, file);
      setImages((prev) => [...prev, url]);
      showToast('Foto produk berhasil diunggah ke Storage TPS 3R.', 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal upload foto produk.';
      setErrorMsg(msg);
      showToast(msg, 'error');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setErrorMsg(null);

    const parsed = productInputSchema.safeParse({
      slug: slug || slugify(name),
      name,
      category,
      shortDescription,
      description,
      usageGuide,
      price,
      unit,
      stockQty,
      status,
      images,
      badge: badge || undefined,
      isFeatured,
      isActive,
    });

    if (!parsed.success) {
      setErrorMsg(parsed.error.issues[0]?.message ?? 'Periksa kembali input produk.');
      return;
    }

    setSaving(true);
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, parsed.data);
        showToast('Produk berhasil diperbarui.', 'success');
      } else {
        await createProduct(parsed.data);
        showToast('Produk baru berhasil ditambahkan.', 'success');
      }
      onSaved();
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan produk.';
      setErrorMsg(msg);
      showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      title={editingProduct ? 'Edit Produk Katalog' : 'Tambah Produk Baru'}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" form="product-modal-form" variant="primary" disabled={saving}>
            {saving ? 'Menyimpan...' : 'Simpan Produk'}
          </Button>
        </>
      }
    >
      <form id="product-modal-form" onSubmit={handleSubmit} className="stack stack--sm">
        {errorMsg ? (
          <div className="form-error" role="alert">
            {errorMsg}
          </div>
        ) : null}

        <div className="grid-2">
          <InputField
            id="prod-name"
            label="Nama Produk"
            required
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
          />
          <InputField
            id="prod-slug"
            label="Slug URL"
            required
            value={slug}
            onChange={(e) => setSlug(slugify(e.target.value))}
          />
        </div>

        <div className="grid-2">
          <SelectField
            id="prod-cat"
            label="Kategori"
            required
            value={category}
            onChange={(e) => setCategory(e.target.value as ProductCategory)}
            options={CATEGORY_OPTIONS}
          />
          <SelectField
            id="prod-status"
            label="Status Stok"
            required
            value={status}
            onChange={(e) => setStatus(e.target.value as StockStatus)}
            options={STATUS_OPTIONS}
          />
        </div>

        <div className="grid-3">
          <InputField
            id="prod-price"
            label="Harga (Rp)"
            type="number"
            inputMode="numeric"
            required
            min={0}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <InputField
            id="prod-unit"
            label="Satuan"
            required
            placeholder="kg / karung 25kg / botol 1L"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
          />
          <InputField
            id="prod-stock"
            label="Jumlah Stok"
            type="number"
            inputMode="numeric"
            required
            min={0}
            value={stockQty}
            onChange={(e) => setStockQty(e.target.value)}
          />
        </div>

        <InputField
          id="prod-short"
          label="Ringkasan Singkat"
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
        />
        <TextareaField
          id="prod-desc"
          label="Deskripsi Lengkap"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <TextareaField
          id="prod-usage"
          label="Panduan Dosis / Pemakaian"
          value={usageGuide}
          onChange={(e) => setUsageGuide(e.target.value)}
        />

        <InputField
          id="prod-badge"
          label="Label Sorotan (Opsional)"
          placeholder="Contoh: Best Seller / Panen Harian"
          value={badge}
          onChange={(e) => setBadge(e.target.value)}
        />

        <div className="form-field">
          <label htmlFor="prod-image-upload" className="form-label">
            Upload Foto Produk (JPG/PNG/WebP, maks 5 MB)
          </label>
          <div className="cluster">
            <label htmlFor="prod-image-upload" className="btn btn--outline btn--sm">
              <Upload size={16} />
              <span>{uploading ? 'Mengunggah...' : 'Pilih Foto'}</span>
            </label>
            <input
              id="prod-image-upload"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              disabled={uploading}
              onChange={handleImageUpload}
            />
            <span className="text-xs text-muted">{images.length} foto terpasang</span>
          </div>
          {images.length > 0 ? (
            <div className="upload-preview-grid">
              {images.map((url, idx) => (
                <div key={url} className="upload-preview-item">
                  <Image
                    src={url}
                    alt={`Preview foto produk ${idx + 1}`}
                    width={160}
                    height={120}
                    className="upload-preview-item__img"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    block
                    onClick={() => setImages((prev) => prev.filter((_, i) => i !== idx))}
                  >
                    <Trash2 size={14} />
                    <span>Hapus</span>
                  </Button>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="grid-2">
          <CheckboxField
            id="prod-featured"
            label="Tampilkan di Landing Page"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
          />
          <CheckboxField
            id="prod-active"
            label="Produk Aktif di Katalog Publik"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
        </div>
      </form>
    </Modal>
  );
}
