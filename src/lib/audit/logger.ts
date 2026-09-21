import { createClient } from '@/lib/supabase/server';

export type AuditAction = 
  | 'INVOICE_CREATED'
  | 'INVOICE_DELETED_WITH_PIN'
  | 'INVOICE_DELETE_FAILED_PIN'
  | 'SECURITY_PIN_UPDATED'
  | 'PAYMENT_SUBMITTED'
  | 'PAYMENT_APPROVED'
  | 'PAYMENT_REJECTED'
  | 'ACCESS_OVERRIDE_GRANTED'
  | 'ACCESS_OVERRIDE_REVOKED'
  | 'BUSINESS_DELETED'
  | 'USER_LOGIN'
  | 'USER_SIGNUP';

export async function logAuditEvent({
  userId,
  actionType,
  details,
  targetId,
}: {
  userId: string;
  actionType: AuditAction | string;
  details: string;
  targetId?: string | null;
}) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('audit_logs').insert({
      user_id: userId,
      action_type: actionType,
      details,
      target_id: targetId || null,
    });

    if (error) {
      console.error('Failed to log audit event:', error.message);
    }
  } catch (err) {
    console.error('Audit logger unexpected exception:', err);
  }
}
