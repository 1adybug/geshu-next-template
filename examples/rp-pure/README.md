# rp-pure（无本地用户体系）

该示例演示“纯依赖模式”：第三方网站不自建账号体系，直接使用 MyApp 的 `sub` 作为用户标识。

## 运行

1. 在主项目“接入管理”创建 Client：
    - `client_id`: `rp-pure`（或你自定义）
    - `client_secret`: 生成一个
    - `redirect_uris`: `http://localhost:4001/api/auth/callback/myapp`
    - `grant_types`: `authorization_code`（需要刷新再加 `refresh_token`）
    - `is_first_party`: `false`（第三方应显示授权提示）
2. 复制 `.env.example` 为 `.env.local`，填写上述信息
3. 安装并启动：
    - `bun install`
    - `bun run dev`

## 行为

- “退出”只会退出本站（清 Cookie），不会影响 MyApp 账号中心和其他第三方（对齐 Google）
- 受保护资源示例：`/api/me` 会用 Introspection 校验 Access Token
