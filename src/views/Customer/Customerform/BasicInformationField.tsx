import React, { useEffect, useRef, useState } from "react";
import appConfig from '@/configs/app.config'
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
  extraRate: number;
  extraAmount: number;
  totalAmount: number;
  billNo: string;
  product: string;
  userId: string; 
  userType: string;
  phoneNumber: string;
  ratio: string;
  additionalRate: boolean;
  description: string;
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

   const [customerSuggestions, setCustomerSuggestions] = useState<any[]>([]);
const [showSuggestions, setShowSuggestions] = useState(false);
const [loadingSuggestions, setLoadingSuggestions] = useState(false);
const suggestionBoxRef = useRef<HTMLDivElement | null>(null);

const API_BASE_URL = appConfig.apiPrefix;

  // Local state to manage date values
  useEffect(() => {
    let totalWeight = values.weightPure + values.weightMixing;
    setFieldValue("grossWeight", totalWeight  );
   
  }, [values.weightPure, values.weightMixing]);

  useEffect(() => {
    const searchValue = values.clientName?.trim();
  
    if (!searchValue || searchValue.length < 2 || userName) {
      setCustomerSuggestions([]);
      setShowSuggestions(false);
      return;
    }
  
    const debounceTimer = setTimeout(async () => {
      try {
        setLoadingSuggestions(true);
  
        const response = await fetch(
          `${API_BASE_URL}/inventoryApp/walkingCustomer?search=${encodeURIComponent(
            searchValue
          )}&limit=10`
        );
  
        const result = await response.json();
  
        const customers = result?.data?.data || [];
  
        // duplicate names remove karne ke liye
        const uniqueCustomers = customers.filter(
          (customer: any, index: number, self: any[]) =>
            customer?.clientName &&
            index ===
              self.findIndex(
                (item: any) =>
                  item.clientName?.toLowerCase().trim() ===
                  customer.clientName?.toLowerCase().trim()
              )
        );
  
        setCustomerSuggestions(uniqueCustomers);
        setShowSuggestions(uniqueCustomers.length > 0);
      } catch (error) {
        console.log("Customer suggestions error:", error);
        setCustomerSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 400);
  
    return () => clearTimeout(debounceTimer);
  }, [values.clientName, userName]);

  useEffect(() => {
  
    let totalCost = values.rate * values.grossWeight ;
    setFieldValue("amount", totalCost );

    let totalExtraCost = values.extraRate * values.grossWeight ;
    setFieldValue("extraAmount", totalExtraCost );

    setFieldValue("totalAmount", (totalCost + totalExtraCost) )

  
  }, [values.rate, values.grossWeight, values.extraRate]);


  useEffect(() => {
  
    setFieldValue("phoneNumber", values.clientName );

  }, [values.clientName]);

  return (
    <AdaptableCard divider className="mb-4">
      <h5>{userName || "Sales"}</h5>
      <p className="mb-6">Section to configure basic Client information</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <div className="col-span-1">
          
          <FormItem
                  label="Date"
                  //invalid={Boolean(errors.date && touched.date)}
                  //errorMessage={errors.date}
                  >
                <DatePicker
    selected={values.date ? new Date(values.date) : null}
    onChange={(date: Date | null) => setFieldValue('date', date)}
    dateFormat="dd/MM/yyyy"
    placeholderText="dd/mm/yyyy"
    className="w-full px-12 py-2 border rounded"
    isClearable
  />
                </FormItem>
        </div>

        <div className="col-span-1 relative" ref={suggestionBoxRef}>
  <FormItem
    label="Client Name"
    invalid={Boolean(errors.clientName && touched.clientName)}
    errorMessage={errors.clientName}
  >
    <Input
      type="text"
      autoComplete="off"
      name="clientName"
      placeholder="Enter customer name"
      value={values.clientName}
      readOnly={userName ? true : false}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        setFieldValue("clientName", e.target.value);
        setShowSuggestions(true);
      }}
      onFocus={() => {
        if (customerSuggestions.length > 0 && !userName) {
          setShowSuggestions(true);
        }
      }}
      onBlur={() => {
        // delay isliye taake suggestion click register ho jaye
        setTimeout(() => {
          setShowSuggestions(false);
        }, 200);
      }}
    />

    {showSuggestions && !userName && (
      <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
        {loadingSuggestions ? (
          <div className="px-3 py-2 text-sm text-gray-500">
            Searching customers...
          </div>
        ) : customerSuggestions.length > 0 ? (
          customerSuggestions.map((customer: any, index: number) => (
            <button
              key={`${customer.clientName}-${index}`}
              type="button"
              className="w-full text-left px-3 py-2 hover:bg-gray-100 transition"
              onMouseDown={() => {
                setFieldValue("clientName", customer.clientName);
                setShowSuggestions(false);
              }}
            >
              <div className="font-medium text-gray-800">
                {customer.clientName}
              </div>

              {(customer.billNo) && (
                <div className="text-xs text-gray-500">
                  {customer.billNo ? `Bill No: ${customer.billNo}` : ""}
                  
                </div>
              )}
            </button>
          ))
        ) : (
          <div className="px-3 py-2 text-sm text-gray-500">
            No customer found
          </div>
        )}
      </div>
    )}
  </FormItem>
</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-2">
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


        
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <div className="col-span-1">
          <FormItem
            label="Bill Number"
            invalid={Boolean(errors.billNo && touched.billNo)}
            errorMessage={errors.billNo}
          >
            <Field
              type="string"
              autoComplete="off"
              name="billNo"
              placeholder="enter bill number"
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
          label="ratio"
          
        >
          <Field
            type="string"
            autoComplete="off"
            name="ratio"
            placeholder="Enter ratio"
            component={Input} />
        </FormItem>
        </div>
      
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      
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

          
       
          
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="col-span-1">
        <FormItem
          label="Extra Rate"
          
        >
          <Field
            type="number"
            autoComplete="off"
            name="extraRate"
            placeholder="Enter extra Rate"
            component={Input} 
            />
        </FormItem>
      </div>

          
       
         <div className="col-span-1">
        <FormItem
          label="Extra Amount"
          
        >
          <Field
            type="number"
            autoComplete="off"
            name="extraAmount"
            readOnly
            component={Input} />
        </FormItem>
        </div> 
        </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <div className="col-span-1">
        <FormItem
          label="Description For Extra Rate"
          
        >
          <Field
            type="string"
            autoComplete="off"
            name="description"
            placeholder="Enter description"
            component={Input} 
            />
        </FormItem>
      </div>
      </div>

        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="col-span-1">
        <FormItem
          label="Total Amount"
          
        >
          <Field
            type="number"
            autoComplete="off"
            name="totalAmount"
            component={Input} 
            readOnly 
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
       
       
          
        </div> 
     
        

  
              

    </AdaptableCard>
  )
}

export default BasicInformationFields;
