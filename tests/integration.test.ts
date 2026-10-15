import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";
import { config as loadDotEnv } from "dotenv";

loadDotEnv();
const configuredDatabaseUrl = process.env.DATABASE_URL;
const testDatabaseUrl = process.env.TEST_DATABASE_URL;

if (!testDatabaseUrl) {
  it.skip("HTTP e concorrência (defina TEST_DATABASE_URL para um banco descartável)", () => {});
} else {
  const databaseName = new URL(testDatabaseUrl).pathname.slice(1);
  if (!/(^|[_-])test($|[_-])/.test(databaseName) || testDatabaseUrl === configuredDatabaseUrl) {
    throw new Error("TEST_DATABASE_URL deve apontar para um banco separado cujo nome identifique test.");
  }

  process.env.DATABASE_URL = testDatabaseUrl;
  process.env.JWT_SECRET ||= "integration-test-secret-with-at-least-32-bytes-long";
  process.env.BCRYPT_SALT_ROUNDS ||= "4";

  const [{ app }, { prisma }] = await Promise.all([
    import("../src/app.js"),
    import("../src/config/prisma.js"),
  ]);
  const request = (await import("supertest")).default;

  async function registerAndLogin(name: string) {
    const email = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}@example.test`;
    const registration = await request(app)
      .post("/api/auth/register")
      .send({ name, email, password: "StrongPassword123!" });
    assert.equal(registration.status, 201, JSON.stringify(registration.body));

    const login = await request(app)
      .post("/api/auth/login")
      .send({ email, password: "StrongPassword123!" });
    assert.equal(login.status, 200, JSON.stringify(login.body));
    assert.equal(login.body.tokenType, "Bearer");
    return login.body.accessToken as string;
  }

  async function createProduct(stock: number) {
    const category = await prisma.category.create({ data: { name: `category-${Date.now()}-${Math.random()}` } });
    return prisma.product.create({
      data: {
        name: "Concurrent item",
        description: "Test product",
        price: "19.95",
        stock,
        categoryId: category.id,
      },
    });
  }

  describe("HTTP integration and database concurrency", () => {
    before(async () => prisma.$connect());
    beforeEach(async () => {
      await prisma.$executeRawUnsafe('TRUNCATE TABLE "order_items", "orders", "cart_items", "carts", "products", "categories", "users" RESTART IDENTITY CASCADE');
    });
    after(async () => prisma.$disconnect());

    it("protects private routes and integrates registration/login", async () => {
      const denied = await request(app).get("/api/cart");
      assert.equal(denied.status, 401);
      const token = await registerAndLogin("Private User");
      const cart = await request(app).get("/api/cart").set("Authorization", `Bearer ${token}`);
      assert.equal(cart.status, 200);
      assert.deepEqual(cart.body.items, []);
    });

    it("returns a conflict for duplicate e-mail without exposing the password", async () => {
      const body = { name: "Duplicate User", email: "duplicate@example.test", password: "StrongPassword123!" };
      const first = await request(app).post("/api/auth/register").send(body);
      const duplicate = await request(app).post("/api/auth/register").send(body);
      assert.equal(first.status, 201);
      assert.equal("password" in first.body.user, false);
      assert.equal(duplicate.status, 409);
      assert.equal(duplicate.body.error.code, "EMAIL_ALREADY_EXISTS");
    });

    it("serializes concurrent adds to one cart without losing quantities", async () => {
      const token = await registerAndLogin("Cart User");
      const product = await createProduct(2);
      const add = () => request(app)
        .post("/api/cart/items")
        .set("Authorization", `Bearer ${token}`)
        .send({ productId: product.id, quantity: 1 });

      const responses = await Promise.all([add(), add()]);
      assert.deepEqual(responses.map((response) => response.status), [201, 201]);
      const cart = await request(app).get("/api/cart").set("Authorization", `Bearer ${token}`);
      assert.equal(cart.body.items.length, 1);
      assert.equal(cart.body.items[0].quantity, 2);
    });

    it("approves only one of two users competing for the last unit", async () => {
      const [firstToken, secondToken] = await Promise.all([
        registerAndLogin("Buyer One"),
        registerAndLogin("Buyer Two"),
      ]);
      const product = await createProduct(1);
      for (const token of [firstToken, secondToken]) {
        const added = await request(app)
          .post("/api/cart/items")
          .set("Authorization", `Bearer ${token}`)
          .send({ productId: product.id, quantity: 1 });
        assert.equal(added.status, 201, JSON.stringify(added.body));
      }

      const checkout = (token: string) => request(app)
        .post("/api/checkout")
        .set("Authorization", `Bearer ${token}`);
      const results = await Promise.all([checkout(firstToken), checkout(secondToken)]);
      assert.equal(results.filter((result) => result.status === 201).length, 1);
      assert.equal(results.filter((result) => result.status === 400).length, 1);
      assert.equal(await prisma.order.count(), 1);
      assert.equal((await prisma.product.findUniqueOrThrow({ where: { id: product.id } })).stock, 0);
    });

    it("does not duplicate checkout for simultaneous requests from one cart", async () => {
      const token = await registerAndLogin("Same Cart Buyer");
      const product = await createProduct(1);
      const added = await request(app)
        .post("/api/cart/items")
        .set("Authorization", `Bearer ${token}`)
        .send({ productId: product.id, quantity: 1 });
      assert.equal(added.status, 201);

      const checkout = () => request(app).post("/api/checkout").set("Authorization", `Bearer ${token}`);
      const results = await Promise.all([checkout(), checkout()]);
      assert.equal(results.filter((result) => result.status === 201).length, 1);
      assert.equal(results.filter((result) => result.status === 400).length, 1);
      assert.equal(await prisma.order.count(), 1);
      assert.equal((await prisma.product.findUniqueOrThrow({ where: { id: product.id } })).stock, 0);
      const cart = await request(app).get("/api/cart").set("Authorization", `Bearer ${token}`);
      assert.deepEqual(cart.body.items, []);
    });
  });
}
