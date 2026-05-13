import Customerform, {
    FormModel,
    SetSubmitting,
  } from "@/views/Customer/Customerform";
  import toast from "@/components/ui/toast";
  import Notification from "@/components/ui/Notification";
  import { useNavigate, useLocation } from "react-router-dom";
  
  import Loader from "@/components/internal/Loader";
  import { handleHttpReq } from "@/utils/HandleHttp";
  import { createCustomer } from "@/services/GameManagement";

  
  const CreateCustomer = () => {
    const navigate = useNavigate();
    const location = useLocation();
  const { userType, userId, userName } = location.state || {};

  console.log("CreateCustomer", location);
 
  
    const addProduct = async (data: FormModel) => {
      console.log("DATA UPLOADED ", data);
      console.log( userType, userId, userName);
      data.userType = userType || "walkingCustomer";
      data.userId = userId || null;
      const response = await createCustomer<FormModel>(data);
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
          if (userType === "specificCustomer") {
            navigate(`/inventrylist?productMaterialType=${values.product}&selectedMonthByParams=${values?.date}`, { state: { userType: "specificCustomer", userId: userId, userName: userName } });
          } else {
            navigate(`/inventrylist?productMaterialType=${values.product}&selectedMonthByParams=${values?.date}`);
          }
        }
      });
    };
  
    const handleDiscard = () => {
      navigate("/app/sales/product-list");
    };
  
    return (
      <>
        <Customerform
          userName={userName}
          userId={userId}
          userType={userType}
          type="new"
          onFormSubmit={handleFormSubmit}
          onDiscard={handleDiscard}
        />
      </>
    );
  };
  
  export default CreateCustomer;
  