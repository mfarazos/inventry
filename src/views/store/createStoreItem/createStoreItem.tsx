import GameModeForm, {
  FormModel,
  SetSubmitting,
} from "@/views/store/StoreForm/StoreForm";
import toast from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import { useNavigate } from "react-router-dom";
import { apiAddStoreItem } from "@/services/StoreServices";
import Loader from "@/components/internal/Loader";
import { handleHttpReq } from "@/utils/HandleHttp";
import { createGameMode } from "@/services/GameManagement";
import { createStore } from "@reduxjs/toolkit";
import StoreForm from "../StoreForm/StoreForm";

const createStoreItem = () => {
  const navigate = useNavigate();

  const addProduct = async (data: FormModel) => {
    console.log("DATA UPLOADED ", data);
    const response = await apiAddStoreItem(data);
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
      <StoreForm
        type="new"
        onFormSubmit={handleFormSubmit}
        onDiscard={handleDiscard}
      />
    </>
  );
};

export default createStoreItem;
