import { ApiResponse } from "@/@types/apiResponse";
import ApiService from "./ApiService";
import { StoreItem } from "@/@types/store";

export function deleteStoreItem() {
  return "/admin/update-remove-store-item";
}

export function listStore() {
  return "/adminStore/get-store-items";
}

export function getAllStoreItem() {
  return "/adminStore/getallstoreitems";
}

export async function getItemById<T>(id: string) {
  return ApiService.fetchData<T>({
    url: `/adminStore/get-store-item/${id}`,
    method: "get",
  });
}

export async function apiAddStoreItem<
  T,
  U extends Record<string, unknown>,
>(data: any) {
  return ApiService.fetchData<T>({
    url: "/adminStore/create-store-item",
    method: "post",
    data,
  });
}

export async function apiUpdateSalesProduct<
  T,
  U extends Record<string, unknown>,
>(data: U) {
  return ApiService.fetchData<T>({
    url: "/adminStore/update-store-item",
    method: "patch",
    data,
  });
}
export async function storeToggleActive(data: any) {
  return ApiService.fetchData<ApiResponse<any>>({
    url: "/admin/isActive",
    method: "patch",
    data,
  });
}
