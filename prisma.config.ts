import { defineConfig } from "prisma/config"

import { DatabaseUrl } from "./constants"

export default defineConfig({
    datasource: {
        url: DatabaseUrl,
    },
})
