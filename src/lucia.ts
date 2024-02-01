import { UserSchema, lucia } from "lucia";
import { hono } from "lucia/middleware";
import { d1 } from "@lucia-auth/adapter-sqlite";
import { MiddlewareHandler } from "hono";

export const auth = (db: D1Database) =>
  lucia({
    env: "DEV", // "PROD" if deployed to HTTPS
    middleware: hono(),
    adapter: d1(db, {
      user: "user",
      key: "user_key",
      session: "user_session",
    }),
    getUserAttributes: (data: UserSchema) => {
      return {
        githubUsername: data.username,
      };
    },
  });

export const authMiddleware: MiddlewareHandler<Env> = async (c, next) => {
  const a = auth(c.env.DB);
  const authRequest = a.handleRequest(c);
  const session = await authRequest.validate();
  c.set("session", session);
  c.set("authRequest", authRequest);
  c.set("auth", a);
  await next();
};

export const checkAuthMiddleware: MiddlewareHandler = async (c, next) => {
  if (!c.get("session")) {
    return c.text("Bad request", 400);
  }
  await next();
};

export type Auth = ReturnType<typeof auth>;
