const fs = require("fs");
const path = require("path");
const { createCanvas, registerFont, deregisterAllFonts } = require("canvas");

const OUTPUT_FILE = "alsh-logo.png";
const WIDTH = 2400;
const HEIGHT = 800;

const BACKGROUND = "rgba(0,0,0,0)";
const TEXT_COLOR = "#FFFFFF";

const FONT_FAMILY = "Georgia";
const FONT_WEIGHT = "700";
const FONT_STYLE = "normal";

const SIZE_MAIN = 320;
const SIZE_AI = 250;
const BASELINE_Y = 520;

const LETTER_SPACING = 10;
const DOT_TO_AI_SPACING = 14;
const EXTRA_TRACKING = 0;

const fontsDir = path.join(__dirname, "fonts");
const exploraPath = process.env.EXPLORA_FONT_PATH || path.join(fontsDir, "Explora-Regular.ttf");

// Give the custom font a unique alias so Pango/fontconfig cannot confuse it
const EXPLORA_ALIAS = "ExploraLogoCustom";

deregisterAllFonts();

let hasExplora = false;
if (fs.existsSync(exploraPath)) {
  registerFont(exploraPath, {
    family: EXPLORA_ALIAS
  });
  hasExplora = true;
  console.log(`Loaded custom font: ${exploraPath}`);
} else {
  console.warn(`Missing font file: ${exploraPath}`);
}

const PARTS = [
  { text: "A", fontSize: SIZE_MAIN, dx: 0 },
  {
    text: "L",
    fontSize: 360,
    dx: 28,
    family: hasExplora ? EXPLORA_ALIAS : "Times New Roman",
    yOffset: 10,
    // use a raw font string for the custom L so there is less font-matching ambiguity
    fontString: hasExplora
        ? `360px "${EXPLORA_ALIAS}"`
        : `normal 700 360px "Times New Roman"`
  },
  { text: "S", fontSize: SIZE_MAIN, dx: 18 },
  { text: "H", fontSize: SIZE_MAIN, dx: LETTER_SPACING },
  { text: ".", fontSize: SIZE_MAIN, dx: LETTER_SPACING },
  {
    text: "ai",
    fontSize: SIZE_AI,
    dx: DOT_TO_AI_SPACING,
    yOffset: 0,
    family: "Arial",
    style: "normal",
    weight: "700",
  },
];

function setFont(ctx, part) {
  if (part.fontString) {
    ctx.font = part.fontString;
    return;
  }

  const size = part.fontSize;
  const family = part.family || FONT_FAMILY;
  const weight = part.weight || FONT_WEIGHT;
  const style = part.style || FONT_STYLE;
  ctx.font = `${style} ${weight} ${size}px "${family}"`;
}

function measurePart(ctx, part) {
  setFont(ctx, part);
  return ctx.measureText(part.text).width * (part.stretchX || 1);
}

const canvas = createCanvas(WIDTH, HEIGHT);
const ctx = canvas.getContext("2d");

ctx.clearRect(0, 0, WIDTH, HEIGHT);
ctx.fillStyle = BACKGROUND;
ctx.fillRect(0, 0, WIDTH, HEIGHT);

let totalWidth = 0;
for (let i = 0; i < PARTS.length; i++) {
  const part = PARTS[i];
  totalWidth += measurePart(ctx, part);
  if (i > 0) totalWidth += part.dx;
  totalWidth += EXTRA_TRACKING;
}

let x = Math.round((WIDTH - totalWidth) / 2);

ctx.fillStyle = TEXT_COLOR;
ctx.textBaseline = "alphabetic";

for (let i = 0; i < PARTS.length; i++) {
  const part = PARTS[i];

  if (i > 0) x += part.dx + EXTRA_TRACKING;

  const y = BASELINE_Y + (part.yOffset || 0);

  setFont(ctx, part);

  const stretchX = part.stretchX || 1;
  if (stretchX !== 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(stretchX, 1);
    ctx.fillText(part.text, 0, 0);
    ctx.restore();
  } else {
    ctx.fillText(part.text, x, y);
  }

  x += measurePart(ctx, part);
}

fs.writeFileSync(OUTPUT_FILE, canvas.toBuffer("image/png"));
console.log(`Wrote ${OUTPUT_FILE}`);