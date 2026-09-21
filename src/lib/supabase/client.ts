import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lpgkzukimhsltjgcrbmb.supabase.co';
  const supabaseKey = 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 
    'sb_publishable_uPshxCoI0RXUC6GH66Sj8g_sHWWzt_e';

  return createBrowserClient(supabaseUrl, supabaseKey);
}
