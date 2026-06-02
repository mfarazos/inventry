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
    HiOutlineSearch,
    HiOutlinePencil,
    HiOutlineTrash,
    HiPlusCircle,
  } from "react-icons/hi";
  import { useCallback, useEffect, useMemo, useRef, useState } from "react";
  import { StoreItem } from "@/@types/store";
  import useListApi from "@/utils/hooks/useListApi";
  import {
    deleteCustomers,
    deleteGameMode,
    getwalkingCustomers,
    createCompanyCustomer
  } from "@/services/GameManagement";
  import CustomConfirmDialog from "@/components/shared/CustomConfirmDialog";
  import { storeItemTypesOptions } from "@/configs/dropdown.config";
  import { Avatar, Button, Dialog, Input } from "@/components/ui";
  import { FaLock, FaLockOpen, FaUnlockAlt } from "react-icons/fa";
  import Swal from "sweetalert2";
  import { handleHttpReq } from "@/utils/HandleHttp";
  
  function CustomerList() {
    // theme and navigation hook
    const { textTheme } = useThemeClass();
    const navigate = useNavigate();
    

   

  
    // api hook
    const listUrl = getwalkingCustomers();
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
    const [customerFilterType, setCustomerFilterType] = useState<"month" | "all">("all");

    useEffect(() => {
      if (customerFilterType === "all") {
        setFilter({
          product: productType,
          groupby_name: true,
        });
        return;
      }

      setFilter({
        product: productType,
        month: selectedMonth,
      });
    }, [customerFilterType, productType, selectedMonth])
  
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

    const onChangeCustomerFilter = (itemSelected: string) => {
      setCustomerFilterType(itemSelected === "all" ? "all" : "month");
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

    const handleNavigate = (path: string, state?: any) => {
      navigate(path, { state });
    };

    

    
  

    

    // action button cell
    const actionButtons = (props: CellContext<StoreItem, unknown>) => {
      const { phoneNumber, clientName } = props.row.original;
      //   const { isActive } = props.row.original;
  
      return (
        <div className="flex justify-end text-lg">
       
        
        
          

       <div className="flex flex-wrap items-center justify-end gap-2">
  
  <Button
    onClick={() => handleNavigate("/showbilling", { userType: "walkingCustomer", phoneNumber: phoneNumber, userName: clientName })}
    block
    variant="default"
    size="sm"
    icon={<HiPlusCircle />}
    className="!border-slate-300 !bg-slate-100 !text-slate-700 !shadow-none hover:!border-slate-400 hover:!bg-slate-200"
  >
    Billing
  </Button>
  
  <Button
    onClick={() => handleNavigate("/create-sales-payment", { userType: "walkingCustomer", phoneNumber: phoneNumber, userName: clientName })}
    block
    variant="default"
    size="sm"
    icon={<HiPlusCircle />}
    className="!border-emerald-200 !bg-emerald-50 !text-emerald-700 !shadow-none hover:!border-emerald-300 hover:!bg-emerald-100"
  >
    Receive Payment
  </Button>

  <Button
    onClick={() => handleNavigate("/sales-ledger", { userType: "walkingCustomer", phoneNumber: phoneNumber, userName: clientName })}
    block
    variant="default"
    size="sm"
    icon={<HiPlusCircle />}
    className="!border-blue-200 !bg-blue-50 !text-blue-700 !shadow-none hover:!border-blue-300 hover:!bg-blue-100"
  >
    Ledger
  </Button>
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
          <div className="mb-5 rounded border border-slate-200 bg-white px-4 py-4 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">
                  Walking Customers
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Search customers and open billing, payment, or ledger directly.
                </p>
              </div>

              <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:w-auto lg:grid-cols-[240px_170px_170px]">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Search
                  </label>
                  <Input
                    size="sm"
                    placeholder="Search client name"
                    prefix={<HiOutlineSearch className="text-lg" />}
                    onChange={onEditSearch}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    View
                  </label>
                  <select
                    value={customerFilterType}
                    onChange={(event) => onChangeCustomerFilter(event.target.value)}
                    className="h-9 w-full rounded border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  >
                    <option value="month">Month Wise</option>
                    <option value="all">All Users</option>
                  </select>
                </div>

                {customerFilterType === "month" && (
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Month
                    </label>
                    <input
                      type="month"
                      value={selectedMonth}
                      onChange={(event) => onChangeMonth(event.target.value)}
                      className="h-9 w-full rounded border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
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
  
