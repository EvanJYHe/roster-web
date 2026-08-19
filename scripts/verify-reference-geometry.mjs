import fs from "node:fs/promises";
import sharp from "sharp";

const constraintsPath = new URL("../reference/reference-constraints.json", import.meta.url);
const constraints = JSON.parse(await fs.readFile(constraintsPath, "utf8"));

function argumentValue(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const imagePath =
  argumentValue("--image") ||
  process.env.REFERENCE_IMAGE ||
  constraints.source.path;

const fail = (message) => {
  throw new Error(`[reference] ${message}`);
};

const near = (actual, expected, tolerance, label) => {
  if (Math.abs(actual - expected) > tolerance) {
    fail(`${label}: expected ${expected}, got ${actual}`);
  }
};

const { data, info } = await sharp(imagePath)
  .raw()
  .toBuffer({ resolveWithObject: true });

near(info.width, constraints.viewport.width, 0, "viewport width");
near(info.height, constraints.viewport.height, 0, "viewport height");

const pixelCount = info.width * info.height;
const luminance = new Float32Array(pixelCount);
for (let index = 0, channel = 0; index < pixelCount; index += 1, channel += info.channels) {
  luminance[index] =
    0.2126 * data[channel] + 0.7152 * data[channel + 1] + 0.0722 * data[channel + 2];
}

const pixel = (x, y) => luminance[y * info.width + x];

function edgeResponse(x, y) {
  if (x < 0 || x >= info.width || y < 3 || y >= info.height - 3) return -Infinity;
  return pixel(x, y) - 0.5 * (pixel(x, y - 3) + pixel(x, y + 3));
}

function traceBoundary(side, boundary) {
  const points = [];
  for (let u = 0; u <= 350; u += 1) {
    const x = side === "left" ? u : info.width - 1 - u;
    const expectedY = boundary.outerY + boundary.slope * u;
    let best = { y: Math.round(expectedY), response: -Infinity };
    for (let y = Math.floor(expectedY - 4); y <= Math.ceil(expectedY + 4); y += 1) {
      const response = edgeResponse(x, y);
      if (response > best.response) best = { y, response };
    }
    points.push({ u, y: best.y, response: best.response });
  }
  return points;
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor((sorted.length - 1) / 2)];
}

function traceSummary(side, boundary) {
  const points = traceBoundary(side, boundary);
  const residuals = points.map((point) => point.y - (boundary.outerY + boundary.slope * point.u));
  const rms = Math.sqrt(residuals.reduce((sum, value) => sum + value ** 2, 0) / residuals.length);
  const coverage = points.filter((point) => point.response > 2).length / points.length;
  return {
    rms,
    coverage,
    outerMedianResponse: median(points.slice(0, 50).map((point) => point.response)),
    innerMedianResponse: median(points.slice(300, 350).map((point) => point.response)),
  };
}

function lineAt(boundary, u) {
  return boundary.outerY + boundary.slope * u;
}

function boundaryFor(side, id) {
  return constraints.corridor[side].boundaries.find((boundary) => boundary.id === id);
}

function rowHeight(side, row, u) {
  const [topId, bottomId] = constraints.corridor.rows[row - 1][`${side}Boundaries`];
  return lineAt(boundaryFor(side, bottomId), u) - lineAt(boundaryFor(side, topId), u);
}

function assertRowGeometry() {
  const tolerance = constraints.assertionTolerances.rowHeightPx;
  for (const row of constraints.corridor.rows) {
    if (row.row === 8) continue;
    for (const side of ["left", "right"]) {
      const expected = row[`${side}HeightAtOuterU300U600Inner`];
      for (const [index, u] of [0, 300, 600, 835].entries()) {
        near(rowHeight(side, row.row, u), expected[index], tolerance, `${side} row ${row.row} height at u=${u}`);
      }
    }
  }
}

