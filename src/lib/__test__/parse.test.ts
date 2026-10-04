import { parseUrl } from '../urlParser';
import { extraDigit } from '../extraDigit';
import { accessLevelToAP } from '../apHex';

let pass = 0, fail = 0;
function t(name: string, cond: boolean) {
  if (cond) { console.log(`  \u2713 ${name}`); pass++; }
  else      { console.log(`  \u2717 ${name}`); fail++; }
}

console.log('\n[apHex]');
t('9000 \u2192 CDCI', accessLevelToAP(9000) === 'CDCI');
t('1000 \u2192 DOI',  accessLevelToAP(1000) === 'DOI');
t('2000 \u2192 HNA',  accessLevelToAP(2000) === 'HNA');

console.log('\n[extraDigit]');
t('89756456 \u2192 5', extraDigit(89756456) === 5);
t('9000 \u2192 9',     extraDigit(9000) === 9);
t('18 \u2192 9',       extraDigit(18) === 9);
t('0 \u2192 0',        extraDigit(0) === 0);

console.log('\n[ctrl \u00b7 privado, sin chat_id]');
{
  const tg = 123456789;
  const ex = extraDigit(tg);   // usa telegram_id
  const r = parseUrl(`/CDCI/ctrl/${ex}/users/${tg}=abc`);
  t('ok',                r.ok);
  if (r.ok) {
    t('kind=ctrl',       r.url.kind === 'ctrl');
    t('chat_id null',    r.url.chatId === null);
    t('extra OK',        r.url.extra === ex);
    t('extraName',       r.url.extraName === 'jupiter' || r.url.extraName !== null);
    t('name_page',       r.url.namePage === 'users');
    t('token',           r.url.token === 'abc');
  }
}

console.log('\n[ctrl \u00b7 RECHAZA si trae chat_id]');
{
  const tg = 123456789;
  const ex = extraDigit(tg);
  const r = parseUrl(`/CDCI/-100123/ctrl/${ex}/users/${tg}=abc`);
  t('rechaza',                !r.ok);
  if (!r.ok) t('reason=ctrl_requires_private', r.reason === 'ctrl_requires_private');
}

console.log('\n[admin \u00b7 grupo, con chat_id]');
{
  const chat = -1001234567890;
  const ex = extraDigit(chat);   // usa chat_id
  const tg = 987654321;
  const r = parseUrl(`/CDCI/${chat}/admin/${ex}/home/${tg}=xyz`);
  t('ok',              r.ok);
  if (r.ok) {
    t('kind=admin',    r.url.kind === 'admin');
    t('chat_id',       r.url.chatId === chat);
    t('extra OK',      r.url.extra === ex);
    t('extraName',     r.url.extraName !== null);
  }
}

console.log('\n[admin \u00b7 RECHAZA si NO trae chat_id]');
{
  const tg = 123456;
  const r = parseUrl(`/CDCI/admin/5/home/${tg}=xyz`);
  t('rechaza',                 !r.ok);
  if (!r.ok) t('reason=admin_requires_group', r.reason === 'admin_requires_group');
}

console.log('\n[admin \u00b7 RECHAZA si extra usa telegram_id]');
{
  const chat = -100999;
  const tg = 987654321;
  const wrongEx = extraDigit(tg);   // correcto sería extraDigit(chat)
  const correctEx = extraDigit(chat);
  if (wrongEx !== correctEx) {
    const r = parseUrl(`/CDCI/${chat}/admin/${wrongEx}/home/${tg}=xyz`);
    t('rechaza',              !r.ok);
    if (!r.ok) t('reason=extra_mismatch', r.reason === 'extra_mismatch');
  } else {
    console.log('  (skip: chat y tg dan mismo extra)');
  }
}

console.log('\n[stats \u00b7 sin chat_id]');
{
  const tg = 555555;
  const r = parseUrl(`/CDCI/stats/overview/${tg}=tok`);
  t('ok',                r.ok);
  if (r.ok) {
    t('kind=stats',      r.url.kind === 'stats');
    t('extra null',      r.url.extra === null);
    t('chat_id null',    r.url.chatId === null);
  }
}

console.log('\n[stats \u00b7 con chat_id]');
{
  const tg = 555555;
  const r = parseUrl(`/CDCI/-100/stats/overview/${tg}=tok`);
  t('ok',                r.ok);
  if (r.ok) t('chat_id', r.url.chatId === -100);
}

console.log('\n[stealth \u00b7 sin chat_id]');
{
  const tg = 111222;
  const r = parseUrl(`/CDCI/stealth/login/${tg}=s`);
  t('ok',                r.ok);
  if (r.ok) t('kind=stealth', r.url.kind === 'stealth');
}

console.log('\n[game \u00b7 sin chat_id]');
{
  const tg = 777888;
  const r = parseUrl(`/ADOE/truco/${tg}=tok`);
  t('ok',                r.ok);
  if (r.ok) {
    t('kind=game',       r.url.kind === 'game');
    t('game_page=truco', r.url.gamePage === 'truco');
    t('chat_id null',    r.url.chatId === null);
  }
}

console.log('\n[game \u00b7 con chat_id + query]');
{
  const tg = 123;
  const r = parseUrl(`/ADOE/-100999/blackjack/${tg}=xyz?round=3`);
  t('ok',                r.ok);
  if (r.ok) {
    t('chat_id',         r.url.chatId === -100999);
    t('game_page',       r.url.gamePage === 'blackjack');
    t('query',           r.url.query === 'round=3');
  }
}

console.log('\n[errores]');
t('vac\u00edo',              !parseUrl('/').ok);
t('1 seg',              !parseUrl('/CDCI').ok);
t('2 segs',             !parseUrl('/CDCI/ctrl').ok);
t('hexa malo',          !parseUrl('/XYZ/ctrl/5/x/123=t').ok);
t('tg_id malo',         !parseUrl('/CDCI/ctrl/5/x/0=t').ok);
t('extra no d\u00edgito',    !parseUrl('/CDCI/ctrl/X/x/123=t').ok);

console.log(`\n${pass} pass, ${fail} fail`);
if (fail > 0) process.exit(1);
