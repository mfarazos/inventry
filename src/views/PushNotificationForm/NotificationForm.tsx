import { forwardRef, useState } from "react";
import { FormContainer } from "@/components/ui/Form";
import Button from "@/components/ui/Button";
import hooks from "@/components/ui/hooks";
import StickyFooter from "@/components/shared/StickyFooter";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { Form, Formik, FormikProps } from "formik";
import BasicInformationFields from "./BasicInformationFields";
import cloneDeep from "lodash/cloneDeep";
import { HiOutlineTrash } from "react-icons/hi";
import { AiOutlineSave } from "react-icons/ai";
import * as Yup from "yup";

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
type FormikRef = FormikProps<any>;

type InitialData = {
  _id?: string;
  title?: string;
  message?: string;
};

export type FormModel = Omit<InitialData, "tags"> & {
  tags: { label: string; value: string }[] | string[];
};

export type SetSubmitting = (isSubmitting: boolean) => void;

export type OnDeleteCallback = React.Dispatch<React.SetStateAction<boolean>>;

type OnDelete = (callback: OnDeleteCallback) => void;

type PushNotificationForm = {
  initialData?: InitialData;
  type: "edit" | "new";
  onDiscard?: () => void;
  onDelete?: OnDelete;
  onFormSubmit: (formData: FormModel, setSubmitting: SetSubmitting) => void;
};

const { useUniqueId } = hooks;

const validationSchema = Yup.object().shape({
  title: Yup.string().max(80).required("Title Required"),
  message: Yup.string().max(360).required("message Required"),
});

const DeleteProductButton = ({ onDelete }: { onDelete: OnDelete }) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const onConfirmDialogOpen = () => {
    setDialogOpen(true);
  };

  const onConfirmDialogClose = () => {
    setDialogOpen(false);
  };

  const handleConfirm = () => {
    onDelete?.(setDialogOpen);
  };

  return (
    <>
      <Button
        className="text-red-600"
        variant="plain"
        size="sm"
        icon={<HiOutlineTrash />}
        type="button"
        onClick={onConfirmDialogOpen}
      >
        Delete
      </Button>
      <ConfirmDialog
        isOpen={dialogOpen}
        type="danger"
        title="Delete product"
        confirmButtonColor="red-600"
        onClose={onConfirmDialogClose}
        onRequestClose={onConfirmDialogClose}
        onCancel={onConfirmDialogClose}
        onConfirm={handleConfirm}
      >
        <p>
          Are you sure you want to delete this product? All record related to
          this product will be deleted as well. This action cannot be undone.
        </p>
      </ConfirmDialog>
    </>
  );
};

const PushNotificationForm = forwardRef<FormikRef, PushNotificationForm>(
  (props, ref) => {
    const {
      type,
      initialData = {
        _id: "",
        title: "",
        message: "",
      },
      onFormSubmit,
      onDiscard,
      onDelete,
    } = props;

    const newId = useUniqueId("product-");

    return (
      <>
        <Formik
          innerRef={ref}
          initialValues={{
            ...initialData,
          }}
          validationSchema={validationSchema}
          onSubmit={(values: FormModel, { setSubmitting }) => {
            const formData = cloneDeep(values);

            console.log(formData);

            formData.tags = formData.tags?.map((tag) => {
              if (typeof tag !== "string") {
                return tag.value;
              }
              return tag;
            });
            if (type === "new") {
              // formData.id = newId
              // if (formData.imgList && formData.imgList.length > 0) {
              //     formData.img = formData.imgList[0].img
              // }
            }
            onFormSubmit?.(formData, setSubmitting);
          }}
        >
          {({ values, touched, errors, isSubmitting }) => (
            <Form>
              <FormContainer>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2">
                    <BasicInformationFields touched={touched} errors={errors} />
                  </div>
                  {/* <div className="lg:col-span-1">
                                    <ProductImages values={values} />
                                </div> */}
                </div>
                <StickyFooter
                  className="-mx-8 px-8 flex items-center justify-between py-4"
                  stickyClass="border-t bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                >
                  <div>
                    {type === "edit" && (
                      <DeleteProductButton onDelete={onDelete as OnDelete} />
                    )}
                  </div>
                  <div className="md:flex items-center">
                    <Button
                      size="sm"
                      className="ltr:mr-3 rtl:ml-3"
                      type="button"
                      onClick={() => onDiscard?.()}
                    >
                      Discard
                    </Button>
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
      </>
    );
  }
);

PushNotificationForm.displayName = "PushNoificationForm";

export default PushNotificationForm;
