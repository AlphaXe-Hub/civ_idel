import type { EraDef } from "../types.js";
export declare const ERAS: EraDef[];
export declare const ERA_ORDER: EraDef["id"][];
export declare const ERA_MAP: Record<(typeof ERAS)[number]["id"], EraDef>;
export declare function nextEra(current: EraDef["id"]): EraDef["id"] | null;
export declare function eraIndex(id: EraDef["id"]): number;
//# sourceMappingURL=eras.d.ts.map