import React, { useEffect, useRef } from "react";
import AdaptableCard from "@/components/shared/AdaptableCard";
import Input from "@/components/ui/Input";
import { FormItem } from "@/components/ui/Form";
import { Field,FieldProps, FormikErrors, FormikTouched, useFormikContext } from "formik";

import DatePicker from 'react-datepicker';
import { format } from 'date-fns';
import 'react-datepicker/dist/react-datepicker.css';
import {
  MIXING_VARIETIES,
  PURE_BAG_WEIGHT,
  toNumber,
} from "./mixingVarieties";



 
type FormFieldsName = {
  date: string;
  quality: string;
  quantity: string;
  pureBags: number;
  mixingBags: number;
  totalBags: number;
  mixingBagsWeight: number;
  billNo: string;
  receivedFrom: string;
  product: string;
  userName : string;
  userId: string; 
  userType: string;
  phoneNumber: string;
  rate: number;
  isNorani: boolean;
  selectedVarieties: string[];
  // mixing variety bags / per bag weights, see MIXING_VARIETIES
  [key: string]: any;
};

type BasicInformationFieldsProps = {
  userName?: string;
  userId? : string;
  userType?: string;
  phoneNumber?: string;
  touched: FormikTouched<FormFieldsName>;
  errors: FormikErrors<FormFieldsName>;
  page: "new" | "edit";
};

