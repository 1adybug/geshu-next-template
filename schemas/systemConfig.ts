import { getParser } from "."
import { z } from "zod/v4"

export interface SystemConfigParams {
    allowRegister: boolean
    enableEmailPassword: boolean
    enableEmailOtp: boolean
    enablePhonePassword: boolean
    enablePhoneOtp: boolean
    defaultEmailDomain: string
}

export const defaultSystemConfig: SystemConfigParams = {
    allowRegister: false,
    enableEmailPassword: true,
    enableEmailOtp: true,
    enablePhonePassword: true,
    enablePhoneOtp: true,
    defaultEmailDomain: "geshu.ai",
}

export const systemConfigSchema: z.ZodType<SystemConfigParams> = z.object(
    {
        allowRegister: z.boolean({ message: "无效的注册配置" }),
        enableEmailPassword: z.boolean({ message: "无效的邮箱密码配置" }),
        enableEmailOtp: z.boolean({ message: "无效的邮箱验证码配置" }),
        enablePhonePassword: z.boolean({ message: "无效的手机号密码配置" }),
        enablePhoneOtp: z.boolean({ message: "无效的手机号验证码配置" }),
        defaultEmailDomain: z.string({ message: "无效的默认邮箱域名" }).trim().min(1, { message: "默认邮箱域名不能为空" }),
    },
    { message: "无效的系统配置" },
)

export const systemConfigParser = getParser(systemConfigSchema)
