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
import WinnerPrizeField from "./WinnnerPrizeFields";

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
type FormikRef = FormikProps<any>;

type InitialData = {
  _id: string;
  name: string;
  description: string;
  winnerPrize: Array<number>;
  image: string;
  entryChips: number;
  registrationStartDate: string;
  registrationEndDate: string;
  tournamentStartDate: string;
  tournamentEndDate: string;
  maxUserInTournament: number;
  minUserInTournament: number;
  tournamentDuration: number;
};

export type FormModel = Omit<InitialData, "tags"> & {
  tags: { label: string; value: string }[] | string[];
};

export type SetSubmitting = (isSubmitting: boolean) => void;

export type OnDeleteCallback = React.Dispatch<React.SetStateAction<boolean>>;

type OnDelete = (callback: OnDeleteCallback) => void;

type TournamentForm = {
  initialData?: InitialData;
  type: "edit" | "new";
  onDiscard?: () => void;
  onDelete?: OnDelete;
  onFormSubmit: (formData: FormModel, setSubmitting: SetSubmitting) => void;
};

const { useUniqueId } = hooks;

const validationSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  description: Yup.string().required("Description is required"),
  winnerPrize: Yup.array(Yup.number()),
  entryChips: Yup.number().required("Entry chips are required"),
  
  tournamentStartDate: Yup.date().required("Tournament start date is required"),
  maxUserInTournament: Yup.number().required(
    "Maximum users in tournament is required"
  ),
  minUserInTournament: Yup.number().required(
    "Minimum users in tournament is required"
  ),
  tournamentDuration: Yup.number()
  .required("Tournament duration is required")
  .min(1, "Tournament duration must be at least 0 hours")
  .max(24, "Tournament duration must be at most 24 hours"),
});
 

// const DeleteProductButton = ({ onDelete }: { onDelete: OnDelete }) => {
//   const [dialogOpen, setDialogOpen] = useState(false);

//   const onConfirmDialogOpen = () => {
//     setDialogOpen(true);
//   };

//   const onConfirmDialogClose = () => {
//     setDialogOpen(false);
//   };

//   const handleConfirm = () => {
//     onDelete?.(setDialogOpen);
//   };

//   return (
//     <>
//       <Button
//         className="text-red-600"
//         variant="plain"
//         size="sm"
//         icon={<HiOutlineTrash />}
//         type="button"
//         onClick={onConfirmDialogOpen}
//       >
//         Delete
//       </Button>
//       <ConfirmDialog
//         isOpen={dialogOpen}
//         type="danger"
//         title="Delete product"
//         confirmButtonColor="red-600"
//         onClose={onConfirmDialogClose}
//         onRequestClose={onConfirmDialogClose}
//         onCancel={onConfirmDialogClose}
//         onConfirm={handleConfirm}
//       >
//         <p>
//           Are you sure you want to delete this product? All record related to
//           this product will be deleted as well. This action cannot be undone.
//         </p>
//       </ConfirmDialog>
//     </>
//   );
// };

const TournamentForm = forwardRef<FormikRef, TournamentForm>((props, ref) => {
  console.log("EDIT DATA", props.initialData);
  const {
    type,
    initialData = {
      name: "",
      description: "",
      winnerPrize: [],
      image: "",
      entryChips: 0,
      registrationStartDate: new Date().toISOString().split("T")[0],
      registrationEndDate: new Date().toISOString().split("T")[0],
      tournamentStartDate: new Date().toISOString().split("T")[0],
      tournamentEndDate: new Date().toISOString().split("T")[0],
      maxUserInTournament: 0,
      minUserInTournament: 0,
      tournamentDuration: 0,
    },
    onFormSubmit,
    onDiscard,
    onDelete,
  } = props;
  console.log("PROPS INITIAL DATA", props.initialData);
  const [avatarImg, setAvatarImg] = useState<string | null>();
  const [file, setFile] = useState<File | null>(null);
  const newId = useUniqueId("product-");
  const navigate = useNavigate();

  useEffect(() => {
    if (type === "edit") {
      setAvatarImg(initialData.image);
    }
  }, []);

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
    const form = new FormData();
    form.append("file", file);
    console.log("FILE UPLOADED");
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
        initialValues={cloneDeep(initialData)}
        validationSchema={validationSchema}
        onSubmit={async (values: FormModel, { setSubmitting }) => {
          const formData = cloneDeep(values);
          // navigate("/game");
          try {
            if (file) {
              const imageUrl = await uploadImg(file);
              formData.image = imageUrl;
            }
            if (!formData.image) {
              return alert("image must be insert");
            }

            // if (type === 'new') {
            //     formData._id = newId;
            // }

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
                    page={type}
                    touched={touched}
                    errors={errors}
                  />
                  <WinnerPrizeField
                    page={type}
                    touched={touched}
                    errors={errors}
                    values={values}
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
                    onClick={() => {
                      console.log("VALUES HERE", values);
                    }}
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

TournamentForm.displayName = "TournamentForm";

export default TournamentForm;
