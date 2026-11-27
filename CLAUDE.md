# Working notes

Read `README.md` first: its **Status** section lists what's live, what's left to do and the open questions.

- This repo (`Prince6112/netlify-cricket`, branch `main`) is what the live Netlify site builds from. Pushing to `main` publishes it.
- `Prince6112/cricket-form` (branch `claude/optimistic-dijkstra-mk2l2d`) is a copy. Mirror changes there too.
- Static site, no build step. Test locally with `python3 -m http.server` and Playwright. The welcome screen must be dismissed first (`#gateQuiet`).
- Changing an image in `assets/`: use a new file name, because phones cache assets.
- `apps-script/Code.gs` only takes effect after the owner pastes it into the sheet's Apps Script and deploys a new version (same URL).
- `SCRIPT_URL` in `config.js` is the live Google Sheet. Any test registration sent to it lands in the real sheet: name it clearly ("TEST … (delete me)") and tell the user to delete it.
