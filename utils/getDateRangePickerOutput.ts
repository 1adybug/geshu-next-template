import { DateValue, RangeValue } from "@heroui/react"
import dayjs from "dayjs"
import { getTimeValue } from "soda-heroui"

export function getDateRangePickerOutput(value: RangeValue<DateValue> | null): [number, number] | undefined {
    if (!value) return undefined
    return [dayjs(getTimeValue(value.start)).startOf("day").valueOf(), dayjs(getTimeValue(value.end)).endOf("day").valueOf()]
}
