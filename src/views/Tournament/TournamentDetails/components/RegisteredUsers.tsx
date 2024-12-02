import {
  AdaptableCard,
  CellContext,
  ColumnDef,
  DataTable,
  DataTableResetHandle,
} from "@/components/shared";
import useThemeClass from "@/utils/hooks/useThemeClass";
import { useNavigate } from "react-router-dom";
import { HiOutlinePencil, HiOutlineTrash } from "react-icons/hi";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { StoreItem } from "@/@types/store";
import useListApi from "@/utils/hooks/useListApi";
import HeaderContent from "@/components/shared/HeaderContent";
import { ClubsGames } from "@/services/ClubService";

const RegisteredUsers = (props: any) => {
  // theme and navigation hook

  const url = `/adminTournamnet/tournamnetUsersList/${props.id}`;

  console.log("??AJAO??", props.id);
  const { textTheme } = useThemeClass();
  const navigate = useNavigate();

  // api hook
  // const listUrl = ClubsGames(props.id);
  // console.log(listUrl);
  const {
    pageIndex,
    pageSize,
    total,
    data,
    showDeleteDialog,
    loading,
    onPaginationChange,
    onPageSizeChange,
    onSort,
    onEditSearch,
    onDeleteDialogClose,
    onDeleteConfirm,
    handleDeleteClick,
    filter,
    setFilter,
  } = useListApi<any>(url, "", 10);

  // table ref
  console.log("DATA IS HERE", data);
  const tableRef = useRef<DataTableResetHandle>(null);
  useEffect(() => {
    console.log("props", props);
  }, []);
  // on edit item
  const handleEditClick = useCallback(
    (id: string) => () => {
      console.log(`item selected`, id);
      //navigate(`/app/sales/store-edit/${row._id}`)
    },
    []
  );

  // set filter
  const onChangeDropDown = (itemSelected: string) => {
    setFilter({ itemType: itemSelected });
  };

  // action button cell
  const actionButtons = (props: CellContext<StoreItem, unknown>) => {
    const { _id } = props.row.original;
    return (
      <div className="flex justify-end text-lg">
        <span
          className={`cursor-pointer p-2 hover:${textTheme}`}
          onClick={handleEditClick(_id)}
        >
          <HiOutlinePencil />
        </span>
        <span
          className="cursor-pointer p-2 hover:text-red-500"
          onClick={handleDeleteClick(_id)}
        >
          <HiOutlineTrash />
        </span>
      </div>
    );
  };

  // columns
  const columns: ColumnDef<StoreItem>[] = useMemo(
    () => [
      {
        header: "User Name",
        accessorKey: "userName",
      },
      {
        header: "User Code",
        accessorKey: "userCode",
      },
      {
        header: "Win Hand",
        accessorKey: "winHand",
      },
      {
        header: "Profit",
        accessorKey: "profit",
      },
      {
        header: "Total Hands",
        accessorKey: "totalHands",
      },
    ],
    []
  );

  return (
    <>
      <AdaptableCard className="h-full" bodyClass="h-full">
        <HeaderContent
          text="  Tournament Registered Users"
          addButtonText=""
          addLink=""
          showSearch={true}
          dropDownOptions={[]}
          dropDownSelectedValue={filter?.itemType ?? ""}
          onChangeDropDown={onChangeDropDown}
          onEditSearch={onEditSearch}
        />
        <DataTable
          ref={tableRef}
          columns={columns}
          data={data}
          loading={loading}
          pagingData={{
            total: total,
            pageIndex: pageIndex,
            pageSize: pageSize,
          }}
          onPaginationChange={onPaginationChange}
          onSelectChange={onPageSizeChange}
          onSort={onSort}
        />
      </AdaptableCard>
    </>
  );
};

export default RegisteredUsers;
