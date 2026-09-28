# SODFA – New Updates

This ZIP is the full source archive supplied by the project owner, with the requested additions applied without deleting existing files.

## Added
1. Dashboard series ordering with persistent `display_order`.
2. Mobile hero using the same slide content/details as desktop in a responsive full-width slider layout.
3. Quick product/variant price + stock editing from the products table, with a single "حفظ التعديلات" action.
4. Safe WhatsApp settings persistence that does not depend on an `ON CONFLICT` constraint on `store_settings.id`.

## Database
Run `SODFA_ADDITIVE_UPDATES.sql` separately in Supabase before testing the new series ordering.


## Latest two fixes

- WhatsApp settings no longer assume `store_settings.id = 1` or an id constraint. The app reads the current settings row and updates it by its actual id; an empty table is initialized without forcing an id value.
- Storefront product grids now include active variants as independent product cards by default. Product detail pages still show the selected product together with its own variants.
