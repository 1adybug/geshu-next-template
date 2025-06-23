import { DateValue, RangeValue } from "@heroui/react"
import { CalendarDate } from "@internationalized/date"

export function getDateRangePickerInput(value: [number, number] | undefined): RangeValue<DateValue> | null {
    if (!value) return null
    const start = new Date(value[0])
    const end = new Date(value[1])
    return {
        start: new CalendarDate(start.getFullYear(), start.getMonth() + 1, start.getDate()),
        end: new CalendarDate(end.getFullYear(), end.getMonth() + 1, end.getDate()),
    }
}
