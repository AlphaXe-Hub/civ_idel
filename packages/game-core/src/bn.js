import Decimal from "break_infinity.js";
export const D = (x) => Decimal.fromValue(x);
export const dZero = () => Decimal.fromNumber(0);
export const dOne = () => Decimal.fromNumber(1);
export const minD = (a, b) => Decimal.min(a, b);
export const maxD = (a, b) => Decimal.max(a, b);
export const clampResource = (v, cap) => minD(maxD(v, dZero()), cap);
//# sourceMappingURL=bn.js.map