import React, { useEffect, useState } from "react";
import AdaptableCard from "@/components/shared/AdaptableCard";
import Input from "@/components/ui/Input";
import { FormItem } from "@/components/ui/Form";
import { Field,FieldProps, FormikErrors, FormikTouched, useFormikContext } from "formik";
import ApiService from "@/services/ApiService";
import { getReceivedFromVendorRef } from "@/services/GameManagement";

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
  vendorRef: string;
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
  const [vendorSearch, setVendorSearch] = useState("");
  const [debouncedVendorSearch, setDebouncedVendorSearch] = useState("");
  const [vendorOptions, setVendorOptions] = useState<
    Array<{ receivedFrom?: string; vendorRef?: string }>
  >([]);
  const [vendorLoading, setVendorLoading] = useState(false);
  const [showVendorSuggestions, setShowVendorSuggestions] = useState(false);

  const selectedVarieties: string[] = values.selectedVarieties || [];
  const activeVarieties = MIXING_VARIETIES.filter((variety) =>
    selectedVarieties.includes(variety.key)
  );
  const nonNegativeValue = (value: any) => Math.max(toNumber(value), 0);

  const varietyBags = activeVarieties.reduce(
    (sum, variety) => sum + nonNegativeValue(values[variety.bagsField]),
    0
  );
  const varietyWeight = activeVarieties.reduce(
    (sum, variety) =>
      sum +
      nonNegativeValue(values[variety.bagsField]) *
        nonNegativeValue(values[variety.weightField]),
    0
  );

  // purana mixing + saari selected varieties ka total — sirf dikhane ke liye,
  // backend weightMixing khud calculate karta hai
  const mixWeight =
    nonNegativeValue(values.mixingBags) *
      nonNegativeValue(values.mixingBagsWeight) +
    varietyWeight;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedVendorSearch(vendorSearch.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [vendorSearch]);

  useEffect(() => {
    if (!debouncedVendorSearch) {
      setVendorOptions([]);
      setVendorLoading(false);
      return;
    }

    const fetchVendors = async () => {
      setVendorLoading(true);

      try {
        const response = await ApiService.fetchData<any>({
          url: getReceivedFromVendorRef(),
          method: "get",
          params: {
            userType: "walkingCustomer",
            search: debouncedVendorSearch,
            page: 1,
            limit: 100,
          },
        });

        const rows = Array.isArray(response?.data?.data?.data)
          ? response.data.data.data
          : [];

        setVendorOptions(rows);
      } catch (error) {
        setVendorOptions([]);
      } finally {
        setVendorLoading(false);
      }
    };

    fetchVendors();
  }, [debouncedVendorSearch]);

  useEffect(() => {
      let totalBags = nonNegativeValue(values.pureBags) + nonNegativeValue(values.mixingBags) + varietyBags;
      setFieldValue("totalBags", totalBags  );

      setFieldValue("weightMixing", mixWeight  );

      let total = (nonNegativeValue(values.pureBags)*PURE_BAG_WEIGHT + mixWeight);

      setFieldValue("quantity", total.toString()  );
     
    }, [values.pureBags, values.mixingBags,values.mixingBagsWeight, varietyBags, mixWeight]);

  const preventNegativeNumberInput = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (["-", "e", "E"].includes(event.key)) {
      event.preventDefault();
    }
  };

  const handleNonNegativeChange =
    (fieldName: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const nextValue = event.target.value;

      if (nextValue === "") {
        setFieldValue(fieldName, "");
        return;
      }

      setFieldValue(fieldName, Math.max(Number(nextValue) || 0, 0));
    };

  const nonNegativeNumberProps = (fieldName: string) => ({
    min: 0,
    step: "any",
    onKeyDown: preventNegativeNumberInput,
    onChange: handleNonNegativeChange(fieldName),
  });

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
         <div className="relative">
           <Input
             type="text"
             autoComplete="off"
             name="receivedFrom"
             placeholder="enter person"
             value={values.receivedFrom || ""}
             onChange={(event) => {
               const nextValue = event.target.value;

               setFieldValue("receivedFrom", nextValue);
               setFieldValue("vendorRef", "");
               setVendorSearch(nextValue);
               setShowVendorSuggestions(Boolean(nextValue.trim()));
             }}
             onFocus={() => {
               const currentValue = String(values.receivedFrom || "").trim();
               if (currentValue) {
                 setVendorSearch(currentValue);
                 setShowVendorSuggestions(true);
               }
             }}
             onBlur={() => {
               setTimeout(() => setShowVendorSuggestions(false), 200);
             }}
           />

           {showVendorSuggestions && String(values.receivedFrom || "").trim() && (
             <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded border border-gray-200 bg-white shadow-lg">
               {vendorLoading ? (
                 <div className="px-3 py-2 text-sm text-gray-500">
                   Searching vendors...
                 </div>
               ) : vendorOptions.length > 0 ? (
                 vendorOptions.map((vendor, index) => (
                   <button
                     key={`${vendor.receivedFrom || "vendor"}-${vendor.vendorRef || index}`}
                     type="button"
                     className="w-full px-3 py-2 text-left transition hover:bg-gray-100"
                     onMouseDown={() => {
                       setFieldValue("receivedFrom", vendor.receivedFrom || "");
                       setFieldValue("vendorRef", vendor.vendorRef || "");
                       setVendorSearch(vendor.receivedFrom || "");
                       setShowVendorSuggestions(false);
                     }}
                   >
                     <div className="font-medium text-gray-800">
                       {vendor.receivedFrom || "Vendor"}
                     </div>
                     <div className="text-xs text-gray-500">
                       Vendor Ref: {vendor.vendorRef || "-"}
                     </div>
                   </button>
                 ))
               ) : (
                 <div className="px-3 py-2 text-sm text-gray-500">
                   No vendor found
                 </div>
               )}
             </div>
           )}
         </div>
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
          {...nonNegativeNumberProps("pureBags")}
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
                  {...nonNegativeNumberProps(variety.bagsField)}
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
                  {...nonNegativeNumberProps(variety.weightField)}
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
            min={0}
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
           min={0}
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
         placeholder="Enter quantity"
         component={Input}
         {...nonNegativeNumberProps("quantity")}
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
         {...nonNegativeNumberProps("rate")}
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
