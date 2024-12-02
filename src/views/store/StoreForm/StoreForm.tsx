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
  itemType: string;
  itemTag: string;
  paymentType: string;
  amount: number;
  gold: number;
  chips: number;
  itemIcon: string;
  itemDetails: string;
  appleId: string;
  googleId: string;
};

export type FormModel = Omit<InitialData, "tags"> & {
  tags: { label: string; value: string }[] | string[];
};

export type SetSubmitting = (isSubmitting: boolean) => void;

export type OnDeleteCallback = React.Dispatch<React.SetStateAction<boolean>>;

type OnDelete = (callback: OnDeleteCallback) => void;

type StoreForm = {
  initialData?: InitialData;
  type: "edit" | "new";
  onDiscard?: () => void;
  onDelete?: OnDelete;
  onFormSubmit: (formData: FormModel, setSubmitting: SetSubmitting) => void;
};

const { useUniqueId } = hooks;

const validationSchema = Yup.object().shape({
  //itemType: Yup.string().required("itemTypeRequired Required"),
  //itemTag: Yup.string().required("Price Required"),
  //itemDetails: Yup.string().required("itemDetails Required"),
  //PaymentType: Yup.string().required("PaymentType Required"),
  //amount: Yup.number().required("Amount Required"),
  //gold: Yup.number().required("Gold Required"),
  //Chips: Yup.number().required("Chips Required"),
  // googleId: Yup.string().required("google sku Required"),
  // appleId: Yup.string().required("apple sku Required"),
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

const StoreForm = forwardRef<FormikRef, StoreForm>((props, ref) => {
  const {
    type,
    initialData = {
      itemType: "",
      itemTag: "",
      paymentType: "",
      amount: 0,
      gold: 0,
      chips: 0,
      itemIcon: "",
      itemDetails: "",
      appleId: "",
      googleId: ""
    },
    onFormSubmit,
    onDiscard,
    onDelete,
  } = props;
  const [avatarImg, setAvatarImg] = useState<string | null>();
  const [file, setFile] = useState<File | null>(null);
  const newId = useUniqueId("product-");
  const navigate = useNavigate();

  console.log("TYPE", type);

  useEffect(() => {
    if (type === "edit") {
      setAvatarImg(initialData.itemIcon);
    }
  }, []);

  const onFileUpload = (files: File[]) => {
    //if (type === "new" && files.length > 0) {
      console.log("kejejjej");

      setFile(files[0]);
      setAvatarImg(URL.createObjectURL(files[0]));
   // }
  };

  const beforeUpload = (files: FileList | null) => {
    
    let valid: string | boolean = true;

    const allowedFileType = ["image/jpeg", "image/png"];
    if (files) {
      for (const file of files) {
        if (!allowedFileType.includes(file.type)) {
          valid = "Please upload a .jpeg or .png file!";
        }
      }
    }
    console.log("chala", valid);
    return valid;
  };

  const uploadImg = async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    console.log("heheh");
    const imgResponse = await uploadImage(form);

    return imgResponse.data?.data?.file_url;
  };

  return (
    <AdaptableCard>
      <div className="text-center">
        {type == "new" ? <h5>Upload a picture</h5> : <h5>Edit picture</h5>}
        <Upload
          className="cursor-pointer"
          showList={false}
          uploadLimit={1}
          beforeUpload={beforeUpload}
          onChange={onFileUpload}
        >
          <Avatar
            size={200}
            src={avatarImg as string}
            icon={<HiOutlinePlus />}
          />
        </Upload>
      </div>
      <Formik
        innerRef={ref}
        initialValues={{
          ...initialData,
        }}
        validationSchema={validationSchema}
        
        onSubmit={async (values: FormModel, { setSubmitting }) => {
          console.log("sssssss");

          const formData = cloneDeep(values);
          console.log("initial:", formData);
          //navigate("/store/editstoreitem");
          try {
            if (file) {
              const imageUrl = await uploadImg(file);
              formData.itemIcon = imageUrl;
            }
            if (!formData.itemIcon) {
              return alert("image must be insert");
            }

            // if (type === 'new') {
            //     formData._id = newId;
            // }

            console.log("Form values after upload:", formData);

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
                    // onClick={()=>{console.log(values);
                    // }}
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

StoreForm.displayName = "StoreForm";

export default StoreForm;
