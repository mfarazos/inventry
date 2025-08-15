import {
    AdaptableCard,
    CellContext,
    ColumnDef,
    DataTable,
    DataTableResetHandle,
  } from "@/components/shared";
  import useThemeClass from "@/utils/hooks/useThemeClass";
  import { useNavigate } from "react-router-dom";
  import {
    HiEye,
    HiLockClosed,
    HiLockOpen,
    HiOutlinePencil,
    HiOutlineTrash,
    HiPlusCircle,
  } from "react-icons/hi";
  import Confirmations from "../component/Confirmations"
  import { useCallback, useEffect, useMemo, useRef, useState } from "react";
  import { StoreItem } from "@/@types/store";
  import useListApi from "@/utils/hooks/useListApi";
  import HeaderContent from "@/components/shared/HeaderContent";
  import {
    deleteCategoryCustomer,
    deleteGameMode,
    getCategorycustomers,
    createCompanyCustomer,
    getCategoryCustomerById,
    editCategoryCustomer
  } from "@/services/GameManagement";
  import CustomConfirmDialog from "@/components/shared/CustomConfirmDialog";
  import { storeItemTypesOptions } from "@/configs/dropdown.config";
  import { Avatar, Button, Dialog } from "@/components/ui";
  import { FaLock, FaLockOpen, FaUnlockAlt } from "react-icons/fa";
  import Swal from "sweetalert2";
  import { handleHttpReq } from "@/utils/HandleHttp";
  
  function CustomerList() {
    // theme and navigation hook
    const { textTheme } = useThemeClass();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null); // Track editing state
    const [customerName, setCustomerName] = useState<string>("");




   

  
    // api hook
    const listUrl = getCategorycustomers();
    const deleteUrl = deleteGameMode();
    const {
      pageIndex,
      pageSize,
      total,
      data,
      weightData,
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
      setFilter({product: productType, month: selectedMonth })
    },[productType, selectedMonth])
  
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
            const result = await deleteCategoryCustomer(id);
            
          setData((prev) => prev.filter((user) => user._id !== id));
          } catch (error) {
            
          }
          
        }
  
        // console.log("SELECTED ITEM DELETE", result);
        // setData(result.data?.data);
      },
      []
    );

    const handleNavigate = (path: string, state?: any) => {
      navigate(path, { state });
    };

     const handleCloseModal = () => {
    setIsOpen(false);
    setEditingCustomerId(null); // Reset the editing state on modal close
    setCustomerName(""); // Clear the input field
  };
   
  const handleOpenModal = async (id: string) => {
    setIsOpen(true);
    setEditingCustomerId(id); // Set customer ID for editing

    // Fetch the customer details by ID
    try {
      const response = await getCategoryCustomerById(id);
      setCustomerName(response.data.clientName); // Pre-fill the customer name in the modal
    } catch (error) {
      console.error("Error fetching customer:", error);
    }
  };


  const handleCreateOrEditCustomer = async (name: string) => {
    try {
      if (editingCustomerId) {
        // If editing an existing customer, call the edit API
        await editCategoryCustomer({ id: editingCustomerId, clientName: name });
      } else {
        // If creating a new customer, call the create API
        await createCompanyCustomer({ clientName: name, type: "specificCustomer" });
      }
      setIsOpen(false);
      setCustomerName("");
      setEditingCustomerId(null);
    } catch (error) {
      // Handle error (could be a toast notification or alert)
      console.error("Error:", error);
    }
  };
  

    // const handleOpenModal = () => {
    //   setIsOpen(true);
    // };

    // action button cell
    const actionButtons = (props: CellContext<StoreItem, unknown>) => {
      const { _id, clientName } = props.row.original;
      //   const { isActive } = props.row.original;
  
      return (
        <div className="flex flex-col items-end text-lg">
          {/* Action Icons */}
          <div className="flex gap-2">
            {status === "pending" && (
              <span
                className={`cursor-pointer p-2 hover:${textTheme}`}
                onClick={() => approved(status, _id)}
              >
                <HiEye />
              </span>
            )}
             <span 
        className="cursor-pointer p-2 hover:text-blue-500"
        onClick={() => handleOpenModal(_id)} // Open modal with current name for editing
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
    
          {/* Buttons (Aligned and Styled) */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "15px",
              marginTop: "10px",
            }}
          >
            {[
              { label: "Inventory", path: "/inventrylist" },
              { label: "Billing", path: "/showbilling" },
            ].map(({ label, path }) => (
              <Button
                key={label}
                onClick={() =>
                  handleNavigate(path, {
                    userType: "specificCustomer",
                    userId: _id,
                    userName: clientName,
                  })
                }
                block
                variant="solid"
                size="sm"
                icon={<HiPlusCircle />}
                style={{
                  backgroundColor: "#6a5acd",
                  color: "white",
                  padding: "8px 20px",
                  borderRadius: "6px",
                  fontSize: "14px",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor = "#483d8b")
                }
                onMouseLeave={(e) =>
                  (e.target.style.backgroundColor = "#6a5acd")
                }
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
      );
    };
  
    // columns
    const columns: ColumnDef<StoreItem>[] = useMemo(
      () => [
       
        {
          header: "Client Name",
          accessorKey: "clientName",
        },

        
        {
          header: "",
          id: "action",
          cell: actionButtons,
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
            text="Extruding Customers"
             addButtonText1="CREATE USER"
             isModal={true}
             onDialogOpen={() => handleOpenModal("")}
            // addLink="/createtournament"
            //  onChangeDropDown={onChangeDropDown}
             showSearch={true}
            //weightData={weightData}
            // onChangeMonth={onChangeMonth}
            // selectedMonth={selectedMonth}
            // isMonthPicket={true}
            // dropDownSelectedValue={productType}
            // dropDownOptions={[{value: "poleythene", label: "Poleythene"},{value: "hydensity", label: "Hydensity"}]}
             onEditSearch={onEditSearch}
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

<Confirmations
        isOpen={isOpen}
        onDialogClose={handleCloseModal}
        createCustomer={handleCreateOrEditCustomer}
        customerName={customerName} // Pass customer name to Confirmations component
      />


      </>
    );
  }
  
  export default CustomerList;
  