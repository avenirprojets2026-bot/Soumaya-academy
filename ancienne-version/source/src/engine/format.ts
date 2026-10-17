/** Formate un nombre à la française : 12 345,6 */
export function fr(n: number, maxDecimals = 3): string {
  const rounded = Math.round(n * 10 ** maxDecimals) / 10 ** maxDecimals;
  const [i, d] = rounded.toString().split('.');
  const neg = i.startsWith('-');
  const intPart = (neg ? i.slice(1) : i).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return (neg ? '-' : '') + intPart + (d ? ',' + d : '');
}
/** Normalise une saisie : espaces retirés, virgule → point */
export function parseNum(s: string): number | null {
  const c = s.replace(/[\s  ]/g, '').replace(',', '.');
  if (c === '' || !/^-?\d*\.?\d+$/.test(c)) return null;
  return Number(c);
}
