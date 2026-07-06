/**
 * HSV 颜色对象 / HSV color object
 */
interface HSVColor {
  h: number;
  s: number;
  v: number;
}

/**
 * 将十六进制颜色转换为 HSV 格式 / Convert hex color to HSV format
 * @param hex - 十六进制颜色值 / Hex color value
 * @returns HSV 颜色对象 / HSV color object
 */
export function hexToHsv(hex: string): HSVColor {
  hex = hex.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  let h = 0,
    s = 0,
    v = max;

  const d = max - min;

  s = max === 0 ? 0 : d / max;

  if (max !== min) {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
  }

  return { h, s, v };
}

/**
 * 将 HSV 颜色转换为十六进制格式 / Convert HSV color to hex format
 * @param h - 色相 (0-360) 或 HSV 对象 / Hue (0-360) or HSV object
 * @param s - 饱和度 (0-1) / Saturation (0-1)
 * @param v - 明度 (0-1) / Value (0-1)
 * @returns 十六进制颜色值 / Hex color value
 */
export function hsvToHex(
  h: number | { h: number; s: number; v: number },
  s?: number,
  v?: number,
): string {
  if (typeof h === "object") {
    s = h.s;
    v = h.v;
    h = h.h;
  }

  const c = (v as number) * (s as number);
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = (v as number) - c;

  let r = 0,
    g = 0,
    b = 0;

  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  const toHex = (n: number) =>
    Math.round((n + m) * 255)
      .toString(16)
      .padStart(2, "0");

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
