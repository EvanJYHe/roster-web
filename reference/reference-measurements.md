# Roster landing reference measurement

Reference: `/Users/evanhe/.codex/attachments/12f23fd3-04db-4eea-8415-95a2fcb2c367/image-1.png`

The source image is 1,672 × 941 px, RGB, with a top-left `(0, 0)` origin. All measurements below are in source-image pixels. The machine-readable version is [reference-constraints.json](./reference-constraints.json); it is the source of truth for the geometry assertions.

## Measurement method

The corridor rows were measured from the luminance edge response of the source image. For each visible line, a vertical edge trace was followed from the wall’s outer edge for `u=0..350` and fitted to `y = outerY + slope × u`. The strong traces have a residual RMS below 0.5 px over that measured section. The first/top trace is intentionally marked low confidence because the upper fade suppresses most of it.

Logo boxes are luminance-thresholded raster bounds (`luminance >=45`) grouped with a 2 px neighborhood. These are visible pixel bounds, not source SVG view boxes. A logo whose center is in the central black/hero region is either occluded or below a reliable threshold; the JSON records the visible high-confidence clusters and marks approximate/partial clusters explicitly.

The logo boxes are diagnostic evidence, not implementation coordinates. The
implementation intentionally discards these AI-generated per-instance
inconsistencies and rebuilds marks from normalized wall-depth slots, local row
height, brand aspect ratios, and the row's derived affine shear.
The repeated field uses icon-only marks with one exact shared optical height.
Perspective is expressed through wall placement, row geometry, opacity, and
occlusion; brand-specific wordmark treatments and per-instance size overrides
are intentionally absent.

## Viewport and foreground

| Element | Measured bounds / position |
| --- | --- |
| Viewport | `1672 × 941` |
| Brand mark visible raster | `x=76..97, y=45..74` (large header treatment using the square app mark) |
| Brand word visible raster | `x=133..218, y=49..73` (`roster`, lowercase) |
| Docs visible raster | `x=1218..1260, y=61..78` |
| GitHub visible raster | `x=1318..1379, y=61..78` |
| Header Get Started border | `x=1432..1622, y=36..100` |
| Update pill visible raster | `x=639..1029, y=188..247`; visual box approximately `x=638..1031, y=188..248` |
| Update dot | `x=667..680, y=212..227` |
| Update label text | `x=704..812, y=211..227` |
| Update message text | `x=839..978, y=211..227` |
| Update arrow | `x=992..1003, y=211..227` |
| Hero title line 1 | `The self-learning`; visible raster `x=446..1251, y=307..391` |
| Hero title line 2 | `tool router for MCP.`; visible raster `x=373..1319, y=424..508` |
| Description line 1 | `Roster finds the right tools when needed,`; visible raster `x=616..1079, y=563..587` |
| Description line 2 | `learns from what works, and works with any MCP client.`; visible raster `x=538..1167, y=601..625` |
| Primary action | visual box approximately `x=569..832, y=675..759`; solid fill threshold bounds `x=570..831, y=675..759` |
| Secondary action | visual box approximately `x=853..1111, y=675..758`; border threshold bounds `x=853..1110, y=676..756` |
| Action gap | `21 px` between the two visual boxes |

The title, description, pill, and action groups are centered at approximately `x=836`. The title line gap between raster boxes is 32 px. The foreground is laid over the corridor; it is not part of the corridor measurement.

## Corridor shape

There are eight visible wall bands on each side. Rows 1–7 have both a visible outer-edge panel and a visible gap after them. Row 8 is partial: its top boundary is below the outer viewport edge but slopes upward toward the center, so its inner portion is visible near the bottom corners.

The side walls use separate outer-distance coordinates:

- left: `u=x`, outer edge `x=0`;
- right: `u=1671-x`, outer edge `x=1671`;
- inner geometric endpoint: `x=836`;
- the visible horizon/occlusion zone is approximately `y=416..436`.

Each panel tapers sharply toward the inner endpoint. The line extensions are not all perfectly identical at the horizon because the source image has a non-flat, softly occluded perspective field; reproduce the measured line paths rather than replacing them with a single centered radial gradient.

### Row and gap summary

The height columns are sampled at outer edge (`u=0`), `u=300`, `u=600`, and inner geometry (`u=835`). Gap columns are sampled at outer edge, `u=300`, and `u=600`.

