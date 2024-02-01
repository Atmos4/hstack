import { zValidator } from "@hono/zod-validator";
import { Context, Hono } from "hono";
import { z } from "zod";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { TodoItem } from "../components";
import { Todo, todos } from "../schema";
import { checkAuthMiddleware } from "../lucia";
import { Session } from "lucia";

const app = new Hono<AuthEnv>();

const ensureOwner = (s: Session, t: Todo | undefined) =>
  s.user.userId === t?.userId;

app.use("*", checkAuthMiddleware);

app.post(
  "/new",
  zValidator(
    "form",
    z.object({
      title: z.string().min(1).max(40),
    })
  ),
  async (c) => {
    const newTodo = await drizzle(c.env.DB)
      .insert(todos)
      .values({ ...c.req.valid("form"), userId: c.get("session").user.userId })
      .returning()
      .get();
    return c.html(<TodoItem {...newTodo} />);
  }
);

app.delete("/delete/:id{[0-9]+}", async (c) => {
  const id = parseInt(c.req.param().id);
  const db = drizzle(c.env.DB);
  const t = await db.select().from(todos).where(eq(todos.id, id)).get();

  if (ensureOwner(c.get("session"), t)) {
    await drizzle(c.env.DB).delete(todos).where(eq(todos.id, id)).run();
  }

  return c.html("");
});

app.post("/toggle/:id{[0-9]+}", async (c) => {
  const toggleId = parseInt(c.req.param().id);
  const db = drizzle(c.env.DB);
  const oldTodo = await db
    .select()
    .from(todos)
    .where(eq(todos.id, toggleId))
    .get();

  if (oldTodo && ensureOwner(c.get("session"), oldTodo)) {
    const newTodo = await db
      .update(todos)
      .set({ checked: !oldTodo?.checked })
      .where(eq(todos.id, toggleId))
      .returning()
      .get();
    return c.html(<TodoItem {...newTodo} />);
  }
});

export { app as todoController };
