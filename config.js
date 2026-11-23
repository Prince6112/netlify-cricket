// Paste the Google Apps Script "Web app" URL here after deploying apps-script/Code.gs.
// While this is empty the form runs in DEMO mode: nothing is saved anywhere,
// and the live ticker shows only the league messages (no player names).
window.CCL_CONFIG = {
  SCRIPT_URL: "",
  EVENT_START: "2027-02-06T08:00:00+05:30",

  // Title sponsor. Leave name empty to show "To be announced".
  // For a logo, put the image in assets/ (e.g. assets/sponsor.webp) and set LOGO to that path.
  TITLE_SPONSOR: {
    NAME: "",
    LOGO: "",
    TAGLINE: ""
  },

  // How often (seconds) the live ticker checks for new registrations.
  TICKER_REFRESH: 30
};
