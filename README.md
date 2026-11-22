# Majestique Colours Cricket League 2027 — Player Registration

A single-page, mobile-friendly registration form for the player auction (6–7 Feb 2027).
It needs no server and no fees. Each submission becomes one row in a Google Sheet, and you can download that sheet as Excel (.xlsx) whenever you want.

## Files

| File | What it is |
|---|---|
| `index.html` | The page |
| `style.css` | Styling |
| `app.js` | Validation, jersey preview, submit |
| `config.js` | **Paste your Google Script URL here** |
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
- The sheet adds an "Age on 6 Feb 2027" column automatically.
- Until `SCRIPT_URL` is set, the form runs in **demo mode**: it shows the success screen but saves nothing.
