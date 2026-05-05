import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import FormContainer from "@/components/ui/Form/FormContainer";
import FormItem from "@/components/ui/Form/FormItem";

export type SetSubmitting = (isSubmitting: boolean) => void;

export type FormModel = {
  _id?: string;
  userId?: string;
  userType: "walkingCustomer" | "specificCustomer";
  clientName?: string;
  phoneNumber?: string;
  billNo?: string;
  folio?: string;
  date: string;
  amount: number;
  paymentMethod: "cash" | "bank" | "online" | "other";
  description?: string;
};

type PaymentSalesFormProps = {
  type: "new" | "edit";
  initialData?: Partial<FormModel>;
  userName?: string;
  userId?: string;
  userType?: string;
  onFormSubmit: (values: FormModel, setSubmitting: SetSubmitting) => void;
  onDiscard?: () => void;
};

const paymentMethodOptions = [
  { value: "cash", label: "Cash" },
  { value: "bank", label: "Bank" },
  { value: "online", label: "Online" },
  { value: "other", label: "Other" },
];

const validationSchema = Yup.object().shape({
  date: Yup.string().required("Date is required"),
  amount: Yup.number()
    .required("Amount is required")
    .min(1, "Amount must be greater than 0"),
  userType: Yup.string().required("User type is required"),
});

const PaymentSalesForm = ({
  type,
  initialData,
  onFormSubmit,
  onDiscard,
}: PaymentSalesFormProps) => {
  const defaultValues: FormModel = {
    userId: "",
    userType: "walkingCustomer",
    clientName: "",
    phoneNumber: "",
    billNo: "",
    folio: "",
    date: new Date().toISOString().slice(0, 10),
    amount: 0,
    paymentMethod: "cash",
    description: "Payment received",
    ...initialData,
  } as FormModel;

  return (
    <Formik
      initialValues={defaultValues}
      validationSchema={validationSchema}
      enableReinitialize
      onSubmit={(values, { setSubmitting }) => {
        onFormSubmit(values, setSubmitting);
      }}
    >
      {({ values, touched, errors, isSubmitting, setFieldValue }) => (
        <Form>
          <FormContainer>
            <h3 className="mb-6">
              {type === "new" ? "Receive Sales Payment" : "Edit Sales Payment"}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormItem
                label="Client Name"
                invalid={Boolean(errors.clientName && touched.clientName)}
                errorMessage={errors.clientName}
              >
                <Field
                  type="text"
                  name="clientName"
                  placeholder="Client Name"
                  component={Input}
                />
              </FormItem>

              <FormItem label="Date" invalid={Boolean(errors.date && touched.date)} errorMessage={errors.date}>
                <Field type="date" name="date" component={Input} />
              </FormItem>

              <FormItem label="Amount" invalid={Boolean(errors.amount && touched.amount)} errorMessage={errors.amount}>
                <Field
                  type="number"
                  name="amount"
                  placeholder="Received Amount"
                  component={Input}
                />
              </FormItem>

              <FormItem label="Payment Method">
                <Select
                  options={paymentMethodOptions}
                  value={paymentMethodOptions.find(
                    (option) => option.value === values.paymentMethod
                  )}
                  onChange={(option: any) =>
                    setFieldValue("paymentMethod", option?.value)
                  }
                />
              </FormItem>

              <FormItem label="Bill No">
                <Field
                  type="text"
                  name="billNo"
                  placeholder="Bill No"
                  component={Input}
                />
              </FormItem>

              <FormItem label="Phone Number">
                <Field
                  type="text"
                  name="phoneNumber"
                  placeholder="Phone Number"
                  component={Input}
                />
              </FormItem>

              <FormItem label="Folio">
                <Field
                  type="text"
                  name="folio"
                  placeholder="Folio"
                  component={Input}
                />
              </FormItem>

              <FormItem label="Description">
                <Field
                  type="text"
                  name="description"
                  placeholder="Description"
                  component={Input}
                />
              </FormItem>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button type="button" onClick={onDiscard}>
                Cancel
              </Button>

              <Button variant="solid" type="submit" loading={isSubmitting}>
                {type === "new" ? "Receive Payment" : "Update Payment"}
              </Button>
            </div>
          </FormContainer>
        </Form>
      )}
    </Formik>
  );
};

export default PaymentSalesForm;