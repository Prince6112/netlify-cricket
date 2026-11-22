/**
 * Majestique Colours Cricket League 2027 — registration receiver.
 *
 * Paste this into a Google Sheet: Extensions → Apps Script, then
 * Deploy → New deployment → Web app (Execute as: Me, Who has access: Anyone).
 * Copy the Web app URL into config.js (SCRIPT_URL).
 *
 * Every registration becomes one row in the "Registrations" tab.
 * File → Download → Microsoft Excel (.xlsx) gives you the Excel file any time.
 */

var SHEET_NAME = "Registrations";
var ID_PREFIX = "CCL27-";

// [column header, key sent by the form]
var COLUMNS = [
  ["Reg ID", "_id"],
  ["Submitted At", "_ts"],
  ["Full Name", "name"],
  ["WhatsApp", "mobile"],
  ["Email", "email"],
  ["Gender", "gender"],
  ["Date of Birth", "dob"],
  ["Age (on 6 Feb 2027)", "_age"],
  ["Area", "area"],
  ["Role", "role"],
  ["Batting Hand", "batHand"],
  ["Bowling Style", "bowlStyle"],
  ["Jersey Name", "jerseyName"],
  ["Jersey No", "jerseyNo"],
  ["T-shirt Size", "tshirt"],
  ["Declaration", "agree"]
];

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    var d = JSON.parse(e.postData.contents || "{}");
    if (d.website) return json({ ok: true, id: ID_PREFIX + "0000" }); // honeypot: bots

    var err = validate(d);
    if (err) return json({ ok: false, error: err });

    var sheet = getSheet();
    var mobile = clean(d.mobile);

    // one registration per WhatsApp number
    var last = sheet.getLastRow();
    if (last > 1) {
      var mobiles = sheet.getRange(2, 4, last - 1, 1).getDisplayValues();
      for (var i = 0; i < mobiles.length; i++) {
        if (String(mobiles[i][0]).replace(/\D/g, "").slice(-10) === mobile) {
          var existing = sheet.getRange(i + 2, 1).getDisplayValue();
          return json({ ok: false, error: "This WhatsApp number is already registered (ID " + existing + "). Contact the organisers to change details." });
        }
      }
    }

    var id = ID_PREFIX + ("000" + last).slice(-4); // row 2 → 0001
    d._id = id;
    d._ts = Utilities.formatDate(new Date(), "Asia/Kolkata", "dd-MMM-yyyy HH:mm:ss");
    d._age = ageOn(d.dob, new Date(2027, 1, 6));

    var row = COLUMNS.map(function (c) {
      var v = c[1].charAt(0) === "_" ? d[c[1]] : clean(d[c[1]]);
      return v === undefined ? "" : v;
    });
    sheet.appendRow(row);
    // keep mobile / jersey no as text so Excel doesn't strip zeros
    sheet.getRange(sheet.getLastRow(), 4).setNumberFormat("@").setValue(mobile);
    sheet.getRange(sheet.getLastRow(), 14).setNumberFormat("@").setValue(clean(d.jerseyNo));

    return json({ ok: true, id: id });
  } catch (ex) {
    return json({ ok: false, error: "Server busy, please try again in a minute." });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return json({ ok: true, service: "CCL 2027 registration" });
}

function validate(d) {
  if (!clean(d.name)) return "Name is required";
  if (!/^[6-9]\d{9}$/.test(clean(d.mobile))) return "Invalid mobile number";
  var req = ["gender", "dob", "area", "role", "batHand", "jerseyName", "jerseyNo", "tshirt"];
  for (var i = 0; i < req.length; i++) if (!clean(d[req[i]])) return "Missing: " + req[i];
  if (d.agree !== "Yes") return "Please accept the declaration";
  return "";
}

function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(COLUMNS.map(function (c) { return c[0]; }));
    sh.getRange(1, 1, 1, COLUMNS.length).setFontWeight("bold").setBackground("#142c6e").setFontColor("#ffffff");
    sh.setFrozenRows(1);
  }
  return sh;
}

function ageOn(dob, ref) {
  var b = new Date(dob);
  if (isNaN(b)) return "";
  var a = ref.getFullYear() - b.getFullYear();
  if (ref.getMonth() < b.getMonth() || (ref.getMonth() === b.getMonth() && ref.getDate() < b.getDate())) a--;
  return a;
}

// trims, caps length, and blocks spreadsheet formula injection (=, +, -, @)
function clean(v) {
  v = String(v == null ? "" : v).trim().slice(0, 100);
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

function json(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
