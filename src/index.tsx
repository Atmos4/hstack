import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { todos } from "./schema";
import { AuthControl, Layout, MainPage } from "./components";
import { serveStatic } from "hono/cloudflare-workers";
import { loginController } from "./controllers/login";
import { todoController } from "./controllers/todo";
import { authMiddleware } from "./lucia";
import { eq } from "drizzle-orm";

const app = new Hono<Env>();

app.get("/favicon.ico", serveStatic({ path: "./favicon.ico" }));
app.get("/style.css", serveStatic({ path: "./unocss.css" }));

app.route("/", loginController);

app.use("*", authMiddleware);
app.get("/", async (c) => {
  const session = c.get("session");
  if (!session) {
    return c.html(
      <Layout>
        <AuthControl />
      </Layout>
    );
  }
  const data = await drizzle(c.env.DB)
    .select()
    .from(todos)
    .where(eq(todos.userId, session.user.userId))
    .all();
  return c.html(
    <Layout>
      <AuthControl username={session.user.githubUsername} />
      <MainPage todos={data} />
    </Layout>
  );
});

app.route("/todo", todoController);

export default app;
