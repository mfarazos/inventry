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
    deleteMaterial,
    deleteGameMode,
    deleteCustomers,
    getGameModes,
    upadateByStatusMaterial,
    upadateByStatusCustomer
  } from "@/services/GameManagement";
  import CustomConfirmDialog from "@/components/shared/CustomConfirmDialog";
  import { storeItemTypesOptions } from "@/configs/dropdown.config";
  import { Avatar, Dialog } from "@/components/ui";
  import { FaLock, FaLockOpen, FaUnlockAlt } from "react-icons/fa";
  import Swal from "sweetalert2";
  import { handleHttpReq } from "@/utils/HandleHttp";
  
  function Companypurchaselist() {
    // theme and navigation hook
    const { textTheme } = useThemeClass();
    const navigate = useNavigate();

    const location = useLocation();
    const { userType, userId, userName } = location.state || {};
    console.log(userType, userId, userName);
  
    // api hook
    const listUrl = getGameModes();
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
    } = useListApi<any>(listUrl, deleteUrl, 50);
  
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
          userType: 'walkingCustomer'
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
      (id: string, type: string) => () => {
        console.log(`item selected`, id);
    
        if (type === 'sale') {
          navigate(`/editTournament/${id}`);
        } else if (type === 'purchase') {
          navigate(`/editGameMode/${id}`);
        }
      },
      []
    );
  
   
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
         (id: string, type: string) => async () => {
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
              if (type === "sale") {
                
                const result = await deleteCustomers(id);
                
              } else if (type === "purchase") {
                
                const result = await deleteMaterial(id);
               
              }
             
               
             setData((prev) => prev.filter((user) => user._id !== id));
             } catch (error) {
               
             }
             
           }
     
           // console.log("SELECTED ITEM DELETE", result);
           // setData(result.data?.data);
         },
         []
       );
   
    

       const approved = useCallback(
        (status: boolean, id: string, type: string) => async () => {
          console.log(status);
      
          const abc = await Swal.fire({
            title: "Warning!",
            text: "Are you sure you want to approve?",
            icon: "warning",
            confirmButtonText: "Yes",
          });
      
          if (abc.isConfirmed) {
            try {
              let updateStatusResponse;
      
           
              if (type === "sale") {
                updateStatusResponse = await upadateByStatusCustomer(id); 
              } else if (type === "purchase") {
                updateStatusResponse = await upadateByStatusMaterial(id);  
              }
             
              if (updateStatusResponse) {
                const newStatus = "approved";  
                setData((prev) =>
                  prev.map((user) =>
                    user._id === id ? { ...user, status: newStatus } : user
                  )
                );
      
                return newStatus;
              }
      
            } catch (error) {
              console.error("Error updating status:", error);
            }
          }
        },
        []
      );
      
     
    // action button cell
    const actionButtons = (props: CellContext<StoreItem, unknown>) => {
      const { _id, status, type } = props.row.original;
      //   const { isActive } = props.row.original;
  
      return (
        <div className="flex justify-end text-lg">
          {status == "pending" && (<span
              className={`cursor-pointer p-2 hover:${textTheme}`}
              onClick={approved(status, _id, type)}
            >
              <HiEye />
            </span>)}
          <span
            className={`cursor-pointer p-2 hover:${textTheme}`}
            onClick={handleEditClick(_id, type)}
          >
            <HiOutlinePencil />
          </span>

    
          <span
            className="cursor-pointer p-2 hover:text-red-500"
            onClick={onDelete(_id, type, )}
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
      cell: (props) => {
        const { date } = props.row.original;
        let dateObj = new Date(date);

        let day = String(dateObj.getDate()).padStart(2, '0');
        let month = String(dateObj.getMonth() + 1).padStart(2, '0');
        let year = dateObj.getFullYear();

        return (
          <span style={{ whiteSpace: "nowrap" }}>
            {`${day}-${month}-${year}`}
          </span>
        );
      },
    },

    {
      header: "Total Bags",
      cell: (props) => {
        const { totalBags, type } = props.row.original;
        return type === "purchase" ? <span>{totalBags} bags</span> : <span>-</span>;
      },
    },

    {
      header: "Total Weight",
      cell: (props) => {
        const { grossWeight, type } = props.row.original;
        return type === "purchase" ? <span>{grossWeight} kg</span> : <span>-</span>;
        
      },
    },

    //
    ...(userName ? [
      {
        header: "tafree",
        accessorKey: "clientName",
        cell: (props) => {
          const { clientName, type } = props.row.original;
          return type === "sale" ? <span>{clientName}</span> : <span>-</span>;
        },
      },
    ] : []),
    //
    // === Purchase Side Columns ===
    {
      header: "Received From",
      cell: (props) => {
        const { receivedFrom, type } = props.row.original;
        return type === "purchase" ? <span>{receivedFrom}</span> : <span>-</span>;
      },
    },
    {
      header: "Quality",
      cell: (props) => {
        const { quality, type } = props.row.original;
        return type === "purchase" ? <span>{quality}</span> : <span>-</span>;
      },
    },
    {
      header: "Voucher Number",
      cell: (props) => {
        const { billNo, type } = props.row.original;
        return type === "purchase" ? <span>{billNo}</span> : <span>-</span>;
      },
    },

    // === Sale Side Columns ===


   
     {  
      header: "Client Name",
      cell: (props) => {
        const { clientName, type } = props.row.original;
        return type === "sale" ? <span>{clientName}</span> : <span>-</span>;
      },
    },


    {
      header: "Quality",
      cell: (props) => {
        const { quality, type } = props.row.original;
        return type === "sale" ? <span>{quality}</span> : <span>-</span>;
      },
    },
    {
      header: "DC Number",
      cell: (props) => {
        const { dcNumber, type } = props.row.original;
        return type === "sale" ? <span>{dcNumber}</span> : <span>-</span>;
      },
    },
    {
      header: "Ratio",
      cell: (props) => {
        const { ratio, type } = props.row.original;
        return type === "sale" ? <span>{ratio}</span> : <span>-</span>;
      },
    },
    {
      header: "Gross Weight",
      cell: (props) => {
        const { grossWeight, type } = props.row.original;
        return type === "sale" ? <span>{grossWeight} kg</span> : <span>-</span>;
      },
    },
    {
      header: "Rate",
      cell: (props) => {
        const { rate, type } = props.row.original;
        return type === "sale" ? <span>{rate}</span> : <span>-</span>;
      },
    },
    {
      header: "Amount",
      cell: (props) => {
        const { amount, type } = props.row.original;
        return type === "sale" ? <span>{amount}</span> : <span>-</span>;
      },
    },
    {
      header: "Bill Number",
      cell: (props) => {
        const { billNo, type } = props.row.original;
        return type === "sale" ? <span>{billNo}</span> : <span>-</span>;
      },
    },

    // === Status Column ===
    {
      header: "Status",
      cell: (props) => {
        const { status } = props.row.original;
        const isPending = status?.toLowerCase() === "pending";

        return (
          <span
            style={{
              display: "inline-block",
              padding: "4px 8px",
              borderRadius: "12px",
              color: "white",
              backgroundColor: isPending ? "red" : "green",
              fontSize: "12px",
            }}
          >
            {status}
          </span>
        );
      },
    },

    // === Action Column ===
    {
      header: "Action",
      id: "action",
      cell: (props) => {
        const row = props.row.original;
        const bgColor = row.type === "purchase" ? "#e0f7fa" : "#e8f5e9"; // Light blue vs light green
        return (
          <div style={{ backgroundColor: bgColor, padding: "8px", borderRadius: "8px" }}>
            {actionButtons(props)}
          </div>
        );
      },
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
            text= {userName? userName + " " + "Account" : "Company Accounts"}
            addButtonText1="Add Dana Receipt"
            addLink1="/creategamemodes"
            addButtonText2="Add Customer Receipt"
            addLink2= "/createtournament"
            state = {{userType: userType || "walkingCustomer", userId: userId || null, userName: userName || null}}
            onChangeDropDown={onChangeDropDown}
            onChangeMonth={onChangeMonth}
            selectedMonth={selectedMonth}
            weightData={weightData}
            showSearch={true}
            dropDownSelectedValue={productType}
            dropDownOptions={[{value: "poleythene", label: "Poleythene"},{value: "hydensity", label: "Hydensity"}]}
            isMonthPicket={true}
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
      </>
    );
  }
  
  export default Companypurchaselist
