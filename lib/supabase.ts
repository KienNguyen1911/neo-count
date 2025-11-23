import { createClient } from '@supabase/supabase-js';

// Dựa trên connection string bạn cung cấp, đây là Project URL của bạn
const SUPABASE_URL = 'https://kjfxpuozqxbccixrnsvs.supabase.co';

// QUAN TRỌNG: Bạn cần lấy 'anon' public key từ Supabase Dashboard:
// Vào Project Settings -> API -> Project API keys -> anon public
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqZnhwdW96cXhiY2NpeHJuc3ZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MDgyMjUsImV4cCI6MjA3OTQ4NDIyNX0.DymB8NpbfPrsN25XewqZZrGzfgnry0YmxujUmMzCxrQ'; 

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);