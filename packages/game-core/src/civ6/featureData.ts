import type { EraId, ResourceId } from "../types.js";

/** feature.md 文档中的时代名 → civ_idel 的 EraId */
export type DocEra = "primitive" | "stone" | "farming" | "bronze" | "iron" | "industrial" | "modern";

export function docEraToGameEra(d: DocEra): EraId {
  const m: Record<DocEra, EraId> = {
    primitive: "primitive",
    stone: "tribal",
    farming: "agricultural",
    bronze: "classical",
    iron: "classical",
    industrial: "industrial",
    modern: "modern",
  };
  return m[d];
}

/** 尤里卡原始行（对齐 feature.md 顺序 1–32） */
export interface RawEurekaRow {
  title: string;
  emoji: string;
  docEra: DocEra;
  weight: number;
  /** 0=tick_random A, 1=on_building_complete, 2=on_evolve, 3=on_research_complete, 4=tick_random B */
  triggerSlot: 0 | 1 | 2 | 3 | 4;
  once: boolean;
  effect:
    | { kind: "resource"; value: number }
    | { kind: "era"; frac: number }
    | { kind: "tech"; frac: number }
    | { kind: "buff"; mult: number; timeSec: number }
    | { kind: "relic"; bias: number }
    | { kind: "greatXp"; amount: number }
    | { kind: "storage"; frac: number }
    | { kind: "eurekaUp"; add: number }
    | { kind: "allBuff"; frac: number };
}

