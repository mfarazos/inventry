import {
  AdaptableCard,
  CellContext,
  ColumnDef,
  DataTable,
  DataTableResetHandle,
} from "@/components/shared";
import useThemeClass from "@/utils/hooks/useThemeClass";
import Avatar from "@/components/ui/Avatar";
import { Link, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {
  HiLockClosed,
  HiLockOpen,
  HiOutlineEye,
  HiOutlinePencil,
  HiOutlineTrash,
} from "react-icons/hi";
import { useCallback, useMemo, useRef } from "react";
import { StoreItem } from "@/@types/store";
import useListApi from "@/utils/hooks/useListApi";
import HeaderContent from "@/components/shared/HeaderContent";
import { deleteUser, listUsers, toggleBan } from "@/services/UserServices";
import CustomConfirmDialog from "@/components/shared/CustomConfirmDialog";
import { storeItemTypesOptions } from "@/configs/dropdown.config";
import Swal from "sweetalert2";

function User() {
  // theme and navigation hook
  const { textTheme } = useThemeClass();
  const navigate = useNavigate();

  // api hook
  const listUrl = listUsers();
  const deleteUrl = deleteUser();
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
    setData,
  } = useListApi<StoreItem>(listUrl, deleteUrl);

  // table ref
  const tableRef = useRef<DataTableResetHandle>(null);

  // on edit item
  const handleEditClick = useCallback(
    (id: string) => () => {
      console.log(`item selected`, id);
      navigate(`/account/settings/${id}`);
    },
    []
  );
  const handleBan = useCallback(
    (status: boolean, id: string) => async () => {
      console.log(status);
      const abc = await Swal.fire({
        title: "Warning !",
        text: `Do you want to ${status ? "block" : "unblock"} this user`,
        icon: "warning",
        confirmButtonText: "yes",
      });
      console.log(abc.isConfirmed);
      if (abc.isConfirmed) {
        try {
          const banRes = await toggleBan({ userid: id });
          const isStatus = banRes.data.data.status;
          setData((prev) =>
            prev.map((user) =>
              user._id === id ? { ...user, status: isStatus } : user
            )
          );

          return isStatus;
        } catch (error) {}
      }
    },
    []
  );

  // set filter
  console.log(data);

  const onChangeDropDown = (itemSelected: string) => {
    setFilter({ itemType: itemSelected });
  };

  const NameColumn = ({ row }: any) => {
    const { textTheme } = useThemeClass();

    return (
      <div className="flex items-center">
        <Avatar
          size={28}
          shape="circle"
          src={
            row?.profileImage ||
            "https://dominoes-images-preprod.s3.ap-southeast-1.amazonaws.com/prcuxueo0yld8vz0ja1674483047542.jpg"
          }
        />
        <Link
          className={`hover:${textTheme} ml-2 rtl:mr-2 font-semibold`}
          to={`/account/settings/${row._id}`}
        >
          {row.firstName}
        </Link>
      </div>
    );
  };

  // action button cell
  const actionButtons = (props: CellContext<StoreItem, unknown>) => {
    const { _id } = props.row.original;

    let { status } = props.row.original;

    return (
      <div className="flex justify-end text-lg">
        <span
          className={`cursor-pointer p-2 hover:${textTheme}`}
          onClick={handleEditClick(_id)}
        >
          <HiOutlineEye />
        </span>

        <span
          className="cursor-pointer p-2 hover:text-red-500"
          onClick={handleBan(status, _id)}
        >
          {status ? <HiLockOpen /> : <HiLockClosed />}
        </span>
      </div>
    );
  };

  // columns
  const columns: ColumnDef<StoreItem>[] = useMemo(
    () => [
      // {
      //   header: "firstName",
      //   accessorKey: "firstName",
      //   cell: (props) => {
      //     const row = props.row.original;
      //     return <NameColumn row={row} />;
      //   },
      // },
      // {
      //   header: "lastName",
      //   accessorKey: "lastName",
      // },
      {
        header: "User Name",
        accessorKey: "userName",
      },
      {
        header: "Email",
        accessorKey: "email",
      },
      {
        header: "gold",
        accessorKey: "gold",
      },
      {
        header: "chips",
        accessorKey: "chips",
      },
      {
        header: "userType",
        cell: (props) => {
          return (
            <span className="capitalize">{props.row.original?.userType}</span>
          );
        },
      },
      {
        header: "Action",
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
        <HeaderContent
          text={"User"}
          addButtonText=""
          addLink=""
          showSearch={true}
          // dropDownOptions={[]}
          // dropDownSelectedValue={filter?.itemType ?? ""}
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
          // onSort={onSort}
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

export default User;
