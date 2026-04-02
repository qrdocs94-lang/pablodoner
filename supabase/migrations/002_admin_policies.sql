-- ============================================================
-- PABLO DÖNER — Admin & Kitchen RLS Policies
-- Run this after 001_schema.sql
-- ============================================================

-- Kitchen display + admin: update order status
CREATE POLICY "anon_update_orders" ON orders
  FOR UPDATE USING (true) WITH CHECK (true);

-- Admin: read ALL products (including inactive ones)
CREATE POLICY "anon_read_all_products" ON products
  FOR SELECT USING (true);

-- Admin: create new products
CREATE POLICY "anon_insert_products" ON products
  FOR INSERT WITH CHECK (true);

-- Admin: edit products
CREATE POLICY "anon_update_products" ON products
  FOR UPDATE USING (true) WITH CHECK (true);

-- Admin: delete products
CREATE POLICY "anon_delete_products" ON products
  FOR DELETE USING (true);

-- Admin: read all categories (including inactive)
CREATE POLICY "anon_read_all_categories" ON categories
  FOR SELECT USING (true);

-- Admin: insert/update/delete categories
CREATE POLICY "anon_insert_categories" ON categories
  FOR INSERT WITH CHECK (true);

CREATE POLICY "anon_update_categories" ON categories
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "anon_delete_categories" ON categories
  FOR DELETE USING (true);