export const RAW_EUREKA_ROWS: RawEurekaRow[] = [
  { title: "偶遇野火", emoji: "🔥", docEra: "primitive", weight: 0.95, triggerSlot: 1, once: false, effect: { kind: "resource", value: 120 } },
  { title: "族群顿悟", emoji: "💡", docEra: "primitive", weight: 0.88, triggerSlot: 2, once: false, effect: { kind: "era", frac: 0.08 } },
  { title: "徒手造器", emoji: "🪨", docEra: "primitive", weight: 0.9, triggerSlot: 3, once: false, effect: { kind: "tech", frac: 0.25 } },
  { title: "狩猎好运", emoji: "🦌", docEra: "primitive", weight: 0.85, triggerSlot: 4, once: false, effect: { kind: "buff", mult: 1.4, timeSec: 45 } },
  { title: "远古印记", emoji: "🖤", docEra: "primitive", weight: 0.75, triggerSlot: 1, once: true, effect: { kind: "relic", bias: 0.12 } },
  { title: "磨石灵感", emoji: "🪓", docEra: "stone", weight: 0.9, triggerSlot: 1, once: false, effect: { kind: "tech", frac: 0.3 } },
  { title: "聚落扩张", emoji: "🏘️", docEra: "stone", weight: 0.88, triggerSlot: 2, once: false, effect: { kind: "era", frac: 0.1 } },
  { title: "兽皮丰收", emoji: "🐑", docEra: "stone", weight: 0.92, triggerSlot: 1, once: false, effect: { kind: "resource", value: 160 } },
  { title: "石阵启示", emoji: "🗿", docEra: "stone", weight: 0.82, triggerSlot: 1, once: false, effect: { kind: "greatXp", amount: 60 } },
  { title: "工匠觉醒", emoji: "🔨", docEra: "stone", weight: 0.86, triggerSlot: 1, once: false, effect: { kind: "buff", mult: 1.45, timeSec: 50 } },
  { title: "播种感悟", emoji: "🌾", docEra: "farming", weight: 0.9, triggerSlot: 3, once: false, effect: { kind: "tech", frac: 0.35 } },
  { title: "风调雨顺", emoji: "🌤️", docEra: "farming", weight: 0.93, triggerSlot: 0, once: false, effect: { kind: "resource", value: 200 } },
  { title: "村落兴盛", emoji: "🏡", docEra: "farming", weight: 0.88, triggerSlot: 2, once: false, effect: { kind: "era", frac: 0.12 } },
  { title: "粮仓智慧", emoji: "🏺", docEra: "farming", weight: 0.84, triggerSlot: 1, once: true, effect: { kind: "storage", frac: 0.15 } },
  { title: "贤者悟道", emoji: "🧓", docEra: "farming", weight: 0.8, triggerSlot: 4, once: true, effect: { kind: "eurekaUp", add: 0.05 } },
  { title: "熔炼突破", emoji: "🔥", docEra: "bronze", weight: 0.9, triggerSlot: 3, once: false, effect: { kind: "tech", frac: 0.4 } },
  { title: "矿脉发现", emoji: "⛏️", docEra: "bronze", weight: 0.92, triggerSlot: 1, once: false, effect: { kind: "resource", value: 240 } },
  { title: "城邦萌芽", emoji: "🏛️", docEra: "bronze", weight: 0.87, triggerSlot: 2, once: false, effect: { kind: "era", frac: 0.14 } },
  { title: "青铜礼器", emoji: "🎭", docEra: "bronze", weight: 0.78, triggerSlot: 1, once: true, effect: { kind: "relic", bias: 0.35 } },
  { title: "匠人齐心", emoji: "⚒️", docEra: "bronze", weight: 0.86, triggerSlot: 4, once: false, effect: { kind: "buff", mult: 1.5, timeSec: 60 } },
  { title: "锻铁秘术", emoji: "⚔️", docEra: "iron", weight: 0.9, triggerSlot: 3, once: false, effect: { kind: "tech", frac: 0.45 } },
  { title: "黑煤探明", emoji: "⬛", docEra: "iron", weight: 0.91, triggerSlot: 1, once: false, effect: { kind: "resource", value: 280 } },
  { title: "王国崛起", emoji: "👑", docEra: "iron", weight: 0.88, triggerSlot: 2, once: false, effect: { kind: "era", frac: 0.16 } },
  { title: "军武精进", emoji: "🛡️", docEra: "iron", weight: 0.83, triggerSlot: 4, once: true, effect: { kind: "allBuff", frac: 0.12 } },
  { title: "史诗传说", emoji: "📜", docEra: "iron", weight: 0.81, triggerSlot: 1, once: false, effect: { kind: "greatXp", amount: 80 } },
  { title: "蒸汽顿悟", emoji: "💨", docEra: "industrial", weight: 0.9, triggerSlot: 3, once: false, effect: { kind: "tech", frac: 0.5 } },
  { title: "油田现世", emoji: "🛢️", docEra: "industrial", weight: 0.92, triggerSlot: 1, once: false, effect: { kind: "resource", value: 350 } },
  { title: "工厂革命", emoji: "🏭", docEra: "industrial", weight: 0.89, triggerSlot: 2, once: false, effect: { kind: "era", frac: 0.18 } },
  { title: "机械天启", emoji: "⚙️", docEra: "industrial", weight: 0.87, triggerSlot: 4, once: false, effect: { kind: "buff", mult: 1.6, timeSec: 70 } },
  { title: "电学灵光", emoji: "⚡", docEra: "modern", weight: 0.9, triggerSlot: 3, once: false, effect: { kind: "tech", frac: 0.55 } },
  { title: "芯片突破", emoji: "💾", docEra: "modern", weight: 0.93, triggerSlot: 0, once: false, effect: { kind: "resource", value: 400 } },
  { title: "文明巅峰", emoji: "🌍", docEra: "modern", weight: 0.91, triggerSlot: 2, once: false, effect: { kind: "era", frac: 0.2 } },
];

export interface RawGreatRow {
  name: string;
  docEra: DocEra;
  emoji: string;
  roleType: string;
  roleTag: string;
  /** 主要加成资源；空则按「全基础资源」近似 */
  resKeys: ResourceId[];
  v1: number;
  v2: number;
  v3: number;
  costScale: number;
  /** feature.md GREAT_EUREKA_LINK */
  linkChanceUp: number;
  linkRewardBonus: number;
}

