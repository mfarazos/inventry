import { forwardRef, useEffect, useState } from "react";
import { FormContainer } from "@/components/ui/Form";
import Button from "@/components/ui/Button";
import hooks from "@/components/ui/hooks";
import StickyFooter from "@/components/shared/StickyFooter";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { Form, Formik, FormikProps } from "formik";
import BasicInformationFields from "./BasicInformationFields";
import cloneDeep from "lodash/cloneDeep";
import { HiOutlinePlus, HiOutlineTrash } from "react-icons/hi";
import { AiOutlineSave } from "react-icons/ai";
import { uploadImage } from "@/services/UploadService";
import * as Yup from "yup";
import { AdaptableCard } from "@/components/shared";
import { Upload, Avatar } from "@/components/ui";
import { useNavigate } from "react-router-dom";

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

type GameModeForm = {
  initialData?: InitialData;
  type: "edit" | "new";
  onDiscard?: () => void;
  onDelete?: OnDelete;
  onFormSubmit: (formData: FormModel, setSubmitting: SetSubmitting) => void;
};

const { useUniqueId } = hooks;

const validationSchema = Yup.object().shape({
  date: Yup.string().required("Date is required for Dana Receipt."),
  weight: Yup.string().required("Weight value is required."),
  quantity: Yup.number().required("Quantity must be provided."),
  quality: Yup.string().required("Quality details are required."),
  receivedFrom: Yup.string().required("Please specify who the dana is received from."),
  billNo: Yup.string().required("Bill number is required."),
  danaReceiverName: Yup.string().required("Dana receiver's name is required."),
  
});

const GameModeForm = forwardRef<FormikRef, GameModeForm>((props, ref) => {
  const {
    type,
    initialData = {
      date: new Date(), 
      weight: "",
      quality: "",
      quantity: "",
      receivedFrom: "",
      billNo: "",
      danaReceiverName: ""
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
          ...initialData,
        }}
        validationSchema={validationSchema}
        onSubmit={async (values: FormModel, { setSubmitting }) => {
          const formData = cloneDeep(values);

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
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  <BasicInformationFields
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

GameModeForm.displayName = "GameModeForm";

export default GameModeForm;
