# 示例项目（第三方接入方 Relying Party）

本目录提供两个最小化示例项目（Next.js 16 + Ant Design），用于演示第三方如何接入本仓库的 OIDC 账号中心（MyApp IdP）。

- `examples/rp-pure`：无本地用户体系（纯依赖模式），直接使用 MyApp 的 `sub` 作为用户标识
- `examples/rp-with-users`：有本地用户体系（绑定模式），把 MyApp 的 `issuer + sub` 绑定到本地用户

端口约定：

- `rp-pure`：`http://localhost:4001`
- `rp-with-users`：`http://localhost:4002`

运行前准备（两者都一样）：

1. 启动本仓库的主项目（IdP）：`bun run dev`
2. 进入主项目“接入管理”，为每个示例分别创建一个 Client（`is_first_party` 请保持 `false`，以便出现授权提示）
    - `rp-pure` 的 `redirect_uris`：`http://localhost:4001/api/auth/callback/myapp`
    - `rp-with-users` 的 `redirect_uris`：`http://localhost:4002/api/auth/callback/myapp`
3. 进入示例项目目录，复制 `.env.example` 为 `.env.local`，填入 client 信息并启动
