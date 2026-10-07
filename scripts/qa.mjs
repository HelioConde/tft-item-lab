import fs from "node:fs";

const required = [
  "index.html","style.css","app.js","backend-config.js",
  "sobre.html","privacidade.html","termos.html","robots.txt","sitemap.xml"
];

for (const file of required) {
  if (!fs.existsSync(file)) throw new Error("Missing required file: " + file);
}

const html = fs.readFileSync("index.html","utf8");
for (const marker of [
  'id="lookup-form"','id="item-grid"','id="unit-grid"',
  'href="privacidade.html"','src="backend-config.js"','src="app.js"'
]) {
  if (!html.includes(marker)) throw new Error("Missing index invariant: " + marker);
}

const app = fs.readFileSync("app.js","utf8");
for (const marker of ["normalizeItems","buildReport","riot-legacy-tft-profile"]) {
  if (!app.includes(marker) && !fs.readFileSync("backend-config.js","utf8").includes(marker)) {
    throw new Error("Missing data-flow invariant: " + marker);
  }
}

console.log("TFT Item Lab static QA passed.");
