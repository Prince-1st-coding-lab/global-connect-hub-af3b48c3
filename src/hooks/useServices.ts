import { useQuery } from "@tanstack/react-query";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { isBackendConfigured, listServices, type ApiService } from "@/lib/api";
import { SERVICES as LOCAL_SERVICES, type ResolvedService } from "@/data/services";

/**
 * Unified service shape used across the UI — works whether services come from
 * the backend or the bundled local fallback.
 */
export type UiService = {
  slug: string;
  title?: string;
  description?: string;
  icon: LucideIcon;
  availability: "both" | "custom" | "service";
  leadTimeDays: [number, number];
  cover: string;
  gallery: string[];
};

const DefaultIcon = Icons.Sparkles;

const resolveIcon = (name: string): LucideIcon => {
  const Icon = (Icons as unknown as Record<string, LucideIcon>)[name];
  return Icon ?? DefaultIcon;
};

const fromApi = (s: ApiService): UiService => ({
  slug: s.slug,
  title: s.title,
  description: s.description,
  icon: resolveIcon(s.icon),
  availability: s.availability,
  leadTimeDays: [s.leadTimeMinDays, s.leadTimeMaxDays],
  cover: s.coverUrl || s.gallery?.[0] || "",
  gallery: s.gallery ?? [],
});

const fromLocal = (s: ResolvedService): UiService => ({
  slug: s.slug,
  icon: s.icon,
  availability: s.availability,
  leadTimeDays: s.leadTimeDays,
  cover: s.cover,
  gallery: s.gallery,
});

const LOCAL_FALLBACK: UiService[] = LOCAL_SERVICES.map(fromLocal);

export const useServices = () => {
  const enabled = isBackendConfigured();
  const query = useQuery({
    queryKey: ["services"],
    queryFn: async () => (await listServices()).map(fromApi),
    enabled,
    staleTime: 60_000,
  });

  if (!enabled) {
    return { data: LOCAL_FALLBACK, isLoading: false, error: null as unknown as Error | null };
  }
  return {
    data: query.data ?? LOCAL_FALLBACK,
    isLoading: query.isLoading,
    error: query.error as Error | null,
  };
};

export const useService = (slug: string) => {
  const { data } = useServices();
  const idx = data.findIndex((s) => s.slug === slug);
  return {
    service: idx >= 0 ? data[idx] : undefined,
    index: idx,
    all: data,
  };
};
