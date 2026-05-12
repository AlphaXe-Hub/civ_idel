import { D } from "../bn.js";
export const BUILDINGS = [
    {
        id: "hut",
        name: "茅屋",
        emoji: "🛖",
        minEra: "primitive",
        production: { food: 0.12 },
        upgradeTimeMs: (level) => 20_000 + level * 15_000,
        upgradeCost: (level) => ({
            wood: D(15).mul(DecimalPow(level, 1.25)),
            stone: D(5).mul(DecimalPow(level, 1.15)),
        }),
        storageBonusPerLevel: { food: 80 },
    },
    {
        id: "lumberCamp",
        name: "伐木营地",
        emoji: "🪓",
        minEra: "primitive",
        production: { wood: 0.08 },
        upgradeTimeMs: (level) => 25_000 + level * 18_000,
        upgradeCost: (level) => ({
            food: D(20).mul(DecimalPow(level, 1.2)),
            stone: D(8).mul(DecimalPow(level, 1.12)),
        }),
        storageBonusPerLevel: { wood: 70 },
    },
    {
        id: "stonePit",
        name: "采石坑",
        emoji: "⛏️",
        minEra: "primitive",
        production: { stone: 0.07 },
        upgradeTimeMs: (level) => 28_000 + level * 20_000,
        upgradeCost: (level) => ({
            food: D(25).mul(DecimalPow(level, 1.18)),
            wood: D(18).mul(DecimalPow(level, 1.2)),
        }),
        storageBonusPerLevel: { stone: 75 },
    },
];
function DecimalPow(level, exp) {
    return Math.pow(Math.max(1, level), exp);
}
export const BUILDING_MAP = Object.fromEntries(BUILDINGS.map((b) => [b.id, b]));
//# sourceMappingURL=buildings.js.map