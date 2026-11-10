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


/* =====================================================================
 * Automatic follow-up emails for website leads
 *
 * Runs once a day (installed by setupFollowUps). For every row in
 * "Website Leads" (deal requests + contact form) and "Website Network"
 * whose Status is still "New", it emails the person from amira@ on
 * day 2, day 5 and day 10 after they submitted, then stops.
 * It skips anyone who already replied (found in this Gmail), anyone whose
 * Status was changed, TEST rows, and newsletter-only rows.
 * Each send is logged in the "Follow-ups sent" / "Follow-up log" columns.
 * ===================================================================== */
const FU_FROM = 'amira@clawpoint.capital';
const FU_NAME = 'Amira Borham';
const FU_DAYS = [2, 5, 10];
const FU_SIG = "<table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;color:#13201a\"><tr><td style=\"vertical-align:top;padding:0 14px 0 0\"><img src=\"https://clawpoint.capital/sig-logo.gif\" width=\"58\" height=\"58\" alt=\"Claw Point Advisory\" style=\"display:block;border:0;border-radius:14px\"></td><td style=\"vertical-align:top;border-left:2px solid #dcc64a;padding:0 0 0 14px\"><div style=\"font-family:Arial,Helvetica,sans-serif;font-size:17px;font-weight:bold;color:#13201a;line-height:1.2;letter-spacing:-.2px\">Amira Borham</div><div style=\"font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:bold;letter-spacing:2.2px;color:#24533d;margin:4px 0 9px\">CLAW POINT ADVISORY</div><table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"border-collapse:collapse\"><tr><td style=\"padding:2px 8px 2px 0;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:bold;letter-spacing:1px;color:#24533d;vertical-align:middle\">EMAIL</td><td style=\"padding:2px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#13201a;vertical-align:middle\"><a href=\"mailto:amira@clawpoint.capital\" style=\"color:#13201a;text-decoration:none\">amira@clawpoint.capital</a></td></tr><tr><td style=\"padding:2px 8px 2px 0;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:bold;letter-spacing:1px;color:#24533d;vertical-align:middle\">TEXT</td><td style=\"padding:2px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#13201a;vertical-align:middle\"><a href=\"sms:+13462915546\" style=\"color:#13201a;text-decoration:none\">(346) 291-5546</a> <span style=\"color:#8a9a94;font-size:12px\">\u00b7 text first</span></td></tr><tr><td style=\"padding:2px 8px 2px 0;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:bold;letter-spacing:1px;color:#24533d;vertical-align:middle\">WEB</td><td style=\"padding:2px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#13201a;vertical-align:middle\"><a href=\"https://clawpoint.capital\" style=\"color:#24533d;font-weight:bold;text-decoration:none\">clawpoint.capital</a></td></tr></table><table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"border-collapse:collapse;margin-top:10px\"><tr><td style=\"padding:0 6px 0 0\"><a href=\"https://clawpoint.capital/booking/\" style=\"display:inline-block;background:#163327;color:#ffffff;border:1px solid #163327;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:bold;text-decoration:none;padding:6px 12px;border-radius:999px\">Book a call &rarr;</a></td><td style=\"padding:0 6px 0 0\"><a href=\"https://www.linkedin.com/in/amira-borham-b6219122a/\" style=\"display:inline-block;background:#ffffff;color:#163327;border:1px solid #b9ccc5;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:bold;text-decoration:none;padding:6px 12px;border-radius:999px\">LinkedIn</a></td></tr></table></td></tr></table>";

function setupFollowUps() {
  ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === 'runFollowUps').forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('runFollowUps').timeBased().everyDays(1).atHour(9).create();
  return 'Follow-ups scheduled daily at 9 AM (' + Session.getScriptTimeZone() + ')';
}

function runFollowUps() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const out = [];
  fuSheet_(ss.getSheetByName('Website Leads'), { date: 0, source: 1, type: 2, status: 3, name: 4, email: 5, address: 8, topic: 14, count: 21, log: 22 }, out);
  fuSheet_(ss.getSheetByName('Website Network'), { date: 0, status: 1, name: 2, email: 4, role: 6, count: 13, log: 14, network: true }, out);
  return out.length ? out.join('\n') : 'No follow-ups due today';
}

function fuSheet_(sheet, c, out) {
  if (!sheet || sheet.getLastRow() < 2) return;
  const width = Math.max(sheet.getLastColumn(), c.log + 1);
  const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, width).getValues();
  const now = new Date();
  values.forEach((r, i) => {
    const email = String(r[c.email] || '').trim();
    const name = String(r[c.name] || '').trim();
    const sent = Number(r[c.count]) || 0;
    if (!email || !/@/.test(email) || /test/i.test(name) || String(r[c.status]) !== 'New' || sent >= FU_DAYS.length) return;
    if (!c.network && /newsletter/i.test(String(r[c.source]))) return;
    const when = r[c.date] instanceof Date ? r[c.date] : new Date(r[c.date]);
    if (isNaN(when)) return;
    const days = Math.floor((now - when) / 86400000);
    if (days < FU_DAYS[sent]) return;
    const row = i + 2;
    const log = String(r[c.log] || '');
    // They answered us already: stop and note it.
    const after = Utilities.formatDate(when, Session.getScriptTimeZone(), 'yyyy/MM/dd');
    if (GmailApp.search('from:' + email + ' after:' + after, 0, 1).length) {
      sheet.getRange(row, c.count + 1).setValue(FU_DAYS.length);
      sheet.getRange(row, c.log + 1).setValue((log ? log + '\n' : '') + fuStamp_() + ' they replied, follow-ups stopped');
      out.push('Stopped (replied): ' + name);
      return;
    }
    const kind = c.network ? 'network' : (/contact/i.test(String(r[c.source])) ? 'contact' : 'deal');
    const msg = fuMessage_(kind, sent, {
      first: name.split(/\s+/)[0] || 'there',
      type: String(r[c.type] || 'funding'),
      address: String(r[c.address] || '').trim(),
      topic: String(r[c.topic] || '').trim(),
      role: String(r[c.role] || '').split(',')[0].trim(),
    });
    GmailApp.sendEmail(email, msg.subject, msg.text, { htmlBody: msg.html, from: FU_FROM, name: FU_NAME, replyTo: FU_FROM });
    sheet.getRange(row, c.count + 1).setValue(sent + 1);
    sheet.getRange(row, c.log + 1).setValue((log ? log + '\n' : '') + fuStamp_() + ' follow-up ' + (sent + 1) + ' sent');
    out.push('Follow-up ' + (sent + 1) + ' sent: ' + name + ' <' + email + '>');
  });
}

