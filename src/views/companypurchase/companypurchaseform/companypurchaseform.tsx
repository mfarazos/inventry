import { forwardRef, useEffect, useState } from "react";
import { FormContainer } from "@/components/ui/Form";
import Button from "@/components/ui/Button";
import hooks from "@/components/ui/hooks";
import StickyFooter from "@/components/shared/StickyFooter";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { Form, Formik, FormikProps } from "formik";
import BasicInformationFields from "./BasicInformationFields";
import {
  MIXING_VARIETIES,
  emptyMixingVarietyValues,
  selectedVarietiesFromData,
} from "./mixingVarieties";
import cloneDeep from "lodash/cloneDeep";
import { HiOutlinePlus, HiOutlineTrash } from "react-icons/hi";
import { AiOutlineSave } from "react-icons/ai";
import { uploadImage } from "@/services/UploadService";
import * as Yup from "yup";
import { AdaptableCard } from "@/components/shared";
import { Upload, Avatar } from "@/components/ui";
import { useNavigate } from "react-router-dom";
import { isNull } from "lodash";

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
type FormikRef = FormikProps<any>;

type InitialData = {
  bigBlind: number;
  smallBlind: number;
  buyInRange: Array<number>;
  image: string;
};

export type FormModel = Omit<InitialData, "tags"> & {
  tags: { label: string; value: string }[] | string[];
};

export type SetSubmitting = (isSubmitting: boolean) => void;

export type OnDeleteCallback = React.Dispatch<React.SetStateAction<boolean>>;

type OnDelete = (callback: OnDeleteCallback) => void;

type Companypurchaseform = {
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
  // date: Yup.string()
  //   .required("Date is required."),
    
  quality: Yup.string().required("Quality details are required."),
  quantity: Yup.number()
    .min(0, "Quantity cannot be negative.")
    .required("Quantity is required."),
  pureBags: Yup.number().min(0, "Pure bags cannot be negative."),
  mixingBags: Yup.number().min(0, "Mix bags cannot be negative."),
  mixingBagsWeight: Yup.number().min(0, "Mix bags weight cannot be negative."),
  totalBags: Yup.number().min(0, "Total bags cannot be negative."),
  rate: Yup.number().min(0, "Rate cannot be negative."),
  
  billNo: Yup.string().required("Bill number is required."),
  receivedFrom: Yup.string().required("Received From is required."),
  product: Yup.string().required("Product details are required.")
});



const Companypurchaseform = forwardRef<FormikRef, Companypurchaseform>((props, ref) => {
  const {
    type,
    userName,
    userId,
    userType,
    phoneNumber,
    initialData = {
      date: new Date(), 
      quality: "",
      quantity: "",
      pureBags: 0,
      mixingBags: 0,
      mixingBagsWeight: 0,
      totalBags: 0,
      weightPure: 0,
      weightMixing: 0,
      rate: 0,
      grossWeight: 0,
      billNo: "",
      receivedFrom: "",
      vendorRef: "",
      product: "",
      isNorani: false,
      ...emptyMixingVarietyValues(),
      userId: userId || null,
      userType: userType || 'walkingCustomer',
      userName: userName || null,
      phoneNumber: ''
      
    },
    onFormSubmit,
    onDiscard,
    onDelete,
  } = props;

  
  const navigate = useNavigate();

  
  

  return (
    <AdaptableCard>
      
      <Formik
        innerRef={ref}
        initialValues={{
          ...emptyMixingVarietyValues(),
          ...initialData,
          selectedVarieties: selectedVarietiesFromData(initialData),
        }}
        validationSchema={validationSchema}
        onSubmit={async (values: FormModel, { setSubmitting }) => {
          const formData: any = cloneDeep(values);

          const selectedVarieties: string[] = formData.selectedVarieties || [];
          delete formData.selectedVarieties;

          // backend derives these from the bags, sending them would double count
          delete formData.weightMixing;
          delete formData.grossWeight;

          // only send the varieties the user ticked
          MIXING_VARIETIES.forEach((variety) => {
            if (selectedVarieties.includes(variety.key)) return;
            delete formData[variety.bagsField];
            delete formData[variety.weightField];
            delete formData[variety.weightTotalField];
          });

          try {
            

            onFormSubmit?.(formData, setSubmitting);
          } catch (error) {
            console.error("Error uploading image:", error);
            setSubmitting(false);
          }
        }}
      >
        {({ values, touched, errors, isSubmitting }) => (
          <Form>
            <FormContainer>
              <div className="w-full max-w-5xl mx-auto">
                <div>
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

Companypurchaseform.displayName = "Companypurchaseform";

export default Companypurchaseform
