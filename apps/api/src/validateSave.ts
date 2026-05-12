import { z } from "zod";

const ResourceId = z.enum(["food", "wood", "stone", "knowledge"]);
const EraId = z.enum([
  "primitive",
  "tribal",
  "agricultural",
  "classical",
  "industrial",
  "modern",
]);
const BuildingId = z.enum(["hut", "lumberCamp", "stonePit"]);
const TechId = z.enum(["fire", "tools", "agriculture"]);
const QuestId = z.enum([
  "q_gather_food",
  "q_build_hut",
  "q_research_fire",
  "q_upgrade_hut2",
  "q_evolve_tribal",
]);

const ActiveActionSchema = z.discriminatedUnion("kind", [
  z.object({
    id: z.string(),
    kind: z.literal("research"),
    techId: TechId,
    startedAt: z.number(),
    endsAt: z.number(),
  }),
  z.object({
    id: z.string(),
    kind: z.literal("building_upgrade"),
    buildingId: BuildingId,
    fromLevel: z.number(),
    toLevel: z.number(),
    startedAt: z.number(),
    endsAt: z.number(),
  }),
]);

export const SaveGameSchema = z.object({
  saveVersion: z.number().int().min(1).max(10_000),
  lastSyncedAt: z.number().int().nonnegative(),
  currentEra: EraId,
  resources: z.record(ResourceId, z.string().max(64)),
  buildings: z.record(BuildingId, z.object({ level: z.number().int().min(0).max(10_000) })),
  techStatus: z.record(
    TechId,
    z.enum(["locked", "available", "researching", "completed"]),
  ),
  activeActions: z.array(ActiveActionSchema).max(2),
  completedQuests: z.array(QuestId).max(200),
  questCounters: z.record(z.string(), z.string()).optional(),
  bonusModifiers: z
    .array(
      z.object({
        id: z.string().max(120),
        resource: ResourceId,
        multiplier: z.number().finite().min(0.01).max(1000),
      }),
    )
    .max(200),
  evolutionRitual: z
    .object({
      startedAt: z.number(),
      endsAt: z.number(),
      targetEra: EraId,
    })
    .optional(),
});

export type SaveGame = z.infer<typeof SaveGameSchema>;

export function validateSaveBody(body: unknown): { ok: true; data: SaveGame } | { ok: false; error: string } {
  const parsed = SaveGameSchema.safeParse(body);
  if (!parsed.success) return { ok: false, error: parsed.error.message };
  const d = parsed.data;
  for (const [k, v] of Object.entries(d.resources)) {
    const n = Number(v);
    if (!Number.isFinite(n) || n < 0 || n > 1e308) {
      return { ok: false, error: `非法资源值: ${k}` };
    }
  }
  if (d.lastSyncedAt > Date.now() + 60_000) {
    return { ok: false, error: "lastSyncedAt 过于超前" };
  }
  return { ok: true, data: d };
}
