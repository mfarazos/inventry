import { useEffect, useState } from "react";
import PaymentSalesForm, { FormModel, SetSubmitting } from "../Paymentform";
import toast from "@/components/ui/toast";
import Notification from "@/components/ui/Notification";
import ApiService from "@/services/ApiService";
import { useNavigate, useLocation } from "react-router-dom";
import {
  createSalesPayment,
  getCategorycustomers,
  getwalkingCustomers,
} from "@/services/GameManagement";

type CustomerType = "walkingCustomer" | "specificCustomer";

type CustomerOption = {
  _id?: string;
  clientName?: string;
  phoneNumber?: string;
  billNo?: string;
};

const userTypeOptions: Array<{ value: CustomerType; label: string }> = [
  { value: "walkingCustomer", label: "Walking Customer" },
  { value: "specificCustomer", label: "Specific Customer" },
];

const getResponseRows = (responseData: any): CustomerOption[] => {
  if (Array.isArray(responseData?.data)) return responseData.data;
  if (Array.isArray(responseData?.data?.data)) return responseData.data.data;
  if (Array.isArray(responseData)) return responseData;

  return [];
};

const CreateSalesPayment = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const routeState = (location.state || {}) as {
    userType?: CustomerType;
    userId?: string;
    userName?: string;
    phoneNumber?: string;
    billNo?: string;
  };

  const {
    userType,
    userId,
    userName,
    phoneNumber,
    billNo,
  } = routeState;

  const isDirectEntry = !(
    userType ||
    userId ||
    userName ||
    phoneNumber ||
    billNo
  );

  const [selectedUserType, setSelectedUserType] = useState<CustomerType>(
    userType || "walkingCustomer",
  );
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerOption | null>(null);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [debouncedCustomerSearch, setDebouncedCustomerSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCustomerSearch(customerSearchTerm.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [customerSearchTerm]);

  useEffect(() => {
    if (!isDirectEntry) return;
    if (!debouncedCustomerSearch) {
      setCustomers([]);
      setCustomerLoading(false);
      return;
    }

    const fetchCustomers = async () => {
      setCustomerLoading(true);

      try {
        const url =
          selectedUserType === "specificCustomer"
            ? getCategorycustomers()
            : getwalkingCustomers();
        const response = await ApiService.fetchData<any>({
          url,
          method: "get",
          params: {
            search: debouncedCustomerSearch,
            page: 1,
            limit: 100,
          },
        });

        setCustomers(getResponseRows(response.data));
      } catch {
        setCustomers([]);
      } finally {
        setCustomerLoading(false);
      }
    };

    fetchCustomers();
  }, [debouncedCustomerSearch, isDirectEntry, selectedUserType]);

  const activeUserType = selectedUserType;
  const activeUserId =
    activeUserType === "specificCustomer"
      ? selectedCustomer?._id || userId || ""
      : "";
  const activeUserName = selectedCustomer?.clientName || userName || "";
  const activePhoneNumber = selectedCustomer?.phoneNumber || phoneNumber || "";
  const activeBillNo = selectedCustomer?.billNo || billNo || "";

  const addPayment = async (data: FormModel) => {
    if (isDirectEntry && !selectedCustomer) {
      toast.push(
        <Notification title="Select customer" type="warning" duration={2500}>
          Please select customer from the search list before receiving payment.
        </Notification>,
        { placement: "top-center" },
      );

      return null;
    }

    const payload: FormModel = {
      ...data,
      userType: activeUserType,
      userId: activeUserId || data.userId,
      clientName: data.clientName || activeUserName,
      phoneNumber: data.phoneNumber || activePhoneNumber,
      billNo: data.billNo || activeBillNo,
    };

    if (payload.userType === "specificCustomer" && !payload.userId) {
      toast.push(
        <Notification title="Select customer" type="warning" duration={2500}>
          Please select a specific customer before receiving payment.
        </Notification>,
        { placement: "top-center" },
      );

      return null;
    }

    const response = await createSalesPayment<FormModel>(payload);
    return response.data;
  };

  const handleFormSubmit = async (
    values: FormModel,
    setSubmitting: SetSubmitting,
  ) => {
    setSubmitting(true);

    try {
      const success = await addPayment(values);

      if (success) {
        toast.push(
          <Notification title="Successfully added" type="success" duration={2500}>
            Payment received successfully
          </Notification>,
          { placement: "top-center" },
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDiscard = () => {
    navigate(-1);
  };

  const handleUserTypeChange = (nextUserType: CustomerType) => {
    setSelectedUserType(nextUserType);
    setSelectedCustomer(null);
    setCustomers([]);
    setCustomerSearchTerm("");
    setDebouncedCustomerSearch("");
  };

  const handleCustomerSelect = (customer: CustomerOption) => {
    setSelectedCustomer(customer);
    setCustomerSearchTerm(customer.clientName || "");
    setDebouncedCustomerSearch(customer.clientName || "");
  };

  return (
    <div className="space-y-4 px-4 sm:px-6 lg:px-8">
      {isDirectEntry && (
        <div className="rounded border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-slate-900">
              Receive Customer Payment
            </h3>
            <p className="text-sm text-slate-500">
              Select customer type, then choose client name from the form.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Customer Type
              </label>
              <select
                value={selectedUserType}
                onChange={(event) =>
                  handleUserTypeChange(event.target.value as CustomerType)
                }
                className="h-11 w-full rounded border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              >
                {userTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      <PaymentSalesForm
        type="new"
        userName={activeUserName}
        userId={activeUserId}
        userType={activeUserType}
        initialData={{
          clientName: activeUserName,
          userId: activeUserId,
          userType: activeUserType,
          phoneNumber: activePhoneNumber,
          billNo: activeBillNo,
          folio: "",
          date: new Date().toISOString().slice(0, 10),
          amount: 0,
          paymentMethod: "cash",
          description: "Payment received",
        }}
        customerOptions={isDirectEntry ? customers : []}
        customerLoading={customerLoading}
        lockClientName={!isDirectEntry && Boolean(activeUserName)}
        onCustomerSearch={setCustomerSearchTerm}
        onCustomerSelect={handleCustomerSelect}
        onCustomerClear={() => setSelectedCustomer(null)}
        onFormSubmit={handleFormSubmit}
        onDiscard={handleDiscard}
      />
    </div>
  );
};

export default CreateSalesPayment;
