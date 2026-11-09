// One-off, from a scratch dir with d3-geo, topojson-client, world-atlas and
// i18n-iso-countries installed:  node build-world-map.mjs world-110m.geo.json
// Builds public/maps/world-110m.geo.json for ECharts: Natural Earth countries (via
// world-atlas, public domain) as GeoJSON, feature name = ISO 3166-1 alpha-2. 110m
// outlines, plus a small dot for each country 110m leaves out (Singapore, Hong Kong,
// Malta, ...), placed at its 50m centroid, so every country can be coloured.
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';

import { geoCentroid } from 'd3-geo';
import countries from 'i18n-iso-countries';
import { feature } from 'topojson-client';
const require = createRequire(import.meta.url);
const load = (res) => {
  const topo = JSON.parse(
    readFileSync(require.resolve(`world-atlas/${res}.json`), 'utf8'),
  );
  return feature(topo, topo.objects.countries).features;
};
const round = (c) =>
  typeof c[0] === 'number'
    ? [Math.round(c[0] * 100) / 100, Math.round(c[1] * 100) / 100]
    : c.map(round);
const code = (f) => {
  const a2 = f.id && countries.numericToAlpha2(f.id);
  return a2 && a2 !== 'AQ' ? a2 : null;
};
const features = load('countries-110m').flatMap((f) => {
  const a2 = code(f);
  return a2
    ? [
        {
          geometry: {
            ...f.geometry,
            coordinates: round(f.geometry.coordinates),
          },
          properties: { name: a2 },
          type: 'Feature',
        },
      ]
    : [];
});
const have = new Set(features.map((f) => f.properties.name));
const R = 0.9; // degrees
const dot = ([lon, lat]) => [
  Array.from({ length: 13 }, (_, i) => {
    const a = (i / 12) * 2 * Math.PI;
    return [
      Math.round(
        (lon + (R * Math.cos(a)) / Math.cos((lat * Math.PI) / 180)) * 100,
      ) / 100,
      Math.round((lat + R * Math.sin(a)) * 100) / 100,
    ];
  }),
];
let dots = 0;
for (const f of load('countries-50m')) {
  const a2 = code(f);
  if (!a2 || have.has(a2)) continue;
  have.add(a2);
  features.push({
    geometry: { coordinates: dot(geoCentroid(f)), type: 'Polygon' },
    properties: { name: a2 },
    type: 'Feature',
  });
  dots += 1;
}
writeFileSync(
  process.argv[2],
  JSON.stringify({ features, type: 'FeatureCollection' }),
);
console.log(features.length, 'countries,', dots, 'as dots');
