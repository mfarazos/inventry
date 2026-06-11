import { useCallback, useEffect, useMemo, useState } from "react";
import Table from "@/components/ui/Table";
import Button from "@/components/ui/Button";
import Notification from "@/components/ui/Notification";
import toast from "@/components/ui/toast";
import { getSalesLedgerYearly } from "@/services/GameManagement";

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

const LedgerSummary = () => {
  const [periodType, setPeriodType] = useState("month");
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [fromMonth, setFromMonth] = useState(currentMonth);
  const [toMonth, setToMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [ledgerData, setLedgerData] = useState<LedgerSummaryRow[]>([]);
  const [summary, setSummary] = useState<LedgerSummaryTotals | null>(null);
  const [loading, setLoading] = useState(false);

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
        userType: "all",
        year: selectedYear,
      };
    }

    if (periodType === "range") {
      return {
        userType: "all",
        fromMonth,
        toMonth: toMonth || fromMonth,
      };
    }

    return {
      userType: "all",
      fromMonth: selectedMonth,
      toMonth: selectedMonth,
    };
  }, [fromMonth, periodType, selectedMonth, selectedYear, toMonth]);

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

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-gray-900">Ledger Summary</h3>
          <p className="mt-1 text-sm text-gray-500">
            Overall ledger summary for all clients - {periodLabel}
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-3">
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
            statement for all clients
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
