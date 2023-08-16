import { Config } from "drizzle-kit";

export default {
    schema: "./src/schema.ts",
    out: "./migrations"
} satisfies Config;