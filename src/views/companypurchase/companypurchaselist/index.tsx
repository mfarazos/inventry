import {
    AdaptableCard,
    CellContext,
    ColumnDef,
    DataTable,
    DataTableResetHandle,
  } from "@/components/shared";
  import useThemeClass from "@/utils/hooks/useThemeClass";
  import { useLocation, useNavigate } from "react-router-dom";
  import { useSearchParams } from "react-router-dom";
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
  import html2pdf from "html2pdf.js/dist/html2pdf.bundle.min.js";
  import ApiService from "@/services/ApiService";
  
  function Companypurchaselist() {
    // theme and navigation hook
    const { textTheme } = useThemeClass();
    const navigate = useNavigate();

    const location = useLocation();
    const { userType, userId, userName  } = location.state || {};
     let [searchParams] = useSearchParams();
  const productMaterialType     = searchParams.get("productMaterialType");
  const selectedMonthByParams   = searchParams.get("selectedMonthByParams");

  console.log("eeeeeeeeeeeeeeeeeeeee",productMaterialType, selectedMonthByParams);
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
    const [productType, setProductType] = useState(productMaterialType || "poleythene");
    const [selectedMonth, setSelectedMonth] = useState(selectedMonthByParams ? new Date(selectedMonthByParams).toISOString().slice(0, 7) : new Date().toISOString().slice(0, 7));
    const [downloadingPdf, setDownloadingPdf] = useState(false);

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
  
    const handleDownloadSummaryPdf = async () => {
  let element: HTMLDivElement | null = null

  try {
    setDownloadingPdf(true)

    const filterParams = {
      product: productType,
      month: selectedMonth,
      ...(userId && userType ? { userId, userType } : { userType: 'walkingCustomer' }),
    }

    const firstResult = await ApiService.fetchData<any>({
      url: getGameModes(),
      method: 'get',
      params: {
        page: 1,
        limit: pageSize || 50,
        ...filterParams,
      },
    })

    const totalRecords =
      firstResult?.data?.data?.total ||
      firstResult?.data?.total ||
      firstResult?.data?.data?.count ||
      firstResult?.data?.count ||
      10000

    const result = await ApiService.fetchData<any>({
      url: getGameModes(),
      method: 'get',
      params: {
        page: 1,
        limit: totalRecords,
        pageSize: totalRecords,
        ...filterParams,
      },
    })

    const responseData = result?.data?.data || {}
    const allRecords = responseData?.data || []
    const pdfWeightData = responseData?.weight || {}

    const accountName = userName ? `${userName} Account` : 'Company Accounts'

    const monthDate = new Date(`${selectedMonth}-01`)
    const monthYearString = monthDate.toLocaleDateString('en-GB', {
      month: 'long',
      year: 'numeric',
    })

    const safeAccountName = accountName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    const monthString = monthDate
      .toLocaleDateString('en-GB', { month: 'short' })
      .toLowerCase()

    const filename = `${safeAccountName}-summary-${monthString}-${monthDate.getFullYear()}.pdf`

    const num = (value: any) => Number(value || 0)

    const formatDate = (dateStr: string) => {
      if (!dateStr) return '-'
      const date = new Date(dateStr)
      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const year = date.getFullYear()
      return `${day}-${month}-${year}`
    }

    const totalBags = allRecords
      .filter((record: any) => record.type === 'purchase')
      .reduce((sum: number, record: any) => sum + num(record.totalBags), 0)

    const openingPure = num(pdfWeightData?.openingBalanceWeightPure)
    const openingMixing = num(pdfWeightData?.openingBalanceWeightMixing)
    const receivedPure = num(pdfWeightData?.purchaseWeightPure)
    const receivedMixing = num(pdfWeightData?.purchaseWeightMixing)
    const receivedOpeningPure = num(pdfWeightData?.totalPurchaseWeightPure)
    const receivedOpeningMixing = num(pdfWeightData?.totalPurchaseWeightMixing)
    const consumptionPure = num(pdfWeightData?.saleWeightPure)
    const consumptionMixing = num(pdfWeightData?.saleWeightMixing)
    const closingPure = num(pdfWeightData?.closingWeightPure)
    const closingMixing = num(pdfWeightData?.closingWeightMixing)

    const recordsRows = allRecords.map((record: any) => `
      <tr class="${record.type === 'purchase' ? 'purchase-row' : 'sale-row'}">
        <td>${formatDate(record.date)}</td>
        <td>${record.type === 'purchase' ? `${record.totalBags || '-'} bags` : '-'}</td>
        <td>${record.type === 'purchase' ? `${record.grossWeight || '-'} kg` : '-'}</td>
        <td>${record.type === 'purchase' ? record.receivedFrom || '-' : '-'}</td>
        <td>${record.type === 'purchase' ? record.quality || '-' : '-'}</td>
        <td>${record.type === 'purchase' ? record.billNo || '-' : '-'}</td>
        <td>${record.type === 'sale' ? record.clientName || '-' : '-'}</td>
        <td>${record.type === 'sale' ? record.quality || '-' : '-'}</td>
        <td>${record.type === 'sale' ? record.dcNumber || '-' : '-'}</td>
        <td>${record.type === 'sale' ? record.ratio || '-' : '-'}</td>
        <td>${record.type === 'sale' ? `${record.grossWeight || '-'} kg` : '-'}</td>
        <td>${record.type === 'sale' ? record.billNo || '-' : '-'}</td>
      </tr>
    `).join('')

    const htmlContent = `
      <div class="pdf-wrapper">
        <div class="top-header">
          <div>
            <h1>Production summary</h1>
          </div>
          <div class="date-text">
            Date: ${monthYearString}
          </div>
        </div>

        <table class="records-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Total Bags</th>
              <th>Total Weight</th>
              <th>Received From</th>
              <th>Quality</th>
              <th>Voucher Number</th>
              <th>Client Name</th>
              <th>Quality</th>
              <th>DC Number</th>
              <th>Ratio</th>
              <th>Gross Weight</th>
              <th>Bill Number</th>
            </tr>
          </thead>
          <tbody>
            ${recordsRows}
          </tbody>
        </table>

        <h2 class="summary-title">Summary</h2>

        <table class="summary-table">
          <thead>
            <tr>
              <th>stock purchase</th>
              <th>Pure</th>
              <th>Mixing</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Opening balance</td>
              <td>${openingPure.toFixed(2)}</td>
              <td>${openingMixing.toFixed(2)}</td>
              <td>${(openingPure + openingMixing).toFixed(2)}</td>
            </tr>
            <tr>
              <td>Total dana received by party</td>
              <td>${receivedPure.toFixed(2)}</td>
              <td>${receivedMixing.toFixed(2)}</td>
              <td>${(receivedPure + receivedMixing).toFixed(2)}</td>
            </tr>
            <tr>
              <td>Total dana received + opening balance</td>
              <td>${receivedOpeningPure.toFixed(2)}</td>
              <td>${receivedOpeningMixing.toFixed(2)}</td>
              <td>${(receivedOpeningPure + receivedOpeningMixing).toFixed(2)}</td>
            </tr>
            <tr>
              <td>Total dana consumption</td>
              <td>${consumptionPure.toFixed(2)}</td>
              <td>${consumptionMixing.toFixed(2)}</td>
              <td>${(consumptionPure + consumptionMixing).toFixed(2)}</td>
            </tr>
            <tr>
              <td>Closing Balance</td>
              <td>${closingPure.toFixed(2)}</td>
              <td>${closingMixing.toFixed(2)}</td>
              <td>${(closingPure + closingMixing).toFixed(2)}</td>
            </tr>
            <tr>
              <td>Bags</td>
              <td>-</td>
              <td>-</td>
              <td>${totalBags}</td>
            </tr>
          </tbody>
        </table>
      </div>
    `

    element = document.createElement('div')
    element.innerHTML = htmlContent

    const style = document.createElement('style')
    style.innerHTML = `
      .pdf-wrapper {
        padding: 25px 30px;
        font-family: Arial, Helvetica, sans-serif;
        color: #222;
        background: #fff;
      }

      .top-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 30px;
      }

      .top-header h1 {
        font-size: 24px;
        margin: 0;
        font-weight: 700;
      }

      .date-text {
        font-size: 22px;
        font-weight: 700;
        white-space: nowrap;
      }

      table {
        width: 100%;
        border-collapse: collapse;
      }

      .records-table {
        font-size: 8px;
        margin-bottom: 28px;
        table-layout: fixed;
      }

      .records-table th,
      .records-table td {
        border: 1px solid #d8d8d8;
        padding: 6px 4px;
        text-align: center;
        word-break: break-word;
      }

      .records-table th {
        background: #eeeeee;
        font-weight: 700;
        text-transform: uppercase;
      }

      .purchase-row {
        background: #eaf8ff;
      }

      .sale-row {
        background: #eaffea;
      }

      .summary-title {
        text-align: center;
        font-size: 24px;
        font-weight: 700;
        margin: 20px 0;
      }

      .summary-table {
        font-size: 13px;
        table-layout: fixed;
      }

      .summary-table th,
      .summary-table td {
        border: 1px solid #d8d8d8;
        padding: 10px;
      }

      .summary-table th {
        background: #eeeeee;
        font-weight: 700;
        text-align: center;
      }

      .summary-table td:first-child {
        text-align: left;
        width: 55%;
      }

      .summary-table td:not(:first-child) {
        text-align: right;
      }
    `

    element.prepend(style)
    document.body.appendChild(element)

    await html2pdf()
      .from(element)
      .set({
        margin: 0.25,
        filename,
        image: {
          type: 'jpeg',
          quality: 0.98,
        },
        html2canvas: {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
        },
        jsPDF: {
          unit: 'in',
          format: 'a4',
          orientation: 'landscape',
        },
      })
      .save()
  } catch (error) {
    console.error('Error downloading summary PDF:', error)

    Swal.fire({
      icon: 'error',
      title: 'Download Failed',
      text: 'Failed to generate summary PDF. Please try again.',
    })
  } finally {
    if (element && document.body.contains(element)) {
      document.body.removeChild(element)
    }

    setDownloadingPdf(false)
  }
}
  
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

    // //
    // ...(userName ? [
    //   {
    //     header: "tafree",
    //     accessorKey: "clientName",
    //     cell: (props) => {
    //       const { clientName, type } = props.row.original;
    //       return type === "sale" ? <span>{clientName}</span> : <span>-</span>;
    //     },
    //   },
    // ] : []),
    // //
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
        //const bgColor = row.type === "purchase" ? "#e0f7fa" : "#e8f5e9"; // Light blue vs light green
        return (
          <div style={{  padding: "8px", borderRadius: "8px" }}>
            {actionButtons(props)}
          </div>
        );
      },
    },
 ],
  

  
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
          <div className="flex gap-3 my-4">
            <button
              onClick={handleDownloadSummaryPdf}
              disabled={downloadingPdf}
              className={`px-4 py-2 rounded font-medium transition-all ${
                downloadingPdf
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
              }`}
            >
              {downloadingPdf ? "Generating PDF..." : "Download Summary PDF"}
            </button>
          </div>
          <HeaderContent
            text= {userName? userName + " " + "Account" : "Company Accounts"}
            addButtonText1="Add Dana Receipt"
            addLink1="/createDanarecipt"
            addButtonText3={ userName?  "Billing" : ""}
            addLink3="/showbilling"
            addButtonText2="Add Customer Receipt"
            addLink2= "/createRecipt"
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
