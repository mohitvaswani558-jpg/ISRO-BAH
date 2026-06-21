// Converts India states TopoJSON -> compact SVG path data TS module
const fs = require("fs");
const topo = require("./india.topo.json");
const tc = require("topojson-client");
const { geoMercator, geoPath, geoBounds, geoCentroid } = require("d3-geo");

const fc = tc.feature(topo, topo.objects.states);

const proj = geoMercator();
proj.fitExtent([[10, 10], [990, 1090]], fc);
const path = geoPath(proj);

let out = "// AUTO-GENERATED India state SVG paths (Mercator, viewBox 0 0 1000 1100)\n";
out += "export interface StateGeom { name: string; code: string; path: string; cx: number; cy: number; }\n";
out += "export const INDIA_STATES: StateGeom[] = [\n";

fc.features.forEach((ft) => {
  const name = ft.properties.st_nm;
  const code = ft.properties.st_code;
  const d = path(ft);
  if (!d) { console.log("skip", name); return; }
  const c = proj(geoCentroid(ft));
  const cx = c[0].toFixed(1);
  const cy = c[1].toFixed(1);
  const ds = JSON.stringify(d);
  out += "  { name: " + JSON.stringify(name) + ", code: " + JSON.stringify(code) + ", path: " + ds + ", cx: " + cx + ", cy: " + cy + " },\n";
});
out += "];\n";
out += 'export const INDIA_VIEWBOX = "0 0 1000 1100";\n';

fs.writeFileSync("src/lib/indiaStates.ts", out);
console.log("Wrote src/lib/indiaStates.ts", out.length, "bytes");
