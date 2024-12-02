import ProductForm, {
  FormModel,
  SetSubmitting,
} from "@/views/PushNotificationForm";
import toast from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import { useNavigate } from "react-router-dom";
import { apiCreateSalesProduct } from "@/services/StoreServices";
import { PushNostifcation } from "@/services/NotificationService";

const PushNotification = () => {
  const navigate = useNavigate();

  const addProduct = async (data: FormModel) => {
    const response = await PushNostifcation(data);

    console.log(response);

    return response.statusText;
  };

  const handleFormSubmit = async (
    values: FormModel,
    setSubmitting: SetSubmitting
  ) => {
    setSubmitting(true);
    const success = await addProduct(values);
    setSubmitting(false);
    if (success) {
      toast.push(
        <Notification
          title={"Successfuly added"}
          type="success"
          duration={2500}
        >
          Notification Send SuccessFully
        </Notification>,
        {
          placement: "top-center",
        }
      );
      navigate("/app/sales/product-list");
    }
  };

  const handleDiscard = () => {
    navigate("/app/sales/product-list");
  };

  return (
    <>
      <ProductForm
        type="new"
        onFormSubmit={handleFormSubmit}
        onDiscard={handleDiscard}
      />
    </>
  );
};

export default PushNotification;
