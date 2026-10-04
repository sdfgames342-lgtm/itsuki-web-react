import { apToAccessLevel, isValidAP } from './apHex';
import { extraDigit } from './extraDigit';

export type UrlKind = 'ctrl' | 'admin' | 'stats' | 'stealth' | 'game';

export interface ParsedUrl {
  accessLevel: number;
  accessLevelAP: string;
  kind: UrlKind;
  /** Segmento crudo en la URL (ctrl/admin/stats/stealth/<game>). */
  kindSegment: string;
  /** chat_id: null en ctrl, obligatorio en admin, opcional en game. */
  chatId: number | null;
  /** {extra}: 0-9. Solo ctrl/admin. */
  extra: number | null;
  /** Nombre legible del {extra} (sun, mercury, ...). */
  extraName: string | null;
  /** name_page: ctrl/admin/stats/stealth. */
  namePage: string | null;
  /** game_page: solo games. */
  gamePage: string | null;
  telegramId: number;
  token: string | null;
  query: string | null;
  parsedAt: number;
}

export type ParseResult =
  | { ok: true; url: ParsedUrl }
  | { ok: false; reason: ParseError };

export type ParseError =
  | 'empty' | 'malformed' | 'bad_hexa' | 'bad_ids'
  | 'bad_extra' | 'extra_mismatch' | 'unknown_kind'
  | 'ctrl_requires_private' | 'admin_requires_group';

const ADMIN_KINDS = new Set(['ctrl', 'admin']);
const META_KINDS  = new Set(['stats', 'stealth']);

const EXTRA_NAMES = [
  'sun', 'mercury', 'venus', 'earth', 'mars',
  'jupiter', 'saturn', 'uranus', 'neptune', 'pluto',
] as const;

/** Parsea "123=tok" o "123". */
function parseLast(s: string): { id: number; token: string | null } | null {
  const eq = s.indexOf('=');
  const idStr = eq >= 0 ? s.slice(0, eq) : s;
  const token = eq >= 0 ? s.slice(eq + 1) : null;
  const id = Number(idStr);
  if (!Number.isInteger(id) || id === 0) return null;
  return { id, token };
}

export function parseUrl(input: string): ParseResult {
  const qIdx = input.indexOf('?');
  const rawPath = qIdx >= 0 ? input.slice(0, qIdx) : input;
  const query = qIdx >= 0 ? input.slice(qIdx + 1) : null;

  const segs = rawPath.split('/').filter(Boolean);
  if (segs.length === 0) return { ok: false, reason: 'empty' };
  if (segs.length < 3)   return { ok: false, reason: 'malformed' };

  // 1. Hexa
  const hexa = segs[0];
  if (!isValidAP(hexa)) return { ok: false, reason: 'bad_hexa' };
  let accessLevel: number;
  try { accessLevel = apToAccessLevel(hexa); }
  catch { return { ok: false, reason: 'bad_hexa' }; }

  // 2. Detectar chat_id (seg[1] numérico)
  let chatId: number | null = null;
  let kindSegment: string;
  let rest: string[];

  if (/^-?\d+$/.test(segs[1])) {
    const c = Number(segs[1]);
    if (!Number.isInteger(c) || c === 0) return { ok: false, reason: 'bad_ids' };
    chatId = c;
    kindSegment = segs[2];
    rest = segs.slice(3);
  } else {
    kindSegment = segs[1];
    rest = segs.slice(2);
  }

  const kindLower = kindSegment.toLowerCase();

  // ─── ctrl · debe ser privado (sin chat_id) ────────────
  if (kindLower === 'ctrl') {
    if (chatId !== null) return { ok: false, reason: 'ctrl_requires_private' };
    if (rest.length !== 3) return { ok: false, reason: 'malformed' };

    const [extraStr, namePage, last] = rest;
    if (!/^\d$/.test(extraStr)) return { ok: false, reason: 'bad_extra' };
    const extra = Number(extraStr);

    const parsed = parseLast(last);
    if (!parsed) return { ok: false, reason: 'bad_ids' };

    // extra usa telegram_id (privado)
    const expected = extraDigit(parsed.id);
    if (extra !== expected) return { ok: false, reason: 'extra_mismatch' };

    return {
      ok: true,
      url: {
        accessLevel, accessLevelAP: hexa,
        kind: 'ctrl', kindSegment: 'ctrl',
        chatId: null,
        extra, extraName: EXTRA_NAMES[extra] ?? null,
        namePage, gamePage: null,
        telegramId: parsed.id, token: parsed.token,
        query, parsedAt: Date.now(),
      },
    };
  }

  // ─── admin · debe venir de grupo (con chat_id) ────────
  if (kindLower === 'admin') {
    if (chatId === null) return { ok: false, reason: 'admin_requires_group' };
    if (rest.length !== 3) return { ok: false, reason: 'malformed' };

    const [extraStr, namePage, last] = rest;
    if (!/^\d$/.test(extraStr)) return { ok: false, reason: 'bad_extra' };
    const extra = Number(extraStr);

    const parsed = parseLast(last);
    if (!parsed) return { ok: false, reason: 'bad_ids' };

    // extra usa chat_id (grupo)
    const expected = extraDigit(chatId);
    if (extra !== expected) return { ok: false, reason: 'extra_mismatch' };

    return {
      ok: true,
      url: {
        accessLevel, accessLevelAP: hexa,
        kind: 'admin', kindSegment: 'admin',
        chatId,
        extra, extraName: EXTRA_NAMES[extra] ?? null,
        namePage, gamePage: null,
        telegramId: parsed.id, token: parsed.token,
        query, parsedAt: Date.now(),
      },
    };
  }

  // ─── stats / stealth · chat_id opcional ───────────────
  if (META_KINDS.has(kindLower)) {
    if (rest.length !== 2) return { ok: false, reason: 'malformed' };

    const [namePage, last] = rest;
    const parsed = parseLast(last);
    if (!parsed) return { ok: false, reason: 'bad_ids' };

    return {
      ok: true,
      url: {
        accessLevel, accessLevelAP: hexa,
        kind: kindLower as UrlKind, kindSegment: kindLower,
        chatId,
        extra: null, extraName: null,
        namePage, gamePage: null,
        telegramId: parsed.id, token: parsed.token,
        query, parsedAt: Date.now(),
      },
    };
  }

  // ─── game · chat_id opcional ──────────────────────────
  if (rest.length !== 1) return { ok: false, reason: 'malformed' };
  if (!kindSegment || kindSegment.length > 64) {
    return { ok: false, reason: 'unknown_kind' };
  }

  const parsed = parseLast(rest[0]);
  if (!parsed) return { ok: false, reason: 'bad_ids' };

  return {
    ok: true,
    url: {
      accessLevel, accessLevelAP: hexa,
      kind: 'game', kindSegment,
      chatId,
      extra: null, extraName: null,
      namePage: null, gamePage: kindSegment,
      telegramId: parsed.id, token: parsed.token,
      query, parsedAt: Date.now(),
    },
  };
}
