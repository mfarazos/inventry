import { useState } from "react";
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
  ref_no?: string;
  billNo?: string;
  dueOnDate?: string;
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
  customerOptions?: Array<{
    _id?: string;
    clientName?: string;
    phoneNumber?: string;
    ref_no?: string;
    billNo?: string;
  }>;
  customerLoading?: boolean;
  lockClientName?: boolean;
  onCustomerSelect?: (customer: {
    _id?: string;
    clientName?: string;
    phoneNumber?: string;
    ref_no?: string;
    billNo?: string;
  }) => void;
  onCustomerClear?: () => void;
  onCustomerSearch?: (search: string) => void;
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
  customerOptions = [],
  customerLoading = false,
  lockClientName = false,
  onCustomerSelect,
  onCustomerClear,
  onCustomerSearch,
  onFormSubmit,
  onDiscard,
}: PaymentSalesFormProps) => {
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);

  const defaultValues: FormModel = {
    userId: "",
    userType: "walkingCustomer",
    clientName: "",
    phoneNumber: "",
    ref_no: "",
    billNo: "",
    dueOnDate: "",
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
      {({ values, touched, errors, isSubmitting, setFieldValue }) => {
        const filteredCustomers = (() => {
          const search = String(values.clientName || "").trim().toLowerCase();

          if (!search) return [];

          return customerOptions
            .filter((customer) =>
              [customer.clientName, customer.phoneNumber, customer.ref_no, customer.billNo]
                .filter(Boolean)
                .join(" ")
                .toLowerCase()
                .includes(search),
            )
            .slice(0, 8);
        })();

        return (
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
                <div className="relative">
                  <Input
                    type="text"
                    name="clientName"
                    autoComplete="off"
                    placeholder="Client Name"
                    value={values.clientName || ""}
                    readOnly={lockClientName}
                    onChange={(event) => {
                      const nextValue = event.target.value;

                      setFieldValue("clientName", nextValue);
                      if (!lockClientName) {
                        setFieldValue("userId", "");
                        setFieldValue("ref_no", "");
                        onCustomerClear?.();
                        onCustomerSearch?.(nextValue);
                        setShowCustomerSuggestions(Boolean(nextValue.trim()));
                      }
                    }}
                    onFocus={() => {
                      if (!lockClientName && String(values.clientName || "").trim()) {
                        setShowCustomerSuggestions(true);
                      }
                    }}
                    onBlur={() => {
                      setTimeout(() => setShowCustomerSuggestions(false), 200);
                    }}
                  />

                  {showCustomerSuggestions && !lockClientName && String(values.clientName || "").trim() && (
                    <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded border border-gray-200 bg-white shadow-lg">
                      {customerLoading ? (
                        <div className="px-3 py-2 text-sm text-gray-500">
                          Searching customers...
                        </div>
                      ) : filteredCustomers.length > 0 ? (
                        filteredCustomers.map((customer, index) => (
                          <button
                            key={`${customer._id || customer.phoneNumber || customer.clientName}-${index}`}
                            type="button"
                            className="w-full px-3 py-2 text-left transition hover:bg-gray-100"
                            onMouseDown={() => {
                              setFieldValue("clientName", customer.clientName || "");
                              setFieldValue("userId", customer._id || "");
                              setFieldValue("phoneNumber", customer.phoneNumber || "");
                              setFieldValue("ref_no", customer.ref_no || "");
                              setFieldValue("billNo", customer.billNo || "");
                              onCustomerSelect?.(customer);
                              setShowCustomerSuggestions(false);
                            }}
                          >
                            <div className="font-medium text-gray-800">
                              {customer.clientName || "Customer"}
                            </div>
                            <div className="text-xs text-gray-500">
                              {[
                                customer.ref_no && `Ref No: ${customer.ref_no}`,
                                customer.billNo && `Bill No: ${customer.billNo}`,
                              ]
                                .filter(Boolean)
                                .join(" | ")}
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-sm text-gray-500">
                          No customer found
                        </div>
                      )}
                    </div>
                  )}
                </div>
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

              <FormItem label="Due On Date">
                <Field
                  type="date"
                  name="dueOnDate"
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
        );
      }}
    </Formik>
  );
};

export default PaymentSalesForm;
