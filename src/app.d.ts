/// <reference types="lucia" />

declare namespace Lucia {
  type Auth = import("./lucia").Auth;
  type DatabaseUserAttributes = {
    username: string;
  };
  type DatabaseSessionAttributes = {};
}

type Env = {
  Bindings: {
    DB: D1Database;
    GITHUB_CLIENT_ID: string;
    GITHUB_CLIENT_SECRET: string;
    ENV: string;
  };
  Variables: {
    session: import("lucia").Session | null;
    auth: import("lucia").Auth;
    authRequest: import("lucia").AuthRequest<import("lucia").Auth>;
  };
};

type AuthEnv = Env & { Variables: { session: import("lucia").Session } };
