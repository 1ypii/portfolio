# personal site & portfolio

A dark, minimal **developer personal page**. A sticky identity rail (name,
role, contact) next to a quiet column of about + selected work. No frameworks,
no build step — just static files. Loads instantly on Cloudflare Pages.

## ✏️ The only file you edit: `config.js`

Open `config.js` and fill in:

- `name`, `role` — your identity (shown large on the left)
- `location` — shown in the top bar next to your local time (`""` to hide)
- `accent` — any CSS color for the single accent (default warm amber)
- `now` — a "currently…" status line. Set to `""` to hide.
- `about` — a few short lines. The first is the lede (brighter).
- `socials` — your links (github, email, twitter, …). Shown in the left rail.
- `work` — your projects, grouped into **categories** (Roblox, Websites, …).

Save, refresh (or re-deploy). That's it.

## 🎬 Adding videos

1. Drop your video file into the **`assets/`** folder (e.g. `assets/my-demo.mp4`).
   Use `.mp4` (H.264) for the widest browser support; `.webm` also works.
2. In `config.js`, point a project's `video` at it:

   ```js
   {
     title:       "My game",
     video:       "assets/my-demo.mp4",  // the file you just added
     poster:      "",                    // optional thumbnail, e.g. "assets/my-demo.jpg"
     tags:        ["lua"],
   }
   ```

3. That's it — the video shows under that project and plays on click.
   No video for a project? Just leave `video: ""`.

Notes:
- Filenames must match exactly (case-sensitive on Cloudflare).
- Keep clips reasonably small — big files slow down the page and the deploy.
  If a file is large, compress it or host it elsewhere and link via the project `url`.

## 👀 Preview locally

From this folder run any static server, e.g.:

```bash
python -m http.server 5173
# then open http://localhost:5173
```

## 📨 Contact form

The left rail has a message box that emails you — no backend needed, using the
free **Web3Forms** service. Your email address is **not** in the page source
(that keeps it away from spam bots); only an anonymous access key is.

**Setup — do this once:**
1. Go to **https://web3forms.com** and enter your email (`1ypiiiris@gmail.com`).
2. Copy the **Access Key** it shows you.
3. Paste it into `config.js` → `contact.accessKey` (replacing the placeholder).
4. Deploy. Messages now arrive straight in your inbox.

Free tier covers 250 messages/month. Messages pass through web3forms.com's
servers (normal for backend-less forms). If a key is ever abused with spam, just
generate a new one and paste it in. To remove the form entirely, delete the
`contact` block in `config.js`.

## ☁️ Deploy to Cloudflare Pages

**Option A — drag & drop (fastest):**
1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → **Upload assets**.
2. Drag this whole `portfolio` folder in.
3. Deploy. You get a `*.pages.dev` URL instantly.

**Option B — Git (auto-deploys on every push):**
1. Push this folder to a GitHub repo.
2. Cloudflare → **Pages** → **Connect to Git** → pick the repo.
3. Build settings: **Framework preset = None**, **Build command = (empty)**,
   **Build output directory = `/`**.
4. Every push redeploys automatically.

**Option C — Wrangler CLI:**
```bash
npm i -g wrangler
wrangler pages deploy . --project-name your-portfolio
```

### Custom domain
In your Pages project → **Custom domains** → add your domain. Cloudflare handles DNS + HTTPS.

## Design notes
- Graphite background, warm off-white text, one restrained amber accent.
- Type: Space Grotesk (display) · Inter (body) · JetBrains Mono (data/labels).
- Work is a hover-underlined ledger; local time auto-detects your timezone.
- Responsive to mobile, keyboard-focusable, respects `prefers-reduced-motion`.

## Files
- `index.html` — markup (two-column shell)
- `styles.css` — all styling, layout, motion
- `app.js` — reads `config.js` and renders the page
- `config.js` — **your content** (the file you edit)
- `_headers` — Cloudflare caching/security headers
