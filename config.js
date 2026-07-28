/* =============================================================
   YOUR CONTENT — edit this file only.
   Everything on the site is generated from the values below.
   After editing, just refresh locally (or re-deploy).
   ============================================================= */

window.CONFIG = {
  /* ---- identity ------------------------------------------- */
  name:     "",                          // big name up top. "" to hide it
  brand:    "portfolio blessedlua",      // browser tab title + top-left of the page
  role:     "game programmer",
  accent:   "#e0a85c",                   // optional: any CSS color for the accent

  /* ---- clock (top-right) --------------------------------- */
  // Live clock for a fixed place, regardless of where the visitor is.
  timezone:  "Asia/Almaty",              // IANA timezone
  timeLabel: "almaty kazakhstan",        // label shown next to the time

  /* ---- a 'now' status line (optional) -------------------- */
  // The "currently…" bit. Set to "" to hide it.
  now: "",

  /* ---- about / bio --------------------------------------- */
  // First line is the lede (brighter); the rest are supporting lines.
  about: [],

  /* ---- socials / contact (shown in the left rail) -------- */
  // The main reason people land here. Add/remove freely.
  // `label` also picks the icon (telegram / x / twitter / roblox / github / email / discord / youtube).
  socials: [
    { label: "telegram", handle: "@softdoor",    url: "https://t.me/softdoor" },
    { label: "discord",  handle: "blessedlua",   url: "https://discord.com/users/1507356288584122497" },
    { label: "x",        handle: "@finallykite", url: "https://x.com/finallykite" },
    { label: "roblox",   handle: "blesslua",     url: "https://www.roblox.com/users/3622604991/profile" },
    { label: "roblox",   handle: "6bug",         url: "https://www.roblox.com/users/275945334/profile" },
  ],

  /* ---- contact form (left rail) -------------------------- */
  // Visitors type a message and it's emailed to you via Web3Forms
  // (free, no backend, your email stays private). SETUP — do this once:
  //   1. go to https://web3forms.com  →  enter your email (1ypiiiris@gmail.com)
  //   2. copy the Access Key it gives you
  //   3. paste it below in `accessKey`
  // Messages then arrive straight in your inbox. (See README for details.)
  contact: {
    accessKey: "dfb13a4a-49e6-4093-bfd2-33396ef94600",
    button: "send",
    note:   "use this to get a higher response chance",
  },

  /* ---- code snippets (shown in the left rail) ------------ */
  // Each snippet's code lives in its own file under /assets/snippets/.
  // Edit the code there; edit lang/description here, then ask me to refresh.
  snippets: [
    {
      lang: "typescript",
      description: "a type safe middleware pipeline built from scratch in typescript generics async composition and real world patterns like auth rate limiting and error handling",
      file: "assets/snippets/typescript-middleware.ts",
    },
    {
      lang: "python",
      description: "an async task scheduler in python resolves dependencies with topological sorting runs independent tasks concurrently with a concurrency cap retries failures with increasing backoff skips anything downstream of a failed task and prints a run summary",
      file: "assets/snippets/python-scheduler.py",
    },
    {
      lang: "lua",
      description: "a reusable finite state machine module named states with enter update exit lifecycle hooks guarded transitions transition locking to prevent mid transition interference a capped timestamped history log and a clean destroy method to avoid memory leaks",
      file: "assets/snippets/lua-state-machine.lua",
    },
    {
      lang: "javascript",
      description: "a reactive state store built from scratch subscriptions for change notifications computed properties with dependency tracking and memoization a middleware pipeline for intercepting mutations batched updates that trigger one notification round and a capped history log with snapshots",
      file: "assets/snippets/javascript-reactive-store.js",
    },
    {
      lang: "cpp",
      description: "a lock free concurrent memory pool pre allocated blocks recycled through an atomic free list using compare and swap no mutexes zero lock contention an raii smart pointer style pool handle an object recycler plus a particle system demo a benchmark vs new delete and an 8 thread stress test",
      file: "assets/snippets/cpp-memory-pool.cpp",
    },
    {
      lang: "csharp",
      description: "a fully async job scheduling engine in c# submit jobs with priorities and dependencies a priority queue lets critical jobs jump ahead a semaphore caps concurrency retry policies use exponential backoff progress is reported live via events dependencies auto propagate downstream queues when unblocked skips on failure and it prints a full summary table",
      file: "assets/snippets/csharp-job-scheduler.cs",
    },
  ],

  /* ---- work, grouped into categories --------------------- */
  // Each category becomes a section. Each project can have a `video`
  // (a file you drop into the /assets folder). Videos are click-to-play.
  //
  //   video:  "assets/my-demo.mp4"   ← path to the file in /assets
  //   poster: "assets/my-demo.jpg"   ← optional thumbnail shown before play
  //
  // A project can have a video, a url, both, or neither.
  work: [
    {
      category: "videos",
      // labelled video galleries shown as grids under the Roblox heading.
      // each entry is just the path to a file in /assets. add a { video, caption }
      // object instead of a bare string if you want a small caption.
      galleries: [
        {
          label: "work",
          videos: [
            "assets/Roblox-Work-1.mp4",
            "assets/Roblox-Work-2.mp4",
            "assets/Roblox-Work-3.mp4",
            "assets/Roblox-Work-4.mp4",
            "assets/Roblox-Work-5.mp4",
            "assets/Roblox-Work-6.mp4",
            "assets/Roblox-Work-7.mp4",
            "assets/Roblox-Work-8.mp4",
          ],
        },
        {
          label: "extra",
          videos: [
            "assets/Roblox-Extra-1.mp4",
            "assets/Roblox-Extra-2.mp4",
            "assets/Roblox-Extra-3.mp4",
            "assets/Roblox-Extra-4.mp4",
            "assets/Roblox-Extra-5.mp4",
            "assets/Roblox-Extra-6.mp4",
            "assets/Roblox-Extra-7.mp4",
            "assets/Roblox-Extra-8.mp4",
          ],
        },
      ],
    },
    {
      category: "games",
      // games contributed to / worked on — just a title and a link each.
      projects: [
        { title: "SWAP",                          url: "https://www.roblox.com/games/107260569755699/SWAP" },
        { title: "Stronger Every Kill",           url: "https://www.roblox.com/games/126934427850072/stronger-every-kill" },
        { title: "Tetragon Fortress 2",           url: "https://www.roblox.com/games/11867064975/Tetragon-Fortress-2" },
        { title: "Anime Saga",                    url: "https://www.roblox.com/games/17850641257/Anime-Saga" },
        { title: "Prison Duels",                  url: "https://www.roblox.com/games/111727414586213/Prison-Duels" },
        {
          title:       "Mortal Havoc",
          url:         "https://www.roblox.com/games/110335470041400/Mortal-Havoc",
          description: "may be private at times search mortal havoc battleground roblox on youtube or tiktok for gameplay",
        },
        { title: "Noob's Difficulty Chart Obby 3", url: "https://www.roblox.com/games/18289796570/Noobys-Difficulty-Chart-Obby-3" },
        { title: "Banana Wars",                   url: "https://www.roblox.com/games/130337157149168/Banana-Wars" },
        { title: "Feed Your Pet",                 url: "https://www.roblox.com/games/131783066284968/Feed-Your-Pet" },
      ],
    },
    {
      category: "groups i worked with",
      // Roblox groups/communities contributed to (former dev / worked / current).
      // auto-enriched from groups-data.js: icon, members, verified badge, proof.
      projects: [
        { url: "https://www.roblox.com/communities/731367867/game-gamess#!/about" },
        { url: "https://www.roblox.com/communities/11432949/Obby-Masters-Studio#!/about" },
        { url: "https://www.roblox.com/communities/35962658/Your-Pet#!/about" },
        { url: "https://www.roblox.com/communities/72625563/Launch-A-Rocket#!/about" },
        { url: "https://www.roblox.com/communities/35744141/BNGames#!/about" },
        { url: "https://www.roblox.com/communities/1000731181/mine-sly#!/about" },
        { url: "https://www.roblox.com/communities/12027385/Random-Productions#!/about" },
        { url: "https://www.roblox.com/communities/16819392/System-Arts-Studio#!/about" },
        { url: "https://www.roblox.com/communities/173592096/Purple-Monster-Games#!/about" },
        { url: "https://www.roblox.com/communities/3723250/Tetranova-Software#!/about" },
      ],
    },
  ],

  /* ---- footer ------------------------------------------- */
  footer: "",
};
