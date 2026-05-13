import type Decimal from "break_infinity.js";

export type ResourceId =
  | "food"
  | "wood"
  | "stone"
  | "knowledge"
  | "clay"
  | "metal"
  | "coal";

export type EraId =
  | "primitive"
  | "tribal"
  | "agricultural"
  | "classical"
  | "industrial"
  | "modern";

export type BuildingId =
  | "hut"
  | "lumberCamp"
  | "stonePit"
  | "library"
  | "clayWorks"
  | "foundry"
  | "coalShaft";

export type TechId = "fire" | "tools" | "agriculture";

export type QuestId =
  | "q_gather_food"
  | "q_build_hut"
  | "q_research_fire"
  | "q_upgrade_hut2"
  | "q_evolve_tribal";

export type ActionKind = "research" | "building_upgrade";

export type ActiveAction =
  | {
      id: string;
      kind: "research";
      techId: TechId;
      startedAt: number;
      endsAt: number;
    }
  | {
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
  objective:
    | { type: "resource_amount"; resource: ResourceId; amount: string }
    | { type: "resources_threshold"; amounts: Partial<Record<ResourceId, string>> }
    | { type: "building_level"; building: BuildingId; level: number }
    | { type: "tech_completed"; tech: TechId }
    | { type: "era_reached"; era: EraId };
  rewards: {
    resources?: Partial<Record<ResourceId, string>>;
    modifiers?: Array<{ id: string; resource: ResourceId; multiplier: number }>;
  };
  /** 前置任务 */
  requires?: QuestId[];
}

export type RelicQuality = "common" | "rare" | "epic" | "legendary";

/** 尤里卡触发的临时产出倍率（与 bonusModifiers 分离，由 aggregate 汇总并 cap） */
export type Civ6ActiveBuff =
  | {
      id: string;
      untilMs: number;
      kind: "temp_prod_mult";
      resource: ResourceId;
      /** 额外乘在 productionMultiplier 上（例如 1.04） */
      mult: number;
    }
  | {
      id: string;
      untilMs: number;
      kind: "temp_all_prod_mult";
      /** 全资源同乘（例如 1.4） */
      mult: number;
    };

/**
 * 文明6 风格扩展存档（尤里卡 / 伟人 / 遗物 + 图鉴）
 * 弹窗队列不入库，由 tick 写入模块级 buffer，前端 drain。
 */
export interface Civ6State {
  rngSeed: number;
  /** 已消费的一次性尤里卡（永久类防重复） */
  seenEurekaIds: string[];
  activeBuffs: Civ6ActiveBuff[];
  /** 伟人 id -> 等级 */
  greatPeople: Partial<Record<string, { level: number }>>;
  relics: Array<{ defId: string; quality: RelicQuality }>;
  /** 图鉴已解锁 id（尤里卡 / 伟人 / 遗物） */
  codexUnlocked: { eureka: string[]; great: string[]; relic: string[] };
  /** 行为计数（建筑完成次数、进化次数等） */
  counters: Record<string, number>;
  /** 尤里卡等给予的永久小额产出加算（以 (1+sum) 乘入，cap 在 aggregate） */
  staticProdAdd: Partial<Record<ResourceId, number>>;
  /** 遗物/伟人等给予的仓库加算（直接加到 baseStorageCap 之后） */
  staticStorageAdd: Partial<Record<ResourceId, number>>;
  /** 尤里卡「概率类」永久加算（与 tick 基础概率线性叠加，由配置限幅） */
  eurekaRateAdd?: number;
}

export interface GameState {
  saveVersion: number;
  /** 上次与服务器对齐的时间戳（毫秒） */
  lastSyncedAt: number;
  currentEra: EraId;
  resources: Record<ResourceId, string>;
  buildings: Record<BuildingId, { level: number }>;
  techStatus: Record<TechId, "locked" | "available" | "researching" | "completed">;
  /** 进行中的定时动作（槽位数随时代增加） */
  activeActions: ActiveAction[];
  completedQuests: QuestId[];
  /** 任务进度缓存（如资源历史峰值等简化：仅存当前计数） */
  questCounters: Partial<Record<string, string>>;
  /** 来自任务奖励的永久修饰符 */
  bonusModifiers: Array<{ id: string; resource: ResourceId; multiplier: number }>;
  /** 进化仪式进行中 */
  evolutionRitual?: { startedAt: number; endsAt: number; targetEra: EraId };
  /** 勾选自动加入建筑升级队列的建筑 id（有空位且资源够时由 tick 自动开升级） */
  autoUpgradeBuildingIds: BuildingId[];
  /** 尤里卡 / 伟人 / 遗物（可选，旧档无） */
  civ6?: Civ6State;
}

export interface OfflineResult {
  state: GameState;
  /** 实际结算的离线毫秒（已封顶） */
  appliedMs: number;
  /** 离线期间完成的动作摘要 */
  completedSummary: string[];
}
