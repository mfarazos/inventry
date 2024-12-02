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
  bigBlind: Yup.number().required("Big Blind Required"),
  smallBlind: Yup.number().required("Small Blind Required"),
  buyInRange: Yup.array()
            .of(Yup.number().required("Each value in the Buy In Range is required"))
            .test(
              "is-max-greater-than-min",
              "Max Buy In Range must be greater than Min Buy In Range",
              function (value) {
                if (Array.isArray(value) && value.length === 2) {
                  const [min, max] = value;
                  return max > min;
                }
                return true; // Skip validation if value is not an array with 2 elements
              }
            )
            .required("Buy In Range Required"),
});

const GameModeForm = forwardRef<FormikRef, GameModeForm>((props, ref) => {
  const {
    type,
    initialData = {
      bigBlind: 0,
      smallBlind: 0,
      image: "",
      buyInRange: [],
    },
    onFormSubmit,
    onDiscard,
    onDelete,
  } = props;

  const [avatarImg, setAvatarImg] = useState<string | null>(initialData.image);
  const [file, setFile] = useState<File | null>(null);
  const newId = useUniqueId("product-");
  const navigate = useNavigate();

  useEffect(() => {
    if (type === "edit" && initialData.image) {
      setAvatarImg(initialData.image);
    }
  }, [type, initialData.image]);

  const onFileUpload = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setAvatarImg(URL.createObjectURL(files[0]));
    }
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
    
    return valid;
  };

  const uploadImg = async (file: File) => {
    console.log("call or not");
    const form = new FormData();
    form.append("file", file);
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
          uploadLimit={type == "new" ? 1 : 0}
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
          const formData = cloneDeep(values);

          try {
            if (file) {
              const imageUrl = await uploadImg(file);
              formData.image = imageUrl;
            }
            if (!formData.image) {
              return alert("image must be insert");
            }

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
