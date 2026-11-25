/**
 * Majestique Colours Cricket League 2027 — registration receiver.
 *
 * Paste this into a Google Sheet: Extensions → Apps Script, then
 * Deploy → New deployment → Web app (Execute as: Me, Who has access: Anyone).
 * Copy the Web app URL into config.js (SCRIPT_URL).
 *
 * Boys and girls go to separate tabs: "Boys" and "Girls".
 * Run setup() once from the editor to create both tabs with headers.
 * File → Download → Microsoft Excel (.xlsx) gives you the Excel file (both tabs) any time.
 * Player photos are saved in a Google Drive folder ("CCL 2027 Player Photos");
 * the sheet stores a link to each one.
 * The page's live ticker reads registered names from doGet (?action=list).
 */

// category sent by the form → [tab name, ID prefix]
var CATEGORIES = {
  Boys: ["Boys", "CCL27-B-"],
  Girls: ["Girls", "CCL27-G-"]
};
var CONTACT = "Rohit Jethale – 93733 13346";
var PHOTO_FOLDER = "CCL 2027 Player Photos";
var TICKER_MAX = 150; // newest N names sent to the ticker

// [column header, key sent by the form]
var COLUMNS = [
  ["Reg ID", "_id"],
  ["Submitted At", "_ts"],
  ["Full Name", "name"],
  ["WhatsApp", "mobile"],
  ["Email", "email"],
  ["Playing / Non-playing", "playing"],
  ["Available for Practice", "practice"],
  ["Role", "role"],
  ["Batting Hand", "batHand"],
  ["Jersey Name", "jerseyName"],
  ["Jersey No", "jerseyNo"],
  ["T-shirt Size", "tshirt"],
  ["Photo", "_photo"],
  ["Comments", "comments"],
  ["Declaration", "agree"]
];

function col(key) {
  for (var i = 0; i < COLUMNS.length; i++) if (COLUMNS[i][1] === key) return i + 1;
  return 0;
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    var d = JSON.parse(e.postData.contents || "{}");
    if (d.website) return json({ ok: true, id: "CCL27-0000" }); // honeypot: bots

    var err = validate(d);
    if (err) return json({ ok: false, error: err });

    var cat = CATEGORIES[d.category];
    var sheet = getSheet(cat[0]);
    var mobile = clean(d.mobile);

    // one registration per WhatsApp number, across both tabs
    for (var k in CATEGORIES) {
      var found = findMobile(getSheet(CATEGORIES[k][0]), mobile);
      if (found) {
        return json({ ok: false, error: "This WhatsApp number is already registered (ID " + found + "). To change details, contact " + CONTACT + "." });
      }
    }

    var id = cat[1] + ("000" + nextNumber(sheet, cat[1])).slice(-4);
    d._id = id;
    d._ts = Utilities.formatDate(new Date(), "Asia/Kolkata", "dd-MMM-yyyy HH:mm:ss");
    d._photo = savePhoto(d.photo, id, clean(d.name));

    var row = COLUMNS.map(function (c) {
      var v = c[1].charAt(0) === "_" ? d[c[1]] : clean(d[c[1]], c[1] === "comments" ? 300 : 100);
      return v === undefined ? "" : v;
    });
    sheet.appendRow(row);
    // keep mobile / jersey no as text so Excel doesn't strip zeros
    var r = sheet.getLastRow();
    sheet.getRange(r, col("mobile")).setNumberFormat("@").setValue(mobile);
    sheet.getRange(r, col("jerseyNo")).setNumberFormat("@").setValue(clean(d.jerseyNo));
    CacheService.getScriptCache().remove("list"); // ticker shows the new name on its next check

    return json({ ok: true, id: id });
  } catch (ex) {
    return json({ ok: false, error: "Server busy, please try again in a minute." });
  } finally {
    lock.releaseLock();
  }
}

