import AdaptableCard from "@/components/shared/AdaptableCard";
import RichTextEditor from "@/components/shared/RichTextEditor";
import Input from "@/components/ui/Input";
import { FormItem } from "@/components/ui/Form";
import { Field, FormikErrors, FormikTouched, FieldProps } from "formik";

type FormFieldsName = {
  name: string;
  price: number;
  consecutiveDays: number;
  shortCode: string;
  itemType: string;
  googleId: string;
  appleId: string;
};

type BasicInformationFields = {
  touched: FormikTouched<FormFieldsName>;
  errors: FormikErrors<FormFieldsName>;
  page: "new" | "edit";
};

const BasicInformationFields = (props: BasicInformationFields) => {
  const { touched, errors, page } = props;

  return (
    <AdaptableCard divider className="mb-4">
      <h5>Basic Information</h5>
      <p className="mb-6">Section to config basic product information</p>

      <FormItem label="Product Type">
        {page == "edit" ? (
          <Field
            readOnly
            type="text"
            autoComplete="off"
            name="itemType"
            placeholder="Product Type"
            component={Input}
          />
        ) : (
          <Field
            readOnly
            type="text"
            autoComplete="off"
            name="itemType"
            placeholder="Product Type"
            component={Input}
          />
        )}
      </FormItem>

      <FormItem
        label="Name "
        invalid={(errors.name && touched.name) as boolean}
        errorMessage={errors.name}
      >
        <Field
          // readOnly={page == "edit" && true}
          type="text"
          autoComplete="off"
          name="name"
          // placeholder="Short Code"
          component={Input}
        />
      </FormItem>
      <FormItem
        label="Code"
        invalid={(errors.shortCode && touched.shortCode) as boolean}
        errorMessage={errors.shortCode}
      >
        <Field
          readOnly={page == "edit" && true}
          type="text"
          autoComplete="off"
          name="shortCode"
          placeholder="Short Code"
          component={Input}
        />
      </FormItem>

      <FormItem
        label="Streak Days"
        invalid={(errors.consecutiveDays && touched.consecutiveDays) as boolean}
        errorMessage={errors.consecutiveDays}
      >
        <Field
          type="number"
          autoComplete="off"
          name="consecutiveDays"
          placeholder="consecutive Days"
          component={Input}
        />
      </FormItem>
      <FormItem
        label="Google SKU"
        invalid={(errors.googleId && touched.googleId) as boolean}
        errorMessage={errors.googleId}
      >
        <Field
          type="text"
          autoComplete="off"
          name="googleId"
          placeholder="Google SKU"
          component={Input}
        />
      </FormItem>

      <FormItem
        label="Apple Sku "
        invalid={(errors.appleId && touched.appleId) as boolean}
        errorMessage={errors.appleId}
      >
        <Field
          type="text"
          autoComplete="off"
          name="appleId"
          placeholder="Apple SKU"
          component={Input}
        />
      </FormItem>

      <FormItem
        label="Price"
        invalid={(errors.price && touched.price) as boolean}
        errorMessage={errors.price}
      >
        <Field
          type="number"
          autoComplete="off"
          name="price"
          placeholder="Price"
          component={Input}
        />
      </FormItem>
    </AdaptableCard>
  );
};

export default BasicInformationFields;
