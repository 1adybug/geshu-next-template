// @ts-check

import { parse } from "path"
import { globSync } from "glob"

/**
 * 数组去重
 * @template T - 数组的元素类型
 * @param {T[]} array - 输入的数组
 * @return {T[]} 新数组
 */
function unique(array) {
    return Array.from(new Set(array))
}

const jsExts = [".js", ".jsx", ".ts", ".tsx", ".cjs", ".mjs", ".cts", ".mts", ".vue"]

const assetExts = unique(
    globSync("**/*", { ignore: ["node_modules/**", ".next/**"], withFileTypes: true, cwd: import.meta.dirname })
        .filter(path => path.isFile() && !jsExts.some(ext => path.name.toLowerCase().endsWith(ext)))
        .map(path => parse(path.name).ext.slice(1))
        .filter(ext => ext !== ""),
)

const assetExtsRegStr = `\\.(${assetExts.join("|")}|${assetExts.join("|").toUpperCase()})`

const assetQueryRegStr = "(\\?[a-zA-Z0-9]+)?"

const folders = unique(
    globSync("**/*", { withFileTypes: true, cwd: import.meta.dirname, ignore: ["node_modules/**", ".next/**"] })
        .filter(path => path.isDirectory())
        .map(path => path.name),
).sort()

/**
 * @type {import("prettier").Options}
 */
const config = {
    semi: false,
    tabWidth: 4,
    arrowParens: "avoid",
    printWidth: 160,
    plugins: ["@ianvs/prettier-plugin-sort-imports", "prettier-plugin-tailwindcss"],
    importOrder: [
        "^react(/.+)?$",
        "^react-dom(/.+)?$",
        "^react-native(/.+)?$",
        "<BUILTIN_MODULES>",
        "^@[^/]",
        "<THIRD_PARTY_MODULES>",
        ...folders.map(folder => ["", `^@/?${folder}(.+?(?<!${assetExtsRegStr}${assetQueryRegStr}))?$`]).flat(),
        "",
        `^@/.+?(?<!${assetExtsRegStr}${assetQueryRegStr})$`,
        `^\\.{1,2}/.+?(?<!${assetExtsRegStr}${assetQueryRegStr})$`,
        "",
        `^@/.+?${assetExtsRegStr}${assetQueryRegStr}$`,
        `^\\.{1,2}/.+?${assetExtsRegStr}${assetQueryRegStr}$`,
    ],
    importOrderParserPlugins: ["typescript", "jsx", "decorators-legacy"],
    importOrderTypeScriptVersion: "5.0.0",
    importOrderCaseSensitive: true,
}

export default config
