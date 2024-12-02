import {
  AdaptableCard,
  CellContext,
  ColumnDef,
  DataTable,
  DataTableResetHandle,
} from "@/components/shared";
import useThemeClass from "@/utils/hooks/useThemeClass";
import { Link, useNavigate } from "react-router-dom";
import { HiOutlinePencil, HiOutlineTrash } from "react-icons/hi";
import { useCallback, useMemo, useRef } from "react";
import { StoreItem } from "@/@types/store";
import useListApi from "@/utils/hooks/useListApi";
import HeaderContent from "@/components/shared/HeaderContent";
import { listLeaderBoard } from "@/services/LeaderBoardService";
import CustomConfirmDialog from "@/components/shared/CustomConfirmDialog";
import {
  dayTypeOptions,
  storeItemTypesOptions,
} from "@/configs/dropdown.config";
import Avatar from "@/components/ui/Avatar";
import { DAY_OPTIONS } from "@/constants/app.constant";

function Leaderboard() {
  // theme and navigation hook
  const { textTheme } = useThemeClass();
  const navigate = useNavigate();

  // api hook
  const listUrl = listLeaderBoard();

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
  } = useListApi<StoreItem>(listUrl, "");

  // table ref
  console.log(data);

  const tableRef = useRef<DataTableResetHandle>(null);

  const NameColumn = ({ row }: any) => {
    const { textTheme } = useThemeClass();

    return (
      <div className="flex items-center">
        <Avatar
          size={28}
          shape="circle"
          src={
            row?.user?.profileImage ||
            "https://dominoes-images-preprod.s3.ap-southeast-1.amazonaws.com/prcuxueo0yld8vz0ja1674483047542.jpg"
          }
        />
        <Link
          className={`hover:${textTheme} ml-2 rtl:mr-2 font-semibold`}
          to={`/account/settings/${row?._id}`}
        >
          {row.user?.userName}
        </Link>
      </div>
    );
  };

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
    console.log(itemSelected);

    setFilter({ filterType: itemSelected });
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
        header: "userName",
        accessorKey: "user.userName",
        cell: (props) => {
          const row = props.row.original;
          return <NameColumn row={row} />;
        },
      },
      {
        header: "Country",
        accessorKey: "user.country",
      },
      {
        header: "total Wins",
        accessorKey: "wins",
      },
      {
        header: "coins",
        accessorKey: "user.coins",
      },
    ],
    []
  );

  // main view
  return (
    <>
      <AdaptableCard className="h-full" bodyClass="h-full">
        <HeaderContent
          text="LeaderBoard"
          addButtonText=""
          addLink=""
          // showSearch={true}
          dropDownOptions={dayTypeOptions}
          dropDownSelectedValue={filter?.filterType ?? DAY_OPTIONS.MONTHLY}
          onChangeDropDown={onChangeDropDown}
          onEditSearch={onEditSearch}
          isLeaderBorad={true}
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
          // onSort={onSort}
        />
      </AdaptableCard>
      <CustomConfirmDialog
        title="LeaderBoard"
        isOpen={showDeleteDialog}
        onDialogClose={onDeleteDialogClose}
        onDeleteConfirm={onDeleteConfirm}
      />
    </>
  );
}

export default Leaderboard;
