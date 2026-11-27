# Majestique Colours Cricket League 2027 — Player Registration

A mobile-friendly registration site for the player auction (5–7 Feb 2027), with **separate forms for boys and girls**.
It needs no server of its own: Netlify hosts the page, and each registration becomes one row in a Google Sheet, which you can download as Excel any time.

**Live site:** https://loquacious-starlight-5feb20.netlify.app

| Link | Opens |
|---|---|
| `/` | Welcome screen, then a "Boys or Girls?" choice |
| `/boys` | Boys' form (same as `/?for=boys`) |
| `/girls` | Girls' form (same as `/?for=girls`) |

Queries contacts shown on the page: **Dr. Rohit Jethale, 93733 13346**, **Gaurav Mundada, 90284 78078** and **Tushar Lohe, 90281 85515**.

---

## Status (27 Nov 2026)

### Done and live
- **Logos:** Majestique CCL 2027 logo (one transparent version, used on the welcome screen, blast, hero, jersey, icon and share image). Colours logo without its white background, with a separate version for dark backgrounds.
- **Welcome screen + blast:** "Chalo, khelein ♪" starts the music. After it, a white flash, then the CCL logo pops in with a confetti burst and "SWAGAT HAI!". The logo stays about 5 seconds (a second confetti burst at 2.4 s); tapping closes it sooner.
- **Separate Boys and Girls forms:** each saves to its own tab. Choosing one switches the form in place, without showing the welcome screen again.
- **Size chart:** Indian sizes S–3XL, chest and length in inches, with a measuring diagram and a "How do I pick my size?" note.
- **Live jersey preview:** front and back, showing the typed name and number. The front carries the CCL logo and the chest sponsor: gold Majestique monogram, "MAJESTIQUE", "KCM", "Kothrud Central Mall", "ELITE COMMERCIAL SPACES". The sleeves follow the Half/Full choice.
- **Sleeves:** required Half / Full choice next to the T-shirt size, saved in a "Sleeves" column (last column of each tab).
- **Contact:** "For any queries" block with Call and WhatsApp buttons for Dr. Rohit Jethale, Gaurav Mundada and Tushar Lohe.
- **Bands:** gold "Team Owners" band and "LIVE" players band, scrolling across, below the hero.
- **Jersey board:** rows of hangers with every player's jersey, newest first; new ones swing in.
- **Google Sheet connected:** `SCRIPT_URL` is set, so registrations are saved for real. Tested on 27 Nov: Boys and Girls entries saved to the right tabs, a repeat WhatsApp number is refused, and the player list feeds the bands and board.

### To do
- [x] **Published the 27 Nov changes** (new logo everywhere, 5–7 Feb dates, longer logo blast, jersey chest sponsor, half/full sleeves, three contacts) to the live site.
- [x] **Apps Script redeployed** with the sleeves version (27 Nov). The first real registration adds the "Sleeves" header to each tab by itself.
- [ ] **Real test from a phone**, including a photo. Check the row appears and the jersey shows on the board within about 30 s. Only direct requests to the script were tested so far, not the page itself against Google.
- [ ] **Share the sheet with Rohit** (Viewer) for his trial run, together with the site links.
- [ ] **Delete test data before launch:** the rows "TEST Boy (delete me)" (`CCL27-B-0001`) and "TEST Girl (delete me)" (`CCL27-G-0001`), plus any of Rohit's trial rows and their photos in the Drive folder "CCL 2027 Player Photos". Numbering restarts at 0001.
- [ ] **Team owner names** from Rohit → `TEAM_OWNERS` in `config.js`. The band says "Announcing soon" until then.
- [ ] **Total number of jerseys** from Rohit → `TOTAL_JERSEYS` in `config.js`. This turns on "Sirf N jersey bachi!" and empty hangers.
- [ ] **Sample players:** they show until 10 real players register. Remove `SAMPLE_PLAYERS` from `config.js` sooner if Rohit prefers.

### Open questions for Rohit
- The blast word is "SWAGAT HAI!" (the reference video used "PADHARO!"). Keep it or change it?

---

## How it fits together

```
 Player's phone ──(fills form)──▶ Website on Netlify (this repo)
                                     │  sends the registration
                                     ▼
                          Apps Script web app (SCRIPT_URL in config.js)
                                     │  writes a row / saves the photo
                                     ▼
                     Google Sheet (Boys / Girls tabs) + Drive photo folder
```

1. **Sending:** the page checks the form and shrinks any photo to a 480×480 JPEG (about 60 KB). It then sends everything as one message to `SCRIPT_URL`.
2. **Saving:** `doPost` in `Code.gs` saves it:
   - locks the script so two people can't get the same ID
   - drops spam bots (a hidden field only bots fill in)
   - re-checks the data
   - refuses a WhatsApp number already in either tab
   - makes the ID (highest number in that tab + 1)
   - saves the photo to Drive
   - writes the row and replies with the Registration ID
3. **Live list:** every 30 seconds (`TICKER_REFRESH`) the page asks `doGet` (`?action=list`) for the newest 150 players. It returns only name, jersey number, role and playing/non-playing (never phone, email or photo), cached for 20 seconds. The LIVE band, jersey board and player count are drawn from it.

