// External Supabase project (data + auth for promoters / payments / admin).
// Kept separate from the auto-managed Lovable Cloud client at
// `@/integrations/supabase/client`, which must NOT be edited.
import { createClient } from "@supabase/supabase-js";

export const EXTERNAL_SUPABASE_URL = "https://agftnmufvarpknsvkbos.supabase.co";
export const EXTERNAL_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnZnRubXVmdmFycGtuc3ZrYm9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5NDQ1NTgsImV4cCI6MjA5MzUyMDU1OH0.SYudqTed4C4JVFeJqzVA9C_aEGmY--Nv7A4G9CeuprU";

export const externalSupabase = createClient(
  EXTERNAL_SUPABASE_URL,
  EXTERNAL_SUPABASE_ANON_KEY,
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
      storageKey: "noble-external-auth",
    },
  },
);

export type Promoter = {
  id: string;
  name: string | null;
  phone: string | null;
  referral_code: string;
  created_at: string;
};

export type Payment = {
  id: string;
  customer_name: string | null;
  customer_phone: string | null;
  amount: number;
  referral_code: string | null;
  promoter_id: string | null;
  payment_status: string;
  transaction_id: string | null;
  created_at: string;
};
