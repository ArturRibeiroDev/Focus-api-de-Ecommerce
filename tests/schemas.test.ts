import test from "node:test";
import assert from "node:assert/strict";
import { registerSchema, loginSchema } from "../src/modules/auth/auth-schema.js";
import { productQuerySchema, productSchema, productUpdateSchema } from "../src/modules/products/product-schema.js";
import { addCartItemSchema } from "../src/modules/carts/cart-schema.js";

test("auth schemas normalize e-mail and reject invalid credentials", () => {
  const registration = registerSchema.parse({ body: { name: "Eduarda", email: " EDUARDA@example.com ", password: "SenhaForte123!" } });
  assert.equal(registration.body.email, "eduarda@example.com");
  assert.equal(loginSchema.safeParse({ body: { email: "bad", password: "x" } }).success, false);
});

test("product inputs enforce money, stock, category and bounded pagination", () => {
  assert.equal(productSchema.safeParse({ body: { name: "Notebook", description: "", price: -1, stock: 1, categoryId: 1 } }).success, false);
  assert.deepEqual(productQuerySchema.parse({ page: "2", limit: "10", search: " laptop " }), { page: 2, limit: 10, search: "laptop" });
  assert.equal(productQuerySchema.safeParse({ page: "0", limit: "101" }).success, false);
  assert.equal(productSchema.safeParse({ body: { name: "Notebook", description: "", price: 1.239, stock: 1, categoryId: 1 } }).success, false);
  assert.equal(productSchema.safeParse({ body: { name: "Notebook", description: "", price: 1, stock: 2_147_483_648, categoryId: 1 } }).success, false);
  assert.equal(productUpdateSchema.safeParse({ body: {} }).success, false);
});

test("cart schema accepts only positive integer quantities and IDs", () => {
  assert.equal(addCartItemSchema.safeParse({ body: { productId: 2, quantity: 1 } }).success, true);
  assert.equal(addCartItemSchema.safeParse({ body: { productId: 2, quantity: 0 } }).success, false);
});
