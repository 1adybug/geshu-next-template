import { FC, useState } from "react"
import { StrictOmit } from "deepsea-tools"
import { FormDateRangePicker, FormDateRangePickerProps } from "soda-heroui"

import { getDateRangePickerInput } from "@/utils/getDateRangePickerInput"
import { getDateRangePickerOutput } from "@/utils/getDateRangePickerOutput"

export interface DateRangePickerProps extends StrictOmit<FormDateRangePickerProps<"timestamp">, "valueMode"> {}

export const DateRangePicker: FC<DateRangePickerProps> = ({ field, ...rest }) => {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <FormDateRangePicker<"timestamp">
            field={field}
            selectorIcon={
                field.state.value ? (
                    <svg aria-hidden="true" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em">
                        <path
                            d="M12 2a10 10 0 1010 10A10.016 10.016 0 0012 2zm3.36 12.3a.754.754 0 010 1.06.748.748 0 01-1.06 0l-2.3-2.3-2.3 2.3a.748.748 0 01-1.06 0 .754.754 0 010-1.06l2.3-2.3-2.3-2.3A.75.75 0 019.7 8.64l2.3 2.3 2.3-2.3a.75.75 0 011.06 1.06l-2.3 2.3z"
                            fill="currentColor"
                        ></path>
                    </svg>
                ) : undefined
            }
            isOpen={isOpen}
            onOpenChange={isOpen => (field.state.value && isOpen ? field.handleChange(null as unknown as undefined) : setIsOpen(isOpen))}
            value={getDateRangePickerInput(field.state.value as [number, number] | undefined)}
            onChange={value => field.handleChange(getDateRangePickerOutput(value))}
            {...rest}
        />
    )
}
