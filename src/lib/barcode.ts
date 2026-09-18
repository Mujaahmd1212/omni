/**
 * Barcode Generation & Rendering Engine
 * Supports Code 128 (Subset B & C) and EAN-13 formats with precise vector SVG rendering.
 * Suitable for high-density thermal label printers (203/300 DPI) and receipt printers.
 */

// Code 128 encoding tables (widths of 3 bars and 3 spaces)
const CODE128_PATTERNS: string[] = [
  "212222", "222122", "222221", "121223", "121322", "131222", "122213", "122312", "132212", "221213", // 0-9
  "221312", "231212", "112232", "122132", "122231", "113222", "123122", "123221", "223211", "221132", // 10-19
  "221231", "213212", "223112", "312131", "311222", "321122", "321221", "312212", "322112", "322211", // 20-29
  "212123", "212321", "232121", "111323", "131123", "131321", "112313", "132113", "132311", "211313", // 30-39
  "231113", "231311", "112133", "112331", "132131", "113123", "113321", "133121", "313121", "211331", // 40-49
  "231131", "213113", "213311", "213131", "311123", "311321", "331121", "312113", "312311", "332111", // 50-59
  "314111", "221411", "431111", "111224", "111422", "121124", "121421", "141122", "141221", "112214", // 60-69
  "112412", "122114", "122411", "142112", "142211", "241211", "221114", "413111", "241112", "134111", // 70-79
  "111242", "121142", "121241", "114212", "124112", "124211", "411212", "421112", "421211", "212141", // 80-89
  "214121", "412121", "111143", "111341", "131141", "114113", "114311", "411113", "411311", "113141", // 90-99
  "114131", "311141", "411131", "211412", "211214", "211232", "2331112" // 100-106 (106 is STOP pattern: 2331112)
];

const START_CODE_B = 104;
const STOP_CODE = 106;

/**
 * Encodes an ASCII string into Code 128 bar-space modules.
 */
export function encodeCode128(text: string): { modules: number[]; checksum: number } {
  const sanitized = text.replace(/[^\x20-\x7E]/g, ''); // ASCII 32 to 126
  if (!sanitized) {
    return { modules: [2, 1, 1, 2, 3, 2, 2, 3, 3, 1, 1, 1, 2], checksum: 0 };
  }

  const values: number[] = [START_CODE_B];
  let checksumSum = START_CODE_B;

  for (let i = 0; i < sanitized.length; i++) {
    const code = sanitized.charCodeAt(i) - 32;
    values.push(code);
    checksumSum += code * (i + 1);
  }

  const checksum = checksumSum % 103;
  values.push(checksum);
  values.push(STOP_CODE);

  // Convert pattern codes to widths
  const modules: number[] = [];
  for (const val of values) {
    const pattern = CODE128_PATTERNS[val] || CODE128_PATTERNS[0];
    for (let j = 0; j < pattern.length; j++) {
      modules.push(parseInt(pattern[j], 10));
    }
  }

  return { modules, checksum };
}

/**
 * Generates an SVG string representation of a Code 128 barcode
 */
export function generateBarcodeSvg({
  text,
  width = 240,
  height = 70,
  includeText = true,
  barColor = "#0f172a",
  textColor = "#0f172a",
  quietZone = 12
}: {
  text: string;
  width?: number;
  height?: number;
  includeText?: boolean;
  barColor?: string;
  textColor?: string;
  quietZone?: number;
}): string {
  const { modules } = encodeCode128(text);
  const totalBarModules = modules.reduce((acc, w) => acc + w, 0);
  const printableWidth = width - (quietZone * 2);
  const moduleWidth = printableWidth / totalBarModules;
  const barHeight = includeText ? height - 18 : height;

  let x = quietZone;
  let isBar = true;
  let paths = '';

  for (const w of modules) {
    const barW = w * moduleWidth;
    if (isBar) {
      paths += `<rect x="${x.toFixed(2)}" y="2" width="${barW.toFixed(2)}" height="${barHeight}" fill="${barColor}" />`;
    }
    x += barW;
    isBar = !isBar;
  }

  const textElement = includeText
    ? `<text x="${(width / 2).toFixed(2)}" y="${(height - 2).toFixed(2)}" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="600" fill="${textColor}" letter-spacing="1.5">${text}</text>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
    <rect width="${width}" height="${height}" fill="transparent" />
    ${paths}
    ${textElement}
  </svg>`;
}

/**
 * Calculates EAN-13 check digit
 */
export function calculateEan13Checksum(digits12: string): number {
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const num = parseInt(digits12[i], 10);
    sum += (i % 2 === 0) ? num : num * 3;
  }
  const mod = sum % 10;
  return mod === 0 ? 0 : 10 - mod;
}

/**
 * Generates an internal unique barcode for a product or variant.
 * Avoids GS1 confusion by using enterprise code format or internal prefix.
 */
export function generateUniqueBarcode(prefix: string = "200"): string {
  // Format: 200 (internal store prefix) + 9 random digits + checksum digit
  let middleDigits = '';
  for (let i = 0; i < 9; i++) {
    middleDigits += Math.floor(Math.random() * 10).toString();
  }
  const digits12 = `${prefix}${middleDigits}`;
  const checksum = calculateEan13Checksum(digits12);
  return `${digits12}${checksum}`;
}

/**
 * Generates an alphanumeric Code 128 SKU/barcode (e.g. HDW-849204)
 */
export function generateAlphaBarcode(prefix: string = "POS"): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix.toUpperCase()}-${timestamp}${random}`;
}
