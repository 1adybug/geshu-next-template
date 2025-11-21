import { ComponentProps, FC } from "react"

import { Pagination as HeroPagination, Select, SelectItem } from "@heroui/react"
import { clsx, isNonNullable } from "deepsea-tools"
import { StrictOmit } from "soda-type"

export interface PaginationProps extends StrictOmit<ComponentProps<"div">, "children"> {
    pageSize?: number
    pageNum?: number
    total?: number
    onPageSizeChange?: (pageSize: number) => void
    onPageNumChange?: (pageNum: number) => void
}

const Pagination: FC<PaginationProps> = ({ className, pageSize, pageNum, total, onPageSizeChange, onPageNumChange, ...rest }) => (
    <div className={clsx("flex", className)} {...rest}>
        <div className="ml-auto text-sm leading-8 text-foreground-400">共计 {total} 条数据</div>
        <Select
            size="sm"
            classNames={{ base: "w-28 ml-4" }}
            selectedKeys={[`${pageSize ?? 10}`]}
            onSelectionChange={value => onPageSizeChange?.(Number(Array.from(value)[0]))}
            disallowEmptySelection
            aria-label="分页大小"
        >
            <SelectItem key={10}>10 条/页</SelectItem>
            <SelectItem key={20}>20 条/页</SelectItem>
            <SelectItem key={50}>50 条/页</SelectItem>
            <SelectItem key={100}>100 条/页</SelectItem>
        </Select>
        <HeroPagination
            classNames={{ base: "ml-2" }}
            page={pageNum ?? 1}
            total={isNonNullable(pageSize) && isNonNullable(total) ? Math.max(Math.ceil(total / pageSize), 1) : 1}
            size="sm"
            onChange={onPageNumChange}
        />
    </div>
)

export default Pagination
