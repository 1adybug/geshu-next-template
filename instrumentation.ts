import { existsSync } from "node:fs"

import { spawnAsync } from "soda-nodejs"

import { DatabaseUrl } from "./prisma.config"

export const runtime = "nodejs"

export async function register() {
    if (!existsSync(DatabaseUrl.replace(/^file:/, ""))) {
        await spawnAsync("npx prisma db push", {
            stdio: "inherit",
            shell: true,
        })
    }
}
