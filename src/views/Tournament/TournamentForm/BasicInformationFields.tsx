import React, { useState } from "react";
import AdaptableCard from "@/components/shared/AdaptableCard";
import Input from "@/components/ui/Input";
import { FormItem } from "@/components/ui/Form";
import { Field, FormikErrors, FormikTouched } from "formik";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

type FormFieldsName = {
  clientName: string;
  quality: string;
  dcNumber: number;
  weight: "Pure" | "Mixing"; // Restricting options for select box
  grossWeight: number;
  billNo: number;
};


type BasicInformationFieldsProps = {
  touched: FormikTouched<FormFieldsName>;
  errors: FormikErrors<FormFieldsName>;
  page: "new" | "edit";
};

const BasicInformationFields = (props: BasicInformationFieldsProps) => {
  const { touched, errors, page } = props;

  // Local state to manage date values
  const [dates, setDates] = useState({
    tournamentStartDate: new Date(),
  });

  // Handle date changes locally
  const handleDateChange = (field: string, date: Date) => {
    setDates((prevDates) => ({
      ...prevDates,
      [field]: date,
    }));
  };

  return (
    <AdaptableCard divider className="mb-4">
      <h5>Client Info</h5>
      <p className="mb-6">Section to configure basic Client information</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="col-span-1">
      <FormItem
        label="Client Name"
        invalid={Boolean(errors.clientName && touched.clientName)}
        errorMessage={errors.clientName}
      >
        <Field type="text" autoComplete="off" name="clientName" component={Input} />
      </FormItem>
   </div>
   <div className="col-span-1">
      <FormItem
        label="quality"
        invalid={Boolean(errors.quality && touched.quality)}
        errorMessage={errors.quality}
      >
        <Field
          type="text"
          autoComplete="off"
          name="quality"
          component={Input}
        />
      </FormItem>
      </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="col-span-1">
      <FormItem
        label="DC Number"
        invalid={Boolean(errors.dcNumber && touched.dcNumber)}
        errorMessage={errors.dcNumber}
      >
        <Field
          type="number"
          autoComplete="off"
          name=" dcNumber"
          component={Input}
        />
        
      </FormItem>
      </div>
      <div className="col-span-1">
      <FormItem
        label="Bill No"
        invalid={Boolean(
          errors.billNo && touched.billNo
        )}
        errorMessage={errors.billNo}
      >
        <Field
          type="billNo"
          autoComplete="off"
          name="billNo"
          component={Input}
        />
      </FormItem>
      </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="col-span-1">
      <FormItem
  label="Weight"
  invalid={Boolean(errors.weight && touched.weight)}
  errorMessage={errors.weight}
>
  <Field 
    as="select" 
    name="weight"
    className="form-select"
  >
    <option value="">Select Weight</option> {/* Placeholder option */}
    <option value="Pure">Pure</option>
    <option value="Mixing">Mixing</option>
  </Field>
</FormItem>
</div>

<div className="col-span-1">
      <FormItem
        label="Gross Weight"
        invalid={Boolean(
          errors.grossWeight && touched.grossWeight
        )}
        errorMessage={errors.grossWeight}
      >
        <Field
          type="number"
          autoComplete="off"
          name="grossWeight"
          component={Input}
        />
      </FormItem>
</div>
</div>
     
    </AdaptableCard>
  );
};

export default BasicInformationFields;
