import { mkdir, readFile, writeFile } from "fs/promises"
import { join, parse, relative } from "path"
import { watch } from "chokidar"
import { isNonNullable } from "deepsea-tools"

import { deleteFileOrFolder } from "../utils/deleteFileOrFolder"

export async function watchShared() {
    await deleteFileOrFolder("actions")

    const watcher = watch("shared", {
        awaitWriteFinish: true,
        persistent: true,
    })

    async function createAction(path: string) {
        path = relative("shared", path).replace(/\\/g, "/")
        const { dir, name, ext } = parse(path)
        if (ext !== ".ts" && ext !== ".tsx" && ext !== ".js" && ext !== ".jsx") return
        const serverContent = await readFile(join("shared", path), "utf-8")
        const match = serverContent.match(new RegExp(`export async function ${name}\\(.+?: (.+?)Params\\)`, "s"))
        const schema = match?.[1].replace(/^./, char => char.toLowerCase())
        const hasSchema = isNonNullable(schema) && serverContent.includes(`from "@/schemas/${schema}"`)

        const content = `"use server"
${
    hasSchema
        ? `
import { ${schema}Schema } from "@/schemas/${schema}"
`
        : ""
}
import { ${name} } from "@/shared/${join(dir, name)}"

import { createResponseFn } from "@/utils/createResponseFn"

export const ${name}Action = createResponseFn({
    fn: ${name},${
        hasSchema
            ? `
    schema: ${schema}Schema,`
            : ""
    }
    name: "${name}",
})
`
        const actionPath = join("actions", path)
        await mkdir(join("actions", dir), { recursive: true })
        await writeFile(actionPath, content)
        console.log(`${actionPath} created`)
    }

    watcher.on("add", createAction)

    watcher.on("change", createAction)

    watcher.on("unlink", async path => {
        path = relative("shared", path).replace(/\\/g, "/")
        const actionPath = join("actions", path)
        await deleteFileOrFolder(actionPath)
        console.log(`${actionPath} deleted`)
    })

    watcher.on("unlinkDir", async path => {
        path = relative("shared", path).replace(/\\/g, "/")
        const actionPath = join("actions", path)
        await deleteFileOrFolder(actionPath)
        console.log(`${actionPath} deleted`)
    })
}

watchShared()