const BasicInformationFields = (props: BasicInformationFieldsProps) => {
  const { touched, errors,userName,  userId, userType , phoneNumber } = props;
  const { values, setFieldValue, handleChange, } = useFormikContext<FormFieldsName>();

  const selectedVarieties: string[] = values.selectedVarieties || [];
  const activeVarieties = MIXING_VARIETIES.filter((variety) =>
    selectedVarieties.includes(variety.key)
  );

  const varietyBags = activeVarieties.reduce(
    (sum, variety) => sum + toNumber(values[variety.bagsField]),
    0
  );
  const varietyWeight = activeVarieties.reduce(
    (sum, variety) =>
      sum + toNumber(values[variety.bagsField]) * toNumber(values[variety.weightField]),
    0
  );

  // purana mixing + saari selected varieties ka total — sirf dikhane ke liye,
  // backend weightMixing khud calculate karta hai
  const mixWeight =
    toNumber(values.mixingBags) * toNumber(values.mixingBagsWeight) + varietyWeight;

  useEffect(() => {
      let totalBags = toNumber(values.pureBags) + toNumber(values.mixingBags) + varietyBags;
      setFieldValue("totalBags", totalBags  );

      setFieldValue("weightMixing", mixWeight  );

      let total = (toNumber(values.pureBags)*PURE_BAG_WEIGHT + mixWeight);

      setFieldValue("quantity", total.toString()  );
     
    }, [values.pureBags, values.mixingBags,values.mixingBagsWeight, varietyBags, mixWeight]);

  const toggleVariety = (key: string, checked: boolean) => {
    const variety = MIXING_VARIETIES.find((item) => item.key === key);
    if (!variety) return;

    if (checked) {
      setFieldValue("selectedVarieties", [...selectedVarieties, key]);
    } else {
      setFieldValue(
        "selectedVarieties",
        selectedVarieties.filter((item) => item !== key)
      );
      // clear the hidden values so an unchecked variety never counts
      setFieldValue(variety.bagsField, 0);
      setFieldValue(variety.weightField, 0);
    }
  };

    

    
  
  
  
  
  return (
    <AdaptableCard divider className="mb-4">
      <h5
>
  {userName || "Purchase"}
</h5>
      <p className="mb-6">Section to config basic product information</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      
      <div className="col-span-1">
      {/* <FormItem
        label="Date"
        //invalid={(errors.date && touched.date) as boolean}
         //errorMessage={errors.date}
      >
        <Field
          type="date"
          autoComplete="off"
          name="date"
          placeholder="Select date"
          component={Input}
        />
      </FormItem> */}
       <FormItem
        label="Date"
        //invalid={Boolean(errors.date && touched.date)}
        //errorMessage={errors.date}
        >
      <DatePicker
    selected={values.date ? new Date(values.date) : null}
    onChange={(date: Date | null) => setFieldValue('date', date)}
    dateFormat="dd/MM/yyyy"
    placeholderText="dd-mm-yyyy"
    wrapperClassName="w-full"
    className="w-full h-11 px-3 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
    isClearable
  />
      </FormItem>
      </div>
      
      <div className="col-span-1">
      <FormItem
         label="Received From"
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

      </div>
      
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="col-span-1">
      <FormItem
        label="Pure bags"
        invalid={(errors.pureBags && touched.pureBags) as boolean}
        errorMessage={errors.pureBags}
      >
        <Field
          type="number"
          autoComplete="off"
          name="pureBags"
          placeholder="Enter a bag"
          component={Input}
        />
      </FormItem>
      </div>
      {/* Mix bags field filhaal hide hai — mixing varieties use ho rahi hain
      <div className="col-span-1">
      <FormItem
       label="Mix bags"
       invalid={(errors.mixingBags&& touched.mixingBags) as boolean}
       errorMessage={errors.mixingBags}
     >
       <Field
         type="number"
         autoComplete="off"
         name="mixingBags"
         placeholder="Enter a Bag"
         component={Input}
       />
      </FormItem>
      </div>
      */}
      
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* Mix bags Weight field filhaal hide hai — mixing varieties use ho rahi hain
    <div className="col-span-1">
      <FormItem
         label="Mix bags Weight"
         invalid={(errors.mixingBagsWeight&& touched.mixingBagsWeight) as boolean}
         errorMessage={errors.mixingBagsWeight}
       >
         <Field
           type="number"
           autoComplete="off"
           name="mixingBagsWeight"
           placeholder="enter a weight"
           component={Input}
         
         />
      </FormItem>
      </div>
      */}
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
         placeholder="Enter bill number"
         component={Input}
       />
      </FormItem>
      </div>
      </div>

   
    <div className="mb-4">
      <FormItem label="Mixing Varieties">
        <div className="flex flex-wrap gap-3">
          {MIXING_VARIETIES.map((variety) => (
            <label
              key={variety.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '6px',
                cursor: 'pointer',
                backgroundColor: 'white',
              }}
            >
              <input
                type="checkbox"
                checked={selectedVarieties.includes(variety.key)}
                onChange={(e) => toggleVariety(variety.key, e.target.checked)}
                style={{
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer',
                  accentColor: '#007bff',
                }}
              />
              <span>{variety.label}</span>
            </label>
          ))}
        </div>
      </FormItem>
    </div>

    {activeVarieties.length > 0 && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeVarieties.map((variety) => (
          <React.Fragment key={variety.key}>
            <div className="col-span-1">
              <FormItem label={`${variety.label} Bags`}>
                <Field
                  type="number"
                  autoComplete="off"
                  name={variety.bagsField}
                  placeholder="Enter a bag"
                  component={Input}
                />
              </FormItem>
            </div>
            <div className="col-span-1">
              <FormItem label={`${variety.label} Bags Weight`}>
                <Field
                  type="number"
                  autoComplete="off"
                  name={variety.weightField}
                  placeholder="enter a weight"
                  component={Input}
                />
              </FormItem>
            </div>
          </React.Fragment>
        ))}
      </div>
    )}

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="col-span-1">
        <FormItem label="Mix Weight">
          <Field
            type="number"
            autoComplete="off"
            name="weightMixing"
            component={Input}
            readOnly
          />
        </FormItem>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="col-span-1">
      <FormItem
         label="Total Bags"
         invalid={(errors.totalBags&& touched.totalBags) as boolean}
         errorMessage={errors.totalBags}
       >
         <Field
           type="number"
           autoComplete="off"
           name="totalBags"
           placeholder=""
           component={Input}
           readOnly 
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
         type="string"
         autoComplete="off"
         name="quantity"
         placeholder="Enter quantity"
         component={Input}
       />
      </FormItem>

     
      </div>

       <div className="col-span-1">
      <FormItem
       label="Rate"
       invalid={(errors.rate&& touched.rate) as boolean}
       errorMessage={errors.rate}
     >
       <Field
         type="number"
         autoComplete="off"
         name="rate"
         placeholder="rate"
         component={Input}
       />
      </FormItem>

     
      </div>
      

    
      <div className="col-span-1">
   
      <FormItem
label="Quality"
invalid={(errors.quality && touched.quality) as boolean}
errorMessage={errors.quality}
>
<Field
  type="text"  
  autoComplete="off"
  name="quality"
  placeholder="Enter Quality"
  component={Input}
 
  
/>
</FormItem>
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
          className="w-full h-11 px-3 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">Select product</option>
          <option value="poleythene">Poleythene</option>
          <option value="hydensity">Hydensity</option>
        </Field>
      </FormItem>
      </div>
    
<FormItem
  label="Is Norani Traders?"
  invalid={(errors.isNorani && touched.isNorani) as boolean}
  errorMessage={errors.isNorani}
>
  <label
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '10px',
      border: '1px solid #ccc',
      borderRadius: '6px',
      cursor: 'pointer',
      backgroundColor: 'white', // always white
    }}
  >
    <Field
      type="checkbox"
      name="isNorani"
      
      style={{
        width: '18px',
        height: '18px',
        cursor: 'pointer',
        accentColor: '#007bff', // blue color when checked
      }}
    />

  </label>
</FormItem>




  




</div>
    </AdaptableCard>
  );
};

export default BasicInformationFields;
