export function getDarkerColor(hex: string, amount: number = 0.5): string {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const num = parseInt(hex, 16);
  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;

  // Apply the darkening factor
  r = Math.max(0, Math.floor(r * (1 - amount)));
  g = Math.max(0, Math.floor(g * (1 - amount)));
  b = Math.max(0, Math.floor(b * (1 - amount)));

  // Convert back to hex and pad with zeroes if needed
  const newHex =
    '#' +
    [r, g, b]
      .map((x) => x.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase();

  return newHex;
}
