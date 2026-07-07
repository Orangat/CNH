/**
 * Return the value for the active language, falling back to the other language
 * when the active one is empty/whitespace. Returns '' only if both are empty.
 */
export function pickLang(lang: 'en' | 'uk', en: string, uk: string): string {
  const active = lang === 'uk' ? uk : en;
  const other = lang === 'uk' ? en : uk;
  return active.trim() ? active : other;
}
