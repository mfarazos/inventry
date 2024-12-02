import AdaptableCard from "@/components/shared/AdaptableCard";
import RichTextEditor from "@/components/shared/RichTextEditor";
import Input from "@/components/ui/Input";
import { FormItem } from "@/components/ui/Form";
import { Field, FormikErrors, FormikTouched, FieldProps } from "formik";

type FormFieldsName = {
  title: string;
  message: string;
};

type BasicInformationFields = {
  touched: FormikTouched<FormFieldsName>;
  errors: FormikErrors<FormFieldsName>;
};

const TextArea = ({ field, form, ...props }) => {
  return <Input textArea {...field} {...props} className="mt-1 block w-full" />;
};

const BasicInformationFields = (props: BasicInformationFields) => {
  const { touched, errors } = props;

  return (
    <AdaptableCard divider className="mb-4">
      <h5>Push Notification</h5>
      <p className="mb-6">Section to Broadcats Notification from all users</p>
      <FormItem
        label="Title"
        invalid={(errors.title && touched.title) as boolean}
        errorMessage={errors.title}
      >
        <Field
          type="text"
          autoComplete="off"
          name="title"
          placeholder="Title"
          component={Input}
        />
      </FormItem>
      <FormItem
        label="Message"
        labelClass="!justify-start"
        invalid={(errors.message && touched.message) as boolean}
        errorMessage={errors.message}
      >
        <Field
          type="text"
          autoComplete="off"
          name="message"
          placeholder="message"
          component={TextArea}
        />
      </FormItem>
    </AdaptableCard>
  );
};

export default BasicInformationFields;
