# Majestique Colours Cricket League 2027 — Player Registration

A single-page, mobile-friendly registration form for the player auction (6–7 Feb 2027).
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
5. Submit one test registration. A **Registrations** tab should appear with a header row and your entry.

If you later edit `Code.gs`, redeploy through **Deploy → Manage deployments → Edit → New version**. This keeps the same URL.

To get the Excel file, open the sheet and choose **File → Download → Microsoft Excel (.xlsx)**.

## Behaviour

- Each registration gets an ID: `CCL27-0001`, `CCL27-0002`, …
- Each WhatsApp number can register only once.
- Player photos are shrunk in the browser to a 480×480 JPEG (about 60 KB), saved in a Google Drive folder called **CCL 2027 Player Photos**, and linked from the sheet. On the first deploy Google also asks for Drive permission: allow it.
- "Non-playing" registrations skip the playing role and batting hand questions.
- The **LIVE ticker** at the top lists registered players (name and role only) and the total count. It checks the sheet every 30 seconds (`TICKER_REFRESH`), so new registrations appear on everyone's screen automatically.
- **Sample players**: `SAMPLE_PLAYERS` in `config.js` fills the LIVE bar with example names and jersey numbers while it's quiet. Real players always appear first, samples are never counted in the totals, and they vanish by themselves once `HIDE_SAMPLES_AFTER` (10) real players have registered. Edit or delete them in `config.js` any time.
- **Music**: the anthem starts on the visitor's first tap anywhere on the page (phones block sound before that) and loops. The MUSIC button at the right end of the LIVE bar (top of the page) stops it, and the page remembers that choice.
- **Title sponsor**: set `TITLE_SPONSOR.NAME` (and optionally `LOGO`, e.g. `assets/sponsor.webp`, and `TAGLINE`) in `config.js`. Until then it shows "To be announced".
- If you already have a "Registrations" tab from the old version of the form, rename or delete it first: the columns have changed.
- Until `SCRIPT_URL` is set, the form runs in **demo mode**: it shows the success screen but saves nothing.
