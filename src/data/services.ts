import {
  Shirt, ChefHat, Tv, Briefcase, Scissors, Sparkles,
  Blinds, Volume2, LayoutPanelTop, Baby, Sofa, PanelTop,
  Brush, Dog, Utensils, Archive, Layers, PaintBucket, type LucideIcon,
} from "lucide-react";

// Fallback gallery images shared across services
import bedroom from "@/assets/service-bedroom.jpg";
import library from "@/assets/service-library.jpg";
import kitchen from "@/assets/service-kitchen.jpg";
import officeAlt from "@/assets/service-office.jpg";
import heroLiving from "@/assets/hero-living.jpg";
import bedroom2 from "@/assets/gallery/bedroom-2.jpg";
import bathroom from "@/assets/gallery/bathroom.jpg";
import entryway from "@/assets/gallery/entryway.jpg";
import lounge from "@/assets/gallery/lounge.jpg";

// Auto-import every image inside each service folder.
// Drop any .jpg / .jpeg / .png / .webp into src/assets/services/<slug>/
// and it will appear in that service's gallery automatically.
const serviceImages = import.meta.glob(
  "@/assets/services/*/*.{jpg,jpeg,png,webp}",
  { eager: true, import: "default" },
) as Record<string, string>;

const imagesForSlug = (slug: string): string[] => {
  const entries = Object.entries(serviceImages)
    .filter(([path]) => path.includes(`/services/${slug}/`))
    .sort(([a], [b]) => {
      // Always put cover.* first, then alphabetical
      const aCover = /\/cover\.[a-z]+$/i.test(a) ? 0 : 1;
      const bCover = /\/cover\.[a-z]+$/i.test(b) ? 0 : 1;
      if (aCover !== bCover) return aCover - bCover;
      return a.localeCompare(b);
    })
    .map(([, url]) => url);
  return entries;
};

// "both" = ready stock available + custom orders accepted
// "custom" = made-to-order only (manufacturing/installation)
// "service" = on-site service (cleaning, installation visits)
export type Availability = "both" | "custom" | "service";

export type Service = {
  slug: string;
  icon: LucideIcon;
  availability: Availability;
  leadTimeDays: [number, number];
  /** Extra fallback images mixed in if the service folder is light on assets */
  fallbackGallery: string[];
};

const baseServices: Service[] = [
  { slug: "wardrobes-manufacturing",       icon: Shirt,           availability: "custom",  leadTimeDays: [10, 21], fallbackGallery: [bedroom, bedroom2, library] },
  { slug: "modern-kitchen-installations",  icon: ChefHat,         availability: "custom",  leadTimeDays: [14, 30], fallbackGallery: [kitchen, heroLiving, lounge] },
  { slug: "media-tv-wall-installation",    icon: Tv,              availability: "custom",  leadTimeDays: [7, 14],  fallbackGallery: [lounge, heroLiving, entryway] },
  { slug: "office-equipment-supply",       icon: Briefcase,       availability: "both",    leadTimeDays: [2, 7],   fallbackGallery: [officeAlt, library, entryway] },
  { slug: "fabric-replacement",            icon: Scissors,        availability: "service", leadTimeDays: [3, 7],   fallbackGallery: [lounge, bedroom2, heroLiving] },
  { slug: "sofa-cleaning",                 icon: Sparkles,        availability: "service", leadTimeDays: [1, 3],   fallbackGallery: [lounge, heroLiving, entryway] },
  
  { slug: "soundproof-installation",       icon: Volume2,         availability: "service", leadTimeDays: [5, 14],  fallbackGallery: [lounge, entryway, heroLiving] },
  { slug: "wall-partitioning",             icon: LayoutPanelTop,  availability: "custom",  leadTimeDays: [5, 14],  fallbackGallery: [officeAlt, entryway, library] },
  { slug: "baby-beds-manufacturing",       icon: Baby,            availability: "both",    leadTimeDays: [7, 14],  fallbackGallery: [bedroom, bedroom2, library] },
  { slug: "sofa-manufacturing",            icon: Sofa,            availability: "both",    leadTimeDays: [10, 21], fallbackGallery: [lounge, heroLiving, bedroom2] },
  { slug: "ceiling-installation",          icon: PanelTop,        availability: "service", leadTimeDays: [5, 14],  fallbackGallery: [entryway, lounge, heroLiving] },
  { slug: "carpet-cleaning",               icon: Brush,           availability: "service", leadTimeDays: [1, 3],   fallbackGallery: [lounge, heroLiving, bedroom] },
  { slug: "pet-houses-manufacturing",      icon: Dog,             availability: "both",    leadTimeDays: [5, 10],  fallbackGallery: [bathroom, library, entryway] },
  { slug: "dining-tables-manufacturing",   icon: Utensils,        availability: "both",    leadTimeDays: [10, 21], fallbackGallery: [kitchen, lounge, heroLiving] },
  { slug: "console-installation",          icon: Archive,         availability: "custom",  leadTimeDays: [7, 14],  fallbackGallery: [entryway, lounge, library] },
  { slug: "carpet-supply-installation",    icon: Layers,          availability: "both",    leadTimeDays: [3, 10],  fallbackGallery: [lounge, heroLiving, bedroom2] },
  { slug: "painting-works",                icon: PaintBucket,     availability: "service", leadTimeDays: [3, 10],  fallbackGallery: [bedroom, library, entryway] },
];

export type ResolvedService = Service & {
  cover: string;
  gallery: string[];
};

export const SERVICES: ResolvedService[] = baseServices.map((s) => {
  const folderImages = imagesForSlug(s.slug);
  const cover = folderImages[0] ?? s.fallbackGallery[0];
  // Combine folder images + fallbacks (deduped) for a richer gallery
  const seen = new Set<string>();
  const gallery = [...folderImages, ...s.fallbackGallery].filter((u) => {
    if (seen.has(u)) return false;
    seen.add(u);
    return true;
  });
  return { ...s, cover, gallery };
});

export const getServiceBySlug = (slug: string) => SERVICES.find((s) => s.slug === slug);
export const getServiceIndex = (slug: string) => SERVICES.findIndex((s) => s.slug === slug);
