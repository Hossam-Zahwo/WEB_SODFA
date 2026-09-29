SODFA - Safe Main Variant Type Patch

Files included:
- src/routes/admin.products.tsx
- src/lib/productCatalogVariant.ts
- SODFA_variant_type_fix_safe.sql

What this patch does:
- Preserves the existing product save flow.
- After a successful product save, synchronizes the main variation metadata
  to public.product_catalog when that row exists.
- Saves the selected variation type to product_catalog.product_type.
- Saves the selected variation value to product_catalog.attributes.variant_value.
- Preserves all existing attributes keys.
- Does not reset or delete data.
- Does not modify or drop database tables.
- The SQL file is read-only verification/documentation; it contains no destructive migration.

Important:
The uploaded project still contains older data-access code that references tables
such as products/product_models/product_images. This patch deliberately does NOT
rewrite those paths, because doing so would be a broader schema migration and could
break existing functionality. The patch is therefore limited to the requested
main-variation-type synchronization.