export const RAW_GREAT_ROWS: RawGreatRow[] = [
  { name: "燧人氏", docEra: "primitive", emoji: "🔥", roleType: "先知", roleTag: "远古钻木取火发明者", resKeys: ["food", "wood", "stone"], v1: 1.18, v2: 1.35, v3: 1.6, costScale: 1, linkChanceUp: 0.04, linkRewardBonus: 0.06 },
  { name: "神农氏", docEra: "primitive", emoji: "🌾", roleType: "猎手", roleTag: "远古农耕/医药先驱", resKeys: ["food", "wood", "stone"], v1: 1.15, v2: 1.32, v3: 1.55, costScale: 1, linkChanceUp: 0.03, linkRewardBonus: 0.05 },
  { name: "伏羲氏", docEra: "primitive", emoji: "👴", roleType: "领袖", roleTag: "远古部落首领、八卦发明者", resKeys: ["knowledge"], v1: 1.12, v2: 1.28, v3: 1.48, costScale: 1, linkChanceUp: 0.03, linkRewardBonus: 0.05 },
  { name: "女娲", docEra: "primitive", emoji: "👩", roleType: "祭祀", roleTag: "远古部落女首领、创世先民代表", resKeys: ["food"], v1: 1.04, v2: 1.09, v3: 1.15, costScale: 1, linkChanceUp: 0.05, linkRewardBonus: 0.07 },
  { name: "有巢氏", docEra: "stone", emoji: "🪓", roleType: "工匠", roleTag: "远古构屋先驱、石器使用者", resKeys: ["wood", "stone"], v1: 1.16, v2: 1.33, v3: 1.58, costScale: 1.2, linkChanceUp: 0.04, linkRewardBonus: 0.06 },
  { name: "仓颉", docEra: "stone", emoji: "🎨", roleType: "艺术家", roleTag: "远古文字发明者、文明启蒙者", resKeys: ["knowledge"], v1: 1.05, v2: 1.11, v3: 1.18, costScale: 1.2, linkChanceUp: 0.05, linkRewardBonus: 0.08 },
  { name: "黄帝", docEra: "stone", emoji: "⚔️", roleType: "统帅", roleTag: "华夏部落联盟首领、文明奠基人", resKeys: ["food", "wood", "stone", "knowledge"], v1: 1.13, v2: 1.29, v3: 1.5, costScale: 1.2, linkChanceUp: 0.03, linkRewardBonus: 0.05 },
  { name: "颛顼", docEra: "stone", emoji: "⭐", roleType: "智者", roleTag: "上古部落首领、星象观测先驱", resKeys: ["knowledge"], v1: 1.14, v2: 1.3, v3: 1.52, costScale: 1.2, linkChanceUp: 0.04, linkRewardBonus: 0.06 },
  { name: "后稷", docEra: "farming", emoji: "🌾", roleType: "农学家", roleTag: "夏朝农官、农耕技术推广者", resKeys: ["food"], v1: 1.2, v2: 1.38, v3: 1.62, costScale: 1.4, linkChanceUp: 0.04, linkRewardBonus: 0.07 },
  { name: "陶唐氏", docEra: "farming", emoji: "🏺", roleType: "陶艺家", roleTag: "上古陶工、制陶技术先驱", resKeys: ["clay"], v1: 1.17, v2: 1.34, v3: 1.56, costScale: 1.4, linkChanceUp: 0.03, linkRewardBonus: 0.05 },
  { name: "伊尹", docEra: "farming", emoji: "📜", roleType: "谋士", roleTag: "商初贤相、治国谋士", resKeys: ["food", "knowledge"], v1: 1.1, v2: 1.22, v3: 1.38, costScale: 1.4, linkChanceUp: 0.05, linkRewardBonus: 0.08 },
  { name: "巫咸", docEra: "farming", emoji: "🌿", roleType: "医者", roleTag: "商初巫医、医药先驱", resKeys: ["food", "wood"], v1: 1.12, v2: 1.26, v3: 1.45, costScale: 1.4, linkChanceUp: 0.04, linkRewardBonus: 0.06 },
  { name: "欧冶子", docEra: "bronze", emoji: "🔥", roleType: "冶炼师", roleTag: "春秋铸剑大师、青铜冶炼先驱", resKeys: ["metal"], v1: 1.22, v2: 1.4, v3: 1.65, costScale: 1.6, linkChanceUp: 0.05, linkRewardBonus: 0.09 },
  { name: "周公旦", docEra: "bronze", emoji: "🎭", roleType: "思想家", roleTag: "西周政治家、礼乐制度创始人", resKeys: ["knowledge"], v1: 1.15, v2: 1.32, v3: 1.55, costScale: 1.6, linkChanceUp: 0.04, linkRewardBonus: 0.07 },
  { name: "鲁班", docEra: "bronze", emoji: "🏛️", roleType: "建筑师", roleTag: "春秋工匠、建筑/工具发明家", resKeys: ["wood", "stone"], v1: 1.16, v2: 1.35, v3: 1.58, costScale: 1.6, linkChanceUp: 0.05, linkRewardBonus: 0.08 },
  { name: "子贡", docEra: "bronze", emoji: "🐪", roleType: "商人", roleTag: "春秋富商、孔门弟子、商旅先驱", resKeys: ["food", "wood", "stone", "metal"], v1: 1.14, v2: 1.3, v3: 1.53, costScale: 1.6, linkChanceUp: 0.03, linkRewardBonus: 0.06 },
  { name: "干将", docEra: "iron", emoji: "⚔️", roleType: "武匠", roleTag: "战国铸剑大师、铁器冶炼专家", resKeys: ["metal"], v1: 1.25, v2: 1.45, v3: 1.7, costScale: 1.8, linkChanceUp: 0.05, linkRewardBonus: 0.09 },
  { name: "秦始皇", docEra: "iron", emoji: "👑", roleType: "君主", roleTag: "秦朝开国皇帝、大一统先驱", resKeys: ["food", "wood", "stone", "knowledge", "metal"], v1: 1.12, v2: 1.27, v3: 1.46, costScale: 1.8, linkChanceUp: 0.04, linkRewardBonus: 0.07 },
  { name: "孙武", docEra: "iron", emoji: "📖", roleType: "军师", roleTag: "战国军事家、《孙子兵法》作者", resKeys: ["knowledge"], v1: 1.13, v2: 1.29, v3: 1.49, costScale: 1.8, linkChanceUp: 0.06, linkRewardBonus: 0.1 },
  { name: "李冰", docEra: "iron", emoji: "⛏️", roleType: "矿师", roleTag: "战国水利专家、都江堰修建者", resKeys: ["stone", "clay"], v1: 1.21, v2: 1.39, v3: 1.63, costScale: 1.8, linkChanceUp: 0.04, linkRewardBonus: 0.06 },
  { name: "瓦特", docEra: "industrial", emoji: "💨", roleType: "工程师", roleTag: "英国发明家、蒸汽机改良者", resKeys: ["coal", "metal"], v1: 1.28, v2: 1.48, v3: 1.72, costScale: 2, linkChanceUp: 0.06, linkRewardBonus: 0.1 },
  { name: "洛克菲勒", docEra: "industrial", emoji: "🛢️", roleType: "能源家", roleTag: "美国石油大亨、能源工业先驱", resKeys: ["coal"], v1: 1.24, v2: 1.44, v3: 1.68, costScale: 2, linkChanceUp: 0.05, linkRewardBonus: 0.09 },
  { name: "爱迪生", docEra: "industrial", emoji: "⚙️", roleType: "机械师", roleTag: "美国发明家、电气/机械先驱", resKeys: ["knowledge", "metal"], v1: 1.2, v2: 1.38, v3: 1.6, costScale: 2, linkChanceUp: 0.06, linkRewardBonus: 0.1 },
  { name: "摩根", docEra: "industrial", emoji: "💰", roleType: "金融家", roleTag: "美国金融大亨、工业融资先驱", resKeys: ["food", "wood", "stone"], v1: 1.18, v2: 1.36, v3: 1.59, costScale: 2, linkChanceUp: 0.04, linkRewardBonus: 0.07 },
  { name: "牛顿", docEra: "industrial", emoji: "🔬", roleType: "物理学家", roleTag: "英国物理学家、经典力学奠基人", resKeys: ["knowledge"], v1: 1.25, v2: 1.43, v3: 1.66, costScale: 2, linkChanceUp: 0.07, linkRewardBonus: 0.11 },
  { name: "奥斯曼", docEra: "industrial", emoji: "🏙️", roleType: "规划师", roleTag: "法国城市规划师、现代城市先驱", resKeys: ["stone", "clay"], v1: 1.1, v2: 1.2, v3: 1.33, costScale: 2, linkChanceUp: 0.05, linkRewardBonus: 0.08 },
  { name: "特斯拉", docEra: "modern", emoji: "⚡", roleType: "电气学家", roleTag: "塞尔维亚发明家、电力技术先驱", resKeys: ["knowledge", "coal"], v1: 1.3, v2: 1.5, v3: 1.75, costScale: 2.2, linkChanceUp: 0.07, linkRewardBonus: 0.12 },
  { name: "肖克利", docEra: "modern", emoji: "💾", roleType: "计算机先驱", roleTag: "美国科学家、晶体管发明者（芯片基础）", resKeys: ["knowledge"], v1: 1.26, v2: 1.47, v3: 1.71, costScale: 2.2, linkChanceUp: 0.07, linkRewardBonus: 0.12 },
  { name: "冯·布劳恩", docEra: "modern", emoji: "🚀", roleType: "航天科学家", roleTag: "德国/美国航天工程师、火箭先驱", resKeys: ["metal", "coal", "knowledge"], v1: 1.15, v2: 1.32, v3: 1.52, costScale: 2.2, linkChanceUp: 0.08, linkRewardBonus: 0.13 },
  { name: "蒂姆·伯纳斯-李", docEra: "modern", emoji: "🌐", roleType: "网络思想家", roleTag: "英国科学家、万维网发明者", resKeys: ["knowledge"], v1: 1.22, v2: 1.41, v3: 1.65, costScale: 2.2, linkChanceUp: 0.06, linkRewardBonus: 0.11 },
  { name: "爱因斯坦", docEra: "modern", emoji: "🌍", roleType: "世界领袖", roleTag: "德裔美国科学家、相对论创立者", resKeys: ["food", "wood", "stone", "knowledge"], v1: 1.18, v2: 1.37, v3: 1.6, costScale: 2.2, linkChanceUp: 0.09, linkRewardBonus: 0.15 },
  { name: "孔子", docEra: "modern", emoji: "🧠", roleType: "哲学家", roleTag: "中国思想家、儒家学派创始人（影响深远）", resKeys: ["knowledge"], v1: 1.12, v2: 1.26, v3: 1.45, costScale: 2.2, linkChanceUp: 0.08, linkRewardBonus: 0.14 },
];

