// src/components/shared/EditBillingForm.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Button, Input } from "@/components/ui";
// DatePicker ab use nahi hoga, isliye isko hata rahe hain
// import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css';

interface EditBillingFormProps {
    item: any; // The item data to be edited
    onSave: (updatedItem: any) => void;
    onCancel: () => void;
}

const EditBillingForm: React.FC<EditBillingFormProps> = ({ item, onSave, onCancel }) => {
    // Form fields ki values ko manage karne ke liye state
    const [formData, setFormData] = useState(item);

    // Jab 'item' prop change ho (matlab naya item edit ho raha hai), to form data ko update karein
    useEffect(() => {
        // Sirf woh fields set karein jinhein edit karna hai, aur jin ki values change ho sakti hain.
        // GrossWeight aur Amount to calculate honge.
        // Date, Quality, DC Number ab form mein nahi honge, lekin unki original values ko
        // formData mein rakhna zaroori hai agar backend ko unki zaroorat hai.
        setFormData({
            ...item, // Original item ke saare fields rakho
            // weightPure aur weightMixing ko number mein convert kar ke rakho agar string hain
            weightPure: parseFloat(item.weightPure) || 0,
            weightMixing: parseFloat(item.weightMixing) || 0,
            rate: parseFloat(item.rate) || 0,
            extraRate:parseFloat(item.extraRate) || 0,

            // GrossWeight aur Amount ki initial calculation ensure karein
            grossWeight: (parseFloat(item.weightPure) || 0) + (parseFloat(item.weightMixing) || 0),
            extraAmount: ((parseFloat(item.weightPure) || 0) + (parseFloat(item.weightMixing) || 0)) * (parseFloat(item.rate) || 0), 
            amount: ((parseFloat(item.weightPure) || 0) + (parseFloat(item.weightMixing) || 0)) * (parseFloat(item.extraRate) || 0),
            totalAmount:
            (((parseFloat(item.weightPure) || 0) + (parseFloat(item.weightMixing) || 0)) * (parseFloat(item.rate) || 0)) +
            (((parseFloat(item.weightPure) || 0) + (parseFloat(item.weightMixing) || 0)) * (parseFloat(item.extraRate) || 0)),

        });
    }, [item]);

    // Input fields change hone par state update karna
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const parsedValue = parseFloat(value) || 0; // weightPure, weightMixing, rate sab numbers honge

        setFormData(prevFormData => ({
            ...prevFormData,
            [name]: parsedValue,
        }));
    };

    // DatePicker ab use nahi hoga, isliye iske handler ki zarurat nahi
    // const handleDateChange = (date: Date | null) => {
    //     if (date) {
    //         setFormData({ ...formData, date: date.toISOString() });
    //     } else {
    //         setFormData({ ...formData, date: null });
    //     }
    // };

    // --- USEEFFECT FOR AUTOMATIC CALCULATIONS ---
    useEffect(() => {
        const pure = parseFloat(formData.weightPure) || 0;
        const mixing = parseFloat(formData.weightMixing) || 0;
        const currentRate = parseFloat(formData.rate) || 0;
        const extraRate = parseFloat(formData.extraRate) || 0;
        

        // Calculate grossWeight
        const calculatedGrossWeight = pure + mixing;

        // Calculate amount
        const calculatedAmount = calculatedGrossWeight * currentRate;

      const extraAmount = calculatedGrossWeight * extraRate;

      const totalAmount = extraAmount + calculatedAmount

        setFormData(prevFormData => {
            // Sirf tab update karein jab values actual mein change hon
            if (prevFormData.grossWeight !== calculatedGrossWeight || prevFormData.amount !== calculatedAmount || prevFormData.extraAmount !== extraAmount || prevFormData.totalAmount !== totalAmount) {
                return {
                    ...prevFormData,
                    grossWeight: calculatedGrossWeight,
                    amount: calculatedAmount,
                    extraAmount: extraAmount,
                    totalAmount: totalAmount

                };
            }
            return prevFormData; // Koi change nahi hua to state update na karein
        });
    }, [formData.weightPure, formData.weightMixing, formData.rate, formData.extraRate ]); // Dependencies jin par calculation depend karti hai
    // --- USEEFFECT END ---

    // Form submit hone par
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // onSave ko jo formData bheja jayega usmein date, quality, dcNumber ki original values bhi hongi
        // kyunke setFormData(item) mein ...item shamil hai.
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Date Field, Quality Field, DC Number Field ko remove kar diya */}
                {/* Total Weight Field (Gross Weight) ko bhi remove kar diya yahan se */}

                {/* --- NAYE FIELDS: Weight Pure --- */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Weight Pure</label>
                    <Input
                        name="weightPure"
                        value={formData.weightPure || ''}
                        onChange={handleChange}
                        type="number"
                        className="mt-1 block w-full"
                    />
                </div>

                {/* --- NAYE FIELDS: Weight Mixing --- */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Weight Mixing</label>
                    <Input
                        name="weightMixing"
                        value={formData.weightMixing || ''}
                        onChange={handleChange}
                        type="number"
                        className="mt-1 block w-full"
                    />
                </div>

                {/* Rate Field */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Rate</label>
                    <Input
                        name="rate"
                        value={formData.rate || ''}
                        onChange={handleChange}
                        type="number"
                        className="mt-1 block w-full"
                    />
                </div>

                {/* Amount Field (Ab disabled aur calculated) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Amount</label>
                    <Input
                        name="amount"
                        value={formData.amount || ''}
                        readOnly // Make it read-only
                        className="mt-1 block w-full bg-gray-100 cursor-not-allowed" // Styling for disabled
                    />
                </div>

            <div>
                    <label className="block text-sm font-medium text-gray-700">Rate</label>
                    <Input
                        name="extraRate"
                        value={formData.extraRate || ''}
                        onChange={handleChange}
                        type="number"
                        className="mt-1 block w-full"
                    />
                </div>


                <div>
                    <label className="block text-sm font-medium text-gray-700">extra amount</label>
                    <Input
                        name="extraAmount"
                        value={formData.extraAmount || ''}
                        readOnly // Make it read-only
                        className="mt-1 block w-full bg-gray-100 cursor-not-allowed" // Styling for disabled
                    />
                </div>

                 <div>
                    <label className="block text-sm font-medium text-gray-700">total amount</label>
                    <Input
                        name="totalAmount"
                        value={formData.totalAmount || ''}
                        readOnly // Make it read-only
                        className="mt-1 block w-full bg-gray-100 cursor-not-allowed" // Styling for disabled
                    />
                </div>



            </div>

            {/* Buttons */}
            <div className="mt-6 flex justify-end gap-2">
                <Button variant="plain" onClick={onCancel} type="button">
                    Cancel
                </Button>
                <Button variant="solid" type="submit">
                    Save Changes
                </Button>
            </div>
        </form>
    );
};

export default EditBillingForm;