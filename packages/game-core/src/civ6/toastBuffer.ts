const MAX_BUFFER = 32;
const buffer: Civ6Toast[] = [];

export interface Civ6Toast {
  kind: "eureka";
  id: string;
  emoji: string;
  title: string;
  i18nKey: string;
}

export function pushCiv6Toast(t: Civ6Toast): void {
  if (buffer.length >= MAX_BUFFER) buffer.shift();
  buffer.push(t);
}

export function drainCiv6Toasts(): Civ6Toast[] {
  const out = buffer.slice();
  buffer.length = 0;
  return out;
}
