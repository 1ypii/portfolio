window.CONFIG = {
  name:     "",
  brand:    "portfolio blessedlua",
  role:     "programmer",
  accent:   "#e0a85c",

  timezone:  "Asia/Almaty",
  timeLabel: "almaty kazakhstan",

  now: "",

  about: [],

  socials: [
    { label: "discord",  handle: "blessedlua",   url: "https://discord.com/users/1507356288584122497" },
  ],

  updates: [
    { text: "latest contact info is always on this page" },
    { text: "note : the roblox accounts that are in the picture proof's are only dev specific accounts" },
  ],

  contact: {
    accessKey: "dfb13a4a-49e6-4093-bfd2-33396ef94600",
    button: "send",
    note:   "use this to get a higher response chance",
  },

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
      lang: "c++",
      description: "a lock free concurrent memory pool pre allocated blocks recycled through an atomic free list using compare and swap no mutexes zero lock contention an raii smart pointer style pool handle an object recycler plus a particle system demo a benchmark vs new delete and an 8 thread stress test",
      file: "assets/snippets/cpp-memory-pool.cpp",
    },
    {
      lang: "csharp",
      description: "a fully async job scheduling engine in c# submit jobs with priorities and dependencies a priority queue lets critical jobs jump ahead a semaphore caps concurrency retry policies use exponential backoff progress is reported live via events dependencies auto propagate downstream queues when unblocked skips on failure and it prints a full summary table",
      file: "assets/snippets/csharp-job-scheduler.cs",
    },
  ],

  work: [
    {
      category: "videos",
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
            "assets/Roblox-Work-9.mp4",
            "assets/Roblox-Work-10.mp4",
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
        { title: "Drift Paradise",                url: "https://www.roblox.com/games/2637653456/Drift-Paradise" },
        { title: "Fundamental",                   url: "https://www.roblox.com/games/128974526462932/Fundamental" },
        { title: "Random Mafia Shooter",          url: "https://www.roblox.com/games/139522132549152/Random-Mafia-Shooter" },
        { title: "Garden Cleaner Evolution",      url: "https://www.roblox.com/games/89907728898683/Garden-Cleaner-Evolution" },
      ],
    },
    {
      category: "websites",
      projects: [
        {
          title:       "ogdex",
          url:         "https://www.ogdex.ink/",
          description: "a registry of rare and og roblox usernames browse search and track who holds them",
        },
        {
          title:       "robloxadmins",
          url:         "https://robloxadmins-34n.pages.dev/",
          description: "a live tracker of roblox staff accounts with profiles status and activity pulled through an api proxy",
        },
        {
          title:       "verifieds",
          url:         "https://verifieds.pages.dev/",
          description: "a self growing registry of roblox verified badge holders updated automatically on a cron schedule",
        },
        {
          title:       "roshipped",
          url:         "https://roshipped.pages.dev/",
          description: "a tracker of front page roblox games showing which ones shipped updates today this week this month or have gone stale",
        },
      ],
    },
    {
      category: "groups i worked with",
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
        { url: "https://www.roblox.com/communities/5216132/Official-Group-of-Drift-Paradise#!/about" },
        { url: "https://www.roblox.com/communities/17330972/unnamed#!/about" },
        { url: "https://www.roblox.com/communities/467803512/Fund1ment1l#!/about" },
        { url: "https://www.roblox.com/communities/999893763/Salient-Experiences#!/about" },
      ],
    },
    {
      category: "studio i work/worked with",
      projects: [
        {
          title: "increates",
          url:   "https://increates.com/",
          logo:  "assets/increates.png",
        },
      ],
    },
  ],

  footer: "",
};
