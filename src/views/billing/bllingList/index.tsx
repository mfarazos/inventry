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
import { HiEye, HiOutlinePencil, HiOutlineTrash } from "react-icons/hi";
import { FaWhatsapp } from "react-icons/fa";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StoreItem } from "@/@types/store";
import useListApi from "@/utils/hooks/useListApi";
import HeaderContent from "@/components/shared/HeaderContent";
import ApiService from "@/services/ApiService";
import {
  deleteCustomers,
  deleteGameMode,
  getCategorycustomers,
  getCustomerdetails,
  getwalkingCustomers,
  upadateByStatusCustomer,
  editCustomerBilling,
} from "@/services/GameManagement";
import CustomConfirmDialog from "@/components/shared/CustomConfirmDialog";
import { Dialog } from "@/components/ui";
import Swal from "sweetalert2";
import EditBillingForm from "./editbilling/EditBillingForm";
import { Action } from "history";

type MergeCustomerOption = {
  _id?: string;
  clientName?: string;
  phoneNumber?: string;
  ref_no?: string;
  billNo?: string;
};

const getResponseRows = (responseData: any): MergeCustomerOption[] => {
  if (Array.isArray(responseData?.data)) return responseData.data;
  if (Array.isArray(responseData?.data?.data)) return responseData.data.data;
  if (Array.isArray(responseData)) return responseData;

  return [];
};

const formatMonthLabel = (monthValue?: string) => {
  if (!monthValue) return "";

  const date = new Date(`${monthValue}-01T00:00:00`);
  if (Number.isNaN(date.getTime())) return monthValue;

  return date.toLocaleDateString("en-GB", {
    month: "short",
    year: "numeric",
  });
};

const getMonthEndDateLabel = (monthValue?: string) => {
  if (!monthValue) return "-";

  const date = new Date(`${monthValue}-01T00:00:00`);
  if (Number.isNaN(date.getTime())) return monthValue;

  return new Date(date.getFullYear(), date.getMonth() + 1, 0).toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "numeric",
      year: "numeric",
    },
  );
};

