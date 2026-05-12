import type { ResourceDef } from "../types.js";

export const RESOURCES: ResourceDef[] = [
  {
    id: "food",
    name: "食物",
    emoji: "🌾",
    category: "raw",
    minEra: "primitive",
  },
  {
    id: "wood",
    name: "木材",
    emoji: "🪵",
    category: "raw",
    minEra: "primitive",
  },
  {
    id: "stone",
    name: "石块",
    emoji: "🪨",
    category: "raw",
    minEra: "primitive",
  },
  {
    id: "knowledge",
    name: "知识",
    emoji: "📜",
    category: "meta",
    minEra: "tribal",
  },
];

export const RESOURCE_MAP = Object.fromEntries(
  RESOURCES.map((r) => [r.id, r]),
) as Record<ResourceDef["id"], ResourceDef>;
