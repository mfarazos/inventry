import { useCallback, useEffect, useMemo, useState } from "react";
import Table from "@/components/ui/Table";
import Button from "@/components/ui/Button";
import Notification from "@/components/ui/Notification";
import toast from "@/components/ui/toast";
import { getSalesLedgerYearly } from "@/services/GameManagement";
import html2pdf from "html2pdf.js/dist/html2pdf.bundle.min.js";

const { Tr, Th, Td, THead, TBody } = Table;

type LedgerSummaryRow = {
  date: string;
  clientName?: string;
  userType?: string;
  customer?: {
    clientName?: string;
    userType?: string;
  };
  description: string;
  folio?: string;
  dueOnDate?: string;
  ref_no?: string;
  debit: number;
  credit: number;
  balance: number;
  entryType?: string;
};

type LedgerSummaryTotals = {
  year?: number;
  fromMonth?: string;
  toMonth?: string;
  openingBalance?: number;
  totalDebit?: number;
  totalCredit?: number;
  closingBalance?: number;
  finalBalance?: number;
};

const currentDate = new Date();
const currentYear = String(currentDate.getFullYear());
const currentMonth = currentDate.toISOString().slice(0, 7);

const yearOptions = Array.from({ length: 8 }, (_, index) => {
  const year = currentDate.getFullYear() - 5 + index;

  return {
    value: String(year),
    label: String(year),
  };
});

const formatDate = (date?: string) => {
  if (!date) return "-";

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return "-";

  return parsedDate.toLocaleDateString("en-GB");
};

const formatAmount = (amount?: number) => {
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

const getRowType = (
  item: LedgerSummaryRow,
  index: number,
  rows: LedgerSummaryRow[],
) => {
  const description = String(item?.description || "").toLowerCase();

  if (index === 0 || description.includes("opening balance")) return "opening";
  if (index === rows.length - 1 || description.includes("final total")) {
    return "final";
  }

  return "normal";
};

const getClientName = (item: LedgerSummaryRow) => {
  return item.clientName || item.customer?.clientName || "-";
};

const getClientTypeLabel = (item: LedgerSummaryRow) => {
  const rowUserType = String(item.userType || item.customer?.userType || "")
    .trim()
    .toLowerCase();

  if (rowUserType === "walkingcustomer") return "W";
  if (rowUserType === "specificcustomer") return "S";

  return "-";
};

const getClientTypeFilterLabel = (value: string) => {
  if (value === "walkingCustomer") return "Walking Clients";
  if (value === "specificCustomer") return "Extruding Clients";

  return "All Clients";
};

const getMaterialTypeLabel = (value: string) => {
  if (value === "poleythene") return "PE";
  if (value === "hydensity") return "HD";

  return "All Materials";
};

const LedgerSummary = () => {
  const [periodType, setPeriodType] = useState("month");
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [fromMonth, setFromMonth] = useState(currentMonth);
  const [toMonth, setToMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [materialType, setMaterialType] = useState("all");
  const [clientType, setClientType] = useState("all");
  const [ledgerData, setLedgerData] = useState<LedgerSummaryRow[]>([]);
  const [summary, setSummary] = useState<LedgerSummaryTotals | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const periodLabel = useMemo(() => {
    if (periodType === "year") return selectedYear;
    if (periodType === "range") {
      return `${formatMonthLabel(fromMonth)} to ${formatMonthLabel(
        toMonth || fromMonth,
      )}`;
    }

    return formatMonthLabel(selectedMonth);
  }, [fromMonth, periodType, selectedMonth, selectedYear, toMonth]);

  const requestParams = useMemo(() => {
    if (periodType === "year") {
      return {
        userType: clientType,
        customerProduct: materialType,
        year: selectedYear,
      };
    }

    if (periodType === "range") {
      return {
        userType: clientType,
        customerProduct: materialType,
        fromMonth,
        toMonth: toMonth || fromMonth,
      };
    }

    return {
      userType: clientType,
      customerProduct: materialType,
      fromMonth: selectedMonth,
      toMonth: selectedMonth,
    };
  }, [clientType, fromMonth, materialType, periodType, selectedMonth, selectedYear, toMonth]);

  const displayOpeningBalance = summary?.openingBalance ?? 0;
  const displayTotalDebit = summary?.totalDebit ?? 0;
  const displayTotalCredit = summary?.totalCredit ?? 0;
  const displayClosingBalance =
    summary?.closingBalance ?? summary?.finalBalance ?? 0;

  const fetchLedgerSummary = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getSalesLedgerYearly({
        ...requestParams,
        _t: Date.now(),
      });

      setLedgerData(response?.data?.data || []);
      setSummary(response?.data?.summary || null);
    } catch (error) {
      console.log("All clients ledger summary error", error);
      setLedgerData([]);
      setSummary(null);
      toast.push(
        <Notification title="Unable to fetch ledger" type="danger">
          Please try again.
        </Notification>,
        { placement: "top-center" },
      );
    } finally {
      setLoading(false);
    }
  }, [requestParams]);

  useEffect(() => {
    fetchLedgerSummary();
  }, [fetchLedgerSummary]);

  const handleDownloadPdf = async () => {
    let element: HTMLDivElement | null = null;

    try {
      setDownloadingPdf(true);

      const clientLabel = getClientTypeFilterLabel(clientType);
      const materialLabel = getMaterialTypeLabel(materialType);
      const filename = `ledger-summary-${periodLabel}-${materialLabel}-${clientLabel}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      const rows = ledgerData.length
        ? ledgerData
            .map((item, index) => {
              const rowType = getRowType(item, index, ledgerData);

              return `
                <tr class="${rowType === "normal" ? "" : `${rowType}-row`}">
                  <td>${formatDate(item.date)}</td>
                  <td>${getClientName(item)}</td>
                  <td class="center">${getClientTypeLabel(item)}</td>
                  <td class="description">${item.description || "-"}</td>
                  <td class="center">${item.folio || "-"}</td>
                  <td class="center">${item.dueOnDate ? formatDate(item.dueOnDate) : "-"}</td>
                  <td class="amount">${item.debit ? formatAmount(item.debit) : "-"}</td>
                  <td class="amount">${item.credit ? formatAmount(item.credit) : "-"}</td>
                  <td class="amount">${formatAmount(item.balance)}</td>
                </tr>
              `;
            })
            .join("")
        : '<tr><td colspan="9" class="empty">No ledger summary found</td></tr>';

      element = document.createElement("div");
      element.innerHTML = `
        <style>
          .ledger-summary-pdf { padding: 24px; font-family: Arial, sans-serif; color: #1f2937; background: #fff; }
          .pdf-header { display: flex; justify-content: space-between; gap: 20px; margin-bottom: 18px; }
          .pdf-header h1 { margin: 0 0 5px; font-size: 22px; }
          .pdf-header p { margin: 0; color: #64748b; font-size: 11px; }
          .pdf-period { font-size: 13px; font-weight: 700; text-align: right; }
          .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 16px; }
          .summary-item { border: 1px solid #dbe2ea; padding: 9px; }
          .summary-item span { display: block; color: #64748b; font-size: 9px; text-transform: uppercase; margin-bottom: 4px; }
          .summary-item strong { font-size: 13px; }
          table { width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 9px; }
          col.date { width: 8%; } col.client { width: 14%; } col.type { width: 4%; }
          col.description { width: 34%; } col.folio { width: 5%; } col.due { width: 7%; }
          col.amount { width: 9.33%; }
          th, td { border: 1px solid #d8dee7; padding: 6px 4px; vertical-align: top; word-break: break-word; }
          th { background: #f1f5f9; text-align: center; text-transform: uppercase; font-size: 8px; }
          td.amount { text-align: right; white-space: nowrap; }
          td.center { text-align: center; }
          td.description { line-height: 1.35; }
          .opening-row td { background: #f8fafc; font-weight: 700; }
          .final-row td { background: #eff6ff; border-top: 2px solid #475569; font-weight: 700; }
          .empty { padding: 16px; text-align: center; }
          tr { page-break-inside: avoid; break-inside: avoid; }
          thead { display: table-header-group; }
        </style>
        <div class="ledger-summary-pdf">
          <div class="pdf-header">
            <div>
              <h1>Ledger Summary</h1>
              <p>${clientLabel} | ${materialLabel}</p>
            </div>
            <div class="pdf-period">Period: ${periodLabel}</div>
          </div>
          <div class="summary-grid">
            <div class="summary-item"><span>Opening Balance</span><strong>${formatAmount(displayOpeningBalance)}</strong></div>
            <div class="summary-item"><span>Total Debit</span><strong>${formatAmount(displayTotalDebit)}</strong></div>
            <div class="summary-item"><span>Total Credit</span><strong>${formatAmount(displayTotalCredit)}</strong></div>
            <div class="summary-item"><span>Closing Balance</span><strong>${formatAmount(displayClosingBalance)}</strong></div>
          </div>
          <table>
            <colgroup>
              <col class="date"/><col class="client"/><col class="type"/><col class="description"/>
              <col class="folio"/><col class="due"/><col class="amount"/><col class="amount"/><col class="amount"/>
            </colgroup>
            <thead><tr><th>Date</th><th>Client Name</th><th>Type</th><th>Description</th><th>Folio</th><th>Due On</th><th>Debit</th><th>Credit</th><th>Balance</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      `;

      document.body.appendChild(element);
      await html2pdf()
        .from(element)
        .set({
          margin: 0.2,
          filename: `${filename}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
          jsPDF: { unit: "in", format: "a4", orientation: "landscape" },
          pagebreak: { mode: ["css", "legacy"], avoid: "tr" },
        })
        .save();
    } catch (error) {
      console.log("Ledger summary PDF error", error);
      toast.push(
        <Notification title="Unable to download PDF" type="danger">
          Please try again.
        </Notification>,
        { placement: "top-center" },
      );
    } finally {
      if (element && document.body.contains(element)) {
        document.body.removeChild(element);
      }
      setDownloadingPdf(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-gray-900">Ledger Summary</h3>
          <p className="mt-1 text-sm text-gray-500">
            Overall ledger summary for {getClientTypeFilterLabel(clientType).toLowerCase()} - {periodLabel}
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="w-[150px]">
            <label className="mb-1 block text-xs font-semibold text-gray-500">
              Material Type
            </label>
            <select
              value={materialType}
              onChange={(event) => setMaterialType(event.target.value)}
              className="h-11 w-full rounded border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            >
              <option value="all">All</option>
              <option value="poleythene">PE</option>
              <option value="hydensity">HD</option>
            </select>
          </div>

          <div className="w-[170px]">
            <label className="mb-1 block text-xs font-semibold text-gray-500">
              Client Type
            </label>
            <select
              value={clientType}
              onChange={(event) => setClientType(event.target.value)}
              className="h-11 w-full rounded border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            >
              <option value="all">All</option>
              <option value="walkingCustomer">Walking Client</option>
              <option value="specificCustomer">Extruding Client</option>
            </select>
          </div>

          <div className="w-[160px]">
            <label className="mb-1 block text-xs font-semibold text-gray-500">
              Summary Type
            </label>
            <select
              value={periodType}
              onChange={(event) => {
                const nextPeriodType = event.target.value;
                setPeriodType(nextPeriodType);

                if (nextPeriodType === "range") {
                  setFromMonth(selectedMonth);
                  setToMonth(selectedMonth);
                }
              }}
              className="h-11 w-full rounded border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            >
              <option value="month">Monthly</option>
              <option value="range">Month Range</option>
              <option value="year">Yearly</option>
            </select>
          </div>

          {periodType === "month" ? (
            <div className="w-[170px]">
              <label className="mb-1 block text-xs font-semibold text-gray-500">
                Month
              </label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(event) => setSelectedMonth(event.target.value)}
                className="h-11 w-full rounded border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>
          ) : periodType === "range" ? (
            <>
              <div className="w-[170px]">
                <label className="mb-1 block text-xs font-semibold text-gray-500">
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
                  className="h-11 w-full rounded border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div className="w-[170px]">
                <label className="mb-1 block text-xs font-semibold text-gray-500">
                  To Month
                </label>
                <input
                  type="month"
                  value={toMonth}
                  min={fromMonth}
                  onChange={(event) => setToMonth(event.target.value)}
                  className="h-11 w-full rounded border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
              </div>
            </>
          ) : (
            <div className="w-[130px]">
              <label className="mb-1 block text-xs font-semibold text-gray-500">
                Year
              </label>
              <select
                value={selectedYear}
                onChange={(event) => setSelectedYear(event.target.value)}
                className="h-11 w-full rounded border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              >
                {yearOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <Button
            type="button"
            variant="default"
            loading={loading}
            onClick={fetchLedgerSummary}
          >
            Refresh
          </Button>

          <Button
            type="button"
            variant="solid"
            loading={downloadingPdf}
            disabled={loading || downloadingPdf}
            onClick={handleDownloadPdf}
          >
            {downloadingPdf ? "Generating PDF..." : "Download PDF"}
          </Button>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-4">
        <div className="rounded border border-gray-200 bg-white px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Opening Balance
          </p>
          <p className="mt-1 text-lg font-bold text-gray-900">
            {formatAmount(displayOpeningBalance)}
          </p>
        </div>
        <div className="rounded border border-gray-200 bg-white px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Total Debit
          </p>
          <p className="mt-1 text-lg font-bold text-red-600">
            {formatAmount(displayTotalDebit)}
          </p>
        </div>
        <div className="rounded border border-gray-200 bg-white px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Total Credit
          </p>
          <p className="mt-1 text-lg font-bold text-emerald-700">
            {formatAmount(displayTotalCredit)}
          </p>
        </div>
        <div className="rounded border border-gray-200 bg-white px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Closing Balance
          </p>
          <p className="mt-1 text-lg font-bold text-blue-700">
            {formatAmount(displayClosingBalance)}
          </p>
        </div>
      </div>

      <div className="rounded border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-4 py-3">
          <p className="text-sm font-semibold text-gray-900">
            Overall Ledger
          </p>
          <p className="text-xs text-gray-500">
            {periodType === "month"
              ? "Monthly"
              : periodType === "range"
                ? "Range"
                : "Yearly"}{" "}
            statement for {getClientTypeFilterLabel(clientType).toLowerCase()} | {getMaterialTypeLabel(materialType)}
          </p>
        </div>

        <div className="overflow-x-auto">
          <Table className="min-w-[1180px] table-fixed" hoverable={false}>
            <colgroup>
              <col className="w-[9%]" />
              <col className="w-[15%]" />
              <col className="w-[5%]" />
              <col className="w-[34%]" />
              <col className="w-[6%]" />
              <col className="w-[7%]" />
              <col className="w-[8%]" />
              <col className="w-[8%]" />
              <col className="w-[8%]" />
            </colgroup>

            <THead>
              <Tr className="bg-gray-50">
                <Th className="!text-left text-xs uppercase tracking-wide text-gray-500">
                  Date
                </Th>
                <Th className="!text-left text-xs uppercase tracking-wide text-gray-500">
                  Client Name
                </Th>
                <Th className="!text-center text-xs uppercase tracking-wide text-gray-500">
                  Type
                </Th>
                <Th className="!text-left text-xs uppercase tracking-wide text-gray-500">
                  Description
                </Th>
                <Th className="!text-center text-xs uppercase tracking-wide text-gray-500">
                  Folio
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
              </Tr>
            </THead>

            <TBody>
              {loading ? (
                <Tr>
                  <Td colSpan={9} className="py-8 text-center text-gray-500">
                    Loading ledger summary...
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
                    <Tr key={`${item.entryType || "row"}-${index}`} className={rowClassName}>
                      <Td className="whitespace-nowrap !text-left text-gray-900">
                        {formatDate(item.date)}
                      </Td>
                      <Td className="!text-left text-gray-800">
                        {getClientName(item)}
                      </Td>
                      <Td className="!text-center text-gray-700">
                        <span className="inline-flex h-6 min-w-6 items-center justify-center rounded bg-slate-100 px-2 text-xs font-bold text-slate-700">
                          {getClientTypeLabel(item)}
                        </span>
                      </Td>
                      <Td className="whitespace-normal break-words !text-left leading-5">
                        {item.description || "-"}
                      </Td>
                      <Td className="!text-center text-gray-700">
                        {item.folio || "-"}
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
                    </Tr>
                  );
                })
              ) : (
                <Tr>
                  <Td colSpan={9} className="py-8 text-center text-gray-500">
                    No ledger summary found for {periodLabel}
                  </Td>
                </Tr>
              )}
            </TBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default LedgerSummary;