| Row | Left panel height | Right panel height | Gap after, left | Gap after, right |
| ---: | --- | --- | --- | --- |
| 1 | `84.6 / 54.5 / 24.3 / 0.8` | `88.7 / 58.2 / 27.7 / 3.8` | `16.2 / 9.8 / 3.4` | `15.8 / 9.2 / 2.6` |
| 2 | `78.6 / 50.8 / 23.0 / 1.3` | `74.8 / 48.6 / 22.4 / 1.8` | `18.2 / 11.3 / 4.4` | `17.7 / 10.6 / 3.5` |
| 3 | `79.9 / 54.0 / 28.0 / 7.7` | `81.5 / 52.4 / 23.4 / 0.7` | `22.8 / 14.7 / 6.5` | `22.8 / 13.7 / 4.6` |
| 4 | `89.5 / 58.4 / 27.4 / 3.1` | `89.9 / 57.0 / 24.1 / -1.7` | `25.0 / 16.4 / 7.8` | `24.3 / 15.7 / 7.1` |
| 5 | `89.4 / 59.4 / 29.4 / 5.9` | `86.8 / 56.3 / 25.8 / 1.9` | `32.9 / 20.7 / 8.6` | `30.3 / 19.4 / 8.6` |
| 6 | `105.5 / 71.7 / 37.9 / 11.4` | `103.3 / 69.7 / 36.0 / 9.6` | `45.6 / 29.7 / 13.9` | `43.3 / 26.9 / 10.5` |
| 7 | `113.8 / 76.9 / 39.9 / 11.0` | `110.5 / 71.1 / 31.7 / 0.8` | `45.97 / 30.0 / 14.8` | `45.78 / 30.0 / 15.0` |
| 8 | partial; top boundary `L14`/`R14` only | partial; top boundary `L14`/`R14` only | offscreen | offscreen |

The alternating boundary/gap positions at the outer edges are:

- left: `100.0, 184.6, 200.7, 279.3, 297.5, 377.4, 400.2, 489.7, 514.7, 604.1, 637.0, 742.5, 788.1, 901.9, 947.9`;
- right: `100.0, 188.7, 204.5, 279.3, 297.1, 378.5, 401.4, 491.3, 515.6, 602.4, 632.7, 736.0, 779.3, 889.8, 935.6`.

The full line equations, sampled coordinates, four corner coordinates, and tolerances are in the JSON file.

## Logo placement

The visible marks follow each wall row rather than a page grid. Their centers move along the row direction, and their sizes decrease toward the inner/horizon side. The outer-wall measurements below are the clearest, least-occluded examples; the JSON contains the corresponding bounds and distances for both walls.

| Side / row | Visible logo centers, in outer-to-inner order `(x,y)` | Notes |
| --- | --- | --- |
| Left 1 | Google `(46.5,163.1)`, Apple `(136.7,190.7)`, OpenAI `(201.9,214.3)` | all high-confidence |
| Left 2 | Microsoft `(68.0,249.0)`, GitHub `(176.5,273.1)`, Notion `(251.6,290.7)`, Microsoft `(306.3,302.5)` | final mark dimmer |
| Left 3 | Apple `(47.1,341.5)`, OpenAI `(143.2,349.9)`, GitHub `(242.3,359.8)`, Google `(330.1,369.2)` | GitHub cluster medium confidence |
| Left 4 | Microsoft `(102.0,442.0)`, Google `(239.0,438.9)`, Apple `(313.2,434.9)` | row is nearly level at the center |
| Left 5 | Notion `(85.0,544.9)`, Vercel `(208.0,526.5)`, AWS `(299.3,514.0)` | row slopes upward toward inner wall |
| Left 6 | Apple `(42.5,676.7)`, OpenAI `(154.4,642.9)`, AWS `(255.0,612.2)`, Vercel `(344.3,586.2)` | lower vignette begins to affect the outside |
| Left 7 | Google `(84.7,804.2)`, Notion `(232.0,739.0)`, Microsoft `(330.6,688.4)` | Google and Stripe-like tail marks are most visible outside |
| Left 8 | Stripe `(163.0,901.5)` | partial row; bottom edge is offscreen |
| Right 1 | Stripe `(1471.6,218.1)`, Microsoft `(1549.8,193.7)`, OpenAI `(1645.2,160.2)` | top fade; Stripe is medium confidence |
| Right 2 | AWS `(1412.8,298.9)`, Google `(1479.6,282.9)`, Apple `(1631.8,247.7)` | high-confidence outer marks |
| Right 3 | GitHub `(1362.2,369.5)`, Google `(1436.5,362.5)`, Notion `(1517.5,352.3)`, OpenAI `(1615.5,341.7)` | all are on the same tapered band |
| Right 4 | Apple `(1438.4,436.8)`, Notion `(1513.4,439.3)`, OpenAI `(1615.2,442.6)` | nearly horizontal central row |
| Right 5 | Vercel `(1429.7,518.6)`, Microsoft `(1523.0,535.4)`, Google `(1653.6,555.7)` | Google is clipped at the outer edge |
| Right 6 | OpenAI `(1389.3,598.7)`, Vercel `(1463.8,621.1)`, Microsoft `(1571.4,654.3)`, Apple `(1663.3,678.7)` | Apple is clipped at the outer edge |
| Right 7 | GitHub `(1353.1,682.2)`, Google `(1437.5,722.2)`, Notion `(1528.9,764.5)`, Microsoft `(1580.9,790.6)` | lower row is darker toward center |
| Right 8 | GitHub `(1327.9,764.4)`, Notion `(1397.2,811.5)`, Microsoft `(1487.8,871.9)`, Apple `(1577.0,924.5)` | partial row; bottom is offscreen |