The web app is deployed with **Execute as: Me** (it runs as the sheet owner's Google account, so it can write to the sheet and Drive) and **Who has access: Anyone** (players' phones need to reach it without a Google login). The URL is visible in the page source. That's why the script re-checks everything and only ever shares names and jersey numbers.

## Hosting and publishing

- Netlify site `loquacious-starlight-5feb20` builds from **`main` of `Prince6112/netlify-cricket`** (this repo). Pushing to `main` publishes in about 30 seconds. There is no build step; the repo root is published as is.
- `Prince6112/cricket-form` (branch `claude/optimistic-dijkstra-mk2l2d`) holds a **copy** of the same files. Netlify does **not** build from it. Keep it in sync, or treat this repo as the only source.
- `_redirects` makes `/boys` and `/girls` work. `netlify.toml` sets security headers and caching: scripts 5 minutes, `assets/` 1 day.
- **Changing an image in `assets/`:** give it a new file name (e.g. `colours-logo-v3.webp`) and update the references. Otherwise phones keep showing the old copy from their cache. This is what made the old white-background logo still appear on Rohit's phone.

## Files

| File | What it is |
|---|---|
| `index.html` | The page: welcome screen, blast, hero, bands, jersey board, forms, contact |
| `style.css` | Styling |
| `app.js` | Welcome + blast, music, bands, jersey board, Boys/Girls switch, form checks, live preview, size chart, photo, submit |
| `config.js` | **Settings:** `SCRIPT_URL`, title sponsor, `TEAM_OWNERS`, `TOTAL_JERSEYS`, sample players, refresh time |
| `_redirects` | Short links `/boys` and `/girls` |
| `netlify.toml` | Netlify headers and caching |
| `apps-script/Code.gs` | The Google Sheet script (copy of what's pasted into the sheet's Apps Script) |
| `assets/majestique-ccl-2027.webp` | Majestique CCL 2027 logo, transparent (welcome screen, blast, hero, jersey front) |
| `assets/majestique-monogram.webp` | Gold Majestique monogram on the jersey chest |
| `assets/colours-logo-v2.webp` | Colours logo, transparent (hero) |
| `assets/colours-logo-dark.webp` | Colours logo for dark backgrounds (welcome screen) |
| `assets/icon-v3.png`, `assets/og-v2.jpg` | Browser icon, WhatsApp/social share image |
| `assets/anthem.mp3` | Background music (soundtrack of the CCL 2027 promo video) |

## Google Sheet setup (already done; for a new sheet)

1. Create a Google Sheet, e.g. "CCL 2027 Registrations".
2. **Extensions → Apps Script.** Delete what's there, paste in `apps-script/Code.gs`, and save.
3. In the function dropdown pick **setup** (not `col` or any other), then click **Run**. Allow the permissions: **Advanced → Go to … (unsafe) → Allow**. This creates the **Boys** and **Girls** tabs and removes the empty Sheet1.
4. **Deploy → New deployment → ⚙️ Web app**, with **Execute as: Me** and **Who has access: Anyone**. Then click **Deploy**.
5. Copy the **Web app URL** (ends in `/exec`) into `config.js` as `SCRIPT_URL` and push.

**After editing `Code.gs`:** use **Deploy → Manage deployments → ✏️ Edit → Version: New version**. The URL stays the same, so the site needs no change. Until you do this, the live URL keeps running the old code.

**Excel:** open the sheet → **File → Download → Microsoft Excel (.xlsx)**. Both tabs are included.

### What each script function does

| Function | Job |
|---|---|
| `setup` | Run once by hand: creates the Boys and Girls tabs with headers |
| `doPost` | Receives a registration and saves it |
| `doGet` | `?action=list` → player list and count for the page |
| `validate` | Checks required fields |
| `findMobile` | Finds a WhatsApp number in a tab (repeat check) |
| `nextNumber` | Next ID number for a tab |
| `savePhoto` | Saves the photo to Drive and returns its link |
| `getSheet` | Finds a tab, or creates it with headers |
| `clean` | Trims text, caps its length and blocks spreadsheet formulas |
| `col`, `stamp` | Helpers (column number of a field; sortable time) |

## Behaviour details

- **IDs:** `CCL27-B-0001` for boys, `CCL27-G-0001` for girls. Each WhatsApp number can register only once, checked across both tabs.
- **Non-playing** registrations skip the playing role and batting hand questions.
- **Drafts:** a half-filled form survives a refresh. Each form keeps its own draft; the photo is not kept.
- **Sample players** (`SAMPLE_PLAYERS`) fill the LIVE band and jersey board while it's quiet. Real players always come first, samples are never counted, and they disappear once `HIDE_SAMPLES_AFTER` (10) real players have registered.
- **Team owners band** uses `TEAM_OWNERS`; it says "Announcing soon" until names are added.
- **Jersey board banner:** with `TOTAL_JERSEYS` set it says "Sirf N jersey bachi!" (and "Sab jerseys book ho gayi!" at 0). Without it, it counts jerseys taken.
- **Title sponsor:** `TITLE_SPONSOR.NAME` (optionally `LOGO`, e.g. `assets/sponsor.webp`, and `TAGLINE`). Shows "To be announced" if empty.
- **Music:** phones only allow sound after a tap, so "Chalo, khelein" starts it. The round MUSIC button (bottom left) turns it on or off later.
- If `SCRIPT_URL` is empty, the form runs in **demo mode**: it shows the success screen but saves nothing.
