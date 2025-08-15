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

export default function CustomerList() {
  const { textTheme } = useThemeClass();
  const navigate = useNavigate();
  const location = useLocation();
  const { userType, userId, userName, phoneNumber } = location.state || {};

  // List API hook
  const listUrl   = getCustomerdetails();
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
    onDeleteDialogClose,
    onDeleteConfirm,
    setData,
    setFilter,
  } = useListApi<any>(listUrl, deleteUrl, 100);

  // PDF download handler
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

  // PDF HTML content dynamically generate karna
const createHtmlContent = () => {
  const billDetails = billData && billData[0];

  const lineItemsHtml = data && data.length > 0
    ? data.map(item => `
        <tr>
          <td class="center">${new Date(item.date).toLocaleDateString()}</td>
          <td class="center">${item.quality || '-'}</td>
          <td class="center">${item.dcNumber || '-'}</td>
          <td class="right">${Number(item.grossWeight || 0).toFixed(2)}</td>
          <td class="right">${Number(item.rate || 0).toFixed(2)}</td>
          <td class="right">${Number(item.amount || 0).toFixed(2)}</td>
          <td class="right">${Number(item.extraRate || 0).toFixed(2)}</td>
          <td class="right">${Number(item.extraAmount || 0).toFixed(2)}</td>
          <td class="right">${Number(item.totalAmount ?? item.amount ?? 0).toFixed(2)}</td>
        </tr>
      `).join('')
    : `<tr><td colspan="9" class="center">No data available for this period.</td></tr>`;

  let conditionalSummaryHtml = "";
  const hasCompanyData = userType !== "walkingCustomer" && billDetails?.grossWeightCompany !== undefined;
  if (hasCompanyData) {
    const totalWeight = (billDetails.totalgrossWeight || 0) + (billDetails.grossWeightCompany || 0);
    const totalRate   = (billDetails.totalRate || 0)        + (billDetails.rateCompany || 0);
    const totalAmount = (billDetails.totalAmount || 0)      + (billDetails.amountCompany || 0);

    conditionalSummaryHtml = `
      <tr>
        <td colspan="8" style="padding-top:20px;">
          <div class="section-heading">Dana Excess From N/P Calpret:</div>
          <div class="flex-group">
            ${["Company Weight","Company Rate","Company Amount"].map((label, i) => `
              <div>
                <label>${label}</label>
                <input type="text" value="${Number([billDetails.grossWeightCompany, billDetails.rateCompany, billDetails.amountCompany][i] || 0).toFixed(2)}" readonly>
              </div>
            `).join('')}
          </div>
        </td>
      </tr>
      <tr>
        <td colspan="8" style="padding-top:20px;">
          <div class="section-heading">After Adding Company Rate and Weight:</div>
          <div class="flex-group">
            ${["Total Weight","Total Rate","Total Amount"].map((label, i) => `
              <div>
                <label>${label}</label>
                <input type="text" value="${Number([totalWeight, totalRate, totalAmount][i]).toFixed(2)}" readonly>
              </div>
            `).join('')}
          </div>
        </td>
      </tr>
    `;
  }

  let stockPurchasesTableHtml = "";
  if (userType !== "walkingCustomer" && weightData) {
    stockPurchasesTableHtml = `
      <table class="stock-table">
        <thead>
          <tr>
            <th>Stock Purchases</th><th>Pure</th><th>Mixing</th><th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${[
            ["Opening balance", weightData.openingBalanceWeightPure, weightData.openingBalanceWeightMixing],
            ["Total dana received by party", weightData.purchaseWeightPure, weightData.purchaseWeightMixing],
            ["Total dana received + opening balance", weightData.totalPurchaseWeightPure, weightData.totalPurchaseWeightMixing],
            ["Total dana consumption", weightData.saleWeightPure, weightData.saleWeightMixing],
            ["Closing Balance", weightData.closingWeightPure, weightData.closingWeightMixing],
            ["Bags", weightData.Purebags, weightData.Mixingbags]
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
    `;
  }

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
          <h1>${userName || 'Customer'} PE Billing</h1>
          <div class="period">Period: ${selectedMonth}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Date</th><th>Quality</th><th>DC Number</th><th>Total Weight</th>
              <th>Rate</th><th>Amount</th><th>Extra Rate</th>
              <th>Extra Amount</th><th>Total Amount</th>
            </tr>
          </thead>
          <tbody>
            ${lineItemsHtml}
          </tbody>
        </table>

        <table class="summary-table">
          <tr>
            <td colspan="8" style="padding-top:20px;">
              <div class="flex-group">
                <div>
                  <label>Total Weight</label>
                  <input type="text" value="${Number(billDetails?.totalgrossWeight || 0).toFixed(2)}" readonly>
                </div>
                <div>
                  <label>Total Rate</label>
                  <input type="text" value="${Number(billDetails?.totalRate || 0).toFixed(2)}" readonly>
                </div>
                <div>
                  <label>Total Amount</label>
                  <input type="text" value="${Number(billDetails?.totalAmount || 0).toFixed(2)}" readonly>
                </div>
                <div>
                  <label>Bill number</label>
                  <input type="text" value="${billDetails?.billNo || '-'}" readonly>
                </div>
              </div>
            </td>
          </tr>
          ${conditionalSummaryHtml}
        </table>

        ${stockPurchasesTableHtml}
      </div>
    </body>
    </html>
  `;
};


  const element = document.createElement("div");
  element.innerHTML = createHtmlContent();

  // (rest of the code for PDF generation remains unchanged)

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

  // Table ref for pagination/reset
  const tableRef = useRef<DataTableResetHandle>(null);
  const [viewOpen, setViewOpen]             = useState(false);
  const [selectedImg, setSelectedImg]       = useState<string>("");
  const [productType, setProductType]       = useState("poleythene");
  const [selectedMonth, setSelectedMonth]   = useState(new Date().toISOString().slice(0, 7));
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentEditingItem, setCurrentEditingItem] = useState<any>(null);

  // Update filter on dropdown / month / user props
  useEffect(() => {
    if (userId && userType) {
      setFilter({ product: productType, month: selectedMonth, userId, userType });
    } else {
      setFilter({ product: productType, month: selectedMonth, userType: "walkingCustomer", phoneNumber });
    }
  }, [productType, selectedMonth, userId, userType, phoneNumber]);

  const onViewOpen  = (img: string) => { setSelectedImg(img); setViewOpen(true); };
  const onDialogClose = () => { setViewOpen(false); setTimeout(() => setSelectedImg(""), 300); };

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
      setData(prev => prev.map(u => u._id === id ? { ...u, status: "approved" } : u));
      Swal.fire("Approved!", "The entry has been approved.", "success");
    } catch {
      Swal.fire("Error!", "Approval failed.", "error");
    }
  }, [setData]);

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
      setData(prev => prev.filter(u => u._id !== id));
      Swal.fire("Deleted!", "The entry has been deleted.", "success");
    } catch {
      Swal.fire("Error!", "Deletion failed.", "error");
    }
  }, [setData]);

  const handleSaveEditedItem = async (updatedItem: any) => {
    try {
      const resp = await editCustomerBilling(updatedItem);
      if (resp.status === 200 || resp.data.success) {
        setData(prev => prev.map(i => i._id === updatedItem._id ? updatedItem : i));
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

  const columns: ColumnDef<StoreItem>[] = useMemo(() => [
    {
      header: "Date",
      accessorKey: "date",
      cell: ({ row: { original } }) => {
        const d = new Date(original.date).toISOString().slice(0, 10);
        return <span>{new Date(d).toLocaleDateString()}</span>;
      },
    },
    { header: "Quality",   accessorKey: "quality" },
    { header: "DC Number", accessorKey: "dcNumber" },
    { header: "Total Weight", accessorKey: "grossWeight" },
    { header: "Rate",      accessorKey: "rate" },
    { header: "Amount",    accessorKey: "amount" },
    { header: "Extra Rate",  accessorKey: "extraRate" },
    { header: "Extra Amount", accessorKey: "extraAmount" },
    {
      header: "Total Amount",
      accessorKey: "totalAmount",
      cell: ({ row: { original } }) => original.totalAmount || original.amount,
    },
    {
      header: "Action",
      id: "action",
      cell: actionButtons,
    },
  ], [actionButtons]);

  const shouldShowWeightData = !!(userType && userId && userType !== "walkingCustomer");

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

         <button
        onClick={() => handleDownload()}
        className="mt-4 mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Download PDF
      </button>

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
          onChangeMonth={(m) => setSelectedMonth(m)}
          selectedMonth={selectedMonth}
          isMonthPicket
        />



        <DataTable
          ref={tableRef}
          columns={columns}
          data={data}
          loading={loading}
          pagingData={{ total, pageIndex, pageSize }}
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
