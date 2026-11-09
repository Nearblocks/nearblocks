// One-off, from a scratch dir with topojson-client, world-atlas and i18n-iso-countries installed:
//   node build-world-map.mjs world-110m.geo.json
// Builds public/maps/world-110m.geo.json for ECharts: Natural Earth 110m countries (via
// world-atlas, public domain) as GeoJSON, feature name = ISO 3166-1 alpha-2, coords rounded.
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';

import countries from 'i18n-iso-countries';
import { feature } from 'topojson-client';
const require = createRequire(import.meta.url);
const topo = JSON.parse(
  readFileSync(require.resolve('world-atlas/countries-110m.json'), 'utf8'),
);
const round = (c) =>
  typeof c[0] === 'number'
    ? [Math.round(c[0] * 100) / 100, Math.round(c[1] * 100) / 100]
    : c.map(round);
const features = feature(topo, topo.objects.countries).features.flatMap((f) => {
  const a2 = f.id && countries.numericToAlpha2(f.id);
  if (!a2 || a2 === 'AQ') return [];
  return [
    {
      geometry: { ...f.geometry, coordinates: round(f.geometry.coordinates) },
      properties: { name: a2 },
      type: 'Feature',
    },
  ];
});
writeFileSync(
  process.argv[2],
  JSON.stringify({ features, type: 'FeatureCollection' }),
);
console.log(features.length, 'countries');