export default function CustomerList() {
  const { textTheme } = useThemeClass();
  const navigate = useNavigate();
  const location = useLocation();
  const { userType, userId, userName, phoneNumber, ref_no } = location.state || {};

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
      const normalAmount = data.reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0,
      );

      const totalGrossWeight = data.reduce(
        (sum, item) => sum + Number(item.grossWeight || 0),
        0,
      );

      const extraAmount = data.reduce(
        (sum, item) => sum + Number(item.extraAmount || 0),
        0,
      );

      const companyExcessAmount = Array.isArray(exceedData)
        ? exceedData.reduce(
            (sum, item) => sum + Number(item.amountCompany || 0),
            0,
          )
        : 0;

      const billDetails = {
        billNo: billData?.[0]?.billNo || "-",
        totalgrossWeight: totalGrossWeight,
        amount: normalAmount,
        totalAmount: normalAmount + extraAmount + companyExcessAmount,
      };

      const lineItemsHtml =
        data && data.length > 0
          ? data
              .map(
                (item) => `
    <tr style="${item.extraRate ? "background-color: #f0f0f0;" : ""}">
      <td class="center">${
        item.isExtraRow
          ? item.date // 👈 Extra row me date ki jagah description wali string aayegi
          : new Date(item.date).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "numeric",
              year: "numeric",
            })
      }</td>
      <td class="center">${item.quality || "-"}</td>
      <td class="center">${item.dcNumber || "-"}</td>
      <td class="right">${Number(item.grossWeight || 0).toFixed(2)}</td>
      <td class="right">${Number(item.rate || 0).toFixed(2)}</td>
      <td class="right">${Number(item.amount || 0).toFixed(2)}</td>
    </tr>
  `,
              )
              .join("") +
            `
    <tr>
      <td colspan="3" style="text-align:center;"><strong>Total:</strong></td>
      <td class="right"><strong>${Number(
        billDetails?.totalgrossWeight || 0,
      ).toFixed(2)}</strong></td>
      <td></td>
      <td class="right"><strong>${Number(billDetails?.amount || 0).toFixed(
        2,
      )}</strong></td>
    </tr>
  ` +
            (() => {
              const extraItems = data.filter(
                (item) => item.extraRate || item.extraAmount,
              );

              // group by extraRate
              const grouped: any = {};
              extraItems.forEach((item) => {
                const rate = item.extraRate || 0;
                if (!grouped[rate]) {
                  grouped[rate] = {
                    totalWeight: 0,
                    totalAmount: 0,
                    descriptions: [],
                    dcNumbers: [],
                  };
                }
                grouped[rate].totalWeight += item.grossWeight || 0;
                grouped[rate].totalAmount += item.extraAmount || 0;
                if (item.description)
                  grouped[rate].descriptions.push(item.description);
                if (item.dcNumber) grouped[rate].dcNumbers.push(item.dcNumber);
              });

              // build html rows
              return Object.keys(grouped)
                .map((rate, index) => {
                  const group = grouped[rate];

                  const uniqueDescriptions = [
                    ...new Set(group.descriptions),
                  ].filter((d) => d && d.trim() !== "");
                  const descText =
                    uniqueDescriptions.length > 0
                      ? uniqueDescriptions.join(", ")
                      : `Extra Rate ${index + 1}`;

                  let dcNumbersBlock = "";
                  if (group.dcNumbers.length > 0) {
                    const formatted = group.dcNumbers.map((dc) =>
                      dc.replace(/^E-/i, "").trim(),
                    );
                    dcNumbersBlock = "E- " + formatted.join(", ");
                  }

                  const descriptionBlock = `${descText}<br/>${dcNumbersBlock}`;

                  return `
      <tr>
        <td colspan="3" style="text-align:center;"><strong>${descriptionBlock}</strong></td>
        <td class="right"><strong>${Number(group.totalWeight || 0).toFixed(
          2,
        )}</strong></td>
        <td class="right"><strong>${Number(rate || 0).toFixed(2)}</strong></td>
        <td class="right"><strong>${Number(group.totalAmount || 0).toFixed(
          2,
        )}</strong></td>
      </tr>
    `;
                })
                .join("");
            })() +
            (exceedData && Array.isArray(exceedData) && exceedData.length > 0
              ? exceedData
                  .map(
                    (item) => `
    <tr>
      <td colspan="3" style="text-align:center;"><strong>Danaa Excess from Company:</strong></td>
      <td class="right"><strong>${Number(item?.grossWeightCompany || 0).toFixed(
        2,
      )}</strong></td>
      <td class="right"><strong>${Number(item?.rateCompany || 0).toFixed(
        2,
      )}</strong></td>
      <td class="right"><strong>${Number(item?.amountCompany || 0).toFixed(
        2,
      )}</strong></td>
    </tr>
  `,
                  )
                  .join("") // ✅ sab rows ek string me join karo
              : "") +
            `
    <tr>
      <td colspan="3" style="text-align:center;"><strong>Grand Total:</strong></td>
       <td></td>
        <td></td>
      <td class="right"><strong>${Number(
        (billDetails?.totalAmount || 0) + (billDetails?.amountCompany || 0),
      ).toFixed(2)}</strong></td>
    </tr>
  `
          : '<tr><td colspan="9" class="center">No data available for this period.</td></tr>';

      const stockPurchasesTableHtml =
        userType !== "walkingCustomer" && weightData
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
                [
                  "Opening balance",
                  weightData?.openingBalanceWeightPure,
                  weightData?.openingBalanceWeightMixing,
                ],
                [
                  "Total dana received by party",
                  weightData?.purchaseWeightPure,
                  weightData?.purchaseWeightMixing,
                ],
                [
                  "Total dana received + opening balance",
                  weightData?.totalPurchaseWeightPure,
                  weightData.totalPurchaseWeightMixing,
                ],
                [
                  "Total dana consumption",
                  weightData?.saleWeightPure,
                  weightData?.saleWeightMixing,
                ],
                [
                  "Closing Balance",
                  weightData?.closingWeightPure,
                  weightData?.closingWeightMixing,
                ],
              ]
                .map(
                  ([label, pure, mix]) => `
                <tr>
                  <td>${label}</td>
                  <td class="right">${Number(pure || 0).toFixed(2)}</td>
                  <td class="right">${Number(mix || 0).toFixed(2)}</td>
                  <td class="right">${Number((pure || 0) + (mix || 0)).toFixed(
                    2,
                  )}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
        `
          : "";

      return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8"/>
          <title>${userName || "Customer"} PE Billing – ${billingPeriodLabel}</title>
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
                ${userName || "Customer"}
                <br>
                Bill No: ${billDetails?.billNo || "-"}
              </h1>
              <h3>
                Period: ${billingPeriodLabel}
                <br>
                Date: ${getMonthEndDateLabel(billingPeriodEndMonth)}
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
    await Promise.all(
      Array.from(imgs).map(async (img) => {
        const src = img.getAttribute("src") || "";
        if (src.startsWith("data:")) return;
        if (src.endsWith(".webp")) {
          img.remove();
          return;
        }
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
      }),
    );

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

  const GotoBill = () => {
    navigate("/create-sales-payment", {
      state: {
        userType: userType,
        userId: userId,
        userName: userName,
        phoneNumber: phoneNumber,
        ref_no,
        billNo: billData?.[0]?.billNo,
      },
    });
  };

  const tableRef = useRef<DataTableResetHandle>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedImg, setSelectedImg] = useState<string>("");
  const [productType, setProductType] = useState("Bill");
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [billingPeriodMode, setBillingPeriodMode] = useState("single");
  const [selectedMonth, setSelectedMonth] = useState(
    currentMonth,
  );
  const [fromMonth, setFromMonth] = useState(currentMonth);
  const [toMonth, setToMonth] = useState(currentMonth);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentEditingItem, setCurrentEditingItem] = useState<any>(null);
  const [manualWhatsAppPhone, setManualWhatsAppPhone] = useState("");
  const [isWhatsAppDialogOpen, setIsWhatsAppDialogOpen] = useState(false);
  const [mergeSearch, setMergeSearch] = useState("");
  const [debouncedMergeSearch, setDebouncedMergeSearch] = useState("");
  const [mergeCustomerOptions, setMergeCustomerOptions] = useState<
    MergeCustomerOption[]
  >([]);
  const [selectedMergeCustomer, setSelectedMergeCustomer] =
    useState<MergeCustomerOption | null>(null);
  const [mergeCustomerLoading, setMergeCustomerLoading] = useState(false);
  const [showMergeSuggestions, setShowMergeSuggestions] = useState(false);

  const currentUserType = userType || "walkingCustomer";
  const mergeTargetType =
    currentUserType === "specificCustomer"
      ? "walkingCustomer"
      : "specificCustomer";
  const isRangePeriod = billingPeriodMode === "range";
  const billingPeriodEndMonth = isRangePeriod ? toMonth || fromMonth : selectedMonth;
  const billingPeriodLabel = isRangePeriod
    ? `${formatMonthLabel(fromMonth)} to ${formatMonthLabel(toMonth || fromMonth)}`
    : formatMonthLabel(selectedMonth);

  const billingPeriodFilter = useMemo(() => {
    if (!isRangePeriod) {
      return { month: selectedMonth };
    }

    return {
      fromMonth,
      toMonth: toMonth || fromMonth,
    };
  }, [fromMonth, isRangePeriod, selectedMonth, toMonth]);

  const normalizeWhatsAppPhone = (value: string) => {
    const rawPhone = String(value || "").replace(/\D/g, "");

    if (!rawPhone) return "";
    if (rawPhone.startsWith("92")) return rawPhone;
    if (rawPhone.startsWith("0")) return `92${rawPhone.slice(1)}`;

    return rawPhone;
  };

  const openWhatsAppWithPhone = async (phoneValue: string) => {
    const phone = normalizeWhatsAppPhone(phoneValue);

    if (!phone) {
      Swal.fire(
        "Phone number missing",
        "Customer phone number is required to open WhatsApp.",
        "warning",
      );
      return;
    }

    const billNoText = billData?.[0]?.billNo || "N/A";
    const messageText = `Assalam o Alaikum ${
      userName || "Customer"
    },\n\nYour billing report is ready.\nBill No: ${billNoText}\nPeriod: ${billingPeriodLabel}\n\nPlease find the downloaded PDF attached.`;
    const message = encodeURIComponent(messageText);

    const whatsAppWindow = window.open(
      `https://wa.me/${phone}?text=${message}`,
      "whatsappWindow",
    );

    if (whatsAppWindow) {
      whatsAppWindow.focus();
    } else {
      try {
        await navigator.clipboard.writeText(messageText);
        Swal.fire(
          "Message copied",
          "WhatsApp tab could not be opened. Paste the copied message in your existing WhatsApp Web chat.",
          "info",
        );
      } catch {
        Swal.fire(
          "WhatsApp blocked",
          "Please allow popups or copy the billing message manually.",
          "warning",
        );
      }
    }

    setIsWhatsAppDialogOpen(false);
  };

  const handleShareWhatsApp = () => {
    const savedPhone = normalizeWhatsAppPhone(phoneNumber || "");

    if (savedPhone) {
      openWhatsAppWithPhone(savedPhone);
      return;
    }

    setManualWhatsAppPhone("");
    setIsWhatsAppDialogOpen(true);
  };

  const billingFilter = useMemo(() => {
    const baseFilter: Record<string, any> = {
      product: productType,
      ...billingPeriodFilter,
      userType: currentUserType,
    };

    if (productType === "mergeBill") {
      if (!selectedMergeCustomer) {
        return null;
      }

      return {
        ...baseFilter,
        userId:
          currentUserType === "specificCustomer"
            ? userId
            : selectedMergeCustomer._id,
        ref_no:
          currentUserType === "walkingCustomer"
            ? ref_no
            : selectedMergeCustomer.ref_no,
      };
    }

    if (currentUserType === "specificCustomer") {
      return {
        ...baseFilter,
        userId,
      };
    }

    return {
      ...baseFilter,
      phoneNumber,
      ref_no,
    };
  }, [
    currentUserType,
    billingPeriodFilter,
    phoneNumber,
    productType,
    ref_no,
    selectedMergeCustomer,
    userId,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedMergeSearch(mergeSearch.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [mergeSearch]);

  useEffect(() => {
    if (productType !== "mergeBill" || !debouncedMergeSearch) {
      setMergeCustomerOptions([]);
      setMergeCustomerLoading(false);
      return;
    }

    const fetchMergeCustomers = async () => {
      setMergeCustomerLoading(true);

      try {
        const url =
          mergeTargetType === "walkingCustomer"
            ? getwalkingCustomers()
            : getCategorycustomers();
        const response = await ApiService.fetchData<any>({
          url,
          method: "get",
          params: {
            search: debouncedMergeSearch,
            page: 1,
            limit: 100,
            ...(mergeTargetType === "walkingCustomer" && {
              groupby_name: true,
            }),
          },
        });

        setMergeCustomerOptions(getResponseRows(response.data));
      } catch {
        setMergeCustomerOptions([]);
      } finally {
        setMergeCustomerLoading(false);
      }
    };

    fetchMergeCustomers();
  }, [debouncedMergeSearch, mergeTargetType, productType]);

  useEffect(() => {
    if (!billingFilter) {
      setData([]);
      return;
    }

    setFilter(billingFilter);
  }, [billingFilter, setData, setFilter]);

  const onViewOpen = (img: string) => {
    setSelectedImg(img);
    setViewOpen(true);
  };
  const onDialogClose = () => {
    setViewOpen(false);
    setTimeout(() => setSelectedImg(""), 300);
  };

  const handleEditClick = useCallback(
    (item: any) => () => {
      setCurrentEditingItem(item);
      setIsEditModalOpen(true);
    },
    [],
  );

  const approved = useCallback(
    (_: boolean, id: string) => async () => {
      const choice = await Swal.fire({
        title: "Warning!",
        text: "Are you sure you want to approve?",
        icon: "warning",
        confirmButtonText: "Yes",
      });
      if (!choice.isConfirmed) return;
      try {
        await upadateByStatusCustomer(id);
        setData((prev: any) =>
          prev.map((u: any) =>
            u._id === id ? { ...u, status: "approved" } : u,
          ),
        );
        Swal.fire("Approved!", "The entry has been approved.", "success");
      } catch {
        Swal.fire("Error!", "Approval failed.", "error");
      }
    },
    [setData],
  );

  const onChangeDropDown = (itemSelected: string) => {
    const nextProductType = itemSelected.trim();

    setProductType(nextProductType);
    setMergeSearch("");
    setDebouncedMergeSearch("");
    setMergeCustomerOptions([]);
    setSelectedMergeCustomer(null);
    setShowMergeSuggestions(false);
  };

  const onDelete = useCallback(
    (id: string) => async () => {
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
    },
    [setData],
  );

  const handleSaveEditedItem = async (updatedItem: any) => {
    try {
      const resp = await editCustomerBilling(updatedItem);
      if (resp.status === 200 || resp.data.success) {
        setData((prev: any) =>
          prev.map((i: any) => (i._id === updatedItem._id ? updatedItem : i)),
        );
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
          <span
            className={`cursor-pointer p-2 hover:${textTheme}`}
            onClick={approved(status === "pending", _id)}
          >
            <HiEye />
          </span>
        )}
        <span
          className={`cursor-pointer p-2 hover:${textTheme}`}
          onClick={handleEditClick(props.row.original)}
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

  // Combining data with summary rows for the DataTable
  const allData = useMemo(() => {
    if (!data || data.length === 0) return [];

    let combinedData = [...data];
    const normalAmount = data.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0,
    );

    const totalGrossWeight = data.reduce(
      (sum, item) => sum + Number(item.grossWeight || 0),
      0,
    );

    const extraAmount = data.reduce(
      (sum, item) => sum + Number(item.extraAmount || 0),
      0,
    );

    const companyExcessAmount = Array.isArray(exceedData)
      ? exceedData.reduce(
          (sum, item) => sum + Number(item.amountCompany || 0),
          0,
        )
      : 0;

    const billDetail = {
      totalgrossWeight: totalGrossWeight,
      amount: normalAmount,
      totalAmount: normalAmount + extraAmount + companyExcessAmount,
    };

    // Add Total row
    const totalRow = {
      _id: "total",
      date: "Total:",
      quality: "",
      dcNumber: "",
      grossWeight: billDetail?.totalgrossWeight,
      rate: "",
      amount: billDetail?.amount,
      isTotalRow: true,
    };
    combinedData.push(totalRow);

    // Add Extra Rate rows (conditional)
    if (data && data.length > 0) {
      // Filter only those having extraRate or extraAmount
      const extraItems = data.filter(
        (item) => item.extraRate || item.extraAmount,
      );
      console.log(
        "Raw extraRates:",
        data.map((d) => d.extraRate),
      ); // 👈 yahan

      // Group by extraRate
      const grouped: any = {};
      extraItems.forEach((item) => {
        const rate = item.extraRate || 0;

        console.log("Processing:", item.description, "Rate:", rate); // 👈 ye dekhna

        if (!grouped[rate]) {
          grouped[rate] = {
            totalWeight: 0,
            descriptions: [], // only descriptions
            dcNumbers: [], // only dcNumbers
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
        console.log(
          "Group:",
          rate,
          "Weight:",
          group.totalWeight,
          "Final Rate:",
          rate,
        );

        // ✅ Format DC numbers with common "E-"
        let dcNumbersBlock = "";
        if (group.dcNumbers.length > 0) {
          // Remove "E" from start of each DC number
          const formatted = group.dcNumbers.map((dc) =>
            dc.replace(/^E-/i, "").trim(),
          );
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
          quality: "",
          dcNumber: "",
          grossWeight: group.totalWeight,
          rate: Number(rate),
          amount: totalAmount,
          isExtraRow: true,
        });
      });
    }

    // Add Danaa Excess row if applicable
    if (exceedData && exceedData.length > 0) {
      exceedData.forEach((item, index) => {
        const danaaExcessRow = {
          _id: `danaa-excess-${index + 1}`, // unique ID for each
          date: "Danaa Excess from Company:",
          quality: "",
          dcNumber: "",
          grossWeight: item.grossWeightCompany,
          rate: item.rateCompany,
          amount: item.amountCompany,
          isDanaaExcessRow: true,
        };

        combinedData.push(danaaExcessRow);
      });
    }

    // Add Grand Total row
    const grandTotalRow = {
      _id: "grand-total",
      date: "Grand Total:",
      quality: "",
      dcNumber: "",
      grossWeight: null,
      rate: null,
      amount: (billDetail?.totalAmount || 0) + (billDetail?.amountCompany || 0),
      isGrandTotalRow: true,
    };
    combinedData.push(grandTotalRow);

    return combinedData;
  }, [data, billData, exceedData]);

  // Redefining columns to handle summary rows
  const customColumns = useMemo(
    () => [
      {
        header: "Date",
        accessorKey: "date",
        cell: ({ row: { original } }) => {
          if (original.isTotalRow)
            return <div className="font-bold">Total:</div>;
          if (original.isDanaaExcessRow)
            return <div className="font-bold">Danaa Excess from Company:</div>;
          if (original.isGrandTotalRow)
            return <div className="font-bold">Grand Total:</div>;
          if (original.isExtraRow) {
            return (
              <div
                className="font-bold whitespace-pre-line"
                dangerouslySetInnerHTML={{
                  __html: (original.date || "").replace(/\n/g, "<br/>"),
                }}
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
        },
      },
      {
        header: "Quality",
        accessorKey: "quality",
        cell: ({ row: { original } }) => {
          if (
            original.isTotalRow ||
            original.isExtraRow ||
            original.isDanaaExcessRow ||
            original.isGrandTotalRow
          ) {
            return <span className="font-bold">{original.quality || ""}</span>;
          }
          return original.quality;
        },
      },
      {
        header: "DC Number",
        accessorKey: "dcNumber",
        cell: ({ row: { original } }) => {
          if (
            original.isTotalRow ||
            original.isExtraRow ||
            original.isDanaaExcessRow ||
            original.isGrandTotalRow
          ) {
            return <span className="font-bold">{original.dcNumber || ""}</span>;
          }
          return original.dcNumber;
        },
      },
      {
        header: "Total Weight",
        accessorKey: "grossWeight",
        cell: ({ row: { original } }) => {
          const value = Number(original.grossWeight || 0).toFixed(2);
          if (
            original.isTotalRow ||
            original.isExtraRow ||
            original.isDanaaExcessRow ||
            original.isGrandTotalRow
          ) {
            return <span className="font-bold">{value}</span>;
          }
          if (original.isGrandTotalRow) return null;
          return value;
        },
      },
      {
        header: "Rate",
        accessorKey: "rate",
        cell: ({ row: { original } }) => {
          const value = Number(original.rate || 0).toFixed(2);
          if (
            original.isTotalRow ||
            original.isExtraRow ||
            original.isDanaaExcessRow ||
            original.isGrandTotalRow
          ) {
            return <span className="font-bold">{value}</span>;
          }
          return value;
        },
      },
      {
        header: "Amount",
        accessorKey: "amount",
        cell: ({ row: { original } }) => {
          const value = Number(
            original.amount !== undefined
              ? original.amount
              : original.totalAmount || 0,
          ).toFixed(2);
          if (
            original.isTotalRow ||
            original.isExtraRow ||
            original.isDanaaExcessRow ||
            original.isGrandTotalRow
          ) {
            return <span className="font-bold">{value}</span>;
          }
          return value;
        },
      },
      {
        header: "Action",
        id: "action",
        cell: ({ row: { original } }) => {
          // ✅ hide actions for summary rows
          if (
            original.isTotalRow ||
            original.isExtraRow ||
            original.isDanaaExcessRow ||
            original.isGrandTotalRow
          ) {
            return null;
          }
          // 🟢 normal rows → show buttons
          return actionButtons({ row: { original } });
        },
      },
    ],
    [actionButtons],
  );

  const handleMergeCustomerSelect = (customer: MergeCustomerOption) => {
    if (mergeTargetType === "walkingCustomer" && !customer.ref_no) {
      Swal.fire(
        "Ref No missing",
        "Selected walking customer does not have ref no.",
        "warning",
      );
      return;
    }

    if (mergeTargetType === "specificCustomer" && !customer._id) {
      Swal.fire(
        "Customer id missing",
        "Selected specific customer does not have user id.",
        "warning",
      );
      return;
    }

    setSelectedMergeCustomer(customer);
    setMergeSearch(customer.clientName || "");
    setShowMergeSuggestions(false);
  };

  const shouldShowWeightData = !!(
    userType &&
    userId &&
    userType !== "walkingCustomer"
  );
  const isDataAvailable = data && data.length > 0;

  return (
    <>
      <AdaptableCard className="h-full" bodyClass="h-full">
        <Dialog
          isOpen={viewOpen}
          onClose={onDialogClose}
          onRequestClose={onDialogClose}
        >
          <img className="h-96 w-96 mx-auto" src={selectedImg} alt="preview" />
        </Dialog>

        <Dialog
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onRequestClose={() => setIsEditModalOpen(false)}
        >
          {currentEditingItem && (
            <EditBillingForm
              item={currentEditingItem}
              onSave={handleSaveEditedItem}
              onCancel={() => setIsEditModalOpen(false)}
            />
          )}
        </Dialog>

        <Dialog
          isOpen={isWhatsAppDialogOpen}
          width={420}
          onClose={() => setIsWhatsAppDialogOpen(false)}
          onRequestClose={() => setIsWhatsAppDialogOpen(false)}
        >
          <div className="p-6">
            <div className="mb-4">
              <h4 className="text-lg font-semibold text-slate-900">
                Enter WhatsApp Number
              </h4>
              <p className="mt-1 text-sm text-slate-500">
                This client has no saved phone number. Enter a WhatsApp number
                to send the billing message.
              </p>
            </div>

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              WhatsApp Number
            </label>
            <input
              type="tel"
              value={manualWhatsAppPhone}
              onChange={(event) => setManualWhatsAppPhone(event.target.value)}
              placeholder="03001234567 or 923001234567"
              className="h-11 w-full rounded border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              autoFocus
            />

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsWhatsAppDialogOpen(false)}
                className="rounded border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => openWhatsAppWithPhone(manualWhatsAppPhone)}
                className="inline-flex items-center gap-2 rounded bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
              >
                <FaWhatsapp className="text-lg" />
                Send Bill
              </button>
            </div>
          </div>
        </Dialog>

        <div className="flex justify-between items-center my-6">
          {/* Left side buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => handleDownload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Download PDF
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="inline-flex items-center gap-2 px-4 py-2 rounded bg-emerald-700 text-white hover:bg-emerald-800"
            >
              <FaWhatsapp className="text-lg" />
              Share WhatsApp
            </button>

            <button
              onClick={() => GotoBill()}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Pay Bill
            </button>
          </div>

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
            ref_no,
          }}
          {...(shouldShowWeightData && { weightData })}
          billData={billData}
          dropDownOptions={[
            { value: "Bill", label: "Bill" },
            { value: "mergeBill", label: "Merge Bill" },
          ]}
          dropDownSelectedValue={productType}
          onChangeDropDown={onChangeDropDown}
        />

        <div className="mt-4 rounded border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-semibold text-slate-900">
                Bill Period
              </h4>
              <p className="mt-1 text-xs text-slate-500">
                Select one month or choose a month range for this bill.
              </p>
            </div>
            <span className="rounded bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              {billingPeriodLabel}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-[220px_1fr]">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">
                Period Type
              </label>
              <select
                value={billingPeriodMode}
                onChange={(event) => {
                  const nextMode = event.target.value;
                  setBillingPeriodMode(nextMode);

                  if (nextMode === "range") {
                    setFromMonth(selectedMonth);
                    setToMonth(selectedMonth);
                  }
                }}
                className="h-11 w-full rounded border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              >
                <option value="single">Single Month</option>
                <option value="range">Month Range</option>
              </select>
            </div>

            {!isRangePeriod ? (
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Month
                </label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(event) => setSelectedMonth(event.target.value)}
                  className="h-11 w-full rounded border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    From Month
                  </label>
                  <input
                    type="month"
                    value={fromMonth}
                    onChange={(event) => {
                      const nextFromMonth = event.target.value;
                      setFromMonth(nextFromMonth);

                      if (toMonth && nextFromMonth > toMonth) {
                        setToMonth(nextFromMonth);
                      }
                    }}
                    className="h-11 w-full rounded border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    To Month
                  </label>
                  <input
                    type="month"
                    value={toMonth}
                    min={fromMonth}
                    onChange={(event) => setToMonth(event.target.value)}
                    className="h-11 w-full rounded border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {productType === "mergeBill" && (
          <div className="mt-4 rounded border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3">
              <h4 className="text-sm font-semibold text-slate-900">
                Merge With{" "}
                {mergeTargetType === "walkingCustomer"
                  ? "Walking Customer"
                  : "Specific Customer"}
              </h4>
              <p className="mt-1 text-xs text-slate-500">
                Search and select the customer to include in this merged bill.
              </p>
            </div>

            <div className="relative max-w-xl">
              <input
                type="text"
                value={mergeSearch}
                onFocus={() => {
                  if (mergeSearch.trim()) {
                    setShowMergeSuggestions(true);
                  }
                }}
                onChange={(event) => {
                  setMergeSearch(event.target.value);
                  setSelectedMergeCustomer(null);
                  setShowMergeSuggestions(Boolean(event.target.value.trim()));
                }}
                placeholder={`Search ${
                  mergeTargetType === "walkingCustomer"
                    ? "walking customer"
                    : "specific customer"
                }`}
                className="h-11 w-full rounded border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />

              {showMergeSuggestions && mergeSearch.trim() && (
                <div className="absolute left-0 right-0 z-30 mt-2 max-h-64 overflow-auto rounded border border-slate-200 bg-white shadow-lg">
                  {mergeCustomerLoading ? (
                    <div className="px-4 py-3 text-sm text-slate-500">
                      Searching customers...
                    </div>
                  ) : mergeCustomerOptions.length > 0 ? (
                    mergeCustomerOptions.slice(0, 10).map((customer, index) => (
                      <button
                        key={`${customer._id || customer.ref_no || customer.clientName}-${index}`}
                        type="button"
                        onMouseDown={() => handleMergeCustomerSelect(customer)}
                        className="w-full border-b border-slate-100 px-4 py-3 text-left text-sm hover:bg-slate-50 last:border-b-0"
                      >
                        <span className="block font-semibold text-slate-800">
                          {customer.clientName || "Customer"}
                        </span>
                        <span className="block text-xs text-slate-500">
                          {[
                            customer.ref_no && `Ref No: ${customer.ref_no}`,
                            customer.billNo && `Bill No: ${customer.billNo}`,
                          ]
                            .filter(Boolean)
                            .join(" | ") || "-"}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-slate-500">
                      No customer found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

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
