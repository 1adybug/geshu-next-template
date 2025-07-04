import { mkdir, readFile, readdir, writeFile } from "fs/promises"
import { join, parse, relative } from "path"
import { isNonNullable } from "deepsea-tools"

await mkdir(".vscode", { recursive: true })

const content = await readdir(".vscode")

if (!content.includes("settings.json")) {
    await writeFile(
        ".vscode/settings.json",
        JSON.stringify(
            {
                "files.exclude": {
                    "actions/**": true,
                },
            },
            null,
            4,
        ),
    )
} else {
    const json = await readFile(".vscode/settings.json", "utf-8")
    const data = JSON.parse(json)
    data["files.exclude"] ??= {}
    data["files.exclude"]["actions/**"] = true
    await writeFile(".vscode/settings.json", JSON.stringify(data, null, 4))
}

export async function createAction(path: string) {
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
}
