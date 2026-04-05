// make-logo.js
//
// Generate a transparent PNG logo for: AlSH.ai
// with manual spacing so the lowercase `l` does NOT overlap the `S`.
//
// Install:
//   npm install
//
// Run:
//   node make-logo.js
//
// Output:
//   ./alsh-logo.png

const fs = require("fs");
const { createCanvas, registerFont } = require("canvas");

// --------------------
// CONFIG
// --------------------

const OUTPUT_FILE = "alsh-logo.png";
const WIDTH = 2400;
const HEIGHT = 800;

// Transparent background
const BACKGROUND = "rgba(0,0,0,0)";
const TEXT_COLOR = "#FFFFFF";

// Pick a font you actually have.
// If you have a brand font file, put it next to this script and uncomment registerFont.
// registerFont("./YourBrandFont.ttf", { family: "BrandFont" });
// const FONT_FAMILY = "BrandFont";

const FONT_FAMILY = "Arial";
const FONT_WEIGHT = "700";

const SIZE_MAIN = 320;
const SIZE_AI = 250;

// Baseline
const BASELINE_Y = 520;

// Manual character spacing.
// This is the whole point: move the `l` farther right from the `S`.
const PARTS = [
  { text: "A", fontSize: SIZE_MAIN, dx: 0 },
  { text: "l", fontSize: SIZE_MAIN, dx: 90 },   // increase this to push l farther from A/S region
  { text: "S", fontSize: SIZE_MAIN, dx: 130 },  // spacing after l
  { text: "H", fontSize: SIZE_MAIN, dx: 30 },
  { text: ".", fontSize: SIZE_MAIN, dx: 10 },
  { text: "ai", fontSize: SIZE_AI, dx: 20, yOffset: 8 }
];

// Add overall letter tracking if you want more openness.
const EXTRA_TRACKING = 0;

// --------------------
// HELPERS
// --------------------

function setFont(ctx, size) {
  ctx.font = `${FONT_WEIGHT} ${size}px "${FONT_FAMILY}"`;
}

function measurePart(ctx, part) {
  setFont(ctx, part.fontSize);
  const metrics = ctx.measureText(part.text);
  return metrics.width;
}

// --------------------
// DRAW
// --------------------

const canvas = createCanvas(WIDTH, HEIGHT);
const ctx = canvas.getContext("2d");

// Transparent background
ctx.clearRect(0, 0, WIDTH, HEIGHT);
ctx.fillStyle = BACKGROUND;
ctx.fillRect(0, 0, WIDTH, HEIGHT);

// Measure total width first so we can center it.
let totalWidth = 0;
for (let i = 0; i < PARTS.length; i++) {
  const part = PARTS[i];
  totalWidth += measurePart(ctx, part);
  if (i > 0) totalWidth += part.dx;
  totalWidth += EXTRA_TRACKING;
}

let x = Math.round((WIDTH - totalWidth) / 2);

// Draw text
ctx.fillStyle = TEXT_COLOR;
ctx.textBaseline = "alphabetic";

for (let i = 0; i < PARTS.length; i++) {
  const part = PARTS[i];
  if (i > 0) x += part.dx + EXTRA_TRACKING;

  setFont(ctx, part.fontSize);
  const y = BASELINE_Y + (part.yOffset || 0);
  ctx.fillText(part.text, x, y);

  x += measurePart(ctx, part);
}

// Save PNG
const buffer = canvas.toBuffer("image/png");
fs.writeFileSync(OUTPUT_FILE, buffer);

console.log(`Wrote ${OUTPUT_FILE}`);
