# Majestique Colours Cricket League 2027 — Player Registration

A mobile-friendly registration form for the player auction (6–7 Feb 2027), with **separate forms for boys and girls**.

| Link | Opens |
|---|---|
| `https://<your-site>/boys` | Boys' form (same as `/?for=boys`) |
| `https://<your-site>/girls` | Girls' form (same as `/?for=girls`) |
| `https://<your-site>/` | A page asking "Boys or Girls?" |
It needs no server. Each submission becomes one row in a Google Sheet, and you can download that sheet as Excel (.xlsx) whenever you want.

## Files

| File | What it is |
|---|---|
| `index.html` | The page |
| `style.css` | Styling |
| `app.js` | Validation, jersey preview, submit |
| `config.js` | **Paste your Google Script URL here**, plus the title sponsor's name and logo |
| `assets/anthem.mp3` | Background music (the soundtrack of the CCL 2027 promo video) |
| `apps-script/Code.gs` | Code that receives registrations into the Google Sheet |
| `assets/` | Logos, resized for the web |

## Connect the form to a sheet (one time, about 5 minutes)

1. Create a new Google Sheet, for example "CCL 2027 Registrations".
2. In the sheet, open **Extensions → Apps Script**. Delete what's there, paste in the contents of `apps-script/Code.gs`, and save.
3. Click **Deploy → New deployment**. For the type, choose **Web app**. Set **Execute as: Me** and **Who has access: Anyone**, then click **Deploy** and approve the permissions.
4. Copy the **Web app URL** (it ends in `/exec`) into `config.js` as `SCRIPT_URL`.
5. In the Apps Script editor, pick **setup** in the function dropdown and click **Run**. This creates the **Boys** and **Girls** tabs with header rows.
6. Submit one test registration on each form. Each should appear as a row in its own tab.
7. Before going live, delete the test rows. Numbering restarts from 0001.

If you later edit `Code.gs`, redeploy through **Deploy → Manage deployments → Edit → New version**. This keeps the same URL.

To get the Excel file, open the sheet and choose **File → Download → Microsoft Excel (.xlsx)**.

## Behaviour

- Boys' registrations go to the **Boys** tab, girls' to the **Girls** tab.
- Each registration gets an ID: `CCL27-B-0001` for boys, `CCL27-G-0001` for girls.
- Each WhatsApp number can register only once (checked across both tabs).
- The jersey preview (front and back) shows the typed name and number live. The size chart (S–3XL, chest and length in inches) sits under the size picker; tapping a row picks that size.
- Queries contact shown on the page: Rohit Jethale, 93733 13346.
- The LIVE ticker and jersey rail show boys and girls together.
- Player photos are shrunk in the browser to a 480×480 JPEG (about 60 KB), saved in a Google Drive folder called **CCL 2027 Player Photos**, and linked from the sheet. On the first deploy Google also asks for Drive permission: allow it.
- "Non-playing" registrations skip the playing role and batting hand questions.
- The **LIVE band** (below the hero, next to the gold **Team Owners** band) lists registered players (name and role only) and the total count. It checks the sheet every 30 seconds (`TICKER_REFRESH`), so new registrations appear on everyone's screen automatically.
- **Jersey board**: every player's jersey (number + short name, e.g. "Rahul P") hangs on rows of hangers, newest first; new registrations swing in. Set `TOTAL_JERSEYS` in `config.js` to show "Sirf N jersey bachi!" with empty hangers for the free jerseys.
- **Team owners**: put the names in `TEAM_OWNERS` in `config.js`. Until then the band says "Announcing soon".
- **Sample players**: `SAMPLE_PLAYERS` in `config.js` fills the LIVE band and jersey board with example names and jersey numbers while it's quiet. Real players always appear first, samples are never counted in the totals, and they vanish by themselves once `HIDE_SAMPLES_AFTER` (10) real players have registered. Edit or delete them in `config.js` any time.
- **Welcome screen + music**: the page opens on a full-screen welcome with a "Chalo, khelein ♪" button. Phones only allow sound after a tap, so that button starts the anthem (looping) and opens the site. "Enter without music" skips it. Either way the CCL logo then pops in with a flash and a confetti blast. The round MUSIC button (bottom left) turns the music on or off later.
- **Title sponsor**: set `TITLE_SPONSOR.NAME` (and optionally `LOGO`, e.g. `assets/sponsor.webp`, and `TAGLINE`) in `config.js`. Until then it shows "To be announced".
- The old single "Registrations" tab is no longer used. Entries now go to **Boys** and **Girls**.
- Until `SCRIPT_URL` is set, the form runs in **demo mode**: it shows the success screen but saves nothing.
