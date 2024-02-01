import { Context, Hono } from "hono";
import { auth } from "../lucia";
import { github } from "@lucia-auth/oauth/providers";
import { setCookie, getCookie } from "hono/cookie";
import { OAuthRequestError } from "@lucia-auth/oauth";

const app = new Hono<Env>();

const gh = (c: Context<Env>) =>
  github(auth(c.env.DB), {
    clientId: c.env.GITHUB_CLIENT_ID ?? "",
    clientSecret: c.env.GITHUB_CLIENT_SECRET ?? "",
  });

app.get("/login/github", async (c) => {
  const [url, state] = await gh(c).getAuthorizationUrl();
  setCookie(c, "github_oauth_state", state, {
    httpOnly: true,
    secure: c.env.ENV === "production",
    path: "/",
    maxAge: 60 * 60,
  });
  return c.redirect(url.toString());
});

app.get("/login/github/callback", async (c) => {
  const a = auth(c.env.DB);
  const storedState = getCookie(c, "github_oauth_state");
  const { code, state } = c.req.query();
  // validate state
  if (
    !storedState ||
    !state ||
    storedState !== state ||
    typeof code !== "string"
  ) {
    return c.text("Bad request", 400);
  }
  try {
    const { getExistingUser, githubUser, createUser } = await gh(
      c
    ).validateCallback(code);

    const getUser = async () => {
      const existingUser = await getExistingUser();
      if (existingUser) return existingUser;
      const user = await createUser({
        attributes: {
          username: githubUser.login,
        },
      });
      return user;
    };

    const user = await getUser();
    const session = await a.createSession({
      userId: user.userId,
      attributes: {},
    });
    const authRequest = a.handleRequest(c);
    authRequest.setSession(session);
    return c.redirect("/");
  } catch (e) {
    if (e instanceof OAuthRequestError) {
      // invalid code
      return c.text("Bad request", 400);
    }
    return c.text("An unknown error occurred", 500);
  }
});

app.get("/logout", async (c) => {
  const a = auth(c.env.DB);
  const authRequest = a.handleRequest(c);
  const session = await authRequest.validate();
  if (!session) {
    return c.text("Unauthorized", 401);
  }
  await a.invalidateSession(session.sessionId);
  authRequest.setSession(null);
  // redirect back to login page
  return c.redirect("/");
});

export { app as loginController };
