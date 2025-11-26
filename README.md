# 项目介绍

格数科技 Next.js 项目模板

## env 文件

根据项目需求，env 文件分为服务端环境变量和公共环境环境变量，服务端环境变量仅服务端可以读取，公共环境环境变量客户端和服务端都能读取。

```env
# 服务端环境变量，仅服务端可以读取
DATABASE_URL="postgresql://postgres:123456@localhost:5432/postgres"
JWT_SECRET="123456"
NEXT_TELEMETRY_DISABLED="1"
ALIYUN_ACCESS_KEY_ID="ALIYUN_ACCESS_KEY_ID"
ALIYUN_ACCESS_KEY_SECRET="ALIYUN_ACCESS_KEY_SECRET"
QJP_SMS_URL="QJP_SMS_URL"
PUBLIC_API_URL="http://localhost:3000"
OIDC_ISSUER="http://localhost:3000/api/oidc"
OIDC_SELF_CLIENT_ID="geshu-next-self"
OIDC_SELF_CLIENT_SECRET="geshu-next-self-secret"
OIDC_SELF_REDIRECT_URI="http://localhost:3000/api/auth/oidc/callback"
OIDC_COOKIE_KEY="please-change-this-cookie-key"

# 公共环境环境变量，客户端和服务端都能读取
NEXT_PUBLIC_LOGIN_PATHNAME="/login"
NEXT_PUBLIC_COOKIE_PREFIX="NEXT_PUBLIC_COOKIE_PREFIX"
```

可选：如果需要为第三方系统预置客户端，可在 `.env` 中添加 `OIDC_CLIENTS='[{"client_id":"demo","client_secret":"demo-secret","redirect_uris":["http://localhost:4000/callback"]}]'`。
