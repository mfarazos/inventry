import PaymentSalesForm, {
    FormModel,
    SetSubmitting,
  } from "../Paymentform";
  
  import toast from "@/components/ui/toast";
  import Notification from "@/components/ui/Notification";
  import { useNavigate, useLocation } from "react-router-dom";
  import { handleHttpReq } from "@/utils/HandleHttp";
  import { createSalesPayment } from "@/services/GameManagement";
  
  const CreateSalesPayment = () => {
    const navigate = useNavigate();
    const location = useLocation();
  
    const { userType, userId, userName, phoneNumber, billNo } = location.state || {};
  
    const addPayment = async (data: FormModel) => {
      data.userType = userType || "walkingCustomer";
      data.userId = userId || "";
      data.clientName = userName || data.clientName;
      data.phoneNumber = phoneNumber || data.phoneNumber;
      data.billNo = billNo || data.billNo;
  
      const response = await createSalesPayment<FormModel>(data);
      return response.data;
    };
  
    const handleFormSubmit = async (
      values: FormModel,
      setSubmitting: SetSubmitting
    ) => {
      setSubmitting(true);
  
      handleHttpReq(async () => {
        const success = await addPayment(values);
        setSubmitting(false);
  
        if (success) {
          toast.push(
            <Notification title="Successfully added" type="success" duration={2500}>
              Payment received successfully
            </Notification>,
            { placement: "top-center" }
          );
  
        }
      });
    };
  
    const handleDiscard = () => {
      navigate(-1);
    };
  
    return (
      <PaymentSalesForm
        type="new"
        userName={userName}
        userId={userId}
        userType={userType}
        initialData={{
          clientName: userName || "",
          userId: userId || "",
          userType: userType || "walkingCustomer",
          phoneNumber: phoneNumber || "",
          billNo: billNo || "",
          folio: "",
          date: new Date().toISOString().slice(0, 10),
          amount: 0,
          paymentMethod: "cash",
          description: "Payment received",
        }}
        onFormSubmit={handleFormSubmit}
        onDiscard={handleDiscard}
      />
    );
  };
  
  export default CreateSalesPayment;