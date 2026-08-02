import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ProductCategory = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  active: boolean;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  short_description: string | null;
  price: number;
  compare_at_price: number | null;
  currency: string;
  category_id: string | null;
  images: string[];
  stock: number;
  low_stock_threshold: number;
  trending: boolean;
  featured: boolean;
  active: boolean;
  sort_order: number;
};

const normalise = (row: Record<string, unknown>): Product => ({
  ...(row as unknown as Product),
  images: Array.isArray(row.images) ? (row.images as string[]) : [],
});

export const useProductCategories = (includeInactive = false) =>
  useQuery({
    queryKey: ["product-categories", includeInactive],
    queryFn: async (): Promise<ProductCategory[]> => {
      let q = supabase.from("product_categories").select("*").order("sort_order");
      if (!includeInactive) q = q.eq("active", true);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as ProductCategory[];
    },
    staleTime: 30_000,
  });

export const useProducts = (opts: { includeInactive?: boolean; categoryId?: string | null } = {}) =>
  useQuery({
    queryKey: ["products", opts.includeInactive ?? false, opts.categoryId ?? null],
    queryFn: async (): Promise<Product[]> => {
      let q = supabase.from("products").select("*").order("sort_order");
      if (!opts.includeInactive) q = q.eq("active", true);
      if (opts.categoryId) q = q.eq("category_id", opts.categoryId);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []).map((r) => normalise(r as Record<string, unknown>));
    },
    staleTime: 30_000,
  });

export const useProduct = (slug?: string) =>
  useQuery({
    enabled: !!slug,
    queryKey: ["product", slug],
    queryFn: async (): Promise<Product | null> => {
      const { data, error } = await supabase.from("products").select("*").eq("slug", slug!).maybeSingle();
      if (error) throw error;
      return data ? normalise(data as Record<string, unknown>) : null;
    },
  });

export const formatRwf = (amount: number) => `RWF ${amount.toLocaleString("en-US")}`;
