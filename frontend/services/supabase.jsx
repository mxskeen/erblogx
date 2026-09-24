import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnon);