// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://vlyyjgqtksmcguhcddal.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZseXlqZ3F0a3NtY2d1aGNkZGFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNjE2NTUsImV4cCI6MjA2MjYzNzY1NX0.0CP03dsHa-qJd6H-Drgx1inQT76kKl1CqyiRYjvA_OY";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);