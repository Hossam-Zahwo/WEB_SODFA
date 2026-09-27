# SODFA variant independence and storefront filters

## Included changes
- Variant records can override Arabic/English names and descriptions independently; blank overrides inherit the parent product's text.
- Variant slug, category, model, featured/bestseller/new flags, active state, price, stock, SKU/barcode, and image gallery are managed independently where supported by the schema.
- The storefront uses the variant's own title when supplied and otherwise uses the variant value (for example, a color or model) instead of repeating the parent title.
- Product listing category and model filters use image-led, non-hover filter tiles. The model filter matches product-level and variant-level model assignments.
- Variant category/model are optional and inherit the parent product when left unset.

## Database
Run `20260927_sodfa_complete_models_variants.sql` in Supabase SQL Editor after taking a database backup. It combines the model/variant prerequisite migration with the new independent variant fields. It is designed to be rerunnable and preserves existing product, variant, and image records.

## Project scope
The supplied source archive contained `src/` only. This update packages the complete updated `src/` tree plus SQL and these notes; root build files such as `package.json` were not part of the provided archive.

## 2026-09-27 storefront UI refinements
- Product detail title now uses the selected variant's own Arabic/English title when a variant is selected instead of always showing the parent product title.
- The model shown on the product detail page follows the selected model variant when the variant type is `model`/`موديل`.
- The base-product option now displays the product's assigned model name (for example, `17 Pro Max`) instead of the parent product title.
- Product detail gallery thumbnails now use `object-contain` so the complete image content is visible without crop/zoom.
- Removed the `الكل` / all tile from both category and model filters on the products page.
- Category/model filter tiles no longer use borders; their images are larger, sit on a white background, and move upward slightly on hover while the labels remain unchanged.
