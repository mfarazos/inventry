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
  HiLockClosed,
  HiLockOpen,
  HiOutlinePencil,
  HiOutlineTrash,
} from "react-icons/hi";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StoreItem } from "@/@types/store";
import useListApi from "@/utils/hooks/useListApi";
import HeaderContent from "@/components/shared/HeaderContent";
import {
  deleteCustomers,
  deleteGameMode,
  getCustomerdetails,
  upadateByStatusCustomer
} from "@/services/GameManagement";
import CustomConfirmDialog from "@/components/shared/CustomConfirmDialog";
import { storeItemTypesOptions } from "@/configs/dropdown.config";
import { Avatar, Dialog } from "@/components/ui";
import { FaLock, FaLockOpen, FaUnlockAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import { handleHttpReq } from "@/utils/HandleHttp";

function CustomerList() {
  // theme and navigation hook
  const { textTheme } = useThemeClass();
  const navigate = useNavigate();
  const location = useLocation();
  const { userType, userId, userName , phoneNumber } = location.state || {};
  console.log(userType, userId, userName, phoneNumber);
  // api hook
  const listUrl = getCustomerdetails();
  const deleteUrl = deleteGameMode();
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
    handleDeleteClick,
    filter,
    setData,
    setFilter,
  } = useListApi<any>(listUrl, deleteUrl, 10);

  // table ref
  const tableRef = useRef<DataTableResetHandle>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedImg, setSelectedImg] = useState<string>({} as string);
  const [productType, setProductType] = useState("poleythene");
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

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
  }, [productType, selectedMonth,]);

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
  // on edit item
  const handleEditClick = useCallback(
    (id: string) => () => {
      console.log(`item selected`, id);
      navigate(`/editTournament/${id}`);
    },
    []
  );

  const approved =  useCallback(
    (status: boolean, id: string) => async () => {
      console.log(status);

      const abc = await Swal.fire({
        title: "Warning !",
        text: `are shure you want to Approved?`,
        icon: "warning",
        confirmButtonText: "yes",
      });
      if (abc.isConfirmed) {
        try {
          const updateStatus = await upadateByStatusCustomer(id);
          if(updateStatus){
            const isStatus = "approved";
          setData((prev) =>
            prev.map((user) =>
              user._id === id ? { ...user, status: isStatus } : user
            )
          );

          return isStatus;
          }
          
        } catch (error) {}
    
      }
      
    },[]);

 
  // set filter
  const onChangeDropDown = (itemSelected: string) => {
    console.log("faraz1", itemSelected)
    setProductType(itemSelected);
  };

  // set filter
  const onChangeMonth = (itemSelected: string) => {
    console.log("faraz1", itemSelected)
    setSelectedMonth(itemSelected);
  };

  const onDelete = useCallback(
    (id: string) => async () => {
      // console.log(`item selected`, id);
      // navigate(`/editGameMode/${id}`);
      const abc = await Swal.fire({
        title: "Warning !",
        text: `are shure you want to delete?`,
        icon: "warning",
        confirmButtonText: "yes",
      });
      if (abc.isConfirmed) {
        try {
          const result = await deleteCustomers(id);
          
        setData((prev) => prev.filter((user) => user._id !== id));
        } catch (error) {
          
        }
        
      }

      // console.log("SELECTED ITEM DELETE", result);
      // setData(result.data?.data);
    },
    []
  );

 

 

  // action button cell
  const actionButtons = (props: CellContext<StoreItem, unknown>) => {
    const { _id, status } = props.row.original;
    //   const { isActive } = props.row.original;

    return (
      <div className="flex justify-end text-lg">
        {status == "pending" && (<span
            className={`cursor-pointer p-2 hover:${textTheme}`}
            onClick={approved(status, _id)}
          >
            <HiEye />
          </span>)}
        <span
          className={`cursor-pointer p-2 hover:${textTheme}`}
          onClick={handleEditClick(_id)}
        >
          <HiOutlinePencil />
        </span>
        <span
          className="cursor-pointer p-2 hover:text-red-500"
          onClick={onDelete(_id)}
        >
          <HiOutlineTrash />
        </span>
        {/* <span
            className="cursor-pointer p-2 hover:text-red-500"
            onClick={handleDeleteClick(_id)}
          >
            <HiOutlineTrash />
          </span> */}
        {/* <span
            className="cursor-pointer p-2 hover:text-red-500"
            onClick={handleBan(_id, isActive)}
          >
            {isActive ? <HiLockOpen /> : <HiLockClosed />}
          </span> */}
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
          return <span>{new Date(dateOne).toLocaleDateString()}</span>; // Extracts "YYYY-MM-DD"
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
        header: "Rate",
        accessorKey: "rate",
      },


      {
        header: "Amount",
        accessorKey: "amount",
      },

      
   
      
     

     
      
      

    ],
    []
  );

  // main view
  return (
    <>
      <AdaptableCard className="h-full" bodyClass="h-full">
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
        <HeaderContent
          text={userName? userName + " " + "Billing" : "Sales"}
          //addButtonText="Add Customer Data"
         // addLink="/createtournament"
          state = {{userType: userType || "walkingCustomer", userId: userId || null, userName: userName || null, phoneNumber: phoneNumber || ""}}
        //  onChangeDropDown={onChangeDropDown}
        //  showSearch={true}
        //  weightData={weightData}
          billData={billData}
          onChangeMonth={onChangeMonth}
          selectedMonth={selectedMonth}
          isMonthPicket={true}
        //  dropDownSelectedValue={productType}
        //  dropDownOptions={[{value: "poleythene", label: "Poleythene"},{value: "hydensity", label: "Hydensity"}]}
         // onEditSearch={onEditSearch}
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
