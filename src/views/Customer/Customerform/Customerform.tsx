import { forwardRef, useEffect, useState } from "react";
import { FormContainer } from "@/components/ui/Form";
import Button from "@/components/ui/Button";
import hooks from "@/components/ui/hooks";
import StickyFooter from "@/components/shared/StickyFooter";
import { Form, Formik, FormikProps } from "formik";
import BasicInformationFields from "./BasicInformationField";
import cloneDeep from "lodash/cloneDeep";
import { AiOutlineSave } from "react-icons/ai";
import * as Yup from "yup";
import { AdaptableCard } from "@/components/shared";


// eslint-disable-next-line  @typescript-eslint/no-explicit-any
type FormikRef = FormikProps<any>;

type InitialData = {
  
  clientName: '',
  quality: '',
  dcNumber: '',
  weightPure: 0,
  weightMixing: 0,
  grossWeight: 0,
  rate: 0,
  amount: 0,
  billNo: '',
  product: '',
  userId: '', 
  userType: '',
  phoneNumber: '',
};

export type FormModel = Omit<InitialData, "tags"> & {
  tags: { label: string; value: string }[] | string[];
};

export type SetSubmitting = (isSubmitting: boolean) => void;

export type OnDeleteCallback = React.Dispatch<React.SetStateAction<boolean>>;

type OnDelete = (callback: OnDeleteCallback) => void;

type clientForm = {
  userName?: string;
  userId?: string;
  userType?: string;
  phoneNumber?: string;
  initialData?: InitialData;
  type: "edit" | "new";
  onDiscard?: () => void;
  onDelete?: OnDelete;
  onFormSubmit: (formData: FormModel, setSubmitting: SetSubmitting) => void;
};

const { useUniqueId } = hooks;

const validationSchema = Yup.object().shape({
 // date: Yup.string().required("Date is required"),
  clientName: Yup.string().required("Client Name is required"),
  quality: Yup.string().required("Quality is required"),
  dcNumber: Yup.string().required("DC Number is required"),
  billNo: Yup.string().required("Bill Number is required"),
  
  weightPure: Yup.number().required("Weight Pure is required"),
  weightMixing: Yup.number().required("Weight Mixing is required"),
  grossWeight: Yup.number().required("Gross Weight is required"),
  rate: Yup.number().required("Rate is required"),
  amount: Yup.number().required("Amount is required"),
  totalAmount: Yup.number().required("Amount is required"),
  product: Yup.string().required("Product is required"),
});

 


const CustomerForm = forwardRef<FormikRef, clientForm>((props, ref) => {
  console.log("EDIT DATA", props.initialData);
  const {
    userName,
    userId,
    userType,
    phoneNumber,
    type,
    initialData = {
      date: new Date(),
      clientName: userName || '',
      quality: '',
      dcNumber: '',
      weightPure: 0,
      weightMixing: 0,
      grossWeight: 0,
      rate: 0,
      amount: 0,
      extraRate: 0,
      extraAmount: 0,
      totalAmount: 0,
      billNo: '',
      product: '',
      additionalRate: false,
      userId: userId || null,
      userType: userType || 'walkingCustomer',
      phoneNumber: '',
      ratio: ''
    },
    onFormSubmit,
    onDiscard,
    onDelete,
  } = props;
  console.log("PROPS INITIAL DATA", props.initialData);
  const newId = useUniqueId("product-");
 

  
 

  
  return (
    <AdaptableCard>
      
      <Formik
        innerRef={ref}
        initialValues={cloneDeep(initialData)}
        validationSchema={validationSchema}
        onSubmit={async (values: FormModel, { setSubmitting }) => {
          const formData = cloneDeep(values);
          // navigate("/game");
          try {
            
            onFormSubmit?.(formData, setSubmitting);
          } catch (error) {
            setSubmitting(false);
          }
        }}
      >
        {({ values, touched, errors, isSubmitting }) => (
          <Form>
            <FormContainer>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  <BasicInformationFields
                    userName={userName}
                    userId={ userId}
                    userType={userType}
                    phoneNumber={phoneNumber}
                    page={type}
                    touched={touched}
                    errors={errors}
                  />
                  
                </div>
              </div>
              <StickyFooter
                className="-mx-8 px-8 flex items-center justify-between py-4"
                stickyClass="border-t bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              >
                <div className="md:flex items-center">
                  <Button
                    size="sm"
                    variant="solid"
                    loading={isSubmitting}
                    icon={<AiOutlineSave />}
                    type="submit"
                  >
                    Save
                  </Button>
                </div>
              </StickyFooter>
            </FormContainer>
          </Form>
        )}
      </Formik>
    </AdaptableCard>
  );
});

CustomerForm.displayName = "CustomerForm";

export default CustomerForm;
