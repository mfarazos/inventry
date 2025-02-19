import React, { useEffect, useState } from "react";
import AdaptableCard from "@/components/shared/AdaptableCard";
import Input from "@/components/ui/Input";
import { FormItem } from "@/components/ui/Form";
import { Field, FormikErrors, FormikTouched, useFormikContext } from "formik";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

type FormFieldsName = {
  date: Date;
  clientName: string;
  quality: string;
  dcNumber: string;
  weightPure: number;
  weightMixing: number;
  grossWeight: number;
  rate: number;
  amount: number;
  billNo: string;
  product: string;
  userId: string; 
  userType: string;
  phoneNumber: string;
};




type BasicInformationFieldsProps = {
  userName?: string;
  userId?: string;
  userType?: string;
  phoneNumber?: string;
  touched: FormikTouched<FormFieldsName>;
  errors: FormikErrors<FormFieldsName>;
  page: "new" | "edit";
};

const BasicInformationFields = (props: BasicInformationFieldsProps) => {
  const { touched, errors, page, userName, userId, userType , phoneNumber } = props;
   const { values, setFieldValue, handleChange } = useFormikContext<FormFieldsName>();
  // Local state to manage date values
  useEffect(() => {
    let totalWeight = values.weightPure + values.weightMixing;
    setFieldValue("grossWeight", totalWeight  );
   
  }, [values.weightPure, values.weightMixing]);

  useEffect(() => {
  
    let totalCost = values.rate * values.grossWeight ;
    setFieldValue("amount", totalCost );

  }, [values.rate, values.grossWeight]);

  return (
    <AdaptableCard divider className="mb-4">
      <h5>{userName || "Sales"}</h5>
      <p className="mb-6">Section to configure basic Client information</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <div className="col-span-1">
          <FormItem
            label="Date"
          >
            <Field
              type="Date"
              autoComplete="off"
              name="date"
              placeholder=""
              component={Input} />
          </FormItem>
        </div>

        <div className="col-span-1">
          <FormItem
            label="Client Name"
            invalid={Boolean(errors.clientName && touched.clientName)}
            errorMessage={errors.clientName}
            
          >
            <Field type="string" 
             autoComplete="off" 
             name="clientName" 
             placeholder="enter name" 
             component={Input} 
             readOnly={userName? true: false} 
             />
          </FormItem>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-1">
          <FormItem
            label="quality"
            invalid={Boolean(errors.quality && touched.quality)}
            errorMessage={errors.quality}
          >
            <Field
              type="string"
              autoComplete="off"
              name="quality"
              placeholder="enter quality"
              component={Input} />
          </FormItem>
        </div>


        <div className="col-span-1">
          <FormItem
            label="DC Number"
            invalid={Boolean(errors.dcNumber && touched.dcNumber)}
            errorMessage={errors.dcNumber}
          >
            <Field
              type="string"
              autoComplete="off"
              name="dcNumber"
              placeholder="enter dc number"
              component={Input} />

          </FormItem>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="col-span-1">
        <FormItem
          label="pure weight"
           invalid={(errors.weightPure && touched.weightPure) as boolean}
          errorMessage={errors.weightPure}
        >
          <Field
            type="number"
            autoComplete="off"
            name="weightPure"
            placeholder="Enter pure Weight"
            component={Input} />
        </FormItem>
      </div>

      <div className="col-span-1">
        <FormItem
          label="Mix Weight"
          invalid={(errors.weightMixing && touched.weightMixing) as boolean}
          errorMessage={errors.weightMixing}
        >
          <Field
            type="number"
            autoComplete="off"
            name="weightMixing"
            placeholder="Enter mix Weight"
            component={Input} />
        </FormItem>
      </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            readOnly 
            />
        </FormItem>
      </div>

      <div className="col-span-1">
        <FormItem
          label="Rate"
          invalid={Boolean(
            errors.rate && touched.rate)}
          errorMessage={errors.rate}
        >
          <Field
            type="number"
            autoComplete="off"
            name="rate"
            placeholder="Enter rate"
            component={Input} />
        </FormItem>
      </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="col-span-1">
        <FormItem
          label="Amount"
          invalid={Boolean(
            errors.amount && touched.amount
          )}
          errorMessage={errors.amount}
        >
          <Field
            type="number"
            autoComplete="off"
            name="amount"
            placeholder="Enter amount"
            component={Input} 
            readOnly 
            />
        </FormItem>
      </div>

     {!userId && ( 
      <div className="col-span-1">
        <FormItem
          label="Phone Number"
          
        >
          <Field
            type="string"
            autoComplete="off"
            name="phoneNumber"
            placeholder="Enter phone number"
            component={Input} />
        </FormItem>
        </div> 
        
    
     )} 
        </div>  
        <div className="col-span-1">
        <FormItem
    label="product"
    invalid={Boolean(errors.product && touched.product)}
    errorMessage={errors.product}
  >
    <Field
      as="select"
      name="product"
      className="form-select"
      style={{
        fontWeight: "bold", // Ensures the selected value is bold
      }}
    >
      <option value="" style={{ fontWeight: "normal" }}>
        Select product
      </option> {/* Placeholder option */}
      <option value="poleythene">Poleythene</option>
      <option value="hydensity">Hydensity</option>
    </Field>
  </FormItem>
              </div>

    </AdaptableCard>
  )
}

export default BasicInformationFields;
