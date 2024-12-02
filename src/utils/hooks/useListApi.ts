import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { ApiResponse } from "@/@types/apiResponse";
import { OnSortParam } from "@/components/shared";
import ApiService from "@/services/ApiService";
import _ from "lodash";

import { showNotificationMessage } from "../Helper";

type FilterType = {
  [key: string]: string;
} | null;

function useListApi<T>(listUrl: string, deleteUrl: string, desirePageSize: number) {
  //state
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(desirePageSize || 10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState("");
  const [data, setData] = useState<T[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [sort, setSort] = useState<OnSortParam | null>(null);
  const [query, setQuery] = useState<string>("");
  const [filter, setFilterState] = useState<FilterType>(null);

  const setFilter = (filters: FilterType) => {
    setFilterState(filters);
    setPageIndex(1);
  };
  // fetch api
  const fetchDataApi = async () => {
    // set loading true
    setLoading(true);

    // set query params
    const sortOrder = sort?.order ?? "";
    const sortKey = sort?.key ?? "";
    const sortBy =
      sortOrder != "" && sortKey != "" ? `${sortKey}:${sortOrder}` : "";
    const filterOptions = filter ? { ...filter } : {};
    const params = {
      page: pageIndex,
      search: query,
      limit: pageSize,
      sortBy,
      ...filterOptions,
    };

    try {
      // fetch result
      const result = await ApiService.fetchData<ApiResponse<T[]>>({
        url: listUrl,
        method: "get",
        params,
      });

      // for testing
      await new Promise((resolve) => setTimeout(resolve, 300));

      // set data in state
      setLoading(false);
      setData(result.data.data);
      setPageIndex(result.data.page?.page ?? 1);
      setPageSize(result.data.page?.limit ?? 10);
      setTotal(result.data.page?.totalDocs ?? 0);
    } catch (error) {
      console.log(`error`, error);
      setLoading(false);
    }
  };

  // change events
  const onPaginationChange = (page: number) => {
    setPageIndex(page);
  };

  const onPageSizeChange = (value: number) => {
    setPageIndex(1);
    setPageSize(value);
    setData([]);
  };

  const onSort = (sort: OnSortParam) => {
    setSort(sort);
  };

  function onSearchChange(val: string) {
    setQuery(val);
    setPageIndex(1);
    setTotal(0);
    setData([]);
  }

  const debounceFn = _.debounce(onSearchChange, 500);

  const onEditSearch = (e: ChangeEvent<HTMLInputElement>) => {
    debounceFn(e.target.value);
  };

  const handleDeleteClick = useCallback(
    (id: string) => () => {
      console.log(`item selected`, id);
      setSelectedItem(id);
      setShowDeleteDialog(true);
    },
    []
  );

  const onDeleteDialogClose = () => {
    setShowDeleteDialog(false);
  };

  const onDeleteConfirm = async () => {
    try {
      // hide dialog
      setShowDeleteDialog(false);

      // set loading true
      setLoading(true);

      // delete item api
      const res = await ApiService.fetchData<ApiResponse<T>>({
        url: deleteUrl,
        method: "delete",
        data: { _id: selectedItem },
      });
      console.log(res);

      // show alert
      showNotificationMessage("Successfully", "Item deleted successfully");

      // fetch data again
      fetchDataApi();
    } catch (error) {
      // console error
      console.log(`error`, error);

      // set loading true
      setLoading(false);
    }
  };

  // use effect call
  useEffect(() => {
    fetchDataApi();
  }, [pageIndex, sort, query, pageSize, filter]);

  // return state and functions
  return {
    pageIndex,
    pageSize,
    total,
    data,
    selectedItem,
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
  };
}

export default useListApi;
