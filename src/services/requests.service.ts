import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  orderBy,
  query,
  serverTimestamp,
  type DocumentData,
  type Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type {
  EduBooking,
  EduBookingStatus,
  PartnershipPartnerType,
  PartnershipRequest,
  PartnershipStatus,
} from '@/types/database';
import type { EduBookingInput, PartnershipRequestInput } from '@/validations/schemas';
import { normalizePhoneIndonesia } from '@/utils/format';

const PARTNERSHIP_COL = 'partnership_requests';
const EDU_BOOKING_COL = 'edu_bookings';

function toIsoString(value: unknown): string {
  if (!value) return new Date().toISOString();
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null && 'toDate' in value) {
    return (value as Timestamp).toDate().toISOString();
  }
  return new Date().toISOString();
}

function mapPartnershipDoc(id: string, data: DocumentData): PartnershipRequest {
  return {
    id,
    partnerName: String(data.partnerName ?? ''),
    partnerType: (data.partnerType as PartnershipPartnerType) ?? 'warung',
    contactName: typeof data.contactName === 'string' ? data.contactName : undefined,
    phone: String(data.phone ?? ''),
    phoneNormalized: typeof data.phoneNormalized === 'string' ? data.phoneNormalized : undefined,
    address: String(data.address ?? ''),
    estimatedKgPerWeek: Number(data.estimatedKgPerWeek ?? 0),
    preferredPickupSchedule: String(data.preferredPickupSchedule ?? ''),
    notes: typeof data.notes === 'string' ? data.notes : undefined,
    adminNotes: typeof data.adminNotes === 'string' ? data.adminNotes : undefined,
    status: (data.status as PartnershipStatus) ?? 'baru',
    createdAt: toIsoString(data.createdAt),
    updatedAt: data.updatedAt ? toIsoString(data.updatedAt) : undefined,
    updatedBy: typeof data.updatedBy === 'string' ? data.updatedBy : undefined,
  };
}

function mapEduBookingDoc(id: string, data: DocumentData): EduBooking {
  return {
    id,
    organizationName: String(data.organizationName ?? ''),
    contactName: String(data.contactName ?? ''),
    phone: String(data.phone ?? ''),
    phoneNormalized: typeof data.phoneNormalized === 'string' ? data.phoneNormalized : undefined,
    packageId: String(data.packageId ?? ''),
    packageName: typeof data.packageName === 'string' ? data.packageName : undefined,
    visitDate: String(data.visitDate ?? ''),
    participantCount: Number(data.participantCount ?? 1),
    notes: typeof data.notes === 'string' ? data.notes : undefined,
    adminNotes: typeof data.adminNotes === 'string' ? data.adminNotes : undefined,
    status: (data.status as EduBookingStatus) ?? 'menunggu',
    createdAt: toIsoString(data.createdAt),
    updatedAt: data.updatedAt ? toIsoString(data.updatedAt) : undefined,
    updatedBy: typeof data.updatedBy === 'string' ? data.updatedBy : undefined,
  };
}

export async function submitPartnershipRequest(input: PartnershipRequestInput): Promise<string> {
  const payload: Record<string, unknown> = {
    partnerName: input.partnerName,
    partnerType: input.partnerType,
    phone: input.phone,
    phoneNormalized: normalizePhoneIndonesia(input.phone),
    address: input.address,
    estimatedKgPerWeek: input.estimatedKgPerWeek,
    preferredPickupSchedule: input.preferredPickupSchedule,
    status: 'baru',
    createdAt: serverTimestamp(),
  };

  if (input.contactName?.trim()) {
    payload.contactName = input.contactName.trim();
  }
  if (input.notes?.trim()) {
    payload.notes = input.notes.trim();
  }

  const refDoc = await addDoc(collection(db, PARTNERSHIP_COL), payload);
  return refDoc.id;
}

export async function submitEduBooking(
  input: EduBookingInput,
  packageName?: string
): Promise<string> {
  const payload: Record<string, unknown> = {
    organizationName: input.organizationName,
    contactName: input.contactName,
    phone: input.phone,
    phoneNormalized: normalizePhoneIndonesia(input.phone),
    packageId: input.packageId,
    visitDate: input.visitDate,
    participantCount: Math.trunc(input.participantCount),
    status: 'menunggu',
    createdAt: serverTimestamp(),
  };

  if (packageName?.trim()) {
    payload.packageName = packageName.trim();
  }
  if (input.notes?.trim()) {
    payload.notes = input.notes.trim();
  }

  const refDoc = await addDoc(collection(db, EDU_BOOKING_COL), payload);
  return refDoc.id;
}

export async function getPartnershipRequestsAdmin(): Promise<PartnershipRequest[]> {
  const q = query(collection(db, PARTNERSHIP_COL), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapPartnershipDoc(d.id, d.data()));
}

export async function updatePartnershipStatus(
  id: string,
  status: PartnershipStatus,
  updatedBy: string,
  adminNotes?: string
): Promise<void> {
  const payload: Record<string, unknown> = {
    status,
    updatedAt: serverTimestamp(),
    updatedBy,
  };
  if (adminNotes !== undefined) {
    payload.adminNotes = adminNotes.trim() || null;
  }
  await updateDoc(doc(db, PARTNERSHIP_COL, id), payload);
}

export async function getEduBookingsAdmin(): Promise<EduBooking[]> {
  const q = query(collection(db, EDU_BOOKING_COL), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapEduBookingDoc(d.id, d.data()));
}

export async function updateEduBookingStatus(
  id: string,
  status: EduBookingStatus,
  updatedBy: string,
  adminNotes?: string
): Promise<void> {
  const payload: Record<string, unknown> = {
    status,
    updatedAt: serverTimestamp(),
    updatedBy,
  };
  if (adminNotes !== undefined) {
    payload.adminNotes = adminNotes.trim() || null;
  }
  await updateDoc(doc(db, EDU_BOOKING_COL, id), payload);
}