function assertBoundaryTraces() {
  const tolerance = constraints.assertionTolerances.strongBoundaryRmsPx;
  for (const side of ["left", "right"]) {
    for (const boundary of constraints.corridor[side].boundaries) {
      if (boundary.confidence?.startsWith("low")) continue;
      const summary = traceSummary(side, boundary);
      if (summary.rms > tolerance) {
        fail(`${side} ${boundary.id} RMS ${summary.rms.toFixed(2)} exceeds ${tolerance}`);
      }
      if (summary.coverage < 0.72) {
        fail(`${side} ${boundary.id} trace coverage ${summary.coverage.toFixed(2)} is too low`);
      }
    }
  }
}

function assertGaps() {
  const tolerance = constraints.assertionTolerances.gapPx;
  for (const row of constraints.corridor.rows.slice(0, 6)) {
    const next = constraints.corridor.rows[row.row];
    for (const side of ["left", "right"]) {
      const currentBottom = boundaryFor(side, row[`${side}Boundaries`][1]);
      const nextTop = boundaryFor(side, next[`${side}Boundaries`][0]);
      const expected = row.gapAfterAtOuterU300U600[side];
      for (const [index, u] of [0, 300, 600].entries()) {
        near(lineAt(nextTop, u) - lineAt(currentBottom, u), expected[index], tolerance, `${side} gap after row ${row.row} at u=${u}`);
      }
    }
  }
}

function thresholdBounds(x0, y0, x1, y1, threshold) {
  let minX = x1;
  let minY = y1;
  let maxX = x0;
  let maxY = y0;
  let count = 0;
  for (let y = y0; y <= y1; y += 1) {
    for (let x = x0; x <= x1; x += 1) {
      if (pixel(x, y) < threshold) continue;
      count += 1;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }
  return { minX, minY, maxX, maxY, count };
}

function assertForeground() {
  const foreground = constraints.foreground;
  const threshold = 120;
  const checks = [
    ["brandMarkRaster", foreground.header.brandMarkRaster, 120],
    ["brandWordRaster", foreground.header.brandWordRaster, 120],
    ["docsRaster", foreground.header.docsRaster, 120],
    ["githubRaster", foreground.header.githubRaster, 120],
    ["updatePill", foreground.updatePill.outerRaster, 30],
    ["titleLine1", foreground.heroTitle.line1Raster, 120],
    ["titleLine2", foreground.heroTitle.line2Raster, 120],
    ["descriptionLine1", foreground.description.line1Raster, 120],
    ["descriptionLine2", foreground.description.line2Raster, 120],
    ["primaryAction", foreground.heroActions.primaryRasterFill, 120],
    ["secondaryAction", foreground.heroActions.secondaryBorder, 30],
  ];
  const tolerance = constraints.assertionTolerances.foregroundRasterBoundsPx;
  for (const [label, bounds, elementThreshold] of checks) {
    const measured = thresholdBounds(...bounds, elementThreshold);
    if (!measured.count) fail(`${label}: no bright pixels found`);
    near(measured.minX, bounds[0], tolerance, `${label} minX`);
    near(measured.minY, bounds[1], tolerance, `${label} minY`);
    near(measured.maxX, bounds[2], tolerance, `${label} maxX`);
    near(measured.maxY, bounds[3], tolerance, `${label} maxY`);
  }
}

function assertFadeDirection() {
  const left = traceSummary("left", boundaryFor("left", "L7"));
  const right = traceSummary("right", boundaryFor("right", "R6"));
  if (left.outerMedianResponse <= left.innerMedianResponse) fail("left corridor line does not fade toward the inner wall");
  if (right.outerMedianResponse <= right.innerMedianResponse) fail("right corridor line does not fade toward the inner wall");
}

assertBoundaryTraces();
assertRowGeometry();
assertGaps();
assertForeground();
assertFadeDirection();

console.log(`reference geometry verified: ${imagePath}`);
console.log(`viewport: ${info.width}x${info.height}`);
console.log("corridor: 7 full panels + 1 partial panel per side, with tapered gaps");
console.log("foreground: header, update pill, title, description, and actions within measured bounds");
