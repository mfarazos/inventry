import {
  AdaptableCard,
  CellContext,
  ColumnDef,
  DataTable,
  DataTableResetHandle,
} from "@/components/shared";
import useThemeClass from "@/utils/hooks/useThemeClass";
import { useLocation, useNavigate } from "react-router-dom";
import {
  HiEye,
  HiOutlinePencil,
  HiOutlineTrash,
} from "react-icons/hi";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StoreItem } from "@/@types/store"; // Adjust path if necessary
import useListApi from "@/utils/hooks/useListApi";
import HeaderContent from "@/components/shared/HeaderContent";
import {
  deleteCustomers,
  deleteGameMode,
  getCustomerdetails,
  upadateByStatusCustomer,
  // Add your new update API service here
  // For example:
   editCustomerBilling // <-- Naya import: Ye aapko GameManagement.ts mein banani hogi
} from "@/services/GameManagement";
import CustomConfirmDialog from "@/components/shared/CustomConfirmDialog";
import { Dialog } from "@/components/ui"; // Dialog component for modal
import Swal from "sweetalert2";
// import { handleHttpReq } from "@/utils/HandleHttp"; // Not used in provided snippet

// Naya component import karein
import EditBillingForm from './editbilling/EditBillingForm'; // <-- Path adjust karein jahan aap EditBillingForm.tsx rakhenge

