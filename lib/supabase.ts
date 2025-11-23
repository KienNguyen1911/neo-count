import { createClient } from '@supabase/supabase-js';

// Dựa trên connection string bạn cung cấp, đây là Project URL của bạn
const SUPABASE_URL = 'https://kjfxpuozqxbccixrnsvs.supabase.co';

// QUAN TRỌNG: Bạn cần lấy 'anon' public key từ Supabase Dashboard:
// Vào Project Settings -> API -> Project API keys -> anon public
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY_HERE'; 

// Nếu chưa có key, ứng dụng sẽ không chạy được API nhưng sẽ không crash ngay lập tức
if (SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY_HERE') {
  console.error('⚠️ MISSING SUPABASE ANON KEY: Please update lib/supabase.ts');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);