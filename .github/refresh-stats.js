const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "..", "games-data.js");
const window = {};
new Function("window", fs.readFileSync(file, "utf8"))(window);
const games = window.GAMES_DATA;

(async () => {
  const ids = Object.values(games).map(g => g.universeId).join(",");
  const res = await fetch("https://games.roblox.com/v1/games?universeIds=" + ids);
  if (!res.ok) throw new Error("roblox api " + res.status);
  const body = await res.json();

  const byUniverse = {};
  for (const d of body.data || []) byUniverse[String(d.id)] = d;

  for (const g of Object.values(games)) {
    const d = byUniverse[String(g.universeId)];
    if (!d) continue;
    g.visits = d.visits;
    g.playing = d.playing;
  }

  fs.writeFileSync(file, "window.GAMES_DATA = " + JSON.stringify(games, null, 2) + ";\n");
})().catch(e => {
  console.error(e.message);
  process.exit(1);
});
