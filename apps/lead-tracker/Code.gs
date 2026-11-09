/**
 * Claw Point website → Deal Flow Lead Tracker.
 *
 * The website (public_html/send.php) posts each submission here:
 *   - funding requests, contact messages → "Website Leads"
 *   - network sign-ups → "Website Network"
 *   - newsletter sign-ups → "Newsletter"
 *   - private client reviews → "Reviews"
 *
 * Deployed as a web app (Execute as: Me, Who has access: Anyone). It only adds rows, and only
 * when the request carries SECRET, which must match 'secret' in public_html/lead-sheet.php.
 * The sheet itself stays private.
 */
const SECRET = 'PUT-SECRET-HERE';

function doPost(e) {
  const p = (e && e.parameter) || {};
  if (SECRET === 'PUT-SECRET-HERE' || p.secret !== SECRET) return reply_(false);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const now = new Date();
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    if (p.kind === 'review') {
      write_(ss.getSheetByName('Reviews'), [now, p.name, p.role, p.deal, Number(p.rating) || '', p.review, p.email, false, Boolean(p.ref)]);
    } else if (p.kind === 'newsletter') {
      write_(ss.getSheetByName('Newsletter'), [now, 'Subscribed', p.name, p.email, false, '']);
    } else if (p.kind === 'network') {
      write_(ss.getSheetByName('Website Network'), [now, 'New', p.name, p.company, p.email, p.phone, p.role, p.markets, p.assets, p.message, p.website, p.social, '']);
    } else {
      write_(ss.getSheetByName('Website Leads'), [now, p.source, p.funding_type, 'New', p.name, p.email, p.phone, p.property_type, p.address, p.close_date,
        num_(p.purchase_price), num_(p.requested_funding), p.needs_lender, p.message, p.topic, p.referred_by, p.documents, '', '', '', '']);
    }
  } finally {
    lock.releaseLock();
  }
  return reply_(true);
}

/** Writes into the first empty row (column A), so pre-filled checkboxes further down don't push rows to the bottom. */
function write_(sheet, values) {
  if (!sheet) throw new Error('Missing tab');
  const col = sheet.getRange(2, 1, Math.max(sheet.getLastRow(), 1), 1).getValues();
  let row = col.findIndex(r => r[0] === '' || r[0] === null) + 2;
  if (row < 2) row = sheet.getLastRow() + 1;
  sheet.getRange(row, 1, 1, values.length).setValues([values.map(clean_)]);
}

/** Text from the website is stored as plain text, never as a formula. */
function clean_(v) {
  if (v === undefined || v === null) return '';
  if (typeof v !== 'string') return v;
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

function num_(v) {
  const n = parseFloat(String(v || '').replace(/[^0-9.]/g, ''));
  return isNaN(n) ? '' : n;
}

function reply_(ok) {
  return ContentService.createTextOutput(JSON.stringify({ ok: ok })).setMimeType(ContentService.MimeType.JSON);
}