export type RawRelicKind =
  | "output"
  | "exp"
  | "storage"
  | "tech"
  | "build"
  | "offline"
  | "eureka"
  | "greatExp"
  | "farm"
  | "allRes"
  | "combatRes"
  | "allBuff"
  | "factory"
  | "energy"
  | "era"
  | "eraAll"
  | "modernRes"
  | "eurekaMax"
  | "greatAll"
  | "gameAll"
  | "expTech";

export interface RawRelicRow {
  name: string;
  icon: string;
  quality: "common" | "rare" | "epic" | "legendary";
  rtype: RawRelicKind;
  /** feature.md 的 value（倍率，如 1.05） */
  mult: number;
  minEra: EraId;
  weight: number;
}

export const RAW_RELIC_ROWS: RawRelicRow[] = [
  { name: "原始石片", icon: "🪨", quality: "common", rtype: "output", mult: 1.05, minEra: "primitive", weight: 1 },
  { name: "兽牙吊坠", icon: "🦷", quality: "common", rtype: "exp", mult: 1.05, minEra: "primitive", weight: 1 },
  { name: "枯木图腾", icon: "🌲", quality: "common", rtype: "storage", mult: 1.06, minEra: "primitive", weight: 1 },
  { name: "贝壳饰品", icon: "🐚", quality: "common", rtype: "tech", mult: 1.04, minEra: "tribal", weight: 1.02 },
  { name: "碎石工具", icon: "🪓", quality: "common", rtype: "build", mult: 1.05, minEra: "tribal", weight: 1.02 },
  { name: "古老骨片", icon: "🦴", quality: "common", rtype: "offline", mult: 1.05, minEra: "tribal", weight: 1.02 },
  { name: "浅色原石", icon: "💎", quality: "common", rtype: "eureka", mult: 1.03, minEra: "agricultural", weight: 1.03 },
  { name: "草编古物", icon: "🌾", quality: "common", rtype: "greatExp", mult: 1.04, minEra: "agricultural", weight: 1.03 },
  { name: "磨制石斧", icon: "🔨", quality: "rare", rtype: "output", mult: 1.12, minEra: "agricultural", weight: 0.95 },
  { name: "彩绘陶碗", icon: "🏺", quality: "rare", rtype: "storage", mult: 1.14, minEra: "agricultural", weight: 0.95 },
  { name: "青铜小像", icon: "🗿", quality: "rare", rtype: "tech", mult: 1.11, minEra: "classical", weight: 0.92 },
  { name: "古战盾牌", icon: "🛡️", quality: "rare", rtype: "offline", mult: 1.13, minEra: "classical", weight: 0.92 },
  { name: "农耕古镰", icon: "🌾", quality: "rare", rtype: "farm", mult: 1.15, minEra: "classical", weight: 0.92 },
  { name: "商旅铜铃", icon: "🔔", quality: "rare", rtype: "allRes", mult: 1.1, minEra: "classical", weight: 0.9 },
  { name: "星象石板", icon: "📜", quality: "rare", rtype: "eureka", mult: 1.08, minEra: "industrial", weight: 0.88 },
  { name: "匠人凿子", icon: "⛏️", quality: "rare", rtype: "build", mult: 1.12, minEra: "industrial", weight: 0.88 },
  { name: "王权青铜鼎", icon: "🏺", quality: "epic", rtype: "output", mult: 1.22, minEra: "classical", weight: 0.85 },
  { name: "寒铁古剑", icon: "⚔️", quality: "epic", rtype: "combatRes", mult: 1.24, minEra: "classical", weight: 0.85 },
  { name: "圣贤书卷", icon: "📖", quality: "epic", rtype: "tech", mult: 1.2, minEra: "classical", weight: 0.84 },
  { name: "王国玉玺", icon: "👑", quality: "epic", rtype: "allBuff", mult: 1.16, minEra: "industrial", weight: 0.82 },
  { name: "蒸汽古齿轮", icon: "⚙️", quality: "epic", rtype: "factory", mult: 1.25, minEra: "industrial", weight: 0.82 },
  { name: "能源原石", icon: "🛢️", quality: "epic", rtype: "energy", mult: 1.23, minEra: "industrial", weight: 0.82 },
  { name: "时光沙漏", icon: "⏳", quality: "epic", rtype: "offline", mult: 1.21, minEra: "modern", weight: 0.8 },
  { name: "文明图腾柱", icon: "🗿", quality: "epic", rtype: "era", mult: 1.18, minEra: "modern", weight: 0.8 },
  { name: "起源火种", icon: "🔥", quality: "legendary", rtype: "allRes", mult: 1.3, minEra: "industrial", weight: 0.65 },
  { name: "真理水晶", icon: "💎", quality: "legendary", rtype: "allBuff", mult: 1.25, minEra: "industrial", weight: 0.65 },
  { name: "无尽古籍", icon: "📜", quality: "legendary", rtype: "expTech", mult: 1.28, minEra: "modern", weight: 0.62 },
  { name: "文明圣冠", icon: "👑", quality: "legendary", rtype: "eraAll", mult: 1.26, minEra: "modern", weight: 0.62 },
  { name: "雷电核心", icon: "⚡", quality: "legendary", rtype: "modernRes", mult: 1.32, minEra: "modern", weight: 0.62 },
  { name: "寰宇星盘", icon: "⭐", quality: "legendary", rtype: "eurekaMax", mult: 1.2, minEra: "modern", weight: 0.6 },
  { name: "伟人丰碑", icon: "🏛️", quality: "legendary", rtype: "greatAll", mult: 1.27, minEra: "modern", weight: 0.6 },
  { name: "文明起源石", icon: "🌍", quality: "legendary", rtype: "gameAll", mult: 1.35, minEra: "modern", weight: 0.58 },
];

