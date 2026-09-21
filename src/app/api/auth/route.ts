import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logAuditEvent } from '@/lib/audit/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, email, password, companyName, companyNameAr, vatNumber, phone } = body;
    const supabase = await createClient();

    if (action === 'signup') {
      if (!email || !password || !companyName) {
        return NextResponse.json(
          { error: 'Email, password, and company name are required.', error_ar: 'البريد الإلكتروني وكلمة المرور واسم الشركة مطلوبان.' },
          { status: 400 }
        );
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      console.log("[Auth Debug - SignUp] Response:", { data: authData, error: authError });

      if (authError || !authData.user) {
        return NextResponse.json(
          { error: authError?.message || 'Signup failed', error_ar: 'فشل إنشاء الحساب' },
          { status: 400 }
        );
      }

      // Create or update profile in public.profiles
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: authData.user.id,
        company_name: companyName,
        company_name_ar: companyNameAr || null,
        vat_number: vatNumber || null,
        currency: '﷼',
        email,
        phone: phone || null,
        role: 'USER',
        plan_tier: 'phase_1',
        pin_package_purchased: false,
        pin_deletion_access_granted: false,
        is_super_admin: false,
      });

      if (profileError) {
        console.error('Error creating profile:', profileError);
      }

      // Initialize business security settings with default PIN '123456'
      await supabase.from('business_security_settings').upsert({
        user_id: authData.user.id,
        master_delete_pin: '123456',
      }, { onConflict: 'user_id' });

      await logAuditEvent({
        userId: authData.user.id,
        actionType: 'USER_SIGNUP',
        details: `New business registered: ${companyName}`,
      });

      return NextResponse.json({
        success: true,
        user: authData.user,
        requiresVerification: !authData.session,
        message: 'Account registered successfully.',
        message_ar: 'تم تسجيل الحساب بنجاح.',
      });
    }

    if (action === 'login') {
      if (!email || !password) {
        return NextResponse.json(
          { error: 'Email and password are required.', error_ar: 'البريد الإلكتروني وكلمة المرور مطلوبان.' },
          { status: 400 }
        );
      }

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !authData.user) {
        return NextResponse.json(
          { error: authError?.message || 'Invalid credentials', error_ar: 'بيانات الاعتماد غير صالحة' },
          { status: 401 }
        );
      }

      await logAuditEvent({
        userId: authData.user.id,
        actionType: 'USER_LOGIN',
        details: `User logged in: ${email}`,
      });

      return NextResponse.json({
        success: true,
        user: authData.user,
        message: 'Logged in successfully.',
        message_ar: 'تم تسجيل الدخول بنجاح.',
      });
    }

    if (action === 'signout') {
      await supabase.auth.signOut();
      return NextResponse.json({
        success: true,
        message: 'Signed out successfully.',
        message_ar: 'تم تسجيل الخروج بنجاح.',
      });
    }

    return NextResponse.json(
      { error: 'Invalid action parameter.', error_ar: 'إجراء غير صالح.' },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal server error', error_ar: 'خطأ داخلي في الخادم' },
      { status: 500 }
    );
  }
}
