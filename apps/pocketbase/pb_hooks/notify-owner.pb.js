/// <reference path="../pb_data/types.d.ts" />
// Emails the owner (clawpointadvisory@gmail.com by default) about each new website submission.
// A failed email never blocks the submission: it is logged instead.
onRecordAfterCreateSuccess((e) => {
    try {
        require(`${__hooks}/notify-owner-lib.js`).notifyOwner(e.app, e.record);
    } catch (err) {
        e.app.logger().error("Owner notification email failed", "collection", e.record.collection().name, "error", String(err));
    }
    e.next();
}, "deal_requests", "enquiries", "contacts");
