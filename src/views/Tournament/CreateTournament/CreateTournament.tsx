import TournamentForm, {
  FormModel,
  SetSubmitting,
} from "@/views/Tournament/TournamentForm";
import toast from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import { useNavigate } from "react-router-dom";
import { apiCreateSalesProduct } from "@/services/StoreServices";
import Loader from "@/components/internal/Loader";
import { handleHttpReq } from "@/utils/HandleHttp";
import { createtournament } from "@/services/TournamentService";

const CreateTournament = () => {
  const navigate = useNavigate();

  const addProduct = async (data: FormModel) => {
    const response = await createtournament<FormModel>(data);
    console.log("RESPNSE", response);
    return response.data;
  };

  const handleFormSubmit = async (
    values: FormModel,
    setSubmitting: SetSubmitting
  ) => {
    setSubmitting(true);
    console.log("when send data in api", values);
    handleHttpReq(async () => {
      const success = await addProduct(values);
      setSubmitting(false);
      if (success) {
        toast.push(
          <Notification
            title={"Successfuly added"}
            type="success"
            duration={2500}
          >
            Product successfuly added
          </Notification>,
          {
            placement: "top-center",
          }
        );
        navigate("/tournament");
      }
    });
  };

  const handleDiscard = () => {
    navigate("/app/sales/product-list");
  };

  return (
    <>
      <TournamentForm
        type="new"
        onFormSubmit={handleFormSubmit}
        onDiscard={handleDiscard}
      />
    </>
  );
};

export default CreateTournament;