function CustomerList() {
  // theme and navigation hook
  const { textTheme } = useThemeClass();
  const navigate = useNavigate();
  const location = useLocation();
  const { userType, userId, userName, phoneNumber } = location.state || {};
  console.log(userType, userId, userName, phoneNumber);

  // API hook
  const listUrl = getCustomerdetails();
  const deleteUrl = deleteGameMode(); // Not directly used for item deletion in this component, but passed to useListApi
  const {
    pageIndex,
    pageSize,
    total,
    data,
    weightData,
    billData,
    showDeleteDialog,
    loading,
    onPaginationChange,
    onPageSizeChange,
    onSort,
    onEditSearch,
    onDeleteDialogClose,
    onDeleteConfirm,
    handleDeleteClick, // This is from useListApi, we will use our own onDelete for more control
    filter,
    setData, // <-- Important: Ye data ko update karne ke liye use hoga
    setFilter,
  } = useListApi<any>(listUrl, deleteUrl, 10);

  // table ref
  const tableRef = useRef<DataTableResetHandle>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedImg, setSelectedImg] = useState<string>({} as string);
  const [productType, setProductType] = useState("poleythene");
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  // --- NAYI STATES FOR EDIT MODAL ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentEditingItem, setCurrentEditingItem] = useState<any | null>(null);
  // --- NAYI STATES END ---


  useEffect(() => {
    if (userId && userType) {
      setFilter({
        product: productType,
        month: selectedMonth,
        userId: userId,
        userType: userType
      });
    } else {
      setFilter({
        product: productType,
        month: selectedMonth,
        userType: 'walkingCustomer',
        phoneNumber: phoneNumber
      });
    }
  }, [productType, selectedMonth, userId, userType, phoneNumber,]); // Dependencies add kiye

  const onViewOpen = (img: string) => {
    setSelectedImg(img);
    setViewOpen(true);
  };
  const onDialogClose = () => {
    setViewOpen(false);
    setTimeout(() => {
      setSelectedImg({} as string);
    }, 300);
  };

  // --- handleEditClick FUNCTION MEIN CHANGE ---
  const handleEditClick = useCallback(
    (item: any) => () => { // Ab poora item receive karega
      console.log(`item selected for edit`, item);
      setCurrentEditingItem(item); // Current item ko store kiya
      setIsEditModalOpen(true); // Modal ko open kiya
    },
    []
  );
  // --- handleEditClick FUNCTION END ---

  const approved = useCallback(
    (status: boolean, id: string) => async () => {
      console.log(status);

      const abc = await Swal.fire({
        title: "Warning !",
        text: `Are you sure you want to Approved?`,
        icon: "warning",
        confirmButtonText: "Yes",
      });
      if (abc.isConfirmed) {
        try {
          const updateStatus = await upadateByStatusCustomer(id);
          if (updateStatus) {
            const isStatus = "approved";
            setData((prev) =>
              prev.map((user) =>
                user._id === id ? { ...user, status: isStatus } : user
              )
            );
            Swal.fire("Approved!", "The entry has been approved.", "success");
            return isStatus;
          }

        } catch (error) {
          console.error("Error approving item:", error);
          Swal.fire("Error!", "An error occurred during approval.", "error");
        }

      }

    }, []);


  // set filter for dropdown (product type)
  const onChangeDropDown = (itemSelected: string) => {
    console.log("faraz1", itemSelected)
    setProductType(itemSelected);
  };

  // set filter for month
  const onChangeMonth = (itemSelected: string) => {
    console.log("faraz1", itemSelected)
    setSelectedMonth(itemSelected);
  };

  const onDelete = useCallback(
    (id: string) => async () => {
      const abc = await Swal.fire({
        title: "Warning !",
        text: `Are you sure you want to delete?`,
        icon: "warning",
        confirmButtonText: "Yes",
      });
      if (abc.isConfirmed) {
        try {
          // Assuming deleteCustomers returns a success indicator or throws error
          await deleteCustomers(id); // API call to delete
          setData((prev) => prev.filter((user) => user._id !== id)); // UI se item remove kiya
          Swal.fire("Deleted!", "The entry has been deleted.", "success");
        } catch (error) {
          console.error("Error deleting item:", error);
          Swal.fire("Error!", "An error occurred during deletion.", "error");
        }
      }
    },
    []
  );

  // --- NAYA FUNCTION: JAB MODAL SE DATA SAVE HOGA ---
  const handleSaveEditedItem = async (updatedItem: any) => {
  try {
    const response = await editCustomerBilling(updatedItem);
    
     const responseData = response.data as { message?: string, success?: boolean }; // <-- Yahan change kiya

    if (response.status === 200 || responseData.success) { // Ab responseData use karein
      setData((prevData: any[]) =>
        prevData.map((item) =>
          item._id === updatedItem._id ? updatedItem : item
        )
      );
      setIsEditModalOpen(false);
      Swal.fire("Success!", "Entry updated successfully.", "success");
    } else {
      Swal.fire("Error!", responseData.message || "Failed to update entry.", "error"); // Ab responseData use karein
    }
  } catch (error) {
    console.error("Error updating item:", error);
    Swal.fire("Error!", "An error occurred while updating.", "error");
  }
};
  // --- NAYA FUNCTION END ---


  // action button cell (Change `onClick` for pencil icon)
  const actionButtons = (props: CellContext<StoreItem, unknown>) => {
    const { _id, status } = props.row.original;

    return (
      <div className="flex justify-end text-lg">
        {status === "pending" && (
          <span
            className={`cursor-pointer p-2 hover:${textTheme}`}
            onClick={approved(status === "pending", _id)} // status prop is boolean here
          >
            <HiEye />
          </span>
        )}
        <span
          className={`cursor-pointer p-2 hover:${textTheme}`}
          onClick={handleEditClick(props.row.original)} // <-- YAHAN CHANGE HUA HAI: Ab poora item bhej rahe hain
        >
          <HiOutlinePencil />
        </span>
        <span
          className="cursor-pointer p-2 hover:text-red-500"
          onClick={onDelete(_id)}
        >
          <HiOutlineTrash />
        </span>
      </div>
    );
  };

  // columns
  const columns: ColumnDef<StoreItem>[] = useMemo(
    () => [
      {
        header: "Date",
        accessorKey: "date",
        cell: (props) => {
          const { date } = props.row.original;
          let dateOne = new Date(date).toISOString().slice(0, 10)
          return <span>{new Date(dateOne).toLocaleDateString()}</span>;
        },
      },
      {
        header: "quality",
        accessorKey: "quality",
      },
      {
        header: "DC Number",
        accessorKey: "dcNumber",
      },
      {
        header: "Total Weight",
        accessorKey: "grossWeight",
      },
      {
        header: "Rate",
        accessorKey: "rate",
      },
      {
        header: "Amount",
        accessorKey: "amount",
      },
      {
        header: "Action",
        id: "action",
        cell: (props) => {
          // const row = props.row.original; // Not needed directly here
          return (
            <div style={{ padding: "8px", borderRadius: "8px" }}>
              {actionButtons(props)}
            </div>
          );
        },
      },
    ],
    [actionButtons] // actionButtons ko dependency array mein add kiya
  );


  // Determine if weightData should be passed
  const shouldShowWeightData = userType && userId && userType !== 'walkingCustomer';

  // main view
  return (
    <>
      <AdaptableCard className="h-full" bodyClass="h-full">
        {/* EXISTING IMAGE VIEW DIALOG - ISKO NAHI CHHERNA */}
        <Dialog
          isOpen={viewOpen}
          onClose={onDialogClose}
          onRequestClose={onDialogClose}
        >
          <img
            className="h-96 w-96 block mx-auto"
            src={selectedImg}
            alt={"abc"}
          />
        </Dialog>

        {/* --- NAYA EDIT MODAL DIALOG --- */}
        <Dialog
          isOpen={isEditModalOpen} // isEditModalOpen state se control hoga
          onClose={() => setIsEditModalOpen(false)} // Cross button ya bahar click karne par band hoga
          onRequestClose={() => setIsEditModalOpen(false)}
           // Modal ka title
        >
          {/* Jab currentEditingItem mein data hoga, tabhi EditBillingForm dikhayenge */}
          {currentEditingItem && (
            <EditBillingForm
              item={currentEditingItem} // Woh item jisko edit karna hai
               onSave={handleSaveEditedItem} // Jab form save hoga to ye function call hoga
              onCancel={() => setIsEditModalOpen(false)} // Jab form cancel hoga to modal band hoga
            />
          )}
        </Dialog>
        {/* --- NAYA EDIT MODAL DIALOG END --- */}

        <HeaderContent
          text={userName ? userName + " " + "Billing" : "Sales"}
          state={{ userType: userType || "walkingCustomer", userId: userId || null, userName: userName || null, phoneNumber: phoneNumber || "" }}
          {...(shouldShowWeightData && { weightData })}
          billData={billData}
          onChangeMonth={onChangeMonth}
          selectedMonth={selectedMonth}
          isMonthPicket={true}
        />
        <DataTable
          ref={tableRef}
          columns={columns}
          data={data}
          loading={loading}
          pagingData={{
            total: total,
            pageIndex: pageIndex,
            pageSize: pageSize,
          }}
          onPaginationChange={onPaginationChange}
          onSelectChange={onPageSizeChange}
          onSort={onSort}
        />
      </AdaptableCard>
      <CustomConfirmDialog
        title="Store Item"
        isOpen={showDeleteDialog}
        onDialogClose={onDeleteDialogClose}
        onDeleteConfirm={onDeleteConfirm}
      />
    </>
  );
}

export default CustomerList;
