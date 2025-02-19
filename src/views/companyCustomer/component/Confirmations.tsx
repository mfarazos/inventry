import { useRef, useState } from 'react'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import ConfirmDialog from '@/components/shared/ConfirmDialog'

type CustomConfirmDialogProps = {
    isOpen: boolean
    onDialogClose: () => void
    createCustomer:(name: string) => void
    
}

const Confirmations = (props: CustomConfirmDialogProps) => {
    const {  isOpen, onDialogClose, createCustomer } = props
    const [name, setName] = useState("");
   

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value); // Update the state with the input value
      };

    return (
        <>
           
            
            <Dialog
                isOpen={isOpen}
                onClose={onDialogClose}
                onRequestClose={onDialogClose}
            >
                <h5 className="mb-4">Add User</h5>
                <div>
                <Input
            type="text"
            value={name}
            onChange={handleNameChange} // Call the handler when input changes
          />
                </div>
                <div className="text-right mt-6">
                    <Button
                        size="sm"
                        className="ltr:mr-2 rtl:ml-2"
                        variant="plain"
                        onClick={onDialogClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        size="sm"
                        variant="solid"
                        onClick={() => createCustomer(name)}
                    >
                        Add
                    </Button>
                </div>
            </Dialog>
        </>
    )
}

export default Confirmations
