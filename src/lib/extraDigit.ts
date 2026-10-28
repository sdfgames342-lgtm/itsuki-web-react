/**
 * Digital root + mapeo {extra} a sistema solar (inglés).
 *
 *   extraDigit(89756456) === 5    // 8+9+7+5+6+4+5+6=50 → 5+0=5 → jupiter
 *   extraDigit(9000)     === 9    // → pluto
 *
 *   ctrl  → extra = extraDigit(telegram_id)   (privado)
 *   admin → extra = extraDigit(chat_id)       (grupo)
 */
export function extraDigit(n: number): number {
  n = Math.abs(Math.trunc(n));
  if (n === 0) return 0;
  return 1 + ((n - 1) % 9);
}

/** Sistema solar · 0=sun .. 9=pluto */
export const EXTRA_MAP: Record<number, string> = {
  0: 'sun',
  1: 'mercury',
  2: 'venus',
  3: 'earth',
  4: 'mars',
  5: 'jupiter',
  6: 'saturn',
  7: 'uranus',
  8: 'neptune',
  9: 'pluto',
};

export function extraName(d: number): string {
  return EXTRA_MAP[d] ?? '?';
}
