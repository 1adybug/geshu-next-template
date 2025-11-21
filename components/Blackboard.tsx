import { ComponentProps, FC, Fragment, ReactNode } from "react"

import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/react"
import { StrictOmit } from "soda-type"

export interface BlackboardProps extends StrictOmit<ComponentProps<typeof Modal>, "children"> {
    header?: ReactNode
    body?: ReactNode
}

const Blackboard: FC<BlackboardProps> = ({ header, body, ...rest }) => (
    <Modal size="2xl" {...rest}>
        <ModalContent>
            {onClose => (
                <Fragment>
                    <ModalHeader>{header}</ModalHeader>
                    <ModalBody>
                        <div className="max-h-[calc(100vh_-_360px)] overflow-y-auto text-sm">{body}</div>
                    </ModalBody>
                    <ModalFooter>
                        <Button size="sm" color="primary" onPress={onClose}>
                            确定
                        </Button>
                    </ModalFooter>
                </Fragment>
            )}
        </ModalContent>
    </Modal>
)

export default Blackboard
