# SODFA — Filter & Phone Search Update

## Device filter flow
- Series is always the first step.
- Model filter is hidden until a series is selected.
- Selecting a series clears the selected model.
- Models are limited to the selected series and models that are actually referenced by products on the current page/category.
- Product results are hidden until a model is selected after choosing a series.
- When a model is selected, only the parent product assigned to that model or the exact variants assigned to that model are rendered. Matching variants are not replaced by the parent product.
- Applied consistently to home, products, category, and offers pages.

## Phone search
- "Find by Your Phone" now checks variant names, values, colors, linked model names, and parent product/model names.
- If a matching variant exists, the search result renders that exact variant card (name, image, price, color, and variant link) instead of the parent product card.
- Multiple products/variants sharing the same searched model/property can appear.
- If no matching variant exists, a matching parent product can still appear.

## Languages
- Added Arabic/English translation keys for the updated filter/search UI and replaced the updated customer-facing hardcoded labels with i18n keys.
