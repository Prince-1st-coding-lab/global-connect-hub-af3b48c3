import wardrobes from "@/assets/services/wardrobes.jpg";
import kitchens from "@/assets/services/kitchens.jpg";
import tvwall from "@/assets/services/tvwall.jpg";
import office from "@/assets/services/office.jpg";
import fabric from "@/assets/services/fabric.jpg";
import sofaClean from "@/assets/services/sofa-clean.jpg";
import curtains from "@/assets/services/curtains.jpg";
import soundproof from "@/assets/services/soundproof.jpg";
import partitioning from "@/assets/services/partitioning.jpg";
import babyBed from "@/assets/services/baby-bed.jpg";
import sofa from "@/assets/services/sofa.jpg";
import ceiling from "@/assets/services/ceiling.jpg";
import carpetClean from "@/assets/services/carpet-clean.jpg";
import petHouse from "@/assets/services/pet-house.jpg";
import dining from "@/assets/services/dining.jpg";

import bedroom from "@/assets/service-bedroom.jpg";
import library from "@/assets/service-library.jpg";
import kitchen from "@/assets/service-kitchen.jpg";
import officeAlt from "@/assets/service-office.jpg";
import heroLiving from "@/assets/hero-living.jpg";
import bedroom2 from "@/assets/gallery/bedroom-2.jpg";
import bathroom from "@/assets/gallery/bathroom.jpg";
import entryway from "@/assets/gallery/entryway.jpg";
import lounge from "@/assets/gallery/lounge.jpg";

import {
  Shirt, ChefHat, Tv, Briefcase, Scissors, Sparkles,
  Blinds, Volume2, LayoutPanelTop, Baby, Sofa, PanelTop,
  Brush, Dog, Utensils, type LucideIcon,
} from "lucide-react";

export type Service = {
  slug: string;
  cover: string;
  gallery: string[];
  icon: LucideIcon;
};

// Order MUST match i18n services.items order (15 items)
export const SERVICES: Service[] = [
  { slug: "wardrobes-manufacturing", cover: wardrobes, icon: Shirt, gallery: [wardrobes, bedroom, bedroom2, library] },
  { slug: "modern-kitchen-installations", cover: kitchens, icon: ChefHat, gallery: [kitchens, kitchen, dining, heroLiving] },
  { slug: "media-tv-wall-installation", cover: tvwall, icon: Tv, gallery: [tvwall, lounge, heroLiving, ceiling] },
  { slug: "office-equipment-supply", cover: office, icon: Briefcase, gallery: [office, officeAlt, library, partitioning] },
  { slug: "fabric-replacement", cover: fabric, icon: Scissors, gallery: [fabric, sofa, lounge, bedroom2] },
  { slug: "sofa-cleaning", cover: sofaClean, icon: Sparkles, gallery: [sofaClean, sofa, lounge, heroLiving] },
  { slug: "curtains-supply-installation", cover: curtains, icon: Blinds, gallery: [curtains, heroLiving, bedroom2, lounge] },
  { slug: "soundproof-installation", cover: soundproof, icon: Volume2, gallery: [soundproof, tvwall, ceiling, lounge] },
  { slug: "wall-partitioning", cover: partitioning, icon: LayoutPanelTop, gallery: [partitioning, office, officeAlt, heroLiving] },
  { slug: "baby-beds-manufacturing", cover: babyBed, icon: Baby, gallery: [babyBed, bedroom, bedroom2, library] },
  { slug: "sofa-manufacturing", cover: sofa, icon: Sofa, gallery: [sofa, lounge, heroLiving, fabric] },
  { slug: "ceiling-installation", cover: ceiling, icon: PanelTop, gallery: [ceiling, entryway, lounge, heroLiving] },
  { slug: "carpet-cleaning", cover: carpetClean, icon: Brush, gallery: [carpetClean, lounge, heroLiving, bedroom] },
  { slug: "pet-houses-manufacturing", cover: petHouse, icon: Dog, gallery: [petHouse, babyBed, dining, library] },
  { slug: "dining-tables-manufacturing", cover: dining, icon: Utensils, gallery: [dining, kitchen, kitchens, lounge] },
];

export const getServiceBySlug = (slug: string) => SERVICES.find((s) => s.slug === slug);
export const getServiceIndex = (slug: string) => SERVICES.findIndex((s) => s.slug === slug);
