import GameModeForm, {
  FormModel,
  SetSubmitting,
} from "@/views/GameManagement/GameModeForm";
import toast from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import { useNavigate } from "react-router-dom";
import { apiCreateSalesProduct } from "@/services/StoreServices";
import Loader from "@/components/internal/Loader";
import { handleHttpReq } from "@/utils/HandleHttp";
import { createGameMode } from "@/services/GameManagement";

const CreateGameModes = () => {
  const navigate = useNavigate();

  const addProduct = async (data: FormModel) => {
    console.log("DATA UPLOADED ", data);
    const response = await createGameMode<FormModel>(data);
    console.log("RESPONSE", response.data);
    return response.data;
  };

  const handleFormSubmit = async (
    values: FormModel,
    setSubmitting: SetSubmitting
  ) => {
    console.log("FORM VALUS ARE HEHEHE", values);
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
        // navigate("/game");
      }
    });
  };

  const handleDiscard = () => {
    navigate("/app/sales/product-list");
  };

  return (
    <>
      <GameModeForm
        type="new"
        onFormSubmit={handleFormSubmit}
        onDiscard={handleDiscard}
      />
    </>
  );
};

export default CreateGameModes;
