import { createClient } from '@supabase/supabase-js'

// single supabase client for interacting with database
export const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON)