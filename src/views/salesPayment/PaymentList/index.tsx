import { useCallback, useEffect, useMemo, useState } from "react";
import Table from "@/components/ui/Table";
import Button from "@/components/ui/Button";
import Dialog from "@/components/ui/Dialog";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import Notification from "@/components/ui/Notification";
import toast from "@/components/ui/toast";
import { useLocation } from "react-router-dom";
import {
  deleteSalesPayment,
  editSalesPayment,
  getCategorycustomers,
  getSalesLedgerYearly,
  getwalkingCustomers,
} from "@/services/GameManagement";
import ApiService from "@/services/ApiService";
import PaymentSalesForm, { FormModel, SetSubmitting } from "../Paymentform";
import html2pdf from "html2pdf.js/dist/html2pdf.bundle.min.js";
import { HiOutlinePencil, HiOutlineTrash } from "react-icons/hi";

const { Tr, Th, Td, THead, TBody } = Table;

type LedgerRow = {
  date: string;
  monthKey: string;
  description: string;
  folio: string;
  billNo?: string | number;
  dueOnDate?: string;
  paymentId?: string;
  paymentMethod?: "cash" | "bank" | "online" | "cheque" | "other";
  entryType?: string;
  debit: number;
  credit: number;
  balance: number;
};

type LedgerSummary = {
  year?: number;
  fromMonth?: string;
  toMonth?: string;
  openingBalance?: number;
  totalDebit?: number;
  totalCredit?: number;
  closingBalance?: number;
  finalBalance?: number;
};

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

const yearOptions = Array.from({ length: 8 }, (_, index) => {
  const year = new Date().getFullYear() - 5 + index;

  return {
    value: String(year),
    label: String(year),
  };
});

const formatDate = (date: string) => {
  if (!date) return "-";

  const d = new Date(date);

  return d.toLocaleDateString("en-GB");
};

const formatAmount = (amount: number) => {
  return Number(amount || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
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

const formatInputDate = (date: string) => {
  if (!date) return new Date().toISOString().slice(0, 10);

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return String(date).slice(0, 10);

  return parsedDate.toISOString().slice(0, 10);
};

const getRowType = (item: LedgerRow, index: number, rows: LedgerRow[]) => {
  const description = String(item?.description || "").toLowerCase();

  if (index === 0 || description.includes("opening balance")) return "opening";
  if (index === rows.length - 1 || description.includes("final total"))
    return "final";

  return "normal";
};

const PaymentList = () => {
  const location = useLocation();

  const {
    userType = "walkingCustomer",
    userId,
    userName,
    phoneNumber,
    billNo,
    ref_no,
  } = location.state || {};

  const currentYear = String(new Date().getFullYear());

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [fromMonth, setFromMonth] = useState("");
  const [toMonth, setToMonth] = useState("");
  const [ledgerData, setLedgerData] = useState<LedgerRow[]>([]);
  const [ledgerSummary, setLedgerSummary] = useState<LedgerSummary | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [editingPayment, setEditingPayment] = useState<LedgerRow | null>(null);
  const [deletingPayment, setDeletingPayment] = useState<LedgerRow | null>(
    null,
  );
  const [deletingPaymentId, setDeletingPaymentId] = useState("");
  const [ledgerType, setLedgerType] = useState("Bill");
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
  const isMergeLedger = ledgerType === "mergeBill";
  const mergeTargetType =
    currentUserType === "specificCustomer"
      ? "walkingCustomer"
      : "specificCustomer";

  const selectedPeriodLabel = useMemo(() => {
    if (fromMonth && toMonth) {
      return `${formatMonthLabel(fromMonth)} to ${formatMonthLabel(toMonth)}`;
    }

    if (toMonth) {
      return `Jan ${toMonth.slice(0, 4)} to ${formatMonthLabel(toMonth)}`;
    }

    if (fromMonth) {
      return `Jan ${fromMonth.slice(0, 4)} to ${formatMonthLabel(fromMonth)}`;
    }

    return selectedYear;
  }, [fromMonth, selectedYear, toMonth]);

  const openingRow = ledgerData[0];
  const finalRow = ledgerData[ledgerData.length - 1];
  const hasLedgerRows = ledgerData.length > 0;
  const displayOpeningBalance =
    ledgerSummary?.openingBalance ?? openingRow?.balance ?? 0;
  const displayTotalDebit = ledgerSummary?.totalDebit ?? finalRow?.debit ?? 0;
  const displayTotalCredit =
    ledgerSummary?.totalCredit ?? finalRow?.credit ?? 0;
  const displayClosingBalance =
    ledgerSummary?.closingBalance ??
    ledgerSummary?.finalBalance ??
    finalRow?.balance ??
    0;

  const canManagePayment = (item: LedgerRow) => {
    return Boolean(item.paymentId && Number(item.credit || 0) > 0);
  };

  const getPaymentInitialData = (item: LedgerRow): Partial<FormModel> => ({
    userId: userId || "",
    userType: userType || "walkingCustomer",
    clientName: userName || "",
    phoneNumber: phoneNumber || "",
    ref_no: ref_no || "",
    billNo: String(item.billNo || billNo || ""),
    dueOnDate: formatInputDate(item.dueOnDate || ""),
    folio: item.folio || "",
    date: formatInputDate(item.date || item.monthKey),
    amount: Number(item.credit || 0),
    paymentMethod: item.paymentMethod || "cash",
    description: item.description || "Payment received",
  });

  const ledgerRequestParams = useMemo(() => {
    const monthParams =
      fromMonth && toMonth
        ? { fromMonth, toMonth }
        : fromMonth
          ? { toMonth: fromMonth }
          : toMonth
            ? { toMonth }
            : {};

    const baseParams: Record<string, any> = {
      year: selectedYear,
      ...monthParams,
      product: ledgerType,
      userType: currentUserType,
      billNo,
      userName,
    };

    if (isMergeLedger) {
      if (!selectedMergeCustomer) {
        return null;
      }

      return {
        ...baseParams,
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
        ...baseParams,
        userId,
      };
    }

    return {
      ...baseParams,
      phoneNumber,
      ref_no,
    };
  }, [
    billNo,
    currentUserType,
    fromMonth,
    isMergeLedger,
    ledgerType,
    phoneNumber,
    ref_no,
    selectedMergeCustomer,
    selectedYear,
    toMonth,
    userId,
    userName,
  ]);

  const fetchLedger = useCallback(async () => {
    if (!ledgerRequestParams) {
      setLedgerData([]);
      setLedgerSummary(null);
      return;
    }

    try {
      setLoading(true);

      const response = await getSalesLedgerYearly({
        ...ledgerRequestParams,
        _t: Date.now(),
      });

      setLedgerData(response?.data?.data || []);
      setLedgerSummary(response?.data?.summary || null);
    } catch (error) {
      console.log("Ledger fetch error", error);
      setLedgerData([]);
      setLedgerSummary(null);
    } finally {
      setLoading(false);
    }
  }, [ledgerRequestParams]);

  useEffect(() => {
    fetchLedger();
  }, [fetchLedger]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedMergeSearch(mergeSearch.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [mergeSearch]);

  useEffect(() => {
    if (!isMergeLedger || !debouncedMergeSearch) {
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
  }, [debouncedMergeSearch, isMergeLedger, mergeTargetType]);

  const handleLedgerTypeChange = (value: string) => {
    setLedgerType(value);
    setMergeSearch("");
    setDebouncedMergeSearch("");
    setMergeCustomerOptions([]);
    setSelectedMergeCustomer(null);
    setShowMergeSuggestions(false);
  };

  const handleMergeCustomerSelect = (customer: MergeCustomerOption) => {
    if (mergeTargetType === "walkingCustomer" && !customer.ref_no) {
      toast.push(
        <Notification title="Ref No missing" type="warning" duration={2500}>
          Selected walking customer does not have ref no.
        </Notification>,
        { placement: "top-center" },
      );
      return;
    }

    if (mergeTargetType === "specificCustomer" && !customer._id) {
      toast.push(
        <Notification title="Customer id missing" type="warning" duration={2500}>
          Selected specific customer does not have user id.
        </Notification>,
        { placement: "top-center" },
      );
      return;
    }

    setSelectedMergeCustomer(customer);
    setMergeSearch(customer.clientName || "");
    setShowMergeSuggestions(false);
  };

  const handleEditPayment = async (
    values: FormModel,
    setSubmitting: SetSubmitting,
  ) => {
    if (!editingPayment?.paymentId) return;

    try {
      setSubmitting(true);

      await editSalesPayment(editingPayment.paymentId, {
        ...values,
        amount: Number(values.amount),
      });

      toast.push(
        <Notification
          title="Successfully updated"
          type="success"
          duration={2500}
        >
          Sales payment updated successfully
        </Notification>,
        { placement: "top-center" },
      );

      await fetchLedger();
      setEditingPayment(null);
    } catch (error) {
      console.log("Edit sales payment error", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePayment = async () => {
    if (!deletingPayment?.paymentId) return;

    try {
      setDeletingPaymentId(deletingPayment.paymentId);
      await deleteSalesPayment(deletingPayment.paymentId);

      toast.push(
        <Notification
          title="Successfully deleted"
          type="success"
          duration={2500}
        >
          Sales payment deleted successfully
        </Notification>,
        { placement: "top-center" },
      );

      await fetchLedger();
      setDeletingPayment(null);
    } catch (error) {
      console.log("Delete sales payment error", error);
    } finally {
      setDeletingPaymentId("");
    }
  };

  const handleDownloadLedgerPdf = async () => {
    let element: HTMLDivElement | null = null;

    try {
      setDownloadingPdf(true);

      const accountName = userName
        ? `${userName} Sales Ledger`
        : "Sales Ledger";
      const reportType =
        fromMonth && toMonth ? "range" : fromMonth || toMonth ? "monthly" : "yearly";
      const safeAccountName = accountName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      const filename = `${safeAccountName}-${selectedPeriodLabel
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")}.pdf`;

      const rows = ledgerData.length
        ? ledgerData
            .map((item, index) => {
              const rowType = getRowType(item, index, ledgerData);

              return `
                <tr class="${rowType === "normal" ? "" : `${rowType}-row`}">
                  <td>${formatDate(item?.date || item?.monthKey)}</td>
                  <td>${item.description || "-"}</td>
                  <td>${item.folio || "-"}</td>
                  <td>${item.billNo || "-"}</td>
                  <td>${item.dueOnDate ? formatDate(item.dueOnDate) : "-"}</td>
                  <td class="amount">${
                    item.debit ? formatAmount(item.debit) : "-"
                  }</td>
                  <td class="amount">${
                    item.credit ? formatAmount(item.credit) : "-"
                  }</td>
                  <td class="amount">${formatAmount(item.balance)}</td>
                </tr>
              `;
            })
            .join("")
        : `
          <tr>
            <td colspan="8" class="empty">No ledger data found</td>
          </tr>
        `;

      const htmlContent = `
        <div class="pdf-wrapper">
          <div class="top-header">
            <div>
              <h1>${accountName}</h1>
              <p>${selectedPeriodLabel} ${reportType} ledger report</p>
            </div>
            <div class="date-text">Period: ${selectedPeriodLabel}</div>
          </div>

          <table class="ledger-table">
            <colgroup>
              <col style="width: 10%;" />
              <col style="width: 38%;" />
              <col style="width: 6%;" />
              <col style="width: 8%;" />
              <col style="width: 8%;" />
              <col style="width: 10%;" />
              <col style="width: 10%;" />
              <col style="width: 10%;" />
            </colgroup>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Folio</th>
                <th>Bill No</th>
                <th>Due On</th>
                <th>Debit</th>
                <th>Credit</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        </div>
      `;

      element = document.createElement("div");
      element.innerHTML = htmlContent;

      const style = document.createElement("style");
      style.innerHTML = `
        .pdf-wrapper {
          padding: 28px 32px;
          font-family: Arial, Helvetica, sans-serif;
          color: #222;
          background: #fff;
        }

        .top-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
          gap: 20px;
        }

        .top-header h1 {
          font-size: 24px;
          margin: 0 0 6px;
          font-weight: 700;
        }

        .top-header p {
          margin: 0;
          font-size: 12px;
          color: #555;
        }

        .date-text {
          font-size: 18px;
          font-weight: 700;
          white-space: nowrap;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        .ledger-table {
          font-size: 11px;
          table-layout: fixed;
        }

        .ledger-table th,
        .ledger-table td {
          border: 1px solid #d8d8d8;
          padding: 8px 6px;
          word-break: break-word;
        }

        .ledger-table th {
          background: #eeeeee;
          font-weight: 700;
          text-transform: uppercase;
          text-align: center;
        }

        .ledger-table td {
          text-align: left;
        }

        .ledger-table th:nth-child(2),
        .ledger-table td:nth-child(2) {
          white-space: normal;
          line-height: 1.35;
        }

        .ledger-table .amount {
          text-align: right;
        }

        .ledger-table .empty {
          text-align: center;
          padding: 16px;
        }

        .ledger-table .opening-row td {
          background: #f8fafc;
          font-weight: 700;
        }

        .ledger-table .final-row td {
          background: #eef4ff;
          border-top: 2px solid #2563eb;
          font-weight: 700;
        }
      `;

      element.prepend(style);
      document.body.appendChild(element);

      await html2pdf()
        .from(element)
        .set({
          margin: 0.25,
          filename,
          image: {
            type: "jpeg",
            quality: 0.98,
          },
          html2canvas: {
            scale: 2,
            useCORS: true,
            backgroundColor: "#ffffff",
          },
          jsPDF: {
            unit: "in",
            format: "a4",
            orientation: "portrait",
          },
        })
        .save();
    } catch (error) {
      console.log("Ledger PDF download error", error);
    } finally {
      if (element && document.body.contains(element)) {
        document.body.removeChild(element);
      }

      setDownloadingPdf(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h3 className="text-gray-900">Sales Ledger</h3>
          <p className="text-sm text-gray-500 mt-1">
            {userName
              ? `${userName} ${isMergeLedger ? "merged " : ""}${
                  fromMonth && toMonth ? "range" : fromMonth || toMonth ? "monthly" : "yearly"
                } ledger report`
              : `${fromMonth && toMonth ? "Range" : fromMonth || toMonth ? "Monthly" : "Yearly"} ${isMergeLedger ? "merged " : ""}ledger report`}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3">
          <div className="w-[160px]">
            <label className="mb-1 block text-xs font-semibold text-gray-500">
              Ledger Type
            </label>
            <select
              value={ledgerType}
              onChange={(event) => handleLedgerTypeChange(event.target.value)}
              className="h-11 w-full rounded border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            >
              <option value="Bill">Single Ledger</option>
              <option value="mergeBill">Merge Ledger</option>
            </select>
          </div>

          <button
            onClick={handleDownloadLedgerPdf}
            disabled={loading || downloadingPdf}
            className={`px-4 py-2 rounded font-medium transition-all ${
              loading || downloadingPdf
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
            }`}
          >
            {downloadingPdf ? "Generating PDF..." : "Download Ledger"}
          </button>

          <div className="w-[160px]">
            <label className="mb-1 block text-xs font-semibold text-gray-500">
              From Month
            </label>
            <input
              type="month"
              value={fromMonth}
              onChange={(event) => {
                setFromMonth(event.target.value);
                if (event.target.value) {
                  setSelectedYear(event.target.value.slice(0, 4));
                }
              }}
              className="h-11 w-full rounded border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div className="w-[160px]">
            <label className="mb-1 block text-xs font-semibold text-gray-500">
              To Month
            </label>
            <input
              type="month"
              value={toMonth}
              onChange={(event) => {
                setToMonth(event.target.value);
                if (event.target.value) {
                  setSelectedYear(event.target.value.slice(0, 4));
                }
              }}
              className="h-11 w-full rounded border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div className="w-[130px]">
            <label className="mb-1 block text-xs font-semibold text-gray-500">
              Year
            </label>
            <select
              value={selectedYear}
              onChange={(event) => {
                setSelectedYear(event.target.value || currentYear);
                setFromMonth("");
                setToMonth("");
              }}
              className="h-11 w-full rounded border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            >
              {yearOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {(fromMonth || toMonth) && (
            <Button
              type="button"
              variant="default"
              onClick={() => {
                setFromMonth("");
                setToMonth("");
              }}
            >
              Clear Range
            </Button>
          )}
        </div>
      </div>

      {isMergeLedger && (
        <div className="mb-4 rounded border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3">
            <h4 className="text-sm font-semibold text-slate-900">
              Merge With{" "}
              {mergeTargetType === "walkingCustomer"
                ? "Walking Customer"
                : "Specific Customer"}
            </h4>
            <p className="mt-1 text-xs text-slate-500">
              Search and select the customer to include in this merged ledger.
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

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-4">
        <div className="rounded border border-gray-200 bg-white px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Opening Balance
          </p>
          <p className="mt-1 text-lg font-bold text-gray-900">
            {hasLedgerRows || ledgerSummary
              ? formatAmount(displayOpeningBalance)
              : "0.00"}
          </p>
        </div>
        <div className="rounded border border-gray-200 bg-white px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Total Debit
          </p>
          <p className="mt-1 text-lg font-bold text-red-600">
            {hasLedgerRows || ledgerSummary
              ? formatAmount(displayTotalDebit)
              : "0.00"}
          </p>
        </div>
        <div className="rounded border border-gray-200 bg-white px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Total Credit
          </p>
          <p className="mt-1 text-lg font-bold text-emerald-700">
            {hasLedgerRows || ledgerSummary
              ? formatAmount(displayTotalCredit)
              : "0.00"}
          </p>
        </div>
        <div className="rounded border border-gray-200 bg-white px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Closing Balance
          </p>
          <p className="mt-1 text-lg font-bold text-blue-700">
            {hasLedgerRows || ledgerSummary
              ? formatAmount(displayClosingBalance)
              : "0.00"}
          </p>
        </div>
      </div>

      <div className="rounded border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-4 py-3">
          <p className="text-sm font-semibold text-gray-900">
            Balance Sheet Statement
          </p>
          <p className="text-xs text-gray-500">{selectedPeriodLabel}</p>
        </div>

        <Table className="w-full table-fixed" hoverable={false}>
          <colgroup>
            <col className="w-[10%]" />
            <col className="w-[34%]" />
            <col className="w-[6%]" />
            <col className="w-[7%]" />
            <col className="w-[8%]" />
            <col className="w-[10%]" />
            <col className="w-[10%]" />
            <col className="w-[10%]" />
            <col className="w-[5%]" />
          </colgroup>

          <THead>
            <Tr className="bg-gray-50">
              <Th className="!text-left text-xs uppercase tracking-wide text-gray-500">
                Date
              </Th>
              <Th className="!text-left text-xs uppercase tracking-wide text-gray-500">
                Description
              </Th>
              <Th className="!text-center text-xs uppercase tracking-wide text-gray-500">
                Folio
              </Th>
              <Th className="!text-center text-xs uppercase tracking-wide text-gray-500">
                Bill No
              </Th>
              <Th className="!text-center text-xs uppercase tracking-wide text-gray-500">
                Due On
              </Th>
              <Th className="!text-right text-xs uppercase tracking-wide text-gray-500">
                Debit
              </Th>
              <Th className="!text-right text-xs uppercase tracking-wide text-gray-500">
                Credit
              </Th>
              <Th className="!text-right text-xs uppercase tracking-wide text-gray-500">
                Balance
              </Th>
              <Th className="!text-center text-xs uppercase tracking-wide text-gray-500">
                Action
              </Th>
            </Tr>
          </THead>

          <TBody>
            {loading ? (
              <Tr>
                <Td colSpan={9} className="py-8 text-center text-gray-500">
                  Loading ledger...
                </Td>
              </Tr>
            ) : ledgerData.length > 0 ? (
              ledgerData.map((item, index) => {
                const rowType = getRowType(item, index, ledgerData);
                const rowClassName =
                  rowType === "opening"
                    ? "bg-gray-50 font-semibold text-gray-900"
                    : rowType === "final"
                      ? "border-t-2 border-blue-600 bg-blue-50 font-bold text-gray-900"
                      : "text-gray-700";

                return (
                  <Tr key={index} className={rowClassName}>
                    <Td className="whitespace-nowrap !text-left text-gray-900">
                      {formatDate(item?.date || item?.monthKey)}
                    </Td>
                    <Td className="whitespace-normal break-words !text-left leading-5">
                      {item.description || "-"}
                    </Td>
                    <Td className="!text-center text-gray-700">
                      {item.folio || "-"}
                    </Td>
                    <Td className="!text-center text-gray-700">
                      {item.billNo || "-"}
                    </Td>
                    <Td className="!text-center text-gray-700">
                      {item.dueOnDate ? formatDate(item.dueOnDate) : "-"}
                    </Td>
                    <Td className="!text-right font-medium tabular-nums text-red-600">
                      {item.debit ? formatAmount(item.debit) : "-"}
                    </Td>
                    <Td className="!text-right font-medium tabular-nums text-emerald-700">
                      {item.credit ? formatAmount(item.credit) : "-"}
                    </Td>
                    <Td className="!text-right font-semibold tabular-nums text-blue-700">
                      {formatAmount(item.balance)}
                    </Td>
                    <Td className="!text-center">
                      {canManagePayment(item) ? (
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="xs"
                            type="button"
                            variant="default"
                            className="!border-slate-300 !bg-slate-100 !text-slate-700 !shadow-none hover:!border-slate-400 hover:!bg-slate-200 hover:!text-slate-900"
                            icon={<HiOutlinePencil />}
                            onClick={() => setEditingPayment(item)}
                          />
                          <Button
                            size="xs"
                            type="button"
                            variant="default"
                            className="!border-rose-200 !bg-rose-100 !text-rose-700 !shadow-none hover:!border-rose-300 hover:!bg-rose-200 hover:!text-rose-800"
                            icon={<HiOutlineTrash />}
                            loading={deletingPaymentId === item.paymentId}
                            onClick={() => setDeletingPayment(item)}
                          />
                        </div>
                      ) : (
                        "-"
                      )}
                    </Td>
                  </Tr>
                );
              })
            ) : (
              <Tr>
                <Td colSpan={9} className="py-8 text-center text-gray-500">
                  No ledger data found for {selectedPeriodLabel}
                </Td>
              </Tr>
            )}
          </TBody>
        </Table>
      </div>

      <Dialog
        isOpen={Boolean(editingPayment)}
        width={760}
        onClose={() => setEditingPayment(null)}
        onRequestClose={() => setEditingPayment(null)}
      >
        {editingPayment && (
          <PaymentSalesForm
            type="edit"
            userName={userName}
            userId={userId}
            userType={userType}
            initialData={getPaymentInitialData(editingPayment)}
            onFormSubmit={handleEditPayment}
            onDiscard={() => setEditingPayment(null)}
          />
        )}
      </Dialog>

      <ConfirmDialog
        isOpen={Boolean(deletingPayment)}
        type="danger"
        title="Delete sales payment"
        confirmText="Delete"
        confirmButtonColor="red-600"
        onCancel={() => setDeletingPayment(null)}
        onClose={() => setDeletingPayment(null)}
        onRequestClose={() => setDeletingPayment(null)}
        onConfirm={handleDeletePayment}
      >
        <p>
          This will remove the credit entry of{" "}
          <span className="font-semibold">
            {formatAmount(deletingPayment?.credit || 0)}
          </span>{" "}
          from the ledger.
        </p>
      </ConfirmDialog>
    </div>
  );
};

export default PaymentList;
