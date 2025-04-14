import { useCallback, useEffect, useState } from "react";
import Loading from "@/components/shared/Loading";
import DoubleSidedImage from "@/components/shared/DoubleSidedImage";
import toast from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import { useLocation, useNavigate } from "react-router-dom";
import { getCustomerById } from "@/services/GameManagement";

import Customerform, {
    FormModel,
    SetSubmitting,
  } from "@/views/Customer/Customerform";
import isEmpty from "lodash/isEmpty";
import { apiUpdateCustomer } from "@/services/StoreServices";
import { handleHttpReq } from "@/utils/HandleHttp";
import CustomerForm from "../Customerform/Customerform";

const EditCustomer = () => {
  const [productData, setProductData] = useState();

  const location = useLocation();
  const navigate = useNavigate();

  const updateProduct = async (data: FormModel) => {
    const response = await apiUpdateCustomer<boolean, FormModel>(data);
    return response.data;
  };

  const products = useCallback(async (id: string) => {
    try {
      const response = await getCustomerById<any>(id);
      console.log("EDITED", response.data.data);
      setProductData(response.data.data);
    } catch (error) {
      console.error('Error fetching product data:', error);
    }
  }, [setProductData]);

  const handleFormSubmit = async (
    values: FormModel,
    setSubmitting: SetSubmitting
  ) => {
    console.log("upadte vals", values);
     setSubmitting(true);
    handleHttpReq(async () => {
      const success = await updateProduct(values);
      setSubmitting(false)
      if (success) {
        popNotification("updated");
      }
    });
  };

  const handleDiscard = () => {
    navigate("/app/sales/product-list");
  };

  const handleDelete = async (setDialogOpen: OnDeleteCallback) => {
    setDialogOpen(false);
    // const success = await deleteProduct({ id: productData })
    // if (success) {
    //     popNotification('deleted')
    // }
  };

  const popNotification = (keyword: string) => {
    toast.push(
      <Notification
        title={`Successfuly ${keyword}`}
        type="success"
        duration={2500}
      >
        Product successfuly {keyword}
      </Notification>,
      {
        placement: "top-center",
      }
    );
    navigate("/inventrylist");
  };

  useEffect(() => {
    console.log("INSIDE USEFFECT");
    const path = location.pathname.substring(
      location.pathname.lastIndexOf("/") + 1
    );
    const rquestParam = { id: path };
    console.log("getparams", rquestParam);
    products(path);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <>
      <Loading loading={false}>
        {!isEmpty(productData) && (
          <>
            <CustomerForm
              type="edit"
              initialData={productData}
              onFormSubmit={handleFormSubmit}
              onDiscard={handleDiscard}
              onDelete={handleDelete}
            />
          </>
        )}
      </Loading>
      
    </>
  );
};

export default EditCustomer;
