-- ============================================================
-- Migration 005: Extras-Kategorie + cash order_status
-- Run this in Supabase SQL Editor once
-- ============================================================

-- 1. Add 'cash' to order_status enum
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'cash';

-- 2. Move Getränke to sort_order 6 to make room for Extras at 5
UPDATE categories SET sort_order = 6 WHERE slug = 'getraenke';

-- 3. Insert Extras category (idempotent)
INSERT INTO categories (name, slug, icon, sort_order, is_active)
SELECT 'Extras', 'extras', '🫙', 5, true
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'extras');

-- 4. Insert sauce products (idempotent via NOT EXISTS)
DO $$
DECLARE
  cat_extras UUID;
BEGIN
  SELECT id INTO cat_extras FROM categories WHERE slug = 'extras';

  IF cat_extras IS NOT NULL THEN
    INSERT INTO products (category_id, name, description, price_cents, sort_order, is_active, options_schema)
    SELECT cat_extras, 'Ketchup', '', 50, 1, true, '[]'::jsonb
    WHERE NOT EXISTS (SELECT 1 FROM products WHERE category_id = cat_extras AND name = 'Ketchup');

    INSERT INTO products (category_id, name, description, price_cents, sort_order, is_active, options_schema)
    SELECT cat_extras, 'Mayo', '', 50, 2, true, '[]'::jsonb
    WHERE NOT EXISTS (SELECT 1 FROM products WHERE category_id = cat_extras AND name = 'Mayo');

    INSERT INTO products (category_id, name, description, price_cents, sort_order, is_active, options_schema)
    SELECT cat_extras, 'Currysauce', '', 50, 3, true, '[]'::jsonb
    WHERE NOT EXISTS (SELECT 1 FROM products WHERE category_id = cat_extras AND name = 'Currysauce');

    INSERT INTO products (category_id, name, description, price_cents, sort_order, is_active, options_schema)
    SELECT cat_extras, 'Knoblauchsauce', '', 100, 4, true, '[]'::jsonb
    WHERE NOT EXISTS (SELECT 1 FROM products WHERE category_id = cat_extras AND name = 'Knoblauchsauce');

    INSERT INTO products (category_id, name, description, price_cents, sort_order, is_active, options_schema)
    SELECT cat_extras, 'Kräutersauce', '', 100, 5, true, '[]'::jsonb
    WHERE NOT EXISTS (SELECT 1 FROM products WHERE category_id = cat_extras AND name = 'Kräutersauce');

    INSERT INTO products (category_id, name, description, price_cents, sort_order, is_active, options_schema)
    SELECT cat_extras, 'Scharfe Sauce', '', 100, 6, true, '[]'::jsonb
    WHERE NOT EXISTS (SELECT 1 FROM products WHERE category_id = cat_extras AND name = 'Scharfe Sauce');

    INSERT INTO products (category_id, name, description, price_cents, sort_order, is_active, options_schema)
    SELECT cat_extras, 'Juppi Sauce', '', 100, 7, true, '[]'::jsonb
    WHERE NOT EXISTS (SELECT 1 FROM products WHERE category_id = cat_extras AND name = 'Juppi Sauce');

    INSERT INTO products (category_id, name, description, price_cents, sort_order, is_active, options_schema)
    SELECT cat_extras, 'Samurai Sauce', '', 100, 8, true, '[]'::jsonb
    WHERE NOT EXISTS (SELECT 1 FROM products WHERE category_id = cat_extras AND name = 'Samurai Sauce');
  END IF;
END $$;
