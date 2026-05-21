import { ApiResponse } from "@/@types/apiResponse";
import ApiService from "./ApiService";
import axios from "axios";

export function getGameModes() {
  return "/inventoryApp/getMaterial";
}

export function getCustomers() {
  return "/inventoryApp/getCustomer";
}

export function getCategorycustomers() {
  return "/inventoryApp/getCategoryCustomer";
}

export async function getSalesLedgerYearly<T>(params: T) {
  return ApiService.fetchData({
    url: "/inventoryApp/getSalesLedgerYearly",
    method: "get",
    params,
  });
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

export async function getCategoryCustomerById<T>(id: string) {
  return ApiService.fetchData<T>({
    url: `/inventoryApp/getcategoryCustomerbyId/${id}`,
    method: "get",
  });
}

export async function createSalesPayment<T>(data: T) {
  return ApiService.fetchData({
    url: "/inventoryApp/receiveSalesPayment",
    method: "post",
    data,
  });
}

export async function editSalesPayment<T>(id: string, data: T) {
  return ApiService.fetchData({
    url: `/inventoryApp/editSalesPayment/${id}`,
    method: "patch",
    data,
  });
}

export async function deleteSalesPayment<T>(id: string) {
  return ApiService.fetchData<T>({
    url: `/inventoryApp/deleteSalesPayment/${id}`,
    method: "delete",
  });
}

export async function editCategoryCustomer(updatedData: {
  id: string;
  clientName: string;
}) {
  try {
    const response = ApiService.fetchData<any>({
      url: `/inventoryApp/EditCategoryCustomer`,
      method: "patch",
      data: {
        _id: updatedData.id, // ✅ Backend `_id` expect kar raha hai
        clientName: updatedData.clientName,
        type: "specificCustomer", // ✅ Type bhejna zaroori hai agar required ho
      },
    });

    console.log("Edit API Response:", response.data); // ✅ Debugging ke liye

    return response; // ✅ Only data return karein
  } catch (error) {
    console.error("Error in Edit API call:", error);
    throw error;
  }
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

export async function deleteMaterial<T>(id: string) {
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

export async function deleteCategoryCustomer<T>(id: string) {
  return ApiService.fetchData<T>({
    url: `/inventoryApp/deleteCategoryCustomer/${id}`,
    method: "delete",
  });
}

export function deleteGameMode() {
  return "/adminGame/deleteGameMode";
}
export async function editCustomerBilling<T>(data: any) {
  return ApiService.fetchData<T>({
    url: "/inventoryApp/editCustomer",
    method: "patch",
    data: data,
  });
}