const ALL_RES: ResourceId[] = ["food", "wood", "stone", "knowledge", "clay", "metal", "coal"];

/** 将文档「资源数值」拆到当前时代可见资源上 */
export function resourceBundleForEureka(gameEra: EraId, total: number): Partial<Record<ResourceId, string>> {
  const ei = gameEra === "modern" ? 5 : gameEra === "industrial" ? 4 : gameEra === "classical" ? 3 : gameEra === "agricultural" ? 2 : gameEra === "tribal" ? 1 : 0;
  const keys: ResourceId[] =
    ei >= 4
      ? ["food", "wood", "stone", "knowledge", "clay", "metal", "coal"]
      : ei >= 2
        ? ["food", "wood", "stone", "knowledge", "clay"]
        : ["food", "wood", "stone"];
  const n = keys.length;
  const each = Math.max(1, Math.floor(total / n));
  const out: Partial<Record<ResourceId, string>> = {};
  let rest = total;
  for (let i = 0; i < n; i++) {
    const v = i === n - 1 ? rest : each;
    out[keys[i]!] = String(v);
    rest -= v;
  }
  return out;
}

/** 遗物倍率 → baseProdAdd / baseStorageAdd / greatCostFactor 等（与 qualityMultiplier 叠乘） */
export function relicNumericFromRow(row: RawRelicRow): {
  baseProdAdd: Partial<Record<ResourceId, number>>;
  baseStorageAdd: number;
  greatCostFactor: number;
} {
  const add = (mult: number) => Math.min(0.12, Math.max(0, (mult - 1) * 0.35));
  const baseProdAdd: Partial<Record<ResourceId, number>> = {};
  let baseStorageAdd = 4;
  const t = row.rtype;
  const m = row.mult;

  const spreadAll = (frac: number) => {
    for (const r of ALL_RES) baseProdAdd[r] = (baseProdAdd[r] ?? 0) + frac / ALL_RES.length;
  };

  if (t === "output" || t === "allRes" || t === "gameAll") {
    spreadAll(add(m));
  } else if (t === "farm") {
    baseProdAdd.food = add(m);
  } else if (t === "combatRes" || t === "factory") {
    baseProdAdd.metal = add(m) * 0.55;
    baseProdAdd.stone = add(m) * 0.45;
  } else if (t === "energy" || t === "modernRes") {
    baseProdAdd.coal = add(m) * 0.5;
    baseProdAdd.metal = add(m) * 0.35;
    baseProdAdd.knowledge = add(m) * 0.15;
  } else if (t === "tech" || t === "exp" || t === "expTech") {
    baseProdAdd.knowledge = add(m * 0.85);
    spreadAll(add(m * 0.15));
  } else if (t === "eureka" || t === "eurekaMax") {
    spreadAll(add(m * 0.7));
    baseProdAdd.knowledge = (baseProdAdd.knowledge ?? 0) + add(m * 0.3);
  } else if (t === "greatExp" || t === "greatAll") {
    baseProdAdd.knowledge = (baseProdAdd.knowledge ?? 0) + add(m);
  } else if (t === "build" || t === "offline") {
    spreadAll(add(m * 0.6));
    baseProdAdd.wood = (baseProdAdd.wood ?? 0) + add(m * 0.2);
    baseProdAdd.stone = (baseProdAdd.stone ?? 0) + add(m * 0.2);
  } else if (t === "allBuff" || t === "eraAll") {
    spreadAll(add(m));
  } else if (t === "era") {
    spreadAll(add(m * 0.85));
    baseProdAdd.knowledge = (baseProdAdd.knowledge ?? 0) + add(m * 0.15);
  } else if (t === "storage") {
    baseStorageAdd = 8 + Math.round((m - 1) * 40);
    spreadAll(add(m * 0.25));
  } else {
    spreadAll(add(m * 0.5));
  }

  const qf = row.quality === "legendary" ? 0.992 : row.quality === "epic" ? 0.994 : row.quality === "rare" ? 0.996 : 0.998;
  return { baseProdAdd, baseStorageAdd, greatCostFactor: qf };
}

export function greatPerLevelProd(row: RawGreatRow): Partial<Record<ResourceId, number>> {
  const keys = row.resKeys.length ? row.resKeys : (["food", "wood", "stone"] as ResourceId[]);
  const amp = Math.min(0.024, ((row.v3 - 1) / 3) * 0.45 / keys.length);
  const o: Partial<Record<ResourceId, number>> = {};
  for (const k of keys) o[k] = amp;
  return o;
}

export function greatPerLevelStorage(row: RawGreatRow): number {
  const tag = row.roleTag + row.roleType;
  if (tag.includes("陶") || tag.includes("存储") || row.name.includes("陶唐")) return 10 + Math.round(row.costScale * 4);
  if (row.docEra === "primitive" || row.docEra === "stone") return 6;
  return 5 + Math.round(row.costScale * 3);
}

export function greatEurekaChanceAdd(row: RawGreatRow): number {
  return Math.min(0.00012, ((row.v3 - row.v1) / 2) * 0.000035 + row.linkChanceUp * 0.00006);
}
