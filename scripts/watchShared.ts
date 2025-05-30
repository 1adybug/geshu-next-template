import { mkdir, readFile, rm, writeFile } from "fs/promises"
import { join, parse, relative } from "path"
import { watch } from "chokidar"

export async function watchShared() {
    await rm("actions", { recursive: true, force: true })

    const watcher = watch("shared", {
        awaitWriteFinish: true,
        persistent: true,
    })

    watcher.on("add", async path => {
        path = relative("shared", path).replace(/\\/g, "/")
        const { dir, name, ext } = parse(path)
        if (ext !== ".ts" && ext !== ".tsx" && ext !== ".js" && ext !== ".jsx") return
        const serverContent = await readFile(join("shared", path), "utf-8")
        const hasSchema = serverContent.includes(`@/schemas`)

        const content = `"use server"
${hasSchema ? `
import { ${name}Schema } from "@/schemas/${name}"` : ""}
import { ${name} } from "@/shared/${join(dir, name)}"
import { createResponseFn } from "@/utils/createResponseFn"

export const ${name}Action = createResponseFn(${hasSchema ? `${name}Schema, ` : ""}${name})
`
        const actionPath = join("actions", path)
        await mkdir(join("actions", dir), { recursive: true })
        await writeFile(actionPath, content)
        console.log(`${actionPath} created`)
    })

    watcher.on("unlink", async path => {
        path = relative("shared", path).replace(/\\/g, "/")
        const actionPath = join("actions", path)
        await rm(actionPath, { force: true })
        console.log(`${actionPath} deleted`)
    })

    watcher.on("unlinkDir", async path => {
        path = relative("shared", path).replace(/\\/g, "/")
        const actionPath = join("actions", path)
        await rm(actionPath, { recursive: true, force: true })
        console.log(`${actionPath} deleted`)
    })
}

watchShared()