// ?action=list → names for the live ticker (name, jersey no, role, playing only: no phone, email or photo)
function doGet(e) {
  if (e && e.parameter && e.parameter.action === "list") {
    var cache = CacheService.getScriptCache();
    var hit = cache.get("list");
    if (hit) return ContentService.createTextOutput(hit).setMimeType(ContentService.MimeType.JSON);
    // both tabs together, newest first (Submitted At is dd-MMM-yyyy HH:mm:ss in IST)
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var all = [];
    for (var k in CATEGORIES) {
      var sh = ss.getSheetByName(CATEGORIES[k][0]);
      if (sh && sh.getLastRow() > 1) {
        all = all.concat(sh.getRange(2, 1, sh.getLastRow() - 1, COLUMNS.length).getDisplayValues());
      }
    }
    all.sort(function (a, b) { return stamp(a[col("_ts") - 1]) - stamp(b[col("_ts") - 1]); });
    var count = all.length, players = [];
    for (var i = all.length - 1; i >= 0 && players.length < TICKER_MAX; i--) {
      players.push({
        n: String(all[i][col("name") - 1]).replace(/^'/, ""),
        j: all[i][col("jerseyNo") - 1],
        r: all[i][col("role") - 1],
        p: all[i][col("playing") - 1]
      });
    }
    var out = JSON.stringify({ ok: true, count: count, players: players });
    cache.put("list", out, 20); // seconds: keeps many open pages from hammering the sheet
    return ContentService.createTextOutput(out).setMimeType(ContentService.MimeType.JSON);
  }
  return json({ ok: true, service: "CCL 2027 registration" });
}

// saves the base64 JPEG from the form into Drive, returns a viewable link ("" if none / failed)
function savePhoto(dataUrl, id, name) {
  var m = /^data:image\/(jpeg|png);base64,(.+)$/.exec(String(dataUrl || ""));
  if (!m || m[2].length > 2000000) return "";
  try {
    var folders = DriveApp.getFoldersByName(PHOTO_FOLDER);
    var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(PHOTO_FOLDER);
    var blob = Utilities.newBlob(Utilities.base64Decode(m[2]), "image/" + m[1],
      id + " " + name.replace(/[^\w .-]/g, "") + (m[1] === "png" ? ".png" : ".jpg"));
    var file = folder.createFile(blob);
    return file.getUrl();
  } catch (ex) {
    return "";
  }
}

// Run once from the Apps Script editor (select "setup" → Run) to create both tabs.
function setup() {
  for (var k in CATEGORIES) getSheet(CATEGORIES[k][0]);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var blank = ss.getSheetByName("Sheet1");
  if (blank && blank.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(blank);
}

function validate(d) {
  if (!CATEGORIES[d.category]) return "Please open the Boys or Girls registration link";
  if (!clean(d.name)) return "Name is required";
  if (!/^[6-9]\d{9}$/.test(clean(d.mobile))) return "Invalid mobile number";
  var req = ["playing", "practice", "jerseyName", "jerseyNo", "tshirt"];
  if (d.playing === "Playing") req.push("role", "batHand");
  for (var i = 0; i < req.length; i++) if (!clean(d[req[i]])) return "Missing: " + req[i];
  if (d.agree !== "Yes") return "Please accept the declaration";
  return "";
}

function getSheet(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(name) || ss.insertSheet(name);
  if (sh.getLastRow() === 0) {
    sh.appendRow(COLUMNS.map(function (c) { return c[0]; }));
    sh.getRange(1, 1, 1, COLUMNS.length).setFontWeight("bold").setBackground("#142c6e").setFontColor("#ffffff");
    sh.setFrozenRows(1);
  }
  return sh;
}

// returns the Reg ID already using this mobile, or ""
function findMobile(sheet, mobile) {
  var last = sheet.getLastRow();
  if (last < 2) return "";
  var mobiles = sheet.getRange(2, col("mobile"), last - 1, 1).getDisplayValues();
  for (var i = 0; i < mobiles.length; i++) {
    if (String(mobiles[i][0]).replace(/\D/g, "").slice(-10) === mobile) {
      return sheet.getRange(i + 2, 1).getDisplayValue();
    }
  }
  return "";
}

// highest existing number + 1, so deleting test rows restarts numbering cleanly
function nextNumber(sheet, prefix) {
  var last = sheet.getLastRow(), max = 0;
  if (last >= 2) {
    sheet.getRange(2, 1, last - 1, 1).getDisplayValues().forEach(function (r) {
      var s = String(r[0]);
      if (s.indexOf(prefix) === 0) max = Math.max(max, parseInt(s.slice(prefix.length), 10) || 0);
    });
  }
  return max + 1;
}

// "25-Nov-2026 14:05:09" → sortable number (0 if unreadable)
function stamp(s) {
  var m = /^(\d{2})-(\w{3})-(\d{4}) (\d{2}):(\d{2}):(\d{2})$/.exec(String(s));
  if (!m) return 0;
  var mon = "JanFebMarAprMayJunJulAugSepOctNovDec".indexOf(m[2]) / 3;
  return new Date(+m[3], mon, +m[1], +m[4], +m[5], +m[6]).getTime();
}

// trims, caps length, and blocks spreadsheet formula injection (=, +, -, @)
function clean(v, max) {
  v = String(v == null ? "" : v).trim().slice(0, max || 100);
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

function json(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
