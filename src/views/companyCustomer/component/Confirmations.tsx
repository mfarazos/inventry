import { useState, useEffect } from 'react';
import Dialog from '@/components/ui/Dialog';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

type CustomConfirmDialogProps = {
  isOpen: boolean;
  onDialogClose: () => void;
  createCustomer: (name: string) => void;
  customerName: string; // Pass customer name to pre-fill the input
};

const Confirmations = (props: CustomConfirmDialogProps) => {
  const { isOpen, onDialogClose, createCustomer, customerName } = props;
  const [name, setName] = useState(customerName); // Pre-fill the input with the passed name

  useEffect(() => {
    setName(customerName); // Update the name if it changes
  }, [customerName]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value); // Update the state with the input value
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onDialogClose}
      onRequestClose={onDialogClose}
    >
      <h5 className="mb-4">{customerName ? 'Edit Customer' : 'Add Customer'}</h5>
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
          onClick={() => createCustomer(name)} // Call createCustomer with the name
        >
          {customerName ? 'save' : 'Add'}
        </Button>
      </div>
    </Dialog>
  );
};

export default Confirmations;
