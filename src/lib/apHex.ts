/** A-P Hex Codec · 0→A 1→B ... 9→J a→K b→L c→M d→N e→O f→P */
const HEX = '0123456789abcdef';
const AP  = 'ABCDEFGHIJKLMNOP';
const ENC: Record<string, string> = {};
const DEC: Record<string, string> = {};
for (let i = 0; i < 16; i++) { ENC[HEX[i]] = AP[i]; DEC[AP[i]] = HEX[i]; }

export function toAP(hexStr: string): string {
  return hexStr.toLowerCase().split('').map((c) => ENC[c] ?? c).join('');
}
export function fromAP(apStr: string): string {
  return apStr.toUpperCase().split('').map((c) => DEC[c] ?? c).join('');
}
export function intToAP(n: number): string {
  if (n < 0 || !Number.isInteger(n)) throw new Error('intToAP: >=0 integer');
  return toAP(n.toString(16));
}
export function apToInt(s: string): number { return parseInt(fromAP(s), 16); }
export function accessLevelToAP(level: number): string { return intToAP(level); }
export function apToAccessLevel(s: string): number      { return apToInt(s); }

const AP_RE = /^[A-Pa-p]+$/;
export function isValidAP(s: string): boolean { return AP_RE.test(s); }
