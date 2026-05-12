import { D } from "../bn.js";
export const ERAS = [
    {
        id: "primitive",
        name: "原始时代",
        emoji: "🪶",
        order: 0,
        evolveCost: { food: D(180), wood: D(120), stone: D(60) },
        evolveTimeMs: 60_000,
        evolveRequirements: {},
    },
    {
        id: "tribal",
        name: "部落时代",
        emoji: "🏹",
        order: 1,
        evolveCost: { food: D(800), wood: D(500), stone: D(300), knowledge: D(20) },
        evolveTimeMs: 180_000,
        evolveRequirements: {
            minBuildingLevel: { hut: 2 },
            completedTechs: ["fire"],
            completedQuests: ["q_evolve_tribal"],
        },
    },
    {
        id: "agricultural",
        name: "农耕时代",
        emoji: "🚜",
        order: 2,
        evolveCost: { food: D(5000), wood: D(3000), stone: D(2000), knowledge: D(80) },
        evolveTimeMs: 300_000,
        evolveRequirements: {
            completedTechs: ["agriculture"],
        },
    },
    {
        id: "classical",
        name: "古典时代",
        emoji: "🏛️",
        order: 3,
        evolveCost: { food: D(20000), wood: D(12000), stone: D(15000), knowledge: D(200) },
        evolveTimeMs: 600_000,
        evolveRequirements: {},
    },
    {
        id: "industrial",
        name: "工业时代",
        emoji: "🏭",
        order: 4,
        evolveCost: { food: D(100000), wood: D(80000), stone: D(120000), knowledge: D(800) },
        evolveTimeMs: 900_000,
        evolveRequirements: {},
    },
    {
        id: "modern",
        name: "现代",
        emoji: "🌐",
        order: 5,
        evolveCost: {},
        evolveTimeMs: 0,
        evolveRequirements: {},
    },
];
export const ERA_ORDER = ERAS.map((e) => e.id);
export const ERA_MAP = Object.fromEntries(ERAS.map((e) => [e.id, e]));
export function nextEra(current) {
    const idx = ERAS.findIndex((e) => e.id === current);
    if (idx < 0 || idx + 1 >= ERAS.length)
        return null;
    return ERAS[idx + 1].id;
}
export function eraIndex(id) {
    return ERAS.find((e) => e.id === id)?.order ?? 0;
}
//# sourceMappingURL=eras.js.map