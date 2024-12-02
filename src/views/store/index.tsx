// import {
//   AdaptableCard,
//   CellContext,
//   ColumnDef,
//   DataTable,
//   DataTableResetHandle,
// } from "@/components/shared";
// import useThemeClass from "@/utils/hooks/useThemeClass";
// import { useNavigate } from "react-router-dom";
// import {
//   HiEye,
//   HiLockClosed,
//   HiLockOpen,
//   HiOutlinePencil,
//   HiOutlineTrash,
// } from "react-icons/hi";
// import { useCallback, useMemo, useRef, useState } from "react";
// import { StoreItem } from "@/@types/store";
// import useListApi from "@/utils/hooks/useListApi";
// import HeaderContent from "@/components/shared/HeaderContent";
// import {
//   deleteStoreItem,
//   listStore,
//   storeToggleActive,
// } from "@/services/StoreServices";
// import CustomConfirmDialog from "@/components/shared/CustomConfirmDialog";
// import { storeItemTypesOptions } from "@/configs/dropdown.config";
// import { Avatar, Dialog } from "@/components/ui";
// import Swal from "sweetalert2";
// import { handleHttpReq } from "@/utils/HandleHttp";

// function Store() {
//   // theme and navigation hook
//   const { textTheme } = useThemeClass();
//   const navigate = useNavigate();

//   // api hook
//   const listUrl = listStore();
//   console.log("LIST URL", listUrl);
//   const deleteUrl = deleteStoreItem();
//   const {
//     pageIndex,
//     pageSize,
//     total,
//     data,
//     showDeleteDialog,
//     loading,
//     onPaginationChange,
//     onPageSizeChange,
//     onSort,
//     onEditSearch,
//     onDeleteDialogClose,
//     onDeleteConfirm,
//     handleDeleteClick,
//     filter,
//     setData,
//     setFilter,
//   } = useListApi<StoreItem>(listUrl, deleteUrl);
//   console.log("DATA", data);
//   // table ref
//   const tableRef = useRef<DataTableResetHandle>(null);
//   const [viewOpen, setViewOpen] = useState(false);
//   const [selectedImg, setSelectedImg] = useState<string>({} as string);

//   const onViewOpen = (img: string) => {
//     setSelectedImg(img);
//     setViewOpen(true);
//   };
//   const onDialogClose = () => {
//     setViewOpen(false);
//     setTimeout(() => {
//       setSelectedImg({} as string);
//     }, 300);
//   };
//   // on edit item
//   const handleEditClick = useCallback(
//     (id: string) => () => {
//       console.log(`item selected`, id);
//       navigate(`/product-edit/${id}`);
//     },
//     []
//   );

//   const handleBan = useCallback(
//     (id: string, isActive: boolean) => async () => {
//       console.log(id);

//       const abc = await Swal.fire({
//         title: "Warning !",
//         text: `Do you want to ${isActive ? "block" : "unblock"} this item`,
//         icon: "warning",
//         confirmButtonText: "yes",
//       });
//       if (abc.isConfirmed) {
//         handleHttpReq(async () => {
//           const toggleResponse = await storeToggleActive({ id });
//           console.log(toggleResponse);
//           const active = toggleResponse.data.data.isActive;
//           console.log(active);

//           setData((prev) =>
//             prev.map((item) =>
//               item._id === id ? { ...item, isActive: active } : item
//             )
//           );
//           return active;
//         });
//       }
//     },
//     []
//   );

//   // set filter
//   const onChangeDropDown = (itemSelected: string) => {
//     setFilter({ itemType: itemSelected });
//   };

//   // action button cell
//   const actionButtons = (props: CellContext<StoreItem, unknown>) => {
//     const { _id } = props.row.original;
//     const { isActive } = props.row.original;

//     return (
//       <div className="flex justify-end text-lg">
//         {/* <span
//           className={`cursor-pointer p-2 hover:${textTheme}`}
//           onClick={() => {
//             onViewOpen(image);
//           }}
//         >
//           <HiEye />
//         </span> */}
//         <span
//           className={`cursor-pointer p-2 hover:${textTheme}`}
//           onClick={handleEditClick(_id)}
//         >
//           <HiOutlinePencil />
//         </span>
//         {/* <span
//           className="cursor-pointer p-2 hover:text-red-500"
//           onClick={handleDeleteClick(_id)}
//         >
//           <HiOutlineTrash />
//         </span> */}
//         <span
//           className="cursor-pointer p-2 hover:text-red-500"
//           onClick={handleBan(_id, isActive)}
//         >
//           {isActive ? <HiLockOpen /> : <HiLockClosed />}
//         </span>
//       </div>
//     );
//   };

//   // columns
//   const columns: ColumnDef<StoreItem>[] = useMemo(
//     () => [
//       {
//         header: "Item Type",
//         accessorKey: "itemType",
//       },
//       {
//         header: "Short Code",
//         accessorKey: "shortCode",
//       },
//       {
//         header: "gold",
//         accessorKey: "gold",
//       },
//       {
//         header: "chips",
//         accessorKey: "chips",
//       },
//       {
//         header: "amount",
//         accessorKey: "amount",
//       },
//       {
//         header: "Image",
//         accessorKey: "itemIcon",
//         cell: (props) => {
//           const row = props.row.original;
//           const { itemIcon } = props.row.original;

//           return (
//             <Avatar
//               className="cursor-pointer"
//               src={row?.itemIcon}
//               onClick={() => {
//                 onViewOpen(itemIcon);
//               }}
//             />
//           );
//         },
//       },
//       {
//         header: "",
//         id: "action",
//         cell: actionButtons,
//       },
//     ],
//     []
//   );

//   // main view
//   return (
//     <>
//       <AdaptableCard className="h-full" bodyClass="h-full">
//         <Dialog
//           isOpen={viewOpen}
//           onClose={onDialogClose}
//           onRequestClose={onDialogClose}
//         >
//           <img
//             className="h-96 w-96 block mx-auto"
//             src={selectedImg}
//             alt={"abc"}
//           />
//         </Dialog>
//         <HeaderContent
//           text="Store"
//           addButtonText="Add Store Item"
//           addLink="/store/add-product"
//           showSearch={true}
//           dropDownOptions={storeItemTypesOptions}
//           dropDownSelectedValue={filter?.itemType ?? ""}
//           onChangeDropDown={onChangeDropDown}
//           onEditSearch={onEditSearch}
//         />
//         <DataTable
//           ref={tableRef}
//           columns={columns}
//           data={data}
//           loading={loading}
//           pagingData={{
//             total: total,
//             pageIndex: pageIndex,
//             pageSize: pageSize,
//           }}
//           onPaginationChange={onPaginationChange}
//           onSelectChange={onPageSizeChange}
//           onSort={onSort}
//         />
//       </AdaptableCard>
//       <CustomConfirmDialog
//         title="Store Item"
//         isOpen={showDeleteDialog}
//         onDialogClose={onDeleteDialogClose}
//         onDeleteConfirm={onDeleteConfirm}
//       />
//     </>
//   );
// }

// export default Store;
