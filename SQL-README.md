# SODFA product models and variant types

1. Open the Supabase project connected to this storefront.
2. Go to **SQL Editor**.
3. Open and run `sql/20260927_product_models_and_variant_types.sql` once.
4. Refresh the dashboard and open **الموديلات** to add Arabic/English model names and upload an image.
5. In **المنتجات**, select the model on the parent product. If the product has variants, choose a variation type (color/model/size/storage/material/other) and enter its value.

The migration is idempotent and preserves existing product and variant rows. Existing variant types are normalized in the dashboard when edited; legacy data is not deleted.

Note: the supplied ZIP contained the application's `src/` tree only, so the updated ZIP preserves that project scope and adds the SQL migration and this setup note. Keep the original repository's package/config files when applying these source changes.
