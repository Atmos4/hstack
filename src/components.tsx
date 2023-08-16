import { html } from "hono/html";
import { Todo } from "./schema";

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
          href="https://cdn.simplecss.org/simple.min.css"
        />
        <style>
          :root {
            --accent: white;
          }
        </style>
      </head>
      ${children}
    </html> `;
}

export function TodoItem(props: Todo) {
  return (
    <div>
      <input
        type="checkbox"
        checked={props.checked}
        hx-post={`/todos/toggle/${props.id}`}
      />
      {props.checked ? <s>{props.title}</s> : props.title}
      <code
        style="cursor:pointer"
        role="button"
        hx-delete={`/todos/delete/${props.id}`}
      >
        {" "}
        x
      </code>
    </div>
  );
}

export function MainPage(props: { todos: Todo[] }) {
  return (
    <body>
      <h1>h stack</h1>
      <div hx-swap="outerHTML" hx-target="closest div">
        {props.todos.map((todo) => (
          <TodoItem {...todo} />
        ))}

        <form
          method="post"
          hx-post="/new-todo"
          hx-swap="beforebegin"
          hx-target="this"
          _="on submit target.reset()"
        >
          <input
            name="title"
            placeholder="new todo"
            maxlength="40"
            required
            type="text"
          />
          <button>add</button>
        </form>
      </div>
      <a href="https://github.com/Atmos4/hstack">source code</a>
    </body>
  );
}
