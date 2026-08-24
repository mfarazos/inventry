import { useEffect, useMemo, useRef, useState } from "react";
import {
  AdaptableCard,
  ColumnDef,
  DataTable,
  DataTableResetHandle,
} from "@/components/shared";
import { Input } from "@/components/ui";
import { HiOutlineSearch } from "react-icons/hi";
import { getReceivedFromVendorRef, deleteGameMode } from "@/services/GameManagement";
import useListApi from "@/utils/hooks/useListApi";

type VendorRow = {
  receivedFrom?: string;
  vendorRef?: string;
};

type VendorUserType = "walkingCustomer" | "specificCustomer";

const userTypeOptions: Array<{ value: VendorUserType; label: string }> = [
  { value: "walkingCustomer", label: "Walking Customer" },
  { value: "specificCustomer", label: "Specific Customer" },
];

const VendorPurchase = () => {
  const tableRef = useRef<DataTableResetHandle>(null);
  const [selectedUserType, setSelectedUserType] =
    useState<VendorUserType>("walkingCustomer");

  const {
    pageIndex,
    pageSize,
    total,
    data,
    loading,
    onPaginationChange,
    onPageSizeChange,
    onSort,
    onEditSearch,
    setFilter,
  } = useListApi<VendorRow>(
    getReceivedFromVendorRef(),
    deleteGameMode(),
    100,
  );

  useEffect(() => {
    setFilter({
      userType: selectedUserType,
    });
  }, [selectedUserType, setFilter]);

  const columns: ColumnDef<VendorRow>[] = useMemo(
    () => [
      {
        header: "Vendor Name",
        accessorKey: "receivedFrom",
        cell: ({ row: { original } }) => (
          <span className="font-semibold text-slate-800">
            {original.receivedFrom || "-"}
          </span>
        ),
      },
      {
        header: "Vendor Ref",
        accessorKey: "vendorRef",
        cell: ({ row: { original } }) => (
          <span className="font-medium text-slate-700">
            {original.vendorRef || "-"}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <AdaptableCard className="h-full" bodyClass="h-full">
      <div className="mb-5 rounded border border-slate-200 bg-white px-4 py-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">
              Vendor Purchase
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Search received-from vendors and view their vendor reference.
            </p>
          </div>

          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:w-auto lg:grid-cols-[260px_190px]">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Search
              </label>
              <Input
                size="sm"
                placeholder="Search vendor name"
                prefix={<HiOutlineSearch className="text-lg" />}
                onChange={onEditSearch}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Customer Type
              </label>
              <select
                value={selectedUserType}
                onChange={(event) =>
                  setSelectedUserType(event.target.value as VendorUserType)
                }
                className="h-9 w-full rounded border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              >
                {userTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <DataTable
        ref={tableRef}
        columns={columns}
        data={data}
        loading={loading}
        pagingData={{
          total,
          pageIndex,
          pageSize,
        }}
        onPaginationChange={onPaginationChange}
        onSelectChange={onPageSizeChange}
        onSort={onSort}
      />
    </AdaptableCard>
  );
};

export default VendorPurchase;
