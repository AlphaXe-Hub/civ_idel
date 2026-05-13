import { createI18n } from "vue-i18n";
import en from "./locales/en";
import ja from "./locales/ja";
import zhCN from "./locales/zh-CN";

export const LOCALE_STORAGE_KEY = "civ-idle-locale";

export type AppLocale = "zh-CN" | "en" | "ja";

export const SUPPORTED_LOCALES: { code: AppLocale; native: string }[] = [
  { code: "zh-CN", native: "简体中文" },
  { code: "en", native: "English" },
  { code: "ja", native: "日本語" },
];

function readSavedLocale(): AppLocale {
  try {
    const raw = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (raw === "zh-CN" || raw === "en" || raw === "ja") return raw;
  } catch {
    /* ignore */
  }
  return "zh-CN";
}

export const i18n = createI18n({
  legacy: false,
  locale: readSavedLocale(),
  fallbackLocale: "zh-CN",
  messages: {
    "zh-CN": zhCN,
    en,
    ja,
  },
});

export function setAppLocale(code: AppLocale) {
  i18n.global.locale.value = code;
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, code);
  } catch {
    /* ignore */
  }
}

export function translateErrorReason(reason: string): string {
  const key = `errors.${reason}`;
  return i18n.global.te(key) ? String(i18n.global.t(key)) : reason;
}
