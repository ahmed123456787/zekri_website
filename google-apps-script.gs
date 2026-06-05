/**
 * ZEKRI DENTAL — Appointment form → Google Sheet
 * ────────────────────────────────────────────────────────────
 * SETUP (one time, ~3 minutes):
 *  1. Create a new Google Sheet (sheets.new). Name it e.g. "Zekri Appointments".
 *  2. In the Sheet: Extensions ▸ Apps Script.
 *  3. Delete any sample code, paste THIS whole file, click 💾 Save.
 *  4. Click Deploy ▸ New deployment.
 *  5. Click the ⚙️ (gear) ▸ choose "Web app".
 *  6. Description: "Zekri form".  Execute as: "Me".  Who has access: "Anyone".
 *  7. Click Deploy ▸ Authorize access (allow your account).
 *  8. Copy the "Web app URL" (ends with /exec).
 *  9. Send me that URL — I'll paste it into the website (SHEET_ENDPOINT in script.js).
 *
 * Every submitted appointment will then append a new row automatically.
 */

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Appointments') || ss.getSheets()[0];

    var d = JSON.parse(e.postData.contents);

    // Write a header row once
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'First Name', 'Last Name', 'Age', 'Phone', 'Country',
        'Wilaya', 'Treatment', 'Restoration', 'Reason', 'Agreed Terms'
      ]);
    }

    sheet.appendRow([
      d.firstName || '', d.lastName || '', d.age || '', d.phone || '', d.country || '',
      d.wilaya || '', d.treatment || '', d.restoration || '', d.reason || '', d.agreedTerms || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Lets you test the deployment in a browser (optional)
function doGet() {
  return ContentService.createTextOutput('Zekri appointment endpoint is live.');
}
