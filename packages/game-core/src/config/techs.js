import { D } from "../bn.js";
export const TECHS = [
    {
        id: "fire",
        name: "取火",
        emoji: "🔥",
        minEra: "primitive",
        requires: [],
        researchTimeMs: 45_000,
        cost: { food: D(40), wood: D(25) },
        effects: { food: 1.12 },
    },
    {
        id: "tools",
        name: "石器工具",
        emoji: "🪚",
        minEra: "primitive",
        requires: ["fire"],
        researchTimeMs: 90_000,
        cost: { wood: D(120), stone: D(40) },
        effects: { wood: 1.1, stone: 1.08 },
    },
    {
        id: "agriculture",
        name: "原始农业",
        emoji: "🌱",
        minEra: "tribal",
        requires: ["tools"],
        researchTimeMs: 120_000,
        cost: { food: D(200), wood: D(150), knowledge: D(5) },
        effects: { food: 1.15 },
    },
];
export const TECH_MAP = Object.fromEntries(TECHS.map((t) => [t.id, t]));
//# sourceMappingURL=techs.js.map