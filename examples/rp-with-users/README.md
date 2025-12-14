# rp-with-users（有本地用户体系：绑定模式）

该示例演示“绑定模式”：第三方网站有自己的用户体系（本地用户），用户用 MyApp 登录时，会把 `issuer + sub` 绑定到本地账号。

## 运行

1. 在主项目“接入管理”创建 Client：
    - `client_id`: `rp-with-users`（或你自定义）
    - `client_secret`: 生成一个
    - `redirect_uris`: `http://localhost:4002/api/auth/callback/myapp`
    - `grant_types`: `authorization_code`
    - `is_first_party`: `false`（第三方应显示授权提示）
2. 复制 `.env.example` 为 `.env.local`，填写上述信息
3. 安装并启动：
    - `bun install`
    - `bun run dev`

## 行为（对齐 Google）

- 本站退出：只会退出本站（清本站 Cookie），不影响 MyApp 账号中心和其他第三方
- 撤销授权：应在 MyApp 账号中心的“已连接应用”里进行
