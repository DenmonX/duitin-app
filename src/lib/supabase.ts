import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dlshvrrkltgdeinookbr.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_LW6akWMcsM--YlkY2KVOaw_LHEwhpJN';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
