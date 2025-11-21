import { readdir, stat } from "fs/promises"
import { join } from "path"

import { deleteFileOrFolder } from "@/utils/deleteFileOrFolder"

import { createAction } from "./createAction"

await deleteFileOrFolder("actions")

async function build(dir: string) {
    const content = await readdir(dir)

    for (const item of content) {
        const path = join(dir, item)
        const stats = await stat(path)

        if (stats.isDirectory()) await build(path)
        else await createAction(path)
    }
}

build("shared")
