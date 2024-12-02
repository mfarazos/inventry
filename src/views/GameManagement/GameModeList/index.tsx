import {
  AdaptableCard,
  CellContext,
  ColumnDef,
  DataTable,
  DataTableResetHandle,
} from "@/components/shared";
import useThemeClass from "@/utils/hooks/useThemeClass";
import { useNavigate } from "react-router-dom";
import {
  HiEye,
  HiLockClosed,
  HiLockOpen,
  HiOutlinePencil,
  HiOutlineTrash,
} from "react-icons/hi";
import { useCallback, useMemo, useRef, useState } from "react";
import { StoreItem } from "@/@types/store";
import useListApi from "@/utils/hooks/useListApi";
import HeaderContent from "@/components/shared/HeaderContent";
import {
  delGameMode,
  deleteGameMode,
  getGameModes,
} from "@/services/GameManagement";
import CustomConfirmDialog from "@/components/shared/CustomConfirmDialog";
import { storeItemTypesOptions } from "@/configs/dropdown.config";
import { Avatar, Dialog } from "@/components/ui";
import { FaLock, FaLockOpen, FaUnlockAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import { handleHttpReq } from "@/utils/HandleHttp";

function GameModeList() {
  // theme and navigation hook
  const { textTheme } = useThemeClass();
  const navigate = useNavigate();

  // api hook
  const listUrl = getGameModes();
  const deleteUrl = deleteGameMode();
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
    setData,
    setFilter,
  } = useListApi<any>(listUrl, deleteUrl, 10);

  // table ref
  const tableRef = useRef<DataTableResetHandle>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedImg, setSelectedImg] = useState<string>({} as string);

  const onViewOpen = (img: string) => {
    setSelectedImg(img);
    setViewOpen(true);
  };
  const onDialogClose = () => {
    setViewOpen(false);
    setTimeout(() => {
      setSelectedImg({} as string);
    }, 300);
  };
  // on edit item
  const handleEditClick = useCallback(
    (id: string) => () => {
      console.log(`item selected`, id);
      navigate(`/editGameMode/${id}`);
    },
    []
  );

 
  // set filter
  const onChangeDropDown = (itemSelected: string) => {
    setFilter({ itemType: itemSelected });
  };

  const onDelete = useCallback(
    (id: string) => async () => {
      // console.log(`item selected`, id);
      // navigate(`/editGameMode/${id}`);
      const abc = await Swal.fire({
        title: "Warning !",
        text: `are shure you want to delete?`,
        icon: "warning",
        confirmButtonText: "yes",
      });
      if (abc.isConfirmed) {
        const result = await delGameMode(id);
        const listData = result.data?.data;
        console.log("LIST DATA", listData);
        setData(listData);
      }

      // console.log("SELECTED ITEM DELETE", result);
      // setData(result.data?.data);
    },
    []
  );

  // action button cell
  const actionButtons = (props: CellContext<StoreItem, unknown>) => {
    console.log("ID is here", props.row.original._id);
    const { _id } = props.row.original;
    //   const { isActive } = props.row.original;

    return (
      <div className="flex justify-end text-lg">
        {/* <span
            className={`cursor-pointer p-2 hover:${textTheme}`}
            onClick={() => {
              onViewOpen(image);
            }}
          >
            <HiEye />
          </span> */}
        <span
          className={`cursor-pointer p-2 hover:${textTheme}`}
          onClick={handleEditClick(_id)}
        >
          <HiOutlinePencil />
        </span>
        <span
          className="cursor-pointer p-2 hover:text-red-500"
          onClick={onDelete(_id)}
        >
          <HiOutlineTrash />
        </span>
        {/* <span
            className="cursor-pointer p-2 hover:text-red-500"
            onClick={handleDeleteClick(_id)}
          >
            <HiOutlineTrash />
          </span> */}
        {/* <span
            className="cursor-pointer p-2 hover:text-red-500"
            onClick={handleBan(_id, isActive)}
          >
            {isActive ? <HiLockOpen /> : <HiLockClosed />}
          </span> */}
      </div>
    );
  };

  // columns
  const columns: ColumnDef<StoreItem>[] = useMemo(
    () => [
      {
        header: "Company Account",
        accessorKey: "bigBlind",
      },
      {
        header: "Dana Receipt Weight",
        accessorKey: "smallBlind",
      },
      {
        header: "Quality",
        accessorKey: "buyInRange",
      },
      {
        header: "Quantity",
        accessorKey: "buyInRange",
      },

      {
        header: "Received From",
        accessorKey: "buyInRange",
      },

      {
        header: "Bill No",
        accessorKey: "buyInRange",
      },

      {
        header: "Dana Received Name",
        accessorKey: "buyInRange",
      },

      {
        header: "",
        id: "action",
        cell: actionButtons,
      },
    ],
    []
  );

  // main view
  return (
    <>
      <AdaptableCard className="h-full" bodyClass="h-full">
        <Dialog
          isOpen={viewOpen}
          onClose={onDialogClose}
          onRequestClose={onDialogClose}
        >
          <img
            className="h-96 w-96 block mx-auto"
            src={selectedImg}
            alt={"abc"}
          />
        </Dialog>
        <HeaderContent
          text="Company Account"
          addButtonText="Add Company Data"
          addLink="/creategamemodes"
          showSearch={false}
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
      <CustomConfirmDialog
        title="Store Item"
        isOpen={showDeleteDialog}
        onDialogClose={onDeleteDialogClose}
        onDeleteConfirm={onDeleteConfirm}
      />
    </>
  );
}

export default GameModeList;
