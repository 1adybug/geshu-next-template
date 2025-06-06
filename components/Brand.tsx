import { ComponentProps, FC } from "react"
import { clsx } from "deepsea-tools"
import Link from "next/link"
import { StrictOmit } from "soda-type"

export interface BrandClassNames {
    mainWrapper?: string
    link?: string
    logoWrapper?: string
    logo?: string
    text?: string
}

export interface BrandProps extends StrictOmit<ComponentProps<"h1">, "children"> {
    classNames?: BrandClassNames
}

// h-full flex-none pl-10

const Brand: FC<BrandProps> = ({ classNames: { mainWrapper, link, logoWrapper, logo, text } = {}, className, ...rest }) => (
    <h1 className={clsx(mainWrapper, className)} {...rest}>
        <Link href="/" className={clsx("flex items-center gap-3", link)}>
            <div className={clsx("flex", logoWrapper)}>
                <img src="/geshu.svg" alt="logo" width={32} className={logo} />
            </div>
            <div className={clsx("text-lg font-bold", text)}>格数科技项目管理</div>
        </Link>
    </h1>
)

export default Brand
