import Decimal from "break_infinity.js";

export type Dec = Decimal;

export const D = (x: string | number | Decimal): Decimal => Decimal.fromValue(x);

export const dZero = (): Decimal => Decimal.fromNumber(0);
export const dOne = (): Decimal => Decimal.fromNumber(1);

export const minD = (a: Decimal, b: Decimal): Decimal => Decimal.min(a, b);

export const maxD = (a: Decimal, b: Decimal): Decimal => Decimal.max(a, b);

export const clampResource = (v: Decimal, cap: Decimal): Decimal =>
  minD(maxD(v, dZero()), cap);
