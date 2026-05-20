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
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
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

const getLedgerMonth = (item: LedgerRow) => {
  const sourceDate = item?.date || item?.monthKey;

  if (!sourceDate) return "";

  const monthKeyMatch = String(sourceDate).match(/^\d{4}-(\d{2})/);

  if (monthKeyMatch) {
    return monthKeyMatch[1];
  }

  const date = new Date(sourceDate);

  if (Number.isNaN(date.getTime())) return "";

  return String(date.getMonth() + 1).padStart(2, "0");
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

  const filteredLedgerData = useMemo(() => {
    if (!selectedMonth) return ledgerData;

    return ledgerData.filter((item) => getLedgerMonth(item) === selectedMonth);
  }, [ledgerData, selectedMonth]);

  const selectedPeriodLabel = useMemo(() => {
    const monthLabel = selectedMonthOption?.value ? `${selectedMonthOption.label} ` : "";

    return `${monthLabel}${selectedYear}`;
  }, [selectedMonthOption, selectedYear]);

  const fetchLedger = async () => {
    try {
      setLoading(true);

      const response = await getSalesLedgerYearly({
        year: selectedYear,
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
  }, [selectedYear, userType, userId, phoneNumber, billNo]);

  const handleDownloadLedgerPdf = async () => {
    let element: HTMLDivElement | null = null;

    try {
      setDownloadingPdf(true);

      const accountName = userName ? `${userName} Sales Ledger` : "Sales Ledger";
      const reportType = selectedMonth ? "monthly" : "yearly";
      const safeAccountName = accountName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      const filename = `${safeAccountName}-${selectedPeriodLabel
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")}.pdf`;

      const rows = filteredLedgerData.length
        ? filteredLedgerData
            .map(
              (item) => `
                <tr>
                  <td>${formatDate(item?.date || item?.monthKey)}</td>
                  <td>${item.description || "-"}</td>
                  <td>${item.folio || "-"}</td>
                  <td class="amount">${item.debit ? formatAmount(item.debit) : "-"}</td>
                  <td class="amount">${item.credit ? formatAmount(item.credit) : "-"}</td>
                  <td class="amount">${formatAmount(item.balance)}</td>
                </tr>
              `
            )
            .join("")
        : `
          <tr>
            <td colspan="6" class="empty">No ledger data found</td>
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3>Sales Ledger</h3>
          <p className="text-sm text-gray-500 mt-1">
            {userName
              ? `${userName} ${selectedMonth ? "monthly" : "yearly"} ledger report`
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

      <Table>
        <THead>
          <Tr>
            <Th>Date</Th>
            <Th>Description</Th>
            <Th>Folio</Th>
            <Th>Debit</Th>
            <Th>Credit</Th>
            <Th>Balance</Th>
          </Tr>
        </THead>

        <TBody>
          {loading ? (
            <Tr>
              <Td colSpan={6}>Loading...</Td>
            </Tr>
          ) : filteredLedgerData.length > 0 ? (
            filteredLedgerData.map((item, index) => (
              <Tr key={index}>
                <Td>{formatDate(item?.date || item?.monthKey)}</Td>
                <Td>{item.description || "-"}</Td>
                <Td>{item.folio || "-"}</Td>
                <Td>{item.debit ? formatAmount(item.debit) : "-"}</Td>
                <Td>{item.credit ? formatAmount(item.credit) : "-"}</Td>
                <Td>{formatAmount(item.balance)}</Td>
              </Tr>
            ))
          ) : (
            <Tr>
              <Td colSpan={6}>No ledger data found for {selectedPeriodLabel}</Td>
            </Tr>
          )}
        </TBody>
      </Table>
    </div>
  );
};

export default PaymentList;
