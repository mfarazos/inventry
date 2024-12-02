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
import { tournamentOption } from "@/configs/dropdown.config";

const clubGames = (props: any) => {
  // theme and navigation hook
  const { textTheme } = useThemeClass();
  const navigate = useNavigate();

  // api hook
  const listUrl = ClubsGames(props.id);
  console.log(listUrl);
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
  } = useListApi<any>(listUrl, "", 10);

  // table ref
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
        header: "tableCode",
        accessorKey: "tableCode",
      },
      {
        header: "bigBlind",
        accessorKey: "bigBlind",
      },
      {
        header: "smallBlind",
        accessorKey: "smallBlind",
      },
      {
        header: "tableStatus",
        accessorKey: "tableStatus",
      },
      {
        header: "tableDurate",
        accessorKey: "tableDurate",
      },
    ],
    []
  );

  return (
    <>
      <AdaptableCard className="h-full" bodyClass="h-full">
        <HeaderContent
          text="  Club Games"
          addButtonText=""
          addLink=""
          showSearch={true}
          dropDownOptions={tournamentOption}
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

export default clubGames;
