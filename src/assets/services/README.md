# Service images

Each subfolder corresponds to a service `slug` (see `src/data/services.ts`).

## How to add more images for a service

1. Open the folder matching the service slug, e.g. `sofa-manufacturing/`.
2. Drop in any `.jpg`, `.jpeg`, `.png`, or `.webp` file.
   - Name the main/hero image **`cover.jpg`** (it always shows first).
   - Name additional images anything you like — e.g. `01.jpg`, `02.jpg`,
     `velvet-blue.jpg`. They appear in alphabetical order after the cover.
3. Save. The site picks them up automatically — no code changes needed.

## Folder ↔ service slug map

| Folder | Service |
| --- | --- |
| `wardrobes-manufacturing/` | Wardrobes Manufacturing & Supply |
| `modern-kitchen-installations/` | Modern Kitchen Installations |
| `media-tv-wall-installation/` | Modern Media TV Wall Installation |
| `office-equipment-supply/` | Office Equipment Supply |
| `fabric-replacement/` | Fabric Replacement Services |
| `sofa-cleaning/` | Sofa Cleaning Services |
| `curtains-supply-installation/` | Curtains Supply & Installation |
| `soundproof-installation/` | Soundproof Installation |
| `wall-partitioning/` | Wall Partitioning Works |
| `baby-beds-manufacturing/` | Baby Beds Manufacturing |
| `sofa-manufacturing/` | Sofa Manufacturing |
| `ceiling-installation/` | Ceiling Installation |
| `carpet-cleaning/` | Carpet Cleaning Services |
| `pet-houses-manufacturing/` | Pet Houses Manufacturing |
| `dining-tables-manufacturing/` | Dining Tables Manufacturing |
| `console-installation/` | Console Installation |
| `carpet-supply-installation/` | Carpet Supply & Installation |
| `painting-works/` | Painting Works |

## Tips

- Keep images under ~500 KB for fast loading. Use 1600×1200 (4:3) or 1600×1067 (3:2).
- If a folder is empty, the site falls back to a small set of generic images so
  the page never looks broken.
