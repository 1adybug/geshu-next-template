import dayjs from "dayjs"

export async function register() {
    await import("dayjs/locale/zh-cn")
    dayjs.locale("zh-cn")
}
