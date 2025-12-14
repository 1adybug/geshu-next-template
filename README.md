# 项目介绍

格数科技 Next.js 项目模板

## env 文件

根据项目需求，env 文件分为服务端环境变量和公共环境环境变量，服务端环境变量仅服务端可以读取，公共环境环境变量客户端和服务端都能读取。

```env
# 服务端环境变量，仅服务端可以读取
OIDC_ISSUER="http://localhost:3000/api/oidc"
OIDC_JWKS='{"keys":[{"kty":"RSA","kid":"...","use":"sig","alg":"RS256","n":"...","e":"...","d":"..."}]}'
OIDC_COOKIE_KEYS="dev-key-1,dev-key-2"
NEXT_TELEMETRY_DISABLED="1"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="change-me"
ALIYUN_ACCESS_KEY_ID="ALIYUN_ACCESS_KEY_ID"
ALIYUN_ACCESS_KEY_SECRET="ALIYUN_ACCESS_KEY_SECRET"
QJP_SMS_URL="QJP_SMS_URL"

# 可选：内网短信通道开关
IS_INTRANET="0"
```
