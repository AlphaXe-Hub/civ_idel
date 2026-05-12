import type { QuestDef } from "../types.js";

export const QUESTS: QuestDef[] = [
  {
    id: "q_gather_food",
    title: "采集食物",
    description: "累计获得 50 食物（含消耗与产出净值用当前存量近似：达到 50 即可）",
    emoji: "🍇",
    minEra: "primitive",
    objective: { type: "resource_amount", resource: "food", amount: "50" },
    rewards: { resources: { wood: "10" } },
  },
  {
    id: "q_build_hut",
    title: "搭建茅屋",
    description: "将茅屋升到 1 级（初始即为 1 级则视为已完成条件：需 hut >=1）",
    emoji: "🛖",
    minEra: "primitive",
    objective: { type: "building_level", building: "hut", level: 1 },
    rewards: { resources: { stone: "15" } },
    requires: ["q_gather_food"],
  },
  {
    id: "q_research_fire",
    title: "文明的火种",
    description: "研究「取火」科技",
    emoji: "🔥",
    minEra: "primitive",
    objective: { type: "tech_completed", tech: "fire" },
    rewards: {
      modifiers: [{ id: "quest_fire_spirit", resource: "food", multiplier: 1.05 }],
    },
    requires: ["q_build_hut"],
  },
  {
    id: "q_upgrade_hut2",
    title: "扩建聚落",
    description: "茅屋达到 2 级",
    emoji: "🏘️",
    minEra: "primitive",
    objective: { type: "building_level", building: "hut", level: 2 },
    rewards: { resources: { wood: "40", stone: "25" } },
    requires: ["q_research_fire"],
  },
  {
    id: "q_evolve_tribal",
    title: "迈向部落",
    description: "筹备迁徙：至少拥有 100 木材与 40 石块",
    emoji: "🥁",
    minEra: "primitive",
    objective: {
      type: "resources_threshold",
      amounts: { wood: "100", stone: "40" },
    },
    rewards: { resources: { food: "60" } },
    requires: ["q_upgrade_hut2"],
  },
];

export const QUEST_MAP = Object.fromEntries(QUESTS.map((q) => [q.id, q])) as Record<
  (typeof QUESTS)[number]["id"],
  QuestDef
>;
