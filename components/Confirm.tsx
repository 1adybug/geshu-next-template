import { ComponentProps, FC, Fragment, ReactNode } from "react"
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/react"
import { isNonNullable } from "deepsea-tools"
import { StrictOmit } from "soda-type"

export interface ConfirmProps extends StrictOmit<ComponentProps<typeof Modal>, "children" | "title"> {
    title?: ReactNode
    description?: ReactNode
    onConfirm?: () => void
    color?: ComponentProps<typeof Button>["color"]
}

const Confirm: FC<ConfirmProps> = ({ title, description, onConfirm, color = "danger", ...rest }) => {
    return (
        <Modal {...rest}>
            <ModalContent>
                {onClose => (
                    <Fragment>
                        {isNonNullable(title) && <ModalHeader>{title}</ModalHeader>}
                        {isNonNullable(description) && <ModalBody>{description}</ModalBody>}
                        <ModalFooter>
                            <Button variant="light" onPress={onClose}>
                                取消
                            </Button>
                            <Button color={color} onPress={onConfirm}>
                                确认
                            </Button>
                        </ModalFooter>
                    </Fragment>
                )}
            </ModalContent>
        </Modal>
    )
}

export default Confirm
