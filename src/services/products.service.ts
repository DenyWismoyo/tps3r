import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  type DocumentData,
  type Timestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import type { Product, ProductCategory, StockStatus } from '@/types/database';
import type { ProductInput } from '@/validations/schemas';
import { sanitizeFileName } from '@/utils/slugify';

const PRODUCTS_COL = 'products';
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function toIsoString(value: unknown): string {
  if (!value) return new Date().toISOString();
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null && 'toDate' in value) {
    return (value as Timestamp).toDate().toISOString();
  }
  return new Date().toISOString();
}

function mapProductDoc(id: string, data: DocumentData): Product {
  return {
    id,
    slug: String(data.slug ?? ''),
    name: String(data.name ?? ''),
    category: (data.category as ProductCategory) ?? 'kompos',
    shortDescription: String(data.shortDescription ?? ''),
    description: String(data.description ?? ''),
    usageGuide: String(data.usageGuide ?? ''),
    price: Number(data.price ?? 0),
    unit: String(data.unit ?? 'kg'),
    stockQty: Number(data.stockQty ?? 0),
    status: (data.status as StockStatus) ?? 'available',
    images: Array.isArray(data.images) ? (data.images as string[]) : [],
    benefits: Array.isArray(data.benefits) ? (data.benefits as string[]) : undefined,
    thumbnailUrl: typeof data.thumbnailUrl === 'string' ? data.thumbnailUrl : undefined,
    minOrderQty: typeof data.minOrderQty === 'number' ? data.minOrderQty : undefined,
    weightGrams: typeof data.weightGrams === 'number' ? data.weightGrams : undefined,
    sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : undefined,
    badge: typeof data.badge === 'string' ? data.badge : undefined,
    isFeatured: Boolean(data.isFeatured),
    isActive: data.isActive !== false,
    createdAt: data.createdAt ? toIsoString(data.createdAt) : undefined,
    updatedAt: toIsoString(data.updatedAt),
  };
}

export async function getActiveProducts(): Promise<Product[]> {
  try {
    const q = query(collection(db, PRODUCTS_COL), where('isActive', '==', true));
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => mapProductDoc(d.id, d.data()))
      .sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999) || b.updatedAt.localeCompare(a.updatedAt));
  } catch {
    return [];
  }
}

export async function getFeaturedProducts(limitCount = 6): Promise<Product[]> {
  try {
    const q = query(
      collection(db, PRODUCTS_COL),
      where('isActive', '==', true),
      orderBy('isFeatured', 'desc'),
      orderBy('updatedAt', 'desc'),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => mapProductDoc(d.id, d.data()));
  } catch {
    const all = await getActiveProducts();
    return all.filter((item) => item.isFeatured).slice(0, limitCount);
  }
}

export async function getAllProductsAdmin(): Promise<Product[]> {
  const snap = await getDocs(collection(db, PRODUCTS_COL));
  return snap.docs
    .map((d) => mapProductDoc(d.id, d.data()))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const q = query(collection(db, PRODUCTS_COL), where('slug', '==', slug), limit(1));
    const snap = await getDocs(q);
    const first = snap.docs[0];
    if (!first) return null;
    return mapProductDoc(first.id, first.data());
  } catch {
    return null;
  }
}

export async function getRelatedProducts(
  category: ProductCategory,
  excludeId: string,
  limitCount = 3
): Promise<Product[]> {
  const all = await getActiveProducts();
  const sameCategory = all.filter((p) => p.id !== excludeId && p.category === category);
  if (sameCategory.length >= limitCount) {
    return sameCategory.slice(0, limitCount);
  }
  const others = all.filter((p) => p.id !== excludeId && p.category !== category);
  return [...sameCategory, ...others].slice(0, limitCount);
}

function buildProductPayload(input: ProductInput, isCreate: boolean) {
  const payload: Record<string, unknown> = {
    slug: input.slug,
    name: input.name,
    category: input.category,
    shortDescription: input.shortDescription,
    description: input.description,
    usageGuide: input.usageGuide,
    price: input.price,
    unit: input.unit,
    stockQty: input.stockQty,
    status: input.status,
    images: input.images,
    isFeatured: input.isFeatured,
    isActive: input.isActive,
    updatedAt: serverTimestamp(),
  };

  if (input.benefits && input.benefits.length > 0) {
    payload.benefits = input.benefits;
  }
  if (input.badge) {
    payload.badge = input.badge;
  }
  if (isCreate) {
    payload.createdAt = serverTimestamp();
  }

  return payload;
}

export async function createProduct(input: ProductInput): Promise<string> {
  const docRef = await addDoc(collection(db, PRODUCTS_COL), buildProductPayload(input, true));
  return docRef.id;
}

export async function updateProduct(id: string, input: ProductInput): Promise<void> {
  const refDoc = doc(db, PRODUCTS_COL, id);
  await updateDoc(refDoc, buildProductPayload(input, false));
}

export async function quickUpdateProductStock(
  id: string,
  stockQty: number,
  status: StockStatus
): Promise<void> {
  const refDoc = doc(db, PRODUCTS_COL, id);
  const existing = await getDoc(refDoc);
  if (!existing.exists()) {
    throw new Error('Produk tidak ditemukan.');
  }
  await updateDoc(refDoc, {
    stockQty: Math.max(0, stockQty),
    status,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteProduct(id: string): Promise<void> {
  await deleteDoc(doc(db, PRODUCTS_COL, id));
}

export async function uploadProductImage(productId: string, file: File): Promise<string> {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error('Format gambar harus JPG, PNG, atau WebP.');
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error('Ukuran gambar maksimal 5 MB.');
  }

  const safeName = sanitizeFileName(file.name);
  const objectPath = `products/${productId}/${Date.now()}-${safeName}`;
  const storageRef = ref(storage, objectPath);

  await uploadBytes(storageRef, file, {
    contentType: file.type,
    cacheControl: 'public, max-age=31536000',
  });

  return getDownloadURL(storageRef);
}
