// src/components/CustomerList.tsx
import {
  AdaptableCard,
  CellContext,
  ColumnDef,
  DataTable,
  DataTableResetHandle,
} from "@/components/shared";
import html2pdf from "html2pdf.js/dist/html2pdf.bundle.min.js";

import useThemeClass from "@/utils/hooks/useThemeClass";
import { useLocation, useNavigate } from "react-router-dom";
import {
  HiEye,
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
  upadateByStatusCustomer,
  editCustomerBilling,
} from "@/services/GameManagement";
import CustomConfirmDialog from "@/components/shared/CustomConfirmDialog";
import { Dialog } from "@/components/ui";
import Swal from "sweetalert2";
import EditBillingForm from "./editbilling/EditBillingForm";
import { Action } from "history";

export default function CustomerList() {
  const { textTheme } = useThemeClass();
  const navigate = useNavigate();
  const location = useLocation();
  const { userType, userId, userName, phoneNumber } = location.state || {};

  // List API hook
  const listUrl = getCustomerdetails();
  const deleteUrl = deleteGameMode();
  const {
    pageIndex,
    pageSize,
    total,
    data,
    weightData,
    billData,
    exceedData,
    showDeleteDialog,
    loading,
    onPaginationChange,
    onPageSizeChange,
    onSort,
    onDeleteDialogClose,
    onDeleteConfirm,
    setData,
    setFilter,
  } = useListApi<any>(listUrl, deleteUrl, 100);

  // PDF download handler
  const handleDownload = async () => {
    const opt = {
      margin: 0.5,
      filename: "billing-report.pdf",
      image: { type: "jpeg", quality: 0.9 },
      html2canvas: {
        scale: 1.5,
        useCORS: false,
        backgroundColor: "#ffffff",
        letterRendering: true,
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
        compress: true,
      },
    };

    const createHtmlContent = () => {
      const billDetails = billData && billData[0];
      const selectedMonth = new Date().toISOString().slice(0, 7);
      
     const lineItemsHtml = data && data.length > 0
  ? data.map(item => `
    <tr style="${item.extraRate ? 'background-color: #f0f0f0;' : ''}">
      <td class="center">${
        item.isExtraRow 
          ? item.date   // 👈 Extra row me date ki jagah description wali string aayegi
          : new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'numeric', year: 'numeric' })
      }</td>
      <td class="center">${item.quality || '-'}</td>
      <td class="center">${item.dcNumber || '-'}</td>
      <td class="right">${Number(item.grossWeight || 0).toFixed(2)}</td>
      <td class="right">${Number(item.rate || 0).toFixed(2)}</td>
      <td class="right">${Number(item.amount || 0).toFixed(2)}</td>
    </tr>
  `).join('') +
  `
    <tr>
      <td colspan="3" style="text-align:center;"><strong>Total:</strong></td>
      <td class="right"><strong>${Number(billDetails?.totalgrossWeight || 0).toFixed(2)}</strong></td>
      <td></td>
      <td class="right"><strong>${Number(billDetails?.amount || 0).toFixed(2)}</strong></td>
    </tr>
  ` +
  (() => {
  const extraItems = data.filter(item => item.extraRate || item.extraAmount);

  // group by extraRate
  const grouped: any = {};
  extraItems.forEach(item => {
    const rate = item.extraRate || 0;
    if (!grouped[rate]) {
      grouped[rate] = {
        totalWeight: 0,
        totalAmount: 0,
        descriptions: [],
        dcNumbers: []
      };
    }
    grouped[rate].totalWeight += item.grossWeight || 0;
    grouped[rate].totalAmount += item.extraAmount || 0;
    if (item.description) grouped[rate].descriptions.push(item.description);
    if (item.dcNumber) grouped[rate].dcNumbers.push(item.dcNumber);
  });

  // build html rows
  return Object.keys(grouped).map((rate, index) => {
    const group = grouped[rate];

    const uniqueDescriptions = [...new Set(group.descriptions)].filter(d => d && d.trim() !== "");
    const descText = uniqueDescriptions.length > 0 ? uniqueDescriptions.join(", ") : `Extra Rate ${index + 1}`;

    let dcNumbersBlock = "";
    if (group.dcNumbers.length > 0) {
      const formatted = group.dcNumbers.map(dc => dc.replace(/^E-/i, "").trim());
      dcNumbersBlock = "E- " + formatted.join(", ");
    }

    const descriptionBlock = `${descText}<br/>${dcNumbersBlock}`;

    return `
      <tr>
        <td colspan="3" style="text-align:center;"><strong>${descriptionBlock}</strong></td>
        <td class="right"><strong>${Number(group.totalWeight || 0).toFixed(2)}</strong></td>
        <td class="right"><strong>${Number(rate || 0).toFixed(2)}</strong></td>
        <td class="right"><strong>${Number(group.totalAmount || 0).toFixed(2)}</strong></td>
      </tr>
    `;
  }).join('');
})() +
  (exceedData && Array.isArray(exceedData) && exceedData.length > 0
  ? exceedData.map(item => `
    <tr>
      <td colspan="3" style="text-align:center;"><strong>Danaa Excess from Company:</strong></td>
      <td class="right"><strong>${Number(item?.grossWeightCompany || 0).toFixed(2)}</strong></td>
      <td class="right"><strong>${Number(item?.rateCompany || 0).toFixed(2)}</strong></td>
      <td class="right"><strong>${Number(item?.amountCompany || 0).toFixed(2)}</strong></td>
    </tr>
  `).join('')  // ✅ sab rows ek string me join karo
  : ''
)
 +
  `
    <tr>
      <td colspan="3" style="text-align:center;"><strong>Grand Total:</strong></td>
       <td></td>
        <td></td>
      <td class="right"><strong>${Number((billDetails?.totalAmount || 0) + (billDetails?.amountCompany || 0)).toFixed(2)}</strong></td>
    </tr>
  `
  : '<tr><td colspan="9" class="center">No data available for this period.</td></tr>';

      const stockPurchasesTableHtml = userType !== "walkingCustomer" && weightData
        ? `
     <h3 style="text-align:center; margin:25px 0 15px 0;"> Summary</h3>


          <table class="stock-table">
          
            <thead>
              <tr>
                <th>stock purchase</th><th>Pure</th><th>Mixing</th><th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${[
                ["Opening balance", weightData?.openingBalanceWeightPure, weightData?.openingBalanceWeightMixing],
                ["Total dana received by party", weightData?.purchaseWeightPure, weightData?.purchaseWeightMixing],
                ["Total dana received + opening balance", weightData?.totalPurchaseWeightPure, weightData.totalPurchaseWeightMixing],
                ["Total dana consumption", weightData?.saleWeightPure, weightData?.saleWeightMixing],
                ["Closing Balance", weightData?.closingWeightPure, weightData?.closingWeightMixing],
               
              ].map(([label, pure, mix]) => `
                <tr>
                  <td>${label}</td>
                  <td class="right">${Number(pure || 0).toFixed(2)}</td>
                  <td class="right">${Number(mix || 0).toFixed(2)}</td>
                  <td class="right">${Number((pure || 0) + (mix || 0)).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : '';

      return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8"/>
          <title>${userName || 'Customer'} PE Billing – ${selectedMonth}</title>
          <style>
            @page {
              size: A4;
              margin: 20mm;
            }
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              color: #333;
            }
            .container {
              padding: 20px;
              box-sizing: border-box;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: baseline;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
            }
            .period {
              font-size: 14px;
              color: #555;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
            }
            th {
              background-color: #f0f0f0;
              text-align: center;
            }
            td.right {
              text-align: right;
            }
            .summary-table td {
              border: none;
              padding: 6px 8px;
            }
            .summary-table input {
              width: 100%;
              padding: 4px;
              box-sizing: border-box;
              border: 1px solid #ccc;
              border-radius: 4px;
            }
            .section-heading {
              background: linear-gradient(90deg, #f7f7f7, #e8e8e8);
              padding: 10px 14px;
              border-radius: 6px;
              font-weight: bold;
              font-size: 17px;
              margin-bottom: 15px;
            }
            .flex-group {
              display: flex;
              gap: 30px;
              margin-top: 15px;
            }
            .flex-group label {
              display: block;
              margin-bottom: 4px;
              font-weight: bold;
            }
            .stock-table th {
              background-color: #eee;
            }
            .stock-table td, .stock-table th {
              border: 1px solid #ccc;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>
                ${userName || 'Customer'}
                <br>
                Bill No: ${billDetails?.billNo || '-'}
              </h1>
              <h3>
                Date: ${
                  new Date(
                    new Date(selectedMonth + '-01').getFullYear(),
                    new Date(selectedMonth + '-01').getMonth(),
                    0
                  ).toLocaleDateString('en-GB', { day: '2-digit', month: 'numeric', year: 'numeric' })
                }
              </h3>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Date</th><th>Quality</th><th>DC Number</th><th>Weight</th>
                  <th>Rate</th><th>Total Amount</th>
                </tr>
              </thead>
              <tbody>
                ${lineItemsHtml}
              </tbody>
            </table>
            ${stockPurchasesTableHtml}
          </div>
        </body>
        </html>
      `;
    };

    const element = document.createElement("div");
    element.innerHTML = createHtmlContent();

    const imgs = element.querySelectorAll("img");
    await Promise.all(Array.from(imgs).map(async (img) => {
      const src = img.getAttribute("src") || "";
      if (src.startsWith("data:")) return;
      if (src.endsWith(".webp")) { img.remove(); return; }
      try {
        const resp = await fetch(src, { mode: "cors" });
        if (!resp.ok) throw new Error("Fetch failed");
        const blob = await resp.blob();
        const reader = new FileReader();
        const dataUri = await new Promise((res, rej) => {
          reader.onloadend = () => res(reader.result as string);
          reader.onerror = rej;
          reader.readAsDataURL(blob);
        });
        img.setAttribute("src", dataUri);
      } catch {
        img.remove();
      }
    }));

    const style = document.createElement("style");
    style.textContent = `.page-break { page-break-before: always; break-before: page; height: 0; }`;
    element.appendChild(style);

    document.body.appendChild(element);
    html2pdf()
      .from(element)
      .set(opt)
      .save()
      .then(() => {
        document.body.removeChild(element);
      });
  };

  const tableRef = useRef<DataTableResetHandle>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedImg, setSelectedImg] = useState<string>("");
  const [productType, setProductType] = useState("Bill");
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentEditingItem, setCurrentEditingItem] = useState<any>(null);

  useEffect(() => {
    if (userId && userType) {
      setFilter({ billNo: productType === "mergeBill"? billData?.[0]?.billNo : "", product: productType, month: selectedMonth, userId, userType });
    } else {
      setFilter({ billNo: productType === "mergeBill"? billData?.[0]?.billNo : "", product: productType, month: selectedMonth, userType: "walkingCustomer", phoneNumber });
    }
  }, [productType, selectedMonth, userId, userType, phoneNumber]);

  const onViewOpen = (img: string) => {
    setSelectedImg(img);
    setViewOpen(true);
  };
  const onDialogClose = () => {
    setViewOpen(false);
    setTimeout(() => setSelectedImg(""), 300);
  };

  const handleEditClick = useCallback((item: any) => () => {
    setCurrentEditingItem(item);
    setIsEditModalOpen(true);
  }, []);

  const approved = useCallback((_: boolean, id: string) => async () => {
    const choice = await Swal.fire({
      title: "Warning!",
      text: "Are you sure you want to approve?",
      icon: "warning",
      confirmButtonText: "Yes",
    });
    if (!choice.isConfirmed) return;
    try {
      await upadateByStatusCustomer(id);
      setData((prev: any) => prev.map((u: any) => u._id === id ? { ...u, status: "approved" } : u));
      Swal.fire("Approved!", "The entry has been approved.", "success");
    } catch {
      Swal.fire("Error!", "Approval failed.", "error");
    }
  }, [setData]);


  const onChangeDropDown = (itemSelected: string) => {
      console.log("faraz1", itemSelected)
      setProductType(itemSelected);
    };

  const onDelete = useCallback((id: string) => async () => {
    const choice = await Swal.fire({
      title: "Warning!",
      text: "Are you sure you want to delete?",
      icon: "warning",
      confirmButtonText: "Yes",
    });
    if (!choice.isConfirmed) return;
    try {
      await deleteCustomers(id);
      setData((prev: any) => prev.filter((u: any) => u._id !== id));
      Swal.fire("Deleted!", "The entry has been deleted.", "success");
    } catch {
      Swal.fire("Error!", "Deletion failed.", "error");
    }
  }, [setData]);

  const handleSaveEditedItem = async (updatedItem: any) => {
    try {
      const resp = await editCustomerBilling(updatedItem);
      if (resp.status === 200 || resp.data.success) {
        setData((prev: any) => prev.map((i: any) => i._id === updatedItem._id ? updatedItem : i));
        setIsEditModalOpen(false);
        Swal.fire("Success!", "Entry updated successfully.", "success");
      } else {
        Swal.fire("Error!", resp.data.message || "Update failed.", "error");
      }
    } catch {
      Swal.fire("Error!", "An error occurred while updating.", "error");
    }
  };

  const actionButtons = (props: CellContext<StoreItem, unknown>) => {
    const { _id, status } = props.row.original;
    return (
      <div className="flex justify-end text-lg">
        {status === "pending" && (
          <span className={`cursor-pointer p-2 hover:${textTheme}`} onClick={approved(status === "pending", _id)}>
            <HiEye />
          </span>
        )}
        <span className={`cursor-pointer p-2 hover:${textTheme}`} onClick={handleEditClick(props.row.original)}>
          <HiOutlinePencil />
        </span>
        <span className="cursor-pointer p-2 hover:text-red-500" onClick={onDelete(_id)}>
          <HiOutlineTrash />
        </span>
      </div>
    );
  };

  // Combining data with summary rows for the DataTable
const allData = useMemo(() => {
  if (!data || data.length === 0) return [];
  
  let combinedData = [...data];
  const billDetail = billData && billData[0];
  

  // Add Total row
  const totalRow = {
    _id: 'total',
    date: 'Total:',
    quality: '',
    dcNumber: '',
    grossWeight: billDetail?.totalgrossWeight,
    rate: '',
    amount: billDetail?.amount,
    isTotalRow: true
  };
  combinedData.push(totalRow);

  // Add Extra Rate rows (conditional)
if (data && data.length > 0) {


  // Filter only those having extraRate or extraAmount
  const extraItems = data.filter(item => item.extraRate || item.extraAmount);
  console.log("Raw extraRates:", data.map(d => d.extraRate)); // 👈 yahan

  // Group by extraRate
  const grouped: any = {};
  extraItems.forEach(item => {
    const rate = item.extraRate || 0;

    console.log("Processing:", item.description, "Rate:", rate); // 👈 ye dekhna

    if (!grouped[rate]) {
      grouped[rate] = {
        totalWeight: 0,
        descriptions: [], // only descriptions
        dcNumbers: []     // only dcNumbers
      };
    }

    grouped[rate].totalWeight += item.grossWeight || 0;

    if (item.description) {
      grouped[rate].descriptions.push(item.description);
    }
    if (item.dcNumber) {
      grouped[rate].dcNumbers.push(item.dcNumber);
    }
  });

  // Convert groups into rows
  Object.keys(grouped).forEach((rate, index) => {
    const group = grouped[rate];
     console.log("Group:", rate, "Weight:", group.totalWeight, "Final Rate:", rate);

    // ✅ Format DC numbers with common "E-"
    let dcNumbersBlock = "";
    if (group.dcNumbers.length > 0) {
      // Remove "E" from start of each DC number
      const formatted = group.dcNumbers.map(dc => dc.replace(/^E-/i, "").trim());
      dcNumbersBlock = "E-" + formatted.join(", ");
    }

    // ✅ Final block with <br/> (HTML line break)
   const descriptionBlock =
  (group.descriptions.length > 0
    ? group.descriptions.join(", ")
    : `Extra Rate ${index + 1}`) +
  "\n" + // 👈 real line break
  dcNumbersBlock;


    const totalAmount = group.totalWeight * Number(rate);

    combinedData.push({
      _id: `extra-${index + 1}`,
      date: descriptionBlock, // 👈 HTML string with <br/>
      quality: '',
      dcNumber: '',
      grossWeight: group.totalWeight,
      rate: Number(rate),
      amount: totalAmount,
      isExtraRow: true
    });
  });
}


  // Add Danaa Excess row if applicable
  if (exceedData && exceedData.length > 0) {
  exceedData.forEach((item, index) => {
    const danaaExcessRow = {
      _id: `danaa-excess-${index + 1}`, // unique ID for each
      date: 'Danaa Excess from Company:',
      quality: '',
      dcNumber: '',
      grossWeight: item.grossWeightCompany,
      rate: item.rateCompany,
      amount: item.amountCompany,
      isDanaaExcessRow: true
    };

    combinedData.push(danaaExcessRow);
  });
}

  // Add Grand Total row
  const grandTotalRow = {
    _id: 'grand-total',
    date: 'Grand Total:',
    quality: '',
    dcNumber: '',
    grossWeight: null,
    rate: null,
    amount: (billDetail?.totalAmount || 0) + (billDetail?.amountCompany || 0),
    isGrandTotalRow: true
  };
  combinedData.push(grandTotalRow);

  return combinedData;
}, [data, billData]);


  // Redefining columns to handle summary rows
  const customColumns = useMemo(() => [
  {
    header: "Date",
    accessorKey: "date",
    cell: ({ row: { original } }) => {
      if (original.isTotalRow) return <div className="font-bold">Total:</div>;
      if (original.isDanaaExcessRow) return <div className="font-bold">Danaa Excess from Company:</div>;
      if (original.isGrandTotalRow) return <div className="font-bold">Grand Total:</div>;
       if (original.isExtraRow) {
      return (
        <div
          className="font-bold whitespace-pre-line"
          dangerouslySetInnerHTML={{ __html: (original.date || "").replace(/\n/g, "<br/>") }}
        />
      );
    }

      // 🟢 Only for valid date rows
      if (!original.date) return null;
      const parsedDate = new Date(original.date);
      if (isNaN(parsedDate.getTime())) {
        return <span>-</span>;
      }
      return <span>{parsedDate.toLocaleDateString("en-GB")}</span>;
    }
  },
  {
    header: "Quality",
    accessorKey: "quality",
    cell: ({ row: { original } }) => {
      if (original.isTotalRow || original.isExtraRow || original.isDanaaExcessRow || original.isGrandTotalRow) {
        return <span className="font-bold">{original.quality || ""}</span>;
      }
      return original.quality;
    }
  },
  {
    header: "DC Number",
    accessorKey: "dcNumber",
    cell: ({ row: { original } }) => {
      if (original.isTotalRow || original.isExtraRow || original.isDanaaExcessRow || original.isGrandTotalRow) {
        return <span className="font-bold">{original.dcNumber || ""}</span>;
      }
      return original.dcNumber;
    }
  },
  {
    header: "Total Weight",
    accessorKey: "grossWeight",
    cell: ({ row: { original } }) => {
      const value = Number(original.grossWeight || 0).toFixed(2);
      if (original.isTotalRow || original.isExtraRow || original.isDanaaExcessRow || original.isGrandTotalRow) {
        return <span className="font-bold">{value}</span>;
      }
      if (original.isGrandTotalRow) return null;
      return value;
    }
  },
  {
    header: "Rate",
    accessorKey: "rate",
    cell: ({ row: { original } }) => {
      const value = Number(original.rate || 0).toFixed(2);
      if (original.isTotalRow || original.isExtraRow || original.isDanaaExcessRow || original.isGrandTotalRow) {
        return <span className="font-bold">{value}</span>;
      }
      return value;
    }
  },
  {
    header: "Amount",
    accessorKey: "amount",
    cell: ({ row: { original } }) => {
      const value = Number(original.amount !== undefined ? original.amount : original.totalAmount || 0).toFixed(2);
      if (original.isTotalRow || original.isExtraRow || original.isDanaaExcessRow || original.isGrandTotalRow) {
        return <span className="font-bold">{value}</span>;
      }
      return value;
    }
  },
  {
  header: "Action",
  id: "action",
  cell: ({ row: { original } }) => {
    // ✅ hide actions for summary rows
    if (original.isTotalRow || original.isExtraRow || original.isDanaaExcessRow || original.isGrandTotalRow) {
      return null;
    }
    // 🟢 normal rows → show buttons
    return actionButtons({ row: { original } });
  }
}

], [actionButtons]);


  const shouldShowWeightData = !!(userType && userId && userType !== "walkingCustomer");
  const isDataAvailable = data && data.length > 0;

  return (
    <>
      <AdaptableCard className="h-full" bodyClass="h-full">
        <Dialog isOpen={viewOpen} onClose={onDialogClose} onRequestClose={onDialogClose}>
          <img className="h-96 w-96 mx-auto" src={selectedImg} alt="preview" />
        </Dialog>

        <Dialog isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onRequestClose={() => setIsEditModalOpen(false)}>
          {currentEditingItem && (
            <EditBillingForm
              item={currentEditingItem}
              onSave={handleSaveEditedItem}
              onCancel={() => setIsEditModalOpen(false)}
            />
          )}
        </Dialog>

<div className="flex justify-between items-center my-6">
  {/* Left: Download Button */}
  <button
    onClick={() => handleDownload()}
    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
  >
    Download PDF
  </button>

  {/* Right: Bill No */}
  <span className="text-2xl font-bold text-gray-800">
    Bill No: {billData?.[0]?.billNo || "N/A"}
  </span>
</div>
        <HeaderContent
          text={userName ? `${userName} Billing` : "Sales"}
          state={{
            userType: userType || "walkingCustomer",
            userId,
            userName,
            phoneNumber: phoneNumber || "",
          }}
          {...(shouldShowWeightData && { weightData })}
          billData={billData}
          dropDownOptions={[{value: "Bill ", label: "Bill"},{value: "mergeBill", label: " Merge Bill "}]}
          dropDownSelectedValue={"Bill"}
          onChangeDropDown={onChangeDropDown}
          onChangeMonth={(m) => setSelectedMonth(m)}
          selectedMonth={selectedMonth}
          isMonthPicket
        />



        <div className="mt-4">
          <DataTable
            ref={tableRef}
            columns={customColumns}
            data={isDataAvailable ? allData : []}
            loading={loading}
            pagingData={{ total, pageIndex, pageSize }}
            onPaginationChange={onPaginationChange}
            onSelectChange={onPageSizeChange}
            onSort={onSort}
          />
        </div>

      
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