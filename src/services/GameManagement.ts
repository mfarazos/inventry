import { ApiResponse } from "@/@types/apiResponse";
import ApiService from "./ApiService";
export function getGameModes() {
  return "/inventoryApp/getMaterial";
}

export function getCustomers() {
  return "/inventoryApp/getCustomer";
}


export function getCategorycustomers() {
  return "/inventoryApp/getCategoryCustomer";
}

export function getwalkingCustomers() {
  return "/inventoryApp/getwalkingcustomer";
}

export function getCustomerdetails() {
  return "/inventoryApp/getCustomerdetails";
}

export async function createCompanyCustomer<T>(data: any) {
  return ApiService.fetchData<T>({
    url: `/inventoryApp/CreateCategoryCustomer`,
    method: "post",
    data,
  });
}

export async function geteditGameMode<T>(id: string) {
  return ApiService.fetchData<T>({
    url: `/inventoryApp/getMaterial/${id}`,
    method: "get",
  });
}

export async function getCustomerById<T>(id: string) {
  return ApiService.fetchData<T>({
    url: `/inventoryApp/getCustomerbyId/${id}`,
    method: "get",
  });
}

export async function upadateByStatusMaterial<T>(id: string) {
  return ApiService.fetchData<T>({
    url: `/inventoryApp/updateMaterialStatusById/${id}`,
    method: "get",
  });
}

export async function upadateByStatusCustomer<T>(id: string) {
  return ApiService.fetchData<T>({
    url: `/inventoryApp/updateCustomerStatusById/${id}`,
    method: "get",
  });
}

export async function editGameMode<T>(id: string) {
  return ApiService.fetchData<T>({
    url: `/adminGame/editGameMode/${id}`,
    method: "patch",
  });
}

export async function createGameMode<T>(data: any) {
  return ApiService.fetchData<T>({
    url: `/inventoryApp/Creatematerial`,
    method: "post",
    data,
  });
}

export async function createCustomer<T>(data: any) {
  return ApiService.fetchData<T>({
    url: `/inventoryApp/createCustomer`,
    method: "post",
    data,
  });
}

export async function delGameMode<T>(id: string) {
  return ApiService.fetchData<T>({
    url: `/inventoryApp/deleteMaterial/${id}`,
    method: "delete",
  });
}

export async function deleteCustomers<T>(id: string) {
  return ApiService.fetchData<T>({
    url: `/inventoryApp/deleteCustomer/${id}`,
    method: "delete",
  });
}

export function deleteGameMode() {
  return "/adminGame/deleteGameMode";
}
