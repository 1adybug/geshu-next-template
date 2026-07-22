import config from "@1adybug/eslint"

const eslintConfig = [
    ...config,
    {
        files: ["shared/**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}"],
        rules: {
            "prefer-arrow-callback": "off",
        },
    },
]

export default eslintConfig