For every listed mark, the JSON records a measured visible bounding box, row-edge distances, and confidence. The local row edge is the fitted top/bottom line evaluated at the logo center’s wall distance `u`; it is not a global page margin. The logo field is an affine-sheared plane, not a collection of rotated cards: in screen coordinates each mark uses `matrix(1, s, 0, 1, x, y)`, where `s` is the signed center-line slope of that row. This keeps vertical glyph strokes and square sides vertical while the baseline follows the strip. Left rows use the left-wall slope; right rows use its screen-x mirror.

### Recovered logo matrices

The row shear is the mean of the fitted top and bottom boundary slopes. Row 8 uses the measured partial-wall continuation (`-0.68` left, `-0.66` right) for its second edge. The values below are the `b` coefficient in SVG’s `matrix(a,b,c,d,e,f)` notation.

| Row | Left `b` | Right `b` |
| ---: | ---: | ---: |
| 1 | `0.328815` | `-0.339200` |
| 2 | `0.210990` | `-0.222720` |
| 3 | `0.098505` | `-0.106905` |
| 4 | `-0.023585` | `0.026745` |
| 5 | `-0.153960` | `0.161095` |
| 6 | `-0.300755` | `0.304255` |
| 7 | `-0.471590` | `0.480655` |
| 8 | `-0.631885` | `0.629635` |

## Fade and negative space

The fade is corridor-relative:

1. The upper fade suppresses the top boundary and the first row before the wall reaches the high-contrast middle rows.
2. Every row panel and its neighboring gap narrows toward the inner/horizon endpoint. The gap itself is therefore a perspective feature, not merely a transparent strip of constant page height.
3. Line and logo contrast is highest near the outer wall, then falls as `u` increases. A representative row-line contrast falls from roughly `9..15` near `u=0` to `3..7` around `u=200..300`, to approximately `0..2` by `u=350..450`, and to zero/near-zero in the central occluded zone.
4. The central black field occupies the corridor opening around `x=700..970`, with the visible line endpoints clustered around `y=416..436`. The blackening follows those endpoints and the wall angle; it does not apply the same opacity to equal-radius points on the outer wall.
5. A lower vignette reduces the bottom rows, while the outer side walls retain more structure than the center. This is why the same nominal row width cannot be rendered with one flat opacity across the page.

The JSON includes the sampled line-contrast table used by the fade assertions.

## Constraints to carry into implementation

- Keep the first reproduction locked to `1672 × 941`.
- Use explicit row paths or equivalent fixed geometry before generalizing.
- Preserve both the panel surfaces and the varying negative-space gaps.
- Place logos in wall coordinates and apply row-direction rotation/skew; do not use a flat page grid.
- Fade each wall/row group as a function of wall distance and row geometry, then apply the central occlusion zone.
- Validate the rendered screenshot against the measured rows, gaps, logo centers/sizes, and foreground raster bounds with the tolerances in `reference-constraints.json`.
