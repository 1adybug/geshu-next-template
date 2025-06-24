import { ComponentProps, FC } from "react"
import { Button, Link } from "@heroui/react"

import { type User } from "@/prisma/generated"

export interface UserProps extends Omit<ComponentProps<typeof Button<typeof Link>>, "children"> {
    data: Pick<User, "id" | "username">
}

const User: FC<UserProps> = ({ data: { id, username }, ...rest }) => (
    <Button
        as={Link}
        color="secondary"
        className="h-6 min-w-[none] [&:not(:last-child)]:mr-2"
        size="sm"
        radius="full"
        href={`/user-management/?id=${id}`}
        {...rest}
    >
        {username}
    </Button>
)

export default User
