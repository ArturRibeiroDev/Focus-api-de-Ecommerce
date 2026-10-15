-- Data-preserving conversion for legacy text identifiers. Existing migrations are
-- immutable; this migration maps every old key to a generated integer and rewrites
-- all dependent foreign keys before replacing the old columns.
BEGIN;
CREATE TEMP TABLE _user_ids ON COMMIT DROP AS SELECT id AS old_id, row_number() OVER (ORDER BY id)::integer AS new_id FROM users;
CREATE TEMP TABLE _product_ids ON COMMIT DROP AS SELECT id AS old_id, row_number() OVER (ORDER BY id)::integer AS new_id FROM products;
CREATE TEMP TABLE _cart_ids ON COMMIT DROP AS SELECT id AS old_id, row_number() OVER (ORDER BY id)::integer AS new_id FROM carts;
CREATE TEMP TABLE _cart_item_ids ON COMMIT DROP AS SELECT id AS old_id, row_number() OVER (ORDER BY id)::integer AS new_id FROM cart_items;
CREATE TEMP TABLE _order_ids ON COMMIT DROP AS SELECT id AS old_id, row_number() OVER (ORDER BY id)::integer AS new_id FROM orders;
CREATE TEMP TABLE _order_item_ids ON COMMIT DROP AS SELECT id AS old_id, row_number() OVER (ORDER BY id)::integer AS new_id FROM order_items;

ALTER TABLE carts DROP CONSTRAINT carts_user_id_fkey;
ALTER TABLE cart_items DROP CONSTRAINT cart_items_cart_id_fkey, DROP CONSTRAINT cart_items_product_id_fkey;
ALTER TABLE orders DROP CONSTRAINT orders_user_id_fkey;
ALTER TABLE order_items DROP CONSTRAINT order_items_order_id_fkey, DROP CONSTRAINT order_items_product_id_fkey;
ALTER TABLE users DROP CONSTRAINT users_pkey;
ALTER TABLE products DROP CONSTRAINT products_pkey;
ALTER TABLE carts DROP CONSTRAINT carts_pkey;
DROP INDEX carts_user_id_key;
ALTER TABLE cart_items DROP CONSTRAINT cart_items_pkey;
DROP INDEX cart_items_cart_id_product_id_key;
ALTER TABLE orders DROP CONSTRAINT orders_pkey;
ALTER TABLE order_items DROP CONSTRAINT order_items_pkey;
DROP INDEX IF EXISTS order_items_order_id_product_id_key;

ALTER TABLE users ADD COLUMN id_new SERIAL;
ALTER TABLE products ADD COLUMN id_new SERIAL;
ALTER TABLE carts ADD COLUMN id_new SERIAL;
ALTER TABLE cart_items ADD COLUMN id_new SERIAL;
ALTER TABLE orders ADD COLUMN id_new SERIAL;
ALTER TABLE order_items ADD COLUMN id_new SERIAL;
ALTER TABLE carts ADD COLUMN user_id_new INTEGER;
ALTER TABLE cart_items ADD COLUMN cart_id_new INTEGER, ADD COLUMN product_id_new INTEGER;
ALTER TABLE orders ADD COLUMN user_id_new INTEGER;
ALTER TABLE order_items ADD COLUMN order_id_new INTEGER, ADD COLUMN product_id_new INTEGER;

UPDATE users t SET id_new = m.new_id FROM _user_ids m WHERE t.id = m.old_id;
UPDATE products t SET id_new = m.new_id FROM _product_ids m WHERE t.id = m.old_id;
UPDATE carts t SET id_new = m.new_id FROM _cart_ids m WHERE t.id = m.old_id;
UPDATE cart_items t SET id_new = m.new_id FROM _cart_item_ids m WHERE t.id = m.old_id;
UPDATE orders t SET id_new = m.new_id FROM _order_ids m WHERE t.id = m.old_id;
UPDATE order_items t SET id_new = m.new_id FROM _order_item_ids m WHERE t.id = m.old_id;

