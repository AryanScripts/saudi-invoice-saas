export type PlanTier = 'phase_1' | 'phase_2_default' | 'phase_2_full';
export type InvoiceStatus = 'draft' | 'pending' | 'paid' | 'cancelled';
export type PaymentStatus = 'pending' | 'approved' | 'rejected';
export type UserRole = 'USER' | 'ADMIN';

export interface Profile {
  id: string;
  company_name: string;
  company_name_ar: string | null;
  vat_number: string | null;
  currency: string;
  email: string | null;
  phone: string | null;
  role: UserRole;
  plan_tier: PlanTier;
  pin_package_purchased: boolean;
  pin_deletion_access_granted: boolean;
  is_super_admin: boolean;
  created_at: string;
}

export interface Client {
  id: string;
  user_id: string;
  name: string;
  name_ar: string | null;
  email: string | null;
  phone: string | null;
  vat_number: string | null;
  address: string | null;
  address_ar: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  user_id: string;
  name: string;
  name_ar: string | null;
  unit_price: number;
  vat_rate: number;
  created_at: string;
}

export interface InvoiceItem {
  id?: string;
  invoice_id?: string;
  description: string;
  description_ar?: string | null;
  quantity: number;
  unit_price: number;
  vat_rate: number;
  total: number;
}

export interface Invoice {
  id: string;
  user_id: string;
  client_id: string | null;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  subtotal: number;
  vat_total: number;
  grand_total: number;
  status: InvoiceStatus;
  qr_mode: PlanTier;
  zatca_hash: string | null;
  ecdsa_signature: string | null;
  created_at: string;
  client?: Client | null;
  items?: InvoiceItem[];
}

export interface ManualPayment {
  id: string;
  user_id: string;
  amount: number;
  receipt_reference: string;
  status: PaymentStatus;
  reviewed_by: string | null;
  created_at: string;
  profile?: Profile;
}

export interface BusinessSecuritySettings {
  id: string;
  user_id: string;
  master_delete_pin: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action_type: string;
  details: string;
  target_id: string | null;
  created_at: string;
  profile?: Profile;
}

export interface ZatcaQrInput {
  sellerName: string;
  vatNumber: string;
  timestamp: string;
  invoiceTotal: number | string;
  vatTotal: number | string;
  invoiceHash?: string;
  ecdsaSignature?: string;
  ecdsaPublicKey?: string;
  cryptographicStampId?: string;
}
