import { InferModel } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const todos = sqliteTable("todos", {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    checked: integer("checked", { mode: "boolean" }).notNull().default(false),
});

export type Todo = InferModel<typeof todos>;