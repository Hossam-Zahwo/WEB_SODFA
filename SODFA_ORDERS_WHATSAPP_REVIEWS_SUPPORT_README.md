# SODFA — Orders, WhatsApp checkout, reviews, and customer support

This is the full SODFA source archive based on the previously accepted full project, with only the requested additions applied.

## What changed

### 1. WhatsApp order checkout
- The order is saved in the dashboard/database **before** WhatsApp is opened.
- If saving the order fails, WhatsApp is not opened and the customer receives a clear error so the order cannot silently disappear from the dashboard.
- On mobile, the site first attempts the installed WhatsApp app using the documented `whatsapp://` scheme, then falls back to the public `https://wa.me/` Click-to-Chat link if the browser does not hand off to the app.
- On desktop, the normal WhatsApp Web/Click-to-Chat link is used.

### 2. Customer data
- The existing order keeps the customer's name, phone, governorate, address, notes, items, totals, and status.
- The SQL migration adds `customer_contacts`, automatically synchronized from newly created orders, so the store has a reusable customer record for future follow-up.

### 3. Review workflow
- Delivered orders can generate a review link from the dashboard.
- The link is sent to the customer's WhatsApp with a pre-filled message.
- The generated review URL is also shown in the order card and can be copied manually.
- Customer reviews remain moderated through the existing Reviews dashboard: new reviews can stay hidden until approved.
- Review-request writes no longer depend on an `ON CONFLICT` constraint on `order_id`.

### 4. Customer support button
- A floating customer-service button is visible on the storefront.
- It intentionally uses a call-center/headset visual rather than a WhatsApp logo.
- It opens the same WhatsApp number currently configured in the dashboard, with a pre-filled support message.
- Arabic and English labels/messages are included.

## Database migration
Run:

`SODFA_ORDERS_CUSTOMERS_SUPPORT_REVIEWS.sql`

The migration is additive and contains no `DROP`, `DELETE`, or `TRUNCATE` statements.

## Important

The existing store WhatsApp number remains controlled from the dashboard. No second hard-coded customer-facing number was introduced.
