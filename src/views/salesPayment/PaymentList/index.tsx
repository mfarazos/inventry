import { useEffect, useMemo, useState } from "react";
import Table from "@/components/ui/Table";
import Select from "@/components/ui/Select";
import { useLocation } from "react-router-dom";
import { getSalesLedgerYearly } from "@/services/GameManagement";
import html2pdf from "html2pdf.js/dist/html2pdf.bundle.min.js";

const { Tr, Th, Td, THead, TBody } = Table;

type LedgerRow = {
  date: string;
  monthKey: string;
  description: string;
  folio: string;
  billNo?: string | number;
  debit: number;
  credit: number;
  balance: number;
};

const yearOptions = Array.from({ length: 8 }, (_, index) => {
  const year = new Date().getFullYear() - 5 + index;

  return {
    value: String(year),
    label: String(year),
  };
});

const monthOptions = [
  { value: "", label: "All Months" },
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

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
  } = location.state || {};

  const currentYear = String(new Date().getFullYear());

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [ledgerData, setLedgerData] = useState<LedgerRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const selectedYearOption = useMemo(() => {
    return yearOptions.find((item) => item.value === selectedYear);
  }, [selectedYear]);

  const selectedMonthOption = useMemo(() => {
    return monthOptions.find((item) => item.value === selectedMonth);
  }, [selectedMonth]);

  const selectedPeriodLabel = useMemo(() => {
    const monthLabel = selectedMonthOption?.value
      ? `${selectedMonthOption.label} `
      : "";

    return `${monthLabel}${selectedYear}`;
  }, [selectedMonthOption, selectedYear]);

  const openingRow = ledgerData[0];
  const finalRow = ledgerData[ledgerData.length - 1];
  const hasLedgerRows = ledgerData.length > 0;

  const fetchLedger = async () => {
    try {
      setLoading(true);

      const response = await getSalesLedgerYearly({
        year: selectedYear,
        month: selectedMonth || undefined,
        userType,
        userId,
        phoneNumber,
        billNo,
      });

      setLedgerData(response?.data?.data || []);
    } catch (error) {
      console.log("Ledger fetch error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, [selectedYear, selectedMonth, userType, userId, phoneNumber, billNo]);

  const handleDownloadLedgerPdf = async () => {
    let element: HTMLDivElement | null = null;

    try {
      setDownloadingPdf(true);

      const accountName = userName
        ? `${userName} Sales Ledger`
        : "Sales Ledger";
      const reportType = selectedMonth ? "monthly" : "yearly";
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
            <td colspan="7" class="empty">No ledger data found</td>
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
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Folio</th>
                <th>Bill No</th>
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
              ? `${userName} ${
                  selectedMonth ? "monthly" : "yearly"
                } ledger report`
              : `${selectedMonth ? "Monthly" : "Yearly"} ledger report`}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3">
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

          <div className="w-[170px]">
            <Select
              placeholder="Select Month"
              options={monthOptions}
              value={selectedMonthOption}
              onChange={(option: any) => {
                setSelectedMonth(option?.value || "");
              }}
            />
          </div>

          <div className="w-[160px]">
            <Select
              placeholder="Select Year"
              options={yearOptions}
              value={selectedYearOption}
              onChange={(option: any) => {
                setSelectedYear(option?.value || currentYear);
              }}
            />
          </div>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded border border-gray-200 bg-white px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Opening Balance
          </p>
          <p className="mt-1 text-lg font-bold text-gray-900">
            {hasLedgerRows ? formatAmount(openingRow?.balance) : "0.00"}
          </p>
        </div>
        <div className="rounded border border-gray-200 bg-white px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Total Debit
          </p>
          <p className="mt-1 text-lg font-bold text-red-600">
            {hasLedgerRows ? formatAmount(finalRow?.debit) : "0.00"}
          </p>
        </div>
        <div className="rounded border border-gray-200 bg-white px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Closing Balance
          </p>
          <p className="mt-1 text-lg font-bold text-blue-700">
            {hasLedgerRows ? formatAmount(finalRow?.balance) : "0.00"}
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
            <col className="w-[12%]" />
            <col className="w-[28%]" />
            <col className="w-[8%]" />
            <col className="w-[10%]" />
            <col className="w-[14%]" />
            <col className="w-[14%]" />
            <col className="w-[14%]" />
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
                <Td colSpan={7} className="py-8 text-center text-gray-500">
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
                    <Td className="truncate !text-left">
                      {item.description || "-"}
                    </Td>
                    <Td className="!text-center text-gray-700">
                      {item.folio || "-"}
                    </Td>
                    <Td className="!text-center text-gray-700">
                      {item.billNo || "-"}
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
                <Td colSpan={7} className="py-8 text-center text-gray-500">
                  No ledger data found for {selectedPeriodLabel}
                </Td>
              </Tr>
            )}
          </TBody>
        </Table>
      </div>
    </div>
  );
};

export default PaymentList;