function fuStamp_() { return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'MMM d'); }

function fuMessage_(kind, step, d) {
  const book = 'https://clawpoint.capital/booking/';
  const deal = d.address ? 'your ' + d.type + ' request for ' + d.address : 'your ' + d.type + ' request';
  const T = {
    deal: [
      ['Quick check-in on ' + deal.replace(/^your /, 'your '),
       ['Hi ' + d.first + ',', 'Just checking in on ' + deal + '. Is the deal still moving forward?',
        'If you can, reply with where things stand (or any updated documents) and we\'ll keep things moving on our side.']],
      ['Following up on ' + deal,
       ['Hi ' + d.first + ',', 'Wanted to follow up once more. If your closing date is coming up, the sooner we have the details, the smoother it goes.',
        'Questions? Just hit reply, or grab a quick call here: <a href="' + book + '">book a call</a>.']],
      ['Should I close your file?',
       ['Hi ' + d.first + ',', 'I haven\'t heard back, so I\'ll assume the timing isn\'t right and close out ' + deal + ' for now.',
        'If anything changes, just reply to this email and we\'ll pick it right back up. Wishing you a smooth closing either way.']],
    ],
    contact: [
      ['Following up on your question',
       ['Hi ' + d.first + ',', 'Thanks again for reaching out' + (d.topic && !/general/i.test(d.topic) ? ' about ' + d.topic.toLowerCase() : '') + '. Did you get what you needed?',
        'If you still have questions, just reply here. Happy to help.']],
      ['Anything I can help with?',
       ['Hi ' + d.first + ',', 'Checking in one more time. If you have a deal coming up, we can usually tell you quickly whether we can fund it.',
        'Reply with a few details, or <a href="' + book + '">book a quick call</a>.']],
      ['Last note from me',
       ['Hi ' + d.first + ',', 'I don\'t want to fill your inbox, so this is my last follow-up.',
        'Whenever you have a deal that needs EMD, double close, Echo or Stack funding, just reply to this email.']],
    ],
    network: [
      ['Great to have you in the network',
       ['Hi ' + d.first + ',', 'Thanks for joining the Claw Point network' + (d.role ? ' as a ' + d.role.toLowerCase() : '') + '. Quick question: what kind of deals are you working on right now?',
        'Reply and let me know, so we can see where we can help each other close.']],
      ['Want to hop on a quick call?',
       ['Hi ' + d.first + ',', 'Following up. A 15-minute call is usually the fastest way to see how we can work together.',
        'Pick a time that works for you: <a href="' + book + '">book a call</a>.']],
      ['Keeping the door open',
       ['Hi ' + d.first + ',', 'Last follow-up from me. Whenever you have a deal that needs funding, or want to connect, just reply here.',
        'Glad to have you in the network.']],
    ],
  };
  const t = T[kind][step];
  const paras = t[1];
  const html = '<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#13201a">'
    + paras.map(p => '<p style="margin:0 0 14px">' + p + '</p>').join('')
    + '<p style="margin:0 0 18px">Talk soon,<br>Amira</p>' + FU_SIG
    + '<p style="margin:18px 0 0;font-size:11px;color:#8a9a94">Prefer not to get follow-ups? Just reply "stop".</p></div>';
  const text = paras.map(p => p.replace(/<[^>]+>/g, '')).join('\n\n') + '\n\nTalk soon,\nAmira\n\nAmira Borham, Claw Point Advisory\namira@clawpoint.capital · clawpoint.capital\n\nPrefer not to get follow-ups? Just reply "stop".';
  return { subject: t[0], html: html, text: text };
}

/** Sends one example of every follow-up to TEST_TO so you can see them. Does not touch the sheet. */
function previewFollowUps() {
  const TEST_TO = 'borhama525@gmail.com';
  const d = { first: 'Amira', type: 'EMD', address: '123 Main St, El Paso, TX', topic: 'General inquiry', role: 'Title company' };
  ['deal', 'contact', 'network'].forEach(k => [0, 1, 2].forEach(s => {
    const m = fuMessage_(k, s, d);
    GmailApp.sendEmail(TEST_TO, '[TEST ' + k + ' #' + (s + 1) + '] ' + m.subject, m.text, { htmlBody: m.html, from: FU_FROM, name: FU_NAME, replyTo: FU_FROM });
  }));
  return 'Sent 9 previews to ' + TEST_TO;
}
