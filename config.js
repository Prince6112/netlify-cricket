// Paste the Google Apps Script "Web app" URL here after deploying apps-script/Code.gs.
// While this is empty the form runs in DEMO mode: nothing is saved anywhere,
// and the live ticker shows only the league messages (no player names).
window.CCL_CONFIG = {
  SCRIPT_URL: "https://script.google.com/macros/s/AKfycbw8ru0Y_sWUyWXQMeq8lDnlrxrXZGgGGI1RnPNPDH3_-JjyFW_F9GaSsueOM2PJt09D/exec",
  EVENT_START: "2027-02-06T08:00:00+05:30",

  // Title sponsor. Leave name empty to show "To be announced".
  // For a logo, put the image in assets/ (e.g. assets/sponsor.webp) and set LOGO to that path.
  TITLE_SPONSOR: {
    NAME: "Majestique Landmarks",
    LOGO: "",
    TAGLINE: ""
  },

  // Team owners, shown in the gold "Team Owners" band. Until names are added it says "Announcing soon".
  // Example: TEAM_OWNERS: ["Mr. Rohit Jethale", "Mr. Amit Shah"],
  TEAM_OWNERS: [],

  // Total jerseys available. When set (e.g. 99), the jersey board says "Sirf N jersey bachi!"
  // and shows empty hangers for the jerseys still free. 0 = no limit, it counts jerseys taken instead.
  TOTAL_JERSEYS: 0,

  // Sample players shown in the LIVE band and on the jersey board until real registrations come in.
  // Real players always show first. Once HIDE_SAMPLES_AFTER real players have registered,
  // the samples disappear by themselves. To remove them sooner, delete the lines below.
  // playing: "Playing" or "Non-playing". role: Batter, Bowler, All-rounder or Wicket-keeper.
  SAMPLE_PLAYERS: [
    { name: "Rahul Patil",     no: "18", role: "Batter",        playing: "Playing" },
    { name: "Amit Deshmukh",   no: "7",  role: "Wicket-keeper", playing: "Playing" },
    { name: "Sanjay Kulkarni", no: "45", role: "All-rounder",   playing: "Playing" },
    { name: "Vikram Joshi",    no: "99", role: "Bowler",        playing: "Playing" },
    { name: "Nikhil Shinde",   no: "10", role: "Batter",        playing: "Playing" },
    { name: "Prakash Jadhav",  no: "23", role: "All-rounder",   playing: "Playing" },
    { name: "Suresh Pawar",    no: "33", role: "Bowler",        playing: "Playing" },
    { name: "Ajay Gaikwad",    no: "1",  role: "Batter",        playing: "Playing" },
    { name: "Manoj Kale",      no: "17", role: "",              playing: "Non-playing" },
    { name: "Rohan Bhosale",   no: "77", role: "All-rounder",   playing: "Playing" },
    { name: "Kiran More",      no: "12", role: "Wicket-keeper", playing: "Playing" },
    { name: "Deepak Chavan",   no: "8",  role: "Bowler",        playing: "Playing" }
  ],
  HIDE_SAMPLES_AFTER: 10,

  // How often (seconds) the live ticker checks for new registrations.
  TICKER_REFRESH: 30
};
