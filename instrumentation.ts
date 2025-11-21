import dayjs from "dayjs"

export async function register() {
    await import("@ant-design/v5-patch-for-react-19")
    await import("dayjs/locale/zh-cn")
    dayjs.locale("zh-cn")
}
