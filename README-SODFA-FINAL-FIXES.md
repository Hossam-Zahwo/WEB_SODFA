# SODFA — WhatsApp + Series/Models hierarchy

## Required SQL
Run `supabase/migrations/20260927_sodfa_whatsapp_series.sql` once in Supabase SQL Editor. It: fixes `order_number_seq`, creates the WhatsApp setting, creates Series, links every Model to a Series, and creates Series image storage/RLS.

## Admin flow
1. Dashboard → رقم واتساب استقبال الطلبات: save the receiving number.
2. Admin → السلاسل: create Arabic/English series and optional image.
3. Admin → الموديلات: create Arabic/English model, image, and select its Series.
4. Admin → المنتجات: select the Model before saving.

## Store flow
Series filter → Model filter → products on the same page. Selecting a series automatically narrows the available models to that series.

## WhatsApp checkout
The checkout reads the WhatsApp number from `store_settings` immediately before creating the order. If no number is configured, the order is not submitted and WhatsApp is not opened. The saved customer name, phone, governorate, address, notes, products, quantities, shipping and total are included in the generated WhatsApp message.
