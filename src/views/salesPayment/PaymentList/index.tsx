import { useEffect, useMemo, useState } from "react";
import Table from "@/components/ui/Table";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { useLocation } from "react-router-dom";
import { getSalesLedgerYearly } from "@/services/GameManagement";

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
  const [ledgerData, setLedgerData] = useState<LedgerRow[]>([]);
  const [loading, setLoading] = useState(false);

  const selectedYearOption = useMemo(() => {
    return yearOptions.find((item) => item.value === selectedYear);
  }, [selectedYear]);

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

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3>Sales Ledger</h3>
          <p className="text-sm text-gray-500 mt-1">
            {userName ? `${userName} yearly ledger report` : "Yearly ledger report"}
          </p>
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
          ) : ledgerData.length > 0 ? (
            ledgerData.map((item, index) => (
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
              <Td colSpan={6}>No ledger data found</Td>
            </Tr>
          )}
        </TBody>
      </Table>
    </div>
  );
};

export default PaymentList;