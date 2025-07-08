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

export async function getCategoryCustomerById(id: string) {
  try {
    const response = await axios.get(`http://localhost:3004/inventoryApp/getcategoryCustomerbyId/${id}`);

    console.log("API Raw Response:", response); // ✅ Debugging ke liye

    return response.data; // ✅ Ensure only data is returned
  } catch (error) {
    console.error("Error in API call:", error);
    throw error;
  }
}

export async function editCategoryCustomer(updatedData: { id: string; clientName: string }) {
  try {
    const response = await axios.patch("http://localhost:3004/inventoryApp/EditCategoryCustomer", {
      _id: updatedData.id, // ✅ Backend `_id` expect kar raha hai
      clientName: updatedData.clientName,
      type: "specificCustomer", // ✅ Type bhejna zaroori hai agar required ho
    });

    console.log("Edit API Response:", response.data); // ✅ Debugging ke liye

    return response.data; // ✅ Only data return karein
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