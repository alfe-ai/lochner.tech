// make-logo.js
// Generates a transparent curved L from Explora without canvas/pango.

const fs = require("fs/promises");
const path = require("path");
const opentype = require("opentype.js");
const { Resvg } = require("@resvg/resvg-js");

const WIDTH = 900;
const HEIGHT = 900;
const FONT_SIZE = 620;

async function main() {
  const fontPath = path.join(__dirname, "fonts", "Explora-Regular.ttf");
  const fontBuffer = await fs.readFile(fontPath);

  // Convert Node Buffer -> exact ArrayBuffer slice for opentype.js
  const arrayBuffer = fontBuffer.buffer.slice(
    fontBuffer.byteOffset,
    fontBuffer.byteOffset + fontBuffer.byteLength
  );

  const font = opentype.parse(arrayBuffer);
  const glyph = font.charToGlyph("L");

  if (!glyph) {
    throw new Error('Could not find glyph for "L"');
  }

  // Baseline placement
  const x = 120;
  const y = 700;

  const glyphPath = glyph.getPath(x, y, FONT_SIZE);

  // Build SVG path data. flipY helps convert font coordinates to SVG coords.
  const d = glyphPath.toPathData({
    flipY: true,
    flipYBase: y,
    optimize: true,
    decimalPlaces: 2,
  });

  const svg = `\n    <svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">\n      <path d="${d}" fill="#FFFFFF"/>\n    </svg>\n  `;

  await fs.writeFile(path.join(__dirname, "explora-l.svg"), svg, "utf8");

  const resvg = new Resvg(svg, {
    fitTo: {
      mode: "original",
    },
    background: "rgba(0,0,0,0)",
  });

  const pngBuffer = resvg.render().asPng();
  await fs.writeFile(path.join(__dirname, "explora-l.png"), pngBuffer);

  console.log("Wrote explora-l.svg and explora-l.png");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
