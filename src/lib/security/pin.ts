import { createClient } from '@/lib/supabase/server';

export interface PinVerificationResult {
  isValid: boolean;
  hasAccess: boolean;
  error?: string;
  error_ar?: string;
}

/**
 * Validates a user's 6-digit deletion PIN against `business_security_settings`
 * and verifies their deletion entitlement.
 */
export async function verifyDeletionPin(userId: string, inputPin: string): Promise<PinVerificationResult> {
  const supabase = await createClient();

  // 1. Fetch user's profile to verify entitlement
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('pin_deletion_access_granted, pin_package_purchased, is_super_admin')
    .eq('id', userId)
    .single();

  if (profileError || !profile) {
    return {
      isValid: false,
      hasAccess: false,
      error: 'User profile not found.',
      error_ar: 'لم يتم العثور على ملف تعريف المستخدم.',
    };
  }

  const hasAccess = Boolean(
    profile.is_super_admin || 
    profile.pin_deletion_access_granted || 
    profile.pin_package_purchased
  );

  if (!hasAccess) {
    return {
      isValid: false,
      hasAccess: false,
      error: 'You do not have active PIN Deletion permission. Please purchase the add-on or contact support.',
      error_ar: 'ليس لديك صلاحية حذف الفواتير بالرمز السري. يرجى شراء الإضافة أو التواصل مع الدعم.',
    };
  }

  // 2. Fetch security settings
  const { data: settings, error: settingsError } = await supabase
    .from('business_security_settings')
    .select('master_delete_pin')
    .eq('user_id', userId)
    .single();

  // If no settings exist yet, default is '123456'
  const expectedPin = settings?.master_delete_pin || '123456';

  if (inputPin.trim() !== expectedPin.trim()) {
    return {
      isValid: false,
      hasAccess: true,
      error: 'Invalid 6-digit Master PIN.',
      error_ar: 'الرمز السري الرئيسي المكون من 6 أرقام غير صحيح.',
    };
  }

  return {
    isValid: true,
    hasAccess: true,
  };
}

/**
 * Updates or sets the 6-digit master delete PIN for a user
 */
export async function updateMasterPin(userId: string, newPin: string): Promise<{ success: boolean; error?: string; error_ar?: string }> {
  if (!/^\d{6}$/.test(newPin)) {
    return {
      success: false,
      error: 'PIN must be exactly 6 numeric digits.',
      error_ar: 'يجب أن يتكون الرمز السري من 6 أرقام بالضبط.',
    };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from('business_security_settings')
    .upsert({
      user_id: userId,
      master_delete_pin: newPin,
    }, { onConflict: 'user_id' });

  if (error) {
    return {
      success: false,
      error: error.message,
      error_ar: 'فشل في تحديث الرمز السري.',
    };
  }

  return { success: true };
}
