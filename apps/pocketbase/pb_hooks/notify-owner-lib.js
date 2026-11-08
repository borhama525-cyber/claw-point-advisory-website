// Emails the business owner when a visitor submits a form. Loaded with require() from
// notify-owner.pb.js, because PocketBase hook handlers can't see top-level functions.
// The address comes from OWNER_NOTIFY_EMAIL when set, otherwise the default below.
const DEFAULT_TO = "clawpointadvisory@gmail.com";

const esc = (v) => String(v == null ? "" : v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const money = (v) => (v === "" || v == null || isNaN(Number(v)) || Number(v) === 0 ? "" : "$" + String(Math.round(Number(v))).replace(/\B(?=(\d{3})+(?!\d))/g, ","));

const LABELS = {
    deal_requests: { subject: (r) => `New ${r.get("method")} funding request: ${r.get("first_name")} ${r.get("last_name")}`, intro: "A new deal funding request was submitted on your website." },
    enquiries: { subject: (r) => `New website enquiry: ${r.get("name") || r.get("email")}`, intro: "A new enquiry was sent from your website’s contact form." },
    contacts: { subject: (r) => `New newsletter sign-up: ${r.get("email")}`, intro: "Someone signed up for updates on your website." },
};

const FIELDS = {
    deal_requests: [
        ["Deal type", "method"], ["Borrower", (r) => `${r.get("first_name")} ${r.get("last_name")}`], ["Email", "email"], ["Phone", "phone"],
        ["Property", (r) => `${r.get("address")}, ${r.get("city")}, ${r.get("state")} ${r.get("zip")}`], ["Target close date", (r) => String(r.get("close_date")).slice(0, 10)],
        ["Purchase price", (r) => money(r.get("purchase_price"))], ["Seller finance", (r) => money(r.get("seller_finance"))], ["B–C price / ARV", (r) => money(r.get("resale_price"))],
        ["Primary loan", (r) => money(r.get("primary_loan"))], ["Requested funding", (r) => money(r.get("requested_funding"))],
        ["Documents", (r) => { const n = 1 + (r.get("documents") || []).length; return `${n} file${n > 1 ? "s" : ""} (open the request in your dashboard to download)`; }],
        ["Description", "description"], ["Referred by", (r) => [r.get("referrer_first_name"), r.get("referrer_last_name")].filter(Boolean).join(" ")], ["Referrer email", "referrer_email"],
    ],
    enquiries: [["Name", "name"], ["Email", "email"], ["Phone", "phone"], ["Message", "message"]],
    contacts: [["Email", "email"], ["Name", "name"]],
};

function notifyOwner(app, record) {
    const name = record.collection().name;
    const label = LABELS[name];
    if (!label) return;
    const to = $os.getenv("OWNER_NOTIFY_EMAIL") || DEFAULT_TO;
    const rows = FIELDS[name]
        .map(([title, key]) => [title, typeof key === "function" ? key(record) : record.get(key)])
        .filter(([, value]) => value !== "" && value != null && String(value).trim() !== "");
    const cell = (title, value) => title === "Email" || title === "Referrer email"
        ? `<a href="mailto:${esc(value)}">${esc(value)}</a>`
        : esc(value).replace(/\n/g, "<br>");
    const html = `<div style="font-family:Arial,sans-serif;color:#141a17;max-width:620px">
<p style="font-size:15px">${esc(label.intro)}</p>
<table style="border-collapse:collapse;width:100%;font-size:14px">${rows.map(([t, v]) => `<tr><td style="padding:8px 12px 8px 0;color:#55665f;vertical-align:top;white-space:nowrap">${esc(t)}</td><td style="padding:8px 0;border-bottom:1px solid #e3ece9">${cell(t, v)}</td></tr>`).join("")}</table>
<p style="font-size:12px;color:#55665f;margin-top:18px">To reply, email the address above. Sent automatically by the Claw Point Advisory website.</p></div>`;
    const text = `${label.intro}\n\n${rows.map(([t, v]) => `${t}: ${v}`).join("\n")}`;
    const meta = app.settings().meta;
    app.newMailClient().send(new MailerMessage({
        from: { address: meta.senderAddress, name: meta.senderName || "Claw Point Advisory" },
        to: [{ address: to }],
        subject: label.subject(record),
        html,
        text,
    }));
}

module.exports = { notifyOwner };
