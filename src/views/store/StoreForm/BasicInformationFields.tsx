import AdaptableCard from "@/components/shared/AdaptableCard";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { FormItem } from "@/components/ui/Form";
import { Field, useFormikContext, FieldProps } from "formik";
import { useEffect } from "react";

type FormFieldsName = {
  itemTag: string;
  itemIcon: string;
  itemDetails: string;
  gold: number;
  amount: number;
  itemType: string;
  paymentType: string;
  chips: number;
  appleId: string;
  googleId: string;
};

type BasicInformationFieldsProps = {
  touched: any;
  errors: any;
  page: "new" | "edit";
};

const paymentOptions = [
  { value: "inAppPurchase", label: "IN APP PURCHASE" },
  { value: "inAppGold", label: "IN APP GOLD" }
];

const itemOptions = [
  { value: "gold", label: "Gold" },
  { value: "chips", label: "Chips" },
  { value: "bundle", label: "Bundle" }
];

const BasicInformationFields = (props: BasicInformationFieldsProps) => {
  const { touched, errors, page } = props;
  const { values, setFieldValue } = useFormikContext<FormFieldsName>();

  useEffect(() => {
    console.log("faraz",errors, values);
  },[errors,touched ])

  

  return (
    <AdaptableCard divider className="mb-4">
      <h5>Store Information</h5>
      <p className="mb-6">Section to configure basic product information</p>

      <FormItem label="Item Tag">
        <Field
          type="text"
          autoComplete="off"
          name="itemTag"
          placeholder="Item Tag"
          component={Input}
        />
      </FormItem>

      <FormItem label="Item Type">
                <Field name="itemType">
                  {({ field, form }: FieldProps) => (
                      <Select
                        field={field}
                        form={form}
                        options={itemOptions}
                        value={itemOptions.filter(
                        (itemOptions) =>
                        itemOptions.value === values.itemType
                        )}
                        onChange={(option) =>
                        form.setFieldValue(
                          field.name,
                          option?.value
                        )
                      }
                    />
                    )}
          </Field>
      </FormItem>

      <FormItem label="Item Details">
        <Field
          type="text"
          autoComplete="off"
          name="itemDetails"
          placeholder="Item Details"
          component={Input}
        />
      </FormItem>

      <FormItem label="Gold">
        <Field
          type="number"
          min={0}
          autoComplete="off"
          name="gold"
          placeholder="Gold"
          component={Input}
        />
      </FormItem>

      <FormItem label="Amount">
        <Field
          type="number"
          min={0}
          autoComplete="off"
          name="amount"
          placeholder="Amount"
          component={Input}
        />
      </FormItem>

      <FormItem label="Chips">
        <Field
          type="number"
          min={0}
          autoComplete="off"
          name="chips"
          placeholder="Chips"
          component={Input}
        />
      </FormItem>

      <FormItem
        label="Payment Type"
        invalid={!!errors.paymentType && !!touched.paymentType}
        errorMessage={errors.paymentType}
      >
        
        <Field name="paymentType">
                  {({ field, form }: FieldProps) => (
                      <Select
                        field={field}
                        form={form}
                        options={paymentOptions}
                        value={paymentOptions.filter(
                        (paymentOption) =>
                          paymentOption.value === values.paymentType
                        )}
                        onChange={(option) =>
                        form.setFieldValue(
                          field.name,
                          option?.value
                        )
                      }
                    />
                    )}
          </Field>
      </FormItem>
     {values.itemType !== "chips" && (<> <FormItem label="google SKU">
        <Field
          type="text"
          autoComplete="off"
          name="googleId"
          placeholder="googleId"
          component={Input}
        />
      </FormItem>
      <FormItem label="apple SKU">
        <Field
          type="text"
          autoComplete="off"
          name="appleId"
          placeholder="appleId"
          component={Input}
        />
      </FormItem> </> )}
    </AdaptableCard>
  );
};

export default BasicInformationFields;
