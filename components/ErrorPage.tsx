import { ComponentProps, FC } from "react"
import { IconArrowLeft } from "@tabler/icons-react"
import { clsx } from "deepsea-tools"
import Link from "next/link"

import Brand from "@/components/Brand"

interface ErrorPageProps extends ComponentProps<"div"> {
    code: number | string
    title: string
    description: string
    href: string
    link: string
    image: string
}

const ErrorPage: FC<ErrorPageProps> = ({ code, title, description, href, link, image, className, ...rest }) => {
    return (
        <div className={clsx("grid h-full grid-cols-1 sm:grid-cols-2", className)} {...rest}>
            <div className="relative p-8">
                <Brand />
                <div className="absolute left-8 top-1/2 -translate-y-1/2">
                    <div className="text-base leading-loose text-primary">{code}</div>
                    <div className="mt-4 text-[60px] font-bold leading-none">{title}</div>
                    <div className="mt-8 text-xl leading-8 text-foreground-500">{description}</div>
                    <div className="mt-10 text-sm leading-loose text-primary">
                        <Link href={href}>
                            <IconArrowLeft className="inline-block h-5 w-5 align-text-bottom" /> {link}
                        </Link>
                    </div>
                </div>
            </div>
            <div className="hidden bg-cover bg-bottom sm:block" style={{ backgroundImage: `url(${image})` }} />
        </div>
    )
}

export default ErrorPage
