import ConfirmDialog from './ConfirmDialog'

type CustomConfirmDialogProps = {
    title: string
    isOpen: boolean
    onDialogClose: () => void
    onDeleteConfirm: () => void
}

const CustomConfirmDialog = (props: CustomConfirmDialogProps) => {
    const { title, isOpen, onDialogClose, onDeleteConfirm } = props

    return (
        <ConfirmDialog
            isOpen={isOpen}
            type="danger"
            title={`Delete ${title}`}
            confirmButtonColor="red-600"
            onClose={onDialogClose}
            onRequestClose={onDialogClose}
            onCancel={onDialogClose}
            onConfirm={onDeleteConfirm}
        >
            <p>
                Are you sure you want to delete this {title}? All record related
                to this {title} will be deleted as well. This action cannot be
                undone.
            </p>
        </ConfirmDialog>
    )
}

export default CustomConfirmDialog
