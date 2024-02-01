import { html } from "hono/html";
import { Todo } from "./schema";
import { themes } from "./themes";

export function Layout({ children }: { children?: any }) {
  return html`<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>h stack</title>
        <script src="https://unpkg.com/htmx.org@1.9.3"></script>
        <script src="https://unpkg.com/hyperscript.org@0.9.9"></script>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@unocss/reset/tailwind.min.css"
        />
        <link rel="stylesheet" href="/style.css" />
      </head>
      <body class="h-screen p-6 max-w-2xl mx-auto">
        ${children}
      </body>
    </html> `;
}

export const AuthControl = (props: { username?: string }) => (
  <div class="navbar flex-col sm:flex-row">
    <div class="flex-1 flex">
      <div class="dropdown">
        <label tabindex={0} class="btn btn-ghost btn-circle">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h7"
            />
          </svg>
        </label>
        <ul
          tabindex={0}
          class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
        >
          {themes.map((t) => (
            <li>
              <button
                onClick={`htmx.find('html').setAttribute('data-theme','${t}')`}
              >
                {t[0].toUpperCase() + t.substring(1)}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <h1 class="flex-1 text-3xl font-bold p-2">h stack</h1>
    </div>
    <div class="flex-none gap-2">
      {props.username ? (
        <>
          <span>{props.username}</span>
          <a class="btn normal-case" href="/logout">
            Logout
          </a>
        </>
      ) : (
        <a class="btn normal-case" href="/login/github">
          Sign in with GitHub
        </a>
      )}
    </div>
  </div>
);

export function TodoItem(props: Todo) {
  return (
    <form class="flex items-center gap-2 text-lg p-2">
      <label class="w-full flex gap-2 leading-snug cursor-pointer">
        <input
          class="checkbox mr-1"
          type="checkbox"
          checked={props.checked}
          hx-post={`/todo/toggle/${props.id}`}
          id={`${props.id}`}
        />
        {props.checked ? <s>{props.title}</s> : props.title}
      </label>
      {props.checked && (
        <button
          class="btn btn-ghost btn-circle w-8 h-8 min-h-0 -m-1"
          hx-delete={`/todo/delete/${props.id}`}
        >
          <div class="i-mdi-close text-xl"></div>
        </button>
      )}
    </form>
  );
}

export function MainPage(props: { todos: Todo[] }) {
  return (
    <>
      <article class="p-4 mb-4" hx-swap="outerHTML" hx-target="closest form">
        {props.todos.map((todo) => (
          <TodoItem {...todo} />
        ))}
      </article>

      <form
        method="post"
        hx-post="/todo/new"
        hx-swap="beforeend"
        hx-target="previous article"
        _="on submit target.reset()"
        class="join w-full"
      >
        <input
          name="title"
          placeholder="new todo"
          maxlength={40}
          required
          type="text"
          class="input join-item input-bordered w-full"
          autocomplete="off"
        />
        <button class="btn join-item">add</button>
      </form>
      <a class="link" href="https://github.com/Atmos4/hstack">
        source code
      </a>
    </>
  );
}
