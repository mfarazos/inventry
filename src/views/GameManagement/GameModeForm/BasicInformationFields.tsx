import React, { useEffect } from "react";
import AdaptableCard from "@/components/shared/AdaptableCard";
import Input from "@/components/ui/Input";
import { FormItem } from "@/components/ui/Form";
import { Field, FormikErrors, FormikTouched, useFormikContext } from "formik";

type FormFieldsName = {
  date: string;
  weight: string;
  quality: string;
  quantity: number;
  receivedFrom: string;
  billNo: string;
  danaReceiverName: string;
};

type BasicInformationFieldsProps = {
  touched: FormikTouched<FormFieldsName>;
  errors: FormikErrors<FormFieldsName>;
  page: "new" | "edit";
};

const BasicInformationFields = (props: BasicInformationFieldsProps) => {
  const { touched, errors } = props;
  const { values, setFieldValue, handleChange } = useFormikContext<FormFieldsName>();

  
  
  
  return (
    <AdaptableCard divider className="mb-4">
      <h5>Basic Information</h5>
      <p className="mb-6">Section to config basic product information</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      
      <div className="col-span-1">
      <FormItem
        label="Date"
        invalid={(errors.date && touched.date) as boolean}
        //errorMessage={errors.Date}
      >
        <Field
          type="date"
          autoComplete="off"
          name="date"
          placeholder="Small Blind"
          component={Input}
        />
      </FormItem>
      </div>
      
      <div className="col-span-1">
      <FormItem
         label="Quality"
         invalid={(errors.quality&& touched.quality) as boolean}
         errorMessage={errors.quality}
       >
         <Field
           type="string"
           autoComplete="off"
           name="quality"
           placeholder="Enter Quality"
           component={Input}
         />
      </FormItem>
      </div>
      
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="col-span-1">
      <FormItem
        label="Weight"
        invalid={(errors.weight && touched.weight) as boolean}
        errorMessage={errors.weight}
      >
        <Field
          type="string"
          autoComplete="off"
          name="weight"
          placeholder="Enter Weight"
          component={Input}
        />
      </FormItem>
      </div>
      <div className="col-span-1">
      <FormItem
       label="Quantity"
       invalid={(errors.quantity&& touched.quantity) as boolean}
       errorMessage={errors.quantity}
     >
       <Field
         type="number"
         autoComplete="off"
         name="quantity"
         placeholder="Enter Quantity"
         component={Input}
       />
      </FormItem>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="col-span-1">
      <FormItem
         label="Bill Number"
         invalid={(errors.billNo&& touched.billNo) as boolean}
         errorMessage={errors.billNo}
       >
         <Field
           type="string"
           autoComplete="off"
           name="billNo"
           placeholder="Enter a bill number"
           component={Input}
         />
      </FormItem>
      </div>
      <div className="col-span-1">
      <FormItem
       label="Dana Reciever Name"
       invalid={(errors. danaReceiverName&& touched.danaReceiverName) as boolean}
       errorMessage={errors.danaReceiverName}
     >
       <Field
         type="string"
         autoComplete="off"
         name="danaReceiverName"
         placeholder="Enter a Name"
         component={Input}
       />
      </FormItem>
      </div>
      </div>
      <FormItem
         label="Received From Which Person"
         invalid={(errors.receivedFrom&& touched.receivedFrom) as boolean}
         errorMessage={errors.receivedFrom}
       >
         <Field
           type="string"
           autoComplete="off"
           name="receivedFrom"
           placeholder="enter person"
           component={Input}
         />
      </FormItem>
    </AdaptableCard>
  );
};

export default BasicInformationFields;
