import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { drizzle } from "drizzle-orm/d1";
import { todos } from "./schema";
import { eq } from "drizzle-orm";
import { Layout, MainPage, TodoItem } from "./components";
import { serveStatic } from "hono/cloudflare-workers";

type Env = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Env }>();

app.get("/favicon.ico", serveStatic({ path: "./favicon.ico" }));

app.get("/", async (c) => {
  const data = await drizzle(c.env.DB).select().from(todos).all();
  return c.html(
    <Layout>
      <MainPage todos={data} />
    </Layout>
  );
});

app.post(
  "/new-todo",
  zValidator(
    "form",
    z.object({
      title: z.string().nonempty().max(40),
    })
  ),
  async (c) => {
    const newTodo = await drizzle(c.env.DB)
      .insert(todos)
      .values(c.req.valid("form"))
      .returning()
      .get();
    return c.html(<TodoItem {...newTodo} />);
  }
);

app.delete("/todos/delete/:id{[0-9]+}", async (c) => {
  await drizzle(c.env.DB)
    .delete(todos)
    .where(eq(todos.id, parseInt(c.req.param().id)))
    .run();
  return c.html("");
});

app.post("/todos/toggle/:id{[0-9]+}", async (c) => {
  const toggleId = parseInt(c.req.param().id);
  const db = drizzle(c.env.DB);
  const oldTodo = await db
    .select()
    .from(todos)
    .where(eq(todos.id, toggleId))
    .get();
  if (oldTodo) {
    const newTodo = await db
      .update(todos)
      .set({ checked: !oldTodo?.checked })
      .where(eq(todos.id, toggleId))
      .returning()
      .get();
    return c.html(<TodoItem {...newTodo} />);
  }
});

export default app;
