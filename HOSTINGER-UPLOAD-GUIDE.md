# Uploading your Claw Point Advisory website to Hostinger

This package is the finished website, ready for any Hostinger **web hosting** plan
(Premium, Business or Cloud). No Node.js or extra setup is needed.

## What's in the zip

- The website pages (home, funding, calculators, guides, booking, Ask, contact, blog)
- `send.php`: emails every deal request (with uploaded documents), contact enquiry and
  newsletter sign-up to **clawpointadvisory@gmail.com**
- `sitemap.php`, `robots.php`, `llms.php`: these create `/sitemap.xml`, `/robots.txt` and
  `/llms.txt` with your domain filled in automatically
- `.htaccess`: turns on HTTPS, page addresses and the files above. It starts with a dot, so
  it may be hidden, but it **must** be uploaded too.

## Steps

1. Log in to **hPanel** → **Websites** → **Add website** (or choose your existing website) → **Manage**.
2. Open **Files → File Manager**, then open the **public_html** folder.
3. If `public_html` already has files (for example a default `default.php` or an old site),
   delete them first. Deleting can't be undone, so back up anything you need.
4. Click **Upload** and upload **claw-point-advisory-website-upload.zip**.
5. Right-click the zip → **Extract**, and extract it **into public_html itself**, not into a
   new subfolder. When it's done, `index.html` and `.htaccess` should sit directly inside
   `public_html`.
6. Delete the zip file from `public_html`.
7. In hPanel, open **Security → SSL** and make sure SSL is **Active** for your domain.
8. Visit your domain. You should see "Get your deal *moving.*"

## After it's live: a two-minute check

- Open **/booking**: your Calendly calendar should appear.
- Submit **one test** on the **Contact** page and one **deal request** with a small PDF.
  Both should arrive at clawpointadvisory@gmail.com within a few minutes.
  **Check the Spam folder the first time** and mark them "Not spam".
- Open **yourdomain.com/sitemap.xml**: it should list your pages with your domain.

## Good to know

- Emails come **from** `no-reply@yourdomain.com`. Pressing **Reply** answers the visitor directly.
- For the most reliable delivery, create a free email account for your domain in hPanel
  (**Emails**), so the domain has proper mail records.
- While the site is on a temporary `*.hostingersite.com` address, search engines are asked
  not to index it. That switches off automatically once your own domain is connected.
- To change where form emails go, edit the line `const TO_EMAIL = ...` at the top of `send.php`.
- Making changes to the website itself needs a rebuild from the project source code, not
  edits in File Manager. Ask me (or a developer) and re-upload the new package the same way.