UPDATE carts c SET user_id_new = u.new_id FROM _user_ids u WHERE c.user_id = u.old_id;
UPDATE cart_items c SET cart_id_new = x.new_id FROM _cart_ids x WHERE c.cart_id = x.old_id;
UPDATE cart_items c SET product_id_new = p.new_id FROM _product_ids p WHERE c.product_id = p.old_id;
UPDATE orders o SET user_id_new = u.new_id FROM _user_ids u WHERE o.user_id = u.old_id;
UPDATE order_items i SET order_id_new = o.new_id FROM _order_ids o WHERE i.order_id = o.old_id;
UPDATE order_items i SET product_id_new = p.new_id FROM _product_ids p WHERE i.product_id = p.old_id;

ALTER TABLE users DROP COLUMN id;
ALTER TABLE products DROP COLUMN id;
ALTER TABLE carts DROP COLUMN id, DROP COLUMN user_id;
ALTER TABLE cart_items DROP COLUMN id, DROP COLUMN cart_id, DROP COLUMN product_id;
ALTER TABLE orders DROP COLUMN id, DROP COLUMN user_id;
ALTER TABLE order_items DROP COLUMN id, DROP COLUMN order_id, DROP COLUMN product_id;

ALTER TABLE users RENAME COLUMN id_new TO id;
ALTER TABLE products RENAME COLUMN id_new TO id;
ALTER TABLE carts RENAME COLUMN id_new TO id;
ALTER TABLE cart_items RENAME COLUMN id_new TO id;
ALTER TABLE orders RENAME COLUMN id_new TO id;
ALTER TABLE order_items RENAME COLUMN id_new TO id;
ALTER TABLE carts RENAME COLUMN user_id_new TO user_id;
ALTER TABLE cart_items RENAME COLUMN cart_id_new TO cart_id;
ALTER TABLE cart_items RENAME COLUMN product_id_new TO product_id;
ALTER TABLE orders RENAME COLUMN user_id_new TO user_id;
ALTER TABLE order_items RENAME COLUMN order_id_new TO order_id;
ALTER TABLE order_items RENAME COLUMN product_id_new TO product_id;

ALTER TABLE users ADD CONSTRAINT users_pkey PRIMARY KEY (id);
ALTER TABLE products ADD CONSTRAINT products_pkey PRIMARY KEY (id);
ALTER TABLE carts ADD CONSTRAINT carts_pkey PRIMARY KEY (id);
CREATE UNIQUE INDEX carts_user_id_key ON carts(user_id);
ALTER TABLE cart_items ADD CONSTRAINT cart_items_pkey PRIMARY KEY (id);
CREATE UNIQUE INDEX cart_items_cart_id_product_id_key ON cart_items(cart_id, product_id);
ALTER TABLE orders ADD CONSTRAINT orders_pkey PRIMARY KEY (id);
ALTER TABLE order_items ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);
CREATE UNIQUE INDEX order_items_order_id_product_id_key ON order_items(order_id, product_id);

ALTER TABLE carts ADD CONSTRAINT carts_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE cart_items ADD CONSTRAINT cart_items_cart_id_fkey FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE cart_items ADD CONSTRAINT cart_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE orders ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE order_items ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE order_items ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT ON UPDATE CASCADE;

SELECT setval(pg_get_serial_sequence('users', 'id'), COALESCE((SELECT MAX(id) FROM users), 1), EXISTS(SELECT 1 FROM users));
SELECT setval(pg_get_serial_sequence('products', 'id'), COALESCE((SELECT MAX(id) FROM products), 1), EXISTS(SELECT 1 FROM products));
SELECT setval(pg_get_serial_sequence('carts', 'id'), COALESCE((SELECT MAX(id) FROM carts), 1), EXISTS(SELECT 1 FROM carts));
SELECT setval(pg_get_serial_sequence('cart_items', 'id'), COALESCE((SELECT MAX(id) FROM cart_items), 1), EXISTS(SELECT 1 FROM cart_items));
SELECT setval(pg_get_serial_sequence('orders', 'id'), COALESCE((SELECT MAX(id) FROM orders), 1), EXISTS(SELECT 1 FROM orders));
SELECT setval(pg_get_serial_sequence('order_items', 'id'), COALESCE((SELECT MAX(id) FROM order_items), 1), EXISTS(SELECT 1 FROM order_items));

COMMIT;
