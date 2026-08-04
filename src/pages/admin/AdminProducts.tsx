import { useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { EmptyState, PageHeader, StatusChip } from "@/components/admin/AdminUi";
import {
  formatRwf,
  uploadProductImage,
  useProductCategories,
  useProducts,
  type Product,
} from "@/hooks/useProducts";

type Draft = {
  id?: string;
  name: string;
  slug: string;
  short_description: string;
  description: string;
  price: string;
  compare_at_price: string;
  category_id: string;
  stock: string;
  low_stock_threshold: string;
  sort_order: string;
  active: boolean;
  featured: boolean;
  trending: boolean;
  images: string[];
};

const emptyDraft = (): Draft => ({
  name: "",
  slug: "",
  short_description: "",
  description: "",
  price: "",
  compare_at_price: "",
  category_id: "",
  stock: "0",
  low_stock_threshold: "3",
  sort_order: "0",
  active: true,
  featured: false,
  trending: false,
  images: [],
});

const slugify = (v: string) =>
  v
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export default AdminProducts;
