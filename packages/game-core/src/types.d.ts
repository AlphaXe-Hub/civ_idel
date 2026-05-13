export type ResourceId = "food" | "wood" | "stone" | "knowledge" | "clay" | "metal" | "coal";
export type EraId = "primitive" | "tribal" | "agricultural" | "classical" | "industrial" | "modern";
export type BuildingId =
  | "hut"
  | "lumberCamp"
  | "stonePit"
  | "library"
  | "clayWorks"
  | "foundry"
  | "coalShaft";
export type TechId = "fire" | "tools" | "agriculture";
export type QuestId = "q_gather_food" | "q_build_hut" | "q_research_fire" | "q_upgrade_hut2" | "q_evolve_tribal";
export type ActionKind = "research" | "building_upgrade";
export type ActiveAction = {
    id: string;
    kind: "research";
    techId: TechId;
    startedAt: number;
    endsAt: number;
} | {
    id: string;
    kind: "building_upgrade";
    buildingId: BuildingId;
    fromLevel: number;
    toLevel: number;
    startedAt: number;
    endsAt: number;
};
export interface ResourceDef {
    id: ResourceId;
    name: string;
    emoji: string;
    category: "raw" | "processed" | "meta";
    minEra: EraId;
}
export interface BuildingDef {
    id: BuildingId;
    name: string;
    emoji: string;
    minEra: EraId;
    /** 每秒基础产出：resource -> 每级倍率系数 */
    production: Partial<Record<ResourceId, number>>;
    upgradeTimeMs: (level: number) => number;
    upgradeCost: (level: number) => Partial<Record<ResourceId, Decimal>>;
    /** 对全局仓库上限的贡献（按等级） */
    storageBonusPerLevel: Partial<Record<ResourceId, number>>;
}
export interface TechDef {
    id: TechId;
    name: string;
    emoji: string;
    minEra: EraId;
    requires: TechId[];
    researchTimeMs: number;
    cost: Partial<Record<ResourceId, Decimal>>;
    /** 乘法修饰符，按资源产出 */
    effects: Partial<Record<ResourceId, number>>;
}
export interface EraDef {
    id: EraId;
    name: string;
    emoji: string;
    order: number;
    evolveCost: Partial<Record<ResourceId, Decimal>>;
    evolveTimeMs: number;
    /** 进入下一时代需满足（下一时代 id 在配置里由顺序推导） */
    evolveRequirements: {
        minBuildingLevel?: Partial<Record<BuildingId, number>>;
        completedTechs?: TechId[];
        completedQuests?: QuestId[];
    };
}
export interface QuestDef {
    id: QuestId;
    title: string;
    description: string;
    emoji: string;
    minEra: EraId;
    /** 目标类型 */
    objective: {
        type: "resource_amount";
        resource: ResourceId;
        amount: string;
    } | {
        type: "resources_threshold";
        amounts: Partial<Record<ResourceId, string>>;
    } | {
        type: "building_level";
        building: BuildingId;
        level: number;
    } | {
        type: "tech_completed";
        tech: TechId;
    } | {
        type: "era_reached";
        era: EraId;
    };
    rewards: {
        resources?: Partial<Record<ResourceId, string>>;
        modifiers?: Array<{
            id: string;
            resource: ResourceId;
            multiplier: number;
        }>;
    };
    /** 前置任务 */
    requires?: QuestId[];
}
export interface GameState {
    saveVersion: number;
    /** 上次与服务器对齐的时间戳（毫秒） */
    lastSyncedAt: number;
    currentEra: EraId;
    resources: Record<ResourceId, string>;
    buildings: Record<BuildingId, {
        level: number;
    }>;
    techStatus: Record<TechId, "locked" | "available" | "researching" | "completed">;
    /** 进行中的定时动作（槽位随时代增加） */
    activeActions: ActiveAction[];
    completedQuests: QuestId[];
    /** 任务进度缓存（如资源历史峰值等简化：仅存当前计数） */
    questCounters: Partial<Record<string, string>>;
    /** 来自任务奖励的永久修饰符 */
    bonusModifiers: Array<{
        id: string;
        resource: ResourceId;
        multiplier: number;
    }>;
    /** 进化仪式进行中 */
    evolutionRitual?: {
        startedAt: number;
        endsAt: number;
        targetEra: EraId;
    };
    /** 自动加入升级队列的建筑 id */
    autoUpgradeBuildingIds: BuildingId[];
}
export interface OfflineResult {
    state: GameState;
    /** 实际结算的离线毫秒（已封顶） */
    appliedMs: number;
    /** 离线期间完成的动作摘要 */
    completedSummary: string[];
}
//# sourceMappingURL=types.d.ts.map